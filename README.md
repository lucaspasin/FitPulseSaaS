# FitPulse SaaS — Multi-Tenant Fitness Management Platform

FitPulse SaaS is a platform for gyms, personal trainers, and fitness athletes. Built with a **Domain-Driven, Repository-Pattern Architecture following SOLID principles**, it features multi-tenant whitelabel branding, role-based access control, interactive workout prescription tools, automated PIX billing with auto-renewal, and a responsive mobile & desktop web interface.

---

## 🌟 Key System Features

### 1. 🛡️ Role-Based Portals & Single Unified Login (`/login`)
- **Super Admin (PO / Dev)**: Manage gym tenants, whitelabel themes, logos, banners, primary/secondary colors, and register trainers. Includes persistent demo profile switcher across all views.
- **Trainer Backoffice**:
  - Clean Student Directory with real-time search by Name, Email, or Category Tag.
  - Dedicated Student Management Drawer (Informações, Tagging, Active/Inactive status toggle).
  - Dual Expiring Sub-Tabs: **Treinos Próximos do Vencimento** (workout refresh alerts) and **Pagamentos Próximos do Vencimento** (billing alerts).
  - Segmented Collapsible Workout Plan Editor with direct Exercise Bank import.
  - Profile PIX configuration & student payment management.
- **Student App (Mobile & Web)**:
  - Auto-selects current weekday workout tab (e.g. Tuesday -> Força 2).
  - Visual day-by-day workout calendar timeline with "HOJE" badge.
  - Workout execution logging & workout history drawer.
  - Historical workout plan archive selector ("Ver Treinos Anteriores").
  - PIX payment widget with automatic payment blocking if >2 unpaid bills exist.

### 2. 💳 Smart PIX Billing & Auto-Renewal
- **Auto-Renewal on Payment**: Marking a payment as `PAID` automatically generates the next month's `PENDING` bill (`dueDate = +1 month`).
- **Auto-Generation on Due Date**: When a due date passes, the system automatically creates the next month's payment.
- **Financial Access Control**: If a student accumulates **more than 2 unpaid bills** (3 or more open payments), workout access is automatically blocked until payment is completed via PIX.

### 3. 🎨 Whitelabel Multi-Tenancy
- Custom branding per gym (Logo, Banner, Primary & Secondary CSS color variables).
- Whitelabel styling updates dynamically across header, buttons, and cards.

---

## 🔑 Test Credentials (Single Login Screen)

Access [http://localhost:3000/login](http://localhost:3000/login):

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@fitpulse.com` | `admin123` | Master tenant & gym management |
| **Trainer** | `treinador@dutra12.com` | `trainer123` | Coach backoffice & student prescriptions |
| **Student** | `lucas@pasin.com` | `student123` | Student mobile workout viewer |

---

## 🛠️ Tech Stack & SOLID Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS (v3 class-based dark mode), Lucide Icons, Vite
- **Backend**: Node.js, Express, TypeScript, JSON Web Tokens (JWT)
- **Repository Pattern**: `FileStorageAdapter` decoupling domain logic from persistent storage (`db.json` with auto-seeding on first launch)
- **Architecture**: Domain-Driven Design (DDD), Single Responsibility Principle (SRP), Dependency Inversion Principle (DIP)

---

## 🚀 Local Installation & Execution

```bash
# 1. Install all dependencies for root, backend, and frontend
npm install
npm --prefix backend install
npm --prefix frontend install

# 2. Build backend and frontend bundles
npm run build

# 3. Start local development servers (Backend on :4000, Frontend on :3000)
npm run dev
```

---

## 📦 CI/CD Deployment Pipeline

Automated CI/CD is configured using **GitHub Actions** in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

### Triggers:
- **Pull Requests** targeting `main` (`pull_request`)
- **Pushes** to `main` (`push`)

### Pipeline Execution Steps:
1. Checkout repository & setup Node.js 20.
2. Install root, backend, and frontend dependencies (`npm ci`).
3. Compile backend TypeScript & bundle Vite frontend (`npm run build`).
4. Upload production artifacts (`frontend/dist`).
5. Execute deployment workflow.
