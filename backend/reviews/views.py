from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from .models import Review
from .serializers import ReviewSerializer
from bookings.models import Booking
from experts.models import ExpertProfile

class ReviewCreateView(APIView):
    """Créer un avis sur un expert après une réservation terminée"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'client_profile'):
            return Response({'error': 'Seuls les clients peuvent laisser un avis.'}, status=403)
            
        booking_id = request.data.get('booking')
        if not booking_id:
            return Response({'error': 'Le champ booking est requis.'}, status=400)
            
        booking = get_object_or_404(Booking, id=booking_id)
        
        # Vérifications de sécurité
        if booking.client != request.user.client_profile:
            return Response({'error': 'Cette réservation ne vous appartient pas.'}, status=403)
            
        # (Futur) On pourrait décommenter ça quand on gère bien les statuts
        # if booking.status != 'completed':
        #     return Response({'error': 'Vous ne pouvez noter qu\'une séance terminée.'}, status=400)
            
        # Créer l'avis
        s = ReviewSerializer(data=request.data)
        if s.is_valid():
            s.save(
                client=request.user.client_profile,
                expert=booking.expert
            )
            return Response(s.data, status=status.HTTP_201_CREATED)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpertReviewListView(APIView):
    """Lister tous les avis d'un expert spécifique pour affichage public"""
    permission_classes = [AllowAny]

    def get(self, request, expert_id):
        qs = Review.objects.filter(expert_id=expert_id).order_by('-created_at')
        s = ReviewSerializer(qs, many=True)
        return Response(s.data)
