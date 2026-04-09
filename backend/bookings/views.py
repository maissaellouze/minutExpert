import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Service, Booking
from .serializers import ServiceSerializer, BookingSerializer

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

class BookingListView(APIView):
    """Liste les réservations de l'utilisateur connecté"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'client_profile'):
            qs = Booking.objects.filter(client=request.user.client_profile).order_by('-scheduled_at')
        elif hasattr(request.user, 'expert_profile'):
            qs = Booking.objects.filter(expert=request.user.expert_profile).order_by('-scheduled_at')
        else:
            return Response([])
            
        s = BookingSerializer(qs, many=True)
        return Response(s.data)
