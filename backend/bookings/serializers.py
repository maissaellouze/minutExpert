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
            'actual_duration',
            'rejection_reason'
        ]
        read_only_fields = ['booking_ref', 'client', 'status', 'total_price', 'actual_duration']


class BookingDetailSerializer(serializers.ModelSerializer):
    """Serializer enrichi pour l'affichage des bookings (client et expert)"""
    expert_name = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    expert_title = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_comment = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_ref',
            'expert', 'expert_name', 'expert_title',
            'client', 'client_name',
            'scheduled_at',
            'status',
            'total_price',
            'actual_duration',
            'duration_requested',
            'slot_label',
            'rejection_reason',
            'rating',
            'review_comment',
        ]

    def get_rating(self, obj):
        if hasattr(obj, 'review'):
            return obj.review.rating
        return None

    def get_review_comment(self, obj):
        if hasattr(obj, 'review'):
            return obj.review.comment
        return None

    def get_expert_name(self, obj):
        if obj.expert and obj.expert.user:
            return f"{obj.expert.user.first_name} {obj.expert.user.last_name}"
        return "Expert"

    def get_client_name(self, obj):
        if obj.client:
            return f"{obj.client.first_name} {obj.client.last_name}"
        return "Client"

    def get_expert_title(self, obj):
        if obj.expert:
            return obj.expert.title or "Expert MinuteExpert"
        return "Expert"
