# 👋 CÓMO INICIAR UNA CONVERSACIÓN CON CLAUDE CODE

## 🚀 AL ABRIR UNA NUEVA SESIÓN:

### 1. Abre la terminal en VS Code

### 2. Ejecuta:
```bash
npx @anthropic-ai/claude-code
```

### 3. **IMPORTANTE** - Lo primero que debes escribir:
```
Lee el archivo NOTAS_DEV.md
```

### 4. Espera a que Claude lea el archivo

### 5. Ahora ya puedes trabajar normalmente
Claude ya sabe:
- ✅ Cómo está estructurado el proyecto
- ✅ Qué servicios usas (Railway, Vercel, Supabase, Cloudinary)
- ✅ Qué está pendiente
- ✅ Cómo funciona el workflow de Git
- ✅ Toda la configuración de la PWA

---

## 💡 EJEMPLO DE CONVERSACIÓN:

```
Tú: "Lee el archivo NOTAS_DEV.md"

Claude: [Lee el archivo y se pone al día]

Tú: "Ayúdame a agregar la vista de Inventario"

Claude: "Perfecto, voy a seguir el patrón de las otras vistas..."
```

---

## ⚠️ RECORDATORIOS IMPORTANTES:

### Antes de trabajar:
1. ✅ Asegúrate de estar en rama `dev`:
   ```bash
   git checkout dev
   ```

2. ✅ Verifica la rama actual:
   ```bash
   git branch
   ```
   Debe mostrar `* dev`

### Después de trabajar:
1. ✅ Si hiciste cambios importantes, actualiza `NOTAS_DEV.md`
2. ✅ Guarda tus cambios:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push origin dev
   ```

### Para pasar a producción:
**SOLO cuando todo funcione bien en dev:**
```bash
git checkout master
git merge dev
git push origin master
```
⚠️ **CUIDADO:** Esto actualiza la app que usan los usuarios

---

## 📁 ARCHIVOS IMPORTANTES:

- **NOTAS_DEV.md** ← Toda la documentación del proyecto (memoria de Claude)
- **LEEME_PRIMERO.md** ← Este archivo (cómo usar Claude Code)
- **COMO_INSTALAR_APP_EN_CELULAR.md** ← Instrucciones de instalación de la PWA

---

## 🐛 SI ALGO SALE MAL:

1. **Claude no entiende el contexto:**
   - Asegúrate de haberle pedido leer `NOTAS_DEV.md` primero

2. **Claude sugiere cambios raros:**
   - Recuérdale que lea `NOTAS_DEV.md` de nuevo
   - Dile específicamente qué NO debe cambiar

3. **Perdiste cambios:**
   - Revisa el historial de Git: `git log`
   - Recupera versiones anteriores si es necesario

---

## 🎯 FLUJO DE TRABAJO IDEAL:

```
1. Abrir VS Code
2. Ejecutar: npx @anthropic-ai/claude-code
3. Escribir: "Lee el archivo NOTAS_DEV.md"
4. Trabajar en lo que necesites
5. Actualizar NOTAS_DEV.md si hay cambios importantes
6. Guardar en Git
7. Cerrar cuando termines
```

---

## 💾 LO QUE CLAUDE NUNCA RECUERDA:

- ❌ Conversaciones anteriores
- ❌ Lo que hiciste ayer
- ❌ Decisiones que tomaron antes
- ❌ Problemas que ya resolvieron

## ✅ LO QUE CLAUDE SÍ PUEDE LEER:

- ✅ Tu código actual
- ✅ NOTAS_DEV.md (si se lo pides)
- ✅ Historial de commits de Git
- ✅ Cualquier archivo del proyecto

---

**¡Listo para empezar!** 🚀

Recuerda: **Siempre empieza con "Lee el archivo NOTAS_DEV.md"**
