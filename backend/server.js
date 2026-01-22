require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ==================== ENDPOINTS ====================

// 1. Obtener todos los productos (con paginación)
app.get('/api/productos', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('productos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Búsqueda por nombre o descripción
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,descripcion.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('productos')
      .select('*, precios_por_mayor(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Crear un producto nuevo
app.post('/api/productos', async (req, res) => {
  try {
    const productoData = req.body;

    const { data, error } = await supabase
      .from('productos')
      .insert([productoData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Actualizar un producto
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('📝 Actualizando producto:', id);
    console.log('📦 Datos recibidos:', updates);

    // Actualizar fechas de modificación si cambian los precios
    if (updates.precio_compra_unidad !== undefined) {
      updates.fecha_modif_precio_compra = new Date().toISOString();
    }
    if (updates.precio_venta_unidad !== undefined) {
      updates.fecha_modif_precio_venta = new Date().toISOString();
    }

    // Limpiar campos undefined o null
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || updates[key] === null || updates[key] === '') {
        delete updates[key];
      }
    });

    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log('✅ Producto actualizado:', data);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Error en actualización:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error desconocido',
      details: error 
    });
  }
});

// 5. Eliminar un producto
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Agregar precio por mayor a un producto
app.post('/api/productos/:id/precios-mayor', async (req, res) => {
  try {
    const { id } = req.params;
    const precioData = { ...req.body, producto_id: id };

    const { data, error } = await supabase
      .from('precios_por_mayor')
      .insert([precioData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Obtener productos con stock bajo (para reportes)
app.get('/api/reportes/stock-bajo', async (req, res) => {
  try {
    const { minimo = 10 } = req.query;

    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, cantidad_ingresada, categoria')
      .lte('cantidad_ingresada', minimo)
      .eq('estado', 'activo')
      .order('cantidad_ingresada', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// 8. Obtener productos por estado de registro (para las pestañas)
app.get('/api/productos/estado/:estado', async (req, res) => {
  try {
    const { estado } = req.params; // proceso, completado, existente
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('productos')
      .select('*', { count: 'exact' })
      .eq('estado_registro', estado)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Búsqueda
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,descripcion.ilike.%${search}%,nombre_producto.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Completar registro de producto (de proceso a completado)
app.put('/api/productos/:id/completar', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Marcar como completado
    updates.estado_registro = 'completado';
    updates.fecha_completado = new Date().toISOString();

    // Actualizar fechas de modificación de precios
    if (updates.precio_compra_unidad !== undefined) {
      updates.fecha_modif_precio_compra = new Date().toISOString();
    }
    if (updates.precio_venta_unidad !== undefined) {
      updates.fecha_modif_precio_venta = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Crear producto con datos mínimos (para "en proceso")
app.post('/api/productos/rapido', async (req, res) => {
  try {
    const { imagen, descripcion, cantidad_ingresada } = req.body;

    // Crear producto con datos mínimos
    const productoData = {
      imagen,
      nombre: descripcion, // Usar descripción como nombre temporal
      descripcion,
      cantidad_ingresada: parseInt(cantidad_ingresada),
      estado_registro: 'proceso',
      fecha_ingreso: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('productos')
      .insert([productoData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. Mover productos completados a existentes (ejecutar manualmente o con cron)
app.post('/api/productos/mover-completados', async (req, res) => {
  try {
    const { error } = await supabase.rpc('mover_completados_a_existentes');

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Productos completados movidos a existentes' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. Reportar producto como faltante
app.post('/api/productos/:id/reportar-faltante', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('productos')
      .update({
        faltante_reportado: true,
        fecha_reporte_faltante: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 13. Obtener todos los productos faltantes
app.get('/api/productos/faltantes/lista', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('faltante_reportado', true)
      .order('fecha_reporte_faltante', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 14. Endpoint de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Catálogo de Productos funcionando correctamente',
    version: '1.0.0'
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos conectada a Supabase`);
  console.log(`🌐 Accesible desde red en http://192.168.0.32:${PORT}`);
});