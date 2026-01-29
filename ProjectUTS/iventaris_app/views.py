from django.views.generic import ListView, CreateView, UpdateView, DeleteView, View
from django.urls import reverse_lazy
from django.db.models import Exists, OuterRef, Q
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib import messages
from django import forms
from django.utils import timezone
from django.contrib.auth.models import User

# REST Framework imports
from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

from .models import Peminjaman, Buku, Anggota
from .serializers import (
    PeminjamanSerializer,
    PeminjamanCreateSerializer,
    BukuSerializer,
    AnggotaSerializer,
    UserSerializer,
    DashboardSerializer,
)


# =============================================================================
# FORM CLASSES (untuk template-based views)
# =============================================================================

class PeminjamanForm(forms.ModelForm):
    class Meta:
        model = Peminjaman
        fields = ['anggota', 'tanggal_pinjam', 'tanggal_kembali']
        widgets = {
            'anggota': forms.Select(attrs={'class': 'form-control'}),
            'tanggal_pinjam': forms.DateInput(attrs={
                'type': 'date',
                'class': 'form-control'
            }),
            'tanggal_kembali': forms.DateInput(attrs={
                'type': 'date',
                'class': 'form-control'
            }),
        }


class BukuForm(forms.ModelForm):
    class Meta:
        model = Buku
        fields = ['judul', 'penulis', 'tahun']
        widgets = {
            'judul': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Masukkan judul buku...'
            }),
            'penulis': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Masukkan nama penulis...'
            }),
            'tahun': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Contoh: 2025',
                'min': 1900,
                'max': 2100
            }),
        }


class AnggotaForm(forms.ModelForm):
    class Meta:
        model = Anggota
        fields = ['nama', 'email']
        widgets = {
            'nama': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Masukkan nama lengkap...'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Contoh: anggota@email.com'
            }),
        }


# =============================================================================
# API VIEWS - Authentication
# =============================================================================

@extend_schema(
    tags=['Authentication'],
    request=UserSerializer,
    responses={201: UserSerializer},
    description='Register user baru untuk mengakses sistem'
)
class RegisterAPIView(generics.CreateAPIView):
    """API untuk registrasi user baru"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


@extend_schema(
    tags=['Authentication'],
    responses={200: UserSerializer},
    description='Mendapatkan profil user yang sedang login'
)
class UserProfileAPIView(APIView):
    """API untuk mendapatkan profil user yang login"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# API VIEWS - Dashboard
# =============================================================================

@extend_schema(
    tags=['Dashboard'],
    responses={200: DashboardSerializer},
    description='Mendapatkan statistik dashboard perpustakaan'
)
class DashboardAPIView(APIView):
    """API untuk mendapatkan data dashboard"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        data = {
            'total_buku': Buku.objects.count(),
            'total_anggota': Anggota.objects.count(),
            'total_dipinjam': Peminjaman.objects.filter(status_peminjaman='aktif').count(),
            'total_selesai': Peminjaman.objects.filter(status_peminjaman='selesai').count(),
            'buku_tersedia': Buku.objects.count() - Peminjaman.objects.filter(status_peminjaman='aktif').count(),
        }
        serializer = DashboardSerializer(data)
        return Response(serializer.data)


# =============================================================================
# API VIEWSETS - CRUD Operations
# =============================================================================

@extend_schema(tags=['Buku'])
class BukuViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk operasi CRUD pada Buku.
    
    list: Mendapatkan daftar semua buku
    create: Menambah buku baru
    retrieve: Mendapatkan detail buku berdasarkan ID
    update: Memperbarui buku
    partial_update: Memperbarui sebagian data buku
    destroy: Menghapus buku
    """
    queryset = Buku.objects.all()
    serializer_class = BukuSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Buku.objects.all()
        
        # Filter berdasarkan pencarian
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(judul__icontains=search) |
                Q(penulis__icontains=search)
            )
        
        # Filter berdasarkan ketersediaan
        available = self.request.query_params.get('available', None)
        if available is not None:
            if available.lower() == 'true':
                # Buku yang tidak sedang dipinjam
                queryset = queryset.exclude(
                    id__in=Peminjaman.objects.filter(
                        status_peminjaman='aktif'
                    ).values_list('buku_id', flat=True)
                )
            elif available.lower() == 'false':
                # Buku yang sedang dipinjam
                queryset = queryset.filter(
                    id__in=Peminjaman.objects.filter(
                        status_peminjaman='aktif'
                    ).values_list('buku_id', flat=True)
                )
        
        return queryset
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name='search', description='Cari berdasarkan judul atau penulis', type=str),
            OpenApiParameter(name='available', description='Filter ketersediaan (true/false)', type=str),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


