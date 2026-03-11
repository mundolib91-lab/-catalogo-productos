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

### 📌 Nota sobre estados:
**Cambio de flujo: Completados → Existentes es MANUAL**
- Antes: Automático después de 2 días ❌
- Ahora: Manual con botón "→ Existente" ✅
- Utilidad Completados: Historial de compras recientes
- Endpoint: PUT /api/productos/:id/pasar-existente

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

### "Los productos no aparecen en ninguna app" (2026-02-22):
- **Causa:** El plan de prueba gratuito de Railway (30 días) expiró
- **Síntoma:** Railway envía un email avisando que el trial expiró y el backend se apaga
- **Solución aplicada:** Actualizar al plan Hobby de Railway ($5/mes) desde https://railway.app/account/billing
- **Tiempo de recuperación:** 1-2 minutos después de pagar, el servidor vuelve a arrancar solo
- **Nota:** Evaluar migración a Render (gratis) para evitar este costo mensual
  - Render tiene capa gratuita con servidor que se "duerme" tras 15 min de inactividad
  - Se puede evitar el sueño con UptimeRobot (gratuito) que pingea el servidor cada 5 min
  - Migración estimada: ~30 minutos sin cambios en el código

---

## 📚 Recursos y Documentación

- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app/
- **PWA Guide**: https://web.dev/progressive-web-apps/

---

---

## 🎯 MEJORAS Y REFINAMIENTOS (SESIÓN 5 - ✅ COMPLETADO):

### Central Faltantes - Mejoras de UX:

**✅ Modal de Detalles Completo:**
- Botón "Ver Detalle" ahora abre modal con toda la información del faltante
- Muestra: Imagen grande, descripción, notas, tipo, origen, prioridad, estado actual, ID, tiempo en estado
- Diseño responsive con scroll para contenido largo
- Botón de cierre en header y footer del modal

**✅ Botones de Estado Directos:**
- Eliminado botón único "Cambiar Estado" que avanzaba consecutivamente
- Implementado grid de 6 botones para saltar directamente a cualquier estado:
  - 🔴 Reportado
  - 🟠 Confirmado
  - 🔵 En Compras
  - 🟣 Pedido
  - 🟢 Recibido
  - ⚪ Archivar
- Estado actual aparece deshabilitado/gris
- Permite saltar estados según necesidad del flujo real

**✅ Simplificación del Flujo:**
- **ELIMINADO estado "Verificando"** del sistema de faltantes
- Flujo simplificado: Reportado → Confirmado → En Compras → Pedido → Recibido → Archivado
- Actualizado en: pestañas, configuración de estados, modal de detalles, contadores

**✅ Optimización Visual:**
- Eliminado campo ID de las tarjetas (libera espacio para botones)
- ID sigue visible en el modal de detalles
- Tarjetas más limpias y enfocadas en datos relevantes

### Atención al Cliente - Simplificación de Filtros:

**✅ Eliminados filtros innecesarios:**
- Removido filtro "Por Marca" (redundante con búsqueda)
- Removido filtro "Por Proveedor" (no necesario en esta vista)
- Solo queda filtro útil: **"Solo Faltantes"**
- Búsqueda de texto cubre necesidad de filtrar por marca/proveedor
- Interfaz más limpia y directa

### Registro de Productos - Mejoras de Flujo:

**✅ Completar Registro - Campo Nombre Opcional:**
- Campo "Nombre del Producto" ya **NO es obligatorio** en FormularioCompleto
- Removido asterisco (*) y atributo `required`
- Mayor flexibilidad al completar registros
- Solo precios de compra/venta siguen siendo obligatorios

**✅ Tarjetas Completados - Información Completa:**
- Agregados datos clave en tarjetas de productos completados:
  - 💰 Precio de compra (Bs)
  - 💵 Precio de venta (Bs)
  - 📈 **Ganancia** (Bs y porcentaje) ⭐ NUEVO
  - 📦 Stock (unidades)
- Cálculo automático de ganancia: monto y porcentaje
- Ejemplo: "Bs 1.50 (60.0%)"
- Facilita verificación de datos antes de pasar a Existentes

**✅ Botón "Verificar OK ✓":**
- Renombrado botón "A Existente" → **"Verificar OK ✓"**
- Semántica más clara: indica que se revisó y aprobó el producto
- Flujo mejorado:
  1. Producto llega a Completados
  2. Se revisan precios, ganancia, stock
  3. Se presiona "Verificar OK ✓"
  4. Producto pasa a Existentes
- Texto mientras procesa: "Verificando..."

### Archivos Modificados:
- `frontend/src/pages/CentralFaltantes.jsx` - Modal, botones directos, eliminado verificando
- `frontend/src/pages/Atencion.jsx` - Eliminados filtros de marca y proveedor
- `frontend/src/pages/FormularioCompleto.jsx` - Campo nombre opcional
- `frontend/src/pages/Registro.jsx` - Datos completos en Completados, botón Verificar OK

### Beneficios:
- ✅ **Central Faltantes**: Navegación más rápida entre estados, información completa visible
- ✅ **Atención al Cliente**: Interfaz más limpia sin filtros redundantes
- ✅ **Completar Registro**: Más flexible, menos campos obligatorios
- ✅ **Verificación de Datos**: Todos los datos clave visibles antes de aprobar
- ✅ **UX mejorada**: Botones más descriptivos y flujos más claros

---

## 💰 SISTEMA DE REGISTRO FLEXIBLE CON PRECIOS (SESIÓN 9 - ✅ COMPLETADO)

### Fecha: 2026-01-28

### 🎯 Objetivo
Rediseñar el sistema de registro para soportar datos parciales y automatizar transiciones de estado basándose en la completitud de información, con enfoque en flexibilidad del flujo de trabajo real.

### 📋 Contexto del Problema

El sistema original requería que todos los datos fueran completados de una vez, pero el flujo de trabajo real es más flexible:
- A veces solo tienen descripción
- A veces tienen descripción + foto
- A veces tienen descripción + foto + cantidad
- A veces tienen descripción + precios + cantidad
- El precio de venta es más importante que el precio de compra (se puede estimar del mercado)
- La cantidad no siempre se ingresa al momento del registro

### ✅ Cambios Implementados

#### 1. **Campos de Precio en Formularios de Registro**

**Agregados a todos los formularios:**
- Precio de compra (precio_compra_unidad)
- Precio de venta (precio_venta_unidad)
- Cálculo de ganancia en tiempo real (monto + porcentaje)
- Indicador visual de pérdida si venta < compra

