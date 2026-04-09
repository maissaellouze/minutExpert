from django.urls import path
from .views import ReviewCreateView, ExpertReviewListView

urlpatterns = [
    path('create/', ReviewCreateView.as_view(), name='review-create'),
    path('expert/<int:expert_id>/', ExpertReviewListView.as_view(), name='review-expert-list'),
]
