-- ========================================
-- TABLA: historial_precios
-- Historial de cambios de precio_compra_unidad y precio_venta_unidad.
-- A diferencia de movimientos_stock, acá se registra TODO cambio real
-- (sube o baja), porque ambas direcciones son información válida.
-- El precio con el que se crea el producto también cuenta como primera
-- entrada (precio_anterior = null).
-- ========================================

-- Por si quedó una versión incompleta de un intento anterior
DROP TABLE IF EXISTS historial_precios CASCADE;

CREATE TABLE IF NOT EXISTS historial_precios (
  id BIGSERIAL PRIMARY KEY,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,

  -- Qué precio cambió
  tipo_precio VARCHAR(10) NOT NULL CHECK (tipo_precio IN ('compra', 'venta')),

  -- Valores (precio_anterior null = es la primera vez que el producto tiene este precio)
  precio_anterior DECIMAL(10,2),
  precio_nuevo DECIMAL(10,2) NOT NULL,

  -- De dónde vino el cambio
  origen VARCHAR(30) NOT NULL DEFAULT 'edicion_registro'
    CHECK (origen IN ('alta_individual', 'alta_lote', 'completar', 'edicion_registro')),

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historial_precios_producto_id ON historial_precios(producto_id);
CREATE INDEX IF NOT EXISTS idx_historial_precios_created_at ON historial_precios(created_at DESC);

-- RLS (mismo patrón permisivo que el resto de las tablas del sistema)
ALTER TABLE historial_precios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden leer historial_precios"
  ON historial_precios FOR SELECT
  USING (true);

CREATE POLICY "Todos pueden crear historial_precios"
  ON historial_precios FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE historial_precios IS 'Historial de cambios de precio_compra_unidad y precio_venta_unidad por producto (incluye subidas y bajadas)';