**Formularios modificados:**
- FormularioRapido (registro individual)
- FormularioLoteProveedor (registro por proveedor)
- FormularioLoteMarca (registro por marca)

**Componentes:**
```
apps/mundolib-app/src/pages/Registro.jsx
apps/majoli-app/src/pages/Registro.jsx
apps/mundolib-app/src/components/FormularioLoteProveedor.jsx
apps/majoli-app/src/components/FormularioLoteProveedor.jsx
apps/mundolib-app/src/components/FormularioLoteMarca.jsx
apps/majoli-app/src/components/FormularioLoteMarca.jsx
```

#### 2. **Simplificación de Formularios por Lote**

**Eliminados campos redundantes:**
- ❌ Campo "marca" en FormularioLoteProveedor (todos comparten proveedor)
- ❌ Campo "proveedor" en FormularioLoteMarca (todos comparten marca)

**Beneficio:** Menos campos = registro más rápido

#### 3. **Validación Simplificada**

**Solo DESCRIPCIÓN es obligatoria:**
- ✅ Descripción - siempre requerida
- ❌ Cantidad - opcional (puede ser 0 o vacía)
- ❌ Imagen - opcional
- ❌ Precios - opcionales (se pueden agregar después)

#### 4. **Lógica de Estado Automático**

**Reglas para pasar a "Completado":**
- ✅ Tiene imagen
- ✅ Tiene descripción
- ✅ Tiene precio de compra > 0
- ✅ Tiene precio de venta > 0
- ❌ Cantidad NO es requerida

**Si falta alguno de estos → queda en "Proceso"**

**Backend actualizado:**
```javascript
// Endpoints modificados:
POST /api/productos/rapido
POST /api/productos/lote
PUT /api/productos/:id/completar
```

#### 5. **Actualización Parcial de Productos**

**Problema original:**
- Endpoint /completar rechazaba si faltaban datos
- No se podía guardar solo precio de compra o solo precio de venta
- Bloqueaba el flujo de trabajo incremental

**Solución implementada:**
- Endpoint acepta datos parciales
- Guarda cualquier campo proporcionado
- Verifica completitud y cambia estado solo si tiene TODO
- Mensaje adaptativo según resultado

**Ejemplo de flujo:**
1. Registro inicial: solo descripción → "Proceso"
2. Primera actualización: agregar foto → guarda, sigue en "Proceso"
3. Segunda actualización: agregar precio venta → guarda, sigue en "Proceso"
4. Tercera actualización: agregar precio compra → guarda, **pasa a "Completado"**

#### 6. **Filtro por Tienda con Productos Sin Stock**

**Problema identificado:**
- Productos sin cantidad no aparecían en ninguna tienda
- Filtro solo mostraba productos con stock > 0
- Productos de Majoli aparecían en Mundo Lib y viceversa

**Solución Fase 1: Campo tienda_origen**
```sql
-- Backend ahora guarda tienda de origen en todos los endpoints
tienda_origen: 'mundo_lib' | 'majoli' | 'lili'
```

**Solución Fase 2: Parámetro incluir_sin_stock**
```javascript
// Endpoint: GET /api/productos/estado/:estado
// Nuevo parámetro: incluir_sin_stock=true/false

if (incluir_sin_stock === 'true') {
  // Página Registro: mostrar productos de la tienda (con o sin stock)
  query = query.or('tienda_origen.eq.mundo_lib,stock_mundo_lib.gt.0');
} else {
  // Página Atención: solo productos con stock > 0
  query = query.gt('stock_mundo_lib', 0);
}
```

**Beneficios:**
- ✅ Productos sin stock visibles en página Registro
- ✅ Cada tienda ve solo sus productos
- ✅ Página Atención sigue filtrando por disponibilidad
- ✅ Backwards compatible con productos viejos

#### 7. **Atención al Cliente Sin Filtro de Stock**

**Cambio importante:**
- Antes: Solo mostraba productos con stock > 0
- Ahora: Muestra productos con imagen + descripción + precios (stock puede ser 0)

**Razón:**
- Permite mostrar productos en catálogo aunque no haya stock
- Usuario de atención puede informar al cliente
- Se puede tomar pedido anticipado

**Archivos modificados:**
```
apps/mundolib-app/src/pages/Atencion.jsx
apps/majoli-app/src/pages/Atencion.jsx
```

#### 8. **Cálculo de Ganancia en Tiempo Real**

**Ubicaciones implementadas:**
- FormularioRapido (registro individual)
- FormularioLoteProveedor (registro por proveedor)
- FormularioLoteMarca (registro por marca)

**Características:**
- Cálculo instantáneo al escribir precios
- Muestra ganancia absoluta (Bs) y relativa (%)
- Color verde = ganancia positiva
- Color rojo = pérdida (precio venta < precio compra)
- Alerta visual: "⚠️ Estás vendiendo con pérdida"
- Compatible con dark mode

**Ejemplo visual:**
```
┌─────────────────────────────────────────┐
│  Ganancia por unidad    Porcentaje      │
│     + Bs 1.50              60.0%        │
└─────────────────────────────────────────┘
    ✅ Verde = Ganancia

┌─────────────────────────────────────────┐
│  Ganancia por unidad    Porcentaje      │
│     - Bs 0.50              -20.0%       │
│  ⚠️ Estás vendiendo con pérdida         │
└─────────────────────────────────────────┘
    🔴 Rojo = Pérdida
```

### 📝 Archivos Modificados

**Backend:**
```
backend/server.js
- Endpoint POST /api/productos/rapido
- Endpoint POST /api/productos/lote
- Endpoint PUT /api/productos/:id/completar
- Endpoint GET /api/productos/estado/:estado
```

**Frontend - Mundo Lib:**
```
apps/mundolib-app/src/pages/Registro.jsx
apps/mundolib-app/src/pages/Atencion.jsx
apps/mundolib-app/src/pages/FormularioCompleto.jsx
apps/mundolib-app/src/components/FormularioLoteProveedor.jsx
apps/mundolib-app/src/components/FormularioLoteMarca.jsx
```

**Frontend - Majoli:**
```
apps/majoli-app/src/pages/Registro.jsx
apps/majoli-app/src/pages/Atencion.jsx
apps/majoli-app/src/pages/FormularioCompleto.jsx
apps/majoli-app/src/components/FormularioLoteProveedor.jsx
apps/majoli-app/src/components/FormularioLoteMarca.jsx
```

