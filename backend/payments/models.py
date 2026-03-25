from django.db import models
from bookings.models import Booking

class Payment(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    payer = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, default='pending')
    gateway_ref = models.CharField(max_length=200, null=True)