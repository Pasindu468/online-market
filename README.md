# Online Market

A full-stack e-commerce application with a React/Vite frontend and Spring Boot backend. The app uses MySQL for product, customer, cart, order, wishlist, and review data.

## Features

- Product browsing and categories
- Customer registration and login
- Shopping cart and checkout/order history
- Wishlist
- Product ratings and customer reviews
- Admin product and order management
- Product image uploads

## Requirements

- Java 21
- MySQL 8 or a compatible MySQL server
- Node.js 20.19+ or 22.12+ (needed by the current Vite release)

## Local setup

### 1. Create the database

Create a MySQL database named `ecommerce_db`. The backend uses Hibernate `ddl-auto=update` to create/update application tables when it starts. Keep a database backup before changing or deleting data.

### 2. Configure backend credentials

For local development, copy `ecommerce-backend/application-local.example.properties` to `ecommerce-backend/application-local.properties`, then enter your MySQL password and a unique random JWT secret of at least 32 bytes. The local file is ignored by Git; never upload it. The current local project already has this ignored file configured.

You can instead supply `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` as environment variables in the backend terminal. Environment variables take priority over the local file. Do not commit real credentials.

### 3. Start the backend

In a terminal, from `ecommerce-backend`:

```powershell
.\mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`. Product uploads are stored under `ecommerce-backend/uploads/products` and are excluded from Git. Back up that folder separately if you need to preserve uploaded images.

### 4. Start the frontend

In a second terminal, from `ecommerce-frontend`:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The frontend currently calls the backend at `http://localhost:8080`.

## Useful frontend checks

```powershell
npm run lint
npm run build
```

## Security and deployment notes

This repository is a development project, not a production deployment recipe. Before deploying publicly, configure HTTPS, a production database and credentials, restricted CORS, secure authentication/session handling, backups, and a production image-storage strategy. Payment gateway integration is not included.
