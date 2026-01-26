# 📦 Sistema Multi-Tienda - Catálogo de Productos

Sistema de gestión de inventario multi-tienda con 3 aplicaciones PWA independientes que comparten backend y componentes.

## 🏗️ Estructura del Proyecto

```
catalogo-productos/
├── apps/                    # Aplicaciones frontend (PWAs)
│   ├── mundolib-app/       # 🟡 Mundo Lib
│   ├── majoli-app/         # 🌸 Majoli
│   └── lili-app/           # 💜 Lili Cosméticos
├── shared/                  # Componentes compartidos
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utilidades (api.js)
├── backend/                 # Backend Express + Supabase
│   └── server.js
└── database/               # Migraciones SQL
    └── migrations/
```

## 🎨 Apps por Tienda

### 🟡 Mundo Lib
- **Ubicación**: `apps/mundolib-app/`
- **Color**: Amarillo (amber-500: `#f59e0b`)
- **Stock**: `stock_mundo_lib`
- **Config**: `apps/mundolib-app/src/config.js`

### 🌸 Majoli
- **Ubicación**: `apps/majoli-app/`
- **Color**: Rosa (pink-500: `#ec4899`)
- **Stock**: `stock_majoli`
- **Config**: `apps/majoli-app/src/config.js`

### 💜 Lili Cosméticos
- **Ubicación**: `apps/lili-app/`
- **Color**: Morado (purple-500: `#a855f7`)
- **Stock**: `stock_lili`
- **Config**: `apps/lili-app/src/config.js`

## 🚀 Desarrollo Local

### Backend
```bash
cd backend
npm install
npm run dev  # Puerto 3000
```

### Frontend (cualquier app)
```bash
cd apps/mundolib-app  # o majoli-app, lili-app
npm install
npm run dev           # Puerto 5173
```

## 📝 Variables de Entorno

Cada app necesita un archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

## 🗄️ Base de Datos

Sistema multi-tienda con campos de stock por tienda:
- `stock_mundo_lib` - Stock de Mundo Lib
- `stock_majoli` - Stock de Majoli
- `stock_lili` - Stock de Lili Cosméticos
- `stock_total` - Suma automática (campo calculado)

### Transferencias
Tabla `transferencias` registra movimientos entre tiendas.

### Faltantes
Tabla `faltantes` incluye campo `tienda` para filtrar por tienda.

## 🎯 Características

- ✅ 3 PWAs independientes con branding único
- ✅ Stock separado por tienda
- ✅ Sistema de transferencias entre tiendas
- ✅ Faltantes filtrados por tienda
- ✅ Backend único multi-tenant
- ✅ Componentes compartidos (monorepo)
- ✅ Dark mode en todas las apps
- ✅ Responsive (móvil y desktop)

## 📱 Deploy

**Frontend (Vercel)**: 3 proyectos separados
- mundolib-app → mundolib.vercel.app
- majoli-app → majoli.vercel.app
- lili-app → lili.vercel.app

**Backend (Railway)**: 1 servidor único
- Servidor Express en Railway (~$7/mes)

**Database**: Supabase (free tier)

**Images**: Cloudinary (free tier)

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + Vite + TailwindCSS
- **Backend**: Express.js + Supabase
- **Database**: PostgreSQL (Supabase)
- **Storage**: Cloudinary
- **Deploy**: Vercel (frontend) + Railway (backend)
