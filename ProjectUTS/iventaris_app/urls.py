from django.urls import path
from .views import (
    PeminjamanListView,
    PeminjamanUpdateView,
    PeminjamanDeleteView,
    BukuCreateView,
    BukuListView,
    BukuDeleteView,  
    AnggotaCreateView,
    PeminjamanBukuCreateView,
    KembalikanPeminjamanView,
    dashboard,
    RiwayatPeminjamanListView,
)

urlpatterns = [
    # Peminjaman
    path('peminjaman/', PeminjamanListView.as_view(), name='daftar-peminjaman'),
    path('peminjaman/<int:pk>/edit/', PeminjamanUpdateView.as_view(), name='edit-peminjaman'),
    path('peminjaman/<int:pk>/delete/', PeminjamanDeleteView.as_view(), name='delete-peminjaman'),
    
    # Buku
    path('buku/tambah/', BukuCreateView.as_view(), name='tambah-buku'),
    path('buku/', BukuListView.as_view(), name='daftar-buku'),
    path('buku/<int:buku_id>/pinjam/', PeminjamanBukuCreateView.as_view(), name='pinjam-buku'),
    path('buku/<int:pk>/hapus/', BukuDeleteView.as_view(), name='hapus-buku'),  # ✅ URL Hapus Baru
    
    # Anggota
    path('anggota/tambah/', AnggotaCreateView.as_view(), name='tambah-anggota'),
    path('peminjaman/<int:pk>/kembalikan/', KembalikanPeminjamanView.as_view(), name='kembalikan-peminjaman'),
    path('', dashboard, name='dashboard'),
    path('anggota/<int:anggota_id>/riwayat/', RiwayatPeminjamanListView.as_view(), name='riwayat-peminjaman'),
    
    
    


]