### 🚀 Commits Realizados

1. `Agregar campos de precio y cálculo de ganancia en formularios de registro`
2. `Remover filtro de stock en página Registro`
3. `Implementar filtro por tienda_origen para productos sin stock`
4. `Agregar parámetro incluir_sin_stock para filtro flexible por tienda`
5. `Corregir filtro de tienda para incluir productos con stock`
6. `Actualizar validaciones de completar producto`
7. `Permitir productos sin stock en Atención al Cliente`
8. `Actualizar lógica de estado automático: requiere imagen`
9. `Permitir actualización parcial de productos en proceso`

### 💡 Beneficios

- ✅ **Flujo de trabajo flexible**: Registrar con datos parciales y completar después
- ✅ **Estado automático**: Producto pasa a completado cuando tiene todo necesario
- ✅ **Cálculo de ganancia**: Ver rentabilidad antes de guardar
- ✅ **Menos errores**: Solo descripción obligatoria reduce fricción
- ✅ **Mejor aislamiento**: Cada tienda ve solo sus productos
- ✅ **Backwards compatible**: Funciona con productos existentes sin tienda_origen
- ✅ **Versatilidad**: Atención puede mostrar productos sin stock (para pedidos)

### 🔍 Reglas de Negocio Finales

**Para REGISTRO de producto:**
- Obligatorio: Descripción
- Opcional: Todo lo demás

**Para pasar a COMPLETADO automáticamente:**
- ✅ Imagen
- ✅ Descripción
- ✅ Precio de compra
- ✅ Precio de venta
- ❌ Cantidad (NO requerida)

**Para aparecer en ATENCIÓN AL CLIENTE:**
- ✅ Imagen
- ✅ Descripción
- ✅ Precio de compra
- ✅ Precio de venta
- ❌ Stock > 0 (NO requerido, puede ser 0)

**Filtrado por tienda:**
- Registro: Muestra productos con `tienda_origen = tienda` O `stock > 0 en tienda`
- Atención: Muestra productos con `tienda_origen = tienda` O `stock > 0 en tienda`

### 📊 Impacto en Flujo de Trabajo

**Antes:**
1. Registrar producto con TODOS los datos
2. Si falta algo → error o no se guarda
3. Difícil completar información después

**Ahora:**
1. Registrar con descripción solamente → Proceso
2. Agregar foto cuando la tengan → Proceso
3. Agregar precio venta (más común) → Proceso
4. Agregar precio compra → **Completado automático** ✨
5. Agregar cantidad cuando llegue el producto (opcional)

**Resultado:** Flujo incremental que se ajusta a la realidad del negocio.

---

## 📦 SISTEMA DE INVENTARIO (SESIÓN 10 - ✅ COMPLETADO)

### Fecha: 2026-03-11

### Qué se construyó

**Nueva vista Inventario** accesible desde el menú en las 3 apps.

Muestra todos los productos en estado `existente` de la tienda actual en una **tabla con scroll horizontal**:

```
Producto  | Dep | ML | Maj | Lili | Tot | ↔
Carpeta   |  20 |  5 |   3 |    0 |  28 | ↔
Marcador  |   0 |  8 |   4 |    2 |  14 | ↔
```

- Cada celda de stock es un botón → toca para editar el número
- Botón ↔ → traslada unidades del depósito a una tienda
- Buscador en tiempo real por descripción/marca
- Columna producto fija (sticky), resto con scroll horizontal
- Filtrado por tienda: cada app ve solo sus productos

### Base de datos

```sql
-- Columna agregada manualmente en Supabase:
ALTER TABLE productos ADD COLUMN stock_deposito integer DEFAULT 0;
```

### Endpoints nuevos

- `GET /api/inventario?tienda=mundo_lib&search=&page=1` → lista productos existentes de la tienda
- `PATCH /api/inventario/:id/stock` → body: `{ ubicacion, cantidad }` — actualiza una celda
- `POST /api/inventario/trasladar` → body: `{ producto_id, tienda_destino, cantidad }` — mueve del depósito a tienda

### Selector de ubicación en registro

Al registrar un producto (individual, por proveedor o por marca) ahora aparece un selector:

```
[ Tienda (ML) ]   [ Deposito ]
```

- **Tienda**: la cantidad va a `stock_mundo_lib` (o el campo de la tienda correspondiente)
- **Deposito**: la cantidad va a `stock_deposito`

En formularios de lote el selector aparece en el **Paso 1**, aplica a todos los productos del lote.

### Flujo de trabajo con depósito

1. Llega mercadería al depósito → registrar con ubicación **Deposito**
2. Ver en Inventario → columna Dep muestra el stock
3. Cuando llevan productos a la tienda → botón ↔ → elegir cantidad y tienda destino → Confirmar
4. Stock se descuenta del depósito y suma en la tienda automáticamente

### Archivos creados/modificados

```
backend/server.js                              → 3 endpoints nuevos + ubicacion en lote
apps/*/src/pages/Inventario.jsx                → nueva vista (igual en las 3 apps)
apps/*/src/App.jsx                             → import + render + botón activado
apps/*/src/components/MenuHamburguesa.jsx      → quitado "Próximamente" de Inventario
apps/*/src/pages/Registro.jsx                  → selector ubicacion en FormularioRapido
apps/*/src/components/FormularioLoteProveedor  → selector ubicacion en Paso 1
apps/*/src/components/FormularioLoteMarca      → selector ubicacion en Paso 1
```

### Pendiente (Fase 2)

- Sistema de variantes (color, medida, peso, tamaño) con stock propio por variante
- Tabla `variantes` en Supabase: `id, producto_id, tipo, valor, precio_compra, precio_venta, stock_deposito, stock_mundo_lib, stock_majoli, stock_lili`

---

