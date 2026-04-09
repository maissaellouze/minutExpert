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
    """Démarre la session vidéo et génère le lien Jitsi"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': 'Réservation introuvable.'}, status=404)

        # Seul le réseau client/expert concerné peut démarrer
        if request.user != booking.client.user and request.user != booking.expert.user:
            return Response({'error': 'Accès refusé.'}, status=403)

        if str(booking.service.service_type) != 'video':
            return Response({'error': 'Ce service nest pas une consultation vidéo.'}, status=400)

        # Vérification du solde du client avant de démarrer
        if booking.client.user.argent <= 0:
            return Response({'error': 'Solde insuffisant. Impossible de démarrer l\'appel, veuillez recharger votre compte.'}, status=400)

        # Création ou récupération de la session
        session, created = VideoSession.objects.get_or_create(booking=booking)
        
        session.is_active = True
        if not session.start_time:
            session.start_time = timezone.now()
        session.save()

        # Marquer la réservation "En cours"
        booking.status = 'in_progress'
        booking.save()

        return Response({
            'detail': 'Session démarrée.',
            'meeting_link': session.meeting_link,
            'start_time': session.start_time
        }, status=200)


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

        total_price = booking.service.base_price * duration_min

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
            'total_price': total_price,
            'nouveau_solde_client': client_user.argent
        }, status=200)
