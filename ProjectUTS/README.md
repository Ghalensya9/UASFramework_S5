# 📚 LibraFlow - Sistem Manajemen Perpustakaan

Sistem aplikasi web pemisahan Backend (Django REST Framework) dan Frontend (Vanilla HTML/CSS/JS) untuk UTS Framework.

---

## 🚀 Fitur Utama

### Backend (Django REST Framework)
- ✅ **3 Model Berelasi**: Buku, Anggota, Peminjaman
- ✅ **JWT Authentication**: Login dengan SimpleJWT
- ✅ **CRUD API**: Create, Read, Update, Delete untuk semua entitas
- ✅ **Swagger Documentation**: Dokumentasi API interaktif via drf-spectacular
- ✅ **Filtering & Search**: Filter dan pencarian data

### Frontend (Vanilla JavaScript)
- ✅ **Halaman Login**: Autentikasi dengan JWT Token
- ✅ **Dashboard**: Statistik perpustakaan
- ✅ **CRUD Buku**: Kelola koleksi buku
- ✅ **CRUD Anggota**: Kelola data anggota
- ✅ **CRUD Peminjaman**: Kelola transaksi peminjaman
- ✅ **Modern UI**: Dark theme, gradients, animasi

---

## 🛠️ Cara Menjalankan

### 1. Install Dependencies
```bash
cd ProjectUTS
.\env\Scripts\activate
pip install -r requirements.txt
```

### 2. Jalankan Migrations
```bash
python manage.py migrate
```

### 3. Buat Superuser (Opsional)
```bash
python manage.py createsuperuser
```

Atau gunakan akun default:
- **Username**: `admin`
- **Password**: `admin123`

### 4. Jalankan Backend Server
```bash
python manage.py runserver
```
Backend berjalan di: `http://127.0.0.1:8000`

### 5. Jalankan Frontend Server
Buka terminal baru:
```bash
cd frontend
python -m http.server 3000
```
Frontend berjalan di: `http://localhost:3000`

---

## 📖 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login/` | Login, mendapatkan JWT Token |
| POST | `/api/auth/refresh/` | Refresh access token |
| POST | `/api/auth/register/` | Registrasi user baru |
| GET | `/api/auth/profile/` | Profil user yang login |

### Buku
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/buku/` | Daftar semua buku |
| POST | `/api/buku/` | Tambah buku baru |
| GET | `/api/buku/{id}/` | Detail buku |
| PUT | `/api/buku/{id}/` | Update buku |
| DELETE | `/api/buku/{id}/` | Hapus buku |

**Query Parameters:**
- `?search=keyword` - Cari berdasarkan judul/penulis
- `?available=true` - Filter buku tersedia

### Anggota
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/anggota/` | Daftar semua anggota |
| POST | `/api/anggota/` | Tambah anggota baru |
| GET | `/api/anggota/{id}/` | Detail anggota |
| PUT | `/api/anggota/{id}/` | Update anggota |
| DELETE | `/api/anggota/{id}/` | Hapus anggota |
| GET | `/api/anggota/{id}/riwayat/` | Riwayat peminjaman anggota |

**Query Parameters:**
- `?search=keyword` - Cari berdasarkan nama/email

### Peminjaman
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/peminjaman/` | Daftar semua peminjaman |
| POST | `/api/peminjaman/` | Buat peminjaman baru |
| GET | `/api/peminjaman/{id}/` | Detail peminjaman |
| PUT | `/api/peminjaman/{id}/` | Update peminjaman |
| DELETE | `/api/peminjaman/{id}/` | Hapus peminjaman |
| POST | `/api/peminjaman/{id}/kembalikan/` | Kembalikan buku |

**Query Parameters:**
- `?status=aktif` atau `?status=selesai` - Filter berdasarkan status
- `?anggota=id` - Filter berdasarkan anggota
- `?buku=id` - Filter berdasarkan buku

### Dashboard
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/dashboard/` | Statistik perpustakaan |

### Dokumentasi API
| URL | Deskripsi |
|-----|-----------|
| `/api/docs/` | Swagger UI (interaktif) |
| `/api/redoc/` | ReDoc documentation |
| `/api/schema/` | OpenAPI JSON schema |

---

## 📁 Struktur Proyek

```
ProjectUTS/
├── iventaris/                 # Django project settings
│   ├── settings.py           # Konfigurasi Django + DRF + JWT
│   ├── urls.py               # URL routing utama
│   └── ...
├── iventaris_app/            # Django app
│   ├── models.py             # Model: Buku, Anggota, Peminjaman
│   ├── serializers.py        # DRF Serializers
│   ├── views.py              # API ViewSets + Template Views
│   ├── api_urls.py           # API URL routing
│   ├── urls.py               # Template URL routing
│   └── templates/            # Django templates
├── frontend/                 # Frontend (Vanilla JS)
│   ├── index.html            # Halaman utama
│   ├── styles.css            # CSS styling
│   └── app.js                # JavaScript logic
├── requirements.txt          # Python dependencies
└── manage.py
```

---

## 🔐 Contoh Penggunaan API

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1..."
}
```

### Tambah Buku (dengan Token)
```bash
curl -X POST http://127.0.0.1:8000/api/buku/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"judul": "Pemrograman Python", "penulis": "John Doe", "tahun": 2024}'
```

### Buat Peminjaman
```bash
curl -X POST http://127.0.0.1:8000/api/peminjaman/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"buku": 1, "anggota": 1, "tanggal_pinjam": "2026-01-29"}'
```

---

## 📊 Model Database

### Buku
| Field | Type | Deskripsi |
|-------|------|-----------|
| id | AutoField | Primary key |
| judul | CharField(120) | Judul buku |
| penulis | CharField(100) | Nama penulis |
| tahun | IntegerField | Tahun terbit |

### Anggota
| Field | Type | Deskripsi |
|-------|------|-----------|
| id | AutoField | Primary key |
| nama | CharField(100) | Nama lengkap |
| email | EmailField | Alamat email |

### Peminjaman
| Field | Type | Deskripsi |
|-------|------|-----------|
| id | AutoField | Primary key |
| buku | ForeignKey(Buku) | Referensi ke buku |
| anggota | ForeignKey(Anggota) | Referensi ke anggota |
| tanggal_pinjam | DateField | Tanggal peminjaman |
| tanggal_kembali | DateField (nullable) | Tanggal pengembalian |
| status_peminjaman | CharField | 'aktif' atau 'selesai' |

---

## 🎨 Screenshot Frontend

Frontend menggunakan design modern dengan:
- Dark theme dengan warna primary purple-blue gradient
- Card-based layout untuk dashboard
- Responsive design untuk mobile
- Animasi dan transisi halus
- Toast notifications
- Modal forms untuk CRUD operations

---

## 📝 Dependencies

```
Django==5.2.8
djangorestframework==3.16.1
djangorestframework-simplejwt==5.3.1
drf-spectacular==0.27.1
django-cors-headers==4.3.1
```

---

## 👤 Author

UTS Framework - Sistem Manajemen Perpustakaan Digital

---

## 📄 License

MIT License
