from django.db import models
from django.conf import settings
class Category(models.Model):
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    name_fr = models.CharField(max_length=200)
    name_ar = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    icon_name = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)

class ExpertRequest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='pending')
    cv_url = models.URLField(max_length=500)
    languages = models.JSONField() # Pour stocker ["fr", "en"]

class ExpertProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    categories = models.ManyToManyField(Category, related_name='experts')
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    is_verified = models.BooleanField(default=False)

class Availability(models.Model):
    expert = models.ForeignKey(ExpertProfile, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.PositiveSmallIntegerField() # 0-6
    start_time = models.TimeField()
    end_time = models.TimeField()
