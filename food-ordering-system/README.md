# 🍴 ForkIt — Food Ordering System

A complete, production-ready food ordering web application built with **Spring Boot** (backend) and pure **HTML / CSS / JavaScript** (frontend).

---

## Project Structure

```
food-ordering-system/
└── backend/
    ├── pom.xml
    └── src/main/
        ├── java/com/foodorder/
        │   ├── FoodOrderingApplication.java       ← Entry point
        │   ├── config/
        │   │   ├── DataSeeder.java                ← Seeds 26 menu items on startup
        │   │   └── WebConfig.java                 ← CORS + static resource config
        │   ├── model/
        │   │   ├── MenuItem.java
        │   │   ├── Order.java
        │   │   └── OrderItem.java
        │   ├── repository/
        │   │   ├── MenuItemRepository.java
        │   │   └── OrderRepository.java
        │   ├── service/
        │   │   ├── MenuItemService.java
        │   │   └── OrderService.java
        │   └── controller/
        │       ├── MenuItemController.java
        │       └── OrderController.java
        └── resources/
            ├── application.properties
            └── static/
                ├── index.html                     ← Frontend SPA
                ├── css/style.css
                └── js/app.js
```

---

## Features

### Customer-facing
- 🍽️ **Browse menu** — 26 dishes across 8 categories (Burgers, Pizza, Pasta, Biryani, Chinese, Starters, Desserts, Drinks)
- 🔍 **Search & filter** — live search by dish name, filter by category tab, veg-only toggle
- 🛒 **Cart** — slide-in drawer, add/remove items, persisted in localStorage
- 📦 **Checkout** — customer details form, 3 payment options, special instructions
- 📋 **My Orders** — look up past orders by email
- 🚚 **Track Order** — visual step-by-step tracker by order ID

### Admin
- 👨‍💼 **Admin panel** — live table of all orders, update status inline via dropdown

---

## Prerequisites

| Tool        | Version  |
|-------------|----------|
| Java        | 17+      |
| Maven       | 3.8+     |

> No external database needed — uses **H2 in-memory** DB that auto-seeds on startup.

---

## Quick Start

```bash
# 1. Enter the backend directory
cd food-ordering-system/backend

# 2. Build and run
./mvnw spring-boot:run
# OR on Windows
mvnw.cmd spring-boot:run

# 3. Open browser
open http://localhost:8080
```

The app seeds 26 menu items automatically on first run.

---

## REST API Reference

### Menu Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/menu`                     | All available items      |
| GET    | `/api/menu/{id}`                | Single item by ID        |
| GET    | `/api/menu/category/{category}` | Items by category        |
| GET    | `/api/menu/popular`             | Popular items            |
| GET    | `/api/menu/search?keyword=`     | Search by name           |
| GET    | `/api/menu/categories`          | List all categories      |
| POST   | `/api/menu`                     | Create item (admin)      |
| PUT    | `/api/menu/{id}`                | Update item (admin)      |
| DELETE | `/api/menu/{id}`                | Delete item (admin)      |

### Order Endpoints

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| POST   | `/api/orders`                         | Place a new order        |
| GET    | `/api/orders`                         | All orders (admin)       |
| GET    | `/api/orders/{id}`                    | Order by ID              |
| GET    | `/api/orders/customer?email=`         | Orders by customer email |
| PUT    | `/api/orders/{id}/status`             | Update status (admin)    |
| PUT    | `/api/orders/{id}/cancel`             | Cancel order             |

### Order Statuses
`PENDING → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED`  
(or `CANCELLED` at any stage)

---

## Sample API Calls

```bash
# Place an order
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Arjun Menon",
    "customerEmail": "arjun@example.com",
    "customerPhone": "9876543210",
    "deliveryAddress": "12 Marine Drive, Kochi 682031",
    "paymentMethod": "UPI",
    "items": [
      { "menuItemId": 1, "quantity": 2 },
      { "menuItemId": 11, "quantity": 1 }
    ]
  }'

# Track order
curl http://localhost:8080/api/orders/1

# Update status (admin)
curl -X PUT http://localhost:8080/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'
```

---

## H2 Database Console

While the app is running, access the database at:
```
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:foodorderdb
Username: sa   (no password)
```

---

## Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Backend    | Spring Boot 3.2, Spring JPA |
| Database   | H2 (in-memory)              |
| Frontend   | HTML5, CSS3, Vanilla JS     |
| Fonts      | Fraunces + Inter (Google)   |
| Build      | Maven                       |

---

## Extending the Project

To use MySQL/PostgreSQL instead of H2:

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/foodorderdb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

Add the corresponding driver dependency to `pom.xml`.
