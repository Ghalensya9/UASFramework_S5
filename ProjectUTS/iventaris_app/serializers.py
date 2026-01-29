from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Peminjaman, Buku, Anggota


class UserSerializer(serializers.ModelSerializer):
    """Serializer untuk model User Django"""
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class BukuSerializer(serializers.ModelSerializer):
    """Serializer untuk model Buku"""
    is_available = serializers.SerializerMethodField()
    
    class Meta:
        model = Buku
        fields = ['id', 'judul', 'penulis', 'tahun', 'is_available']
    
    def get_is_available(self, obj):
        """Cek apakah buku tersedia (tidak sedang dipinjam)"""
        return not Peminjaman.objects.filter(buku=obj, status_peminjaman='aktif').exists()


class AnggotaSerializer(serializers.ModelSerializer):
    """Serializer untuk model Anggota"""
    total_peminjaman = serializers.SerializerMethodField()
    
    class Meta:
        model = Anggota
        fields = ['id', 'nama', 'email', 'total_peminjaman']
    
    def get_total_peminjaman(self, obj):
        """Hitung total peminjaman oleh anggota ini"""
        return Peminjaman.objects.filter(anggota=obj).count()


class PeminjamanSerializer(serializers.ModelSerializer):
    """Serializer untuk model Peminjaman"""
    buku_detail = BukuSerializer(source='buku', read_only=True)
    anggota_detail = AnggotaSerializer(source='anggota', read_only=True)
    buku = serializers.PrimaryKeyRelatedField(queryset=Buku.objects.all())
    anggota = serializers.PrimaryKeyRelatedField(queryset=Anggota.objects.all())
    
    class Meta:
        model = Peminjaman
        fields = [
            'id', 'buku', 'buku_detail', 'anggota', 'anggota_detail',
            'tanggal_pinjam', 'tanggal_kembali', 'status_peminjaman'
        ]
        read_only_fields = ['id']
    
    def validate(self, data):
        """Validasi untuk memastikan buku tidak sedang dipinjam"""
        buku = data.get('buku')
        instance = self.instance
        
        # Jika create (bukan update) atau buku berubah
        if (not instance or instance.buku != buku):
            if Peminjaman.objects.filter(buku=buku, status_peminjaman='aktif').exists():
                raise serializers.ValidationError({
                    'buku': f"Buku '{buku.judul}' sedang dipinjam oleh anggota lain."
                })
        
        return data


class PeminjamanCreateSerializer(serializers.ModelSerializer):
    """Serializer khusus untuk membuat peminjaman baru"""
    
    class Meta:
        model = Peminjaman
        fields = ['buku', 'anggota', 'tanggal_pinjam', 'tanggal_kembali']
    
    def validate_buku(self, value):
        """Validasi buku tidak sedang dipinjam"""
        if Peminjaman.objects.filter(buku=value, status_peminjaman='aktif').exists():
            raise serializers.ValidationError(
                f"Buku '{value.judul}' sedang dipinjam dan tidak tersedia."
            )
        return value
    
    def create(self, validated_data):
        validated_data['status_peminjaman'] = 'aktif'
        return super().create(validated_data)


class DashboardSerializer(serializers.Serializer):
    """Serializer untuk data dashboard"""
    total_buku = serializers.IntegerField()
    total_anggota = serializers.IntegerField()
    total_dipinjam = serializers.IntegerField()
    total_selesai = serializers.IntegerField()
    buku_tersedia = serializers.IntegerField()