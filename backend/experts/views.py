import secrets
import string
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from httpx import request

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import ExpertRequest, ExpertProfile, Category
from .serializers import ExpertRequestSerializer, ExpertRequestAdminSerializer, CategorySerializer, ExpertProfileSerializer

User = get_user_model()

# ── HELPER : Création du compte ──────────────────────────────
def _create_expert_account(req):
    """
    Crée le compte User + ExpertProfile + Envoie un email de bienvenue.
    """
    print(f"--- 🚀 Début du processus pour : {req.email} ---")
    
    # 1. Génération d'un mot de passe sécurisé (12 caractères)
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    password = ''.join(secrets.choice(alphabet) for _ in range(12))

    # 2. Vérifier si l'utilisateur existe déjà
    user = User.objects.filter(email=req.email).first()
    
    if not user:
        print("DEBUG: Création d'un nouvel utilisateur...")
        # Génération d'un username unique (ex: maissa829)
        base_username = req.email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists() and counter < 10:
            username = f"{base_username}{counter}"
            counter += 1

        # Création de l'objet User
        user = User.objects.create_user(
            email=req.email,
            username=username,
            first_name=req.first_name,
            last_name=req.last_name
        )
        user.set_password(password)
        
        # Attribution du rôle expert si le champ existe
        if hasattr(user, 'role'):
            user.role = 'expert'
        user.save()
        print(f"DEBUG: User créé (ID: {user.id})")
    else:
        print("DEBUG: L'utilisateur existe déjà, mise à jour en rôle Expert.")
        if hasattr(user, 'role'):
            user.role = 'expert'
            user.save()

    # 3. Création ou mise à jour du ExpertProfile
    profile, created = ExpertProfile.objects.get_or_create(
        user=user,
        defaults={'is_verified': True, 'hourly_rate': 0}
    )
    if not created:
        profile.is_verified = True
        profile.save()
    
    # Ajout de la catégorie d'expertise
    if req.category:
        profile.categories.add(req.category)

    # 4. Lier la candidature à l'utilisateur (sera sauvé dans la vue)
    req.user = user

    # 5. ENVOI DE L'EMAIL RÉEL (Via Gmail SMTP)
    print(f"DEBUG: Tentative d'envoi d'email à {req.email}...")
    try:
        subject = '✅ Bienvenue chez MinuteExpert - Candidature Approuvée'
        message = f"""
Bonjour {req.first_name},

Félicitations ! Votre candidature en tant qu'expert sur MinuteExpert a été approuvée.

Voici vos accès pour vous connecter :
--------------------------------------------------
🌐 URL : {getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/login
📧 Email : {req.email}
👤 Identifiant : {user.username}
🔑 Mot de passe temporaire : {password}
--------------------------------------------------

Nous vous conseillons de changer votre mot de passe dès votre première connexion.

Bienvenue dans l'équipe !
L'équipe MinuteExpert.
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [req.email],
            fail_silently=False, # On veut voir l'erreur si ça échoue
        )
        print("✅ DEBUG: Email envoyé avec succès !")
    except Exception as e:
        print(f"❌ ERREUR SMTP : Impossible d'envoyer l'email. Détails : {e}")

    # Log final pour le terminal
    print(f"\n--- ✅ PROCESSUS TERMINÉ ---")
    print(f"Expert : {req.email} | Pass : {password}\n")

# ── VUES API ──────────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class ExpertRequestCreateView(APIView):
    """Soumission de candidature par le candidat"""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        print(f"DEBUG: Received data keys: {list(request.data.keys())}")
        
        # Convert QueryDict to plain dict to allow modifications
        data = {k: v for k, v in request.data.items()}

        # Nettoyage des données
        data.pop('user', None)

        # Parsing des langues si envoyées en JSON string (FormData)
        languages = data.get('languages')
        if languages and isinstance(languages, str):
            try:
                import json
                data['languages'] = json.loads(languages)
            except:
                data['languages'] = []

        s = ExpertRequestSerializer(data=data, context={'request': request})

        if s.is_valid():
            s.save()
            return Response({'detail': 'Candidature envoyée.'}, status=201)

        print(f"DEBUG: Serializer errors: {s.errors}")
        return Response(s.errors, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class ExpertRequestListView(APIView):
    """Liste des candidatures pour l'admin"""
    permission_classes = [AllowAny]
    def get(self, request):
        qs = ExpertRequest.objects.select_related('category', 'user').order_by('-id')
        s = ExpertRequestAdminSerializer(qs, many=True)
        return Response(s.data)

