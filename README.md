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

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, hosted on **Azure Static Web Apps (Free)**
- **Backend**: Node.js, Express, TypeScript, JWT + bcrypt, hosted on **Azure Container Apps (Consumption, scale to zero)**
- **Database**: PostgreSQL via Prisma (`PrismaStorageAdapter` behind `IStorageAdapter`)
- **Architecture**: Domain-Driven Design, Repository Pattern, Dependency Inversion (services never import Prisma or Express)

---

## 🚀 Local Installation & Execution

```bash
# 1. Install dependencies
npm install
npm --prefix backend install
npm --prefix frontend install

# 2. Start PostgreSQL (Docker)
npm run db:up

# 3. Copy backend env if needed, then migrate + seed
copy backend\.env.example backend\.env
npm run db:migrate
npm run db:seed

# 4. Start API (:4000) + Vite (:3000, proxies /api)
npm run dev
```

Alternatively run the full stack with Docker:

```bash
docker compose up --build
```

---

## 📦 CI/CD & low-cost Azure go-live

The SPA deploys to **Azure Static Web Apps (Free)**. The API runs on **Azure Container Apps (Consumption, scale to zero)**. Postgres is **not** on Azure for now — use **[Neon Free](https://console.neon.tech)** (no credit card, scale to zero after 5 minutes). Move to Azure Database for PostgreSQL later when you want data residency or paid SLAs.

Approximate staging cost: **$0** while idle (SWA Free + Container Apps free grant + Neon Free). First request after idle can take a few seconds (Neon + API cold start).

### 1. Create the free database
1. Sign up at [console.neon.tech](https://console.neon.tech) (Free plan).
2. Create a project (region close to Brazil, e.g. a US East or São Paulo if listed).
3. Copy the **connection string**. Prefer the **pooled** host (`-pooler` in the hostname). It looks like `postgresql://...@ep-....neon.tech/neondb?sslmode=require`.

### 2. Push the API image
Merge to `main` (or run **Deploy FitPulse API**). The image is published to `ghcr.io/<you>/fitpulse-api`. Make that package **public**, or attach GHCR credentials to the Container App.

### 3. Provision Azure API (once)
Install [Azure CLI](https://aka.ms/azure-cli), then:

```powershell
az login
.\scripts\azure-provision.ps1 -DatabaseUrl "postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

### 4. GitHub configuration
- Secret `VITE_API_URL` = Container App URL from the script (no trailing slash)
- Secret `AZURE_CREDENTIALS` = `az ad sp create-for-rbac ... --sdk-auth`
- Variable `AZURE_RESOURCE_GROUP` = `rg-fitpulse-staging`
- Variable `AZURE_CONTAINER_APP` = `ca-fitpulse-api`

After `VITE_API_URL` is set, a push to `main` rebuilds the SWA frontend so the browser calls the real API.

Staging demo logins only work after the API has seeded (`SEED_ON_START=true`).
