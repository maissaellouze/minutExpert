from accounts.models import ClientProfile
from django.contrib.auth import get_user_model
User = get_user_model()
users = User.objects.filter(role='client')
created_count = 0
for u in users:
    if not hasattr(u, 'client_profile'):
        ClientProfile.objects.create(
            user=u, 
            first_name=u.first_name or u.username,
            last_name=u.last_name or 'Client'
        )
        created_count += 1
print(f'Created {created_count} missing client profiles.')
