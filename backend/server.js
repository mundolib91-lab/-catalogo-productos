require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');

// Cloudflare R2
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar Supabase con SERVICE_ROLE_KEY para permisos completos
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const UBICACION_NOMBRES = {
  stock_deposito: 'depósito',
  stock_mundo_lib: 'Mundo Lib',
  stock_majoli: 'Majoli',
  stock_lili: 'Lili Cosméticos'
};

// Registra una entrada de stock en el historial (movimientos_stock).
// No lanza si falla: el historial es informativo, no debe tumbar la operación principal.
async function registrarMovimientoStock(productoId, ubicacion, cantidadAnterior, cantidadNueva, origen, ubicacionOrigen = null) {
  const anterior = cantidadAnterior || 0;
  const nueva = cantidadNueva || 0;
  if (nueva <= anterior) return; // solo se registran ingresos (subidas), no correcciones a la baja
  try {
    const { error } = await supabase.from('movimientos_stock').insert([{
      producto_id: productoId,
      ubicacion,
      cantidad_anterior: anterior,
      cantidad_nueva: nueva,
      cantidad_agregada: nueva - anterior,
      origen,
      ubicacion_origen: ubicacionOrigen
    }]);
    if (error) console.error('⚠️ No se pudo registrar movimiento de stock:', error.message);
  } catch (e) {
    console.error('⚠️ No se pudo registrar movimiento de stock:', e.message);
  }
}

// Registra un cambio de precio en el historial (historial_precios).
// A diferencia del stock, acá se registra CUALQUIER cambio real (sube o baja),
// no solo aumentos. No registra si el valor no cambió realmente.
async function registrarCambioPrecio(productoId, tipoPrecio, precioAnterior, precioNuevo, origen) {
  const anterior = precioAnterior != null ? parseFloat(precioAnterior) : null;
  const nuevo = parseFloat(precioNuevo);
  if (isNaN(nuevo)) return;
  if (anterior !== null && anterior === nuevo) return; // sin cambio real
  try {
    const { error } = await supabase.from('historial_precios').insert([{
      producto_id: productoId,
      tipo_precio: tipoPrecio,
      precio_anterior: anterior,
      precio_nuevo: nuevo,
      origen
    }]);
    if (error) console.error('⚠️ No se pudo registrar cambio de precio:', error.message);
  } catch (e) {
    console.error('⚠️ No se pudo registrar cambio de precio:', e.message);
  }
}

// ==================== ENDPOINT SUBIDA DE IMÁGENES ====================