**Última actualización:** 2026-03-11
**Rama actual al guardar:** dev
**Cambios recientes:**
- ✅ **SESIÓN 10:** Sistema de Inventario con stock por ubicación (ver sección abajo)
- ✅ **SESIÓN 8:** Mejoras de compatibilidad y experiencia de usuario
- ✅ Botones separados para cámara/galería en subida de imágenes (mejor compatibilidad Android)
- ✅ Campo cantidad obligatorio en registro por lotes (previene productos sin stock)
- ✅ Botón eliminar en productos existentes (dentro de modal Ver Detalles)
- ✅ Cálculo de ganancia en tiempo real al editar precios en existentes
- ✅ Todos los cambios aplicados a las 3 apps (mundolib, majoli, lili)
- ✅ **SESIÓN 7:** Deployment completo de sistema multi-tienda a producción
- ✅ Fix crítico: Variables de entorno Railway corregidas (SERVICE_ROLE_KEY tenía caracteres extra)
- ✅ Backend development funcionando correctamente en Railway
- ✅ 3 apps desplegadas en Vercel con Vercel CLI
- ✅ Iconos SVG personalizados para cada tienda (amarillo M, verde M, rosa L)
- ✅ Nombres y colores de tema únicos por tienda
- ✅ Limpieza de proyectos duplicados (eliminado catalogo-productos)
- ✅ URLs finales:
  - Mundo Lib: https://mundolib-app.vercel.app
  - Majoli: https://majoli-app.vercel.app
  - Lili: https://lili-app-ruddy.vercel.app
- ✅ Todas las apps con variables de entorno configuradas
- ✅ PWA funcional con iconos diferenciados en las 3 tiendas

---

## 🎨 MEJORAS UX Y VALIDACIONES (SESIÓN 8 - ✅ COMPLETADO)

### Fecha: 2026-01-27

### 🎯 Objetivo
Mejorar la experiencia de usuario y agregar validaciones faltantes en el sistema multi-tienda.

### ✅ Mejoras Implementadas

#### 1. **Botones Separados para Subida de Imágenes**

**Problema:**
- En dispositivos Android diferentes (Poco F3 vs Redmi 13) el comportamiento del input de imagen era inconsistente
- Poco F3: Mostraba "Cámara" y "Examinar"
- Redmi 13: Mostraba solo "Fotos" y "Colecciones" (sin opción de cámara)
- Problema causado por implementaciones diferentes del atributo `capture` en fabricantes

**Solución:**
- Dos botones separados en lugar de uno solo:
  - **📷 Tomar Foto**: Con `capture="environment"` (activa cámara trasera)
  - **🖼️ Desde Galería**: Sin `capture` (abre galería de fotos)
- Diseño responsive en grid de 2 columnas
- Colores diferenciados (azul para cámara, verde para galería)
- Botón "🗑️ Quitar Imagen" cuando hay previsualización

**Componente actualizado:**
- `apps/mundolib-app/src/components/SelectorImagen.jsx`
- `apps/majoli-app/src/components/SelectorImagen.jsx`
- `apps/lili-app/src/components/SelectorImagen.jsx`

#### 2. **Campo Cantidad Obligatorio en Registro por Lotes**

**Problema:**
- Al agregar productos por lote, el campo cantidad no era obligatorio
- Se podían guardar productos con cantidad = 0
- Productos con stock 0 no aparecían en la pestaña "En Proceso" (filtrada por stock > 0)
- Usuario confundido: "guardaba pero no veía los productos"

**Solución:**
- Campo cantidad ahora es **obligatorio** con validación:
  - Asterisco rojo (*) en el label
  - Validación: cantidad debe ser > 0
  - Mensaje de error si no cumple: "La cantidad es obligatoria y debe ser mayor a 0"
  - Borde rojo en input cuando hay error
- Previene guardar productos sin stock definido

**Componentes actualizados:**
- `apps/mundolib-app/src/components/FormularioLoteProveedor.jsx`
- `apps/majoli-app/src/components/FormularioLoteProveedor.jsx`
- `apps/lili-app/src/components/FormularioLoteProveedor.jsx`
- `apps/mundolib-app/src/components/FormularioLoteMarca.jsx`
- `apps/majoli-app/src/components/FormularioLoteMarca.jsx`
- `apps/lili-app/src/components/FormularioLoteMarca.jsx`

#### 3. **Botón Eliminar en Productos Existentes**

**Problema:**
- En la pestaña "Existente" no había forma de eliminar productos
- Solo había opción de eliminar en "En Proceso"
- Si un producto llegaba a Existentes, era difícil eliminarlo

**Solución:**
- Botón "🗑️ Eliminar" agregado dentro del modal "Ver Detalles"
- No está en la vista principal (para evitar eliminaciones accidentales)
- Requiere confirmación con diálogo nativo del navegador
- Muestra estado de carga "⏳ Eliminando..."
- Después de eliminar: cierra modal y recarga lista
- Posicionado entre botones "Cerrar" y "Editar"

**Componentes actualizados:**
- `apps/mundolib-app/src/pages/VerEditarProducto.jsx`
- `apps/majoli-app/src/pages/VerEditarProducto.jsx`
- `apps/lili-app/src/pages/VerEditarProducto.jsx`

#### 4. **Cálculo de Ganancia en Tiempo Real**

**Problema:**
- En "En Proceso", al editar precios se mostraba la ganancia al instante
- En "Existente", la ganancia solo se mostraba con datos originales (no se actualizaba al editar)
- Dificultaba verificar si los datos del producto eran correctos

**Solución:**
- Cálculo de ganancia ahora usa `formData` en lugar de `producto`
- Se actualiza instantáneamente al modificar precio de compra o venta
- Visual mejorado:
  - Fondo verde + texto verde = Ganancia positiva
  - Fondo rojo + texto rojo = Pérdida (venta menor que compra)
  - Muestra monto absoluto (Bs X.XX) y porcentaje (XX.X%)
  - Mensaje de alerta "⚠️ Estás vendiendo con pérdida" cuando aplica
- Facilita validación de datos antes de guardar

**Componentes actualizados:**
- `apps/mundolib-app/src/pages/VerEditarProducto.jsx`
- `apps/majoli-app/src/pages/VerEditarProducto.jsx`
- `apps/lili-app/src/pages/VerEditarProducto.jsx`

### 📝 Archivos Modificados

**Componentes:**
```
apps/mundolib-app/src/components/SelectorImagen.jsx
apps/majoli-app/src/components/SelectorImagen.jsx
apps/lili-app/src/components/SelectorImagen.jsx

apps/mundolib-app/src/components/FormularioLoteProveedor.jsx
apps/majoli-app/src/components/FormularioLoteProveedor.jsx
apps/lili-app/src/components/FormularioLoteProveedor.jsx

apps/mundolib-app/src/components/FormularioLoteMarca.jsx
apps/majoli-app/src/components/FormularioLoteMarca.jsx
apps/lili-app/src/components/FormularioLoteMarca.jsx

apps/mundolib-app/src/pages/VerEditarProducto.jsx
apps/majoli-app/src/pages/VerEditarProducto.jsx
apps/lili-app/src/pages/VerEditarProducto.jsx
```

### 🚀 Commits Realizados

