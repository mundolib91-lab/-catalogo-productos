# 📝 NOTAS DE DESARROLLO - Catálogo Productos Mundo Lib

**IMPORTANTE:** Este archivo se actualiza cada vez que se hacen cambios importantes en el proyecto.

---

## 🏗️ Arquitectura Actual

### Stack Tecnológico:
- **Frontend**: React + Vite + Tailwind CSS + PWA (Progressive Web App)
- **Backend**: Node.js + Express en Railway
- **Base de datos**: Supabase (PostgreSQL)
- **Almacenamiento de imágenes**: Cloudinary
- **Deploy**:
  - Frontend → Vercel: https://catalogo-productos-vert.vercel.app
  - Backend → Railway: https://catalogo-productos-production-9459.up.railway.app
  - Base de datos → Supabase: https://zpvtovhomaykvcowbtda.supabase.co

### Ramas Git:
- `master` → **PRODUCCIÓN** (lo que usan los usuarios finales)
- `dev` → **DESARROLLO** (para probar cambios sin afectar a usuarios)

---

## 🔧 Workflow de Desarrollo (Como en Flutter)

### Configuración actual:
- **Tu desarrollo local** → Usa backend de desarrollo en Railway
- **Usuarios finales** → Usan backend de producción en Railway
- **Base de datos Supabase** → Compartida (mismos datos en dev y prod)

### Para trabajar en nuevas funcionalidades:

```bash
# 1. Asegúrate de estar en rama dev
git checkout dev

# 2. Inicia el frontend local
cd frontend
npm run dev
# Se abrirá en: http://localhost:5173 o http://192.168.0.32:5173

# 3. Prueba en tu celular
# - Conéctate a la misma WiFi
# - Abre: http://192.168.0.32:5173
# - Instala la app desde el menú del navegador
# - El backend usa: https://catalogo-productos-development.up.railway.app/api

# 4. Cuando todo funcione bien, sube los cambios a dev
git add .
git commit -m "Descripción clara del cambio"
git push origin dev

# 5. (OPCIONAL) Verifica en preview deployment
# URL: https://catalogo-productos-git-dev-mundolib91-labs-projects.vercel.app
# Requiere autenticación de Vercel

# 6. Cuando esté 100% probado, pasar a producción
git checkout master
git merge dev
git push origin master
```

**IMPORTANTE:** Los cambios en `master` se despliegan automáticamente y afectan a todos los usuarios.

---

## ⚠️ TAREAS PENDIENTES

### Próximas funcionalidades a desarrollar:
- 📦 Vista de Inventario
- 🛒 Vista de Compras

### Mejoras técnicas:
- Considerar separar base de datos dev/prod si es necesario (actualmente compartida)
- Agregar tests automatizados
- Configurar CI/CD más robusto

---

## 📱 La PWA (Progressive Web App)

### Estructura:
La app es **UNA SOLA aplicación** con menú hamburguesa que contiene todas las vistas.

**Razón:** Mantener varias apps separadas sería muy tedioso de mantener.

### Vistas Activas:
- 📝 **Registro de Productos** - Para ingresar nuevos productos al inventario
- 👥 **Atención al Cliente** - Para gestionar ventas y consultas

### Vistas Planeadas:
- 📦 **Inventario** (Próximamente)
- 🛒 **Compras** (Próximamente)

### Características:
- ✅ **Responsive**: En celulares muestra menú hamburguesa, en PC menú lateral fijo
- ✅ **Instalable**: Se puede instalar en celular como una app nativa
- ✅ **Funciona offline**: Caché para datos y assets
- ✅ **Iconos personalizados**: 192x192 y 512x512 configurados
- ✅ **Service Workers**: Para caché y actualizaciones automáticas

---

## 📲 Cómo Instalar la App en Celular

### Tendrás 2 apps instaladas en tu celular:

#### 1. 📱 App de PRODUCCIÓN (usuarios finales)
- **URL**: `https://catalogo-productos-vert.vercel.app`
- **Ícono**: Amarillo con "R" (Registro)
- **Nombre sugerido**: "Mundo Lib"
- **Uso**: La que usan los demás usuarios, siempre funciona bien

#### 2. 🔧 App de DESARROLLO (solo para ti)
- **URL**: `http://192.168.0.32:5173` (requiere estar en WiFi)
- **Ícono**: Amarillo con "R" (igual, pero es otra app)
- **Nombre sugerido**: "Mundo Lib DEV"
- **Uso**: Para probar cambios antes de subirlos a producción
- **Nota**: Si tu PC está apagada o no estás en WiFi, esta app no funcionará

### Instalación en Android:
1. Abrir la URL en Chrome
2. Tocar el menú ⋮ (tres puntos)
3. Seleccionar "Instalar aplicación" o "Agregar a pantalla de inicio"
4. Confirmar "Instalar"
5. La app aparece en la pantalla de inicio con su icono

### Instalación en iPhone:
1. Abrir la URL en Safari
2. Tocar botón de Compartir (cuadrado con flecha hacia arriba)
3. Desplazarse y tocar "Agregar a pantalla de inicio"
4. Confirmar "Agregar"
5. La app aparece en la pantalla de inicio

