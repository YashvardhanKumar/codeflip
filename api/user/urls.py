from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CustomAuthToken, RegisterView, LogoutView, SocialAuthView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'register', RegisterView, basename='register')
router.register(r'logout', LogoutView, basename='logout')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('social/', SocialAuthView.as_view(), name='social_auth'),
]
