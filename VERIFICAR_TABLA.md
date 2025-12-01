# 🔍 Verificar que la Tabla Existe en Supabase

## ⚠️ Error 406 (Not Acceptable)

Este error puede ocurrir si:
1. La tabla no existe
2. Las políticas RLS no están configuradas correctamente
3. Hay un problema con los permisos

## ✅ Verificación Paso a Paso

### 1. Verificar que la Tabla Existe

1. Ve a tu proyecto en Supabase: https://app.supabase.com
2. En el menú lateral, haz clic en **"Table Editor"**
3. Deberías ver la tabla **`user_data`** en la lista
4. Si NO la ves, necesitas ejecutar el script SQL (ver `CREAR_TABLAS_SUPABASE.md`)

### 2. Verificar las Políticas RLS

1. En Supabase, ve a **"Authentication"** → **"Policies"**
2. Busca la tabla **`user_data`**
3. Deberías ver 4 políticas:
   - ✅ "Users can view own data" (SELECT)
   - ✅ "Users can insert own data" (INSERT)
   - ✅ "Users can update own data" (UPDATE)
   - ✅ "Users can delete own data" (DELETE)

### 3. Verificar la Estructura de la Tabla

1. En **"Table Editor"**, haz clic en la tabla **`user_data`**
2. Deberías ver estas columnas:
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key a auth.users)
   - `data` (JSONB)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

### 4. Si la Tabla No Existe

Ejecuta este SQL en el **SQL Editor**:

```sql
-- Verificar si la tabla existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_data';
```

Si no devuelve resultados, ejecuta el script completo de `supabase-schema.sql`.

### 5. Si las Políticas No Existen

Ejecuta este SQL en el **SQL Editor**:

```sql
-- Verificar políticas
SELECT * FROM pg_policies 
WHERE tablename = 'user_data';
```

Si está vacío, ejecuta la sección de políticas del script `supabase-schema.sql`.

## 🔧 Solución Rápida

Si la tabla no existe o falta algo, ejecuta TODO el contenido de `supabase-schema.sql` en el SQL Editor de Supabase.

## 📝 Nota

El error 406 también puede ocurrir si:
- El usuario no está autenticado correctamente
- Hay un problema con la sesión de autenticación

En ese caso, cierra sesión y vuelve a iniciar sesión en la aplicación.




