# 🗄️ Crear Tablas en Supabase - Guía Rápida

## ⚠️ Error Actual

Si ves este error en la consola:
```
Could not find the table 'public.user_data' in the schema cache
```

Significa que **las tablas no están creadas** en tu base de datos de Supabase.

## ✅ Solución: Ejecutar el Script SQL

### Paso 1: Abrir SQL Editor
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"** (botón verde en la parte superior)

### Paso 2: Copiar el Script
1. Abre el archivo **`supabase-schema.sql`** en tu editor
2. **Selecciona TODO** el contenido (Ctrl+A)
3. **Copia** el contenido (Ctrl+C)

### Paso 3: Pegar y Ejecutar
1. En el SQL Editor de Supabase, **pega** el contenido (Ctrl+V)
2. Haz clic en el botón **"Run"** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
3. Espera a que termine la ejecución

### Paso 4: Verificar
Deberías ver un mensaje de éxito. Si hay errores, aparecerán en rojo.

## 📋 Qué Crea el Script

El script crea:

1. **Tabla `user_data`**: Almacena todos los datos del usuario (sesiones, rutinas, perfil, etc.)
2. **Tabla `sessions`**: (Opcional) Para consultas más rápidas de sesiones
3. **Políticas de Seguridad (RLS)**: Asegura que cada usuario solo vea sus propios datos
4. **Índices**: Para consultas más rápidas
5. **Triggers**: Para actualizar timestamps automáticamente

## 🔄 Después de Ejecutar

1. **Recarga la aplicación** en tu navegador (F5)
2. Los errores de `404` deberían desaparecer
3. Deberías poder guardar y cargar datos correctamente

## ❓ Problemas Comunes

### Error: "relation already exists"
- **Solución**: Las tablas ya existen. Esto es normal, el script usa `IF NOT EXISTS`.

### Error: "permission denied"
- **Solución**: Asegúrate de estar logueado en Supabase y tener permisos en el proyecto.

### Error: "extension uuid-ossp does not exist"
- **Solución**: Esto es raro, pero si pasa, el script intenta crearlo automáticamente.

## 🎉 ¡Listo!

Una vez ejecutado el script, tu aplicación debería funcionar correctamente y poder guardar datos en Supabase.




