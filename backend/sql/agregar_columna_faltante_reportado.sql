-- Agregar columna faltante_reportado a tabla productos
-- Esta columna marca si un producto tiene un faltante activo reportado

ALTER TABLE productos
ADD COLUMN IF NOT EXISTS faltante_reportado BOOLEAN DEFAULT FALSE;

ALTER TABLE productos
ADD COLUMN IF NOT EXISTS fecha_reporte_faltante TIMESTAMP WITH TIME ZONE;

-- Crear índice para mejorar performance en consultas
CREATE INDEX IF NOT EXISTS idx_productos_faltante_reportado
ON productos(faltante_reportado)
WHERE faltante_reportado = true;

-- Comentarios para documentación
COMMENT ON COLUMN productos.faltante_reportado IS 'Indica si el producto tiene un faltante activo reportado';
COMMENT ON COLUMN productos.fecha_reporte_faltante IS 'Fecha del último reporte de faltante';
