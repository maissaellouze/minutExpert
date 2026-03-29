from django.db import models
from django.conf import settings

class Service(models.Model):
    # Utilisation d'une chaîne pour éviter l'ImportError
    expert = models.ForeignKey('experts.ExpertProfile', on_delete=models.CASCADE)
    category = models.ForeignKey('experts.Category', on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_min = models.PositiveSmallIntegerField(default=60)

class Booking(models.Model):
    booking_ref = models.CharField(max_length=20, unique=True)
    client = models.ForeignKey('accounts.ClientProfile', on_delete=models.CASCADE)
    expert = models.ForeignKey('experts.ExpertProfile', on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=20, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)