### Características de la app instalada:
- ✅ Ícono propio en pantalla de inicio (amarillo con "R")
- ✅ Se abre en pantalla completa (sin barra de navegador)
- ✅ Aparece en el cajón de aplicaciones
- ✅ Funciona offline con caché
- ✅ Se actualiza automáticamente cuando hay cambios

---

## 🚀 URLs Importantes

### 🟢 Producción (rama master):
- **Frontend**: https://catalogo-productos-vert.vercel.app
- **Backend API**: https://catalogo-productos-production-9459.up.railway.app/api
- **Base de datos**: Supabase (compartida con desarrollo)
- **Uso**: Lo que usan los usuarios finales

### 🟡 Desarrollo (rama dev):
- **Frontend Local**: http://192.168.0.32:5173 (para probar en celular vía WiFi)
- **Frontend Preview**: https://catalogo-productos-git-dev-mundolib91-labs-projects.vercel.app (requiere auth)
- **Backend API**: https://catalogo-productos-development.up.railway.app/api
- **Base de datos**: Supabase (compartida con producción)
- **Uso**: Para probar cambios sin afectar usuarios

### 🔧 Dashboards:
- **GitHub**: https://github.com/mundolib91-lab/-catalogo-productos
- **Vercel**: https://vercel.com/dashboard
- **Railway**: https://railway.app
- **Supabase**: https://supabase.com/dashboard
- **Cloudinary**: https://cloudinary.com/console

### 💻 Desarrollo local:
- **Frontend dev**: http://localhost:5173 o http://192.168.0.32:5173
- **Backend dev**: http://localhost:5000 (opcional, puede usar Railway)

---

## 🔐 Variables de Entorno

### Frontend LOCAL (`frontend/.env`):
```env
# Tu desarrollo local usa el backend de DESARROLLO
VITE_API_URL=https://catalogo-productos-development.up.railway.app/api
VITE_SUPABASE_URL=https://zpvtovhomaykvcowbtda.supabase.co
VITE_SUPABASE_ANON_KEY=[Tu clave de Supabase]
VITE_CLOUDINARY_CLOUD_NAME=ddkuwch5y
VITE_CLOUDINARY_UPLOAD_PRESET=productos-mundolib
```

**Nota:** Este archivo NO se sube a Git (está en .gitignore). Cada desarrollador puede tener su propia configuración.

### Backend (`backend/.env`):
```env
SUPABASE_URL=https://zpvtovhomaykvcowbtda.supabase.co
SUPABASE_ANON_KEY=[Tu clave de Supabase]
PORT=5000
```

**IMPORTANTE:** Las variables de entorno en Vercel y Railway deben estar configuradas en sus respectivos dashboards.

---

## 💡 Recordatorios Importantes

1. **Siempre trabajar en rama `dev`** para cambios nuevos
2. **Solo hacer merge a `master`** cuando todo esté probado y funcione
3. **El backend ya está en Railway** - NO necesitas tenerlo corriendo localmente (aunque puedes para desarrollo)
4. **Los cambios en `master`** se despliegan automáticamente y afectan a todos los usuarios
5. **Claude Code NO recuerda** conversaciones anteriores, pero puede leer este archivo
6. **Antes de cerrar VS Code**, actualiza este archivo si hiciste cambios importantes
7. **La app funciona como PWA** - los usuarios la instalan desde el navegador
8. **Cloudinary** maneja las imágenes (no Supabase Storage por problemas de permisos)

---

## 🎯 Decisiones Técnicas Importantes

### ¿Por qué Cloudinary y NO Supabase Storage?

**Problema encontrado:**
- Supabase Storage tenía problemas con políticas y permisos
- Era complicado configurar el acceso público/privado
- Batallamos ~30 minutos intentando que funcionara

**Solución adoptada:**
- ✅ Usar **Cloudinary** para almacenamiento de imágenes
- ✅ Más simple de configurar
- ✅ Upload directo desde el frontend
- ✅ Transformaciones de imagen incluidas
- ✅ Preset configurado: `productos-mundolib`

**IMPORTANTE:** Si en el futuro Claude sugiere usar Supabase Storage, recordarle esta decisión.

---

## 🐛 Problemas Conocidos y Soluciones

### "No se puede conectar al servidor":
- Verificar que Railway esté funcionando
- Revisar variables de entorno en Vercel
- Verificar CORS en el backend

### "La app no se actualiza":
- Cerrar completamente la app instalada
- Volver a abrir
- Si persiste, desinstalar y reinstalar

### "No veo la opción de instalar":
- Asegurarse de usar HTTPS en producción
- En Safari (iPhone) usar el botón de Compartir
- En Chrome (Android) buscar en menú "Instalar app"

### "Error al subir imágenes":
- ✅ Usar Cloudinary (NO Supabase Storage)
- Verificar que `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET` estén configurados
- Verificar que el preset en Cloudinary esté en modo "unsigned"

---

## 📚 Recursos y Documentación

- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app/
- **PWA Guide**: https://web.dev/progressive-web-apps/

---

**Última actualización:** 2026-01-24
**Rama actual al guardar:** dev
**Cambios recientes:**
- ✅ Configuración completa de environments dev/prod
- ✅ Railway: 2 environments (production y development)
- ✅ Vercel: Variables de entorno separadas por ambiente
- ✅ `.env` local configurado para usar backend de desarrollo
- ✅ Workflow de desarrollo documentado
