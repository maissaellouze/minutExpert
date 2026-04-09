from django.urls import path
from .views import WalletRechargeView, PayFixedServiceView

urlpatterns = [
    path('recharge/', WalletRechargeView.as_view(), name='wallet-recharge'),
    path('pay-fixed/', PayFixedServiceView.as_view(), name='pay-fixed-service'),
]
