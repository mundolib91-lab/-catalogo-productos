require('dotenv').config();
const https = require('https');
const http = require('http');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CONCURRENCIA = 10;     // imágenes en paralelo
const BATCH_SIZE = 50;       // productos por lote (para el log)
const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('⚠️  MODO DRY-RUN: no se modificará nada en Supabase ni R2\n');


function descargarImagen(url) {
  return new Promise((resolve, reject) => {
    const cliente = url.startsWith('https') ? https : http;
    const req = cliente.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        descargarImagen(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} al descargar ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || 'image/jpeg' }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout descargando imagen')); });
  });
}

function contentTypeToExt(contentType) {
  const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
  return map[contentType.split(';')[0].trim()] || 'jpg';
}

async function migrarProducto(producto) {
  const { id, imagen } = producto;
  try {
    const { buffer, contentType } = await descargarImagen(imagen);
    const ext = contentTypeToExt(contentType);
    const filename = `migrated_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    if (!DRY_RUN) {
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: contentType,
      }));

      const nuevaUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
      const { error } = await supabase
        .from('productos')
        .update({ imagen: nuevaUrl })
        .eq('id', id);

      if (error) throw new Error(`Supabase update: ${error.message}`);
      return { ok: true, nuevaUrl };
    }
    return { ok: true, nuevaUrl: '(dry-run)', bytes: buffer.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log('Consultando productos con imágenes Cloudinary...');

  // Traer todos en páginas de 1000 (límite Supabase)
  let todos = [];
  let desde = 0;
  while (true) {
    const { data, error } = await supabase
      .from('productos')
      .select('id, imagen')
      .ilike('imagen', '%cloudinary%')
      .range(desde, desde + 999);

    if (error) { console.error('Error consultando Supabase:', error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    todos = todos.concat(data);
    if (data.length < 1000) break;
    desde += 1000;
  }

  const total = todos.length;
  if (total === 0) {
    console.log('No se encontraron productos con URLs de Cloudinary. ¡Ya están todos en R2!');
    return;
  }
  console.log(`Encontrados: ${total} productos con imágenes Cloudinary\n`);

  let exitosos = 0, fallidos = 0;
  const errores = [];

  // Procesa `todos` con CONCURRENCIA hilos, en lotes de BATCH_SIZE para el log
  async function procesarConConcurrencia(lista) {
    let idx = 0;
    async function worker() {
      while (idx < lista.length) {
        const producto = lista[idx++];
        const resultado = await migrarProducto(producto);
        if (resultado.ok) {
          exitosos++;
        } else {
          fallidos++;
          errores.push({ id: producto.id, url: producto.imagen, error: resultado.error });
        }
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCIA }, worker));
  }

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const lote = todos.slice(i, i + BATCH_SIZE);
    process.stdout.write(`Procesando ${i + 1}–${Math.min(i + BATCH_SIZE, total)} de ${total}...`);
    await procesarConConcurrencia(lote);
    console.log(` ✓ (${exitosos} ok, ${fallidos} errores hasta ahora)`);
  }

  console.log(`\n========== RESULTADO ==========`);
  console.log(`Total procesados : ${total}`);
  console.log(`Migrados con éxito: ${exitosos}`);
  console.log(`Con error        : ${fallidos}`);

  if (errores.length > 0) {
    console.log('\nProductos con error:');
    errores.forEach(e => console.log(`  id=${e.id}  error="${e.error}"  url=${e.url}`));
  }
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
