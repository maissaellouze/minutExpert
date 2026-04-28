from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from django.utils import timezone
from math import ceil

from .models import VideoSession
from bookings.models import Booking
from payments.models import Payment


class SessionStartView(APIView):
    """Client demande le démarrage de la session → met le booking en 'waiting_expert'"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': 'Réservation introuvable.'}, status=404)

        # Seul le client concerné peut démarrer
        if not hasattr(request.user, 'client_profile') or booking.client != request.user.client_profile:
            return Response({'error': 'Accès refusé.'}, status=403)

        # Créer la VideoSession si elle n'existe pas
        session, created = VideoSession.objects.get_or_create(booking=booking)

        # Mettre en attente de l'expert
        booking.status = 'waiting_expert'
        booking.save()

        return Response({
            'detail': 'Demande envoyée à l\'expert.',
            'status': 'waiting_expert',
            'booking_id': booking.id,
        }, status=200)


class SessionAcceptView(APIView):
    """L'expert accepte la demande de session → démarre le chrono"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': 'Réservation introuvable.'}, status=404)

        # Seul l'expert concerné peut accepter
        if not hasattr(request.user, 'expert_profile') or booking.expert != request.user.expert_profile:
            return Response({'error': 'Accès refusé.'}, status=403)

        if booking.status != 'waiting_expert':
            return Response({'error': 'Cette session n\'est pas en attente d\'acceptation.'}, status=400)

        # Récupérer ou créer la VideoSession
        session, created = VideoSession.objects.get_or_create(booking=booking)
        session.is_active = True
        session.start_time = timezone.now()
        session.save()

        # Mettre le booking en cours
        booking.status = 'in_progress'
        booking.save()

        return Response({
            'detail': 'Session acceptée et démarrée.',
            'meeting_link': session.meeting_link,
            'start_time': session.start_time.isoformat(),
            'booking_id': booking.id,
        }, status=200)


class SessionStatusView(APIView):
    """Vérifie le statut d'une session (polling par le client)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        booking_id = request.query_params.get('booking_id')
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': 'Réservation introuvable.'}, status=404)

        data = {
            'booking_id': booking.id,
            'status': booking.status,
            'rejection_reason': booking.rejection_reason,
        }

        # Si la session est active, inclure le lien Jitsi
        try:
            session = booking.video_session
            data['meeting_link'] = session.meeting_link
            data['start_time'] = session.start_time.isoformat() if session.start_time else None
            data['is_active'] = session.is_active
        except VideoSession.DoesNotExist:
            data['meeting_link'] = None
            data['start_time'] = None
            data['is_active'] = False

        return Response(data)


class SessionPendingView(APIView):
    """Liste les sessions en attente d'acceptation pour l'expert connecté (polling)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'expert_profile'):
            return Response({'error': 'Accès refusé.'}, status=403)

        pending = Booking.objects.filter(
            expert=request.user.expert_profile,
            status='waiting_expert'
        ).select_related('client').order_by('-scheduled_at')

        data = []
        for b in pending:
            data.append({
                'id': b.id,
                'booking_ref': b.booking_ref,
                'client_name': f"{b.client.first_name} {b.client.last_name}",
                'slot_label': b.slot_label,
                'duration_requested': b.duration_requested,
                'total_price': str(b.total_price) if b.total_price else '0.00',
                'scheduled_at': b.scheduled_at.isoformat(),
            })
        return Response(data)


class SessionEndView(APIView):
    """Clôture la session vidéo, calcule le temps et prélève le portefeuille"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        try:
            session = VideoSession.objects.get(booking_id=booking_id, is_active=True)
        except VideoSession.DoesNotExist:
            return Response({'error': 'Session active introuvable.'}, status=404)

        booking = session.booking

        session.end_time = timezone.now()
        session.is_active = False
        session.save()

        # Calcul exact de la durée en minutes (arrondi au supérieur)
        duration_delta = session.end_time - session.start_time
        duration_min = ceil(duration_delta.total_seconds() / 60.0)

        # Si l'appel a duré moins d'une minute, on compte 1 min.
        if duration_min < 1:
            duration_min = 1

        # Calculer le prix: utiliser service.base_price si disponible, sinon hourly_rate de l'expert
        if booking.service and hasattr(booking.service, 'base_price'):
            rate_per_min = booking.service.base_price
        else:
            rate_per_min = booking.expert.hourly_rate if booking.expert.hourly_rate else Decimal('0.85')

        total_price = rate_per_min * duration_min

        # Logique des Commissions (15% plateforme / 85% expert)
        platform_fee = total_price * Decimal('0.15')
        expert_earnings = total_price - platform_fee

        # Prélèvement client
        client_user = booking.client.user
        client_user.argent -= total_price
        client_user.save()

        # Crédit Expert
        expert_user = booking.expert.user
        expert_user.argent += expert_earnings
        expert_user.save()

        # Trace bancaire (Payment)
        Payment.objects.create(
            booking=booking,
            payer=client_user,
            payee=expert_user,
            amount=total_price,
            platform_fee=platform_fee,
            transaction_type='video_session_payment'
        )

        # Clôture du Booking
        booking.actual_duration = duration_min
        booking.total_price = total_price
        booking.status = 'completed'
        booking.save()

        return Response({
            'detail': 'Session terminée. Paiement traité.',
            'duration_min': duration_min,
            'total_price': str(total_price),
            'platform_fee': str(platform_fee),
            'expert_earnings': str(expert_earnings),
            'nouveau_solde_client': str(client_user.argent),
        }, status=200)


class SessionRejectView(APIView):
    """L'expert refuse la demande de session"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        reason = request.data.get('reason', 'Pas de raison spécifiée.')
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': 'Réservation introuvable.'}, status=404)

        # Seul l'expert concerné peut refuser
        if not hasattr(request.user, 'expert_profile') or booking.expert != request.user.expert_profile:
            return Response({'error': 'Accès refusé.'}, status=403)

        if booking.status != 'waiting_expert':
            return Response({'error': 'Cette session n\'est pas en attente.'}, status=400)

        # Mettre le booking en annulé
        booking.status = 'cancelled'
        booking.rejection_reason = reason
        booking.save()

        return Response({
            'detail': 'Session refusée.',
            'booking_id': booking.id,
            'reason': reason
        }, status=200)
