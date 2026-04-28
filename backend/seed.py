import os
import django

# Configuration de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from experts.models import Category, ExpertProfile
from accounts.models import User

def seed():
    print("--- Debut du Seed (Generation des donnees) ---")
    
    # Création de quelques catégories
    # Création des catégories "Old" (Médical, Juridique, etc.)
    cat1, _ = Category.objects.get_or_create(name="⚕ Médical", slug="medical")
    cat2, _ = Category.objects.get_or_create(name="⚖ Juridique", slug="juridique")
    cat3, _ = Category.objects.get_or_create(name="💻 Tech & Dev", slug="tech-dev")
    cat4, _ = Category.objects.get_or_create(name="📈 Finance", slug="finance")
    cat5, _ = Category.objects.get_or_create(name="🎨 Créatif", slug="creatif")
    
    print("Categories creees.")

    # Creation de faux utilisateurs
    user1, created = User.objects.get_or_create(email="expert1@test.com", defaults={
        "username": "expert1",
        "first_name": "Alice",
        "last_name": "Tremblay",
        "role": "expert"
    })
    if created:
        user1.set_password("Password123!")
        user1.save()

    user2, created = User.objects.get_or_create(email="expert2@test.com", defaults={
        "username": "expert2",
        "first_name": "Bob",
        "last_name": "Martin",
        "role": "expert"
    })
    if created:
        user2.set_password("Password123!")
        user2.save()

    print("Utilisateurs experts crees.")

    # Creation des profils experts
    prof1, _ = ExpertProfile.objects.get_or_create(user=user1, defaults={
        "hourly_rate": 50.00,
        "is_verified": True
    })
    prof1.categories.add(cat1, cat3)

    prof2, _ = ExpertProfile.objects.get_or_create(user=user2, defaults={
        "hourly_rate": 40.00,
        "is_verified": True
    })
    prof2.categories.add(cat2)

    print("Profils experts configures et lies aux categories.")

    # Relier Booking/Services
    from bookings.models import Service

    serv1, _ = Service.objects.get_or_create(
        expert=prof1, 
        category=cat1, 
        title="Appel developpeur", 
        defaults={"service_type": "video", "base_price": 2.00, "duration_min": 30}
    )
    serv2, _ = Service.objects.get_or_create(
        expert=prof2, 
        category=cat2, 
        title="Audit SEO (Forfait complet)", 
        defaults={"service_type": "fixed", "base_price": 150.00, "duration_min": 120}
    )
    
    print("Services associes aux experts crees.")
    print("--- Fin du Seed ---")

if __name__ == '__main__':
    seed()
