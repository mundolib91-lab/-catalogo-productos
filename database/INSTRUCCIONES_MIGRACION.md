# 📋 INSTRUCCIONES: Migrar Base de Datos a Multi-Tienda

## ⚠️ IMPORTANTE: Leer antes de ejecutar

Esta migración:
- ✅ NO borra datos existentes
- ✅ Solo AGREGA campos nuevos
- ✅ Migra datos actuales a `stock_mundo_lib`
- ✅ Es reversible (puedes hacer rollback)
- ⏱️ Tiempo estimado: 2-3 minutos

---

## 🚀 PASO A PASO

### 1. Hacer Backup (Recomendado)

Ve a Supabase Dashboard:
```
https://supabase.com/dashboard/project/zpvtovhomaykvcowbtda
```

1. Click en "Database" (menú izquierdo)
2. Click en "Backups" (pestaña superior)
3. Verifica que hay backups automáticos recientes
4. (Opcional) Haz backup manual: Click "Create backup"

---

### 2. Abrir SQL Editor

1. En Supabase Dashboard, click en "SQL Editor" (menú izquierdo)
2. Click en "+ New query" (botón verde arriba)

---

### 3. Copiar y Pegar el Script

1. Abre el archivo: `database/migrations/001_agregar_multi_tienda.sql`
2. Copia TODO el contenido (Ctrl+A, Ctrl+C)
3. Pega en el SQL Editor de Supabase (Ctrl+V)

---

### 4. Ejecutar la Migración

1. Click en el botón **"Run"** (o presiona Ctrl+Enter)
2. Espera a que termine (verás mensajes de éxito)
3. Al final verás una tabla con resultados:

```
tienda_origen | total_productos | total_mundo_lib | total_majoli | total_lili | total_general
--------------+-----------------+-----------------+--------------+------------+--------------
mundo_lib     | X               | X               | 0            | 0          | X
```

Esto confirma que la migración funcionó.

---

## ✅ VERIFICAR QUE FUNCIONÓ

Ejecuta estas queries de verificación:

### Query 1: Ver estructura de tabla productos
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'productos'
  AND column_name IN ('stock_mundo_lib', 'stock_majoli', 'stock_lili', 'tienda_origen', 'stock_total');
```

**Resultado esperado:** 5 columnas listadas

---

### Query 2: Ver tabla transferencias
```sql
SELECT * FROM transferencias LIMIT 1;
```

**Resultado esperado:** Tabla existe (aunque esté vacía)

---

### Query 3: Ver campo tienda en faltantes
```sql
SELECT id, descripcion, tienda FROM faltantes LIMIT 5;
```

**Resultado esperado:** Columna `tienda` existe y tiene valores

---

## 🎯 DESPUÉS DE LA MIGRACIÓN

### ¿Qué cambió?

**Tabla `productos`:**
- ✅ Nuevo: `stock_mundo_lib` (tu stock actual está aquí)
- ✅ Nuevo: `stock_majoli` (inicia en 0)
- ✅ Nuevo: `stock_lili` (inicia en 0)
- ✅ Nuevo: `stock_total` (suma automática)
- ✅ Nuevo: `tienda_origen` (todos = 'mundo_lib')

**Tabla `transferencias`:**
- ✅ Nueva tabla para registrar movimientos entre tiendas

**Tabla `faltantes`:**
- ✅ Nuevo: `tienda` (todos los existentes = 'mundo_lib')

---

## ❓ SI ALGO SALE MAL

### Error: "column already exists"
**Solución:** Ya ejecutaste la migración antes. Está bien, omite este paso.

### Error: "permission denied"
**Solución:** Usa el Service Role Key en vez del Anon Key.

### Quiero revertir la migración
```sql
-- CUIDADO: Esto borra las nuevas columnas
ALTER TABLE productos DROP COLUMN IF EXISTS stock_mundo_lib;
ALTER TABLE productos DROP COLUMN IF EXISTS stock_majoli;
ALTER TABLE productos DROP COLUMN IF EXISTS stock_lili;
ALTER TABLE productos DROP COLUMN IF EXISTS stock_total;
ALTER TABLE productos DROP COLUMN IF EXISTS tienda_origen;
DROP TABLE IF EXISTS transferencias;
ALTER TABLE faltantes DROP COLUMN IF EXISTS tienda;
```

---

## 📞 SIGUIENTE PASO

Una vez ejecutada la migración exitosamente:
✅ Avísame y continuamos con el backend

---

**Nota:** Si tienes dudas en cualquier paso, avísame ANTES de ejecutar.
