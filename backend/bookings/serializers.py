from rest_framework import serializers
from .models import Service, Booking
from experts.serializers import CategorySerializer, ExpertProfileSerializer
from accounts.models import ClientProfile

class ServiceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'expert', 'category', 'title', 'service_type', 'base_price', 'duration_min']


class BookingSerializer(serializers.ModelSerializer):
    service_details = ServiceSerializer(source='service', read_only=True)
    expert_details = ExpertProfileSerializer(source='expert', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'booking_ref', 
            'client', 
            'expert', 
            'expert_details',
            'service', 
            'service_details',
            'scheduled_at', 
            'status', 
            'total_price', 
            'actual_duration'
        ]
        read_only_fields = ['booking_ref', 'client', 'status', 'total_price', 'actual_duration']
