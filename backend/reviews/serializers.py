from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    client_first_name = serializers.CharField(source='client.first_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'booking', 'client', 'expert', 'client_first_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'client', 'expert', 'created_at']
