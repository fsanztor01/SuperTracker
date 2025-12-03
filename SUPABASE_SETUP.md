# Configuración de Supabase para SuperTracker

Esta guía te ayudará a configurar Supabase para escalar SuperTracker y permitir sincronización de datos entre dispositivos.

## Pasos de Configuración

### 1. Crear un Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa la información del proyecto:
   - **Name**: SuperTracker (o el nombre que prefieras)
   - **Database Password**: Elige una contraseña segura (guárdala)
   - **Region**: Selecciona la región más cercana
5. Espera a que se cree el proyecto (puede tardar 1-2 minutos)

### 2. Obtener las Credenciales

1. En el panel de Supabase, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon/public key** (la clave pública)

### 3. Configurar el Código

1. Abre el archivo `supabase-config.js`
2. Reemplaza los valores de configuración:

```javascript
const SUPABASE_CONFIG = {
    url: 'TU_PROJECT_URL_AQUI', // Pega tu Project URL
    anonKey: 'TU_ANON_KEY_AQUI'  // Pega tu anon/public key
};
```

### 4. Crear las Tablas en la Base de Datos

1. En el panel de Supabase, ve a **SQL Editor**
2. Haz clic en **New Query**
3. Copia y pega el contenido completo del archivo `supabase-schema.sql`
4. Haz clic en **Run** (o presiona Ctrl+Enter)
5. Verifica que no haya errores

### 5. Configurar Row Level Security (RLS)

Las políticas RLS ya están incluidas en el script SQL, pero puedes verificarlas:

1. Ve a **Authentication** → **Policies**
2. Deberías ver las políticas para la tabla `user_data`:
   - Users can view own data
   - Users can insert own data
   - Users can update own data
   - Users can delete own data

### 6. Habilitar Autenticación por Email

1. Ve a **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. (Opcional) Configura la URL de redirección en **URL Configuration**

### 7. Probar la Configuración

1. Abre `index.html` en tu navegador
2. Deberías ver un botón de autenticación en el header
3. Haz clic en "Iniciar Sesión" o "Registrarse"
4. Crea una cuenta de prueba
5. Verifica que los datos se guarden correctamente

## Características Implementadas

### ✅ Sincronización en la Nube
- Todos los datos se guardan automáticamente en Supabase
- Los datos se sincronizan entre dispositivos en tiempo real

### ✅ Modo Offline
- Si no hay conexión, la app usa localStorage como respaldo
- Los cambios se sincronizan automáticamente cuando vuelve la conexión

### ✅ Autenticación de Usuarios
- Sistema de registro e inicio de sesión
- Cada usuario tiene sus propios datos aislados

### ✅ Seguridad
- Row Level Security (RLS) asegura que los usuarios solo accedan a sus propios datos
- Las contraseñas se almacenan de forma segura (hash)

## Migración de Datos Existentes

Si ya tienes datos en localStorage y quieres migrarlos a Supabase:

1. Inicia sesión en la aplicación
2. Los datos locales se cargarán automáticamente
3. Al guardar, se sincronizarán con Supabase
4. (Opcional) Puedes crear un script de migración personalizado

## Solución de Problemas

### Error: "Supabase not configured"
- Verifica que `supabase-config.js` tenga las credenciales correctas
- Asegúrate de que el archivo se carga antes de `supabase-service.js`

### Error: "Failed to fetch"
- Verifica que la URL de Supabase sea correcta
- Comprueba que no haya restricciones CORS
- Verifica tu conexión a internet

### Los datos no se sincronizan
- Verifica que estés autenticado (botón en el header)
- Revisa la consola del navegador para errores
- Asegúrate de que las políticas RLS estén configuradas correctamente

### Error al crear cuenta
- Verifica que la autenticación por email esté habilitada en Supabase
- Revisa la configuración de email en Supabase Settings

## Próximos Pasos (Opcional)

### Mejoras Adicionales

1. **Backup Automático**: Configurar backups periódicos
2. **Exportación de Datos**: Añadir funcionalidad para exportar datos
3. **Compartir Rutinas**: Permitir compartir rutinas entre usuarios
4. **Estadísticas Globales**: Comparar con otros usuarios (anónimo)
5. **Notificaciones Push**: Recordatorios de entrenamiento

### Optimizaciones

1. **Índices Adicionales**: Añadir índices para consultas más rápidas
2. **Caché Local**: Implementar estrategia de caché más sofisticada
3. **Compresión**: Comprimir datos antes de enviar a Supabase
4. **Paginación**: Para usuarios con muchos datos

## Soporte

Si tienes problemas con la configuración:
1. Revisa los logs en la consola del navegador (F12)
2. Revisa los logs en Supabase Dashboard → Logs
3. Consulta la documentación de Supabase: [https://supabase.com/docs](https://supabase.com/docs)