1. `Separar botones de cámara y galería para mejor compatibilidad Android`
2. `Hacer campo cantidad obligatorio en formularios de registro por lote`
3. `Agregar botón eliminar y cálculo de ganancia en tiempo real en productos existentes`

### 💡 Beneficios

- ✅ **Compatibilidad Android mejorada**: Funciona consistente en todos los dispositivos
- ✅ **Menos errores de usuario**: Validación previene productos sin stock
- ✅ **Gestión completa en Existentes**: Eliminar productos desde cualquier pestaña
- ✅ **Verificación de datos mejorada**: Ver ganancia/pérdida al instante al editar precios
- ✅ **UX consistente**: Todas las funcionalidades disponibles en todas las pestañas

### 📊 Impacto en Tokens

**Nota importante sobre costos:**
- Con el sistema multi-tienda (3 apps), cada cambio requiere modificar 3 archivos
- Consumo aproximado: 3x tokens vs sistema de una sola app
- **Refactorización planificada**: Migrar a librería compartida de componentes
  - Reducirá consumo de tokens en ~66% para cambios futuros
  - Se implementará antes de crear nuevas vistas (Inventario, Compras, etc.)
  - Inversión inicial de ~800-1,200 tokens, break-even en 3-4 cambios

---

## 🏪 SISTEMA MULTI-TIENDA (SESIÓN 6 - ✅ COMPLETADO)

### Fecha: 2026-01-26

### 🎯 Objetivo
Transformar el sistema de tienda única a un sistema multi-tienda que soporte tres tiendas independientes: Mundo Lib, Majoli y Lili.

### ✅ Implementación Completada

#### 1. **Migración de Base de Datos**
   - Agregadas columnas `stock_mundo_lib`, `stock_majoli`, `stock_lili` a tabla `productos`
   - Agregada columna `tienda_origen` para identificar tienda de creación
   - Columna calculada `stock_total` (suma de stocks de todas las tiendas)
   - Tabla `transferencias` para mover productos entre tiendas
   - Campo `tienda` agregado a tabla `faltantes`
   - **Archivo:** `database/migrations/001_agregar_multi_tienda.sql`

#### 2. **Estructura Monorepo**
   ```
   catalogo-productos/
   ├── apps/
   │   ├── mundolib-app/    # App Mundo Lib
   │   ├── majoli-app/      # App Majoli
   │   └── lili-app/        # App Lili
   ├── backend/             # Backend compartido
   └── frontend/            # App original (deprecated)
   ```

#### 3. **Configuración por Tienda**
   Cada app tiene su propio `config.js`:
   ```javascript
   export const APP_CONFIG = {
     nombre: 'Mundo Lib',
     tienda: 'mundo_lib',
     campo_stock: 'stock_mundo_lib',
     color_primario: '#3B82F6', // Azul
     emoji: '📚'
   }
   ```

#### 4. **Backend Multi-Tienda**

   **Endpoints Actualizados:**
   - `/api/productos/rapido` - Crea productos con stock por tienda
   - `/api/productos/estado/:estado` - Filtra por stock de tienda específica
   - Todos los endpoints actualizados para soportar parámetro `tienda`

   **Fix Crítico - Permisos Supabase:**
   - **Problema:** Backend usaba `SUPABASE_ANON_KEY` (permisos limitados)
   - **Solución:** Cambio a `SUPABASE_SERVICE_ROLE_KEY` (permisos completos)
   - **Archivo:** `backend/.env` y `backend/server.js`

   **Estrategia INSERT/UPDATE:**
   - INSERT producto base sin stock
   - UPDATE separado para agregar stock
   - Evita conflictos con DEFAULT constraints

#### 5. **Frontend - Cambios por App**

   **Registro.jsx:**
   - Campo de cantidad usa dinámicamente `APP_CONFIG.campo_stock`
   - API calls incluyen parámetro `tienda` para filtrado
   - Solo muestra productos con stock > 0 en tienda actual

   **Atencion.jsx:**
   - Filtrado automático por tienda
   - Solo muestra productos disponibles en la tienda actual

   **FormularioCompleto.jsx:**
   - Muestra y permite editar solo el stock de la tienda actual
   - Lectura de stocks de otras tiendas (informativo)

