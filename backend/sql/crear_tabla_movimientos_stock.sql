-- ========================================
-- TABLA: movimientos_stock
-- Historial de entradas de stock por producto (fecha, cantidad, ubicación)
-- Solo registra INGRESOS (cuando el stock sube). Correcciones a la baja
-- no generan movimiento — esa misma regla ya la usa productos.fecha_ingreso.
-- ========================================

-- Por si quedó una versión incompleta de un intento anterior
DROP TABLE IF EXISTS movimientos_stock CASCADE;

CREATE TABLE IF NOT EXISTS movimientos_stock (
  id BIGSERIAL PRIMARY KEY,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,

  -- Dónde entró el stock
  ubicacion VARCHAR(20) NOT NULL
    CHECK (ubicacion IN ('stock_deposito', 'stock_mundo_lib', 'stock_majoli', 'stock_lili')),

  -- Cantidades
  cantidad_anterior INT NOT NULL DEFAULT 0,
  cantidad_nueva INT NOT NULL,
  cantidad_agregada INT NOT NULL, -- cantidad_nueva - cantidad_anterior (siempre > 0)

  -- De dónde vino el movimiento
  origen VARCHAR(30) NOT NULL DEFAULT 'edicion'
    CHECK (origen IN ('alta_individual', 'alta_lote', 'agregar_stock', 'edicion_inventario', 'edicion_registro', 'traslado_deposito')),

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_movimientos_stock_producto_id ON movimientos_stock(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_stock_created_at ON movimientos_stock(created_at DESC);

-- RLS (mismo patrón permisivo que el resto de las tablas del sistema)
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden leer movimientos_stock"
  ON movimientos_stock FOR SELECT
  USING (true);

CREATE POLICY "Todos pueden crear movimientos_stock"
  ON movimientos_stock FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE movimientos_stock IS 'Historial de entradas de stock por producto (no registra bajas/correcciones)';
COMMENT ON COLUMN movimientos_stock.origen IS 'alta_individual/alta_lote: producto recién creado. agregar_stock: botón +Stock en Registro. edicion_inventario: editar celda en Inventario. edicion_registro: Ver/Editar en Registro. traslado_deposito: traslado depósito->tienda';
