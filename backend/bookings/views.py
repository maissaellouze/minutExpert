import uuid
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Service, Booking
from .serializers import ServiceSerializer, BookingSerializer, BookingDetailSerializer
from experts.models import ExpertProfile

class ServiceListView(APIView):
    """Liste les services d'un expert spécifique"""
    def get(self, request):
        expert_id = request.query_params.get('expert_id')
        if not expert_id:
            return Response({'error': 'expert_id is required'}, status=400)
            
        qs = Service.objects.filter(expert_id=expert_id)
        s = ServiceSerializer(qs, many=True)
        return Response(s.data)

class BookingCreateView(APIView):
    """Créer une nouvelle réservation"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'client_profile'):
            return Response({'error': 'Seuls les clients peuvent réserver.'}, status=403)
            
        s = BookingSerializer(data=request.data)
        if s.is_valid():
            service = s.validated_data['service']
            
            initial_price = service.base_price * service.duration_min if service.service_type == 'video' else service.base_price

            if request.user.argent < initial_price:
                return Response({'error': f'Solde insuffisant. Vous avez {request.user.argent} DT, mais le prix estimé/fixe est de {initial_price} DT. Veuillez recharger votre compte pour procéder.'}, status=400)

            booking_ref = f"BKG-{str(uuid.uuid4())[:8].upper()}"

            s.save(
                client=request.user.client_profile,
                booking_ref=booking_ref,
                status='pending',
                total_price=initial_price
            )
            return Response(s.data, status=status.HTTP_201_CREATED)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


class DirectBookingView(APIView):
    """Réservation directe d'un expert (sans passer par un Service).
    POST body: { expert_id, slot_label, duration, scheduled_at? }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'client_profile'):
            return Response({'error': 'Seuls les clients peuvent réserver.'}, status=403)

        expert_id = request.data.get('expert_id')
        slot_label = request.data.get('slot_label', '')
        duration = request.data.get('duration', 10)
        scheduled_at_str = request.data.get('scheduled_at')

        if not expert_id:
            return Response({'error': 'expert_id est requis.'}, status=400)

        try:
            expert_profile = ExpertProfile.objects.get(id=expert_id)
        except ExpertProfile.DoesNotExist:
            return Response({'error': 'Expert introuvable.'}, status=404)

        rate = float(expert_profile.hourly_rate) if expert_profile.hourly_rate else 0.85
        estimated_price = round(rate * int(duration) * 1.15, 2)

        # Parse scheduled_at or default to now
        if scheduled_at_str:
            from django.utils.dateparse import parse_datetime
            scheduled_at = parse_datetime(scheduled_at_str) or timezone.now()
        else:
            scheduled_at = timezone.now()

        booking_ref = f"BKG-{str(uuid.uuid4())[:8].upper()}"

        booking = Booking.objects.create(
            booking_ref=booking_ref,
            client=request.user.client_profile,
            expert=expert_profile,
            service=None,
            scheduled_at=scheduled_at,
            status='pending',
            total_price=estimated_price,
            duration_requested=int(duration),
            slot_label=slot_label,
        )

        return Response({
            'id': booking.id,
            'booking_ref': booking.booking_ref,
            'expert_id': booking.expert_id,
            'expert_name': f"{expert_profile.user.first_name} {expert_profile.user.last_name}",
            'slot_label': booking.slot_label,
            'duration_requested': booking.duration_requested,
            'total_price': str(booking.total_price),
            'status': booking.status,
            'scheduled_at': booking.scheduled_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


class BookingListView(APIView):
    """Liste les réservations de l'utilisateur connecté"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'client_profile'):
            qs = Booking.objects.filter(client=request.user.client_profile).select_related('expert__user').order_by('-scheduled_at')
        elif hasattr(request.user, 'expert_profile'):
            qs = Booking.objects.filter(expert=request.user.expert_profile).select_related('client__user').order_by('-scheduled_at')
        else:
            return Response([])
            
        s = BookingDetailSerializer(qs, many=True)
        return Response(s.data)
