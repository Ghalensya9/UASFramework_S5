from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from django.urls import path, include
from .views import (
    BukuViewSet,
    AnggotaViewSet,
    PeminjamanViewSet,
    DashboardAPIView,
    RegisterAPIView,
    UserProfileAPIView,
    KembalikanPeminjamanAPIView,
)

# Router untuk ViewSets
router = DefaultRouter()
router.register(r'buku', BukuViewSet, basename='buku')
router.register(r'anggota', AnggotaViewSet, basename='anggota')
router.register(r'peminjaman', PeminjamanViewSet, basename='peminjaman')

urlpatterns = [
    # ===== Authentication Endpoints =====
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterAPIView.as_view(), name='register'),
    path('auth/profile/', UserProfileAPIView.as_view(), name='user_profile'),
    
    # ===== Dashboard Endpoint =====
    path('dashboard/', DashboardAPIView.as_view(), name='api-dashboard'),
    
    # ===== Peminjaman Actions =====
    path('peminjaman/<int:pk>/kembalikan/', KembalikanPeminjamanAPIView.as_view(), name='api-kembalikan'),
    
    # ===== Swagger/OpenAPI Documentation =====
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Include router URLs
urlpatterns += router.urls
