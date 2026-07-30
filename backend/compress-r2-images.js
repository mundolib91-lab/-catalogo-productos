require('dotenv').config();
const https = require('https');
const http = require('http');
const sharp = require('sharp');
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

const CONCURRENCIA = 10;
const BATCH_SIZE = 50;
const MAX_BYTES = 300 * 1024;     // 300KB, igual que la subida nueva
const MAX_LADO = 1200;            // 1200px, igual que la subida nueva
const YA_OPTIMA_BYTES = 320 * 1024; // si ya está por debajo de esto, se salta
const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('⚠️  MODO DRY-RUN: no se subirá nada a R2\n');

function descargarImagen(url) {
  return new Promise((resolve, reject) => {
    const cliente = url.startsWith('https') ? https : http;
    const req = cliente.get(url, { timeout: 20000 }, (res) => {
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
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout descargando imagen')); });
  });
}

// Reduce calidad JPEG en pasos hasta entrar en MAX_BYTES (o hasta el piso de calidad)
async function comprimir(buffer) {
  const redimensionado = sharp(buffer).rotate().resize({
    width: MAX_LADO,
    height: MAX_LADO,
    fit: 'inside',
    withoutEnlargement: true,
  });

  let calidad = 80;
  let salida = await redimensionado.clone().jpeg({ quality: calidad }).toBuffer();

  while (salida.length > MAX_BYTES && calidad > 30) {
    calidad -= 10;
    salida = await redimensionado.clone().jpeg({ quality: calidad }).toBuffer();
  }

  return salida;
}

function keyDeUrl(url) {
  return decodeURIComponent(url.split('/').pop());
}

async function procesarProducto(producto) {
  const { id, imagen } = producto;
  try {
    const original = await descargarImagen(imagen);

    if (original.length <= YA_OPTIMA_BYTES) {
      return { ok: true, saltado: true };
    }

    const comprimida = await comprimir(original);
    const key = keyDeUrl(imagen);

    if (!DRY_RUN) {
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: comprimida,
        ContentType: 'image/jpeg',
      }));
    }

    return {
      ok: true,
      saltado: false,
      bytesAntes: original.length,
      bytesDespues: comprimida.length,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log('Consultando productos con imágenes migradas (nunca comprimidas)...');

  let todos = [];
  let desde = 0;
  while (true) {
    const { data, error } = await supabase
      .from('productos')
      .select('id, imagen')
      .ilike('imagen', '%/migrated_%')
      .range(desde, desde + 999);

    if (error) { console.error('Error consultando Supabase:', error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    todos = todos.concat(data);
    if (data.length < 1000) break;
    desde += 1000;
  }

  const total = todos.length;
  if (total === 0) {
    console.log('No se encontraron imágenes migradas pendientes de comprimir.');
    return;
  }
  console.log(`Encontradas: ${total} imágenes migradas\n`);

  let exitosos = 0, saltados = 0, fallidos = 0;
  let bytesAntesTotal = 0, bytesDespuesTotal = 0;
  const errores = [];

  async function procesarConConcurrencia(lista) {
    let idx = 0;
    async function worker() {
      while (idx < lista.length) {
        const producto = lista[idx++];
        const resultado = await procesarProducto(producto);
        if (resultado.ok) {
          if (resultado.saltado) {
            saltados++;
          } else {
            exitosos++;
            bytesAntesTotal += resultado.bytesAntes;
            bytesDespuesTotal += resultado.bytesDespues;
          }
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
    console.log(` ✓ (${exitosos} comprimidas, ${saltados} ya óptimas, ${fallidos} errores hasta ahora)`);
  }

  console.log(`\n========== RESULTADO ==========`);
  console.log(`Total procesados   : ${total}`);
  console.log(`Comprimidas        : ${exitosos}`);
  console.log(`Ya óptimas (saltadas): ${saltados}`);
  console.log(`Con error          : ${fallidos}`);
  if (exitosos > 0) {
    const mbAntes = (bytesAntesTotal / 1024 / 1024).toFixed(1);
    const mbDespues = (bytesDespuesTotal / 1024 / 1024).toFixed(1);
    console.log(`Peso total antes   : ${mbAntes} MB`);
    console.log(`Peso total después : ${mbDespues} MB`);
  }

  if (errores.length > 0) {
    console.log('\nProductos con error:');
    errores.forEach(e => console.log(`  id=${e.id}  error="${e.error}"  url=${e.url}`));
  }
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
