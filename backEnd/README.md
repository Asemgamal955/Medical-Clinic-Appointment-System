# API Endpoints Overview

This document outlines all **20 available API endpoints** grouped by module for easy reference.  
Each endpoint includes its HTTP method, path, and a brief description.

---

## Authentication Endpoints (3)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | `/api/auth/register` | Register a new user |
| **POST** | `/api/auth/login` | Login user |
| **GET**  | `/api/auth/profile` | Get authenticated user profile |

---

##  Appointment Endpoints (6)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | `/api/appointments` | Create appointment |
| **GET**  | `/api/appointments` | Get all appointments |
| **GET**  | `/api/appointments/:id` | Get a single appointment |
| **PATCH** | `/api/appointments/:id/cancel` | Cancel appointment |
| **PATCH** | `/api/appointments/:id/status` | Update appointment status |
| **DELETE** | `/api/appointments/:id` | Delete appointment |

---

##  Doctor Endpoints (4)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **GET** | `/api/doctors` | Get all doctors |
| **GET** | `/api/doctors/schedule` | Get doctor schedule |
| **POST** | `/api/doctors/medical-records` | Add patient medical record |
| **GET** | `/api/doctors/patients/:patientId/records` | Get records for specific patient |

---

## Patient Endpoints (2)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **GET** | `/api/patients/medical-records` | Get my medical records |
| **PATCH** | `/api/patients/profile` | Update patient profile |

---

##  Admin Endpoints (4)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **GET** | `/api/admin/users` | Get all users |
| **DELETE** | `/api/admin/users/:id` | Delete user |
| **GET** | `/api/admin/statistics` | Get system statistics |
| **GET** | `/api/admin/reports/appointments` | Get appointments report |


