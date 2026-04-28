from rest_framework import serializers
from .models import ExpertRequest, Category, ExpertProfile

class ExpertRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ExpertRequest
        fields = '__all__'
        read_only_fields = ['status', 'user', 'diploma_file', 'diploma_filename', 'diploma_mimetype']

    def create(self, validated_data):
        # On récupère le fichier depuis la requête via le contexte
        request = self.context.get('request')
        if request and request.FILES:
            file_obj = request.FILES.get('diploma_file')
            if file_obj:
                validated_data['diploma_file'] = file_obj.read()
                validated_data['diploma_filename'] = file_obj.name
                validated_data['diploma_mimetype'] = file_obj.content_type
        
        return super().create(validated_data)

class ExpertRequestAdminSerializer(serializers.ModelSerializer):
    # 'category_name' récupère le champ 'name' du modèle Category
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    # 'user_email' utilise directement le champ 'email' du modèle ExpertRequest
    user_email = serializers.EmailField(source='email', read_only=True)

    class Meta:
        model  = ExpertRequest
        # On utilise les noms exacts de ton models.py
        # Note : On ne peut pas mettre 'cv_url' ici car il n'existe pas dans le modèle,
        # On utilise 'diploma_filename' pour afficher au moins le nom du fichier dans le tableau.
        fields = [
            'id', 
            'first_name', 
            'last_name', 
            'category_name',
            'user_email', 
            'status',
            'diploma_filename' 
        ]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_active']

class ExpertProfileSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ExpertProfile
        fields = [
            'id', 
            'first_name', 
            'last_name', 
            'email',
            'categories', 
            'title',
            'bio',
            'hourly_rate', 
            'avg_rating', 
            'review_count',
            'is_verified'
        ]