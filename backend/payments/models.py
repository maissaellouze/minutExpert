from django.db import models
from bookings.models import Booking

class Payment(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, null=True, blank=True)
    payer = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='payments_made')
    payee = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='payments_received', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Commission de 15% prelevee par la plateforme")
    payment_status = models.CharField(max_length=20, default='completed')
    transaction_type = models.CharField(max_length=50, default='session_payment') # ex: 'recharge', 'session_payment'
    created_at = models.DateTimeField(auto_now_add=True)