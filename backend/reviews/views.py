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
        print(f"Review creation request data: {request.data}")
        if not hasattr(request.user, 'client_profile'):
            print(f"User {request.user.email} (role: {request.user.role}) is not a client.")
            return Response({'error': f'Seuls les clients peuvent laisser un avis. Votre compte ({request.user.email}) est identifié comme {request.user.role}.'}, status=403)
            
        booking_id = request.data.get('booking')
        if not booking_id:
            print("Missing booking_id.")
            return Response({'error': 'Le champ booking est requis.'}, status=400)
            
        booking = get_object_or_404(Booking, id=booking_id)
        print(f"Booking found: {booking}")
        
        # Vérifications de sécurité
        if booking.client != request.user.client_profile:
            print(f"Booking client mismatch. User: {request.user.client_profile.id}, Booking client: {booking.client.id}")
            return Response({'error': 'Cette réservation ne vous appartient pas.'}, status=403)
            
        # (Futur) On pourrait décommenter ça quand on gère bien les statuts
        # if booking.status != 'completed':
        #     return Response({'error': 'Vous ne pouvez noter qu\'une séance terminée.'}, status=400)
            
        # Créer l'avis
        s = ReviewSerializer(data=request.data)
        if s.is_valid():
            try:
                s.save(
                    client=request.user.client_profile,
                    expert=booking.expert
                )
                print("Review saved successfully.")
                return Response(s.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"Error saving review: {str(e)}")
                return Response({'error': str(e)}, status=500)
        
        print(f"Review validation failed: {s.errors}")
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpertReviewListView(APIView):
    """Lister tous les avis d'un expert spécifique pour affichage public"""
    permission_classes = [AllowAny]

    def get(self, request, expert_id):
        qs = Review.objects.filter(expert_id=expert_id).order_by('-created_at')
        s = ReviewSerializer(qs, many=True)
        return Response(s.data)
