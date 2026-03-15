# Business Manager

A comprehensive Pack-to-Order Retail System designed to handle inventory, billing, and order management for businesses. It provides a simple, modern interface for retail checkout and inventory management with role-based accessibility for multiple business tenants.

## 🚀 Features

- **Billing Terminal / Point of Sale (POS)**: A responsive, fast interface where users can search for items, manage a cart, and checkout instantly.
- **Inventory Management**: Add and manage the catalog of retail items and bulk products.
- **Invoice Generation**: Support for generating dynamic PDF invoices or snapshot-based Image receipts on checkout.
- **Authentication**: Secure JWT-based authentication flow using HttpOnly cookies to prevent Cross-Site Scripting (XSS) for multi-tenant business management.

## 💻 Tech Stack

### Frontend
- React 19 (Vite)
- Tailwind CSS (Styling)
- React Router DOM (Routing)
- Axios (HTTP Client)
- `html2canvas` (Image receipt generation)

### Backend
- Java 17 & Spring Boot
- MongoDB (spring-boot-starter-data-mongodb)
- Spring Security & JWT (`jjwt`) via HttpOnly Cookies
- OpenPDF (Backend PDF generation)
- Lombok

## 📁 Repository Structure

- `/Frontend`: Contains the Vite React application.
- `/Backend`: Contains the Spring Boot Maven backend application.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Java 17
- Maven
- MongoDB (Running locally or via Atlas)

### Running the Backend
1. Navigate to the Backend directory: `cd Backend`
2. Configure your `application.properties` (MongoDB URI, JWT secret).
3. Run the application: `./mvnw spring-boot:run`

### Running the Frontend
1. Navigate to the Frontend directory: `cd Frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
