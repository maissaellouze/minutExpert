"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.urls import include, path
from accounts.views import ClientSignupView, LoginView
from experts.views import (
    ExpertRequestCreateView,
    ExpertRequestListView,
    ExpertRequestDecisionView,
)
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView

def api_home(request):
    return JsonResponse({"status": "MinuteExpert API is running", "version": "1.0"})

urlpatterns = [
    path('', api_home),
    path('admin/', admin.site.urls),
    #auth
    path('api/auth/signup/',         ClientSignupView.as_view()),
    path('api/auth/login/',          LoginView.as_view()),
    path('api/auth/token/refresh/',  TokenRefreshView.as_view()),

    # Expert requests
    path('api/expert-requests/',              ExpertRequestCreateView.as_view()),
    path('api/admin/expert-requests/',        ExpertRequestListView.as_view()),
    path('api/admin/expert-requests/<int:pk>/decision/', ExpertRequestDecisionView.as_view()),

    # Experts public search
    path('api/experts/', include('experts.urls')),

    # Bookings & Services
    path('api/bookings/', include('bookings.urls')),

    # Reviews and ratings
    path('api/reviews/', include('reviews.urls')),

    # Wallet and Payments
    path('api/payments/', include('payments.urls')),

    # Video Sessions
    path('api/sessions/', include('video_sessions.urls')),
]
