-- ========================================
-- TABLA: empleados
-- Identifica a quién vende / modifica precios en el POS (Lili Cosméticos)
-- ========================================

CREATE TABLE IF NOT EXISTS empleados (
  id BIGSERIAL PRIMARY KEY,

  nombre VARCHAR(100) NOT NULL,
  pin VARCHAR(10) NOT NULL UNIQUE,

  rol VARCHAR(20) NOT NULL DEFAULT 'vendedor'
    CHECK (rol IN ('vendedor', 'admin')),

  activo BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empleados_pin ON empleados(pin);

-- ========================================
-- TABLA: ventas
-- Cabecera de cada venta hecha desde el POS
-- ========================================

CREATE TABLE IF NOT EXISTS ventas (
  id BIGSERIAL PRIMARY KEY,

  empleado_id BIGINT REFERENCES empleados(id) ON DELETE SET NULL,

  tienda VARCHAR(20) NOT NULL DEFAULT 'lili'
    CHECK (tienda IN ('mundo_lib', 'majoli', 'lili')),

  total DECIMAL(10,2) NOT NULL DEFAULT 0,

  medio_pago VARCHAR(20) NOT NULL
    CHECK (medio_pago IN ('efectivo', 'transferencia_qr')),

  estado VARCHAR(20) NOT NULL DEFAULT 'confirmada'
    CHECK (estado IN ('confirmada', 'anulada')),

  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventas_empleado_id ON ventas(empleado_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);

-- ========================================
-- TABLA: venta_items
-- Detalle de cada venta: qué producto/variante, cuánto y a qué precio
-- El precio_unitario queda "congelado" al momento de la venta (no se recalcula
-- si el precio del producto cambia después)
-- ========================================

CREATE TABLE IF NOT EXISTS venta_items (
  id BIGSERIAL PRIMARY KEY,

  venta_id BIGINT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
  variante_id INTEGER REFERENCES variantes(id) ON DELETE SET NULL,

  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Debe referenciar un producto o una variante (al menos uno)
  CHECK (producto_id IS NOT NULL OR variante_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_venta_items_venta_id ON venta_items(venta_id);
CREATE INDEX IF NOT EXISTS idx_venta_items_producto_id ON venta_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_venta_items_variante_id ON venta_items(variante_id);

-- ========================================
-- TABLA: historial_precios
-- Registra cada cambio de precio_compra_unidad / precio_venta_unidad de un producto
-- Se llena SOLA vía trigger (ver más abajo) — no requiere cambios en el backend
-- ========================================

CREATE TABLE IF NOT EXISTS historial_precios (
  id BIGSERIAL PRIMARY KEY,

  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,

  precio_compra_anterior DECIMAL(10,2),
  precio_compra_nuevo DECIMAL(10,2),
  precio_venta_anterior DECIMAL(10,2),
  precio_venta_nuevo DECIMAL(10,2),

  -- Nullable: hoy no hay sesión/PIN en los endpoints que editan precio fuera del POS
  modificado_por BIGINT REFERENCES empleados(id) ON DELETE SET NULL,

  fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_precios_producto_id ON historial_precios(producto_id);
CREATE INDEX IF NOT EXISTS idx_historial_precios_fecha ON historial_precios(fecha_cambio DESC);

-- ========================================
-- TABLA: movimientos_stock
-- Registra toda entrada/salida de stock (venta, traslado, ingreso, ajuste, devolución)
-- A diferencia de historial_precios, ESTA se llena a mano desde el backend
-- (el motivo del cambio solo lo conoce la aplicación, no la base de datos)
-- ========================================

CREATE TABLE IF NOT EXISTS movimientos_stock (
  id BIGSERIAL PRIMARY KEY,

  producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
  variante_id INTEGER REFERENCES variantes(id) ON DELETE SET NULL,

  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'salida')),

  motivo VARCHAR(20) NOT NULL
    CHECK (motivo IN ('venta', 'traslado', 'ingreso', 'ajuste', 'devolucion')),

  cantidad INTEGER NOT NULL CHECK (cantidad > 0),

  ubicacion VARCHAR(20) NOT NULL
    CHECK (ubicacion IN ('deposito', 'mundo_lib', 'majoli', 'lili')),

  -- Si el motivo es 'venta', queda linkeado a la venta que lo generó
  venta_id BIGINT REFERENCES ventas(id) ON DELETE SET NULL,
  empleado_id BIGINT REFERENCES empleados(id) ON DELETE SET NULL,

  notas TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (producto_id IS NOT NULL OR variante_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_movimientos_stock_producto_id ON movimientos_stock(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_stock_variante_id ON movimientos_stock(variante_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_stock_fecha ON movimientos_stock(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_movimientos_stock_motivo ON movimientos_stock(motivo);

-- ========================================
-- TRIGGER: registrar cambios de precio automáticamente
-- Se dispara en CUALQUIER UPDATE de productos que cambie precio_compra_unidad
-- o precio_venta_unidad, sin importar desde qué endpoint del backend venga
-- ========================================

CREATE OR REPLACE FUNCTION registrar_historial_precio()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.precio_compra_unidad IS DISTINCT FROM OLD.precio_compra_unidad)
     OR (NEW.precio_venta_unidad IS DISTINCT FROM OLD.precio_venta_unidad) THEN
    INSERT INTO historial_precios (
      producto_id,
      precio_compra_anterior, precio_compra_nuevo,
      precio_venta_anterior, precio_venta_nuevo
    ) VALUES (
      NEW.id,
      OLD.precio_compra_unidad, NEW.precio_compra_unidad,
      OLD.precio_venta_unidad, NEW.precio_venta_unidad
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_historial_precios ON productos;
CREATE TRIGGER trigger_historial_precios
  AFTER UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION registrar_historial_precio();

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- Mismo patrón permisivo que el resto del proyecto: el control de acceso
-- real hoy pasa por el backend (SERVICE_ROLE_KEY), no por RLS de usuario final
-- ========================================

ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_precios ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden leer empleados" ON empleados FOR SELECT USING (true);
CREATE POLICY "Todos pueden crear empleados" ON empleados FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos pueden actualizar empleados" ON empleados FOR UPDATE USING (true);

CREATE POLICY "Todos pueden leer ventas" ON ventas FOR SELECT USING (true);
CREATE POLICY "Todos pueden crear ventas" ON ventas FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos pueden actualizar ventas" ON ventas FOR UPDATE USING (true);

CREATE POLICY "Todos pueden leer venta_items" ON venta_items FOR SELECT USING (true);
CREATE POLICY "Todos pueden crear venta_items" ON venta_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden leer historial_precios" ON historial_precios FOR SELECT USING (true);
CREATE POLICY "Todos pueden crear historial_precios" ON historial_precios FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden leer movimientos_stock" ON movimientos_stock FOR SELECT USING (true);
CREATE POLICY "Todos pueden crear movimientos_stock" ON movimientos_stock FOR INSERT WITH CHECK (true);

-- ========================================
-- COMENTARIOS
-- ========================================

COMMENT ON TABLE empleados IS 'Vendedores/administradores del POS, identificados por PIN';
COMMENT ON TABLE ventas IS 'Cabecera de cada venta realizada en el POS';
COMMENT ON TABLE venta_items IS 'Detalle de productos/variantes vendidos en cada venta, con precio congelado al momento de vender';
COMMENT ON TABLE historial_precios IS 'Historial de cambios de precio_compra_unidad/precio_venta_unidad en productos. Se llena automáticamente vía trigger, no requiere cambios en el backend';
COMMENT ON TABLE movimientos_stock IS 'Historial de entradas/salidas de stock con motivo (venta, traslado, ingreso, ajuste, devolucion). Se llena a mano desde cada endpoint del backend que modifica stock';

COMMENT ON COLUMN venta_items.precio_unitario IS 'Precio de venta AL MOMENTO de la venta, no se actualiza si el precio del producto cambia después';
COMMENT ON COLUMN movimientos_stock.venta_id IS 'Solo se completa cuando motivo = venta, para trazar qué venta generó ese movimiento';
