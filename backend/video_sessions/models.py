from django.db import models
from bookings.models import Booking

import string
import random

def generate_jitsi_link():
    random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    return f"https://meet.jit.si/MinuteExpert_{random_str}"

class VideoSession(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='video_session')
    meeting_link = models.URLField(max_length=500, default=generate_jitsi_link)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
