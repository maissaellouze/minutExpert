import os
import django
import uuid
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import ClientProfile
from experts.models import ExpertProfile, Category

User = get_user_model()

def seed_users():
    # Clients
    clients_data = [
        ("jean.dupont@example.com", "Jean", "Dupont"),
        ("marie.curie@example.com", "Marie", "Curie"),
        ("lucas.martin@example.com", "Lucas", "Martin"),
    ]
    
    for email, first, last in clients_data:
        username = email.split('@')[0]
        if not User.objects.filter(email=email).exists():
            user = User.objects.create_user(
                email=email,
                username=username,
                password="password123",
                first_name=first,
                last_name=last,
                role='client',
                status='active'
            )
            ClientProfile.objects.create(user=user, first_name=first, last_name=last)
            print(f"Client créé: {email} / password123")
        else:
            print(f"Client existe déjà: {email}")

    # Experts
    experts_data = [
        ("thomas.edison@example.com", "Thomas", "Edison", "Expert en Innovation", "Inventeur passionné par la tech.", 1.50, "tech"),
        ("sarah.connor@example.com", "Sarah", "Connor", "Conseillère en Sécurité", "Experte en protection et stratégie.", 2.00, "legal"),
        ("paul.bocuse@example.com", "Paul", "Bocuse", "Maître Chef", "Expert en gastronomie française.", 1.20, "creative"),
    ]
    
    for email, first, last, title, bio, rate, cat_slug in experts_data:
        username = email.split('@')[0]
        if not User.objects.filter(email=email).exists():
            user = User.objects.create_user(
                email=email,
                username=username,
                password="password123",
                first_name=first,
                last_name=last,
                role='expert',
                status='active'
            )
            category = Category.objects.filter(slug=cat_slug).first()
            profile = ExpertProfile.objects.create(
                user=user,
                title=title,
                bio=bio,
                hourly_rate=rate,
                is_verified=True
            )
            if category:
                profile.categories.add(category)
            print(f"Expert créé: {email} / password123")
        else:
            print(f"Expert existe déjà: {email}")

if __name__ == "__main__":
    seed_users()
