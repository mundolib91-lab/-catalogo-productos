import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getProductosPorEstadoDirecto = async (estado, { tienda = null } = {}) => {
  let query = supabase
    .from('productos')
    .select('*, precios_por_mayor(*)')
    .eq('estado_registro', estado)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (tienda) query = query.eq('tienda_origen', tienda);

  const [{ data, error }, { data: total }] = await Promise.all([
    query,
    supabase.rpc('contar_productos_estado', {
      p_estado: estado,
      p_tienda: tienda || null,
      p_search: null
    })
  ]);

  if (error) throw error;

  return {
    success: true,
    data: data || [],
    pagination: { total: total || data?.length || 0 }
  };
};

export const getProductosInventarioDirecto = async ({ tienda = null } = {}) => {
  let query = supabase
    .from('productos')
    .select('*')
    .eq('estado_registro', 'existente')
    .order('descripcion', { ascending: true })
    .limit(1000);

  if (tienda) query = query.eq('tienda_origen', tienda);

  const { data, error } = await query;
  if (error) throw error;

  return {
    success: true,
    data: data || [],
    pagination: { total: data?.length || 0 }
  };
};
