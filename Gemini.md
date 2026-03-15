# AI Development Guide: Business Manager

This document outlines the architectural patterns, technology stack, folder structure, and coding standards used in the Business Manager project. AI assistants and developers should refer to this guide to maintain consistency during future development.

## 1. Tech Stack Overview
- **Frontend**: React 19, Vite, Tailwind CSS, React Router DOM, Axios
- **Backend**: Java 17, Spring Boot, MongoDB (Spring Data MongoDB), Spring Security (JWT-based), OpenPDF

## 2. Organized Folder Structure
### Frontend (`/Frontend/src/`)
- `components/`: Reusable, generic UI components (e.g., `Navbar`, `ReceiptTemplate`).
- `pages/`: Full-page views mapped to specific routes (e.g., `Login`, `Inventory`, `Billing`).
- `services/`: API integration layer. All external calls to the backend reside here (e.g., `api.js`).
- `assets/`: Static assets like images, icons, or global stylesheets.

### Backend (`/Backend/src/main/java/com/business/manager/`)
- `controller/`: REST API endpoints. Controllers should be lean and only handle HTTP routing and request/response mapping.
- `service/`: Core business logic layer.
- `model/`: MongoDB document entities. Use Lombok (`@Data`, etc.) to reduce boilerplate.
- `repository/`: Spring Data MongoDB repository interfaces.
- `config/`: Configuration files (e.g., Security, CORS, JWT filters).
- `util/`: Helper functions and utility classes.

## 3. Existing Techniques & Patterns
### Frontend
- **Functional Components & Hooks**: Strict adherence to functional components utilizing React hooks (`useState`, `useEffect`).
- **Tailwind for Styling**: Use Tailwind CSS utility classes instead of traditional CSS files. Maintain the current clean, responsive, and modern design aesthetic.
- **API Extraction**: Do not write `fetch` or `axios` calls directly within UI components. Always abstract them to `src/services/api.js`.
- **Token Management**: JWTs are managed seamlessly via secure HttpOnly cookies set by the backend. The frontend relies on these cookies for authenticated API requests instead of `localStorage`.

### Backend
- **Stateless Authentication**: The API secures endpoints using HttpOnly cookies (`jwt`). The cookie is utilized to extract the `businessId` and validate tenant boundaries, preventing XSS vulnerabilities.
- **Lombok**: Extensive use of `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor` to keep standard classes clean.
- **Service Layer Abstraction**: Controllers delegate logic (such as stock reduction on finalizing an order or complex PDF generation) to the `Service` classes.
- **Predictable Error Handling**: Catch domain-specific exceptions in the Service layer or Controller and return appropriate standard HTTP response entities (e.g., `ResponseEntity.badRequest()`).

## 4. Future Development Guidelines
1. **Adding a New Feature (Vertical Slice)**:
   - **Backend**: Define the `Model`, build the `Repository`, write the logic in the `Service`, and expose it via the `Controller`.
   - **Frontend**: Add new endpoints in `services/api.js`, create generic UI components in `components/`, and build the interface in `pages/`. Tie it to routing in `App.jsx`.
2. **Security & Multi-Tenancy**: Ensure any new endpoints that affect tenant data explicitly extract the `businessId` using `@CookieValue("jwt")` and the `JwtUtil` to maintain strict tenant boundaries.
3. **Future Architecture (Refresh Tokens)**: Currently, the system uses a single 10-hour JWT HttpOnly cookie. For future scaling and strict security, implement a dual-token architecture (short-lived Access Token in memory/React state, and long-lived Refresh Token in an HttpOnly cookie) to silently re-authenticate users without forcing frequent logins.
4. **Styling & UI**: Stick to the current light theme with primary colors. Ensure interactive elements share the established dynamic hover and transition effects.
5. **Clean Code**: Do not override existing architectural decisions unless restructuring the entire app. Keep methods small and purposeful.
