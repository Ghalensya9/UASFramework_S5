# 🎬 PANDUAN PEMBUATAN VIDEO PRESENTASI
## LibraFlow - Sistem Manajemen Perpustakaan
### Durasi Target: 12-15 Menit

---

## 📋 PERSIAPAN SEBELUM REKAM

### Software yang Dibutuhkan:
1. **Screen Recorder**: OBS Studio (gratis) atau Camtasia
2. **Editor Video**: CapCut, DaVinci Resolve (gratis), atau Filmora
3. **Browser**: Chrome/Firefox untuk demo
4. **Code Editor**: VS Code (sudah terbuka)

### Checklist Sebelum Rekam:
- [ ] Jalankan Backend: `python manage.py runserver`
- [ ] Jalankan Frontend: `python -m http.server 3000` (di folder frontend)
- [ ] Buka browser dengan 2 tab:
  - Tab 1: http://localhost:3000 (Frontend)
  - Tab 2: http://127.0.0.1:8000/api/docs/ (Swagger)
- [ ] Buka VS Code dengan project terbuka
- [ ] Siapkan beberapa data contoh (buku, anggota) di database
- [ ] Tutup notifikasi dan aplikasi yang tidak perlu
- [ ] Test microphone

---

## 🎥 STRUKTUR VIDEO (Total: 12-15 Menit)

---

# BAGIAN 1: PENJELASAN SINGKAT PROJECT (3-4 Menit)

## 1.1 Pembukaan (30 detik)
**[Tampilkan slide atau layar dengan judul project]**

### Script:
> "Assalamualaikum warahmatullahi wabarakatuh. 
> 
> Perkenalkan nama saya [NAMA ANDA], NIM [NIM ANDA].
> 
> Pada video ini saya akan mempresentasikan project UTS Framework saya yang berjudul **LibraFlow - Sistem Manajemen Perpustakaan Digital**.
> 
> Project ini menggunakan arsitektur **Decoupled** atau pemisahan antara Backend dan Frontend."

---

## 1.2 Tujuan Aplikasi (1 menit)
**[Tampilkan diagram arsitektur atau slide]**

### Script:
> "Tujuan dari aplikasi ini adalah untuk mengelola operasional perpustakaan secara digital, meliputi:
> 
> 1. **Pengelolaan Buku** - menambah, mengedit, menghapus, dan mencari buku
> 2. **Pengelolaan Anggota** - registrasi dan manajemen data anggota perpustakaan  
> 3. **Transaksi Peminjaman** - mencatat peminjaman dan pengembalian buku
> 4. **Dashboard Statistik** - melihat ringkasan data perpustakaan
> 
> Aplikasi ini cocok digunakan oleh pustakawan atau admin perpustakaan untuk mempermudah pencatatan."

---

## 1.3 Fitur Utama (1 menit)
**[Tampilkan list fitur atau screenshot aplikasi]**

### Script:
> "Fitur-fitur utama yang tersedia dalam aplikasi ini adalah:
> 
> **Di sisi Backend:**
> - REST API dengan Django REST Framework
> - Autentikasi menggunakan JWT Token
> - Dokumentasi API otomatis dengan Swagger
> - 3 Model database yang saling berelasi
> 
> **Di sisi Frontend:**
> - Halaman Login dengan validasi token
> - Dashboard dengan statistik real-time
> - CRUD lengkap untuk Buku, Anggota, dan Peminjaman
> - Desain modern dengan Dark Theme
> - Responsive untuk berbagai ukuran layar"

---

## 1.4 Alasan Pemilihan Arsitektur Decoupled (1.5 menit)
**[Tampilkan diagram arsitektur]**

### Script:
> "Saya memilih arsitektur **Decoupled** atau **pemisahan Backend-Frontend** karena beberapa alasan:
> 
> **Pertama, Separation of Concerns:**
> Backend hanya fokus menyediakan data melalui API, sedangkan Frontend fokus pada tampilan dan user experience. Ini membuat kode lebih terorganisir dan mudah di-maintain.
> 
> **Kedua, Fleksibilitas:**
> Dengan arsitektur ini, Frontend bisa diganti kapan saja tanpa mengubah Backend. Misalnya, kita bisa membuat aplikasi mobile yang menggunakan API yang sama.
> 
> **Ketiga, Skalabilitas:**
> Backend dan Frontend bisa di-deploy secara terpisah dan di-scale secara independen sesuai kebutuhan.
> 
> **Keempat, Tim Development:**
> Dalam tim besar, developer Backend dan Frontend bisa bekerja secara paralel tanpa saling menunggu.
> 
> **Komunikasi antar keduanya** menggunakan format **JSON** melalui **HTTP Request**, dengan autentikasi menggunakan **JWT Token**."

