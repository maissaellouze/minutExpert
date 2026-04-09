from django.urls import path
from .views import ServiceListView, BookingCreateView, BookingListView

urlpatterns = [
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('create/', BookingCreateView.as_view(), name='booking-create'),
    path('my-bookings/', BookingListView.as_view(), name='booking-list'),
]
