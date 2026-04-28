from experts.models import ExpertProfile
from reviews.models import Review
from django.db.models import Avg

experts = ExpertProfile.objects.all()
for e in experts:
    reviews = Review.objects.filter(expert=e)
    avg = reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0
    count = reviews.count()
    ExpertProfile.objects.filter(id=e.id).update(
        avg_rating=round(float(avg), 2),
        review_count=count
    )
    print(f"Updated Expert {e.id} ({e.user.email}): {avg} ({count} avis)")