class ExpertRequestDecisionView(APIView):
    """Décision Admin (Approuver/Refuser)"""
    permission_classes = [AllowAny] 
    def post(self, request, pk):
        try:
            req = ExpertRequest.objects.get(pk=pk)
        except ExpertRequest.DoesNotExist:
            return Response({'detail': 'Introuvable.'}, status=404)

        decision = request.data.get('decision')
        print(f"DEBUG: Admin decision for request {pk}: {decision}")
        
        if decision not in ('approved', 'rejected'):
            return Response({'detail': 'Décision invalide.'}, status=400)

        req.status = decision
        
        if decision == 'approved':
            _create_expert_account(req)

        # On sauve une seule fois à la fin avec toutes les modifs (status + user)
        req.save()
        print(f"DEBUG: Request {pk} status saved as {req.status}")

        return Response({'detail': f'Candidature {decision}.'})

class CategoryListView(APIView):
    """Liste de toutes les catégories actives"""
    permission_classes = [AllowAny]
    def get(self, request):
        qs = Category.objects.filter(is_active=True)
        s = CategorySerializer(qs, many=True)
        return Response(s.data)

class ExpertListView(APIView):
    """Liste des experts validés. Permet le filtrage par slug de catégorie."""
    permission_classes = [AllowAny]
    def get(self, request):
        category_slug = request.query_params.get('category')
        qs = ExpertProfile.objects.filter(is_verified=True).select_related('user').prefetch_related('categories')
        
        if category_slug:
            qs = qs.filter(categories__slug=category_slug)
            
        s = ExpertProfileSerializer(qs, many=True)
        return Response(s.data)

class ExpertDetailView(APIView):
    """Détail d'un expert spécifique"""
    permission_classes = [AllowAny]
    def get(self, request, pk):
        try:
            expert = ExpertProfile.objects.select_related('user').prefetch_related('categories').get(pk=pk, is_verified=True)
        except ExpertProfile.DoesNotExist:
            return Response({'detail': 'Expert introuvable.'}, status=404)
            
        s = ExpertProfileSerializer(expert)
        return Response(s.data)

class ExpertMeView(APIView):
    """Récupère ou met à jour le profil de l'expert connecté"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'expert':
            return Response({'detail': 'Accès refusé.'}, status=403)
            
        try:
            profile = ExpertProfile.objects.get(user=request.user)
        except ExpertProfile.DoesNotExist:
            return Response({'detail': 'Profil introuvable.'}, status=404)
            
        s = ExpertProfileSerializer(profile)
        return Response(s.data)
        
    def patch(self, request):
        if request.user.role != 'expert':
            return Response({'detail': 'Accès refusé.'}, status=403)
            
        try:
            profile = request.user.expert_profile
        except ExpertProfile.DoesNotExist:
            return Response({'detail': 'Profil introuvable.'}, status=404)
            
        # Update first_name and last_name on User model if provided
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        user_changed = False
        if first_name is not None:
            request.user.first_name = first_name
            user_changed = True
        if last_name is not None:
            request.user.last_name = last_name
            user_changed = True
        if user_changed:
            request.user.save()

        s = ExpertProfileSerializer(profile, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

class ExpertMySessionsView(APIView):
    """Liste des sessions de l'expert connecté"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'expert':
            return Response({'detail': 'Accès refusé.'}, status=403)
            
        try:
            profile = request.user.expert_profile
        except ExpertProfile.DoesNotExist:
            return Response({'detail': 'Profil introuvable.'}, status=404)
            
        from bookings.models import Booking
        from bookings.serializers import BookingDetailSerializer
        bookings = Booking.objects.filter(expert=profile).select_related('client', 'expert__user').order_by('-scheduled_at')
        s = BookingDetailSerializer(bookings, many=True)
        return Response(s.data)

class AdminExpertListView(APIView):
    """Liste de tous les experts pour l'administrateur"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'admin' and not request.user.is_superuser:
            return Response({'detail': 'Accès refusé.'}, status=403)
            
        experts = ExpertProfile.objects.all().select_related('user').prefetch_related('categories')
        
        # Serialize
        s = ExpertProfileSerializer(experts, many=True)
        return Response(s.data)