-- ============================================
-- MIGRACIÓN: Sistema Multi-Tienda
-- Fecha: 2026-01-25
-- Descripción: Agrega soporte para múltiples tiendas
-- ============================================

-- 1. Agregar campos de stock por tienda a productos
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS stock_mundo_lib INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_majoli INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_lili INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tienda_origen VARCHAR(20) DEFAULT 'mundo_lib';

-- 2. Migrar datos existentes
-- Todo el stock actual va a stock_mundo_lib
UPDATE productos
SET stock_mundo_lib = COALESCE(cantidad_ingresada, 0),
    tienda_origen = 'mundo_lib'
WHERE stock_mundo_lib = 0;

-- 3. Agregar columna calculada para stock total
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS stock_total INT GENERATED ALWAYS AS
  (COALESCE(stock_mundo_lib, 0) + COALESCE(stock_majoli, 0) + COALESCE(stock_lili, 0))
STORED;

-- 4. Crear índices para queries rápidos
CREATE INDEX IF NOT EXISTS idx_productos_stock_mundo_lib ON productos(stock_mundo_lib);
CREATE INDEX IF NOT EXISTS idx_productos_stock_majoli ON productos(stock_majoli);
CREATE INDEX IF NOT EXISTS idx_productos_stock_lili ON productos(stock_lili);
CREATE INDEX IF NOT EXISTS idx_productos_tienda_origen ON productos(tienda_origen);

-- 5. Crear tabla de transferencias
CREATE TABLE IF NOT EXISTS transferencias (
  id SERIAL PRIMARY KEY,
  producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
  origen VARCHAR(20) NOT NULL CHECK (origen IN ('mundo_lib', 'majoli', 'lili')),
  destino VARCHAR(20) NOT NULL CHECK (destino IN ('mundo_lib', 'majoli', 'lili')),
  cantidad INT NOT NULL CHECK (cantidad > 0),
  usuario VARCHAR(100),
  fecha TIMESTAMP DEFAULT NOW(),
  notas TEXT,

  -- Constraint: origen y destino deben ser diferentes
  CONSTRAINT diferentes_tiendas CHECK (origen != destino)
);

-- Índices para transferencias
CREATE INDEX IF NOT EXISTS idx_transferencias_producto ON transferencias(producto_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_origen ON transferencias(origen);
CREATE INDEX IF NOT EXISTS idx_transferencias_destino ON transferencias(destino);
CREATE INDEX IF NOT EXISTS idx_transferencias_fecha ON transferencias(fecha DESC);

-- 6. Agregar campo tienda a faltantes
ALTER TABLE faltantes
ADD COLUMN IF NOT EXISTS tienda VARCHAR(20) DEFAULT 'mundo_lib'
CHECK (tienda IN ('mundo_lib', 'majoli', 'lili'));

-- Migrar faltantes existentes
UPDATE faltantes
SET tienda = 'mundo_lib'
WHERE tienda IS NULL;

-- Índice para faltantes por tienda
CREATE INDEX IF NOT EXISTS idx_faltantes_tienda ON faltantes(tienda);

-- 7. Crear vista para productos con stock por tienda
CREATE OR REPLACE VIEW productos_por_tienda AS
SELECT
  id,
  descripcion,
  nombre_producto,
  marca,
  proveedor,
  imagen,
  precio_compra_unidad,
  precio_venta_unidad,
  tienda_origen,
  estado_registro,

  -- Stock por tienda
  stock_mundo_lib,
  stock_majoli,
  stock_lili,
  stock_total,

  -- Flags de disponibilidad
  CASE WHEN stock_mundo_lib > 0 THEN TRUE ELSE FALSE END as disponible_mundo_lib,
  CASE WHEN stock_majoli > 0 THEN TRUE ELSE FALSE END as disponible_majoli,
  CASE WHEN stock_lili > 0 THEN TRUE ELSE FALSE END as disponible_lili,

  created_at
FROM productos;

-- 8. Función para registrar transferencia (automático)
CREATE OR REPLACE FUNCTION registrar_transferencia()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar stock suficiente en origen
  IF NEW.cantidad > OLD.stock_majoli AND NEW.origen = 'majoli' THEN
    RAISE EXCEPTION 'Stock insuficiente en Majoli. Disponible: %', OLD.stock_majoli;
  END IF;

  IF NEW.cantidad > OLD.stock_lili AND NEW.origen = 'lili' THEN
    RAISE EXCEPTION 'Stock insuficiente en Lili. Disponible: %', OLD.stock_lili;
  END IF;

  IF NEW.cantidad > OLD.stock_mundo_lib AND NEW.origen = 'mundo_lib' THEN
    RAISE EXCEPTION 'Stock insuficiente en Mundo Lib. Disponible: %', OLD.stock_mundo_lib;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================

-- Ver productos con stock en cada tienda
SELECT
  tienda_origen,
  COUNT(*) as total_productos,
  SUM(stock_mundo_lib) as total_mundo_lib,
  SUM(stock_majoli) as total_majoli,
  SUM(stock_lili) as total_lili,
  SUM(stock_total) as total_general
FROM productos
GROUP BY tienda_origen;

-- Ver si hay faltantes sin tienda
SELECT COUNT(*) as faltantes_sin_tienda
FROM faltantes
WHERE tienda IS NULL;

-- Resultado esperado: 0 faltantes sin tienda
