# Fullstack Docker Project (Node.js + PostgreSQL + Nginx Frontend)

A containerized fullstack starter project featuring a Node.js Express backend, PostgreSQL database, and a responsive frontend served via Nginx with reverse-proxying.

---

## 🏗️ Architecture

```
                 ┌────────────────────────────────┐
                 │          User Browser          │
                 └──────────────┬─────────────────┘
                                │ :3000
                                ▼
                 ┌────────────────────────────────┐
                 │       Frontend (Nginx)         │
                 │   Reverse-proxies /api/ calls  │
                 └──────────────┬─────────────────┘
                                │ :5000 (Internal Docker Network)
                                ▼
                 ┌────────────────────────────────┐
                 │      Backend (Node Express)    │
                 │    CRUD REST API & DB Pool     │
                 └──────────────┬─────────────────┘
                                │ :5432 (Internal Docker Network)
                                ▼
                 ┌────────────────────────────────┐
                 │     Database (PostgreSQL 16)   │
                 │       Persistent Volume        │
                 └────────────────────────────────┘
```

- **Frontend**: Lightweight HTML/CSS/JavaScript served via Nginx on port `3000`. Nginx automatically proxies API calls `/api/*` to the Node.js backend.
- **Backend**: Node.js & Express REST API on port `5000` with connection retry logic and automatic schema initialization.
- **Database**: PostgreSQL 16 on port `5432` with a persistent named volume (`postgres_data`) and health check.

---

## 📁 Project Structure

```
TestProject/
├── backend/
│   ├── src/
│   │   ├── db.js             # PostgreSQL connection pool & table setup
│   │   └── index.js          # Express app and REST routes
│   ├── .dockerignore
│   ├── Dockerfile            # Node.js Alpine image
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app.js            # Frontend logic (CRUD operations & health status)
│   │   ├── index.html        # App interface
│   │   └── style.css         # Modern styling & animations
│   ├── .dockerignore
│   ├── Dockerfile            # Nginx Alpine image
│   └── nginx.conf            # Nginx static file & reverse-proxy configuration
├── .env.example              # Environment variables template
├── .gitignore
├── docker-compose.yml        # Orchestration configuration
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Run with Docker Compose
From the project root directory, run:

```bash
docker-compose up --build
```
*(or `docker compose up --build` depending on your Docker installation)*

This will:
1. Pull `postgres:16-alpine` and initialize the database.
2. Wait for PostgreSQL to pass its health check.
3. Build and launch the Node.js backend on port `5000`.
4. Build and launch the Nginx frontend on port `3000`.

### 3. Open in Browser
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **PostgreSQL**: Accessible at `localhost:5432` (User: `postgres`, Password: `postgres`, DB: `testdb`)

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check backend & database connection status |
| `GET` | `/api/items` | Retrieve all items from PostgreSQL |
| `POST` | `/api/items` | Create a new item (`{"title": "..."}`) |
| `PUT` | `/api/items/:id` | Update completed status (`{"completed": true}`) |
| `DELETE` | `/api/items/:id` | Remove an item by ID |

---

## 🛑 Stopping the Application

To stop the containers:
```bash
docker-compose down
```

To stop and remove containers including the PostgreSQL database volume:
```bash
docker-compose down -v
```

