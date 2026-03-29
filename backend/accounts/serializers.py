from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ClientProfile

User = get_user_model()

class ClientSignupSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name  = serializers.CharField(write_only=True)
    password   = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = User
        fields = ['email', 'username', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        first = validated_data.pop('first_name')
        last  = validated_data.pop('last_name')
        user  = User.objects.create_user(
            role='client', status='active', **validated_data
        )
        ClientProfile.objects.create(user=user, first_name=first, last_name=last)
        return user
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value
    
    
class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField()