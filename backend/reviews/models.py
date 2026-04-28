from django.db import models
from django.db.models import Avg

class Review(models.Model):
    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='review')
    client = models.ForeignKey('accounts.ClientProfile', on_delete=models.CASCADE, related_name='reviews')
    expert = models.ForeignKey('experts.ExpertProfile', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.rating}/5 from {self.client.user.username} to {self.expert.user.username}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate average rating for the expert
        self.update_expert_rating()

    def update_expert_rating(self):
        from experts.models import ExpertProfile
        expert_reviews = Review.objects.filter(expert=self.expert)
        avg = expert_reviews.aggregate(Avg('rating'))['rating__avg']
        count = expert_reviews.count()
        
        # Use update() to bypass any potential signal or instance issues
        ExpertProfile.objects.filter(id=self.expert.id).update(
            avg_rating=round(float(avg), 2) if avg is not None else 0.0,
            review_count=count
        )
        print(f"Expert {self.expert.id} updated: Avg {avg}, Count {count}")