---

# BAGIAN 2: DEMO PROJECT (4-5 Menit)

## 2.1 Demo Halaman Login (1 menit)
**[Buka browser di http://localhost:3000]**

### Script sambil demo:
> "Sekarang saya akan mendemonstrasikan aplikasi yang sudah berjalan.
> 
> Ini adalah halaman Login dari LibraFlow. Desainnya menggunakan dark theme dengan gradient purple-blue yang modern.
> 
> Di sebelah kiri ada branding dan preview fitur, sedangkan di kanan ada form login.
> 
> Saya akan login menggunakan akun admin... 
> [Ketik username: admin, password: admin123]
> 
> Ketika login berhasil, sistem akan menyimpan JWT Token di browser dan mengarahkan ke Dashboard."

---

## 2.2 Demo Dashboard (45 detik)
**[Setelah login, tampilkan dashboard]**

### Script:
> "Ini adalah halaman Dashboard. Di sini kita bisa melihat statistik perpustakaan:
> - Total Buku yang tersedia
> - Total Anggota terdaftar
> - Buku yang sedang dipinjam
> - Buku yang tersedia
> 
> Di bawahnya ada daftar Peminjaman Aktif dan Quick Actions untuk akses cepat.
> 
> Data ini diambil secara real-time dari API Backend."

---

## 2.3 Demo CRUD Buku (1.5 menit)
**[Navigasi ke menu Daftar Buku]**

### Script:
> "Sekarang kita ke halaman Daftar Buku.
> 
> Di sini terlihat tabel semua buku dengan info judul, penulis, tahun, dan status ketersediaan.
> 
> **Fitur Pencarian:** [Ketik di search box]
> Saya bisa mencari buku berdasarkan judul atau penulis.
> 
> **Fitur Filter:** [Klik dropdown]
> Bisa filter buku yang tersedia atau yang sedang dipinjam.
> 
> **Tambah Buku:** [Klik tombol Tambah]
> Untuk menambah buku baru, saya klik tombol ini, isi form judul, penulis, dan tahun... lalu simpan.
> [Isi form dan submit]
> 
> **Edit Buku:** [Klik icon edit]
> Untuk mengedit, klik icon pensil... ubah data... dan simpan.
> 
> **Hapus Buku:** [Klik icon hapus]
> Untuk menghapus, klik icon tempat sampah, akan muncul konfirmasi, lalu klik Hapus.
> 
> Semua operasi ini berkomunikasi dengan API Backend menggunakan fetch request."

---

## 2.4 Demo CRUD Anggota (45 detik)
**[Navigasi ke menu Anggota]**

### Script:
> "Di halaman Anggota, tampilan menggunakan card-based layout.
> 
> Setiap card menampilkan nama, email, dan total peminjaman anggota tersebut.
> 
> Operasi CRUD sama seperti buku - bisa tambah, edit, dan hapus.
> [Demo satu operasi]"

---

## 2.5 Demo Peminjaman & Pengembalian (1 menit)
**[Navigasi ke menu Peminjaman]**

### Script:
> "Di halaman Peminjaman, kita bisa melihat semua transaksi peminjaman.
> 
> **Filter Status:** [Klik dropdown]
> Bisa filter berdasarkan status Aktif (sedang dipinjam) atau Selesai (sudah dikembalikan).
> 
> **Buat Peminjaman Baru:** [Klik tombol]
> Pilih buku yang tersedia, pilih anggota, tentukan tanggal pinjam, lalu proses.
> [Demo proses peminjaman]
> 
> **Kembalikan Buku:** [Klik icon undo]
> Untuk mengembalikan buku, klik tombol kembalikan. Status akan berubah menjadi 'Dikembalikan' dan tanggal kembali terisi otomatis.
> [Demo pengembalian]"

---

## 2.6 Demo Swagger API Documentation (30 detik)
**[Buka tab Swagger: http://127.0.0.1:8000/api/docs/]**

### Script:
> "Ini adalah dokumentasi API otomatis menggunakan Swagger UI dari drf-spectacular.
> 
> Semua endpoint terdokumentasi dengan lengkap - ada Authentication, Buku, Anggota, Peminjaman, dan Dashboard.
> 
> Developer bisa langsung test API dari sini dengan klik 'Try it out'.
> 
> Dokumentasi ini sangat membantu jika ada developer lain yang ingin mengintegrasikan dengan sistem kita."

---

# BAGIAN 3: PENJELASAN KODING (5-6 Menit)

## 3.1 Struktur Project (1 menit)
**[Buka VS Code, tampilkan folder structure]**

### Script:
> "Sekarang saya akan menjelaskan struktur koding project ini.
> 
> Project terbagi menjadi 2 bagian utama:
> 
> **1. Backend Django** - di folder `iventaris` dan `iventaris_app`
> **2. Frontend** - di folder `frontend`
> 
> Untuk Backend:
> - `iventaris/` berisi settings dan konfigurasi project
> - `iventaris_app/` berisi models, views, serializers, dan urls
> 
> Untuk Frontend:
> - `index.html` - struktur halaman
> - `styles.css` - styling dengan CSS modern
> - `app.js` - logika JavaScript untuk komunikasi API"

---

## 3.2 Penjelasan Models (1 menit)
**[Buka file models.py]**

### Script:
> "Di file `models.py`, saya mendefinisikan 3 model yang saling berelasi:
> 
> **Model Buku** - memiliki field judul, penulis, dan tahun.
> 
> **Model Anggota** - memiliki field nama dan email.
> 
> **Model Peminjaman** - ini yang menghubungkan Buku dan Anggota menggunakan ForeignKey.
> Ada field tanggal_pinjam, tanggal_kembali, dan status_peminjaman.
> 
> Relasi ini membentuk struktur: Satu buku bisa dipinjam oleh satu anggota, dan satu anggota bisa meminjam banyak buku."

[TUNJUKKAN KODE]:
```python
class Peminjaman(models.Model):
    buku = models.ForeignKey(Buku, on_delete=models.CASCADE)
    anggota = models.ForeignKey(Anggota, on_delete=models.CASCADE)
    tanggal_pinjam = models.DateField()
    tanggal_kembali = models.DateField(blank=True, null=True)
    status_peminjaman = models.CharField(...)
```

---

## 3.3 Penjelasan Serializers (1 menit)
**[Buka file serializers.py]**

### Script:
> "Serializers berfungsi untuk mengkonversi data Python menjadi format JSON dan sebaliknya.
> 
> Di sini saya membuat serializer untuk setiap model.
> 
> Yang menarik adalah **BukuSerializer** memiliki field tambahan `is_available` yang menghitung apakah buku sedang tersedia atau tidak.
> 
> Dan **PeminjamanSerializer** menyertakan detail buku dan anggota, tidak hanya ID saja, sehingga Frontend tidak perlu request tambahan."

[TUNJUKKAN KODE]:
```python
class BukuSerializer(serializers.ModelSerializer):
    is_available = serializers.SerializerMethodField()
    
    def get_is_available(self, obj):
        return not Peminjaman.objects.filter(
            buku=obj, 
            status_peminjaman='aktif'
        ).exists()
```

---

## 3.4 Penjelasan ViewSets & API (1.5 menit)
**[Buka file views.py]**

### Script:
> "Di file `views.py`, saya menggunakan **ModelViewSet** dari Django REST Framework.
> 
> ViewSet secara otomatis menyediakan operasi CRUD - list, create, retrieve, update, destroy.
> 
> Contoh **BukuViewSet**:
> - Saya override method `get_queryset` untuk menambahkan fitur search dan filter.
> - Parameter `?search=keyword` akan mencari di judul dan penulis.
> - Parameter `?available=true` akan filter buku yang tersedia saja.
> 
> Untuk **Authentication**, saya menggunakan permission `IsAuthenticatedOrReadOnly` - artinya untuk membaca data boleh tanpa login, tapi untuk create/update/delete harus login.
> 
> Ada juga custom action seperti `KembalikanPeminjamanAPIView` untuk proses pengembalian buku."

[TUNJUKKAN KODE]:
```python
class BukuViewSet(viewsets.ModelViewSet):
    queryset = Buku.objects.all()
    serializer_class = BukuSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Buku.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(judul__icontains=search) |
                Q(penulis__icontains=search)
            )
        return queryset
```

---

## 3.5 Penjelasan Settings & JWT (45 detik)
**[Buka file settings.py]**

### Script:
> "Di `settings.py`, saya menambahkan konfigurasi untuk:
> 
> **1. Django REST Framework** dengan default authentication JWT.
> 
> **2. SimpleJWT** untuk konfigurasi token - access token berlaku 1 jam, refresh token 1 hari.
> 
> **3. drf-spectacular** untuk generate dokumentasi Swagger otomatis.
> 
> **4. CORS Headers** agar Frontend bisa berkomunikasi dengan Backend yang berjalan di port berbeda."

[TUNJUKKAN KODE]:
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
```

---

## 3.6 Penjelasan Frontend & Arsitektur Decoupled (1 menit)
**[Buka file app.js]**

### Script:
> "Terakhir, di Frontend, semua komunikasi dengan Backend menggunakan **Fetch API**.
> 
> Saat login, Frontend mengirim username dan password ke endpoint `/api/auth/login/`.
> Jika berhasil, Backend mengembalikan JWT Token yang disimpan di localStorage.
> 
> Untuk setiap request berikutnya, token dikirim di header Authorization dengan format `Bearer <token>`.
> 
> Ini adalah implementasi **arsitektur Decoupled** yang sesungguhnya:
> - Backend tidak tahu siapa Frontend-nya
> - Frontend hanya bergantung pada API contract
> - Keduanya berkomunikasi murni melalui HTTP request dengan format JSON
> 
> Jika suatu saat kita ingin membuat aplikasi mobile, kita tinggal buat Frontend baru yang memanggil API yang sama."

[TUNJUKKAN KODE]:
```javascript
async function apiRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.accessToken}`,
    };
    
    const response = await fetch(url, { ...options, headers });
    return response;
}
```

---

## 3.7 Penutup (30 detik)       
**[Kembali ke tampilan awal atau slide penutup]**

### Script:
> "Demikian presentasi project UTS Framework saya - LibraFlow Sistem Manajemen Perpustakaan.
> 
> Aplikasi ini menerapkan arsitektur Decoupled dengan:
> - Backend Django REST Framework dengan JWT Authentication
> - Frontend Vanilla JavaScript yang berkomunikasi via JSON API
> - Dokumentasi Swagger yang otomatis
> 
> Terima kasih atas perhatiannya.
> 
> Wassalamualaikum warahmatullahi wabarakatuh."

---

# 📝 TIPS TAMBAHAN

## Editing Video:
1. Potong bagian yang terlalu lama atau ada kesalahan
2. Tambahkan teks/caption untuk memperjelas poin penting
3. Pastikan suara jernih dan tidak terlalu pelan
4. Tambahkan transisi antar bagian
5. Cek durasi akhir jangan lebih dari 15 menit

## Saat Presentasi:
1. Bicara dengan jelas dan tidak terlalu cepat
2. Jelaskan sambil menunjuk bagian yang relevan di layar
3. Hindari "ehm", "anu", "kayak gitu" terlalu banyak
4. Siapkan catatan kecil untuk poin-poin penting

## Pengaturan Rekam:
1. Resolusi: 1920x1080 (Full HD)
2. Frame rate: 30 fps
3. Audio: Clear, tidak ada noise
4. Font size di VS Code: Perbesar agar mudah dibaca

---

# ⏱️ TIME BREAKDOWN

| Bagian | Durasi | Kumulatif |
|--------|--------|-----------|
| 1.1 Pembukaan | 0:30 | 0:30 |
| 1.2 Tujuan Aplikasi | 1:00 | 1:30 |
| 1.3 Fitur Utama | 1:00 | 2:30 |
| 1.4 Arsitektur Decoupled | 1:30 | 4:00 |
| 2.1 Demo Login | 1:00 | 5:00 |
| 2.2 Demo Dashboard | 0:45 | 5:45 |
| 2.3 Demo CRUD Buku | 1:30 | 7:15 |
| 2.4 Demo CRUD Anggota | 0:45 | 8:00 |
| 2.5 Demo Peminjaman | 1:00 | 9:00 |
| 2.6 Demo Swagger | 0:30 | 9:30 |
| 3.1 Struktur Project | 1:00 | 10:30 |
| 3.2 Models | 1:00 | 11:30 |
| 3.3 Serializers | 1:00 | 12:30 |
| 3.4 ViewSets | 1:30 | 14:00 |
| 3.5 Settings & JWT | 0:45 | 14:45 |
| 3.6 Frontend | 1:00 | 15:45 |
| 3.7 Penutup | 0:30 | ~15:00* |

*Dengan editing, target 12-15 menit tercapai

---

Good luck dengan video presentasinya! 🎬
