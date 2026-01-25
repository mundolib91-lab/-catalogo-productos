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

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 🎉 Sistema de Reportes de Faltantes (✅ COMPLETADO Y EN PRODUCCIÓN):

**SESIÓN 1 (✅ Completada):**
- ✅ Tabla `faltantes` en Supabase
- ✅ Tabla `faltantes_historial` para timeline
- ✅ Botón flotante [+] en Vista Atención
- ✅ Menú emergente con 2 opciones (Producto Nuevo / Grupo Repisa)

**SESIÓN 2 (✅ Completada):**
- ✅ Formulario Producto Nuevo (foto + descripción + prioridad + notas)
- ✅ Formulario Grupo/Repisa (foto repisa + descripción + prioridad)
- ✅ Botón "Reportar" en cada card de producto (Tipo 1: Existente)
- ✅ Endpoints backend para crear faltantes (POST, GET, PUT)
- ✅ Fix: Corregido nombre de prop onImagenCambiada en SelectorImagen

**SESIÓN 3 (✅ Completada):**
- ✅ Vista Central Faltantes (gestión completa)
- ✅ Estados: Reportado → Verificación → Confirmado → Compras → Pedido → Recibido → Archivado
- ✅ Tabs de navegación por estados con contadores
- ✅ Filtros por tipo, origen y prioridad
- ✅ Cambio manual de estados con botón
- ✅ Cards con badges informativos y cálculo de tiempo en estado
- ✅ Integración en App.jsx y MenuHamburguesa.jsx

**Mejoras adicionales (✅ Completadas):**
- ✅ FormularioReportarExistente: Modal de confirmación al reportar productos existentes
- ✅ Selección de prioridad y notas al reportar
- ✅ Colores invertidos: Verde (disponible) → Rojo suave (reportado)
- ✅ Columnas `faltante_reportado` y `fecha_reporte_faltante` en tabla productos
- ✅ **DESPLEGADO EN PRODUCCIÓN** - Sistema completo funcional

**Cómo usar el sistema:**
1. **Reportar desde Atención:** Botón [+] azul → Elegir tipo → Llenar formulario
2. **Gestionar en Central:** Menú → Central Faltantes → Ver por estados → Cambiar estados
3. **3 tipos de faltantes:** Existente (con foto), Nuevo (sin registro), Grupo (repisa completa)

---

## ⚙️ GESTIÓN DE PROVEEDORES Y MARCAS (✅ COMPLETADO):

### Problema identificado:
- Typos y errores al escribir proveedores/marcas (ej: "sharìe" en vez de "Sharpie")
- No había forma de corregir estos errores
- Cada error se propagaba a múltiples productos
- No se podía ver cuántos productos tiene cada proveedor/marca

### Solución implementada:

**✅ Nueva Vista "Gestión de Datos":**
- Ubicación: Menú hamburguesa → ⚙️ Gestión de Datos
- Dos tabs: 🏢 Proveedores y 🏷️ Marcas
- Muestra lista completa con contador de productos
- Ejemplo: "madepa (2 productos)"

**✅ Funcionalidad de Edición:**
- Botón "✏️ Editar" en cada proveedor/marca
- Campo de texto para modificar el nombre
- Botón "✓ Guardar" actualiza TODOS los productos automáticamente
- Mensaje de confirmación: "X productos actualizados"
- Ideal para corregir typos y unificar nombres

**✅ Componentes creados:**
- `frontend/src/pages/GestionDatos.jsx` - Vista principal
- Integrado en App.jsx y MenuHamburguesa.jsx

**✅ Endpoints Backend:**
- `GET /api/proveedores/estadisticas` - Lista con contador de productos
- `GET /api/marcas/estadisticas` - Lista con contador de productos
- `PUT /api/proveedores/:nombre/renombrar` - Renombrar en todos los productos
- `PUT /api/marcas/:nombre/renombrar` - Renombrar en todos los productos

### Beneficios:
- ✅ Corregir errores de tipeo fácilmente
- ✅ Unificar nombres duplicados (ej: "Faber Castell" y "Faber-Castell")
- ✅ Ver estadísticas de uso por proveedor/marca
- ✅ Actualización masiva en todos los productos
- ✅ Mantener datos limpios y consistentes

---

## 📦 SISTEMA DE REGISTRO POR LOTES (✅ COMPLETADO):

### Problema identificado:
- Llegan compras en cajas/bolsas de un mismo proveedor (notas de compra)
- Tenían que registrar productos uno por uno repitiendo el proveedor cada vez
- Proceso lento y propenso a errores de tipeo
- Similar con productos de la misma marca

### Solución implementada:

**✅ Menú de Tipo de Registro (MenuRegistro.jsx):**
- Botón flotante [+] en Vista Registro abre menú con 3 opciones:
  1. 📦 **Producto Individual** - Como antes (uno por uno)
  2. 🏢 **Por Proveedor** ⭐ NUEVO - Registrar lote del mismo proveedor
  3. 🏷️ **Por Marca** ⭐ NUEVO - Registrar lote de la misma marca