@extend_schema(tags=['Anggota'])
class AnggotaViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk operasi CRUD pada Anggota.
    
    list: Mendapatkan daftar semua anggota
    create: Menambah anggota baru
    retrieve: Mendapatkan detail anggota berdasarkan ID
    update: Memperbarui anggota
    partial_update: Memperbarui sebagian data anggota
    destroy: Menghapus anggota
    """
    queryset = Anggota.objects.all()
    serializer_class = AnggotaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Anggota.objects.all()
        
        # Filter berdasarkan pencarian
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nama__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name='search', description='Cari berdasarkan nama atau email', type=str),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        description='Mendapatkan riwayat peminjaman anggota',
        responses={200: PeminjamanSerializer(many=True)}
    )
    @action(detail=True, methods=['get'])
    def riwayat(self, request, pk=None):
        """Mendapatkan riwayat peminjaman anggota tertentu"""
        anggota = self.get_object()
        peminjaman = Peminjaman.objects.filter(anggota=anggota).order_by('-tanggal_pinjam')
        serializer = PeminjamanSerializer(peminjaman, many=True)
        return Response(serializer.data)


@extend_schema(tags=['Peminjaman'])
class PeminjamanViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk operasi CRUD pada Peminjaman.
    
    list: Mendapatkan daftar semua peminjaman
    create: Menambah peminjaman baru
    retrieve: Mendapatkan detail peminjaman berdasarkan ID
    update: Memperbarui peminjaman
    partial_update: Memperbarui sebagian data peminjaman
    destroy: Menghapus peminjaman
    """
    queryset = Peminjaman.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PeminjamanCreateSerializer
        return PeminjamanSerializer
    
    def get_queryset(self):
        queryset = Peminjaman.objects.all().order_by('-tanggal_pinjam')
        
        # Filter berdasarkan status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status_peminjaman=status_filter)
        
        # Filter berdasarkan anggota
        anggota_id = self.request.query_params.get('anggota', None)
        if anggota_id:
            queryset = queryset.filter(anggota_id=anggota_id)
        
        # Filter berdasarkan buku
        buku_id = self.request.query_params.get('buku', None)
        if buku_id:
            queryset = queryset.filter(buku_id=buku_id)
        
        return queryset
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name='status', description='Filter berdasarkan status (aktif/selesai)', type=str),
            OpenApiParameter(name='anggota', description='Filter berdasarkan ID anggota', type=int),
            OpenApiParameter(name='buku', description='Filter berdasarkan ID buku', type=int),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


