# 🔧 Cómo Configurar Supabase con tus Credenciales

Esta guía te mostrará paso a paso cómo obtener tus credenciales de Supabase y configurarlas en la aplicación.

## 📋 Paso 1: Crear un Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Si no tienes cuenta, crea una (es gratis)
3. Una vez dentro, haz clic en **"New Project"**
4. Completa el formulario:
   - **Name**: `TrainTracker` (o el nombre que prefieras)
   - **Database Password**: Elige una contraseña segura ⚠️ **GUÁRDALA BIEN**
   - **Region**: Selecciona la región más cercana a ti
5. Haz clic en **"Create new project"**
6. Espera 1-2 minutos mientras se crea el proyecto

## 🔑 Paso 2: Obtener tus Credenciales

1. En el panel de Supabase, ve a **Settings** (⚙️) en el menú lateral
2. Haz clic en **API** en el submenú
3. Encontrarás dos valores importantes:

### **Project URL**
- Está en la sección **"Project URL"**
- Se ve así: `https://xxxxxxxxxxxxx.supabase.co`
- **Copia este valor completo**

### **anon public key**
- Está en la sección **"Project API keys"**
- Busca la clave que dice **"anon"** o **"public"**
- Es una cadena larga que empieza con `eyJ...`
- **Copia este valor completo**

## ⚙️ Paso 3: Configurar el Archivo

1. Abre el archivo **`supabase-config.js`** en tu editor
2. Verás algo así:

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // e.g., 'https://xxxxx.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Your anon/public key
};
```

3. **Reemplaza los valores**:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://tu-proyecto-id.supabase.co',  // ← Pega tu Project URL aquí
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // ← Pega tu anon key aquí
};
```

### ⚠️ Importante:
- **Mantén las comillas** alrededor de los valores
- **No dejes espacios** antes o después de las comillas
- **Copia los valores completos** sin cortar nada

## 📊 Paso 4: Crear las Tablas en la Base de Datos

1. En Supabase, ve a **SQL Editor** en el menú lateral
2. Haz clic en **"New query"**
3. Abre el archivo **`supabase-schema.sql`** en tu editor
4. **Copia TODO el contenido** del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **"Run"** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
7. Deberías ver un mensaje de éxito ✅

## ✅ Paso 5: Verificar la Configuración

1. Abre `index.html` en tu navegador
2. Abre la **Consola del Navegador** (F12 → Console)
3. Deberías ver uno de estos mensajes:

### ✅ Si está bien configurado:
```
✅ Supabase client initialized successfully
```

### ⚠️ Si hay algún problema:
```
⚠️ Supabase credentials not configured. Using localStorage fallback.
```
o
```
⚠️ Supabase client library not loaded. Using localStorage fallback.
```

4. Si ves el botón **"🔐 Iniciar Sesión"** en el header, ¡está funcionando!

## 🧪 Paso 6: Probar la Aplicación

1. Haz clic en **"🔐 Iniciar Sesión"** en el header
2. Haz clic en la pestaña **"Registrarse"**
3. Ingresa un email y contraseña
4. Haz clic en **"Registrarse"**
5. Deberías ver un mensaje de éxito
6. Ahora puedes iniciar sesión con esas credenciales

## 🔍 Solución de Problemas

### ❌ Error: "Supabase credentials not configured"
- Verifica que hayas reemplazado **AMBOS** valores en `supabase-config.js`
- Asegúrate de que las comillas estén correctas
- No dejes espacios extra

### ❌ Error: "Failed to fetch" o errores de red
- Verifica que la **Project URL** sea correcta
- Asegúrate de que tu proyecto de Supabase esté activo
- Revisa tu conexión a internet

### ❌ Error al crear cuenta: "Email rate limit exceeded"
- Espera unos minutos e intenta de nuevo
- O usa un email diferente

### ❌ Los datos no se guardan
- Verifica que hayas ejecutado el SQL (`supabase-schema.sql`)
- Revisa la consola del navegador para ver errores
- Asegúrate de estar autenticado (verás "👤 Cerrar Sesión" en el header)

## 📝 Ejemplo Completo

Aquí tienes un ejemplo de cómo debería verse tu `supabase-config.js` (con valores de ejemplo):

```javascript
// Supabase Configuration
// Replace these values with your Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api

const SUPABASE_CONFIG = {
    url: 'https://abcdefghijklmnop.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzIwMCwiZXhwIjoxOTU0NTQzMjAwfQ.abcdefghijklmnopqrstuvwxyz1234567890'
};

// ... resto del código ...
```

## 🎉 ¡Listo!

Una vez configurado, tu aplicación:
- ✅ Guardará datos en la nube
- ✅ Sincronizará entre dispositivos
- ✅ Funcionará offline (con localStorage como respaldo)
- ✅ Protegerá los datos de cada usuario

Si tienes problemas, revisa la consola del navegador (F12) para ver mensajes de error más detallados.