**✅ FormularioLoteProveedor.jsx:**
- **Paso 1:** Campo de texto libre con autocompletado para proveedor
  - Pueden escribir nuevo proveedor o seleccionar uno existente
  - Usa HTML5 `<datalist>` para sugerencias mientras escriben
  - Muestra primeros 3 proveedores como referencia
  - NO requiere formulario adicional para crear proveedores

- **Paso 2:** Agregar productos al lote
  - Formulario de producto SIN campo proveedor (ya está preseleccionado)
  - Solo campo **Descripción es obligatorio** (asterisco rojo *)
  - Campos opcionales: Foto, Nombre, Marca, Cantidad, Precio Compra, Precio Venta
  - Botón "➕ Agregar al Lote" - sigue agregando sin cerrar
  - Lista visual de productos agregados con opciones para eliminar
  - Botón "✅ Finalizar Lote" - guarda todos de golpe
  - Todos van a estado "Proceso" con el mismo proveedor

**✅ FormularioLoteMarca.jsx:**
- Similar a FormularioLoteProveedor pero para marca
- Permite especificar proveedor individual en cada producto
- Todos los productos comparten la misma marca

**✅ Filtro por Proveedor en Vista Procesos:**
- Selector de proveedor aparece solo en pestaña "⏳ En Proceso"
- Dropdown con todos los proveedores que tienen productos en proceso
- Filtra para mostrar solo productos de ese proveedor
- Botón "✕ Limpiar" para quitar filtro
- Perfecto para completar una "nota de compra" completa

**✅ Endpoints Backend:**
- `GET /api/productos/proveedores` - Lista de proveedores únicos
- `GET /api/productos/marcas` - Lista de marcas únicas
- `POST /api/productos/lote` - Crear múltiples productos en una transacción

### Flujo de trabajo:
1. Llega caja con productos del Proveedor X
2. Click botón [+] → Elegir "Por Proveedor"
3. Escribir "Proveedor X" (o seleccionar de sugerencias)
4. Continuar → Llenar datos del producto 1 (solo descripción obligatoria) → "Agregar al Lote"
5. Llenar producto 2 → "Agregar al Lote"
6. ... agregar todos los de la caja
7. "Finalizar Lote" → Todos van a "Proceso" con el mismo proveedor
8. Ir a pestaña "Proceso" → Filtrar por "Proveedor X" → Completar toda la nota
9. Click "Completar Registro" en cada producto para agregar precios finales

### Beneficios:
- ✅ Registro más rápido (no repiten proveedor/marca)
- ✅ Menos errores de tipeo
- ✅ Trabajo organizado por lotes (notas de compra)
- ✅ No requiere formularios adicionales para proveedores/marcas
- ✅ Autocompletado inteligente aprende de registros anteriores
- ✅ Flexibilidad: solo descripción obligatoria, todo lo demás opcional

### Correcciones y mejoras posteriores:
- ✅ **Eliminado campo "nombre"** de formularios de lote (solo queda en formulario individual)
- ✅ **SelectorImagen se limpia** correctamente después de agregar producto al lote
- ✅ **Editar productos del lote** antes de finalizar
- ✅ **Eliminar productos** del lote antes de finalizar
- ✅ **Eliminar productos en estado Proceso** con confirmación
- ✅ **Label duplicado "Foto del Producto"** corregido
- ✅ **Normalización de datos** antes de guardar (previene errores)

---

## 🔍 SISTEMA DE FILTROS AVANZADOS (✅ COMPLETADO):

### Problema identificado:
- Solo había búsqueda por texto en Registro
- No se podía filtrar por proveedor o marca
- No se podía ordenar por fecha de registro

### Solución implementada:

**✅ Panel de Filtros Universal:**
- Aparece en las 3 pestañas: Existente, Proceso, Completados
- Diseño responsive: 3 columnas en desktop, 1 columna en móvil
- Botón "✕ Limpiar todos" para resetear filtros

**✅ Tres tipos de filtros:**
1. **🏢 Filtro por Proveedor**
   - Dropdown con todos los proveedores registrados
   - Opción "📦 Todos" para ver todos

2. **🏷️ Filtro por Marca**
   - Dropdown con todas las marcas registradas
   - Opción "🏷️ Todas" para ver todas

3. **📅 Filtro por Orden**
   - "📅 Más recientes primero" (default)
   - "🕐 Más antiguos primero"

**✅ Contador de Resultados:**
- Muestra cantidad de productos filtrados
- Indica filtros activos: "Mostrando 5 productos • Proveedor: madepa"

**✅ Fix de Rutas Backend:**
- Problema: Rutas `/api/productos/proveedores` y `/marcas` eran capturadas por `/api/productos/:id`
- Solución: Reordenadas rutas específicas ANTES de rutas con parámetros `:id`
- Ahora funciona correctamente

