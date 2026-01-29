from django.db import models   

class Buku(models.Model):
    judul = models.CharField(max_length=120)
    penulis = models.CharField(max_length=100)
    tahun = models.IntegerField()

class Anggota(models.Model):
    nama = models.CharField(max_length=100)
    email = models.EmailField()

    def __str__(self):
        return self.nama


class Peminjaman(models.Model):
    STATUS_CHOICES = [
        ('aktif', 'Aktif (Sedang Dipinjam)'),
        ('selesai', 'Selesai (Sudah Dikembalikan)'),
    ]
    buku = models.ForeignKey(Buku, on_delete=models.CASCADE)
    anggota = models.ForeignKey(Anggota, on_delete=models.CASCADE)
    tanggal_pinjam = models.DateField()
    tanggal_kembali = models.DateField(blank=True, null=True)
    status_peminjaman = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='aktif'
    )

    def __str__(self):
        return f"{self.buku.judul} - {self.anggota.nama}"





# Create your models here.