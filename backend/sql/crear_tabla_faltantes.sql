-- ========================================
-- TABLA: faltantes
-- Gestiona los 3 tipos de reportes de faltantes
-- ========================================

CREATE TABLE IF NOT EXISTS faltantes (
  id BIGSERIAL PRIMARY KEY,

  -- Tipo de faltante
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('existente', 'nuevo', 'grupo')),

  -- Estado del flujo
  estado VARCHAR(20) NOT NULL DEFAULT 'reportado'
    CHECK (estado IN ('reportado', 'en_verificacion', 'confirmado', 'en_compras', 'pedido', 'recibido', 'archivado')),

  -- Origen del reporte
  origen VARCHAR(20) NOT NULL DEFAULT 'atencion_cliente'
    CHECK (origen IN ('atencion_cliente', 'inventario')),

  -- Prioridad
  prioridad VARCHAR(10) NOT NULL DEFAULT 'media'
    CHECK (prioridad IN ('alta', 'media', 'baja')),

  -- Relación con producto (solo para tipo 'existente')
  producto_id BIGINT REFERENCES productos(id) ON DELETE SET NULL,

  -- Datos del reporte (para tipo 'nuevo' y 'grupo')
  imagen TEXT, -- URL de Cloudinary
  descripcion TEXT NOT NULL,
  notas TEXT,

  -- Datos adicionales para productos existentes (se copian del producto al reportar)
  producto_nombre TEXT,
  producto_precio_compra DECIMAL(10,2),
  producto_precio_venta DECIMAL(10,2),
  producto_proveedor TEXT,

  -- Control de tiempos
  fecha_reporte TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_cambio_estado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_archivado TIMESTAMP WITH TIME ZONE,

  -- Timestamps automáticos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_faltantes_estado ON faltantes(estado);
CREATE INDEX IF NOT EXISTS idx_faltantes_tipo ON faltantes(tipo);
CREATE INDEX IF NOT EXISTS idx_faltantes_origen ON faltantes(origen);
CREATE INDEX IF NOT EXISTS idx_faltantes_prioridad ON faltantes(prioridad);
CREATE INDEX IF NOT EXISTS idx_faltantes_producto_id ON faltantes(producto_id);
CREATE INDEX IF NOT EXISTS idx_faltantes_fecha_reporte ON faltantes(fecha_reporte DESC);

-- ========================================
-- TABLA: faltantes_historial
-- Registra todos los cambios de estado
-- ========================================

CREATE TABLE IF NOT EXISTS faltantes_historial (
  id BIGSERIAL PRIMARY KEY,
  faltante_id BIGINT NOT NULL REFERENCES faltantes(id) ON DELETE CASCADE,

  -- Cambio de estado
  estado_anterior VARCHAR(20),
  estado_nuevo VARCHAR(20) NOT NULL,

  -- Nota del cambio
  nota TEXT,

  -- Metadata
  rol_quien_cambio VARCHAR(50), -- 'atencion_cliente', 'inventario', 'compras', 'admin'

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para historial
CREATE INDEX IF NOT EXISTS idx_faltantes_historial_faltante_id ON faltantes_historial(faltante_id);

-- ========================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_faltantes_updated_at ON faltantes;
CREATE TRIGGER update_faltantes_updated_at
  BEFORE UPDATE ON faltantes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS
ALTER TABLE faltantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE faltantes_historial ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer faltantes
CREATE POLICY "Todos pueden leer faltantes"
  ON faltantes FOR SELECT
  USING (true);

-- Política: Todos pueden crear faltantes
CREATE POLICY "Todos pueden crear faltantes"
  ON faltantes FOR INSERT
  WITH CHECK (true);

-- Política: Todos pueden actualizar faltantes
CREATE POLICY "Todos pueden actualizar faltantes"
  ON faltantes FOR UPDATE
  USING (true);

-- Política: Todos pueden leer historial
CREATE POLICY "Todos pueden leer historial"
  ON faltantes_historial FOR SELECT
  USING (true);

-- Política: Todos pueden crear historial
CREATE POLICY "Todos pueden crear historial"
  ON faltantes_historial FOR INSERT
  WITH CHECK (true);

-- ========================================
-- COMENTARIOS
-- ========================================

COMMENT ON TABLE faltantes IS 'Gestiona los 3 tipos de reportes de faltantes: existente, nuevo, grupo';
COMMENT ON TABLE faltantes_historial IS 'Historial de cambios de estado de faltantes';

COMMENT ON COLUMN faltantes.tipo IS 'existente: producto en sistema, nuevo: no existe en sistema, grupo: varios productos/repisa';
COMMENT ON COLUMN faltantes.estado IS 'Flujo: reportado → en_verificacion → confirmado → en_compras → pedido → recibido → archivado';
COMMENT ON COLUMN faltantes.origen IS 'De donde se reportó: atencion_cliente o inventario';
COMMENT ON COLUMN faltantes.producto_id IS 'Solo para tipo existente: ID del producto en sistema';
COMMENT ON COLUMN faltantes.descripcion IS 'Para nuevo/grupo: descripción manual. Para existente: se copia del producto';
