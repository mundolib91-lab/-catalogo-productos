require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

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
    const { estado } = req.params; // proceso, completado, existente
    const { page = 1, limit = 20, search = '', tienda = null, incluir_sin_stock = 'false' } = req.query;
    const offset = (page - 1) * limit;
    const incluirSinStock = incluir_sin_stock === 'true';

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

    // Filtrar por tienda
    if (tienda) {
      if (incluirSinStock) {
        // Para Registro: mostrar productos de la tienda (con o sin stock)
        // Incluir productos donde: tienda_origen = tienda O stock > 0 en esa tienda
        if (tienda === 'mundo_lib') {
          query = query.or('tienda_origen.eq.mundo_lib,stock_mundo_lib.gt.0');
        } else if (tienda === 'majoli') {
          query = query.or('tienda_origen.eq.majoli,stock_majoli.gt.0');
        } else if (tienda === 'lili') {
          query = query.or('tienda_origen.eq.lili,stock_lili.gt.0');
        }
      } else {
        // Para Atención: solo productos con stock > 0
        if (tienda === 'mundo_lib') {
          query = query.gt('stock_mundo_lib', 0);
        } else if (tienda === 'majoli') {
          query = query.gt('stock_majoli', 0);
        } else if (tienda === 'lili') {
          query = query.gt('stock_lili', 0);
        }
      }
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

    // Obtener producto actual para validar con datos actualizados
    const { data: productoActual, error: errorGet } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (errorGet) throw errorGet;

    // Combinar datos actuales con updates para validación
    const productoFinal = { ...productoActual, ...updates };

    // Validar que tenga TODOS los datos mínimos requeridos
    // Para stock, verificar que al menos una tienda tenga stock > 0
    const tieneStock = (
      (productoFinal.stock_mundo_lib != null && productoFinal.stock_mundo_lib > 0) ||
      (productoFinal.stock_majoli != null && productoFinal.stock_majoli > 0) ||
      (productoFinal.stock_lili != null && productoFinal.stock_lili > 0)
    );

    const validaciones = {
      imagen: productoFinal.imagen && productoFinal.imagen.trim() !== '',
      precio_compra: productoFinal.precio_compra_unidad != null && productoFinal.precio_compra_unidad > 0,
      precio_venta: productoFinal.precio_venta_unidad != null && productoFinal.precio_venta_unidad > 0,
      descripcion: productoFinal.descripcion && productoFinal.descripcion.trim() !== '',
      stock: tieneStock
    };

    // Verificar si falta algún campo
    const camposFaltantes = Object.entries(validaciones)
      .filter(([campo, valido]) => !valido)
      .map(([campo]) => campo);

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Faltan datos requeridos para completar: ${camposFaltantes.join(', ')}`,
        camposFaltantes
      });
    }

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

// 10. Crear producto con datos mínimos (para "en proceso" o "completado")
app.post('/api/productos/rapido', async (req, res) => {
  try {
    // ESTRATEGIA: INSERT sin stock, luego UPDATE con stock y precios
    // Esto evita cualquier problema con DEFAULT en el INSERT

    // Determinar estado según si tiene precios completos
    const tienePreciosCompletos =
      req.body.precio_compra_unidad !== undefined &&
      req.body.precio_compra_unidad !== null &&
      req.body.precio_venta_unidad !== undefined &&
      req.body.precio_venta_unidad !== null;

    const estadoInicial = tienePreciosCompletos ? 'completado' : 'proceso';

    // 1. Insertar producto base SIN stock
    const productoBase = {
      nombre: req.body.descripcion,
      descripcion: req.body.descripcion,
      imagen: req.body.imagen || '',
      tienda_origen: req.body.tienda_origen || null,
      estado_registro: estadoInicial,
      fecha_ingreso: new Date().toISOString()
    };

    // Si tiene precios, agregarlos al insert
    if (tienePreciosCompletos) {
      productoBase.precio_compra_unidad = parseFloat(req.body.precio_compra_unidad);
      productoBase.precio_venta_unidad = parseFloat(req.body.precio_venta_unidad);
      productoBase.fecha_completado = new Date().toISOString();
      productoBase.fecha_modif_precio_compra = new Date().toISOString();
      productoBase.fecha_modif_precio_venta = new Date().toISOString();
    }

    const { data: newProducto, error: insertError } = await supabase
      .from('productos')
      .insert([productoBase])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

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
    const { tipo, proveedor, marca, productos, tienda } = req.body;

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

      // Determinar estado según si tiene precios completos
      const tienePreciosCompletos = precioCompra > 0 && precioVenta !== null && precioVenta > 0;
      const estadoInicial = tienePreciosCompletos ? 'completado' : 'proceso';

      const productoBase = {
        imagen: producto.imagen || '',
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        tienda_origen: tienda || null,
        cantidad_ingresada: cantidad,
        precio_compra_unidad: precioCompra,
        precio_venta_unidad: precioVenta,
        estado_registro: estadoInicial,
        created_at: new Date().toISOString()
      };

      // Si está completado, agregar fechas
      if (estadoInicial === 'completado') {
        productoBase.fecha_completado = new Date().toISOString();
        productoBase.fecha_modif_precio_compra = new Date().toISOString();
        productoBase.fecha_modif_precio_venta = new Date().toISOString();
      }

      // Asignar stock al campo específico de la tienda
      if (tienda === 'mundo_lib') {
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
