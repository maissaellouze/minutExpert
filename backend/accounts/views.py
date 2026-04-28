from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ClientSignupSerializer, LoginSerializer

class ClientSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        s = ClientSignupSerializer(data=request.data)
        if s.is_valid():
            user = s.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
                'role':    user.role,
                'email':   user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }, status=status.HTTP_201_CREATED)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        s = LoginSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=s.validated_data['email'],   # USERNAME_FIELD = email
            password=s.validated_data['password']
        )
        if not user:
            return Response({'detail': 'Identifiants incorrects.'}, status=400)
        if user.status == 'banned':
            return Response({'detail': 'Compte suspendu.'}, status=403)
        
        refresh = RefreshToken.for_user(user)
        
        # Force 'admin' role if superuser
        role = user.role
        if user.is_superuser:
            role = 'admin'
            
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'role':    role,
            'email':   user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })

from rest_framework.permissions import IsAuthenticated
from .serializers import ClientProfileSerializer
from .models import ClientProfile

class ClientMeView(APIView):
    """Récupère ou met à jour le profil du client connecté"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'client':
            return Response({'detail': 'Accès refusé.'}, status=403)
            
        try:
            profile = request.user.client_profile
        except ClientProfile.DoesNotExist:
            return Response({'detail': 'Profil introuvable.'}, status=404)
            
        s = ClientProfileSerializer(profile)
        return Response(s.data)
        
    def patch(self, request):
        if request.user.role != 'client':
            return Response({'detail': 'Accès refusé.'}, status=403)
            
        try:
            profile = request.user.client_profile
        except ClientProfile.DoesNotExist:
            return Response({'detail': 'Profil introuvable.'}, status=404)
            
        # Update first_name and last_name on User model if provided
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        user_changed = False
        if first_name is not None:
            request.user.first_name = first_name
            user_changed = True
        if last_name is not None:
            request.user.last_name = last_name
            user_changed = True
        if user_changed:
            request.user.save()

        s = ClientProfileSerializer(profile, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

class ClientMySessionsView(APIView):
    """Liste des sessions du client connecté"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'client':
            return Response({'detail': 'Accès refusé.'}, status=403)
            
        try:
            profile = request.user.client_profile
        except ClientProfile.DoesNotExist:
            return Response({'detail': 'Profil introuvable.'}, status=404)
            
        from bookings.models import Booking
        from bookings.serializers import BookingDetailSerializer
        bookings = Booking.objects.filter(client=profile).select_related('expert__user', 'client').order_by('-scheduled_at')
        s = BookingDetailSerializer(bookings, many=True)
        return Response(s.data)

class AdminClientListView(APIView):
    """Liste de tous les clients pour l'administrateur"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'admin' and not request.user.is_superuser:
            return Response({'detail': 'Accès refusé.'}, status=403)
            
        clients = ClientProfile.objects.all().select_related('user')
        data = []
        for c in clients:
            data.append({
                'id': c.id,
                'first_name': c.first_name,
                'last_name': c.last_name,
                'email': c.user.email,
                'date_joined': c.user.date_joined,
                'status': c.user.status,
            })
        return Response(data)