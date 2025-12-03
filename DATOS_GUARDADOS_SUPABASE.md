# Datos Guardados en Supabase - SuperTracker

## ✅ Resumen

**Todos los datos de usuario se guardan en Supabase.** Solo las preferencias de UI (tema y colores) se mantienen en localStorage, como está configurado actualmente.

## 📊 Datos Guardados en Supabase

Todos estos datos se guardan en la tabla `user_data` en la columna `data` (JSONB):

### 1. **Sesiones de Entrenamiento** (`sessions`)
```javascript
{
  id: "uuid",
  name: "Pecho/Espalda",
  date: "2024-01-15T00:00:00.000Z",
  completed: true/false,
  exercises: [
    {
      id: "uuid",
      name: "Press banca",
      sets: [
        {
          id: "uuid",
          setNumber: 1,
          kg: "80",
          reps: "8",
          rir: "1"
        }
      ]
    }
  ]
}
```

### 2. **Rutinas** (`routines`)
```javascript
{
  id: "uuid",
  name: "Fuerza 4 días",
  createdAt: "2024-01-01T00:00:00.000Z",
  days: [
    {
      id: "uuid",
      name: "Día 1 - Pecho",
      exercises: [
        {
          id: "uuid",
          name: "Press banca",
          sets: [
            {
              id: "uuid",
              kg: "80",
              reps: "8",
              rir: "1"
            }
          ]
        }
      ]
    }
  ]
}
```

### 3. **Perfil de Usuario** (`profile`)
```javascript
{
  photo: "",                    // Foto de perfil (base64 o URL)
  avatarStyle: "avataaars",     // Estilo de avatar generado
  avatarSeed: "",               // Seed para generar avatar
  firstName: "",                // Nombre
  lastName: "",                 // Apellidos
  height: "",                    // Altura (cm)
  weight: "",                    // Peso actual (kg)
  bodyFat: "",                  // % grasa corporal
  weightHistory: [              // Historial de peso
    {
      date: "2024-01-15",
      weight: "75",
      bodyFat: "15"
    }
  ],
  bodyMeasurementsHistory: [    // Historial de medidas corporales
    {
      date: "2024-01-15",
      arms: "35.5",
      chest: "100",
      waist: "80",
      hips: "95",
      legs: "60",
      calves: "38"
    }
  ]
}
```

### 4. **Notas Rápidas** (`notes`)
```javascript
[
  {
    id: "uuid",
    text: "Nota de ejemplo",
    createdAt: "2024-01-15T10:00:00.000Z"
  }
]
```

### 5. **Récords Personales** (`prs`)
```javascript
{
  "Press banca": {
    kg: 100,
    reps: 5,
    date: "2024-01-15"
  }
}
```

### 6. **1RM Calculados** (`onerm`)
```javascript
{
  "Press banca": 120.5  // 1RM estimado
}
```

### 7. **Notas de Ejercicios** (`exerciseNotes`)
```javascript
{
  "sessionId_exerciseId": "Nota sobre este ejercicio específico"
}
```

### 8. **Logros Desbloqueados** (`achievements`)
```javascript
[
  {
    id: "streak_7",
    name: "Racha de 7 días",
    unlockedAt: "2024-01-15T10:00:00.000Z"
  }
]
```

### 9. **Racha Actual** (`streak`)
```javascript
{
  current: 5,                    // Días consecutivos
  lastDate: "2024-01-15"         // Última fecha de entrenamiento
}
```

### 10. **Meta Semanal** (`weeklyGoal`)
```javascript
{
  target: 3,                     // Objetivo de sesiones por semana
  current: 2                     // Sesiones completadas esta semana
}
```

### 11. **Período de Estadísticas** (`statsPeriod`)
```javascript
"8weeks"  // Período seleccionado para estadísticas
```

### 12. **Objetivos** (`goals`)
```javascript
[
  {
    id: "uuid",
    name: "Aumentar press banca a 100kg",
    type: "weight",
    target: 100,
    current: 85,
    exercise: "Press banca",
    deadline: "2024-06-01",
    milestones: [
      {
        id: "uuid",
        target: 90,
        completed: false
      }
    ],
    createdAt: "2024-01-01T00:00:00.000Z"
  }
]
```

### 13. **Logros Recientes** (`recentAchievements`)
```javascript
[
  {
    id: "streak_7",
    name: "Racha de 7 días",
    unlockedAt: "2024-01-15T10:00:00.000Z"
  }
]
```

## 🎨 Datos NO Guardados en Supabase (localStorage)

Estos datos se mantienen en localStorage porque son preferencias de UI locales:

1. **Tema** (`trainingDiary.theme`): `"dark"` o `"light"`
2. **Colores** (`trainingDiary.colors`): Preferencias de colores para modo oscuro/claro

## 🔄 Flujo de Guardado

### Función `save()` en SuperTracker.js

Cada vez que se modifica cualquier dato, se llama a `save()` que:

1. Construye el payload con todos los datos:
   ```javascript
   const payload = {
     sessions: app.sessions,
     routines: app.routines,
     profile: app.profile,
     notes: app.notes,
     prs: app.prs || {},
     onerm: app.onerm || {},
     exerciseNotes: app.exerciseNotes || {},
     achievements: app.achievements || [],
     streak: app.streak || { current: 0, lastDate: null },
     weeklyGoal: app.weeklyGoal || { target: 3, current: 0 },
     statsPeriod: app.statsPeriod || '8weeks',
     goals: app.goals || [],
     recentAchievements: app.recentAchievements || []
   };
   ```

2. Guarda en Supabase a través de `supabaseService.saveUserData(payload)`

3. Si hay error, muestra mensaje al usuario (no hay fallback a localStorage)

### Función `load()` en SuperTracker.js

Al iniciar sesión:

1. Carga datos desde Supabase a través de `supabaseService.loadUserData()`
2. Si no hay datos, inicializa con valores por defecto
3. Parsea y carga todos los datos en el objeto `app`

## ✅ Verificación

**Estado actual:** ✅ **CORRECTO**

- ✅ Todos los datos de usuario se guardan en Supabase
- ✅ No hay fallback a localStorage para datos de usuario
- ✅ Solo temas y colores se mantienen en localStorage (como debe ser)
- ✅ La constante `STORAGE_KEY` está definida pero no se usa (código legacy, puede eliminarse)

## 🧹 Limpieza Opcional

Se puede eliminar la constante `STORAGE_KEY` en la línea 242 de SuperTracker.js ya que no se usa:

```javascript
// Línea 242 - Puede eliminarse
const STORAGE_KEY = 'trainingDiary.v8';
```

## 📝 Notas Importantes

1. **Autenticación requerida**: Todos los guardados requieren que el usuario esté autenticado
2. **Sin conexión**: Si no hay conexión, se muestra error y no se guarda (no hay fallback)
3. **Sincronización**: Los datos se sincronizan automáticamente cuando el usuario inicia sesión
4. **Seguridad**: Row Level Security (RLS) asegura que cada usuario solo vea sus propios datos

