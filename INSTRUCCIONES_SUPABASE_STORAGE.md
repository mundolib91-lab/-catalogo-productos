# 📸 Configuración de Supabase Storage para Imágenes

## Pasos para crear el bucket de almacenamiento:

### 1. Acceder a Supabase Dashboard
- Ve a: https://supabase.com/dashboard
- Inicia sesión con tu cuenta
- Selecciona tu proyecto "Mundo Lib"

### 2. Crear el Bucket
1. En el menú lateral, haz clic en **Storage**
2. Haz clic en el botón **"New bucket"** (o "Crear bucket")
3. Completa los datos:
   - **Name (Nombre):** `productos-imagenes`
   - **Public bucket:** ✅ Activa esta opción (para que las imágenes sean públicas)
   - **File size limit:** Puedes dejarlo en 50MB o ajustar según necesites
4. Haz clic en **"Create bucket"**

### 3. Configurar Políticas de Acceso (Policies)

El bucket necesita permisos para:
- ✅ **INSERT** - Permitir subir imágenes
- ✅ **SELECT** - Permitir ver/descargar imágenes
- ❌ **UPDATE** - No necesario
- ❌ **DELETE** - Opcional (por seguridad, mejor no permitir)

#### Crear política para SUBIR imágenes (INSERT):
1. Dentro del bucket `productos-imagenes`, ve a **Policies**
2. Haz clic en **"New Policy"**
3. Selecciona **"For full customization"** o **"Create a policy from scratch"**
4. Completa:
   - **Policy name:** `Permitir subir imágenes`
   - **Allowed operation:** `INSERT`
   - **Policy definition:**
   ```sql
   true
   ```
   (Esto permite a cualquier usuario autenticado subir imágenes)
5. Haz clic en **"Review"** y luego **"Save policy"**

#### Crear política para VER imágenes (SELECT):
1. Haz clic en **"New Policy"** nuevamente
2. Selecciona **"For full customization"**
3. Completa:
   - **Policy name:** `Permitir ver imágenes`
   - **Allowed operation:** `SELECT`
   - **Policy definition:**
   ```sql
   true
   ```
   (Esto permite a cualquiera ver las imágenes públicas)
4. Haz clic en **"Review"** y luego **"Save policy"**

### 4. Verificar configuración
- El bucket debe aparecer en la lista de Storage
- Debe tener el ícono de 🌐 (público)
- Debe tener 2 políticas activas

---

## ✅ ¡Listo!

Ahora tu aplicación puede:
- 📤 Subir imágenes desde el celular o PC
- 🖼️ Mostrar las imágenes en las tarjetas de productos
- 📸 Tomar fotos directamente desde la cámara del celular
- 🗂️ Almacenar imágenes en la nube de forma gratuita

---

## 📱 Cómo usar en la aplicación:

### Registro Rápido (botón +):
- Ahora verás un selector de imagen arriba
- Toca "Seleccionar Imagen" para elegir de galería o tomar foto
- La imagen se sube automáticamente

### Formulario Completo:
- Al completar un producto en proceso, puedes agregar/cambiar la imagen
- Aparece en la sección de "Datos ya registrados"

### Ver/Editar Producto:
- En modo lectura: Solo muestra la imagen
- En modo edición: Puedes cambiar la imagen con el selector

---

## 🔒 Seguridad:
- Las imágenes se almacenan con nombres únicos (timestamp + random)
- Límite de 5MB por imagen
- Solo acepta formatos de imagen (JPG, PNG, WebP, etc.)

## 💾 Almacenamiento:
- Supabase Free Tier: 1GB gratis
- Aprox. 500-1000 imágenes (dependiendo del tamaño)
