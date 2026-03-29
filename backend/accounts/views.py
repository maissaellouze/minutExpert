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
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'role':    user.role,
        })