### Beneficios:
- ✅ Encontrar productos rápidamente por proveedor o marca
- ✅ Trabajar por lotes (completar todos los productos de un proveedor)
- ✅ Ver productos en orden cronológico (recientes o antiguos)
- ✅ Combinar múltiples filtros simultáneamente
- ✅ Experiencia consistente en todas las pestañas

---

## ⚠️ TAREAS PENDIENTES

### Próximas funcionalidades:
- 📦 Vista de Inventario
- 🛒 Vista de Compras
- 🔐 Sistema de roles y permisos
- 📊 Reportes y estadísticas de faltantes

### Mejoras técnicas:
- Considerar separar base de datos dev/prod si es necesario (actualmente compartida)
- Agregar tests automatizados
- Configurar CI/CD más robusto
- Filtros avanzados en Central Faltantes

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

## 🎨 Estándares de Diseño

### Tamaños de Fuente (Tailwind CSS):

Los tamaños están optimizados para **legibilidad en celular** y uso prolongado:

- **text-base** (16px / Word 12): Textos pequeños, etiquetas secundarias
- **text-lg** (18px / Word 13.5): Texto principal, descripciones, datos regulares
- **text-xl** (20px / Word 15): Subtítulos, precios destacados
- **text-2xl** (24px / Word 18): Títulos de sección, headers
- **text-3xl** (30px / Word 22): Títulos principales

**Decisión:** Se aumentaron los tamaños para mejor legibilidad en celular y reducir fatiga visual durante uso prolongado. Comparable a apps profesionales como WhatsApp Business y Mercado Libre.

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
- **En PRODUCCIÓN (HTTPS)**: La opción SIEMPRE está disponible ✅
  - Android: Banner automático o menú ⋮ → "Instalar aplicación"
  - iPhone: Botón Compartir → "Agregar a pantalla de inicio"
- **En DESARROLLO (HTTP local)**: Puede no estar disponible por limitaciones del navegador
  - Solución: Usar desde navegador sin instalar (funciona igual para desarrollo)

### "No puedo acceder desde el celular al servidor local":
- Verificar que ambos dispositivos estén en la misma red WiFi
- **Firewall de Windows** puede bloquear el puerto 5173:
  1. Presiona `Windows + R`
  2. Escribe `wf.msc` y presiona Enter
  3. "Reglas de entrada" → "Nueva regla..."
  4. Puerto → TCP → 5173 → Permitir → Finalizar
  5. Nombre: "Vite Dev Server"

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

**Última actualización:** 2026-01-25 (Sesión tarde)
**Rama actual al guardar:** dev
**Cambios recientes (SESIÓN 4):**
- ✅ Configuración completa de environments dev/prod
- ✅ Railway: 2 environments (production y development)
- ✅ Vercel: Variables de entorno separadas por ambiente
- ✅ `.env` local configurado para usar backend de desarrollo
- ✅ Workflow de desarrollo documentado
- ✅ Hot reload probado y funcionando
- ✅ Confirmado: App de producción instalable sin problemas
- ✅ Documentado problema de Firewall y solución para acceso desde celular
- ✅ **Tamaños de fuente aumentados globalmente** (18px texto regular, 24px títulos) para mejor legibilidad
- ✅ **SESIÓN 1 Sistema Faltantes:** Tabla en Supabase + Botón flotante [+] + Menú emergente
- ✅ **SESIÓN 2 Sistema Faltantes:** Formularios Producto Nuevo + Grupo/Repisa + Backend endpoints
- ✅ **SESIÓN 3 Sistema Faltantes:** Vista Central Faltantes con gestión completa de estados y filtros
- ✅ **Mejoras Sistema Faltantes:** Formulario de confirmación al reportar existentes + Colores invertidos (verde/rojo)
- ✅ **DEPLOY A PRODUCCIÓN:** Sistema completo de faltantes en https://vercel (rama master) - Funcional y probado
- ✅ **SISTEMA REGISTRO POR LOTES:** MenuRegistro + FormularioLoteProveedor + FormularioLoteMarca
- ✅ **Registro por Proveedor/Marca:** Autocompletado inteligente + Solo descripción obligatoria
- ✅ **Correcciones Formularios Lote:** Campo nombre eliminado, editar productos, eliminar del lote
- ✅ **SISTEMA DE FILTROS AVANZADOS:** Proveedor + Marca + Orden (3 pestañas)
- ✅ **GESTIÓN DE DATOS:** Vista para editar proveedores/marcas y corregir typos masivamente
- ✅ **Eliminar productos en Proceso:** Modal de confirmación
- ✅ **Fix de Rutas Backend:** Endpoints específicos antes de :id
- ✅ **Título corregido:** "APP REGISTROS" → "REGISTRO DE PRODUCTOS"
