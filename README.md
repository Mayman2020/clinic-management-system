# Clinic Management System

Enterprise clinic/medical center management platform.

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Spring Boot 3.2, Java 17 |
| Frontend | Angular 17, Material, Estate OS UI |
| Database | PostgreSQL + Flyway |
| Auth | JWT + RBAC |

## Quick Start

### 1. Full stack (Docker)

```powershell
cd clinic-management-system
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8082/api/v1 |
| PostgreSQL | localhost:5432 |

### 2. Database only (Docker)

```powershell
docker compose up -d postgres
```

PostgreSQL: `localhost:5432` — user `postgres`, password `admin`

### 3. Backend (local)

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
.\run-backend.ps1
```

API: http://localhost:8082/api/v1

Flyway creates schema `clinic_mgmt` and seed data automatically.

### 4. Frontend (local)

```powershell
.\run-frontend.ps1
```

App: http://localhost:4200

### Login

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

## Project Structure

```
clinic-management-system/
├── clinic-backend/     # Spring Boot API
├── clinic-frontend/    # Angular SPA
├── docker-compose.yml  # PostgreSQL
├── run-backend.ps1
├── run-frontend.ps1
└── CLINIC_IMPLEMENTATION_REPORT.md
```

## Environment Variables (Backend)

| Variable | Default |
|----------|---------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/postgres?currentSchema=clinic_mgmt` |
| `DB_USER` | `postgres` |
| `DB_PASS` | `admin` |
| `JWT_SECRET` | (see application.yml) |
| `UPLOAD_DIR` | `D:/clinic-files` |

## Build

```powershell
# Backend
cd clinic-backend
.\mvnw.cmd compile -DskipTests

# Frontend
cd clinic-frontend
npm install
npx ng build
```

## Modules

Patients, Doctors, Appointments, Queue, EMR/Consultation, Prescriptions, Lab, Radiology, Billing, Insurance, Reports, Users, Settings.

## License

Internal use.
