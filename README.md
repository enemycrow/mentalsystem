# MentalSystem

Transforma tus objetivos en sistemas inevitables.

App web (PWA) que te ayuda a trabajar tus objetivos mediante el diseño de sistemas, basada en el framework de 3 preguntas para desbloquear objetivos difíciles.

## Cómo funciona

1. **Define tu objetivo** — Describe qué quieres lograr y por qué te está costando
2. **Responde 3 preguntas** — Identifica el sistema actual, reduce la fricción y diseña un sistema inevitable
3. **Diseña tu sistema** — Define elementos, interacciones y propósito para que tus resultados sean automáticos

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Vite + React + TypeScript |
| Backend | PHP 8+ REST API |
| Base de datos | MySQL |
| Auth | JWT (HMAC-SHA256) |
| PWA | Service Worker + manifest.json |

## Estructura

```
mentalsystem/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/   # Auth, Layout, Objectives, Reflection, System, Promotion
│   │   ├── pages/        # Home, Dashboard, NewObjective, ObjectiveDetail, Login, Register
│   │   ├── context/      # AuthContext
│   │   ├── hooks/        # useAuth, useApi
│   │   └── services/     # API client
│   └── public/           # PWA assets
└── backend/           # PHP API
    ├── api/
    │   ├── auth/         # login, register, me
    │   ├── objectives/   # CRUD
    │   └── systems/      # GET, PUT
    ├── config/           # database, cors
    ├── middleware/        # JWT auth
    └── schema.sql        # DB schema
```

## Desarrollo local

### Requisitos

- Node.js 20+
- PHP 8+
- MySQL 5.7+

### Setup

```bash
# 1. Clonar el repo
git clone https://github.com/enemycrow/mentalsystem.git
cd mentalsystem

# 2. Importar la base de datos
mysql -u root -p < backend/schema.sql

# 3. Configurar credenciales de DB
# Editar backend/config/database.php o setear variables de entorno:
# DB_HOST, DB_NAME, DB_USER, DB_PASS

# 4. Iniciar backend (puerto 8000)
php -S localhost:8000 -t backend

# 5. Iniciar frontend (puerto 5173)
cd frontend
npm install
npm run dev
```

La app estará disponible en `http://localhost:5173`

### Build para producción

```bash
cd frontend
npm run build
# Output en frontend/dist/
```

## API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario actual |

### Objectives
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/objectives/` | Listar objetivos |
| POST | `/api/objectives/` | Crear objetivo completo |
| GET | `/api/objectives/show?id=X` | Ver detalle |
| PUT | `/api/objectives/update` | Actualizar |
| DELETE | `/api/objectives/delete?id=X` | Eliminar |

### Systems
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/systems/?objective_id=X` | Ver sistema |
| PUT | `/api/systems/update` | Actualizar sistema |

Todos los endpoints (excepto auth) requieren header `Authorization: Bearer <token>`.

## Base de datos

6 tablas con relaciones cascade:

```
users → objectives → reflections
                  → systems → system_elements
                            → system_interactions
```

## Licencia

MIT License — ver [LICENSE](LICENSE)