@extend_schema(
    tags=['Peminjaman'],
    description='Mengembalikan buku yang dipinjam',
    responses={200: PeminjamanSerializer}
)
class KembalikanPeminjamanAPIView(APIView):
    """API untuk mengembalikan buku"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        peminjaman = get_object_or_404(Peminjaman, pk=pk)
        
        if peminjaman.status_peminjaman == 'selesai':
            return Response(
                {'error': 'Buku ini sudah dikembalikan sebelumnya.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        peminjaman.status_peminjaman = 'selesai'
        peminjaman.tanggal_kembali = timezone.localdate()
        peminjaman.save()
        
        serializer = PeminjamanSerializer(peminjaman)
        return Response({
            'message': f"Buku '{peminjaman.buku.judul}' berhasil dikembalikan!",
            'data': serializer.data
        })


# =============================================================================
# TEMPLATE-BASED VIEWS (untuk backward compatibility)
# =============================================================================

class PeminjamanListView(ListView):
    model = Peminjaman
    template_name = 'iventaris_app/peminjaman_list.html'
    context_object_name = 'peminjaman_list'


class PeminjamanCreateView(CreateView):
    model = Peminjaman
    form_class = PeminjamanForm
    template_name = 'iventaris_app/peminjaman_form.html'
    success_url = reverse_lazy('daftar-peminjaman')
    
    def form_valid(self, form):
        messages.success(self.request, "✅ Peminjaman berhasil ditambahkan!")
        return super().form_valid(form)


class PeminjamanUpdateView(UpdateView):
    model = Peminjaman
    form_class = PeminjamanForm
    template_name = 'iventaris_app/peminjaman_form.html'
    success_url = reverse_lazy('daftar-peminjaman')
    
    def form_valid(self, form):
        messages.success(self.request, "✅ Peminjaman berhasil diperbarui!")
        return super().form_valid(form)


class PeminjamanDeleteView(DeleteView):
    model = Peminjaman
    template_name = 'iventaris_app/peminjaman_confirm_delete.html'
    success_url = reverse_lazy('daftar-peminjaman')
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, "✅ Peminjaman berhasil dihapus!")
        return super().delete(request, *args, **kwargs)


class BukuListView(ListView):
    model = Buku
    template_name = 'iventaris_app/buku_list.html'
    context_object_name = 'buku_list'

    def get_queryset(self):
        queryset = Buku.objects.annotate(
            sudah_dipinjam=Exists(
                Peminjaman.objects.filter(
                    buku=OuterRef('pk'),
                    status_peminjaman='aktif'
                )
            )
        )
        q = self.request.GET.get('q')
        if q:
            queryset = queryset.filter(
                Q(judul__icontains=q) |
                Q(penulis__icontains=q) |
                Q(tahun__icontains=q)
            )
        return queryset


class BukuCreateView(CreateView):
    model = Buku
    form_class = BukuForm
    template_name = 'iventaris_app/buku_form.html'
    success_url = reverse_lazy('daftar-buku')
    
    def form_valid(self, form):
        messages.success(self.request, "✅ Buku berhasil ditambahkan!")
        return super().form_valid(form)


class BukuDeleteView(DeleteView):
    model = Buku
    template_name = 'iventaris_app/buku_confirm_delete.html'
    success_url = reverse_lazy('daftar-buku')
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, "✅ Buku berhasil dihapus!")
        return super().delete(request, *args, **kwargs)


class PeminjamanBukuCreateView(CreateView):
    """
    View untuk meminjam buku tertentu dari halaman Daftar Buku.
    User hanya perlu isi Anggota dan Tanggal Pinjam.
    """
    model = Peminjaman
    form_class = PeminjamanForm
    template_name = 'iventaris_app/peminjaman_buku_form.html'
    success_url = reverse_lazy('daftar-buku')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        buku_id = self.kwargs.get('buku_id')
        context['buku'] = get_object_or_404(Buku, pk=buku_id)
        return context

    def form_valid(self, form):
        buku_id = self.kwargs.get('buku_id')
        buku = get_object_or_404(Buku, pk=buku_id)
        
        # Cek apakah buku sedang AKTIF dipinjam
        sudah_dipinjam = Peminjaman.objects.filter(
            buku=buku, 
            status_peminjaman='aktif'
        ).exists()
        
        if sudah_dipinjam:
            form.add_error(None, f"❌ Buku '{buku.judul}' sedang dipinjam oleh anggota lain!")
            return self.form_invalid(form)
        
        # Set data peminjaman
        form.instance.buku = buku
        form.instance.status_peminjaman = 'aktif'
        
        messages.success(self.request, f"✅ Peminjaman '{buku.judul}' berhasil disimpan!")
        return super().form_valid(form)


class AnggotaCreateView(CreateView):
    model = Anggota
    form_class = AnggotaForm
    template_name = 'iventaris_app/anggota_form.html'
    success_url = reverse_lazy('daftar-buku')
    
    def form_valid(self, form):
        messages.success(self.request, "✅ Anggota berhasil ditambahkan!")
        return super().form_valid(form)


class KembalikanPeminjamanView(View):
    def post(self, request, pk):
        peminjaman = get_object_or_404(Peminjaman, pk=pk)
        peminjaman.status_peminjaman = 'selesai'
        peminjaman.tanggal_kembali = timezone.localdate()
        peminjaman.save()
        messages.success(request, f"Buku '{peminjaman.buku.judul}' berhasil dikembalikan!")
        return redirect('daftar-peminjaman')


def dashboard(request):
    total_buku = Buku.objects.count()
    total_anggota = Anggota.objects.count()
    total_dipinjam = Peminjaman.objects.filter(status_peminjaman='aktif').count()
    total_selesai = Peminjaman.objects.filter(status_peminjaman='selesai').count()
    return render(request, 'iventaris_app/dashboard.html', {
        'total_buku': total_buku,
        'total_anggota': total_anggota,
        'total_dipinjam': total_dipinjam,
        'total_selesai': total_selesai,
    })


class RiwayatPeminjamanListView(ListView):
    model = Peminjaman
    template_name = 'iventaris_app/riwayat_peminjaman.html'
    context_object_name = 'riwayat_list'

    def get_queryset(self):
        anggota_id = self.kwargs.get('anggota_id')
        return Peminjaman.objects.filter(anggota_id=anggota_id).order_by('-tanggal_pinjam')