#### 6. **Colores por Tienda**
   - **Mundo Lib:** Azul (#3B82F6) 📚
   - **Majoli:** Verde (#10B981) 🏪
   - **Lili:** Rosa (#EC4899) 🌸

### 🔧 Archivos Principales Modificados

1. **Backend:**
   - `backend/server.js` - Endpoints multi-tienda
   - `backend/.env` - SERVICE_ROLE_KEY agregada

2. **Database:**
   - `database/migrations/001_agregar_multi_tienda.sql`
   - `database/INSTRUCCIONES_MIGRACION.md`

3. **Apps:**
   - `apps/mundolib-app/src/config.js`
   - `apps/majoli-app/src/config.js`
   - `apps/lili-app/src/config.js`
   - `apps/*/src/pages/Registro.jsx`
   - `apps/*/src/pages/Atencion.jsx`
   - `apps/*/src/pages/FormularioCompleto.jsx`

### ✅ Funcionalidades Verificadas

- ✅ Crear producto en Mundo Lib → Solo visible en Mundo Lib
- ✅ Crear producto en Majoli → Solo visible en Majoli
- ✅ Crear producto en Lili → Solo visible en Lili
- ✅ Stock se guarda correctamente por tienda
- ✅ Filtros automáticos funcionan correctamente
- ✅ Colores diferenciados por tienda
- ✅ **3 apps desplegadas en Vercel y funcionando correctamente**
- ✅ **Backend Railway con variables de entorno corregidas**
- ✅ **PWA instalable en cada tienda**

### 🚀 URLs de Producción (Vercel)

- **Backend Development:** https://catalogo-productos-development.up.railway.app/api
- **Mundo Lib (Amarillo 🟡):** https://mundolib-app.vercel.app
- **Majoli (Verde 🟢):** https://majoli-app.vercel.app
- **Lili Cosméticos (Rosa 🌸):** https://lili-app-ruddy.vercel.app

### 🚀 URLs de Desarrollo Local

- Backend: http://localhost:5000
- Mundo Lib: http://localhost:5189
- Majoli: http://localhost:5190
- Lili: http://localhost:5191

### 📋 Pendiente

- ⏳ Configurar backend de PRODUCCIÓN en Railway (cuando esté listo para usuarios finales)
- ⏳ Configuración de dominios personalizados (opcional)
- ⏳ Sistema de transferencias entre tiendas (opcional)

---

## 🚀 DEPLOYMENT A PRODUCCIÓN (SESIÓN 7 - ✅ COMPLETADO)

### Fecha: 2026-01-26

### 🎯 Objetivo
Deployar el sistema multi-tienda completo a producción en Vercel y solucionar problemas de variables de entorno en Railway.

### 🐛 Problemas Encontrados y Solucionados

#### 1. **Railway - Variables de entorno no funcionaban**

**Problema:**
- Backend respondía "Invalid API key" en todos los endpoints
- Logs mostraban `injecting env (0)` - no detectaba variables
- Tests fallaban con error de autenticación Supabase

**Causa raíz:**
- La variable `SUPABASE_SERVICE_ROLE_KEY` en Railway tenía caracteres extra:
  - Al inicio: espacio + signo igual ` =`
  - Al final: virgulilla `~`
- Formato incorrecto: ` =eyJhbGc...hF0~`
- Formato correcto: `eyJhbGc...hF0`

**Solución:**
1. Endpoint de diagnóstico agregado en `backend/server.js` para detectar el problema
2. Variable eliminada y recreada desde cero en Railway dashboard
3. Verificación con `curl` confirmó que funcionó
4. Backend ahora responde correctamente con SERVICE_ROLE_KEY

**Archivos modificados:**
- `backend/server.js` - Endpoint `/api/diagnostico` agregado (temporal)

#### 2. **Vercel - No permitía múltiples proyectos del mismo repo desde dashboard**

**Problema:**
- Dashboard de Vercel mostraba error al intentar crear segundo proyecto
- Mensaje: "Project already exists, please use a new name"
- No importaba el nombre que se usara

**Solución:**
- Instalación de Vercel CLI: `npm install -g vercel`
- Login con `vercel login`
- Deploy directo desde cada carpeta de app con `vercel --prod --yes`
- Variables de entorno agregadas manualmente desde dashboard después del deploy

**Comandos usados:**
```bash
cd apps/majoli-app && vercel --prod --yes
cd apps/lili-app && vercel --prod --yes
```

### ✅ Deployment Completado

#### **Backend (Railway)**
- URL Development: https://catalogo-productos-development.up.railway.app/api
- ✅ Variables de entorno funcionando correctamente
- ✅ SERVICE_ROLE_KEY configurada sin caracteres extra
- ✅ Todos los endpoints operacionales
- ✅ Sistema multi-tienda funcionando

#### **Frontend - 3 Apps en Vercel**

**1. Mundo Lib 📚 (Azul)**
- **URL:** https://catalogo-productos-vert.vercel.app
- **Root Directory:** `apps/mundolib-app`
- **Tienda:** `mundo_lib`
- **Stock:** `stock_mundo_lib`
- **Deploy:** Actualizado desde proyecto existente

**2. Majoli 🏪 (Verde)**
- **URL:** https://majoli-app.vercel.app
- **Root Directory:** `apps/majoli-app`
- **Tienda:** `majoli`
- **Stock:** `stock_majoli`
- **Deploy:** Creado con Vercel CLI

**3. Lili Cosméticos 🌸 (Rosa)**
- **URL:** https://lili-app-ruddy.vercel.app
- **Root Directory:** `apps/lili-app`
- **Tienda:** `lili`
- **Stock:** `stock_lili`
- **Deploy:** Creado con Vercel CLI

### 🔧 Variables de Entorno Configuradas (Todas las apps)

```env
VITE_API_URL=https://catalogo-productos-development.up.railway.app/api
VITE_SUPABASE_URL=https://zpvtovhomaykvcowbtda.supabase.co
VITE_SUPABASE_ANON_KEY=[key configurada]
VITE_CLOUDINARY_CLOUD_NAME=ddkuwch5y
VITE_CLOUDINARY_UPLOAD_PRESET=productos-mundolib
```

**Nota:** Variables configuradas para todos los environments (Production, Preview, Development)

### 📱 Instalación en Dispositivos Móviles

Las 3 apps ahora están disponibles como PWA y pueden instalarse desde:

**Android:**
1. Abrir URL en Chrome
2. Menú ⋮ → "Instalar aplicación"
3. App aparece en pantalla de inicio

**iPhone:**
1. Abrir URL en Safari
2. Botón Compartir → "Agregar a pantalla de inicio"
3. App aparece en pantalla de inicio

### 🎯 Testing Post-Deployment

**Tests realizados:**
```bash
# Backend Railway
✅ GET /api/diagnostico → Variables correctas
✅ GET /api/productos/proveedores → Lista de proveedores
✅ POST /api/productos/rapido → Crear producto multi-tienda

# Frontend Vercel
✅ Mundo Lib: HTTP 200, título correcto
✅ Majoli: HTTP 200, título correcto
✅ Lili: HTTP 200, título correcto
```

### 📝 Git Workflow

```bash
# Merge dev → master
git checkout master
git merge dev
git push origin master

# Vercel detectó el push y deployó automáticamente a producción
```

### 💡 Lecciones Aprendidas

1. **Validar variables de entorno:** Siempre verificar que no tengan espacios o caracteres extra (especialmente al copiar/pegar)
2. **Endpoint de diagnóstico:** Muy útil para debugging de variables en servicios remotos
3. **Vercel CLI:** Más flexible que dashboard para monorepos con múltiples apps
4. **Railway caché:** A veces es necesario eliminar y recrear variables para limpiar caché corrupta

### 🔄 Próximos Pasos

1. **Probar funcionalidad completa** en las 3 apps de producción
2. **Crear productos de prueba** en cada tienda para verificar aislamiento de stocks
3. **Configurar backend de PRODUCCIÓN** cuando esté listo para usuarios finales
4. **Considerar dominios personalizados** (opcional): mundolib.app, majoli.app, lili.app

---

## 🎨 PERSONALIZACIÓN DE ICONOS Y LIMPIEZA (SESIÓN 7 - Continuación)

### 🐛 Problema Identificado

Después del deployment inicial, todas las apps mostraban:
- ❌ Mismo icono amarillo con letra "R"
- ❌ Mismo nombre "Mundo Lib" en PWA
- ❌ Mismos colores de tema

**Causa:** Al crear las apps de Majoli y Lili, se copiaron los archivos de Mundo Lib sin personalizar.

### ✅ Solución Implementada

#### 1. **Creación de Iconos SVG Personalizados**

Se crearon 3 iconos SVG únicos:
- **Mundo Lib:** Fondo amarillo (#F59E0B) con letra "M" blanca
- **Majoli:** Fondo verde (#10B981) con letra "M" blanca
- **Lili:** Fondo rosa (#EC4899) con letra "L" blanca

**Archivos creados:**
```
apps/mundolib-app/public/icon-mundolib.svg
apps/majoli-app/public/icon-majoli.svg
apps/lili-app/public/icon-lili.svg
```

**Ventajas de SVG:**
- Escalables sin pérdida de calidad
- Tamaño de archivo pequeño (texto)
- Compatibles con PWAs modernas

#### 2. **Actualización de vite.config.js**

Se actualizó el manifest de cada app con:

**Mundo Lib:**
```javascript
manifest: {
  name: 'Mundo Lib - Registro',
  short_name: 'Mundo Lib',
  theme_color: '#F59E0B',  // Amarillo
  icons: [{ src: '/icon-mundolib.svg', ... }]
}
```

**Majoli:**
```javascript
manifest: {
  name: 'Majoli - Registro',
  short_name: 'Majoli',
  theme_color: '#10B981',  // Verde
  icons: [{ src: '/icon-majoli.svg', ... }]
}
```

**Lili:**
```javascript
manifest: {
  name: 'Lili Cosméticos - Registro',
  short_name: 'Lili',
  theme_color: '#EC4899',  // Rosa
  icons: [{ src: '/icon-lili.svg', ... }]
}
```

#### 3. **Limpieza de Proyectos Duplicados**

**Problema:** El proceso de deployment creó 2 proyectos para Mundo Lib:
1. `catalogo-productos` (original, actualizado desde dashboard)
2. `mundolib-app` (nuevo, creado con CLI)

**Decisión:** Mantener `mundolib-app` por consistencia de nombres:
- ✅ mundolib-app
- ✅ majoli-app
- ✅ lili-app

**Acciones:**
1. Configurar variables de entorno en `mundolib-app`
2. Hacer redeploy con variables correctas
3. Eliminar proyecto `catalogo-productos` duplicado

### 📱 Resultado Final

**URLs de Producción:**

| Tienda | URL | Icono | Nombre PWA |
|--------|-----|-------|------------|
| Mundo Lib | https://mundolib-app.vercel.app | 🟡 Amarillo "M" | Mundo Lib |
| Majoli | https://majoli-app.vercel.app | 🟢 Verde "M" | Majoli |
| Lili | https://lili-app-ruddy.vercel.app | 🌸 Rosa "L" | Lili Cosméticos |

**Instalación en móvil:**
- Cada app tiene su propio icono de color en el home screen
- Nombres diferenciados para fácil identificación
- Colores de tema únicos al abrir la app

### 📝 Archivos Modificados

```
apps/mundolib-app/vite.config.js
apps/mundolib-app/public/icon-mundolib.svg
apps/majoli-app/vite.config.js
apps/majoli-app/public/icon-majoli.svg
apps/lili-app/vite.config.js
apps/lili-app/public/icon-lili.svg
```

**Commit:** `Agregar iconos SVG personalizados para cada tienda`

---

**SESIONES ANTERIORES:**
- ✅ **SESIÓN 5:** Mejoras Central Faltantes + Simplificación filtros Atención + Refinamiento Registro
- ✅ Modal detalle completo en faltantes
- ✅ Botones directos para cambio de estado (elimina navegación consecutiva)
- ✅ Eliminado estado "Verificando" del flujo de faltantes
- ✅ Filtros de Atención simplificados (solo "Solo Faltantes")
- ✅ Campo nombre opcional en Completar Registro
- ✅ Datos completos en tarjetas Completados (precios + ganancia + stock)
- ✅ Botón "Verificar OK ✓" para aprobar productos antes de pasar a Existentes

## 🛠️ HERRAMIENTAS CLI (Command Line Interface)

### 📊 Estado de Instalación

| CLI | Estado | Versión | Configuración |
|-----|--------|---------|---------------|
| **Railway CLI** | ✅ Instalado | 4.27.2 | ⏳ Pendiente vincular |
| **Supabase CLI** | ⏳ Pendiente | v2.72.7 | ⏳ Pendiente instalar |
| **Vercel CLI** | ✅ Instalado | 50.5.0 | ✅ Configurado |

---

## 🚂 RAILWAY CLI

### ✅ Ya Instalado
```bash
npm install -g @railway/cli
railway login  # Ya completado
```

### ⏳ Configuración Pendiente

**1. Vincular proyecto:**
```bash
cd C:\Users\Usuario\Desktop\catalogo-productos
railway link
# Selecciona: catalogo-productos
```

**2. Verificar vinculación:**
```bash
railway status
```

### 📚 Comandos Útiles

#### Ver Variables de Entorno:
```bash
# Listar todas las variables
railway variables

# Ver valor de una variable específica
railway variables get SUPABASE_SERVICE_ROLE_KEY
```

#### Configurar Variables:
```bash
# Agregar/actualizar variable
railway variables set KEY=value

# Ejemplo:
railway variables set SUPABASE_URL=https://zpvtovhomaykvcowbtda.supabase.co
```

#### Ver Logs en Tiempo Real:
```bash
# Logs del servicio
railway logs

# Logs con follow (stream en vivo)
railway logs --follow
```

#### Deploy y Status:
```bash
# Ver status del deployment
railway status

# Hacer deploy (desde código local)
railway up

# Ver servicios del proyecto
railway service
```

#### Ejecutar Comandos en el Contenedor:
```bash
# Abrir shell en el contenedor
railway shell

# Ejecutar comando específico
railway run node --version
```

### 💡 Casos de Uso en Este Proyecto

**1. Verificar variables de entorno (sin ir al dashboard):**
```bash
railway variables | grep SUPABASE
```

**2. Ver logs cuando hay errores:**
```bash
railway logs --follow
```

**3. Cambiar variables rápidamente:**
```bash
railway variables set SUPABASE_SERVICE_ROLE_KEY=nueva_key
```

**4. Ver deployments:**
```bash
railway status
```

---

## 🗄️ SUPABASE CLI

### ⏳ Instalación Pendiente

#### Método 1: Descarga Manual (Recomendado para Windows)

**1. Descargar:**
```
https://github.com/supabase/cli/releases/download/v2.72.7/supabase_windows_amd64.tar.gz
```

**2. Extraer:**
- Descomprimir el .tar.gz (usar 7-Zip o WinRAR)
- Encontrarás el archivo `supabase.exe`

**3. Instalar:**
```powershell
# Crear directorio (PowerShell como Admin)
mkdir "C:\Program Files\supabase"

# Mover el ejecutable
move supabase.exe "C:\Program Files\supabase\"

# Agregar al PATH
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\supabase", "Machine")
```

**4. Verificar:**
```bash
# Abrir nueva terminal
supabase --version
```

#### Método 2: Con Scoop (Alternativo)

```powershell
# Instalar Scoop (si no lo tienes)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 🔧 Configuración Inicial

**1. Login:**
```bash
supabase login
```

**2. Vincular proyecto:**
```bash
cd C:\Users\Usuario\Desktop\catalogo-productos
supabase link --project-ref zpvtovhomaykvcowbtda
```

### 📚 Comandos Útiles

#### Migraciones de Base de Datos:

```bash
# Ver status de migraciones
supabase db diff

# Aplicar migración
supabase db push

# Crear nueva migración
supabase migration new nombre_migracion

# Ver historial de migraciones
supabase migration list
```

#### Queries SQL:

```bash
# Ejecutar query desde terminal
supabase db query "SELECT * FROM productos LIMIT 5;"

# Ejecutar archivo SQL
supabase db execute -f database/migrations/001_agregar_multi_tienda.sql
```

#### Gestión de Datos:

```bash
# Resetear base de datos local
supabase db reset

# Seed de datos
supabase db seed

# Dump de base de datos
supabase db dump -f backup.sql
```

#### Ver Estructura:

```bash
# Ver tablas
supabase db list

# Inspeccionar tabla
supabase db inspect productos

# Ver tipos (TypeScript)
supabase gen types typescript
```

### 💡 Casos de Uso en Este Proyecto

**1. Ejecutar migraciones:**
```bash
# Aplicar migración multi-tienda
supabase db push database/migrations/001_agregar_multi_tienda.sql
```

**2. Verificar estructura de tablas:**
```bash
supabase db inspect productos
```

**3. Query rápida para debugging:**
```bash
supabase db query "SELECT id, descripcion, stock_mundo_lib, stock_majoli, stock_lili FROM productos LIMIT 10;"
```

**4. Backup de base de datos:**
```bash
supabase db dump -f backup_$(date +%Y%m%d).sql
```

---

## 🎯 COMPARACIÓN: CLI vs Dashboard Web

### Railway CLI vs Dashboard:

| Tarea | Dashboard Web | Railway CLI |
|-------|---------------|-------------|
| Ver variables | 5 clicks | `railway variables` |
| Cambiar variable | 6 clicks + redeploy | `railway variables set KEY=val` |
| Ver logs | 4 clicks | `railway logs` |
| Ver status | 3 clicks | `railway status` |

**Ahorro de tiempo estimado:** 70-80%

### Supabase CLI vs Dashboard:

| Tarea | Dashboard Web | Supabase CLI |
|-------|---------------|---------------|
| Ejecutar query | SQL Editor + copiar/pegar | `supabase db query "SELECT..."` |
| Aplicar migración | Subir archivo + ejecutar | `supabase db push archivo.sql` |
| Ver estructura | Table Editor + navegar | `supabase db inspect tabla` |
| Backup | Múltiples pasos | `supabase db dump -f backup.sql` |

**Ahorro de tiempo estimado:** 60-70%

---

## 📝 Checklist de Configuración

### Railway CLI:
- [x] Instalado (v4.27.2)
- [x] Login completado
- [x] Proyecto vinculado (acceptable-miracle / development)
- [x] Probado con `railway status`
- [ ] Servicio vinculado (requiere nombre del servicio)

### Supabase CLI:
- [x] Descargado de GitHub (v2.72.7)
- [x] Ejecutable en PATH (~/bin/supabase.exe)
- [ ] Login completado (requiere access token)
- [ ] Proyecto vinculado
- [ ] Probado con `supabase db query`

### Vercel CLI:
- [x] Instalado (v50.5.0)
- [x] Login completado
- [x] Proyectos deployados
- [x] Funcionando correctamente

---

## 🚀 Próximos Pasos - Completar Configuración

### 1. Railway CLI - Vincular Servicio

El proyecto ya está vinculado, pero falta vincular el servicio específico del backend.

**Opción A - Vía Railway Dashboard:**
1. Ve a https://railway.app/project/acceptable-miracle
2. Anota el nombre exacto del servicio backend
3. En la terminal ejecuta: `railway service <nombre-del-servicio>`

**Opción B - Listar servicios interactivamente (desde tu terminal CMD/PowerShell):**
```bash
cd C:\Users\Usuario\Desktop\catalogo-productos
railway service
# Selecciona el servicio backend cuando aparezca el menú
```

**Verificar que funciona:**
```bash
railway variables        # Debería mostrar las 4 variables de Supabase
railway logs --tail 50   # Debería mostrar logs del backend
```

### 2. Supabase CLI - Obtener Access Token

El CLI ya está instalado en `~/bin/supabase.exe`, solo falta autenticación.

**Obtener token:**
1. Ve a https://supabase.com/dashboard/account/tokens
2. Crea un nuevo token (nombre: "CLI Access")
3. Copia el token generado

**Configurar:**
```bash
export SUPABASE_ACCESS_TOKEN="tu_token_aqui"
# O agrégalo permanentemente a ~/.bashrc:
echo 'export SUPABASE_ACCESS_TOKEN="tu_token"' >> ~/.bashrc
```

**Vincular proyecto:**
```bash
cd C:\Users\Usuario\Desktop\catalogo-productos
supabase link --project-ref zpvtovhomaykvcowbtda
```

**Probar:**
```bash
supabase db query "SELECT COUNT(*) FROM productos;"
supabase db inspect productos
```

### 3. Verificación Final

Una vez completados los pasos anteriores:
```bash
# Railway
railway status
railway variables
railway logs --tail 20

# Supabase
supabase db query "SELECT tienda, COUNT(*) FROM productos GROUP BY tienda;"
```

---

## 💡 Beneficios para Futuras Sesiones

Con los CLIs configurados, en futuras sesiones podré:

✅ Ver y modificar variables de entorno sin pedirte que vayas al dashboard
✅ Ver logs en tiempo real para debugging
✅ Ejecutar migraciones de base de datos directamente
✅ Hacer queries SQL sin usar el SQL Editor
✅ Verificar status de deployments instantáneamente
✅ Ser ~75% más autónomo y eficiente

