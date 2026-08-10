-- ========================================
-- Habilita traslados tienda -> tienda (no solo depósito -> tienda)
-- en el historial de movimientos_stock.
-- ========================================

-- De dónde salió el stock en un traslado (null para altas/ediciones que no son traslado)
ALTER TABLE movimientos_stock ADD COLUMN IF NOT EXISTS ubicacion_origen VARCHAR(20)
  CHECK (ubicacion_origen IN ('stock_deposito', 'stock_mundo_lib', 'stock_majoli', 'stock_lili'));

-- Ampliar los valores permitidos de "origen" para incluir traslado entre tiendas
ALTER TABLE movimientos_stock DROP CONSTRAINT IF EXISTS movimientos_stock_origen_check;
ALTER TABLE movimientos_stock ADD CONSTRAINT movimientos_stock_origen_check
  CHECK (origen IN ('alta_individual', 'alta_lote', 'agregar_stock', 'edicion_inventario', 'edicion_registro', 'traslado_deposito', 'traslado_tienda'));

COMMENT ON COLUMN movimientos_stock.ubicacion_origen IS 'Solo para movimientos de traslado: de dónde salió el stock (null para altas/ediciones que no son traslado)';
