from django.db import models
from django.conf import settings

class Service(models.Model):
    SERVICE_TYPE_CHOICES = (
        ('video', 'Visio (à la minute)'),
        ('fixed', 'Service Fixe'),
    )
    # Utilisation d'une chaîne pour éviter l'ImportError
    expert = models.ForeignKey('experts.ExpertProfile', on_delete=models.CASCADE)
    category = models.ForeignKey('experts.Category', on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES, default='video')
    base_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Prix à la minute (video) ou prix total (fixed)")
    duration_min = models.PositiveSmallIntegerField(default=60, help_text="Durée estimée")

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('waiting_expert', 'Attente expert'),
        ('accepted', 'Acceptée'),
        ('in_progress', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    )
    booking_ref = models.CharField(max_length=20, unique=True)
    client = models.ForeignKey('accounts.ClientProfile', on_delete=models.CASCADE)
    expert = models.ForeignKey('experts.ExpertProfile', on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, null=True, blank=True)
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actual_duration = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Durée réelle en minutes")
    duration_requested = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Durée max demandée en minutes")
    slot_label = models.CharField(max_length=100, blank=True, default='')
    rejection_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.booking_ref} - {self.client} -> {self.expert}"