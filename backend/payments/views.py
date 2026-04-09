from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal

from .models import Payment
from bookings.models import Booking

class WalletRechargeView(APIView):
    """Recharger son portefeuille (Simulation de paiement CB)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        try:
            amount = Decimal(amount)
            if amount <= 0:
                raise ValueError
        except:
            return Response({'error': 'Montant invalide.'}, status=400)

        # Ajouter l'argent au compte de l'utilisateur
        request.user.argent += amount
        request.user.save()

        # Enregistrer la transaction de recharge
        Payment.objects.create(
            payer=request.user,
            amount=amount,
            transaction_type='recharge',
            payment_status='completed'
        )

        return Response({
            'detail': f'Compte rechargé de {amount} DT avec succès.',
            'nouveau_solde': request.user.argent
        }, status=status.HTTP_200_OK)


class PayFixedServiceView(APIView):
    """Payer (Transferer) le montant fixé d'un service (non-vidéo)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        
        try:
            booking = Booking.objects.get(id=booking_id, client__user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Réservation introuvable ou non autorisée.'}, status=404)

        if booking.status == 'completed':
            return Response({'error': 'Cette réservation est déjà payée/terminée.'}, status=400)
            
        if booking.service.service_type != 'fixed':
            return Response({'error': 'Cette route est réservée aux services à prix fixe.'}, status=400)

        price = booking.total_price

        if request.user.argent < price:
            return Response({'error': 'Solde insuffisant pour payer ce service.'}, status=400)

        # Calcul : Commission 15% pour la plateforme, 85% pour l'expert
        platform_fee = price * Decimal('0.15')
        expert_earnings = price - platform_fee

        # Débite le client
        request.user.argent -= price
        request.user.save()

        # Crédite l'expert
        expert_user = booking.expert.user
        expert_user.argent += expert_earnings
        expert_user.save()

        # Trace informatique du paiement
        Payment.objects.create(
            booking=booking,
            payer=request.user,
            payee=expert_user,
            amount=price,
            platform_fee=platform_fee,
            transaction_type='fixed_service_payment'
        )

        # Clôture la réservation
        booking.status = 'completed'
        booking.save()

        return Response({
            'detail': 'Paiement effectué avec succès et transféré à l\'expert (moins 15% de commission).',
            'montant_debite': price,
            'nouveau_solde': request.user.argent
        }, status=status.HTTP_200_OK)
