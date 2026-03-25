from django.db import models

import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [('client', 'Client'), ('expert', 'Expert'), ('admin', 'Admin')]
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive'), ('banned', 'Banned'), ('pending', 'Pending')]
    
    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    avatar_url = models.URLField(max_length=500, null=True, blank=True)
    preferred_language = models.CharField(max_length=10, default='fr')
    timezone = models.CharField(max_length=60, default='Africa/Tunis')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=20, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    address = models.CharField(max_length=300, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    loyalty_points = models.PositiveIntegerField(default=0)

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default='TND')