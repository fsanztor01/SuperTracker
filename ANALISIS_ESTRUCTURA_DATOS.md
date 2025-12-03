# Análisis de Estructura de Datos - SuperTracker

## Estructura Actual de Datos

### 1. **Sesiones (Sessions)**
Cada sesión representa un entrenamiento realizado en una fecha específica:

```javascript
{
  id: "uuid",
  name: "Pecho/Espalda",
  date: "2024-01-15T00:00:00.000Z", // ISO string
  completed: true/false,
  exercises: [
    {
      id: "uuid",
      name: "Press banca",
      sets: [
        {
          id: "uuid",
          setNumber: 1,
          kg: "80",      // String (puede ser vacío)
          reps: "8",     // String (puede ser "6+1", "6-8", etc.)
          rir: "1"       // String (puede ser "1/0", etc.)
        }
      ]
    }
  ]
}
```

### 2. **Rutinas (Routines)**
Cada rutina es una plantilla con días y ejercicios planificados:

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
              kg: "80",    // String (planificado)
              reps: "8",   // String (planificado)
              rir: "1"     // String (planificado)
            }
          ]
        }
      ]
    }
  ]
}
```

### 3. **Datos Adicionales del Usuario**
El objeto completo que se guarda incluye:

```javascript
{
  sessions: [...],           // Array de sesiones
  routines: [...],           // Array de rutinas
  profile: {
    photo: "",
    avatarStyle: "avataaars",
    avatarSeed: "",
    firstName: "",
    lastName: "",
    height: "",
    weight: "",
    bodyFat: "",
    weightHistory: [],       // Array de {date, weight, bodyFat}
    bodyMeasurementsHistory: [] // Array de {date, arms, chest, waist, hips, legs, calves}
  },
  notes: [],                 // Array de notas rápidas
  prs: {},                   // Objeto con récords personales por ejercicio
  onerm: {},                 // Objeto con 1RM calculados
  exerciseNotes: {},         // Objeto con notas por ejercicio
  achievements: [],          // Array de logros desbloqueados
  streak: {
    current: 0,
    lastDate: null
  },
  weeklyGoal: {
    target: 3,
    current: 0
  },
  statsPeriod: "8weeks",
  goals: [],                 // Array de objetivos
  recentAchievements: []    // Array de logros recientes
}
```

## Análisis del Esquema de Base de Datos Actual

### ✅ **Tabla `user_data` - ADECUADA**
La tabla `user_data` con columna JSONB es **perfecta** para esta aplicación porque:
- Permite flexibilidad para cambios futuros
- Almacena toda la estructura anidada sin normalización compleja
- Es eficiente para lecturas/escrituras completas
- El índice en `user_id` es suficiente para consultas

### ✅ **Tabla `sessions` - OPCIONAL pero RECOMENDADA**
La tabla `sessions` es **opcional pero muy recomendable** si quieres:
- Consultar sesiones por fecha sin cargar todo el JSONB
- Filtrar sesiones completadas/incompletas
- Hacer análisis temporales más eficientes
- Mantener historial de sesiones individuales

**Recomendación:** Mantener ambas tablas:
- `user_data`: Para datos de configuración, rutinas, perfil, objetivos
- `sessions`: Para sesiones de entrenamiento (datos transaccionales)

## Recomendaciones de Mejora

### 1. **Tabla `sessions` - Mejoras Sugeridas**

Si decides usar la tabla `sessions`, considera añadir estos campos:

```sql
-- Mejoras opcionales para la tabla sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS volume DECIMAL(10,2); -- Volumen total calculado
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS exercise_count INTEGER; -- Número de ejercicios
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS set_count INTEGER; -- Número total de sets
```

### 2. **Tabla `routines` - NUEVA (Opcional)**

Si quieres consultar rutinas por separado:

```sql
CREATE TABLE IF NOT EXISTS routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    routine_data JSONB NOT NULL, -- Contiene days, exercises, sets
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routines"
    ON routines FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
    ON routines FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
    ON routines FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines"
    ON routines FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. **Tabla `goals` - NUEVA (Opcional)**

Si quieres consultar objetivos por separado:

```sql
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_data JSONB NOT NULL, -- Contiene name, type, target, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
    ON goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
    ON goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
    ON goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
    ON goals FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Conclusión

### ✅ **Esquema Actual: SUFICIENTE**
Tu esquema actual con `user_data` (JSONB) y `sessions` (opcional) es **suficiente** para la aplicación actual.

### 📊 **Recomendación Final**

**Opción 1: Mínima (Recomendada para empezar)**
- ✅ `user_data` - Para todo (suficiente)
- ✅ `sessions` - Opcional, pero útil para consultas por fecha

**Opción 2: Normalizada (Para escalabilidad futura)**
- ✅ `user_data` - Para perfil, configuración, notas
- ✅ `sessions` - Para sesiones de entrenamiento
- ✅ `routines` - Para rutinas (si necesitas consultarlas frecuentemente)
- ✅ `goals` - Para objetivos (si necesitas consultarlos frecuentemente)

### 🎯 **Mi Recomendación**

**Mantén tu esquema actual** (`user_data` + `sessions` opcional). Es perfecto porque:
1. Es simple y fácil de mantener
2. JSONB permite flexibilidad
3. `sessions` opcional permite consultas eficientes cuando las necesites
4. No necesitas normalizar más hasta que tengas problemas de rendimiento

**Solo añade tablas adicionales si:**
- Necesitas consultar rutinas/goals frecuentemente por separado
- Tienes problemas de rendimiento con el JSONB
- Necesitas hacer análisis complejos que requieren JOINs