app.post('/api/upload/imagen', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' });
    }

    const ext = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const url = `${process.env.R2_PUBLIC_URL}/${filename}`;
    res.json({ success: true, url });
  } catch (error) {
    console.error('Error subiendo imagen a R2:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ENDPOINTS ====================

// ==================== RUTAS ESPECÍFICAS (DEBEN IR ANTES DE :id) ====================

// Obtener lista de proveedores únicos
app.get('/api/productos/proveedores', async (req, res) => {
  console.log('🏢 Endpoint /api/productos/proveedores llamado');
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('proveedor')
      .not('proveedor', 'is', null)
      .order('proveedor');

    if (error) throw error;

    // Extraer valores únicos
    const proveedoresUnicos = [...new Set(data.map(p => p.proveedor).filter(p => p && p.trim() !== ''))];

    res.json({ success: true, data: proveedoresUnicos.sort() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener lista de marcas únicas
app.get('/api/productos/marcas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('marca')
      .not('marca', 'is', null)
      .order('marca');

    if (error) throw error;

    // Extraer valores únicos
    const marcasUnicas = [...new Set(data.map(p => p.marca).filter(m => m && m.trim() !== ''))];

    res.json({ success: true, data: marcasUnicas.sort() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener proveedores con estadísticas (cantidad de productos)
app.get('/api/proveedores/estadisticas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('proveedor')
      .not('proveedor', 'is', null);

    if (error) throw error;

    // Contar productos por proveedor
    const conteo = {};
    data.forEach(p => {
      if (p.proveedor && p.proveedor.trim()) {
        conteo[p.proveedor] = (conteo[p.proveedor] || 0) + 1;
      }
    });

    const resultado = Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad_productos: cantidad }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    res.json({ success: true, data: resultado });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener marcas con estadísticas (cantidad de productos)
app.get('/api/marcas/estadisticas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('marca')
      .not('marca', 'is', null);

    if (error) throw error;

    // Contar productos por marca
    const conteo = {};
    data.forEach(p => {
      if (p.marca && p.marca.trim()) {
        conteo[p.marca] = (conteo[p.marca] || 0) + 1;
      }
    });

    const resultado = Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad_productos: cantidad }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    res.json({ success: true, data: resultado });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Renombrar proveedor (actualiza todos los productos)
app.put('/api/proveedores/:nombreViejo/renombrar', async (req, res) => {
  try {
    const { nombreViejo } = req.params;
    const { nombreNuevo } = req.body;

    console.log(`📝 Renombrando proveedor "${nombreViejo}" → "${nombreNuevo}"`);

    if (!nombreNuevo || nombreNuevo.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El nombre nuevo no puede estar vacío'
      });
    }

    // Actualizar todos los productos con ese proveedor
    const { data, error } = await supabase
      .from('productos')
      .update({ proveedor: nombreNuevo })
      .eq('proveedor', nombreViejo)
      .select();

    if (error) throw error;

    console.log(`✅ ${data.length} productos actualizados`);

    res.json({
      success: true,
      message: `Proveedor renombrado exitosamente`,
      productosActualizados: data.length
    });
  } catch (error) {
    console.error('❌ Error al renombrar proveedor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Renombrar marca (actualiza todos los productos)
app.put('/api/marcas/:nombreViejo/renombrar', async (req, res) => {
  try {
    const { nombreViejo } = req.params;
    const { nombreNuevo } = req.body;

    console.log(`📝 Renombrando marca "${nombreViejo}" → "${nombreNuevo}"`);

    if (!nombreNuevo || nombreNuevo.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El nombre nuevo no puede estar vacío'
      });
    }

    // Actualizar todos los productos con esa marca
    const { data, error } = await supabase
      .from('productos')
      .update({ marca: nombreNuevo })
      .eq('marca', nombreViejo)
      .select();

    if (error) throw error;

    console.log(`✅ ${data.length} productos actualizados`);

    res.json({
      success: true,
      message: `Marca renombrada exitosamente`,
      productosActualizados: data.length
    });
  } catch (error) {
    console.error('❌ Error al renombrar marca:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== RUTAS GENERALES ====================

// 1. Obtener todos los productos (con paginación y filtro por tienda)
app.get('/api/productos', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      tienda = null,           // NUEVO: filtrar por tienda
      stock_minimo = null,      // NUEVO: solo productos con stock > X
      estado_registro = null    // Filtro por estado
    } = req.query;

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

    // NUEVO: Filtrar por tienda (stock disponible)
    if (tienda) {
      if (tienda === 'mundo_lib') {
        query = query.gt('stock_mundo_lib', stock_minimo || 0);
      } else if (tienda === 'majoli') {
        query = query.gt('stock_majoli', stock_minimo || 0);
      } else if (tienda === 'lili') {
        query = query.gt('stock_lili', stock_minimo || 0);
      }
    }

    // Filtrar por estado de registro
    if (estado_registro) {
      query = query.eq('estado_registro', estado_registro);
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
  const { id } = req.params;
  console.log(`🔍 Endpoint /api/productos/:id llamado con ID: "${id}"`);

  // Validar que el ID sea un número
  if (!/^\d+$/.test(id)) {
    console.log(`❌ ID no es numérico: "${id}"`);
    return res.status(400).json({
      success: false,
      error: `ID inválido: "${id}" no es un número`
    });
  }

  try {
    const { data, error} = await supabase
      .from('productos')
      .select('*, precios_por_mayor(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error(`❌ Error en GET /api/productos/:id:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Crear un producto nuevo
app.post('/api/productos', async (req, res) => {
  try {
    const productoData = { ...req.body };
    if (!productoData.fecha_ingreso) {
      productoData.fecha_ingreso = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([productoData])
      .select()
      .single();

    if (error) throw error;

    const camposStockCreacion = ['stock_deposito', 'stock_mundo_lib', 'stock_majoli', 'stock_lili'];
    for (const c of camposStockCreacion) {
      if (data[c] > 0) await registrarMovimientoStock(data.id, c, 0, data[c], 'alta_individual');
    }
    if (data.precio_compra_unidad) await registrarCambioPrecio(data.id, 'compra', null, data.precio_compra_unidad, 'alta_individual');
    if (data.precio_venta_unidad) await registrarCambioPrecio(data.id, 'venta', null, data.precio_venta_unidad, 'alta_individual');

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

    // Si sube algún stock, registrar fecha de ingreso (no cuenta si es una baja/corrección)
    const camposStock = ['stock_deposito', 'stock_mundo_lib', 'stock_majoli', 'stock_lili'];
    const stockTocado = camposStock.filter(c => updates[c] !== undefined && updates[c] !== null && updates[c] !== '');
    const precioCompraTocado = updates.precio_compra_unidad !== undefined && updates.precio_compra_unidad !== null && updates.precio_compra_unidad !== '';
    const precioVentaTocado = updates.precio_venta_unidad !== undefined && updates.precio_venta_unidad !== null && updates.precio_venta_unidad !== '';

    let stockAnterior = null;
    let precioCompraAnterior, precioVentaAnterior;
    if (stockTocado.length > 0 || precioCompraTocado || precioVentaTocado) {
      const camposASeleccionar = [...stockTocado];
      if (precioCompraTocado) camposASeleccionar.push('precio_compra_unidad');
      if (precioVentaTocado) camposASeleccionar.push('precio_venta_unidad');

      const { data: actual } = await supabase
        .from('productos')
        .select(camposASeleccionar.join(','))
        .eq('id', id)
        .single();

      if (stockTocado.length > 0) {
        stockAnterior = actual;
        if (actual && stockTocado.some(c => parseInt(updates[c]) > (actual[c] || 0))) {
          updates.fecha_ingreso = new Date().toISOString();
        }
      }
      if (precioCompraTocado) precioCompraAnterior = actual?.precio_compra_unidad;
      if (precioVentaTocado) precioVentaAnterior = actual?.precio_venta_unidad;
    }

    // Guardar los valores nuevos antes de la limpieza (por si alguno queda '' y se borra)
    const nuevoPrecioCompra = updates.precio_compra_unidad;
    const nuevoPrecioVenta = updates.precio_venta_unidad;

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

    if (stockAnterior) {
      for (const c of stockTocado) {
        await registrarMovimientoStock(id, c, stockAnterior[c], parseInt(updates[c]), 'edicion_registro');
      }
    }
    if (precioCompraTocado) await registrarCambioPrecio(id, 'compra', precioCompraAnterior, nuevoPrecioCompra, 'edicion_registro');
    if (precioVentaTocado) await registrarCambioPrecio(id, 'venta', precioVentaAnterior, nuevoPrecioVenta, 'edicion_registro');

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
    console.log(`🗑️ Eliminando producto ID: ${id}`);

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar:', error);
      throw error;
    }

    console.log(`✅ Producto ${id} eliminado correctamente`);
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
    const { estado } = req.params;
    const { page = 1, search = '', tienda = null } = req.query;
    const PAGE_SIZE = 1000; // límite real de Supabase free tier
    const offset = (page - 1) * PAGE_SIZE;

    // Conteo real via función SQL (evita el límite de 1000 de Supabase free tier)
    let dataQuery = supabase.from('productos').select('*')
      .eq('estado_registro', estado)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (search) dataQuery = dataQuery.or(`nombre.ilike.%${search}%,descripcion.ilike.%${search}%,nombre_producto.ilike.%${search}%`);
    if (tienda) dataQuery = dataQuery.eq('tienda_origen', tienda);

    const [{ data: totalData, error: countError }, { data, error: dataError }] = await Promise.all([
      supabase.rpc('contar_productos_estado', {
        p_estado: estado,
        p_tienda: tienda || null,
        p_search: search || null
      }),
      dataQuery
    ]);

    if (countError) throw countError;
    if (dataError) throw dataError;

    const count = totalData;

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: PAGE_SIZE,
        total: count,
        totalPages: Math.ceil(count / PAGE_SIZE)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Mover producto de completado a existente (MANUAL)
app.put('/api/productos/:id/pasar-existente', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`→ Moviendo producto ${id} de Completado a Existente`);

    const { data, error } = await supabase
      .from('productos')
      .update({
        estado_registro: 'existente'
      })
      .eq('id', id)
      .eq('estado_registro', 'completado') // Solo si está completado
      .select()
      .single();

    if (error) {
      console.error('❌ Error al mover a existente:', error);
      throw error;
    }

    if (!data) {
      console.log(`⚠️ Producto ${id} no está en estado completado`);
      return res.status(400).json({
        success: false,
        error: 'El producto no está en estado completado'
      });
    }

    console.log(`✅ Producto ${id} movido a Existente correctamente`);
    res.json({ success: true, data, message: 'Producto disponible en Existentes' });
  } catch (error) {
    console.error('❌ Error al mover a existente:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Completar registro de producto (de proceso a completado)
app.put('/api/productos/:id/completar', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Obtener producto actual
    const { data: productoActual, error: errorGet } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (errorGet) throw errorGet;

    // Actualizar fechas de modificación de precios si se modifican
    if (updates.precio_compra_unidad !== undefined) {
      updates.fecha_modif_precio_compra = new Date().toISOString();
    }
    if (updates.precio_venta_unidad !== undefined) {
      updates.fecha_modif_precio_venta = new Date().toISOString();
    }

    // Combinar datos actuales con updates para determinar el estado final
    const productoFinal = { ...productoActual, ...updates };

    // Verificar si tiene TODOS los datos necesarios para estar completado
    const tieneImagen = productoFinal.imagen && productoFinal.imagen.trim() !== '';
    const tieneDescripcion = productoFinal.descripcion && productoFinal.descripcion.trim() !== '';
    const tienePrecioCompra = productoFinal.precio_compra_unidad != null && productoFinal.precio_compra_unidad > 0;
    const tienePrecioVenta = productoFinal.precio_venta_unidad != null && productoFinal.precio_venta_unidad > 0;

    const estaCompleto = tieneImagen && tieneDescripcion && tienePrecioCompra && tienePrecioVenta;

    // Determinar estado según si está completo o no
    if (estaCompleto) {
      updates.estado_registro = 'completado';
      updates.fecha_completado = new Date().toISOString();
    } else {
      // Si no está completo, asegurar que se mantiene en proceso
      updates.estado_registro = 'proceso';
    }

    // Actualizar producto (siempre guarda los cambios, sin importar si está completo)
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (updates.precio_compra_unidad !== undefined) {
      await registrarCambioPrecio(id, 'compra', productoActual.precio_compra_unidad, updates.precio_compra_unidad, 'completar');
    }
    if (updates.precio_venta_unidad !== undefined) {
      await registrarCambioPrecio(id, 'venta', productoActual.precio_venta_unidad, updates.precio_venta_unidad, 'completar');
    }

    res.json({
      success: true,
      data,
      mensaje: estaCompleto
        ? 'Producto completado exitosamente'
        : 'Datos guardados. Completa imagen, descripción y ambos precios para marcar como completado'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Crear producto con datos mínimos (para "en proceso" o "completado")
app.post('/api/productos/rapido', async (req, res) => {
  try {
    // ESTRATEGIA: INSERT sin stock, luego UPDATE con stock y precios
    // Esto evita cualquier problema con DEFAULT en el INSERT

    // Determinar estado según si tiene datos completos para Atención al Cliente
    // Requiere: imagen, descripción y ambos precios (cantidad NO requerida)
    const tieneImagen = req.body.imagen && req.body.imagen.trim() !== '';
    const tieneDescripcion = req.body.descripcion && req.body.descripcion.trim() !== '';
    const tienePrecioCompra = req.body.precio_compra_unidad !== undefined &&
                              req.body.precio_compra_unidad !== null &&
                              parseFloat(req.body.precio_compra_unidad) > 0;
    const tienePrecioVenta = req.body.precio_venta_unidad !== undefined &&
                             req.body.precio_venta_unidad !== null &&
                             parseFloat(req.body.precio_venta_unidad) > 0;

    const estaCompleto = tieneImagen && tieneDescripcion && tienePrecioCompra && tienePrecioVenta;
    const estadoInicial = estaCompleto ? 'completado' : 'proceso';

    // 1. Insertar producto base SIN stock
    const productoBase = {
      nombre: req.body.descripcion,
      descripcion: req.body.descripcion,
      imagen: req.body.imagen || '',
      tienda_origen: req.body.tienda_origen || null,
      estado_registro: estadoInicial,
      fecha_ingreso: new Date().toISOString()
    };

    // Si está completo, agregar precios y fechas
    if (estaCompleto) {
      productoBase.precio_compra_unidad = parseFloat(req.body.precio_compra_unidad);
      productoBase.precio_venta_unidad = parseFloat(req.body.precio_venta_unidad);
      productoBase.fecha_completado = new Date().toISOString();
      productoBase.fecha_modif_precio_compra = new Date().toISOString();
      productoBase.fecha_modif_precio_venta = new Date().toISOString();
    } else if (tienePrecioCompra || tienePrecioVenta) {
      // Si tiene precios pero no está completo, guardarlos igual
      if (tienePrecioCompra) {
        productoBase.precio_compra_unidad = parseFloat(req.body.precio_compra_unidad);
      }
      if (tienePrecioVenta) {
        productoBase.precio_venta_unidad = parseFloat(req.body.precio_venta_unidad);
      }
    }

    const { data: newProducto, error: insertError } = await supabase
      .from('productos')
      .insert([productoBase])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    if (newProducto.precio_compra_unidad) await registrarCambioPrecio(newProducto.id, 'compra', null, newProducto.precio_compra_unidad, 'alta_individual');
    if (newProducto.precio_venta_unidad) await registrarCambioPrecio(newProducto.id, 'venta', null, newProducto.precio_venta_unidad, 'alta_individual');

    // 2. Actualizar con stock en una operación separada
    const updateData = {};

    if (req.body.stock_mundo_lib !== undefined && req.body.stock_mundo_lib !== null) {
      updateData.stock_mundo_lib = parseInt(req.body.stock_mundo_lib, 10);
    }
    if (req.body.stock_majoli !== undefined && req.body.stock_majoli !== null) {
      updateData.stock_majoli = parseInt(req.body.stock_majoli, 10);
    }
    if (req.body.stock_lili !== undefined && req.body.stock_lili !== null) {
      updateData.stock_lili = parseInt(req.body.stock_lili, 10);
    }

    // Solo hacer UPDATE si hay datos de stock
    if (Object.keys(updateData).length > 0) {
      // Primero hacer el UPDATE
      const { error: updateError } = await supabase
        .from('productos')
        .update(updateData)
        .eq('id', newProducto.id);

      if (updateError) {
        throw updateError;
      }

      for (const c of Object.keys(updateData)) {
        if (updateData[c] > 0) await registrarMovimientoStock(newProducto.id, c, 0, updateData[c], 'alta_individual');
      }

      // Luego hacer un SELECT separado para obtener el producto actualizado
      const { data: updatedProducto, error: selectError } = await supabase
        .from('productos')
        .select()
        .eq('id', newProducto.id)
        .single();

      if (selectError) {
        throw selectError;
      }

      return res.status(201).json({ success: true, data: updatedProducto });
    }

    res.status(201).json({ success: true, data: newProducto });
  } catch (error) {
    console.error('Error al crear producto:', error);
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

// ==================== ENDPOINTS REGISTRO POR LOTES ====================

// Crear lote de productos (por proveedor o por marca)
app.post('/api/productos/lote', async (req, res) => {
  try {
    const { tipo, proveedor, marca, productos, tienda, ubicacion = 'tienda' } = req.body;

    console.log('📦 Recibiendo lote de productos:', {
      tipo,
      proveedor,
      marca,
      tienda,
      cantidadProductos: productos?.length
    });

    // Validar que haya productos
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      console.error('❌ Error: No hay productos en el lote');
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar al menos un producto'
      });
    }

    // Preparar productos para insertar
    const productosParaInsertar = productos.map((producto, index) => {
      const cantidad = parseInt(producto.cantidad) || 0;
      const precioCompra = parseFloat(producto.precio_compra) || 0;
      const precioVenta = producto.precio_venta ? parseFloat(producto.precio_venta) : null;

      // Determinar estado según si tiene datos completos para Atención al Cliente
      // Requiere: imagen, descripción y ambos precios (cantidad NO requerida)
      const tieneImagen = producto.imagen && producto.imagen.trim() !== '';
      const tieneDescripcion = producto.descripcion && producto.descripcion.trim() !== '';
      const tienePrecioCompra = precioCompra > 0;
      const tienePrecioVenta = precioVenta !== null && precioVenta > 0;

      const estaCompleto = tieneImagen && tieneDescripcion && tienePrecioCompra && tienePrecioVenta;
      const estadoInicial = estaCompleto ? 'completado' : 'proceso';

      const productoBase = {
        imagen: producto.imagen || '',
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        tienda_origen: tienda || null,
        cantidad_ingresada: cantidad,
        precio_compra_unidad: precioCompra,
        precio_venta_unidad: precioVenta,
        estado_registro: estadoInicial,
        created_at: new Date().toISOString(),
        fecha_ingreso: new Date().toISOString()
      };

      // Si está completado, agregar fechas
      if (estadoInicial === 'completado') {
        productoBase.fecha_completado = new Date().toISOString();
        productoBase.fecha_modif_precio_compra = new Date().toISOString();
        productoBase.fecha_modif_precio_venta = new Date().toISOString();
      }

      // Asignar stock según ubicación elegida
      if (ubicacion === 'deposito') {
        productoBase.stock_deposito = cantidad;
      } else if (tienda === 'mundo_lib') {
        productoBase.stock_mundo_lib = cantidad;
      } else if (tienda === 'majoli') {
        productoBase.stock_majoli = cantidad;
      } else if (tienda === 'lili') {
        productoBase.stock_lili = cantidad;
      }

      // Asignar proveedor o marca según el tipo
      if (tipo === 'proveedor' && proveedor) {
        productoBase.proveedor = proveedor;
        productoBase.marca = producto.marca || null;
      } else if (tipo === 'marca' && marca) {
        productoBase.marca = marca;
        productoBase.proveedor = producto.proveedor || null;
      }

      console.log(`  Producto ${index + 1}:`, {
        descripcion: productoBase.descripcion,
        cantidad: productoBase.cantidad_ingresada,
        stock_tienda: cantidad,
        precio: productoBase.precio_compra_unidad
      });

      return productoBase;
    });

    console.log('💾 Insertando productos en Supabase...');

    // Insertar todos los productos
    const { data, error } = await supabase
      .from('productos')
      .insert(productosParaInsertar)
      .select();

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log(`✅ ${data.length} productos creados exitosamente`);

    const camposStockLote = ['stock_deposito', 'stock_mundo_lib', 'stock_majoli', 'stock_lili'];
    for (const p of data) {
      for (const c of camposStockLote) {
        if (p[c] > 0) await registrarMovimientoStock(p.id, c, 0, p[c], 'alta_lote');
      }
      if (p.precio_compra_unidad) await registrarCambioPrecio(p.id, 'compra', null, p.precio_compra_unidad, 'alta_lote');
      if (p.precio_venta_unidad) await registrarCambioPrecio(p.id, 'venta', null, p.precio_venta_unidad, 'alta_lote');
    }

    res.status(201).json({
      success: true,
      message: `${data.length} productos creados exitosamente`,
      data
    });
  } catch (error) {
    console.error('❌ Error al crear lote de productos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Migrar stock de productos viejos (temporal - para arreglar productos guardados antes del fix)
app.post('/api/productos/migrar-stock', async (req, res) => {
  try {
    console.log('🔧 Iniciando migración de stock...');

    // Obtener todos los productos en proceso/completado con cantidad_ingresada pero sin stock por tienda
    const { data: productos, error: fetchError } = await supabase
      .from('productos')
      .select('*')
      .in('estado_registro', ['proceso', 'completado'])
      .gt('cantidad_ingresada', 0);

    if (fetchError) throw fetchError;

    if (!productos || productos.length === 0) {
      return res.json({
        success: true,
        message: 'No hay productos para migrar',
        migrados: 0
      });
    }

    console.log(`📦 Encontrados ${productos.length} productos candidatos`);

    let migrados = 0;

    for (const producto of productos) {
      const cantidad = producto.cantidad_ingresada;

      // Solo migrar si todos los stocks están en 0
      if (producto.stock_mundo_lib === 0 && producto.stock_majoli === 0 && producto.stock_lili === 0) {
        // Determinar tienda por tienda_origen o asignar a mundo_lib por defecto
        const tienda = producto.tienda_origen || 'mundo_lib';

        const updates = {};
        if (tienda === 'mundo_lib') {
          updates.stock_mundo_lib = cantidad;
        } else if (tienda === 'majoli') {
          updates.stock_majoli = cantidad;
        } else if (tienda === 'lili') {
          updates.stock_lili = cantidad;
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('productos')
            .update(updates)
            .eq('id', producto.id);

          if (!updateError) {
            migrados++;
            console.log(`  ✅ Producto ${producto.id} migrado: ${cantidad} → stock_${tienda}`);
          } else {
            console.error(`  ❌ Error migrando producto ${producto.id}:`, updateError);
          }
        }
      }
    }

    console.log(`✅ Migración completada: ${migrados} productos actualizados`);

    res.json({
      success: true,
      message: `${migrados} productos migrados exitosamente`,
      migrados,
      total: productos.length
    });
  } catch (error) {
    console.error('❌ Error en migración:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ENDPOINTS FALTANTES ====================

// 14. Crear reporte de faltante
app.post('/api/faltantes', async (req, res) => {
  try {
    const { tipo, imagen, descripcion, prioridad, notas, origen, producto_id, tienda = 'mundo_lib' } = req.body;

    // Validar campos requeridos
    if (!tipo || !descripcion || !prioridad || !origen) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: tipo, descripcion, prioridad, origen'
      });
    }

    // Validar tipo
    if (!['existente', 'nuevo', 'grupo'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo inválido. Debe ser: existente, nuevo, o grupo'
      });
    }

    // Validar prioridad
    if (!['alta', 'media', 'baja'].includes(prioridad)) {
      return res.status(400).json({
        success: false,
        error: 'Prioridad inválida. Debe ser: alta, media, o baja'
      });
    }

    // Validar tienda
    if (!['mundo_lib', 'majoli', 'lili'].includes(tienda)) {
      return res.status(400).json({
        success: false,
        error: 'Tienda inválida. Debe ser: mundo_lib, majoli, o lili'
      });
    }

    // Construir objeto de datos
    const faltanteData = {
      tipo,
      estado: 'reportado',
      origen,
      prioridad,
      imagen,
      descripcion,
      notas: notas || null,
      fecha_reporte: new Date().toISOString(),
      tienda
    };

    // Si es tipo 'existente', copiar datos del producto
    if (tipo === 'existente' && producto_id) {
      const { data: producto, error: errorProducto } = await supabase
        .from('productos')
        .select('nombre, precio_compra_unidad, precio_venta_unidad, proveedor')
        .eq('id', producto_id)
        .single();

      if (!errorProducto && producto) {
        faltanteData.producto_id = producto_id;
        faltanteData.producto_nombre = producto.nombre;
        faltanteData.producto_precio_compra = producto.precio_compra_unidad;
        faltanteData.producto_precio_venta = producto.precio_venta_unidad;
        faltanteData.producto_proveedor = producto.proveedor;
      }
    }

    // Crear faltante
    const { data, error } = await supabase
      .from('faltantes')
      .insert([faltanteData])
      .select()
      .single();

    if (error) throw error;

    // Crear entrada en historial
    await supabase
      .from('faltantes_historial')
      .insert([{
        faltante_id: data.id,
        estado_anterior: null,
        estado_nuevo: 'reportado',
        nota: `Faltante reportado desde ${origen}`,
        rol_quien_cambio: origen
      }]);

    // Si es tipo 'existente', marcar producto como faltante
    if (tipo === 'existente' && producto_id) {
      await supabase
        .from('productos')
        .update({
          faltante_reportado: true,
          fecha_reporte_faltante: new Date().toISOString()
        })
        .eq('id', producto_id);
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error al crear faltante:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 15. Obtener todos los faltantes (con filtros)
app.get('/api/faltantes', async (req, res) => {
  try {
    const { estado, tipo, origen, prioridad, tienda, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('faltantes')
      .select('*', { count: 'exact' })
      .order('fecha_reporte', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplicar filtros
    if (estado) query = query.eq('estado', estado);
    if (tipo) query = query.eq('tipo', tipo);
    if (origen) query = query.eq('origen', origen);
    if (prioridad) query = query.eq('prioridad', prioridad);
    if (tienda) query = query.eq('tienda', tienda);

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
    console.error('Error al obtener faltantes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 16. Obtener un faltante por ID (con historial)
app.get('/api/faltantes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: faltante, error } = await supabase
      .from('faltantes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Obtener historial
    const { data: historial, error: errorHistorial } = await supabase
      .from('faltantes_historial')
      .select('*')
      .eq('faltante_id', id)
      .order('created_at', { ascending: true });

    if (errorHistorial) throw errorHistorial;

    res.json({
      success: true,
      data: {
        ...faltante,
        historial
      }
    });
  } catch (error) {
    console.error('Error al obtener faltante:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 17. Cambiar estado de faltante
app.put('/api/faltantes/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, nota, rol } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        error: 'El campo estado es requerido'
      });
    }

    // Validar estado
    const estadosValidos = ['reportado', 'en_verificacion', 'confirmado', 'en_compras', 'pedido', 'recibido', 'archivado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido'
      });
    }

    // Obtener estado actual
    const { data: faltanteActual, error: errorGet } = await supabase
      .from('faltantes')
      .select('estado')
      .eq('id', id)
      .single();

    if (errorGet) throw errorGet;

    // Actualizar estado
    const { data, error } = await supabase
      .from('faltantes')
      .update({
        estado,
        fecha_cambio_estado: new Date().toISOString(),
        ...(estado === 'archivado' && { fecha_archivado: new Date().toISOString() })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar en historial
    await supabase
      .from('faltantes_historial')
      .insert([{
        faltante_id: id,
        estado_anterior: faltanteActual.estado,
        estado_nuevo: estado,
        nota: nota || `Cambio de estado a ${estado}`,
        rol_quien_cambio: rol || 'sistema'
      }]);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== TRANSFERENCIAS ENTRE TIENDAS ====================

// 18. Crear transferencia de productos entre tiendas
app.post('/api/transferencias', async (req, res) => {
  try {
    const { producto_id, origen, destino, cantidad, notas, usuario = 'Sistema' } = req.body;

    // Validar datos
    if (!producto_id || !origen || !destino || !cantidad) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: producto_id, origen, destino, cantidad'
      });
    }

    // Validar que origen y destino sean diferentes
    if (origen === destino) {
      return res.status(400).json({
        success: false,
        error: 'Origen y destino deben ser diferentes'
      });
    }

    // Validar tiendas válidas
    const tiendasValidas = ['mundo_lib', 'majoli', 'lili'];
    if (!tiendasValidas.includes(origen) || !tiendasValidas.includes(destino)) {
      return res.status(400).json({
        success: false,
        error: 'Tienda inválida. Valores permitidos: mundo_lib, majoli, lili'
      });
    }

    // 1. Obtener producto actual
    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .select('*')
      .eq('id', producto_id)
      .single();

    if (errorProducto) throw errorProducto;

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // 2. Validar stock disponible en origen
    const stockOrigen = producto[`stock_${origen}`];
    if (cantidad > stockOrigen) {
      return res.status(400).json({
        success: false,
        error: `Stock insuficiente en ${origen}. Disponible: ${stockOrigen}, Solicitado: ${cantidad}`
      });
    }

    // 3. Calcular nuevos stocks
    const nuevoStockOrigen = stockOrigen - cantidad;
    const nuevoStockDestino = producto[`stock_${destino}`] + cantidad;

    // 4. Actualizar stocks del producto
    const updates = {};
    updates[`stock_${origen}`] = nuevoStockOrigen;
    updates[`stock_${destino}`] = nuevoStockDestino;

    const { error: errorUpdate } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', producto_id);

    if (errorUpdate) throw errorUpdate;

    // 5. Registrar transferencia en historial
    const { data: transferencia, error: errorTransferencia } = await supabase
      .from('transferencias')
      .insert([{
        producto_id,
        origen,
        destino,
        cantidad,
        notas,
        usuario
      }])
      .select()
      .single();

    if (errorTransferencia) throw errorTransferencia;

    res.json({
      success: true,
      data: transferencia,
      mensaje: `${cantidad} unidades transferidas de ${origen} a ${destino}`,
      stocks_actualizados: {
        [origen]: nuevoStockOrigen,
        [destino]: nuevoStockDestino
      }
    });
  } catch (error) {
    console.error('❌ Error en transferencia:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 19. Obtener historial de transferencias
app.get('/api/transferencias', async (req, res) => {
  try {
    const { producto_id, tienda, limit = 50 } = req.query;

    let query = supabase
      .from('transferencias')
      .select(`
        *,
        productos (
          id,
          descripcion,
          marca,
          imagen
        )
      `)
      .order('fecha', { ascending: false })
      .limit(parseInt(limit));

    // Filtrar por producto específico
    if (producto_id) {
      query = query.eq('producto_id', producto_id);
    }

    // Filtrar por tienda (transferencias donde participó)
    if (tienda) {
      query = query.or(`origen.eq.${tienda},destino.eq.${tienda}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Error al obtener transferencias:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ENDPOINTS INVENTARIO ====================

// Obtener todos los productos existentes para inventario
app.get('/api/inventario', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50, tienda = null } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('productos')
      .select('id, descripcion, nombre, imagen, marca, proveedor, stock_deposito, stock_mundo_lib, stock_majoli, stock_lili', { count: 'exact' })
      .eq('estado_registro', 'existente')
      .order('descripcion', { ascending: true })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.or(`descripcion.ilike.%${search}%,nombre.ilike.%${search}%,marca.ilike.%${search}%`);
    }

    // Filtrar por tienda: productos de esa tienda (con o sin stock)
    if (tienda === 'mundo_lib') {
      query = query.or('tienda_origen.eq.mundo_lib,stock_mundo_lib.gt.0');
    } else if (tienda === 'majoli') {
      query = query.or('tienda_origen.eq.majoli,stock_majoli.gt.0');
    } else if (tienda === 'lili') {
      query = query.or('tienda_origen.eq.lili,stock_lili.gt.0');
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
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar stock de una ubicación específica
app.patch('/api/inventario/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { ubicacion, cantidad } = req.body;

    const ubicacionesValidas = ['stock_deposito', 'stock_mundo_lib', 'stock_majoli', 'stock_lili'];
    if (!ubicacionesValidas.includes(ubicacion)) {
      return res.status(400).json({ success: false, error: 'Ubicación inválida' });
    }
    if (cantidad === undefined || cantidad === null || parseInt(cantidad) < 0) {
      return res.status(400).json({ success: false, error: 'Cantidad inválida' });
    }

    const nuevaCantidad = parseInt(cantidad);

    // Obtener stock actual para saber si esto es un ingreso (aumento) o una corrección hacia abajo
    const { data: actual, error: errorActual } = await supabase
      .from('productos')
      .select(ubicacion)
      .eq('id', id)
      .single();
    if (errorActual) throw errorActual;

    const updateData = { [ubicacion]: nuevaCantidad };
    if (nuevaCantidad > (actual[ubicacion] || 0)) {
      updateData.fecha_ingreso = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select('id, descripcion, stock_deposito, stock_mundo_lib, stock_majoli, stock_lili, fecha_ingreso')
      .single();

    if (error) throw error;

    await registrarMovimientoStock(id, ubicacion, actual[ubicacion], nuevaCantidad, 'edicion_inventario');

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trasladar unidades entre dos ubicaciones cualquiera (depósito, mundo_lib, majoli, lili)
app.post('/api/inventario/trasladar', async (req, res) => {
  try {
    const { producto_id, ubicacion_origen, ubicacion_destino, cantidad } = req.body;

    const ubicacionesValidas = ['stock_deposito', 'stock_mundo_lib', 'stock_majoli', 'stock_lili'];
    if (!ubicacionesValidas.includes(ubicacion_origen) || !ubicacionesValidas.includes(ubicacion_destino)) {
      return res.status(400).json({ success: false, error: 'Ubicación inválida' });
    }
    if (ubicacion_origen === ubicacion_destino) {
      return res.status(400).json({ success: false, error: 'El origen y el destino no pueden ser el mismo' });
    }
    if (!cantidad || parseInt(cantidad) <= 0) {
      return res.status(400).json({ success: false, error: 'Cantidad inválida' });
    }

    const { data: producto, error: errorGet } = await supabase
      .from('productos')
      .select('id, descripcion, stock_deposito, stock_mundo_lib, stock_majoli, stock_lili')
      .eq('id', producto_id)
      .single();

    if (errorGet) throw errorGet;

    const cant = parseInt(cantidad);
    if ((producto[ubicacion_origen] || 0) < cant) {
      return res.status(400).json({
        success: false,
        error: `Stock insuficiente en ${UBICACION_NOMBRES[ubicacion_origen]}. Disponible: ${producto[ubicacion_origen] || 0}, Solicitado: ${cant}`
      });
    }

    const { data, error } = await supabase
      .from('productos')
      .update({
        [ubicacion_origen]: (producto[ubicacion_origen] || 0) - cant,
        [ubicacion_destino]: (producto[ubicacion_destino] || 0) + cant,
        fecha_ingreso: new Date().toISOString()
      })
      .eq('id', producto_id)
      .select('id, descripcion, stock_deposito, stock_mundo_lib, stock_majoli, stock_lili, fecha_ingreso')
      .single();

    if (error) throw error;

    await registrarMovimientoStock(
      producto_id,
      ubicacion_destino,
      producto[ubicacion_destino],
      (producto[ubicacion_destino] || 0) + cant,
      ubicacion_origen === 'stock_deposito' ? 'traslado_deposito' : 'traslado_tienda',
      ubicacion_origen
    );

    res.json({
      success: true,
      data,
      mensaje: `${cant} unidades trasladadas de ${UBICACION_NOMBRES[ubicacion_origen]} a ${UBICACION_NOMBRES[ubicacion_destino]}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET historial de entradas de stock de un producto
app.get('/api/productos/:id/movimientos-stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('movimientos_stock')
      .select('*')
      .eq('producto_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET historial de cambios de precio de un producto
app.get('/api/productos/:id/historial-precios', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('historial_precios')
      .select('*')
      .eq('producto_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET todas las entradas de stock de un día (todos los productos), con datos del producto
app.get('/api/movimientos-stock', async (req, res) => {
  try {
    const { tienda } = req.query;
    // Fecha en formato YYYY-MM-DD. Por defecto, "hoy" en horario de Bolivia (UTC-4, sin horario de verano).
    const fecha = req.query.fecha || new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const inicio = new Date(`${fecha}T00:00:00-04:00`);
    const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('movimientos_stock')
      .select('*, producto:producto_id(id, descripcion, nombre, imagen, marca, tienda_origen)')
      .gte('created_at', inicio.toISOString())
      .lt('created_at', fin.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    let resultado = data || [];
    if (tienda) {
      resultado = resultado.filter(m => m.producto?.tienda_origen === tienda);
    }

    res.json({ success: true, data: resultado, fecha });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ENDPOINTS VARIANTES ====================

// GET variantes de un producto
app.get('/api/productos/:id/variantes', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('variantes')
      .select('*')
      .eq('producto_id', id)
      .order('tipo')
      .order('valor');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST crear variante
app.post('/api/productos/:id/variantes', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, valor, precio_compra, precio_venta, stock_deposito, stock_mundo_lib, stock_majoli, stock_lili } = req.body;

    if (!tipo || !valor) {
      return res.status(400).json({ success: false, error: 'tipo y valor son requeridos' });
    }

    const { data, error } = await supabase
      .from('variantes')
      .insert([{
        producto_id: parseInt(id),
        tipo,
        valor,
        precio_compra: precio_compra ? parseFloat(precio_compra) : null,
        precio_venta: precio_venta ? parseFloat(precio_venta) : null,
        stock_deposito: parseInt(stock_deposito) || 0,
        stock_mundo_lib: parseInt(stock_mundo_lib) || 0,
        stock_majoli: parseInt(stock_majoli) || 0,
        stock_lili: parseInt(stock_lili) || 0
      }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT actualizar variante (tipo, valor, precios)
app.put('/api/variantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, valor, precio_compra, precio_venta } = req.body;

    const updateData = {};
    if (tipo !== undefined) updateData.tipo = tipo;
    if (valor !== undefined) updateData.valor = valor;
    if (precio_compra !== undefined) updateData.precio_compra = precio_compra ? parseFloat(precio_compra) : null;
    if (precio_venta !== undefined) updateData.precio_venta = precio_venta ? parseFloat(precio_venta) : null;

    const { data, error } = await supabase
      .from('variantes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE variante
app.delete('/api/variantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('variantes').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH stock de una variante
app.patch('/api/variantes/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { ubicacion, cantidad } = req.body;

    const ubicacionesValidas = ['stock_deposito', 'stock_mundo_lib', 'stock_majoli', 'stock_lili'];
    if (!ubicacionesValidas.includes(ubicacion)) {
      return res.status(400).json({ success: false, error: 'Ubicacion invalida' });
    }
    if (parseInt(cantidad) < 0) {
      return res.status(400).json({ success: false, error: 'Cantidad no puede ser negativa' });
    }

    const { data, error } = await supabase
      .from('variantes')
      .update({ [ubicacion]: parseInt(cantidad) })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST trasladar deposito → tienda en variante
app.post('/api/variantes/:id/trasladar', async (req, res) => {
  try {
    const { id } = req.params;
    const { tienda_destino, cantidad } = req.body;

    const tiendasValidas = ['mundo_lib', 'majoli', 'lili'];
    if (!tiendasValidas.includes(tienda_destino)) {
      return res.status(400).json({ success: false, error: 'Tienda invalida' });
    }
    if (!cantidad || parseInt(cantidad) <= 0) {
      return res.status(400).json({ success: false, error: 'Cantidad invalida' });
    }

    const { data: variante, error: errorGet } = await supabase
      .from('variantes')
      .select('*')
      .eq('id', id)
      .single();
    if (errorGet) throw errorGet;

    const cant = parseInt(cantidad);
    if ((variante.stock_deposito || 0) < cant) {
      return res.status(400).json({
        success: false,
        error: `Stock insuficiente en deposito. Disponible: ${variante.stock_deposito || 0}`
      });
    }

    const { data, error } = await supabase
      .from('variantes')
      .update({
        stock_deposito: (variante.stock_deposito || 0) - cant,
        [`stock_${tienda_destino}`]: (variante[`stock_${tienda_destino}`] || 0) + cant
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

// ==================== ENDPOINTS POS (LILI) ====================

// POST login por PIN — identifica al empleado que va a operar el POS
app.post('/api/pos/login', async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || !pin.toString().trim()) {
      return res.status(400).json({ success: false, error: 'Falta el PIN' });
    }

    const { data: empleado, error } = await supabase
      .from('empleados')
      .select('id, nombre, rol, activo')
      .eq('pin', pin.toString().trim())
      .single();

    if (error || !empleado) {
      return res.status(401).json({ success: false, error: 'PIN incorrecto' });
    }

    if (!empleado.activo) {
      return res.status(403).json({ success: false, error: 'Empleado inactivo' });
    }

    // No devolver el PIN en la respuesta
    res.json({
      success: true,
      data: { id: empleado.id, nombre: empleado.nombre, rol: empleado.rol }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST registrar venta — crea la venta, sus items, descuenta stock y loguea el movimiento
app.post('/api/pos/venta', async (req, res) => {
  try {
    const { empleado_id, medio_pago, tienda = 'lili', items } = req.body;

    // Validaciones básicas
    if (!empleado_id) {
      return res.status(400).json({ success: false, error: 'Falta empleado_id' });
    }
    if (!['efectivo', 'transferencia_qr'].includes(medio_pago)) {
      return res.status(400).json({
        success: false,
        error: 'medio_pago inválido. Valores permitidos: efectivo, transferencia_qr'
      });
    }
    const tiendasValidas = ['mundo_lib', 'majoli', 'lili'];
    if (!tiendasValidas.includes(tienda)) {
      return res.status(400).json({ success: false, error: 'Tienda inválida' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'La venta necesita al menos un ítem' });
    }

    const campoStock = `stock_${tienda}`;
    const itemsResueltos = [];

    // 1. Resolver precio y validar stock de CADA ítem antes de escribir nada
    for (const item of items) {
      const { producto_id, variante_id, cantidad } = item;

      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ success: false, error: 'Cada ítem necesita cantidad > 0' });
      }
      if (!producto_id && !variante_id) {
        return res.status(400).json({ success: false, error: 'Cada ítem necesita producto_id o variante_id' });
      }

      if (variante_id) {
        const { data: variante, error } = await supabase
          .from('variantes')
          .select(`id, producto_id, precio_venta, ${campoStock}`)
          .eq('id', variante_id)
          .single();
        if (error || !variante) {
          return res.status(404).json({ success: false, error: `Variante ${variante_id} no encontrada` });
        }

        // Si la variante no tiene precio propio, hereda el del producto padre
        let precioUnitario = variante.precio_venta;
        if (precioUnitario == null) {
          const { data: padre, error: errorPadre } = await supabase
            .from('productos')
            .select('precio_venta_unidad')
            .eq('id', variante.producto_id)
            .single();
          if (errorPadre) throw errorPadre;
          precioUnitario = padre.precio_venta_unidad;
        }

        const stockDisponible = variante[campoStock] || 0;
        if (cantidad > stockDisponible) {
          return res.status(400).json({
            success: false,
            error: `Stock insuficiente para variante ${variante_id} en ${tienda}. Disponible: ${stockDisponible}`
          });
        }

        itemsResueltos.push({ variante_id, producto_id: null, cantidad, precioUnitario, stockActual: stockDisponible });
      } else {
        const { data: producto, error } = await supabase
          .from('productos')
          .select(`id, precio_venta_unidad, ${campoStock}`)
          .eq('id', producto_id)
          .single();
        if (error || !producto) {
          return res.status(404).json({ success: false, error: `Producto ${producto_id} no encontrado` });
        }

        const stockDisponible = producto[campoStock] || 0;
        if (cantidad > stockDisponible) {
          return res.status(400).json({
            success: false,
            error: `Stock insuficiente para producto ${producto_id} en ${tienda}. Disponible: ${stockDisponible}`
          });
        }

        itemsResueltos.push({
          producto_id, variante_id: null, cantidad,
          precioUnitario: producto.precio_venta_unidad,
          stockActual: stockDisponible
        });
      }
    }

    const total = itemsResueltos.reduce((acc, it) => acc + it.precioUnitario * it.cantidad, 0);

    // 2. Crear la cabecera de la venta
    const { data: venta, error: errorVenta } = await supabase
      .from('ventas')
      .insert([{ empleado_id, tienda, medio_pago, total }])
      .select()
      .single();
    if (errorVenta) throw errorVenta;

    // 3. Por cada ítem: guardar el detalle, descontar stock y loguear el movimiento
    const itemsGuardados = [];
    for (const it of itemsResueltos) {
      const subtotal = it.precioUnitario * it.cantidad;

      const { data: itemGuardado, error: errorItem } = await supabase
        .from('venta_items')
        .insert([{
          venta_id: venta.id,
          producto_id: it.producto_id,
          variante_id: it.variante_id,
          cantidad: it.cantidad,
          precio_unitario: it.precioUnitario,
          subtotal
        }])
        .select()
        .single();
      if (errorItem) throw errorItem;
      itemsGuardados.push(itemGuardado);

      const tabla = it.variante_id ? 'variantes' : 'productos';
      const idFila = it.variante_id || it.producto_id;

      const { error: errorStock } = await supabase
        .from(tabla)
        .update({ [campoStock]: it.stockActual - it.cantidad })
        .eq('id', idFila);
      if (errorStock) throw errorStock;

      const { error: errorMovimiento } = await supabase
        .from('movimientos_stock')
        .insert([{
          producto_id: it.producto_id,
          variante_id: it.variante_id,
          tipo: 'salida',
          motivo: 'venta',
          cantidad: it.cantidad,
          ubicacion: tienda,
          venta_id: venta.id,
          empleado_id
        }]);
      if (errorMovimiento) throw errorMovimiento;
    }

    res.status(201).json({ success: true, data: { ...venta, items: itemsGuardados } });
  } catch (error) {
    console.error('❌ Error registrando venta POS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 20. Endpoint de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Catálogo de Productos funcionando correctamente',
    version: '2.0.0 - Multi-tienda'
  });
});

// 21. Endpoint de diagnóstico (temporal)
app.get('/api/diagnostico', (req, res) => {
  res.json({
    success: true,
    env_check: {
      SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Configurada' : '❌ No configurada',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ No configurada',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada',
      PORT: process.env.PORT || 'default 5000',
      // Primeros caracteres para verificar (sin exponer la key completa)
      url_preview: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + '...' : 'N/A',
      key_preview: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : 'N/A'
    }
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos conectada a Supabase`);
  console.log(`🌐 Accesible desde red en http://192.168.0.32:${PORT}`);
});
