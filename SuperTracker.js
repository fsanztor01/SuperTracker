document.addEventListener('DOMContentLoaded', () => {
    /* =================== Utils & Theme =================== */
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const uuid = () => ((typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() :
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);
        })
    );

    const HTML_ESCAPE = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    function escapeHtml(str = '') {
        return str.replace(/[&<>"']/g, ch => HTML_ESCAPE[ch] || ch);
    }

    const TABLE_FRIEND_REQUESTS = 'friend_requests';

    const THEME_KEY = 'trainingDiary.theme';
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = $('#themeToggle');
    updateThemeButton(savedTheme);
    themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
        updateThemeButton(next);
        // Update colors for new theme
        updateThemeColors(next);
    });
    function updateThemeButton(theme) {
        themeBtn.setAttribute('aria-pressed', theme === 'light');
        themeBtn.textContent = theme === 'light' ? '☀️ Claro' : '🌙 Oscuro';
    }

    /* =================== Color Customization System =================== */
    const COLOR_STORAGE_KEY = 'trainingDiary.colors';

    // Color definitions: [primary, primary-600, accent, accent-600]
    const COLOR_PRESETS = {
        azul: {
            dark: { primary: '#388BFF', primary600: '#0011FF', accent: '#388BFF', accent600: '#0011FF' },
            light: { primary: '#388BFF', primary600: '#0011FF', accent: '#388BFF', accent600: '#0011FF' }
        },
        rojo: {
            dark: { primary: '#ff6b6b', primary600: '#ff3b30', accent: '#ff6b6b', accent600: '#ff3b30' },
            light: { primary: '#ff6b6b', primary600: '#ff3b30', accent: '#ff6b6b', accent600: '#ff3b30' }
        },
        verde: {
            dark: { primary: '#34c759', primary600: '#248a3d', accent: '#34c759', accent600: '#248a3d' },
            light: { primary: '#34c759', primary600: '#248a3d', accent: '#34c759', accent600: '#248a3d' }
        },
        amarillo: {
            dark: { primary: '#ffcc00', primary600: '#ff9500', accent: '#ffcc00', accent600: '#ff9500' },
            light: { primary: '#ffcc00', primary600: '#ff9500', accent: '#ffcc00', accent600: '#ff9500' }
        },
        morado: {
            dark: { primary: '#A24AFF', primary600: '#5800FA', accent: '#A24AFF', accent600: '#5800FA' },
            light: { primary: '#A24AFF', primary600: '#5800FA', accent: '#A24AFF', accent600: '#5800FA' }
        },
        rosa: {
            dark: { primary: '#f783ac', primary600: '#f06292', accent: '#f783ac', accent600: '#f06292' },
            light: { primary: '#ff2d55', primary600: '#d81b60', accent: '#ff2d55', accent600: '#d81b60' }
        },
        naranja: {
            dark: { primary: '#ff9500', primary600: '#ff6b00', accent: '#ff9500', accent600: '#ff6b00' },
            light: { primary: '#ff9500', primary600: '#ff6b00', accent: '#ff9500', accent600: '#ff6b00' }
        },
        cian: {
            dark: { primary: '#00D5FF', primary600: '#0090AD', accent: '#00D5FF', accent600: '#0090AD' },
            light: { primary: '#00D5FF', primary600: '#0090AD', accent: '#00D5FF', accent600: '#0090AD' }
        },
        gris: {
            dark: { primary: '#adb5bd', primary600: '#868e96', accent: '#adb5bd', accent600: '#868e96' },
            light: { primary: '#8e8e93', primary600: '#636366', accent: '#8e8e93', accent600: '#636366' }
        }
    };

    // Color display names
    const COLOR_NAMES = {
        azul: 'Azul',
        rojo: 'Rojo',
        verde: 'Verde',
        amarillo: 'Amarillo',
        morado: 'Morado',
        rosa: 'Rosa',
        naranja: 'Naranja',
        cian: 'Cian',
        gris: 'Gris'
    };

    // Load saved colors or use defaults
    function loadColorPreferences() {
        try {
            const saved = localStorage.getItem(COLOR_STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Error loading color preferences:', e);
        }
        return { dark: 'azul', light: 'azul' };
    }

    // Save color preferences
    function saveColorPreferences(prefs) {
        try {
            localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(prefs));
        } catch (e) {
            console.warn('Error saving color preferences:', e);
        }
    }

    // Update CSS variables for current theme
    function updateThemeColors(theme) {
        const prefs = loadColorPreferences();
        const colorKey = prefs[theme] || 'azul';
        const colors = COLOR_PRESETS[colorKey][theme];

        const root = document.documentElement;
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--primary-600', colors.primary600);
        root.style.setProperty('--accent', colors.accent);
        root.style.setProperty('--accent-600', colors.accent600);

        // Update focus colors based on primary
        const primaryRgb = hexToRgb(colors.primary);
        if (primaryRgb) {
            root.style.setProperty('--focus', `0 0 0 3px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)`);
            root.style.setProperty('--focus-keyboard', `0 0 0 2px ${colors.primary}, 0 0 12px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`);
            root.style.setProperty('--primary-glow', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)`);
        }
    }

    // Convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Set color for a specific theme
    function setThemeColor(theme, colorKey) {
        const prefs = loadColorPreferences();
        prefs[theme] = colorKey;
        saveColorPreferences(prefs);

        // Update if this is the current theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === theme) {
            updateThemeColors(theme);
        }

        // Update swatches
        renderColorSwatches();
    }

    // Render color swatches
    function renderColorSwatches() {
        const prefs = loadColorPreferences();
        const darkSwatches = $('#colorSwatchesDark');
        const lightSwatches = $('#colorSwatchesLight');

        if (!darkSwatches || !lightSwatches) return;

        darkSwatches.innerHTML = '';
        lightSwatches.innerHTML = '';

        Object.keys(COLOR_PRESETS).forEach(colorKey => {
            const colors = COLOR_PRESETS[colorKey];

            // Dark theme swatch
            const darkSwatch = document.createElement('button');
            darkSwatch.className = 'color-swatch';
            darkSwatch.setAttribute('aria-label', `Color ${COLOR_NAMES[colorKey]} para modo oscuro`);
            darkSwatch.style.setProperty('--swatch-color', colors.dark.primary);
            darkSwatch.dataset.colorKey = colorKey;
            darkSwatch.dataset.theme = 'dark';
            if (prefs.dark === colorKey) {
                darkSwatch.classList.add('active');
            }
            darkSwatch.addEventListener('click', () => setThemeColor('dark', colorKey));
            darkSwatches.appendChild(darkSwatch);

            // Light theme swatch
            const lightSwatch = document.createElement('button');
            lightSwatch.className = 'color-swatch';
            lightSwatch.setAttribute('aria-label', `Color ${COLOR_NAMES[colorKey]} para modo claro`);
            lightSwatch.style.setProperty('--swatch-color', colors.light.primary);
            lightSwatch.dataset.colorKey = colorKey;
            lightSwatch.dataset.theme = 'light';
            if (prefs.light === colorKey) {
                lightSwatch.classList.add('active');
            }
            lightSwatch.addEventListener('click', () => setThemeColor('light', colorKey));
            lightSwatches.appendChild(lightSwatch);
        });
    }

    // Initialize colors on load
    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateThemeColors(currentTheme);

    // Colors are now updated directly in the theme toggle handler above

    // Render swatches when profile panel is shown
    function initColorPicker() {
        const profilePanel = $('#panel-profile');
        if (profilePanel && profilePanel.getAttribute('aria-hidden') === 'false') {
            renderColorSwatches();
        }
    }

    // Render on tab change
    const profileTab = $('#tab-profile');
    if (profileTab) {
        profileTab.addEventListener('click', () => {
            setTimeout(renderColorSwatches, 150);
        });
    }

    // Make renderColorSwatches available globally for renderProfile
    window.renderColorSwatches = renderColorSwatches;

    /* Parallax suave */
    window.addEventListener('scroll', () => {
        document.documentElement.style.setProperty('--grad-pos', String(window.scrollY));
    }, { passive: true });

    /* =================== Estado =================== */
    const app = {
        sessions: [],
        routines: [],
        profile: createDefaultProfile(),
        notes: [],
        weekOffset: 0,
        currentSessionId: null,
        chartState: { metric: 'volume', exercise: 'all', period: 4 },
        tmpTemplateKey: null,
        importBuffer: null,
        routineImportBuffer: null,
        deleteTarget: { type: null, id: null, sessionId: null, exId: null, setId: null, routineId: null, goalId: null },
        routineEditId: null,
        statsPeriod: '8weeks', // Nuevo: período de comparación para estadísticas
        goals: [], // Sistema de objetivos
        recentAchievements: [], // Logros recientes para celebración
        // Manual save system
        editingSessions: {}, // { sessionId: { isEditing: bool, hasChanges: bool, originalState: {} } }
        sessionSnapshots: {} // Backup copies for cancel
    };

    const templates = {
        '5day': [
            { name: 'Día 1 - Torso (Push)', ex: ['Press banca', 'Press inclinado mancuernas', 'Fondos en paralelas', 'Extensiones tríceps'] },
            { name: 'Día 2 - Pierna', ex: ['Sentadilla con barra', 'Prensa de piernas', 'Zancadas', 'Curl femoral tumbado'] },
            { name: 'Día 3 - Torso (Pull)', ex: ['Dominadas', 'Remo con barra', 'Remo en máquina', 'Curl bíceps con barra'] },
            { name: 'Día 4 - Torso (Upper)', ex: ['Press militar', 'Press banca', 'Remo con barra', 'Elevaciones laterales'] },
            { name: 'Día 5 - Pierna', ex: ['Peso muerto rumano', 'Sentadilla búlgara', 'Gémeos', 'Elevación de talones'] },
        ],
        '3day': [
            { name: 'Día 1 - Full Body A', ex: ['Sentadilla con barra', 'Press banca', 'Remo con barra', 'Press militar', 'Curl bíceps'] },
            { name: 'Día 2 - Full Body B', ex: ['Peso muerto', 'Press inclinado', 'Dominadas', 'Zancadas', 'Extensiones tríceps'] },
            { name: 'Día 3 - Full Body C', ex: ['Prensa de piernas', 'Fondos en paralelas', 'Remo en máquina', 'Elevaciones laterales', 'Curl femoral'] },
        ],
        '4day': [
            { name: 'Día 1 - Upper', ex: ['Press banca', 'Press inclinado', 'Remo con barra', 'Dominadas', 'Press militar'] },
            { name: 'Día 2 - Lower', ex: ['Sentadilla con barra', 'Peso muerto rumano', 'Prensa de piernas', 'Zancadas', 'Gémeos'] },
            { name: 'Día 3 - Upper', ex: ['Press banca', 'Fondos en paralelas', 'Remo mancuernas', 'Jalón al pecho', 'Curl bíceps'] },
            { name: 'Día 4 - Lower', ex: ['Sentadilla frontal', 'Peso muerto', 'Curl femoral', 'Elevación de talones', 'Abducciones'] },
        ],
        'ppl': [
            { name: 'Día 1 - Push', ex: ['Press banca', 'Press inclinado', 'Press militar', 'Fondos en paralelas', 'Extensiones tríceps'] },
            { name: 'Día 2 - Pull', ex: ['Dominadas', 'Remo con barra', 'Jalón al pecho', 'Remo en máquina', 'Curl bíceps'] },
            { name: 'Día 3 - Legs', ex: ['Sentadilla con barra', 'Peso muerto rumano', 'Prensa de piernas', 'Zancadas', 'Gémeos'] },
            { name: 'Día 4 - Push', ex: ['Press banca', 'Press inclinado mancuernas', 'Press militar mancuernas', 'Aperturas', 'Elevaciones laterales'] },
            { name: 'Día 5 - Pull', ex: ['Dominadas', 'Remo mancuernas', 'Face pulls', 'Curl martillo', 'Curl concentrado'] },
            { name: 'Día 6 - Legs', ex: ['Sentadilla frontal', 'Peso muerto', 'Curl femoral', 'Elevación de talones', 'Abdominales'] },
        ],
    };

    const templateLabels = {
        '5day': 'Rutina 5 días',
        '3day': 'Rutina 3 días',
        '4day': 'Rutina 4 días',
        'ppl': 'Rutina PPL 6 días'
    };

    const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" rx="100" fill="%231e293b"/><text x="50%" y="55%" font-size="64" text-anchor="middle" dominant-baseline="middle">👤</text></svg>';

    // Generate DiceBear avatar URL
    function generateAvatarUrl(style, seed) {
        // Map style names to DiceBear API style names
        const styleMap = {
            'avataaars': 'avataaars',
            'pixel-art': 'pixel-art',
            'adventurer': 'adventurer',
            'big-smile': 'big-smile',
            'bottts': 'bottts',
            'fun-emoji': 'fun-emoji',
            'icons': 'icons',
            'identicon': 'identicon',
            'lorelei': 'lorelei',
            'micah': 'micah',
            'miniavs': 'miniavs',
            'notionists': 'notionists',
            'open-peeps': 'open-peeps',
            'personas': 'personas',
            'rings': 'rings',
            'shapes': 'shapes',
            'thumbs': 'thumbs'
        };

        const apiStyle = styleMap[style] || 'avataaars';
        const avatarSeed = seed || Math.random().toString(36).substring(2, 15);
        return `https://api.dicebear.com/9.x/${apiStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;
    }

    // Get current avatar (photo or generated)
    function getCurrentAvatar() {
        if (app.profile.photo) {
            return app.profile.photo;
        }
        const seed = app.profile.avatarSeed || (app.profile.firstName + ' ' + app.profile.lastName).trim() || 'default';
        const style = app.profile.avatarStyle || 'avataaars';
        return generateAvatarUrl(style, seed);
    }

    function createDefaultProfile() {
        return {
            photo: '',
            avatarStyle: 'avataaars',
            avatarSeed: '',
            firstName: '',
            lastName: '',
            height: '',
            weight: '',
            bodyFat: '',
            weightHistory: [],
            bodyMeasurementsHistory: [],
        };
    }

    function updateRoutineDayTitles() {
        const days = $$('#routineDays .routine-day');
        days.forEach((day, idx) => {
            const title = day.querySelector('.routine-day__title');
            if (title) title.textContent = `Día ${idx + 1}`;
        });
    }

    function updateRoutineSetIndexes(exEl) {
        if (!exEl) return;
        const sets = exEl.querySelectorAll('.routine-set');
        sets.forEach((set, idx) => {
            const label = set.querySelector('.routine-set__index');
            if (label) label.textContent = `Set ${idx + 1}`;
        });
    }

    function addRoutineDay(data = {}) {
        const container = $('#routineDays');
        if (!container) return;
        const tpl = $('#tpl-routine-day');
        if (!tpl) return;
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.dataset.dayId = data.id || uuid();
        const nameInput = node.querySelector('.routine-day__name');
        if (nameInput) nameInput.value = data.name || '';
        const exercisesContainer = node.querySelector('.routine-exercises');
        (data.exercises || []).forEach(ex => addRoutineExercise(node, ex));
        container.appendChild(node);
        updateRoutineDayTitles();
    }

    function addRoutineExercise(dayEl, data = {}) {
        if (!dayEl) return;
        const tpl = $('#tpl-routine-exercise');
        if (!tpl) return;
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.dataset.exId = data.id || uuid();
        const nameInput = node.querySelector('.routine-exercise__name');
        if (nameInput) nameInput.value = data.name || '';
        const setsContainer = node.querySelector('.routine-sets');
        const sets = (data.sets && data.sets.length) ? data.sets : [{ id: uuid(), planKg: '', planReps: '', planRir: '' }];
        sets.forEach(set => addRoutineSet(node, set));
        const exercisesContainer = dayEl.querySelector('.routine-exercises');
        if (exercisesContainer) exercisesContainer.appendChild(node);
    }

    function addRoutineSet(exEl, data = {}) {
        if (!exEl) return;
        const tpl = $('#tpl-routine-set');
        if (!tpl) return;
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.dataset.setId = data.id || uuid();
        const kgInput = node.querySelector('.routine-set__kg');
        const repsInput = node.querySelector('.routine-set__reps');
        const rirInput = node.querySelector('.routine-set__rir');
        const planKg = data.planKg !== undefined ? data.planKg : (data.kg || '');
        const planReps = data.planReps !== undefined ? data.planReps : (data.reps || '');
        const planRir = data.planRir !== undefined ? data.planRir : (data.rir || '');
        if (kgInput) {
            kgInput.value = planKg;
            kgInput.placeholder = 'Opcional';
        }
        if (repsInput) {
            repsInput.value = planReps;
            repsInput.placeholder = 'Opcional';
        }
        if (rirInput) {
            rirInput.value = planRir;
            rirInput.placeholder = 'Opcional';
        }
        const setsContainer = exEl.querySelector('.routine-sets');
        if (setsContainer) setsContainer.appendChild(node);
        updateRoutineSetIndexes(exEl);
    }

    function resetRoutineBuilder() {
        const routineNameInput = $('#routineName');
        if (routineNameInput) routineNameInput.value = '';
        const container = $('#routineDays');
        if (container) container.innerHTML = '';
        app.routineEditId = null;
        updateRoutineDayTitles();
    }

    function loadRoutineIntoBuilder(routine) {
        if (!routine) return;
        resetRoutineBuilder();
        const routineNameInput = $('#routineName');
        if (routineNameInput) routineNameInput.value = routine.name || '';
        (routine.days || []).forEach(day => addRoutineDay({
            id: day.id || uuid(),
            name: day.name || '',
            exercises: (day.exercises || []).map(ex => ({
                id: ex.id || uuid(),
                name: ex.name || '',
                sets: (ex.sets || []).map(set => ({
                    id: set.id || uuid(),
                    kg: set.kg || '',
                    reps: set.reps || '',
                    rir: set.rir || ''
                }))
            }))
        }));
        app.routineEditId = routine.id || null;
    }

    function renderDefaultRoutines() {
        const list = $('#defaultRoutineList');
        if (!list) return;
        list.innerHTML = '';
        Object.entries(templates).forEach(([key, days]) => {
            const item = document.createElement('div');
            item.className = 'routine-default__item';

            const head = document.createElement('div');
            head.className = 'routine-default__head';

            const info = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = templateLabels[key] || `Rutina ${key}`;
            info.appendChild(title);
            const meta = document.createElement('div');
            meta.className = 'routine-default__meta';
            const totalExercises = days.reduce((sum, day) => {
                const count = Array.isArray(day.ex) ? day.ex.length : 0;
                return sum + count;
            }, 0);
            meta.textContent = `${days.length} días · ${totalExercises} ejercicios`;
            info.appendChild(meta);

            head.appendChild(info);

            const useBtn = document.createElement('button');
            useBtn.className = 'btn btn--small btn--ghost js-use-template';
            useBtn.dataset.template = key;
            useBtn.textContent = 'Usar plantilla';
            head.appendChild(useBtn);

            item.appendChild(head);

            const body = document.createElement('div');
            body.className = 'routine-created__body';
            days.forEach((day, idx) => {
                const dayEl = document.createElement('div');
                dayEl.className = 'routine-created__day';
                const dayTitle = document.createElement('div');
                dayTitle.className = 'routine-created__day-title';
                dayTitle.textContent = `${idx + 1}. ${day.name}`;
                dayEl.appendChild(dayTitle);
                const exercises = document.createElement('div');
                exercises.className = 'routine-default__meta';
                const exerciseList = Array.isArray(day.ex) ? day.ex.join(', ') : '';
                exercises.textContent = exerciseList;
                dayEl.appendChild(exercises);
                body.appendChild(dayEl);
            });
            item.appendChild(body);

            list.appendChild(item);
        });
    }

    function renderCreatedRoutines() {
        const list = $('#createdRoutineList');
        const empty = $('#noCreatedRoutines');
        if (!list || !empty) return;
        list.innerHTML = '';
        if (!app.routines.length) {
            empty.hidden = false;
            return;
        }
        empty.hidden = true;

        app.routines.forEach(routine => {
            const item = document.createElement('div');
            item.className = 'routine-created__item';
            item.dataset.routineId = routine.id;

            const head = document.createElement('div');
            head.className = 'routine-created__head';

            const info = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = routine.name;
            info.appendChild(title);
            const meta = document.createElement('div');
            meta.className = 'routine-created__meta';
            const totalExercises = (routine.days || []).reduce((sum, day) => sum + (day.exercises ? day.exercises.length : 0), 0);
            meta.textContent = `${(routine.days || []).length} días · ${totalExercises} ejercicios`;
            info.appendChild(meta);
            head.appendChild(info);

            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.flexWrap = 'wrap';
            actions.style.gap = '6px';

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn--small btn--ghost js-toggle-routine';
            toggleBtn.textContent = 'Ver';
            actions.appendChild(toggleBtn);

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn--small btn--ghost js-edit-routine';
            editBtn.textContent = 'Editar';
            actions.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn--small btn--ghost js-delete-routine';
            deleteBtn.textContent = '✕';
            actions.appendChild(deleteBtn);

            head.appendChild(actions);
            item.appendChild(head);

            const body = document.createElement('div');
            body.className = 'routine-created__body';
            body.hidden = true;
            (routine.days || []).forEach((day, idx) => {
                const dayEl = document.createElement('div');
                dayEl.className = 'routine-created__day';
                const dayTitle = document.createElement('div');
                dayTitle.className = 'routine-created__day-title';
                dayTitle.textContent = `${idx + 1}. ${day.name}`;
                dayEl.appendChild(dayTitle);
                (day.exercises || []).forEach(ex => {
                    const exLine = document.createElement('div');
                    exLine.className = 'routine-default__meta';
                    const setsLabel = (ex.sets || []).length === 1 ? 'set' : 'sets';
                    exLine.textContent = `${ex.name} · ${(ex.sets || []).length} ${setsLabel}`;
                    dayEl.appendChild(exLine);
                });
                body.appendChild(dayEl);
            });
            item.appendChild(body);

            list.appendChild(item);
        });
    }

    function renderImportRoutineList() {
        const list = $('#importRoutineList');
        const empty = $('#importRoutineEmpty');
        if (!list || !empty) return;
        list.innerHTML = '';
        if (!app.routines.length) {
            empty.hidden = false;
            return;
        }
        empty.hidden = true;

        app.routines.forEach(routine => {
            const item = document.createElement('div');
            item.className = 'routine-import__item';

            const head = document.createElement('div');
            head.className = 'routine-import__head';

            const info = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = routine.name || 'Rutina sin nombre';
            info.appendChild(title);
            const meta = document.createElement('div');
            meta.className = 'routine-created__meta';
            const totalExercises = (routine.days || []).reduce((sum, day) => sum + (day.exercises ? day.exercises.length : 0), 0);
            meta.textContent = `${(routine.days || []).length} días · ${totalExercises} ejercicios`;
            info.appendChild(meta);
            head.appendChild(info);

            const importBtn = document.createElement('button');
            importBtn.className = 'btn btn--secondary btn--small js-import-user-routine';
            importBtn.dataset.routineId = routine.id;
            importBtn.textContent = 'Importar en semana visible';
            head.appendChild(importBtn);

            item.appendChild(head);

            const detail = document.createElement('div');
            detail.className = 'routine-default__meta';
            const dayNames = (routine.days || []).map((day, idx) => `${idx + 1}. ${day.name || 'Sin nombre'}`);
            detail.textContent = dayNames.length ? dayNames.join(' · ') : 'Sin días definidos';
            item.appendChild(detail);

            list.appendChild(item);
        });
    }

    function renderRoutines() {
        renderDefaultRoutines();
        renderCreatedRoutines();
        renderImportRoutineList();
        updateRoutineDayTitles();
    }

    function loadTemplateIntoBuilder(key) {
        if (!key) return;
        const preset = templates[key];
        if (!preset) return;
        resetRoutineBuilder();
        const routineNameInput = $('#routineName');
        if (routineNameInput) {
            routineNameInput.value = templateLabels[key] || `Rutina ${key}`;
            routineNameInput.focus();
        }
        preset.forEach(day => addRoutineDay({
            id: uuid(),
            name: day.name,
            exercises: (day.ex || []).map(exName => ({
                id: uuid(),
                name: exName,
                sets: [{ id: uuid(), kg: '', reps: '', rir: '' }]
            }))
        }));
        app.routineEditId = null;
        updateRoutineDayTitles();
    }

    function collectRoutineFromBuilder() {
        const nameInput = $('#routineName');
        const routineName = nameInput ? nameInput.value.trim() : '';
        if (!routineName) {
            toast('Añade un nombre para la rutina', 'warn');
            if (nameInput) nameInput.focus();
            return null;
        }
        const dayElements = $$('#routineDays .routine-day');
        if (!dayElements.length) {
            toast('Añade al menos un día a la rutina', 'warn');
            return null;
        }
        const days = [];
        for (const dayEl of dayElements) {
            const dayNameInput = dayEl.querySelector('.routine-day__name');
            const dayName = dayNameInput ? dayNameInput.value.trim() : '';
            if (!dayName) {
                toast('Cada día necesita un nombre', 'warn');
                if (dayNameInput) dayNameInput.focus();
                return null;
            }
            const exElements = [...dayEl.querySelectorAll('.routine-exercise')];
            if (!exElements.length) {
                toast(`Añade ejercicios para ${dayName}`, 'warn');
                if (dayNameInput) dayNameInput.focus();
                return null;
            }
            const exercises = [];
            for (const exEl of exElements) {
                const exNameInput = exEl.querySelector('.routine-exercise__name');
                const exName = exNameInput ? exNameInput.value.trim() : '';
                if (!exName) {
                    toast('Cada ejercicio necesita un nombre', 'warn');
                    if (exNameInput) exNameInput.focus();
                    return null;
                }
                const setElements = [...exEl.querySelectorAll('.routine-set')];
                // Sets are optional during routine creation - they can be filled later when logging the workout
                const sets = [];
                for (let i = 0; i < setElements.length; i++) {
                    const setEl = setElements[i];
                    const kgInput = setEl.querySelector('.routine-set__kg');
                    const repsInput = setEl.querySelector('.routine-set__reps');
                    const rirInput = setEl.querySelector('.routine-set__rir');
                    const kg = kgInput ? kgInput.value.trim() : '';
                    const reps = repsInput ? repsInput.value.trim() : '';
                    const rir = rirInput ? rirInput.value.trim() : '';
                    // Allow empty sets during routine creation
                    sets.push({
                        id: setEl.dataset.setId || uuid(),
                        kg: kg || '',
                        reps: reps || '',
                        rir: rir || ''
                    });
                }
                // If no sets exist, create one empty set as placeholder
                if (sets.length === 0) {
                    sets.push({
                        id: uuid(),
                        kg: '',
                        reps: '',
                        rir: ''
                    });
                }
                exercises.push({
                    id: exEl.dataset.exId || uuid(),
                    name: exName,
                    sets
                });
            }
            days.push({
                id: dayEl.dataset.dayId || uuid(),
                name: dayName,
                exercises
            });
        }
        return { name: routineName, days };
    }

    async function handleSaveRoutine(ev) {
        if (ev) ev.preventDefault();
        const data = collectRoutineFromBuilder();
        if (!data) return;

        let routineToSave = null;

        if (app.routineEditId) {
            const target = app.routines.find(r => r.id === app.routineEditId);
            if (target) {
                target.name = data.name;
                target.days = data.days;
                routineToSave = target;
                toast('Rutina actualizada', 'ok');
            }
        } else {
            routineToSave = {
                id: uuid(),
                createdAt: new Date().toISOString(),
                ...data
            };
            app.routines.push(routineToSave);
            toast('Rutina creada', 'ok');
        }

        app.routineEditId = null;

        // Save to both user_data and routines table
        try {
            await save();
            // Also save to routines table
            if (routineToSave && typeof supabaseService !== 'undefined') {
                const isAvailable = await supabaseService.isAvailable();
                if (isAvailable) {
                    try {
                        await supabaseService.saveRoutine(routineToSave);
                    } catch (error) {
                        console.warn('Error guardando rutina en tabla routines:', error);
                        // Continue even if routines table save fails
                    }
                }
            }
        } catch (error) {
            // Remove routine if save failed (only for new routines)
            if (!app.routineEditId) {
                app.routines = app.routines.filter(r => r.id !== routineToSave.id);
            }
            throw error;
        }

        renderRoutines();
        resetRoutineBuilder();
    }

    /* =================== Persistencia =================== */
    // Save data ONLY to Supabase - requires authentication
    async function save() {
        // Check if user is authenticated before attempting to save
        if (typeof supabaseService !== 'undefined') {
            const isAvailable = await supabaseService.isAvailable();
            if (isAvailable) {
                const user = await supabaseService.getCurrentUser();
                if (!user) {
                    // User not authenticated - silently skip save (no errors)
                    return Promise.resolve();
                }
            } else {
                // Supabase not available - silently skip save
                return Promise.resolve();
            }
        } else {
            // Supabase not configured - silently skip save
            return Promise.resolve();
        }

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
            statsPeriod: app.statsPeriod || '8weeks', // Guardar el período de estadísticas
            goals: app.goals || [],
            recentAchievements: app.recentAchievements || []
        };

        // Save ONLY to Supabase - requires authentication
        if (typeof supabaseService !== 'undefined') {
            const isAvailable = await supabaseService.isAvailable();
            if (isAvailable) {
                try {
                    await supabaseService.saveUserData(payload);
                    // Success - data saved to Supabase
                } catch (error) {
                    // Only show error if it's not an authentication issue
                    if (error.message && !error.message.includes('no autenticado')) {
                        console.error('Error guardando en Supabase:', error);
                        const errorMessage = error.message || 'Error al guardar los datos';
                        toast(errorMessage, 'err');
                    }
                    // Don't throw error for authentication issues - just resolve silently
                    if (error.message && error.message.includes('no autenticado')) {
                        return Promise.resolve();
                    }
                    throw error; // Re-throw other errors
                }
            } else {
                // Supabase not available - silently return
                return Promise.resolve();
            }
        } else {
            // Supabase not configured - silently return
            return Promise.resolve();
        }
    }

    // Load data ONLY from Supabase - requires authentication
    async function load() {
        let parsed = null;

        // Load ONLY from Supabase - requires authentication
        if (typeof supabaseService !== 'undefined') {
            const isAvailable = await supabaseService.isAvailable();
            if (isAvailable) {
                try {
                    parsed = await supabaseService.loadUserData();
                } catch (error) {
                    console.error('Error cargando desde Supabase:', error);
                    // If user is not authenticated, show message and initialize default data
                    if (error.message && error.message.includes('no autenticado')) {
                        console.log('Usuario no autenticado, inicializando datos por defecto');
                        initializeDefaultData();
                        return;
                    }
                    // For other errors, show message but still initialize default data
                    toast('Error al cargar datos desde la base de datos', 'err');
                    initializeDefaultData();
                    return;
                }
            } else {
                // Supabase not available - initialize default data
                console.log('Supabase no disponible, inicializando datos por defecto');
                initializeDefaultData();
                return;
            }
        } else {
            // Supabase service not defined - initialize default data
            console.log('Servicio Supabase no definido, inicializando datos por defecto');
            initializeDefaultData();
            return;
        }

        // If no data from Supabase (new user), initialize default data
        if (!parsed) {
            console.log('No hay datos en Supabase, inicializando datos por defecto');
            initializeDefaultData();
            return;
        }

        // Parse and load data
        try {
            if (Array.isArray(parsed)) {
                // Legacy format: just sessions array
                app.sessions = parsed;
                // Ensure all sessions have the completed field
                app.sessions.forEach(session => {
                    if (session.completed === undefined) {
                        session.completed = false;
                    }
                });
                app.routines = [];
                app.profile = createDefaultProfile();
                app.notes = [];
                app.prs = {};
                app.onerm = {};
                app.exerciseNotes = {};
                app.achievements = [];
                app.streak = { current: 0, lastDate: null };
                app.weeklyGoal = { target: 3, current: 0 };
                app.statsPeriod = '8weeks';
            } else {
                // Modern format: full object
                app.sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
                // Ensure all sessions have the completed field
                app.sessions.forEach(session => {
                    if (session.completed === undefined) {
                        session.completed = false;
                    }
                });
                app.routines = Array.isArray(parsed.routines) ? parsed.routines : [];
                const baseProfile = createDefaultProfile();
                const storedProfile = (parsed.profile && typeof parsed.profile === 'object') ? parsed.profile : {};
                app.profile = {
                    ...baseProfile,
                    ...storedProfile
                };
                // Ensure new avatar fields exist
                if (!app.profile.avatarStyle) {
                    app.profile.avatarStyle = 'avataaars';
                }
                if (!app.profile.avatarSeed) {
                    app.profile.avatarSeed = '';
                }
                if (!Array.isArray(app.profile.weightHistory)) {
                    app.profile.weightHistory = [];
                }
                if (!Array.isArray(app.profile.bodyMeasurementsHistory)) {
                    app.profile.bodyMeasurementsHistory = [];
                }
                app.notes = Array.isArray(parsed.notes) ? parsed.notes : [];
                app.prs = (parsed.prs && typeof parsed.prs === 'object') ? parsed.prs : {};
                app.onerm = (parsed.onerm && typeof parsed.onerm === 'object') ? parsed.onerm : {};
                app.exerciseNotes = (parsed.exerciseNotes && typeof parsed.exerciseNotes === 'object') ? parsed.exerciseNotes : {};
                app.achievements = Array.isArray(parsed.achievements) ? parsed.achievements : [];
                app.streak = (parsed.streak && typeof parsed.streak === 'object') ? parsed.streak : { current: 0, lastDate: null };
                app.weeklyGoal = (parsed.weeklyGoal && typeof parsed.weeklyGoal === 'object') ? parsed.weeklyGoal : { target: 3, current: 0 };
                app.statsPeriod = parsed.statsPeriod || 'lastWeek';
                app.goals = Array.isArray(parsed.goals) ? parsed.goals : [];
                app.recentAchievements = Array.isArray(parsed.recentAchievements) ? parsed.recentAchievements : [];
            }

            // Save after migration to ensure all sessions have completed field
            let needsSave = false;
            app.sessions.forEach(session => {
                if (session.completed === undefined) {
                    session.completed = false;
                    needsSave = true;
                }
            });
            if (needsSave) {
                await save();
            }
        } catch (error) {
            console.error('Error parsing loaded data:', error);
            initializeDefaultData();
        }
    }

    function initializeDefaultData() {
        app.sessions = [];
        app.routines = [];
        app.profile = createDefaultProfile();
        app.notes = [];
        app.prs = {};
        app.onerm = {};
        app.exerciseNotes = {};
        app.achievements = [];
        app.streak = { current: 0, lastDate: null };
        app.weeklyGoal = { target: 3, current: 0 };
        app.statsPeriod = 'lastWeek';
        app.goals = [];
        app.recentAchievements = [];
    }

    /* =================== Fechas =================== */
    function startOfWeek(d = new Date()) {
        // Lunes = 1
        const x = new Date(d);
        let day = x.getDay(); if (day === 0) day = 7;
        x.setHours(0, 0, 0, 0);
        x.setDate(x.getDate() - (day - 1));
        return x;
    }
    function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

    /* Devuelve YYYY-MM-DD usando calendario local (sin toISOString) */
    function toLocalISO(d) {
        const x = new Date(d);
        const y = x.getFullYear();
        const m = String(x.getMonth() + 1).padStart(2, '0');
        const dd = String(x.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }

    /* Parsea 'YYYY-MM-DD' como fecha LOCAL (mediodía para evitar bordes TZ) */
    function parseLocalDate(s) {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d, 12, 0, 0, 0);
    }

    function getVisibleWeek() {
        const ws = addDays(startOfWeek(), app.weekOffset * 7);
        const we = addDays(ws, 6);
        we.setHours(23, 59, 59, 999);
        return { ws, we };
    }

    /* =================== Tabs & Nav =================== */
    // Prevent navigation if there are unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
            return e.returnValue;
        }
    });

    function setupTabs() {
        const tabs = $$('.tab-btn');
        const panels = $$('.panel');
        const panelToNav = {
            'panel-diary': 'navDiary',
            'panel-stats': 'navStats',
            'panel-import': 'navImport',
            'panel-social': null,
            'panel-routines': null,
            'panel-profile': null,
            'panel-goals': null
        };

        function updateNav(panelId) {
            const activeNav = panelToNav[panelId] || null;
            ['navDiary', 'navStats', 'navImport'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.setAttribute('aria-current', id === activeNav ? 'page' : 'false');
                }
            });
        }

        function select(panelId) {
            // Check for unsaved changes before switching tabs
            if (hasUnsavedChanges()) {
                const editingIds = getEditingSessionIds();
                if (editingIds.length > 0) {
                    toast('Guarda o cancela los cambios antes de cambiar de pestaña', 'warn');
                    return;
                }
            }

            tabs.forEach(btn => {
                const controls = btn.getAttribute('aria-controls');
                btn.setAttribute('aria-selected', controls === panelId ? 'true' : 'false');
            });
            panels.forEach(panel => {
                panel.setAttribute('aria-hidden', panel.id === panelId ? 'false' : 'true');
            });
            updateNav(panelId);
            if (panelId === 'panel-diary') { renderSessions(); }
            if (panelId === 'panel-stats') { buildStats(); buildChartState(); drawChart(); }
            if (panelId === 'panel-social') { loadSocialData(); }
            if (panelId === 'panel-import') { initWeekSelector(); }
            if (panelId === 'panel-routines') { renderRoutines(); }
            if (panelId === 'panel-profile') { renderProfile(); }
            if (panelId === 'panel-goals') { renderGoals(); renderRecentAchievements(); renderAllAchievements(); }
        }

        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('aria-controls');
                if (target) select(target);
            });
        });

        const navBindings = {
            navDiary: 'panel-diary',
            navStats: 'panel-stats',
            navImport: 'panel-import'
        };
        Object.keys(navBindings).forEach(navId => {
            const btn = document.getElementById(navId);
            if (btn) {
                btn.addEventListener('click', () => select(navBindings[navId]));
            }
        });

        select('panel-diary');
    }

    /* =================== Semana UI =================== */
    function renderWeekbar() {
        const ws = addDays(startOfWeek(), app.weekOffset * 7);
        const we = addDays(ws, 6);
        const label = (app.weekOffset === 0) ? 'Semana actual'
            : (app.weekOffset === -1 ? 'Semana pasada'
                : (app.weekOffset === 1 ? 'Semana siguiente'
                    : `${ws.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${we.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`));
        $('#weekInfo').textContent = label;
    }
    function getWeekSessions() {
        const { ws, we } = getVisibleWeek();
        const wsLocal = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate(), 0, 0, 0);
        const weLocal = new Date(we.getFullYear(), we.getMonth(), we.getDate(), 23, 59, 59);

        return app.sessions
            .filter(s => {
                const d = parseLocalDate(s.date);
                return d >= wsLocal && d <= weLocal;
            })
            .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
    }

    /**
     * Robust function to check if there are any sessions in the visible week.
     * Returns true if at least one session exists within the week range, false otherwise.
     * This function uses the EXACT same logic as getWeekSessions() for consistency.
     * This function is designed to be 100% reliable and handle edge cases.
     */
    function hasSessionsThisWeek() {
        // Ensure app.sessions exists and is an array
        if (!app.sessions || !Array.isArray(app.sessions) || app.sessions.length === 0) {
            return false;
        }

        // Use the exact same logic as getWeekSessions() for consistency
        const { ws, we } = getVisibleWeek();
        const wsLocal = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate(), 0, 0, 0);
        const weLocal = new Date(we.getFullYear(), we.getMonth(), we.getDate(), 23, 59, 59);

        // Check each session using the same filter logic as getWeekSessions()
        for (let i = 0; i < app.sessions.length; i++) {
            const session = app.sessions[i];

            // Skip if session has no date
            if (!session || !session.date) {
                continue;
            }

            try {
                // Use the exact same parsing and comparison as getWeekSessions()
                const d = parseLocalDate(session.date);
                if (d >= wsLocal && d <= weLocal) {
                    return true; // Found at least one session in the week
                }
            } catch (e) {
                // Skip invalid dates silently
                continue;
            }
        }

        return false; // No sessions found in the visible week
    }

    /* =================== Parseos =================== */
    const parseReps = s => (!s ? 0 : s.includes('+') ? (+(s.split('+')[0]) + +(s.split('+')[1] || 0)) : s.includes('-') ? ((+s.split('-')[0] + +s.split('-')[1]) / 2) : +s || 0);
    const parseRIR = s => (!s ? 0 : s.includes('/') ? ((+s.split('/')[0] + +s.split('/')[1]) / 2) : +s || 0);

    /* =================== Resumen =================== */
    function renderSummary() {
        const list = getWeekSessions();
        $('#kpiSessions').textContent = String(list.length);
        const counts = new Map();
        const exerciseProgress = new Map(); // Track progress per exercise
        let vol = 0, rirS = 0, rirC = 0;

        list.forEach(s => (s.exercises || []).forEach(e => {
            counts.set(e.name, (counts.get(e.name) || 0) + 1);
            (e.sets || []).forEach(st => {
                const kg = parseFloat(st.kg) || 0;
                const reps = parseReps(st.reps);
                vol += kg * reps;
                const r = parseRIR(st.rir);
                if (r > 0) { rirS += r; rirC++; }

                // Calculate progress: max weight * reps for this exercise
                if (kg > 0 && reps > 0) {
                    const currentMax = exerciseProgress.get(e.name) || 0;
                    const currentValue = kg * reps; // Volume as progress indicator
                    if (currentValue > currentMax) {
                        exerciseProgress.set(e.name, currentValue);
                    }
                }
            });
        }));

        // Find exercise with most progress (highest volume achieved)
        let topExercise = '–';
        if (exerciseProgress.size > 0) {
            const sorted = [...exerciseProgress.entries()].sort((a, b) => b[1] - a[1]);
            topExercise = sorted[0][0]; // Only show the top one
        }

        $('#kpiTop').textContent = topExercise;
        $('#kpiVolume').textContent = `${vol.toLocaleString()} kg`;
        $('#kpiRIR').textContent = rirC ? (rirS / rirC).toFixed(1) : '–';

        // Show/hide delete week button based on whether there are sessions
        const deleteWeekBtn = $('#btnDeleteWeek');
        if (deleteWeekBtn) {
            if (list.length > 0) {
                deleteWeekBtn.style.display = '';
            } else {
                deleteWeekBtn.style.display = 'none';
            }
        }

        // Update weekly goal
        updateWeeklyGoal();
    }

    /* =================== Progreso por set (texto) =================== */
    function progressText(currentSession, currentEx, currentSet) {
        const currDate = new Date(currentSession.date);
        const previous = app.sessions
            .filter(s => new Date(s.date) < currDate)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const s of previous) {
            const ex = (s.exercises || []).find(e => e.name === currentEx.name);
            if (!ex) continue;
            const prevSet = (ex.sets || []).find(st => st.setNumber === currentSet.setNumber);
            if (prevSet && (prevSet.kg || prevSet.reps)) {
                const [txt, cls] = compareSets(prevSet, currentSet, currentSet.setNumber);
                return `<span class="${cls}">${txt}</span>`;
            }
        }
        return '<span class="progress--same">Primera sesión</span>';
    }
    function compareSets(prev, curr, setNumber) {
        const pk = parseFloat(prev.kg) || 0, ck = parseFloat(curr.kg) || 0;
        const pr = parseReps(prev.reps), cr = parseReps(curr.reps);
        const pi = parseRIR(prev.rir), ci = parseRIR(curr.rir);
        if (!curr.kg && !curr.reps) return ['Sin datos', 'progress--same'];
        if (ck > pk) return [`+${(ck - pk).toFixed(1)} kg en set ${setNumber}`, 'progress--up'];
        if (ck < pk) return [`-${(pk - ck).toFixed(1)} kg en set ${setNumber}`, 'progress--down'];
        if (cr > pr) return [`Más reps: ${pr} → ${cr}`, 'progress--up'];
        if (cr < pr) return [`Menos reps: ${pr} → ${cr}`, 'progress--down'];
        if (ci < pi) return [`Menos RIR: ${pi} → ${ci}`, 'progress--up'];
        if (ci > pi) return [`Más RIR: ${pi} → ${ci}`, 'progress--down'];
        return ['Sin cambio', 'progress--same'];
    }
    /* =================== Event Delegation =================== */
    function setupDiaryEventDelegation() {
        const container = document.getElementById('sessions');
        if (!container) return;

        // Helper to find closest session/exercise/set IDs
        const getIds = (target) => {
            const sessionCard = target.closest('.session.card');
            const exerciseBlock = target.closest('.exercise');
            const setRow = target.closest('tr') || target.closest('.set-card');

            return {
                sessionId: sessionCard?.dataset.id,
                exId: exerciseBlock?.dataset.exId,
                setId: setRow?.dataset.setId
            };
        };

        // CLICK Delegation
        container.addEventListener('click', async (e) => {
            const target = e.target;
            const { sessionId, exId, setId } = getIds(target);

            // 1. Session Actions
            if (target.closest('.js-complete')) {
                e.preventDefault();
                if (sessionId) toggleCompleted(sessionId);
                return;
            }

            if (target.closest('.js-edit-session')) {
                e.preventDefault();
                if (sessionId) startEditingSession(sessionId);
                return;
            }

            if (target.closest('.js-add-ex')) {
                e.preventDefault();
                if (sessionId) addExercise(sessionId);
                return;
            }

            if (target.closest('.js-delete')) {
                e.preventDefault();
                if (sessionId) deleteSession(sessionId);
                return;
            }

            // 2. Exercise Actions
            if (target.closest('.js-add-set')) {
                e.preventDefault();
                if (sessionId && exId) addSet(sessionId, exId);
                return;
            }

            if (target.closest('.js-del-ex')) {
                e.preventDefault();
                if (sessionId && exId) deleteExercise(sessionId, exId);
                return;
            }

            if (target.closest('.exercise-reorder-up')) {
                e.preventDefault();
                if (sessionId && exId) moveExercise(sessionId, exId, 'up');
                return;
            }

            if (target.closest('.exercise-reorder-down')) {
                e.preventDefault();
                if (sessionId && exId) moveExercise(sessionId, exId, 'down');
                return;
            }

            if (target.closest('.exercise-note-btn') || target.closest('.exercise-note-edit')) {
                e.preventDefault();
                const name = target.closest('.exercise')?.querySelector('.exercise__name')?.textContent;
                if (sessionId && exId) openExerciseNoteDialog(sessionId, exId, name);
                return;
            }

            if (target.closest('.exercise-note-delete')) {
                e.preventDefault();
                if (sessionId && exId) {
                    saveExerciseNote(sessionId, exId, '');
                    refresh({ preserveTab: true });
                }
                return;
            }

            // 3. Set Actions
            if (target.closest('.js-del-set')) {
                e.preventDefault();
                if (sessionId && exId && setId) deleteSet(sessionId, exId, setId);
                return;
            }

            if (target.closest('.js-rest-timer')) {
                e.preventDefault();
                openRestTimer();
                return;
            }

            if (target.closest('.js-prev-week-data')) {
                e.preventDefault();
                const btn = target.closest('.js-prev-week-data');
                const row = btn.closest('tr') || btn.closest('.set-card');
                togglePrevWeekData(row, sessionId, exId, setId);
                return;
            }

            // 4. Exercise Name Editing (Click on name)
            if (target.classList.contains('exercise__name')) {
                if (sessionId && exId) {
                    makeExerciseNameEditable(target, sessionId, exId);
                }
            }
        });

        // INPUT/CHANGE Delegation for Sets
        container.addEventListener('input', debounce((e) => {
            const target = e.target;
            if (!target.classList.contains('js-kg') &&
                !target.classList.contains('js-reps') &&
                !target.classList.contains('js-rir')) return;

            const { sessionId, exId, setId } = getIds(target);
            if (!sessionId || !exId || !setId) return;

            const field = target.classList.contains('js-kg') ? 'kg' :
                target.classList.contains('js-reps') ? 'reps' : 'rir';

            updateSet(sessionId, exId, setId, field, target.value);
        }, 500));
    }

    // Helper for inline editing
    function makeExerciseNameEditable(element, sessionId, exId) {
        if (element.querySelector('input')) return; // Already editing

        const currentName = element.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input';
        input.value = currentName;
        input.style.width = '100%';
        input.style.maxWidth = '300px';
        input.style.fontSize = 'inherit';
        input.style.fontWeight = 'inherit';

        // Create confirmation buttons container
        const confirmContainer = document.createElement('div');
        confirmContainer.style.display = 'flex';
        confirmContainer.style.gap = '8px';
        confirmContainer.style.marginTop = '8px';
        confirmContainer.style.alignItems = 'center';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn--small';
        saveBtn.textContent = '💾 Guardar';
        saveBtn.style.margin = '0';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn--small btn--ghost';
        cancelBtn.textContent = '✕ Cancelar';
        cancelBtn.style.margin = '0';

        confirmContainer.appendChild(saveBtn);
        confirmContainer.appendChild(cancelBtn);

        // Replace text with input
        element.textContent = '';
        element.appendChild(input);
        element.appendChild(confirmContainer);

        input.focus();
        input.select();

        const cleanup = () => {
            // Re-render will happen on refresh, but for immediate UI feedback:
            // We rely on refresh() called by updateExerciseName
        };

        const saveChanges = () => {
            const newName = input.value.trim();
            if (newName && newName !== currentName) {
                updateExerciseName(sessionId, exId, newName, currentName);
            } else {
                cancelChanges();
            }
        };

        const cancelChanges = () => {
            element.innerHTML = '';
            element.textContent = currentName;
        };

        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            saveChanges();
        });

        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cancelChanges();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveChanges();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelChanges();
            }
        });

        // Prevent click propagation from input to container
        input.addEventListener('click', (e) => e.stopPropagation());
    }

    // Debounce helper
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    /* =================== Render sesiones =================== */
    function renderSessions() {
        const container = $('#sessions');
        const emptyState = $('#emptyState');
        if (!container) return;

        // Preserve user's open/closed state of sessions across re-renders
        const prevDetails = Array.from(container.querySelectorAll('details'));
        const prevOpen = new Set();
        prevDetails.forEach(d => {
            if (d.open) {
                // Store both dayKey and sessionId for backward compatibility
                if (d.dataset.dayKey) prevOpen.add(d.dataset.dayKey);
                if (d.dataset.sessionId) prevOpen.add(d.dataset.sessionId);
            }
        });
        const hadPrev = prevDetails.length > 0;

        // Use robust function to check if there are any sessions in the visible week
        const hasSessions = hasSessionsThisWeek();

        // Show "No hay entrenos" message ONLY when there are truly no sessions
        if (!hasSessions) {
            if (emptyState) {
                emptyState.hidden = false;
                emptyState.style.display = '';
            }
            container.innerHTML = '';
            return;
        }

        // Hide empty state completely when there are sessions
        if (emptyState) {
            emptyState.hidden = true;
            emptyState.style.display = 'none';
        }

        // Get and render all sessions for the visible week
        const week = getWeekSessions();

        // Sort sessions: non-completed first, completed at the end
        // Within same completion status, sort ascending by date
        const sortedSessions = [...week].sort((a, b) => {
            const aCompleted = !!a.completed;
            const bCompleted = !!b.completed;
            if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
            return parseLocalDate(a.date) - parseLocalDate(b.date);
        });

        // Determine which session should be expanded by default (the "current" day)
        let currentSessionId = null;
        if (!hadPrev) {
            // Find the first incomplete session (regardless of date)
            const firstIncomplete = sortedSessions.find(s => !s.completed);

            if (firstIncomplete) {
                currentSessionId = firstIncomplete.id;
            } else {
                // If all sessions are completed, expand the last one
                if (sortedSessions.length > 0) {
                    currentSessionId = sortedSessions[sortedSessions.length - 1].id;
                }
            }
        }

        // Use DocumentFragment for better performance (reduces reflows)
        const fragment = document.createDocumentFragment();

        // Render each session as its own day (collapsible <details> element)
        sortedSessions.forEach(session => {
            const dayKey = toLocalISO(parseLocalDate(session.date));
            const sessionId = session.id;

            const details = document.createElement('details');
            details.className = 'day-panel card pop';
            // Add completed class to details if session is completed
            details.classList.toggle('completed', !!session.completed);
            // Store dayKey and sessionId so we can restore open state later
            details.dataset.dayKey = dayKey;
            details.dataset.sessionId = sessionId;

            // Restore previous user state if available; otherwise only open the "current" session
            // BUT: completed sessions should be closed (collapsed) by default
            if (session.completed) {
                // Completed sessions should be closed (collapsed)
                details.open = false;
            } else if (hadPrev) {
                details.open = prevOpen.has(dayKey) || prevOpen.has(sessionId);
            } else {
                // Only expand the current day
                details.open = (sessionId === currentSessionId);
            }
            const summary = document.createElement('summary');
            summary.style.display = 'flex';
            summary.style.justifyContent = 'space-between';
            summary.style.alignItems = 'center';
            summary.style.padding = '10px';
            summary.style.cursor = 'pointer';

            const left = document.createElement('div');
            left.innerHTML = `<strong style="font-weight:800">${session.name}</strong>`;
            const right = document.createElement('div');
            right.style.color = 'var(--muted)';
            const dateStr = new Date(session.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
            right.textContent = dateStr;
            if (session.completed) {
                left.classList.add('completed');
                right.textContent += ' · Completada ✓';
            }
            summary.appendChild(left);
            summary.appendChild(right);
            details.appendChild(summary);

            const dayBody = document.createElement('div');
            dayBody.style.display = 'grid';
            dayBody.style.gap = '8px';
            dayBody.style.padding = '10px';

            // Render the session card
            const card = $('#tpl-session').content.firstElementChild.cloneNode(true);
            card.dataset.id = session.id;
            
            // Remove existing completed class and badge first
            card.classList.remove('completed');
            const existingBadge = card.querySelector('.badge-done');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            // Apply completed class if session is completed (badge removed per user request)
            if (session.completed) {
                card.classList.add('completed');
                // Force style recalculation
                void card.offsetHeight;
            }
            
            card.querySelector('.session__title').textContent = session.name;
            card.querySelector('.session__date').textContent = new Date(session.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const dateEl = card.querySelector('.session__date');
            if (dateEl) {
                dateEl.textContent = '';
                dateEl.style.display = 'none';
            }
            const btnComplete = card.querySelector('.js-complete');
            if (btnComplete) {
                btnComplete.setAttribute('aria-pressed', String(!!session.completed));
            }

            const body = card.querySelector('.session__body');
            (session.exercises || []).forEach(ex => body.appendChild(renderExercise(session, ex)));

            // Move the "Añadir ejercicio" button to the end of the session body
            const addExBtn = card.querySelector('.js-add-ex');
            if (addExBtn && body) {
                addExBtn.classList.remove('btn--mobile');
                body.appendChild(addExBtn);
            }

            // Initialize edit UI state
            updateSessionEditUI(session.id);

            dayBody.appendChild(card);
            details.appendChild(dayBody);
            fragment.appendChild(details);

            // Add toggle event listener to trigger animation each time (use passive for better performance)
            details.addEventListener('toggle', function () {
                if (this.open) {
                    // Use requestAnimationFrame for smoother animations
                    requestAnimationFrame(() => {
                        const sessionCard = this.querySelector('.session.card');
                        if (sessionCard) {
                            sessionCard.classList.remove('animate-in');
                            // Force reflow to reset animation
                            void sessionCard.offsetWidth;
                            // Add class to trigger animation
                            requestAnimationFrame(() => {
                                sessionCard.classList.add('animate-in');
                            });
                        }
                    });
                } else {
                    // Remove animation class when closing
                    const sessionCard = this.querySelector('.session.card');
                    if (sessionCard) {
                        sessionCard.classList.remove('animate-in');
                    }
                }
            }, { passive: true });

            // Trigger animation on initial open (defer to avoid blocking)
            if (details.open) {
                requestAnimationFrame(() => {
                    const sessionCard = details.querySelector('.session.card');
                    if (sessionCard) {
                        sessionCard.classList.add('animate-in');
                    }
                });
            }
        });

        // Append fragment to container in one operation (single reflow)
        container.innerHTML = '';
        container.appendChild(fragment);
        
        // Force a reflow to ensure styles are applied immediately
        void container.offsetHeight;
    }
    function renderExercise(session, ex) {
        const block = $('#tpl-exercise').content.firstElementChild.cloneNode(true);
        block.dataset.exId = ex.id;
        const nameEl = block.querySelector('.exercise__name');
        nameEl.textContent = ex.name;

        // Make name editable on click (delegated)
        nameEl.style.cursor = 'pointer';
        nameEl.title = 'Clic para editar';

        // Add note button to exercise head
        const headEl = block.querySelector('.exercise__head');
        if (headEl) {
            // Check if there are 2+ exercises to show reorder arrows
            // Count from session data instead of DOM to ensure accuracy
            const exerciseCount = (session.exercises || []).length;

            // Get the buttons container (the div that contains + Set and X buttons)
            const buttonsContainer = headEl.querySelector('div:last-child');

            // Add reorder buttons if there are 2+ exercises
            if (exerciseCount >= 2 && buttonsContainer) {
                // Ensure buttons container is flex for horizontal alignment
                buttonsContainer.style.display = 'flex';
                buttonsContainer.style.alignItems = 'center';
                buttonsContainer.style.gap = '6px';

                const upBtn = document.createElement('button');
                upBtn.className = 'btn btn--ghost btn--small exercise-reorder-btn exercise-reorder-up';
                upBtn.innerHTML = ''; // Empty - triangle shown via CSS ::after
                upBtn.setAttribute('aria-label', 'Mover ejercicio arriba');
                upBtn.dataset.sessionId = session.id;
                upBtn.dataset.exId = ex.id;
                upBtn.dataset.direction = 'up';

                const downBtn = document.createElement('button');
                downBtn.className = 'btn btn--ghost btn--small exercise-reorder-btn exercise-reorder-down';
                downBtn.innerHTML = ''; // Empty - triangle shown via CSS ::after
                downBtn.setAttribute('aria-label', 'Mover ejercicio abajo');
                downBtn.dataset.sessionId = session.id;
                downBtn.dataset.exId = ex.id;
                downBtn.dataset.direction = 'down';

                // Check if this is the first or last exercise
                const currentIndex = (session.exercises || []).findIndex(e => e.id === ex.id);
                if (currentIndex === 0) {
                    upBtn.disabled = true;
                    upBtn.style.opacity = '0.3';
                    upBtn.style.cursor = 'not-allowed';
                }
                if (currentIndex === exerciseCount - 1) {
                    downBtn.disabled = true;
                    downBtn.style.opacity = '0.3';
                    downBtn.style.cursor = 'not-allowed';
                }



                // Insert arrows at the beginning of the buttons container
                buttonsContainer.insertBefore(upBtn, buttonsContainer.firstChild);
                buttonsContainer.insertBefore(downBtn, buttonsContainer.firstChild);
            }

            const noteBtn = document.createElement('button');
            noteBtn.className = 'exercise-note-btn';
            noteBtn.type = 'button';
            const hasNote = getExerciseNote(session.id, ex.id);
            if (hasNote) {
                noteBtn.classList.add('has-note');
                noteBtn.innerHTML = '📝';
            } else {
                noteBtn.innerHTML = '+ Nota';
            }
            noteBtn.setAttribute('aria-label', hasNote ? 'Editar nota del ejercicio' : 'Añadir nota del ejercicio');
            noteBtn.dataset.sessionId = session.id;
            noteBtn.dataset.exId = ex.id;
            // noteBtn.addEventListener('click', () => openExerciseNoteDialog(session.id, ex.id, ex.name)); // Delegated
            headEl.appendChild(noteBtn);
        }

        // Render mobile cards
        const mobileContainer = block.querySelector('.sets-container');
        (ex.sets || []).forEach(set => mobileContainer.appendChild(renderSetCard(session, ex, set)));

        // Render desktop table
        const desktopTable = block.querySelector('.sets');
        (ex.sets || []).forEach(set => desktopTable.appendChild(renderSet(session, ex, set)));

        // Display exercise note if exists
        const note = getExerciseNote(session.id, ex.id);
        if (note) {
            const noteDisplay = document.createElement('div');
            noteDisplay.className = 'exercise-note-display';
            // Preserve line breaks in note display
            const noteText = escapeHtml(note).replace(/\n/g, '<br>');
            noteDisplay.innerHTML = `
                <div class="exercise-note-text">${noteText}</div>
                <div class="exercise-note-actions">
                    <button class="exercise-note-edit" data-session-id="${session.id}" data-ex-id="${ex.id}" aria-label="Editar nota">✏️</button>
                    <button class="exercise-note-delete" data-session-id="${session.id}" data-ex-id="${ex.id}" aria-label="Eliminar nota">🗑️</button>
                </div>
            `;
            // Listeners removed - handled by delegation
            // noteDisplay.querySelector('.exercise-note-edit').addEventListener('click', ...);
            // noteDisplay.querySelector('.exercise-note-delete').addEventListener('click', ...);
            block.appendChild(noteDisplay);
        }

        return block;
    }

    function openExerciseNoteDialog(sessionId, exId, exerciseName) {
        const currentNote = getExerciseNote(sessionId, exId);
        const dialog = $('#exerciseNoteDialog');
        const title = $('#exerciseNoteTitle');
        const textarea = $('#exerciseNoteText');

        if (title) title.textContent = `Nota: ${exerciseName}`;
        if (textarea) textarea.value = currentNote || '';

        // Store current session and exercise IDs for save handler
        dialog.dataset.sessionId = sessionId;
        dialog.dataset.exId = exId;

        dialog.showModal();
        if (textarea) {
            setTimeout(() => textarea.focus(), 100);
        }
    }

    function renderSet(session, ex, set) {
        const row = $('#tpl-set').content.firstElementChild.cloneNode(true);
        row.dataset.setId = set.id;
        row.querySelector('.set-num').textContent = set.setNumber;
        const kgInput = row.querySelector('.js-kg');
        const repsInput = row.querySelector('.js-reps');
        const rirInput = row.querySelector('.js-rir');
        if (kgInput) {
            kgInput.value = set.kg || '';
            if (!kgInput.value && (set.planKg || set.kgTemplate)) kgInput.placeholder = set.planKg || set.kgTemplate;
        }
        if (repsInput) {
            repsInput.value = set.reps || '';
            if (!repsInput.value && (set.planReps || set.repsTemplate)) repsInput.placeholder = set.planReps || set.repsTemplate;
        }
        if (rirInput) {
            rirInput.value = set.rir || '';
            if (!rirInput.value && (set.planRir || set.rirTemplate)) rirInput.placeholder = set.planRir || set.rirTemplate;
        }

        // Add PR badge
        const progressCell = row.querySelector('.progress');
        if (progressCell) {
            let progressHTML = progressText(session, ex, set);
            if (set.isPR) {
                const prLabel = set.prType === 'weight' ? 'Peso' : set.prType === 'volume' ? 'Volumen' : 'Reps';
                progressHTML += `<span class="pr-badge">🏆 PR ${prLabel}</span>`;
            }
            progressCell.innerHTML = progressHTML;
        }

        // Calculate and display 1RM
        if (set.kg && set.reps) {
            const onerm = calculate1RM(set.kg, set.reps);
            if (onerm) {
                const onermCell = document.createElement('td');
                onermCell.className = 'onerm-display';
                const currentBest = app.onerm[ex.name] || 0;
                const isPR = onerm > currentBest;
                onermCell.innerHTML = `<span class="${isPR ? 'onerm-pr' : 'onerm-value'}">1RM: ${onerm.toFixed(1)} kg</span>`;
                row.appendChild(onermCell);
            }
        }

        return row;
    }

    function renderSetCard(session, ex, set) {
        const card = $('#tpl-set-card').content.firstElementChild.cloneNode(true);
        card.dataset.setId = set.id;
        card.style.position = 'relative';
        card.querySelector('.set-number').textContent = `Set ${set.setNumber}`;
        const kgInput = card.querySelector('.js-kg');
        const repsInput = card.querySelector('.js-reps');
        const rirInput = card.querySelector('.js-rir');
        if (kgInput) {
            kgInput.value = set.kg || '';
            if (!kgInput.value && (set.planKg || set.kgTemplate)) kgInput.placeholder = set.planKg || set.kgTemplate;
        }
        if (repsInput) {
            repsInput.value = set.reps || '';
            if (!repsInput.value && (set.planReps || set.repsTemplate)) repsInput.placeholder = set.planReps || set.repsTemplate;
        }
        if (rirInput) {
            rirInput.value = set.rir || '';
            if (!rirInput.value && (set.planRir || set.rirTemplate)) rirInput.placeholder = set.planRir || set.rirTemplate;
        }

        // Add PR badge
        const progressEl = card.querySelector('.set-progress');
        if (progressEl) {
            let progressHTML = progressText(session, ex, set);
            if (set.isPR) {
                const prLabel = set.prType === 'weight' ? 'Peso' : set.prType === 'volume' ? 'Volumen' : 'Reps';
                progressHTML += `<span class="pr-badge pr-badge-set">🏆 PR ${prLabel}</span>`;
            }
            progressEl.innerHTML = progressHTML;
        }

        // Calculate and display 1RM
        if (set.kg && set.reps) {
            const onerm = calculate1RM(set.kg, set.reps);
            if (onerm) {
                const onermDiv = document.createElement('div');
                onermDiv.className = 'onerm-display';
                const currentBest = app.onerm[ex.name] || 0;
                const isPR = onerm > currentBest;
                onermDiv.innerHTML = `<span class="${isPR ? 'onerm-pr' : 'onerm-value'}">1RM: ${onerm.toFixed(1)} kg</span>`;
                card.appendChild(onermDiv);
            }
        }

        return card;
    }

    /* =================== REST TIMER SYSTEM =================== */
    let restTimerInterval = null;
    let restTimerSeconds = 0;
    let restTimerDialog = null;

    function openRestTimer() {
        restTimerDialog = $('#restTimerDialog');
        if (!restTimerDialog) return;

        // Reset timer state
        restTimerSeconds = 0;
        if (restTimerInterval) {
            clearInterval(restTimerInterval);
            restTimerInterval = null;
        }

        // Show selection, hide running timer and completed state
        $('#timerSelection').style.display = 'block';
        $('#timerRunning').style.display = 'none';
        $('#timerCompleted').style.display = 'none';
        $('#timerCancel').style.display = 'none';

        restTimerDialog.showModal();
    }

    function startRestTimer(minutes) {
        restTimerSeconds = minutes * 60;
        restTimerDialog = $('#restTimerDialog');
        if (!restTimerDialog) return;

        // Hide selection and completed state, show running timer
        $('#timerSelection').style.display = 'none';
        $('#timerRunning').style.display = 'block';
        $('#timerCompleted').style.display = 'none';
        $('#timerCancel').style.display = 'block';

        // Update display immediately
        updateTimerDisplay();

        // Start countdown
        if (restTimerInterval) {
            clearInterval(restTimerInterval);
        }

        restTimerInterval = setInterval(() => {
            restTimerSeconds--;
            updateTimerDisplay();

            if (restTimerSeconds <= 0) {
                clearInterval(restTimerInterval);
                restTimerInterval = null;

                // Hide running timer, show completed state
                $('#timerRunning').style.display = 'none';
                $('#timerCompleted').style.display = 'block';
                $('#timerCancel').style.display = 'none';

                // Close dialog after 2 seconds
                setTimeout(() => {
                    if (restTimerDialog) {
                        restTimerDialog.close();
                    }
                }, 2000);
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerTimeEl = $('#timerTime');
        if (!timerTimeEl) return;

        const minutes = Math.floor(restTimerSeconds / 60);
        const seconds = restTimerSeconds % 60;
        timerTimeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function stopRestTimer() {
        if (restTimerInterval) {
            clearInterval(restTimerInterval);
            restTimerInterval = null;
        }
        restTimerSeconds = 0;
        // Reset all timer states
        const timerSelection = $('#timerSelection');
        const timerRunning = $('#timerRunning');
        const timerCompleted = $('#timerCompleted');
        if (timerSelection) timerSelection.style.display = 'block';
        if (timerRunning) timerRunning.style.display = 'none';
        if (timerCompleted) timerCompleted.style.display = 'none';
        if (restTimerDialog) {
            restTimerDialog.close();
        }
    }

    /* =================== PREVIOUS WEEK DATA SYSTEM =================== */
    // Store original values when showing prev week data
    const prevWeekOriginalValues = new Map();

    function togglePrevWeekData(sessionId, exId, clickedButton) {
        if (!clickedButton) return;

        // Find the row or card that contains this set
        const rowOrCard = clickedButton.closest('tr[data-set-id]') || clickedButton.closest('.set-card[data-set-id]');
        if (!rowOrCard) return;

        const setId = rowOrCard.dataset.setId;
        if (!setId) return;

        const session = app.sessions.find(s => s.id === sessionId);
        if (!session) return;

        const exercise = session.exercises.find(e => e.id === exId);
        if (!exercise) return;

        const set = exercise.sets.find(s => s.id === setId);
        if (!set) return;

        const setNumber = set.setNumber;
        const exerciseName = exercise.name;

        // Find input elements
        const kgInput = rowOrCard.querySelector('.js-kg');
        const repsInput = rowOrCard.querySelector('.js-reps');
        const rirInput = rowOrCard.querySelector('.js-rir');

        if (!kgInput || !repsInput || !rirInput) return;

        const isActive = clickedButton.classList.contains('active');
        const storageKey = `${sessionId}-${exId}-${setId}`;

        if (isActive) {
            // Restore original values
            if (prevWeekOriginalValues.has(storageKey)) {
                const original = prevWeekOriginalValues.get(storageKey);
                kgInput.value = original.kg || '';
                repsInput.value = original.reps || '';
                rirInput.value = original.rir || '';
                prevWeekOriginalValues.delete(storageKey);
            }
            // Remove styling classes
            kgInput.classList.remove('showing-prev-week');
            repsInput.classList.remove('showing-prev-week');
            rirInput.classList.remove('showing-prev-week');
            clickedButton.textContent = '👁️';
            clickedButton.classList.remove('active');
            return;
        }

        // Save current values
        const currentValues = {
            kg: kgInput.value || '',
            reps: repsInput.value || '',
            rir: rirInput.value || ''
        };
        prevWeekOriginalValues.set(storageKey, currentValues);

        // Find previous week's data
        const prevWeekData = findPrevWeekSetData(exerciseName, setNumber);

        if (prevWeekData && (prevWeekData.kg || prevWeekData.reps || prevWeekData.rir)) {
            // Replace input values with previous week data
            kgInput.value = prevWeekData.kg || '';
            repsInput.value = prevWeekData.reps || '';
            rirInput.value = prevWeekData.rir || '';

            // Add class to style inputs with theme color
            kgInput.classList.add('showing-prev-week');
            repsInput.classList.add('showing-prev-week');
            rirInput.classList.add('showing-prev-week');
        } else {
            // No data found - clear inputs
            kgInput.value = '';
            repsInput.value = '';
            rirInput.value = '';
        }

        // Update button
        clickedButton.textContent = '👁️‍🗨️';
        clickedButton.classList.add('active');
    }

    function restoreOriginalValues(sessionId, exId, setId) {
        const storageKey = `${sessionId}-${exId}-${setId}`;
        if (!prevWeekOriginalValues.has(storageKey)) return;

        // Find the row or card
        const rowOrCard = document.querySelector(`tr[data-set-id="${setId}"], .set-card[data-set-id="${setId}"]`);
        if (!rowOrCard) return;

        const kgInput = rowOrCard.querySelector('.js-kg');
        const repsInput = rowOrCard.querySelector('.js-reps');
        const rirInput = rowOrCard.querySelector('.js-rir');
        const button = rowOrCard.querySelector('.js-prev-week-data');

        if (!kgInput || !repsInput || !rirInput) return;

        // Restore original values
        const original = prevWeekOriginalValues.get(storageKey);
        kgInput.value = original.kg || '';
        repsInput.value = original.reps || '';
        rirInput.value = original.rir || '';
        prevWeekOriginalValues.delete(storageKey);

        // Remove styling classes
        kgInput.classList.remove('showing-prev-week');
        repsInput.classList.remove('showing-prev-week');
        rirInput.classList.remove('showing-prev-week');

        // Update button
        if (button) {
            button.textContent = '👁️';
            button.classList.remove('active');
        }
    }

    function findPrevWeekSetData(exerciseName, setNumber) {
        if (!exerciseName || !setNumber) return null;

        // Calculate previous week range
        const currentWeekStart = addDays(startOfWeek(), app.weekOffset * 7);
        const prevWeekStart = addDays(currentWeekStart, -7);
        const prevWeekEnd = addDays(prevWeekStart, 6);
        prevWeekEnd.setHours(23, 59, 59, 999);

        // Find sessions in previous week
        const prevWeekSessions = app.sessions.filter(s => {
            if (!s.date) return false;
            const sessionDate = parseLocalDate(s.date);
            return sessionDate >= prevWeekStart && sessionDate <= prevWeekEnd;
        });

        // Find exercise with same name (case-insensitive comparison)
        for (const session of prevWeekSessions) {
            if (!session.exercises || !Array.isArray(session.exercises)) continue;

            const exercise = session.exercises.find(e => e.name && e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
            if (!exercise) continue;

            // Find set with same number
            if (!exercise.sets || !Array.isArray(exercise.sets)) continue;

            const set = exercise.sets.find(s => s.setNumber === setNumber);
            if (set) {
                return {
                    kg: set.kg || '',
                    reps: set.reps || '',
                    rir: set.rir || ''
                };
            }
        }

        return null;
    }

    /* =================== ADVANCED FEATURES SYSTEM =================== */

    // Initialize advanced features data
    if (!app.prs) app.prs = {};
    if (!app.onerm) app.onerm = {};
    if (!app.exerciseNotes) app.exerciseNotes = {};
    if (!app.achievements) app.achievements = [];
    if (!app.streak) app.streak = { current: 0, lastDate: null };
    if (!app.weeklyGoal) app.weeklyGoal = { target: 3, current: 0 };

    /* =================== PR Detection System =================== */

    function checkAndRecordPRs(sessionId, exId, setId, exerciseName) {
        const session = app.sessions.find(s => s.id === sessionId);
        if (!session) return;
        const exercise = session.exercises.find(e => e.id === exId);
        if (!exercise) return;
        const currentSet = exercise.sets.find(s => s.id === setId);
        if (!currentSet || !currentSet.kg || !currentSet.reps) return;

        const kg = parseFloat(currentSet.kg) || 0;
        const reps = parseReps(currentSet.reps);
        const volume = kg * reps;

        // Initialize PR data if needed
        if (!app.prs[exerciseName]) {
            app.prs[exerciseName] = { maxKg: 0, maxVolume: 0, maxRepsByKg: {} };
        }

        const prData = app.prs[exerciseName];
        let prDetected = false;
        let prType = '';

        // Check PR weight - Compare against STORED max, not just session max
        // This prevents false notifications when saving an existing session
        if (kg > (prData.maxKg || 0)) {
            prData.maxKg = kg;
            prDetected = true;
            prType = 'weight';
            currentSet.isPR = true;
            currentSet.prType = 'weight';
        }

        // Check PR volume
        if (volume > (prData.maxVolume || 0)) {
            prData.maxVolume = volume;
            prDetected = true;
            prType = prType ? 'multiple' : 'volume';
            if (!currentSet.isPR) {
                currentSet.isPR = true;
                currentSet.prType = 'volume';
            } else {
                currentSet.prType = 'multiple';
            }
        }

        // Check PR reps with same weight
        if (kg > 0 && (!prData.maxRepsByKg?.[kg] || reps > prData.maxRepsByKg[kg])) {
            if (!prData.maxRepsByKg) prData.maxRepsByKg = {};
            prData.maxRepsByKg[kg] = reps;
            if (!prDetected) {
                prDetected = true;
                prType = 'reps';
                currentSet.isPR = true;
                currentSet.prType = 'reps';
            }
        }

        if (prDetected) {
            // Save immediately to persist the new PR record
            save();
            toast(`🏆 Nuevo PR de ${prType === 'weight' ? 'peso' : prType === 'volume' ? 'volumen' : 'repeticiones'} en ${exerciseName}!`, 'ok');
        }
    }

    /* =================== 1RM Calculation System =================== */
    function calculate1RM(kg, reps) {
        if (!kg || !reps || kg <= 0 || reps <= 0) return null;
        const kgNum = parseFloat(kg);
        const repsNum = parseReps(reps);
        if (repsNum <= 0) return null;

        // Epley: 1RM = kg × (1 + reps / 30)
        const epley = kgNum * (1 + repsNum / 30);

        // Brzycki: 1RM = kg × (36 / (37 - reps))
        const brzycki = repsNum >= 37 ? null : kgNum * (36 / (37 - repsNum));

        // Wendler: 1RM = kg × reps^0.1
        const wendler = kgNum * Math.pow(repsNum, 0.1);

        // Average of valid calculations
        const valid = [epley, brzycki, wendler].filter(v => v !== null && isFinite(v));
        return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
    }

    function update1RM(exerciseName, onermValue) {
        if (!onermValue || !isFinite(onermValue)) return;
        const currentBest = app.onerm[exerciseName] || 0;
        if (onermValue > currentBest) {
            const wasPR = currentBest > 0;
            app.onerm[exerciseName] = onermValue;
            if (wasPR) {
                toast(`🏆 Nuevo PR de 1RM en ${exerciseName}: ${onermValue.toFixed(1)} kg!`, 'ok');
            }
            save();
        }
    }

    /* =================== Goals System =================== */
    if (!app.goals) app.goals = [];
    if (!app.recentAchievements) app.recentAchievements = [];

    function createMilestones(goal) {
        if (!goal.autoMilestones) return [];
        const milestones = [];
        const target = goal.type === 'repsWeight' ? (parseFloat(goal.targetReps) || 0) : (parseFloat(goal.target) || 0);
        let current = parseFloat(goal.current) || 0;

        // If current is 0, try to get actual progress from sessions
        if (current === 0 && goal.exerciseName) {
            current = calculateGoalProgress(goal);
        }

        const diff = target - current;

        // Determine milestone strategy based on goal type and difference
        if (goal.type === 'repsWeight') {
            // For repsWeight: milestones based on target reps
            const targetReps = parseFloat(goal.targetReps) || 0;
            const currentReps = current;
            const repsDiff = targetReps - currentReps;

            if (repsDiff <= 10) {
                // Small difference: use fixed increments
                const increment = Math.max(1, Math.ceil(repsDiff / 4));
                let milestoneValue = currentReps;
                while (milestoneValue < targetReps) {
                    milestoneValue = Math.min(targetReps, milestoneValue + increment);
                    if (milestoneValue > currentReps && milestoneValue < targetReps) {
                        milestones.push({
                            id: uuid(),
                            value: Math.round(milestoneValue),
                            completed: false,
                            completedAt: null
                        });
                    }
                }
            } else {
                // Large difference: use percentage-based milestones (25%, 50%, 75%)
                const percentages = [0.25, 0.5, 0.75];
                percentages.forEach(percent => {
                    const milestoneValue = currentReps + (repsDiff * percent);
                    if (milestoneValue > currentReps && milestoneValue < targetReps) {
                        milestones.push({
                            id: uuid(),
                            value: Math.round(milestoneValue),
                            completed: false,
                            completedAt: null
                        });
                    }
                });
            }
        } else if (goal.type === 'weight' || goal.type === 'reps') {
            // For weight/reps: use percentage-based increments (20%, 40%, 60%, 80%, 100%)
            // Or fixed increments if the difference is small
            if (diff <= 20) {
                // Small difference: use fixed 5kg/rep increments
                const increment = Math.max(1, Math.ceil(diff / 4));
                let milestoneValue = current;
                while (milestoneValue < target) {
                    milestoneValue = Math.min(target, milestoneValue + increment);
                    if (milestoneValue > current && milestoneValue < target) {
                        milestones.push({
                            id: uuid(),
                            value: Math.round(milestoneValue * 10) / 10,
                            completed: false,
                            completedAt: null
                        });
                    }
                }
            } else {
                // Large difference: use percentage-based milestones (25%, 50%, 75%, 100%)
                const percentages = [0.25, 0.5, 0.75];
                percentages.forEach(percent => {
                    const milestoneValue = current + (diff * percent);
                    if (milestoneValue > current && milestoneValue < target) {
                        milestones.push({
                            id: uuid(),
                            value: Math.round(milestoneValue * 10) / 10,
                            completed: false,
                            completedAt: null
                        });
                    }
                });
            }
        } else if (goal.type === 'volume') {
            // For volume: use percentage-based (20%, 40%, 60%, 80%)
            const percentages = [0.2, 0.4, 0.6, 0.8];
            percentages.forEach(percent => {
                const milestoneValue = current + (diff * percent);
                if (milestoneValue > current && milestoneValue < target) {
                    milestones.push({
                        id: uuid(),
                        value: Math.round(milestoneValue * 10) / 10,
                        completed: false,
                        completedAt: null
                    });
                }
            });
        } else {
            // For sessions, streak, exercise: use equal divisions (25%, 50%, 75%)
            const percentages = [0.25, 0.5, 0.75];
            percentages.forEach(percent => {
                const milestoneValue = current + (diff * percent);
                if (milestoneValue > current && milestoneValue < target) {
                    milestones.push({
                        id: uuid(),
                        value: Math.round(milestoneValue * 10) / 10,
                        completed: false,
                        completedAt: null
                    });
                }
            });
        }

        return milestones;
    }

    function calculateGoalProgress(goal) {
        const sessions = app.sessions.filter(s => s.completed);
        let current = 0;

        switch (goal.type) {
            case 'loseWeight':
                // Get current weight from profile
                const currentWeight = parseFloat(app.profile?.weight) || 0;
                if (currentWeight > 0) {
                    // For weight loss, we track how much weight has been lost
                    // If target is 70kg and current is 75kg, progress is 5kg lost (towards 70kg)
                    const initialWeight = goal.initialWeight || currentWeight;
                    current = Math.max(0, initialWeight - currentWeight);
                }
                break;
            case 'gainWeight':
                // Get current weight from profile
                const currentWeightGain = parseFloat(app.profile?.weight) || 0;
                if (currentWeightGain > 0) {
                    // For weight gain, we track how much weight has been gained
                    // If target is 80kg and current is 75kg, progress is 5kg gained (towards 80kg)
                    const initialWeightGain = goal.initialWeight || currentWeightGain;
                    current = Math.max(0, currentWeightGain - initialWeightGain);
                }
                break;
            case 'weight':
                if (goal.exerciseName) {
                    const exerciseSessions = sessions.flatMap(s =>
                        (s.exercises || []).filter(e => e.name === goal.exerciseName)
                    );
                    exerciseSessions.forEach(ex => {
                        (ex.sets || []).forEach(set => {
                            const kg = parseFloat(set.kg) || 0;
                            if (kg > current) current = kg;
                        });
                    });
                }
                break;
            case 'volume':
                sessions.forEach(s => {
                    (s.exercises || []).forEach(ex => {
                        (ex.sets || []).forEach(set => {
                            const kg = parseFloat(set.kg) || 0;
                            const reps = parseReps(set.reps);
                            current += kg * reps;
                        });
                    });
                });
                break;
            case 'reps':
                if (goal.exerciseName) {
                    const exerciseSessions = sessions.flatMap(s =>
                        (s.exercises || []).filter(e => e.name === goal.exerciseName)
                    );
                    exerciseSessions.forEach(ex => {
                        (ex.sets || []).forEach(set => {
                            const reps = parseReps(set.reps);
                            if (reps > current) current = reps;
                        });
                    });
                }
                break;
            case 'repsWeight':
                if (goal.exerciseName && goal.targetKg && goal.targetReps) {
                    const exerciseSessions = sessions.flatMap(s =>
                        (s.exercises || []).filter(e => e.name === goal.exerciseName)
                    );
                    exerciseSessions.forEach(ex => {
                        (ex.sets || []).forEach(set => {
                            const kg = parseFloat(set.kg) || 0;
                            const reps = parseReps(set.reps);
                            // Check if this set was done with at least the target weight
                            // Track the maximum reps achieved with target weight or more
                            if (kg >= goal.targetKg && reps > 0) {
                                current = Math.max(current, reps);
                            }
                        });
                    });
                }
                break;
            case 'sessions':
                current = sessions.length;
                break;
            case 'streak':
                current = app.streak?.current || 0;
                break;
            case 'exercise':
                if (goal.exerciseName) {
                    const exerciseSessions = sessions.flatMap(s =>
                        (s.exercises || []).filter(e => e.name === goal.exerciseName)
                    );
                    current = exerciseSessions.length;
                }
                break;
        }

        return current;
    }

    function updateGoalProgress(goal) {
        const newCurrent = calculateGoalProgress(goal);
        const wasCompleted = goal.completed;
        goal.current = newCurrent;

        // For weight loss/gain, the target is the amount to lose/gain, not the final weight
        if (goal.type === 'loseWeight' || goal.type === 'gainWeight') {
            goal.progress = Math.min(100, (newCurrent / parseFloat(goal.target)) * 100);
            goal.completed = newCurrent >= parseFloat(goal.target);
        } else if (goal.type === 'repsWeight') {
            // For repsWeight, goal is completed when current reps >= target reps (with target weight)
            goal.progress = Math.min(100, (newCurrent / parseFloat(goal.targetReps)) * 100);
            goal.completed = newCurrent >= parseFloat(goal.targetReps);
        } else {
            goal.progress = Math.min(100, (newCurrent / parseFloat(goal.target)) * 100);
            goal.completed = newCurrent >= parseFloat(goal.target);
        }

        // Check milestones
        if (goal.milestones && goal.milestones.length > 0) {
            goal.milestones.forEach(milestone => {
                if (!milestone.completed && newCurrent >= milestone.value) {
                    milestone.completed = true;
                    milestone.completedAt = new Date().toISOString();
                    celebrateMilestone(goal, milestone);
                }
            });
        }

        // Celebrate goal completion
        if (!wasCompleted && goal.completed) {
            celebrateGoal(goal);
        }

        // Adaptive adjustment based on progress
        if (goal.adaptive && !goal.completed) {
            adjustGoalAdaptively(goal);
        }
    }

    function adjustGoalAdaptively(goal) {
        const deadline = goal.deadline ? new Date(goal.deadline) : null;
        if (!deadline) return;

        const now = new Date();
        const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        const progress = goal.progress || 0;
        const expectedProgress = ((deadline.getTime() - new Date(goal.createdAt).getTime()) / (now.getTime() - new Date(goal.createdAt).getTime())) * 100;

        if (daysRemaining < 7 && progress < expectedProgress * 0.7) {
            // If behind schedule, suggest adjustment
            const suggestedTarget = goal.current + ((goal.target - goal.current) * 0.8);
            goal.suggestedAdjustment = {
                target: suggestedTarget,
                reason: 'Ajuste sugerido basado en progreso actual'
            };
        }
    }

    function celebrateGoal(goal) {
        const achievement = {
            id: uuid(),
            type: 'goal',
            title: `🎯 Objetivo completado: ${goal.name}`,
            description: `Has alcanzado tu objetivo de ${goal.name}`,
            date: new Date().toISOString(),
            goalId: goal.id
        };

        app.recentAchievements.unshift(achievement);
        if (app.recentAchievements.length > 10) {
            app.recentAchievements = app.recentAchievements.slice(0, 10);
        }

        toast(`🎉 ¡Objetivo completado! ${goal.name}`, 'ok');
        save();
        renderGoals();
        renderRecentAchievements();
        renderAllAchievements();

        // Trigger celebration animation
        setTimeout(() => {
            createConfetti();
            // Find goal item and add celebration class
            const goalItem = $(`.goal-item[data-goal-id="${goal.id}"]`);
            if (goalItem) {
                goalItem.classList.add('fiesta-celebration');
                setTimeout(() => {
                    goalItem.classList.remove('fiesta-celebration');
                }, 600);
            }
        }, 100);
    }

    function celebrateMilestone(goal, milestone) {
        // Trigger celebration animation for milestone
        setTimeout(() => {
            createConfetti();
        }, 100);
        const achievement = {
            id: uuid(),
            type: 'milestone',
            title: `🏆 Hito alcanzado: ${milestone.value}`,
            description: `Hito del objetivo "${goal.name}"`,
            date: new Date().toISOString(),
            goalId: goal.id,
            milestoneId: milestone.id
        };

        app.recentAchievements.unshift(achievement);
        if (app.recentAchievements.length > 10) {
            app.recentAchievements = app.recentAchievements.slice(0, 10);
        }

        toast(`🎯 Hito alcanzado: ${milestone.value}`, 'ok');
        save();
        renderGoals();
        renderRecentAchievements();
        renderAllAchievements();

        // Trigger celebration animation for milestone
        setTimeout(() => {
            createConfetti();
        }, 100);
    }

    function addGoal(goalData) {
        // Create temporary goal object to calculate current progress
        const tempGoal = {
            type: goalData.type,
            target: parseFloat(goalData.target) || 0,
            targetKg: goalData.type === 'repsWeight' ? parseFloat(goalData.target) : null,
            targetReps: goalData.repsTarget || null,
            exerciseName: goalData.exerciseName || null,
            current: 0
        };

        // For weight loss/gain goals, store initial weight
        let initialWeight = null;
        if (goalData.type === 'loseWeight' || goalData.type === 'gainWeight') {
            initialWeight = parseFloat(app.profile?.weight) || 0;
        }

        // Calculate actual current progress before creating milestones
        const actualCurrent = calculateGoalProgress(tempGoal);

        const goal = {
            id: uuid(),
            name: goalData.name,
            type: goalData.type,
            target: parseFloat(goalData.target) || 0,
            targetKg: goalData.type === 'repsWeight' ? parseFloat(goalData.target) : null,
            targetReps: goalData.repsTarget || null,
            current: actualCurrent,
            progress: 0,
            completed: false,
            exerciseName: goalData.exerciseName || null,
            deadline: goalData.deadline || null,
            autoMilestones: goalData.autoMilestones || false,
            adaptive: true,
            createdAt: new Date().toISOString(),
            initialWeight: initialWeight,
            milestones: goalData.autoMilestones ? createMilestones({
                type: goalData.type,
                target: goalData.target,
                targetKg: goalData.type === 'repsWeight' ? parseFloat(goalData.target) : null,
                targetReps: goalData.repsTarget || null,
                current: actualCurrent,
                exerciseName: goalData.exerciseName || null,
                autoMilestones: true
            }) : []
        };

        updateGoalProgress(goal);
        app.goals.push(goal);
        save();
        renderGoals();
        toast('Objetivo creado', 'ok');
    }

    function deleteGoal(goalId) {
        app.goals = app.goals.filter(g => g.id !== goalId);
        save();
        renderGoals();
    }

    function renderGoals() {
        const list = $('#goalsList');
        const empty = $('#noGoals');
        if (!list) return;

        // Update all goals progress
        app.goals.forEach(goal => updateGoalProgress(goal));

        if (!app.goals || app.goals.length === 0) {
            if (empty) empty.hidden = false;
            if (list) list.innerHTML = '';
            return;
        }

        if (empty) empty.hidden = true;
        list.innerHTML = '';

        app.goals.forEach(goal => {
            const item = document.createElement('div');
            item.className = `goal-item ${goal.completed ? 'completed' : ''}`;

            const progressPercent = Math.min(100, goal.progress || 0);

            // Format goal display based on type
            let goalDisplay = '';
            if (goal.type === 'repsWeight' && goal.targetKg && goal.targetReps) {
                goalDisplay = `${Math.round(goal.current)} / ${goal.targetReps} reps (con ${goal.targetKg} kg)`;
            } else {
                goalDisplay = `${goal.current.toFixed(1)} / ${goal.target}`;
            }

            const createdDate = goal.createdAt ? new Date(goal.createdAt).toLocaleDateString('es-ES') : '';
            item.innerHTML = `
                        <div class="goal-header">
                            <h4 class="goal-title">${escapeHtml(goal.name)}</h4>
                            <div class="goal-actions">
                                <button class="btn btn--small btn--ghost js-delete-goal" data-goal-id="${goal.id}" aria-label="Eliminar objetivo">✕</button>
                            </div>
                        </div>
                        <div class="goal-progress">
                            <div class="goal-stats">
                                <span>${goalDisplay}</span>
                                <span>${progressPercent.toFixed(0)}%</span>
                            </div>
                            <div class="goal-progress-bar">
                                <div class="goal-progress-fill ${goal.completed ? 'completed' : ''}" style="width: ${progressPercent}%"></div>
                            </div>
                            ${createdDate ? `<div class="goal-date" style="color: #000000; font-size: 0.75rem; margin-top: 6px; opacity: 0.7;">Creado: ${createdDate}</div>` : ''}
                        </div>
                        ${goal.milestones && goal.milestones.length > 0 ? `
                            <div class="goal-milestones">
                                ${goal.milestones.map(m => {
                let milestoneText = m.value;
                if (goal.type === 'repsWeight') {
                    milestoneText = `${Math.round(m.value)} REPS`;
                } else if (goal.type === 'weight') {
                    milestoneText = `${m.value} KG`;
                }
                return `
                                    <div class="milestone-item ${m.completed ? 'completed' : ''}">
                                        <div class="milestone-check">${m.completed ? '✓' : ''}</div>
                                        <span>${milestoneText}</span>
                                    </div>
                                `;
            }).join('')}
                            </div>
                        ` : ''}
                    `;

            const deleteBtn = item.querySelector('.js-delete-goal');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    app.deleteTarget = { type: 'goal', goalId: goal.id };
                    showConfirmDialog('¿Eliminar este objetivo?');
                });
            }

            list.appendChild(item);
        });
    }

    function updateAchievementsByTime() {
        if (!app.recentAchievements) app.recentAchievements = [];
        if (!app.achievements) app.achievements = [];

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        twoWeeksAgo.setHours(0, 0, 0, 0);

        const recent = [];
        const toMove = [];

        app.recentAchievements.forEach(achievement => {
            const achievementDate = new Date(achievement.date);
            achievementDate.setHours(0, 0, 0, 0);

            if (achievementDate >= twoWeeksAgo) {
                recent.push(achievement);
            } else {
                toMove.push(achievement);
            }
        });

        // Move old achievements to all achievements
        if (toMove.length > 0) {
            toMove.forEach(achievement => {
                // Check if already exists in all achievements
                const exists = app.achievements.some(a => a.id === achievement.id);
                if (!exists) {
                    app.achievements.push(achievement);
                }
            });

            app.achievements.sort((a, b) => new Date(b.date) - new Date(a.date));
            app.recentAchievements = recent;
            save();
        }
    }

    function deleteAchievement(achievementId, isRecent = false) {
        // Remove from both lists to ensure complete deletion
        app.recentAchievements = (app.recentAchievements || []).filter(a => a.id !== achievementId);
        app.achievements = (app.achievements || []).filter(a => a.id !== achievementId);
        save();
        renderRecentAchievements();
        renderAllAchievements();
    }

    function renderRecentAchievements() {
        updateAchievementsByTime();

        const container = $('#recentAchievements');
        if (!container) return;

        if (!app.recentAchievements || app.recentAchievements.length === 0) {
            container.innerHTML = '<div class="routine-empty">Aún no hay logros recientes.</div>';
            return;
        }

        container.innerHTML = '';
        app.recentAchievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = `achievement-badge ${achievement.type === 'milestone' ? 'achievement-milestone' : ''}`;
            const date = new Date(achievement.date).toLocaleDateString('es-ES');
            const icon = achievement.type === 'goal' ? '🎯' : achievement.type === 'milestone' ? '🏆' : achievement.type === 'reps-weight' ? '💪' : '🏆';
            badge.innerHTML = `
                        <div class="achievement-icon">${icon}</div>
                        <div class="achievement-text">
                            <strong>${achievement.title}</strong>
                            <div class="achievement-date">${date}</div>
                        </div>
                        <button class="achievement-delete-btn" aria-label="Eliminar logro" title="Eliminar logro">✕</button>
                    `;
            const deleteBtn = badge.querySelector('.achievement-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteAchievement(achievement.id, true);
            });
            container.appendChild(badge);
        });
    }

    function renderAllAchievements() {
        const container = $('#allAchievements');
        if (!container) return;

        // Combine recent and all achievements, removing duplicates
        const allAchievements = [];
        const seenIds = new Set();

        // Add all achievements first
        (app.achievements || []).forEach(ach => {
            if (!seenIds.has(ach.id)) {
                allAchievements.push(ach);
                seenIds.add(ach.id);
            }
        });

        // Add recent achievements that are older than 2 weeks (should already be moved, but just in case)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        (app.recentAchievements || []).forEach(ach => {
            const achDate = new Date(ach.date);
            if (achDate < twoWeeksAgo && !seenIds.has(ach.id)) {
                allAchievements.push(ach);
                seenIds.add(ach.id);
            }
        });

        // Sort by date descending
        allAchievements.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (allAchievements.length === 0) {
            container.innerHTML = '<div class="routine-empty">Aún no hay logros.</div>';
            return;
        }

        container.innerHTML = '';
        allAchievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = `achievement-badge ${achievement.type === 'milestone' ? 'achievement-milestone' : ''}`;
            const date = new Date(achievement.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const icon = achievement.type === 'goal' ? '🎯' : achievement.type === 'milestone' ? '🏆' : achievement.type === 'reps-weight' ? '💪' : '🏆';
            badge.innerHTML = `
                        <div class="achievement-icon">${icon}</div>
                        <div class="achievement-text">
                            <strong>${achievement.title}</strong>
                            <div class="achievement-date">${date}</div>
                        </div>
                        <button class="achievement-delete-btn" aria-label="Eliminar logro" title="Eliminar logro">✕</button>
                    `;
            const deleteBtn = badge.querySelector('.achievement-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteAchievement(achievement.id);
            });
            container.appendChild(badge);
        });
    }

    /* =================== Exercise Notes System =================== */
    function getExerciseNoteKey(sessionId, exId) {
        return `${sessionId}_${exId}`;
    }

    function saveExerciseNote(sessionId, exId, note) {
        // Notes are always editable - no edit mode required
        const key = getExerciseNoteKey(sessionId, exId);
        if (note && note.trim()) {
            // Preserve line breaks - don't trim newlines, only leading/trailing whitespace
            app.exerciseNotes[key] = note.replace(/^\s+|\s+$/g, '');
        } else {
            delete app.exerciseNotes[key];
        }

        // Save immediately
        save();
    }

    function getExerciseNote(sessionId, exId) {
        const key = getExerciseNoteKey(sessionId, exId);
        return app.exerciseNotes[key] || '';
    }

    /* =================== Competitive Mode System =================== */
    function updateStreak() {
        const completedSessions = app.sessions.filter(s => s.completed).sort((a, b) => new Date(b.date) - new Date(a.date));
        if (completedSessions.length === 0) {
            app.streak = { current: 0, lastDate: null };
            save();
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        let checkDate = new Date(today);

        for (const session of completedSessions) {
            const sessionDate = parseLocalDate(session.date);
            sessionDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((checkDate - sessionDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (daysDiff === 1) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        app.streak = { current: streak, lastDate: completedSessions[0]?.date || null };
        save();
    }

    function updateWeeklyGoal() {
        const { ws, we } = getVisibleWeek();
        const weekSessions = app.sessions.filter(s => {
            const d = parseLocalDate(s.date);
            return d >= ws && d <= we && s.completed;
        });
        app.weeklyGoal.current = weekSessions.length;
        save();
    }

    function checkAchievements() {
        const achievements = [];
        const completedSessions = app.sessions.filter(s => s.completed);
        const totalVolume = app.sessions.reduce((sum, s) => {
            return sum + (s.exercises || []).reduce((exSum, ex) => {
                return exSum + (ex.sets || []).reduce((setSum, set) => {
                    const kg = parseFloat(set.kg) || 0;
                    const reps = parseReps(set.reps);
                    return setSum + (kg * reps);
                }, 0);
            }, 0);
        }, 0);

        // Check existing achievements to avoid duplicates
        const existingIds = new Set((app.achievements || []).map(a => a.id));

        // 10 sessions completed
        if (completedSessions.length >= 10 && !existingIds.has('10_sessions')) {
            achievements.push({ id: '10_sessions', icon: '🎯', title: '10 sesiones completadas', date: new Date().toISOString() });
        }

        // First week complete
        const weeks = new Set(completedSessions.map(s => {
            const d = parseLocalDate(s.date);
            return startOfWeek(d).toISOString();
        }));
        if (weeks.size >= 1 && !existingIds.has('first_week')) {
            achievements.push({ id: 'first_week', icon: '🌟', title: 'Tu primera semana completa', date: new Date().toISOString() });
        }

        // First PR
        const hasPR = Object.keys(app.prs || {}).length > 0;
        if (hasPR && !existingIds.has('first_pr')) {
            achievements.push({ id: 'first_pr', icon: '🏆', title: 'Primer PR de peso', date: new Date().toISOString() });
        }

        // 7 day streak
        if (app.streak && app.streak.current >= 7 && !existingIds.has('streak_7')) {
            achievements.push({ id: 'streak_7', icon: '🔥', title: 'Racha de 7 días', date: new Date().toISOString() });
        }

        // 5000 kg volume
        if (totalVolume >= 5000 && !existingIds.has('volume_5k')) {
            achievements.push({ id: 'volume_5k', icon: '💪', title: '5000 kg de volumen total', date: new Date().toISOString() });
        }

        if (achievements.length > 0) {
            if (!app.achievements) app.achievements = [];
            app.achievements.push(...achievements);
            app.achievements.sort((a, b) => new Date(b.date) - new Date(a.date));
            save();
            achievements.forEach(ach => {
                toast(`${ach.icon} ${ach.title}!`, 'ok');
            });
        }
    }

    function renderCompetitiveMode() {
        updateStreak();
        updateWeeklyGoal();
        checkAchievements();

        const streakEl = $('#currentStreak');
        if (streakEl) streakEl.textContent = app.streak?.current || 0;

        const goalProgressEl = $('#weeklyGoalProgress');
        const goalBarEl = $('#weeklyGoalBar');
        if (goalProgressEl && goalBarEl) {
            const current = app.weeklyGoal?.current || 0;
            const target = app.weeklyGoal?.target || 3;
            goalProgressEl.textContent = `${current} / ${target}`;
            const percentage = Math.min((current / target) * 100, 100);
            goalBarEl.style.width = `${percentage}%`;
        }

        const achievementsList = $('#achievementsList');
        if (achievementsList) {
            const achievements = app.achievements || [];
            if (achievements.length === 0) {
                achievementsList.innerHTML = '<div class="routine-empty">Aún no hay logros. ¡Sigue entrenando!</div>';
            } else {
                achievementsList.innerHTML = achievements.map(ach => {
                    const date = new Date(ach.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                    return `
                        <div class="achievement-item">
                            <div class="achievement-icon">${ach.icon}</div>
                            <div class="achievement-content">
                                <div class="achievement-title">${ach.title}</div>
                                <div class="achievement-date">${date}</div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    /* =================== Copy Last Week Workout =================== */
    function copyLastWeekWorkout() {
        const { ws } = getVisibleWeek();
        const lastWeekStart = addDays(ws, -7);
        const lastWeekEnd = addDays(lastWeekStart, 6);
        lastWeekEnd.setHours(23, 59, 59, 999);

        // Find sessions from last week
        const lastWeekSessions = app.sessions.filter(s => {
            const d = parseLocalDate(s.date);
            return d >= lastWeekStart && d <= lastWeekEnd;
        }).sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));

        if (lastWeekSessions.length === 0) {
            toast('No hay entrenamientos en la semana pasada para copiar', 'warn');
            return;
        }

        // Get today's day of week (Monday=1, Sunday=7)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let todayDayOfWeek = today.getDay();
        if (todayDayOfWeek === 0) todayDayOfWeek = 7; // Sunday = 7
        const targetDayIndex = todayDayOfWeek - 1; // 0-6 for Monday-Sunday

        // Find session from same day last week
        const lastWeekSameDay = lastWeekSessions.find(s => {
            const sDate = parseLocalDate(s.date);
            let sDayOfWeek = sDate.getDay();
            if (sDayOfWeek === 0) sDayOfWeek = 7;
            return (sDayOfWeek - 1) === targetDayIndex;
        });

        if (!lastWeekSameDay) {
            const dayNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
            toast(`No hay entrenamiento del ${dayNames[targetDayIndex]} de la semana pasada`, 'warn');
            return;
        }

        // Create new session with today's date
        const newDate = toLocalISO(today);
        const newSession = {
            id: uuid(),
            name: lastWeekSameDay.name,
            date: newDate,
            completed: false,
            exercises: (lastWeekSameDay.exercises || []).map(ex => ({
                id: uuid(),
                name: ex.name,
                sets: (ex.sets || []).map(set => ({
                    id: uuid(),
                    setNumber: set.setNumber || 1,
                    kg: set.kg || '',
                    reps: set.reps || '',
                    rir: set.rir || '',
                    planKg: set.planKg || '',
                    planReps: set.planReps || '',
                    planRir: set.planRir || ''
                }))
            }))
        };

        app.sessions.push(newSession);
        save();
        refresh();
        toast(`Entrenamiento copiado de la semana pasada: ${newSession.name}`, 'ok');
    }

    /* =================== Manual Save System =================== */
    function startEditingSession(sessionId) {
        const session = app.sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Create deep copy for snapshot
        app.sessionSnapshots[sessionId] = JSON.parse(JSON.stringify(session));

        // Mark as editing
        if (!app.editingSessions[sessionId]) {
            app.editingSessions[sessionId] = { isEditing: true, hasChanges: false };
        } else {
            app.editingSessions[sessionId].isEditing = true;
            app.editingSessions[sessionId].hasChanges = false;
        }

        updateSessionEditUI(sessionId);
    }

    function saveSessionChanges(sessionId) {
        const session = app.sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Validate session data
        if (!session.name || !session.name.trim()) {
            toast('El nombre de la sesión no puede estar vacío', 'warn');
            return;
        }

        // Recalculate PRs and 1RM for all exercises in the session
        session.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                if (set.kg && set.reps) {
                    checkAndRecordPRs(sessionId, ex.id, set.id, ex.name);
                    const onerm = calculate1RM(set.kg, set.reps);
                    if (onerm) {
                        update1RM(ex.name, onerm);
                    }
                }
            });
        });

        // Update goals progress if session is completed
        if (session.completed && app.goals && app.goals.length > 0) {
            app.goals.forEach(goal => updateGoalProgress(goal));
        }

        // Save to persistent storage
        save();

        // Clear editing state
        if (app.editingSessions[sessionId]) {
            app.editingSessions[sessionId].isEditing = false;
            app.editingSessions[sessionId].hasChanges = false;
        }
        delete app.sessionSnapshots[sessionId];

        updateSessionEditUI(sessionId);
        refresh({ preserveTab: true });
        toast('Cambios guardados', 'ok');
    }

    function cancelSessionChanges(sessionId) {
        const session = app.sessions.find(s => s.id === sessionId);
        const snapshot = app.sessionSnapshots[sessionId];
        if (!session || !snapshot) return;

        // Restore from snapshot
        const sessionIndex = app.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
            app.sessions[sessionIndex] = JSON.parse(JSON.stringify(snapshot));
        }

        // Clear editing state
        if (app.editingSessions[sessionId]) {
            app.editingSessions[sessionId].isEditing = false;
            app.editingSessions[sessionId].hasChanges = false;
        }
        delete app.sessionSnapshots[sessionId];

        updateSessionEditUI(sessionId);
        refresh({ preserveTab: true });
        toast('Cambios descartados', 'ok');
    }

    function markSessionAsChanged(sessionId) {
        if (app.editingSessions[sessionId]) {
            app.editingSessions[sessionId].hasChanges = true;
        } else {
            app.editingSessions[sessionId] = { isEditing: false, hasChanges: true };
        }
        updateSessionEditUI(sessionId);
    }

    function updateSessionEditUI(sessionId) {
        const sessionEl = document.querySelector(`.session[data-id="${sessionId}"]`);
        if (!sessionEl) return;

        const editState = app.editingSessions[sessionId];
        const isEditing = editState && editState.isEditing;
        const hasChanges = editState && editState.hasChanges;

        // Toggle editing class
        if (isEditing) {
            sessionEl.classList.add('editing');
        } else {
            sessionEl.classList.remove('editing');
        }

        // Toggle changes indicator (only for name changes)
        if (hasChanges) {
            sessionEl.classList.add('has-changes');
            const indicator = sessionEl.querySelector('.session__changes-indicator');
            if (indicator) indicator.style.display = 'flex';
        } else {
            sessionEl.classList.remove('has-changes');
            const indicator = sessionEl.querySelector('.session__changes-indicator');
            if (indicator) indicator.style.display = 'none';
        }

        // Hide edit controls permanently (not needed anymore - edit button opens dialog directly)
        const editControls = sessionEl.querySelector('.session__edit-controls');
        if (editControls) {
            editControls.style.display = 'none';
        }

        // Exercise names are always editable - no restrictions
        // Sets are always editable
        // Exercise deletion is always available - no restrictions
    }

    function hasUnsavedChanges() {
        return Object.values(app.editingSessions).some(state => state.hasChanges);
    }

    function getEditingSessionIds() {
        return Object.keys(app.editingSessions).filter(id =>
            app.editingSessions[id] && app.editingSessions[id].isEditing
        );
    }

    /* =================== CRUD =================== */
    async function addSession({ name, date }) {
        const newSession = { id: uuid(), name, date, completed: false, exercises: [] };
        app.sessions.push(newSession);

        // Save to both user_data and sessions table
        try {
            await save();
            // Also save to sessions table
            if (typeof supabaseService !== 'undefined') {
                const isAvailable = await supabaseService.isAvailable();
                if (isAvailable) {
                    try {
                        await supabaseService.saveSession(newSession);
                    } catch (error) {
                        console.warn('Error guardando sesión en tabla sessions:', error);
                        // Continue even if sessions table save fails
                    }
                }
            }
        } catch (error) {
            // Remove from app.sessions if save failed
            app.sessions = app.sessions.filter(s => s.id !== newSession.id);
            throw error;
        }
        refresh();
    }

    async function updateSession(id, { name, date }) {
        const session = app.sessions.find(s => s.id === id);
        if (!session) return;
        session.name = name;
        session.date = date;

        // Save to both user_data and sessions table
        try {
            await save();
            // Also update in sessions table
            if (typeof supabaseService !== 'undefined') {
                const isAvailable = await supabaseService.isAvailable();
                if (isAvailable) {
                    try {
                        await supabaseService.saveSession(session);
                    } catch (error) {
                        console.warn('Error actualizando sesión en tabla sessions:', error);
                        // Continue even if sessions table update fails
                    }
                }
            }
        } catch (error) {
            throw error;
        }
        refresh();
    }
    function deleteSession(id) {
        app.deleteTarget = { type: 'session', id };
        showConfirmDialog('¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.');
    }
    /* =================== FIESTA CELEBRATION ANIMATION =================== */
    function triggerFiestaCelebration(sessionId) {
        // Check if user prefers reduced motion
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Find the session
        const session = app.sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Find the session card element
        const sessionCard = $(`.session[data-id="${sessionId}"]`);
        if (!sessionCard) return;

        // Add celebration class to the card
        sessionCard.classList.add('fiesta-celebration');

        // Remove class after animation completes
        setTimeout(() => {
            sessionCard.classList.remove('fiesta-celebration');
        }, 600);

        // Create level-up notification with session name and date
        createLevelUpNotification(session.name, session.date);
    }

    function createLevelUpNotification(sessionName, sessionDate = null) {
        // Check if user prefers reduced motion
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Remove existing notification if any
        const existing = $('#levelUpNotification');
        if (existing) {
            existing.remove();
        }

        // Create notification container
        const notification = document.createElement('div');
        notification.id = 'levelUpNotification';
        notification.className = 'level-up-notification';

        // Format date for notification
        let dayText = 'COMPLETADO';
        if (sessionDate) {
            const date = parseLocalDate(sessionDate);
            const dayNumber = date.getDate();
            const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
            dayText = `Día ${dayNumber} de ${monthName} completado`;
        }

        // Create content
        notification.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">✓</div>
                <div class="level-up-text">
                    <div class="level-up-title">${escapeHtml(sessionName)}</div>
                    <div class="level-up-subtitle">${dayText}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove notification after animation
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }, 3000);
    }

    async function toggleCompleted(id) {
        const s = app.sessions.find(x => x.id === id);
        if (!s) return;
        const wasCompleted = s.completed;
        s.completed = !s.completed;

        // Force UI update immediately
        refresh();

        // Trigger celebration animation if session was just completed (not uncompleted)
        if (s.completed && !wasCompleted) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                triggerFiestaCelebration(id);
            }, 100);
        }

        // Save to both user_data and sessions table (non-blocking, don't wait)
        save().catch(error => {
            console.warn('Error guardando sesión completada:', error);
            // Revert the change if save failed
            s.completed = wasCompleted;
            refresh(); // Revert UI
            toast('Error al guardar el estado de la sesión', 'err');
        });

        // Also update in sessions table (non-blocking)
        if (typeof supabaseService !== 'undefined') {
            supabaseService.isAvailable().then(isAvailable => {
                if (isAvailable) {
                    supabaseService.saveSession(s).catch(error => {
                        console.warn('Error actualizando sesión completada en tabla sessions:', error);
                        // Continue even if sessions table update fails
                    });
                }
            });
        }

        // Update competitive mode stats
        updateStreak();
        updateWeeklyGoal();
        checkAchievements();
        
        // Update goals progress
        if (app.goals && app.goals.length > 0) {
            app.goals.forEach(goal => updateGoalProgress(goal));
            // Save again after updating goals (like TrainTracker does)
            save().catch(error => {
                console.warn('Error guardando goals actualizados:', error);
            });
        }
    }
    function addExercise(sessionId, name) {
        const s = app.sessions.find(x => x.id === sessionId); if (!s) return;

        // No edit mode required - always allow adding exercises

        s.exercises.push({ id: uuid(), name, sets: [{ id: uuid(), setNumber: 1, kg: '', reps: '', rir: '' }] });
        save();
        refresh({ preserveTab: true });
    }

    function deleteExercise(sessionId, exId) {
        const s = app.sessions.find(x => x.id === sessionId);
        if (!s) return;

        // No edit mode required - always allow deleting exercises (with confirmation)
        const ex = s.exercises.find(e => e.id === exId);
        if (!ex) return;

        // Show confirmation dialog
        app.deleteTarget = { type: 'exercise', sessionId, exId };
        showConfirmDialog(`¿Estás seguro de que quieres eliminar el ejercicio "${ex.name}"? Esta acción no se puede deshacer.`);
    }

    function moveExercise(sessionId, exId, direction) {
        const s = app.sessions.find(x => x.id === sessionId);
        if (!s || !s.exercises) return;

        const exIndex = s.exercises.findIndex(e => e.id === exId);
        if (exIndex === -1) return;

        const newIndex = direction === 'up' ? exIndex - 1 : exIndex + 1;
        if (newIndex < 0 || newIndex >= s.exercises.length) return;

        // Swap exercises
        [s.exercises[exIndex], s.exercises[newIndex]] = [s.exercises[newIndex], s.exercises[exIndex]];

        // Save changes
        save();

        // Refresh with smooth animation
        refresh({ preserveTab: true });
    }

    function updateExerciseName(sessionId, exId, newName, oldName = null) {
        const s = app.sessions.find(x => x.id === sessionId);
        if (!s) return false;
        const ex = s.exercises.find(e => e.id === exId);
        if (!ex) return false;

        // No edit mode required - always allow editing

        if (!newName || !newName.trim()) {
            toast('El nombre del ejercicio no puede estar vacío', 'warn');
            return false;
        }

        const trimmedNewName = newName.trim();
        const trimmedOldName = oldName ? oldName.trim() : ex.name.trim();

        // If name hasn't changed, do nothing
        if (trimmedNewName === trimmedOldName) {
            return true;
        }

        // Remove statistics from old name (don't migrate - old name should not count for stats)
        if (trimmedOldName !== trimmedNewName) {
            // Remove PRs for the old name (only for this specific exercise)
            // Note: We don't migrate stats - the old name should not count for statistics
            // The new name will have its stats recalculated from scratch below

            // Initialize PRs for new name if needed
            if (!app.prs[trimmedNewName]) {
                app.prs[trimmedNewName] = { maxKg: 0, maxVolume: 0, maxRepsByKg: {} };
            }

            // Initialize 1RM for new name if needed
            if (!app.onerm[trimmedNewName]) {
                app.onerm[trimmedNewName] = 0;
            }
        }

        // Update the current exercise name
        ex.name = trimmedNewName;

        // Recalculate statistics for all sets with the new name
        if (ex.sets && ex.sets.length > 0) {
            ex.sets.forEach(set => {
                if (set.kg && set.reps) {
                    checkAndRecordPRs(sessionId, exId, set.id, trimmedNewName);
                    const onerm = calculate1RM(set.kg, set.reps);
                    if (onerm) {
                        update1RM(trimmedNewName, onerm);
                    }
                }
            });
        }

        // Update exercise notes if they exist
        const noteKey = `${sessionId}_${exId}`;
        if (app.exerciseNotes && app.exerciseNotes[noteKey]) {
            // Notes are tied to session and exercise ID, not name, so no migration needed
        }

        save();
        refresh({ preserveTab: true });
        toast(`Ejercicio renombrado: "${trimmedOldName}" → "${trimmedNewName}"`, 'ok');
        return true;
    }

    function addSet(sessionId, exId) {
        const s = app.sessions.find(x => x.id === sessionId); if (!s) return;
        const ex = s.exercises.find(e => e.id === exId); if (!ex) return;

        // Sets can always be added - no edit mode required
        ex.sets.push({ id: uuid(), setNumber: ex.sets.length + 1, kg: '', reps: '', rir: '' });
        save();
        refresh({ preserveTab: true });
    }
    function deleteSet(sessionId, exId, setId) {
        const s = app.sessions.find(x => x.id === sessionId);
        if (!s) return;
        const ex = s.exercises.find(e => e.id === exId);
        if (!ex) return;

        // Check if it's the last set
        if (ex.sets.length <= 1) {
            toast('Debe haber al menos un set', 'warn');
            return;
        }

        // Sets can always be deleted - no edit mode required
        ex.sets = ex.sets.filter(t => t.id !== setId);
        ex.sets.forEach((t, i) => t.setNumber = i + 1);
        save();
        refresh({ preserveTab: true });
    }
    // Debounce timer for set updates to avoid closing keyboard on mobile
    let setUpdateTimer = null;
    let focusedInput = null;

    function updateSet(sessionId, exId, setId, field, value, skipRefresh = false) {
        const s = app.sessions.find(x => x.id === sessionId); if (!s) return;
        const ex = s.exercises.find(e => e.id === exId); if (!ex) return;
        const st = ex.sets.find(t => t.id === setId); if (!st) return;

        // Sets are always editable - no edit mode required
        st[field] = value;

        // Check for PRs and calculate 1RM after updating
        if ((field === 'kg' || field === 'reps') && st.kg && st.reps) {
            checkAndRecordPRs(sessionId, exId, setId, ex.name);
            const onerm = calculate1RM(st.kg, st.reps);
            if (onerm) {
                update1RM(ex.name, onerm);
            }
        }

        // Update goals progress if session is completed
        if (s.completed && app.goals && app.goals.length > 0) {
            app.goals.forEach(goal => updateGoalProgress(goal));
        }

        // Save automatically (sets are always saved immediately)
        save();

        // Only refresh if not skipping (to avoid closing keyboard on mobile)
        if (!skipRefresh) {
            clearTimeout(setUpdateTimer);
            setUpdateTimer = setTimeout(() => {
                refresh({ preserveTab: true });
            }, 300);
        }
    }

    /* =================== Confirm Dialog =================== */
    function showConfirmDialog(message) {
        $('#confirmMessage').textContent = message;
        $('#confirmDialog').showModal();
    }

    /* =================== Estadísticas + Chart =================== */

    // Nueva función para obtener estadísticas de un ejercicio en un período específico
    function getExerciseStatsForPeriod(exerciseName, periodType) {
        let startDate, endDate;
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        switch (periodType) {
            case 'lastWeek':
                // Semana pasada: 7 días antes de la semana actual
                const currentWeekStart = startOfWeek();
                startDate = addDays(currentWeekStart, -7);
                endDate = addDays(startDate, 6);
                break;

            case '4weeks':
                // Hace 4 semanas: de hace 28 a 21 días atrás
                endDate = addDays(today, -21);
                endDate.setHours(23, 59, 59, 999);
                startDate = addDays(today, -28);
                startDate.setHours(0, 0, 0, 0);
                break;

            case '8weeks':
                // Hace 8 semanas: de hace 56 a 49 días atrás
                endDate = addDays(today, -49);
                endDate.setHours(23, 59, 59, 999);
                startDate = addDays(today, -56);
                startDate.setHours(0, 0, 0, 0);
                break;

            case 'beginning':
            default:
                // Desde el principio: todas las sesiones anteriores a la semana actual
                const currentStart = startOfWeek();
                startDate = new Date(2000, 0, 1); // Fecha muy temprana
                endDate = addDays(currentStart, -1);
                endDate.setHours(23, 59, 59, 999);
                break;
        }

        // Filtrar sesiones en el período especificado
        const periodSessions = app.sessions.filter(s => {
            const d = parseLocalDate(s.date);
            return d >= startDate && d <= endDate;
        });

        let maxKg = 0;
        let totalReps = 0;
        let totalVol = 0;
        let rirSum = 0;
        let rirCount = 0;
        let sessionCount = 0;

        periodSessions.forEach(s => {
            const ex = (s.exercises || []).find(e => e.name === exerciseName);
            if (!ex) return;

            sessionCount++;
            (ex.sets || []).forEach(st => {
                const kg = parseFloat(st.kg) || 0;
                const reps = parseReps(st.reps);
                const rir = parseRIR(st.rir);

                maxKg = Math.max(maxKg, kg);
                if (reps > 0) {
                    totalReps += reps;
                    totalVol += kg * reps;
                }
                if (rir > 0) {
                    rirSum += rir;
                    rirCount++;
                }
            });
        });

        return {
            maxKg,
            totalReps,
            totalVol,
            avgRir: rirCount ? (rirSum / rirCount) : 0,
            sessionCount
        };
    }

    // Función para obtener estadísticas de la semana actual
    function getCurrentWeekStats(exerciseName) {
        const { ws, we } = getVisibleWeek();

        const weekSessions = app.sessions.filter(s => {
            const d = parseLocalDate(s.date);
            return d >= ws && d <= we;
        });

        let maxKg = 0;
        let totalReps = 0;
        let totalVol = 0;
        let rirSum = 0;
        let rirCount = 0;
        let sessionCount = 0;

        weekSessions.forEach(s => {
            const ex = (s.exercises || []).find(e => e.name === exerciseName);
            if (!ex) return;

            sessionCount++;
            (ex.sets || []).forEach(st => {
                const kg = parseFloat(st.kg) || 0;
                const reps = parseReps(st.reps);
                const rir = parseRIR(st.rir);

                maxKg = Math.max(maxKg, kg);
                if (reps > 0) {
                    totalReps += reps;
                    totalVol += kg * reps;
                }
                if (rir > 0) {
                    rirSum += rir;
                    rirCount++;
                }
            });
        });

        return {
            maxKg,
            totalReps,
            totalVol,
            avgRir: rirCount ? (rirSum / rirCount) : 0,
            sessionCount
        };
    }

    // Función buildStats modificada - usa los mismos filtros compartidos que drawChart
    function buildStats() {
        const body = $('#statsBody');
        const sharedMetric = $('#sharedMetric');
        const sharedExercise = $('#sharedExercise');
        const sharedPeriod = $('#sharedPeriod');

        if (!body) return;

        if (app.sessions.length === 0) {
            body.innerHTML = '<tr><td colspan="7" style="padding:16px">No hay datos suficientes</td></tr>';
            return;
        }

        // Use shared filters (same as chart)
        const metric = sharedMetric ? sharedMetric.value : (app.chartState.metric || 'volume');
        // For input field, check value or use 'all' if empty
        let exerciseFilter = 'all';
        if (sharedExercise) {
            const exerciseValue = sharedExercise.value.trim();
            exerciseFilter = exerciseValue === '' ? 'all' : exerciseValue;
        } else {
            exerciseFilter = app.chartState.exercise || 'all';
        }
        const period = sharedPeriod ? parseInt(sharedPeriod.value) : (app.chartState.period || 8);

        // Get exercises to show (filtered by exerciseFilter)
        const allExercises = new Set();
        app.sessions.forEach(s => {
            (s.exercises || []).forEach(e => {
                if (exerciseFilter === 'all' || e.name === exerciseFilter) {
                    allExercises.add(e.name);
                }
            });
        });

        // Calculate current period stats (same logic as weeklyData)
        const base = startOfWeek();
        const currentPeriodSessions = [];
        for (let i = period - 1; i >= 0; i--) {
            const ws = addDays(base, -i * 7), we = addDays(ws, 6);
            const subset = app.sessions.filter(s => {
                const d = parseLocalDate(s.date);
                return d >= ws && d <= we;
            });
            currentPeriodSessions.push(...subset);
        }

        // Calculate comparison period stats (previous period of same length)
        const comparisonPeriodSessions = [];
        for (let i = period * 2 - 1; i >= period; i--) {
            const ws = addDays(base, -i * 7), we = addDays(ws, 6);
            const subset = app.sessions.filter(s => {
                const d = parseLocalDate(s.date);
                return d >= ws && d <= we;
            });
            comparisonPeriodSessions.push(...subset);
        }

        const rows = [...allExercises].map(exerciseName => {
            // Calculate stats for current period
            let currentValue = 0;
            let currentStats = { maxKg: 0, totalReps: 0, totalVol: 0, rirSum: 0, rirCount: 0, sessionCount: 0 };

            currentPeriodSessions.forEach(s => {
                const ex = (s.exercises || []).find(e => e.name === exerciseName);
                if (!ex) return;
                currentStats.sessionCount++;
                (ex.sets || []).forEach(st => {
                    const kg = parseFloat(st.kg) || 0;
                    const reps = parseReps(st.reps);
                    const rir = parseRIR(st.rir);
                    currentStats.maxKg = Math.max(currentStats.maxKg, kg);
                    if (reps > 0) {
                        currentStats.totalReps += reps;
                        currentStats.totalVol += kg * reps;
                    }
                    if (rir > 0) {
                        currentStats.rirSum += rir;
                        currentStats.rirCount++;
                    }
                });
            });

            const currentAvgRir = currentStats.rirCount > 0 ? currentStats.rirSum / currentStats.rirCount : 0;

            // Calculate stats for comparison period
            let comparisonValue = 0;
            let comparisonStats = { maxKg: 0, totalReps: 0, totalVol: 0, rirSum: 0, rirCount: 0, sessionCount: 0 };

            comparisonPeriodSessions.forEach(s => {
                const ex = (s.exercises || []).find(e => e.name === exerciseName);
                if (!ex) return;
                comparisonStats.sessionCount++;
                (ex.sets || []).forEach(st => {
                    const kg = parseFloat(st.kg) || 0;
                    const reps = parseReps(st.reps);
                    const rir = parseRIR(st.rir);
                    comparisonStats.maxKg = Math.max(comparisonStats.maxKg, kg);
                    if (reps > 0) {
                        comparisonStats.totalReps += reps;
                        comparisonStats.totalVol += kg * reps;
                    }
                    if (rir > 0) {
                        comparisonStats.rirSum += rir;
                        comparisonStats.rirCount++;
                    }
                });
            });

            const comparisonAvgRir = comparisonStats.rirCount > 0 ? comparisonStats.rirSum / comparisonStats.rirCount : 0;

            // Calculate metric value based on selected metric
            if (metric === 'volume') {
                currentValue = currentStats.totalVol;
                comparisonValue = comparisonStats.totalVol;
            } else if (metric === 'weight') {
                currentValue = currentStats.maxKg;
                comparisonValue = comparisonStats.maxKg;
            } else if (metric === 'rir') {
                currentValue = currentAvgRir;
                comparisonValue = comparisonAvgRir;
            }

            // Calculate progress - compare current period with previous period of same length
            let progressText = 'Sin datos';
            let progressClass = 'progress--same';
            let baseValue = comparisonValue;

            // Check if comparison period has sufficient data
            // Group comparison period sessions by week to verify we have enough weeks
            const comparisonWeeks = new Set();
            comparisonPeriodSessions.forEach(s => {
                const d = parseLocalDate(s.date);
                const weekStart = startOfWeek(d);
                const weekKey = weekStart.toISOString().split('T')[0];
                comparisonWeeks.add(weekKey);
            });

            // Check if comparison period has sessions for this exercise
            const hasComparisonData = comparisonPeriodSessions.some(s => {
                const ex = (s.exercises || []).find(e => e.name === exerciseName);
                return ex && ex.sets && ex.sets.length > 0;
            });

            // Check if comparison period has enough weeks (should match current period length)
            const hasEnoughWeeks = comparisonWeeks.size >= period;

            // If no comparison period data for this exercise OR not enough weeks, compare with first week of data
            // But only if we have at least 2 weeks of data to compare
            if ((comparisonValue === 0 || !hasComparisonData || !hasEnoughWeeks) && currentValue > 0) {
                // Find first week with this exercise
                const allSessionsWithExercise = [...app.sessions]
                    .filter(s => {
                        const ex = (s.exercises || []).find(e => e.name === exerciseName);
                        return ex && ex.sets && ex.sets.length > 0;
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                if (allSessionsWithExercise.length > 0) {
                    // Group sessions by week
                    const sessionsByWeek = new Map();
                    allSessionsWithExercise.forEach(s => {
                        const d = parseLocalDate(s.date);
                        const weekStart = startOfWeek(d);
                        const weekKey = weekStart.toISOString().split('T')[0];

                        if (!sessionsByWeek.has(weekKey)) {
                            sessionsByWeek.set(weekKey, []);
                        }
                        sessionsByWeek.get(weekKey).push(s);
                    });

                    // Get first week
                    const firstWeekKey = Array.from(sessionsByWeek.keys()).sort()[0];
                    const firstWeekSessions = sessionsByWeek.get(firstWeekKey);

                    // Calculate stats for first week
                    const firstWeekStats = { maxKg: 0, totalReps: 0, totalVol: 0, rirSum: 0, rirCount: 0 };
                    firstWeekSessions.forEach(s => {
                        const ex = s.exercises.find(e => e.name === exerciseName);
                        if (ex) {
                            ex.sets.forEach(st => {
                                const kg = parseFloat(st.kg) || 0;
                                const reps = parseReps(st.reps);
                                const rir = parseRIR(st.rir);
                                firstWeekStats.maxKg = Math.max(firstWeekStats.maxKg, kg);
                                if (reps > 0) {
                                    firstWeekStats.totalReps += reps;
                                    firstWeekStats.totalVol += kg * reps;
                                }
                                if (rir > 0) {
                                    firstWeekStats.rirSum += rir;
                                    firstWeekStats.rirCount++;
                                }
                            });
                        }
                    });

                    const firstWeekAvgRir = firstWeekStats.rirCount > 0 ? firstWeekStats.rirSum / firstWeekStats.rirCount : 0;

                    // Get first week value based on metric
                    // When no comparison period exists, compare last week of current period with first week
                    // This gives a meaningful progress percentage (week-to-week comparison)
                    const lastWeekSessions = [];
                    const lastWeekStart = addDays(base, -(period - 1) * 7);
                    const lastWeekEnd = addDays(lastWeekStart, 6);
                    currentPeriodSessions.forEach(s => {
                        const d = parseLocalDate(s.date);
                        if (d >= lastWeekStart && d <= lastWeekEnd) {
                            lastWeekSessions.push(s);
                        }
                    });

                    // Calculate last week stats
                    const lastWeekStats = { maxKg: 0, totalVol: 0, rirSum: 0, rirCount: 0 };
                    lastWeekSessions.forEach(s => {
                        const ex = (s.exercises || []).find(e => e.name === exerciseName);
                        if (ex) {
                            ex.sets.forEach(st => {
                                const kg = parseFloat(st.kg) || 0;
                                const reps = parseReps(st.reps);
                                const rir = parseRIR(st.rir);
                                lastWeekStats.maxKg = Math.max(lastWeekStats.maxKg, kg);
                                if (reps > 0) {
                                    lastWeekStats.totalVol += kg * reps;
                                }
                                if (rir > 0) {
                                    lastWeekStats.rirSum += rir;
                                    lastWeekStats.rirCount++;
                                }
                            });
                        }
                    });
                    const lastWeekAvgRir = lastWeekStats.rirCount > 0 ? lastWeekStats.rirSum / lastWeekStats.rirCount : 0;

                    // Compare last week with first week (week-to-week comparison)
                    // Always use week-to-week comparison when no comparison period exists
                    // Check if we have multiple weeks of data
                    const weeksWithData = Array.from(sessionsByWeek.keys()).sort();
                    const hasMultipleWeeks = weeksWithData.length > 1;

                    if (metric === 'volume') {
                        // Use last week volume, or if no data in last week, use the most recent week with data
                        if (lastWeekStats.totalVol > 0) {
                            currentValue = lastWeekStats.totalVol;
                        } else {
                            // Find most recent week with data
                            const weeksWithDataReversed = weeksWithData.slice().reverse();
                            for (const weekKey of weeksWithDataReversed) {
                                const weekSessions = sessionsByWeek.get(weekKey);
                                let weekVol = 0;
                                weekSessions.forEach(s => {
                                    const ex = s.exercises.find(e => e.name === exerciseName);
                                    if (ex) {
                                        ex.sets.forEach(st => {
                                            const kg = parseFloat(st.kg) || 0;
                                            const reps = parseReps(st.reps);
                                            if (reps > 0) {
                                                weekVol += kg * reps;
                                            }
                                        });
                                    }
                                });
                                if (weekVol > 0) {
                                    currentValue = weekVol;
                                    break;
                                }
                            }
                        }
                        // Only compare if we have multiple weeks, otherwise use current period total
                        // Only compare if we have multiple weeks, otherwise don't set baseValue (will show "Primer registro")
                        if (hasMultipleWeeks && firstWeekStats.totalVol > 0) {
                            baseValue = firstWeekStats.totalVol;
                        } else {
                            // If all data is in one week, don't set baseValue to show "Primer registro"
                            baseValue = 0;
                            currentValue = currentStats.totalVol;
                        }
                    } else if (metric === 'weight') {
                        if (lastWeekStats.maxKg > 0) {
                            currentValue = lastWeekStats.maxKg;
                        } else {
                            // Find most recent week with data
                            const weeksWithDataReversed = weeksWithData.slice().reverse();
                            for (const weekKey of weeksWithDataReversed) {
                                const weekSessions = sessionsByWeek.get(weekKey);
                                let weekMaxKg = 0;
                                weekSessions.forEach(s => {
                                    const ex = s.exercises.find(e => e.name === exerciseName);
                                    if (ex) {
                                        ex.sets.forEach(st => {
                                            const kg = parseFloat(st.kg) || 0;
                                            weekMaxKg = Math.max(weekMaxKg, kg);
                                        });
                                    }
                                });
                                if (weekMaxKg > 0) {
                                    currentValue = weekMaxKg;
                                    break;
                                }
                            }
                        }
                        // Only compare if we have multiple weeks, otherwise don't set baseValue (will show "Primer registro")
                        if (hasMultipleWeeks && firstWeekStats.maxKg > 0) {
                            baseValue = firstWeekStats.maxKg;
                        } else {
                            // If all data is in one week, don't set baseValue to show "Primer registro"
                            baseValue = 0;
                            currentValue = currentStats.maxKg;
                        }
                    } else if (metric === 'rir') {
                        if (lastWeekAvgRir > 0) {
                            currentValue = lastWeekAvgRir;
                        } else {
                            // Find most recent week with data
                            const weeksWithDataReversed = weeksWithData.slice().reverse();
                            for (const weekKey of weeksWithDataReversed) {
                                const weekSessions = sessionsByWeek.get(weekKey);
                                let rirSum = 0, rirCount = 0;
                                weekSessions.forEach(s => {
                                    const ex = s.exercises.find(e => e.name === exerciseName);
                                    if (ex) {
                                        ex.sets.forEach(st => {
                                            const rir = parseRIR(st.rir);
                                            if (rir > 0) {
                                                rirSum += rir;
                                                rirCount++;
                                            }
                                        });
                                    }
                                });
                                if (rirCount > 0) {
                                    currentValue = rirSum / rirCount;
                                    break;
                                }
                            }
                        }
                        // Only compare if we have multiple weeks, otherwise don't set baseValue (will show "Primer registro")
                        if (hasMultipleWeeks && firstWeekAvgRir > 0) {
                            baseValue = firstWeekAvgRir;
                        } else {
                            // If all data is in one week, don't set baseValue to show "Primer registro"
                            baseValue = 0;
                            currentValue = currentAvgRir;
                        }
                    }
                }
            }

            if (baseValue > 0 && currentValue > 0) {
                const diff = ((currentValue - baseValue) / baseValue * 100);
                // If difference is very small (less than 0.1%), treat as same
                if (Math.abs(diff) < 0.1) {
                    // Show as "Sin cambio" (no change) in yellow
                    progressText = 'Sin cambio';
                    progressClass = 'progress--same';
                } else if (diff > 0) {
                    // Positive progress - green
                    progressText = `+${diff.toFixed(1)}%`;
                    progressClass = 'progress--up';
                } else {
                    // Negative progress - red
                    progressText = `${diff.toFixed(1)}%`;
                    progressClass = 'progress--down';
                }
            } else if (currentValue > 0 && baseValue === 0) {
                // We have current data but no comparison - show as first record
                progressText = 'Primer registro';
                progressClass = 'progress--same'; // Yellow for no comparison
            } else if (currentValue === 0) {
                // No data at all
                progressText = 'Sin datos';
                progressClass = 'progress--same';
            }

            return `
                <tr>
                    <td><strong>${exerciseName}</strong></td>
                    <td>${currentStats.sessionCount}</td>
                    <td>${currentStats.maxKg} kg</td>
                    <td>${currentStats.totalReps}</td>
                    <td>${currentStats.totalVol.toLocaleString()} kg</td>
                    <td>${currentAvgRir > 0 ? currentAvgRir.toFixed(1) : '–'}</td>
                    <td class="${progressClass}" style="font-weight: 600;">${progressText}</td>
                </tr>
            `;
        }).join('');

        body.innerHTML = rows || '<tr><td colspan="7" style="padding:16px">No hay datos suficientes</td></tr>';
    }

    function buildChartState() {
        // Shared filters (used by both chart and stats)
        const sharedMetric = $('#sharedMetric');
        const sharedExercise = $('#sharedExercise');
        const sharedPeriod = $('#sharedPeriod');

        // Initialize shared filters with current state
        if (sharedMetric) {
            sharedMetric.value = app.chartState.metric || 'volume';
            sharedMetric.onchange = () => {
                app.chartState.metric = sharedMetric.value;
                drawChart();
                buildStats();
            };
        }

        if (sharedExercise) {
            // Get all exercises
            const allExercises = new Set();
            app.sessions.forEach(s => {
                (s.exercises || []).forEach(e => allExercises.add(e.name));
            });
            const exercisesList = [...allExercises].sort();

            // Set initial value
            const currentExercise = app.chartState.exercise || 'all';
            if (currentExercise === 'all') {
                sharedExercise.value = '';
                sharedExercise.placeholder = 'Todos los ejercicios';
            } else {
                sharedExercise.value = currentExercise;
            }

            const suggestionsDiv = $('#exerciseSuggestions');
            let highlightedIndex = -1;

            // Function to filter and show suggestions
            const showSuggestions = (query) => {
                if (!suggestionsDiv) return;

                const queryLower = query.toLowerCase().trim();
                let filtered = [];

                if (queryLower === '') {
                    // Show "Todos los ejercicios" option
                    filtered = [{ name: 'all', display: 'Todos los ejercicios' }];
                } else {
                    // Filter exercises that start with the query
                    filtered = exercisesList
                        .filter(ex => ex.toLowerCase().startsWith(queryLower))
                        .map(ex => ({ name: ex, display: ex }));
                }

                if (filtered.length === 0) {
                    suggestionsDiv.style.display = 'none';
                    return;
                }

                suggestionsDiv.innerHTML = '';
                filtered.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.className = `exercise-suggestion-item ${item.name === 'all' ? 'all-exercises' : ''}`;
                    div.textContent = item.display;
                    div.dataset.exercise = item.name;
                    div.addEventListener('click', () => {
                        selectExercise(item.name);
                    });
                    suggestionsDiv.appendChild(div);
                });

                suggestionsDiv.style.display = 'block';
                highlightedIndex = -1;
            };

            // Function to select an exercise
            const selectExercise = (exerciseName) => {
                if (exerciseName === 'all') {
                    sharedExercise.value = '';
                    sharedExercise.placeholder = 'Todos los ejercicios';
                    app.chartState.exercise = 'all';
                } else {
                    sharedExercise.value = exerciseName;
                    app.chartState.exercise = exerciseName;
                }
                suggestionsDiv.style.display = 'none';
                drawChart();
                buildStats();
            };

            // Input event listener
            sharedExercise.addEventListener('input', (e) => {
                const query = e.target.value;
                showSuggestions(query);
            });

            // Focus event listener
            sharedExercise.addEventListener('focus', () => {
                if (sharedExercise.value.trim() === '') {
                    showSuggestions('');
                } else {
                    showSuggestions(sharedExercise.value);
                }
            });

            // Keyboard navigation
            sharedExercise.addEventListener('keydown', (e) => {
                const items = suggestionsDiv.querySelectorAll('.exercise-suggestion-item');
                if (items.length === 0) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
                    items.forEach((item, idx) => {
                        item.classList.toggle('highlighted', idx === highlightedIndex);
                    });
                    items[highlightedIndex].scrollIntoView({ block: 'nearest' });
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    highlightedIndex = Math.max(highlightedIndex - 1, -1);
                    items.forEach((item, idx) => {
                        item.classList.toggle('highlighted', idx === highlightedIndex);
                    });
                    if (highlightedIndex >= 0) {
                        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (highlightedIndex >= 0 && items[highlightedIndex]) {
                        const exerciseName = items[highlightedIndex].dataset.exercise;
                        selectExercise(exerciseName);
                    } else if (items.length > 0) {
                        // Select first item if nothing is highlighted
                        const exerciseName = items[0].dataset.exercise;
                        selectExercise(exerciseName);
                    }
                } else if (e.key === 'Escape') {
                    suggestionsDiv.style.display = 'none';
                    sharedExercise.blur();
                }
            });

            // Close suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!sharedExercise.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                    suggestionsDiv.style.display = 'none';
                }
            });
        }

        if (sharedPeriod) {
            sharedPeriod.value = String(app.chartState.period || 8);
            sharedPeriod.onchange = () => {
                app.chartState.period = +sharedPeriod.value;
                drawChart();
                buildStats();
            };
        }

        const chartTypeSelect = $('#chartType');
        if (chartTypeSelect) {
            chartTypeSelect.onchange = () => {
                drawChart();
            };
        }

        window.addEventListener('resize', () => { resizeCanvas(); drawChart(); }, { passive: true });
        resizeCanvas();
    }

    function resizeCanvas() {
        const canvas = $('#progressChart'); if (!canvas) return;
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor((window.innerWidth < 420 ? 230 : 250) * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function weeklyData(period = 4, filter = 'all', metric = 'volume') {
        const weeks = [], values = [];
        const base = startOfWeek();

        for (let i = period - 1; i >= 0; i--) {
            const ws = addDays(base, -i * 7), we = addDays(ws, 6);
            const subset = app.sessions.filter(s => {
                const d = new Date(s.date);
                return d >= ws && d <= we;
            });

            let value = 0;
            if (metric === 'volume') {
                subset.forEach(s => (s.exercises || []).forEach(e => {
                    if (filter === 'all' || e.name === filter) {
                        (e.sets || []).forEach(st => value += (parseFloat(st.kg) || 0) * parseReps(st.reps));
                    }
                }));
            } else if (metric === 'rir') {
                let rirSum = 0, rirCount = 0;
                subset.forEach(s => (s.exercises || []).forEach(e => {
                    if (filter === 'all' || e.name === filter) {
                        (e.sets || []).forEach(st => {
                            const rir = parseRIR(st.rir);
                            if (rir > 0) {
                                rirSum += rir;
                                rirCount++;
                            }
                        });
                    }
                }));
                value = rirCount ? (rirSum / rirCount) : 0;
            } else if (metric === 'weight') {
                subset.forEach(s => (s.exercises || []).forEach(e => {
                    if (filter === 'all' || e.name === filter) {
                        (e.sets || []).forEach(st => {
                            const kg = parseFloat(st.kg) || 0;
                            if (kg > 0) value = Math.max(value, kg);
                        });
                    }
                }));
            }

            weeks.push(`Sem ${period - i}`);
            values.push(value);
        }
        return { weeks, values };
    }

    function drawChart() {
        const canvas = $('#progressChart'); if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;

        // Ensure canvas dimensions match display size for sharpness
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const rect = canvas.getBoundingClientRect();

        // Only resize if dimensions changed to avoid flickering
        if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            ctx.scale(dpr, dpr);
        } else {
            // Reset transform if not resizing, but ensure scale is correct
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        // Clear with correct dimensions
        ctx.clearRect(0, 0, rect.width, rect.height);

        const chartTypeSelect = $('#chartType');
        const chartType = chartTypeSelect ? chartTypeSelect.value : 'bar';

        // Get theme colors
        const style = getComputedStyle(document.documentElement);
        const barColor = style.getPropertyValue('--primary').trim() || '#3b82f6';
        const lineColor = style.getPropertyValue('--accent').trim() || '#10b981';
        const gridColor = document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
        const textColor = style.getPropertyValue('--text').trim() || '#94a3b8';

        const padding = { l: 50, r: 20, t: 30, b: 40 };
        const w = rect.width;
        const h = rect.height;

        // Use shared filters
        const sharedMetric = $('#sharedMetric');
        const sharedExercise = $('#sharedExercise');
        const sharedPeriod = $('#sharedPeriod');

        const period = sharedPeriod ? parseInt(sharedPeriod.value) : (app.chartState.period || 8);

        let filter = 'all';
        if (sharedExercise) {
            const exerciseValue = sharedExercise.value.trim();
            filter = exerciseValue === '' ? 'all' : exerciseValue;
        } else {
            filter = app.chartState.exercise || 'all';
        }

        const metric = sharedMetric ? sharedMetric.value : (app.chartState.metric || 'volume');
        const { weeks, values } = weeklyData(period, filter, metric);

        if (chartType === 'pie') {
            drawPieChart(ctx, canvas, weeks, values, metric, barColor, textColor, gridColor);
        } else {
            drawBarChart(ctx, canvas, weeks, values, metric, barColor, lineColor, gridColor, textColor, padding, w, h);
        }
    }

    function drawBarChart(ctx, canvas, weeks, values, metric, barColor, lineColor, gridColor, textColor, padding, w, h) {
        const vmax = Math.max(1, ...values) * 1.1; // Add 10% headroom
        const cw = w - padding.l - padding.r;
        const ch = h - padding.t - padding.b;
        const barW = Math.min(40, (cw / weeks.length) * 0.6); // Cap bar width
        const step = cw / weeks.length;
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';

        // Background grid lines
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        const ticks = 5;

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.font = '11px Inter, system-ui, sans-serif';

        for (let i = 0; i <= ticks; i++) {
            const val = vmax * (i / ticks);
            const y = padding.t + ch - (val / vmax) * ch;

            // Grid line
            ctx.beginPath();
            ctx.moveTo(padding.l, y);
            ctx.lineTo(padding.l + cw, y);
            ctx.stroke();

            // Y-axis label
            let label = val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val).toLocaleString();
            if (metric === 'rir') label = val.toFixed(1);
            ctx.fillText(label, padding.l - 10, y);
        }

        // Bars
        for (let i = 0; i < weeks.length; i++) {
            const x = padding.l + i * step + (step - barW) / 2;
            const val = values[i];
            const barH = (val / vmax) * ch;
            const y = padding.t + ch - barH;

            if (barH > 0) {
                // Gradient fill
                const gradient = ctx.createLinearGradient(x, y, x, y + barH);
                gradient.addColorStop(0, barColor);
                gradient.addColorStop(1, adjustColorOpacity(barColor, 0.6));

                ctx.fillStyle = gradient;

                // Rounded top corners
                const radius = Math.min(6, barW / 2);
                ctx.beginPath();
                ctx.moveTo(x, y + barH);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.lineTo(x + barW - radius, y);
                ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
                ctx.lineTo(x + barW, y + barH);
                ctx.closePath();
                ctx.fill();

                // Value label on hover or always if space permits (simplified to always for now)
                if (weeks.length <= 8) {
                    ctx.fillStyle = textColor;
                    ctx.textAlign = 'center';
                    ctx.font = 'bold 10px Inter, system-ui, sans-serif';
                    let valLabel = val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val).toLocaleString();
                    if (metric === 'rir') valLabel = val.toFixed(1);
                    ctx.fillText(valLabel, x + barW / 2, y - 8);
                }
            }

            // X-axis label
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.font = '10px Inter, system-ui, sans-serif';
            // Simplify week label if too many
            let weekLabel = weeks[i].replace('Sem ', 'S');
            if (weeks.length > 12 && i % 2 !== 0) weekLabel = ''; // Skip every other label if crowded
            ctx.fillText(weekLabel, x + barW / 2, padding.t + ch + 15);
        }
    }

    function adjustColorOpacity(color, opacity) {
        // Simple hex to rgba converter
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
    }

    function drawPieChart(ctx, canvas, weeks, values, metric, barColor, textColor, gridColor) {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';

        const centerX = w * 0.35; // Shift left to make room for legend
        const centerY = h / 2;
        const radius = Math.min(w, h) * 0.35;
        const total = values.reduce((sum, val) => sum + val, 0);

        if (total === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '14px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos disponibles', w / 2, centerY);
            return;
        }

        let currentAngle = -Math.PI / 2;

        // Premium palette - fixed colors for consistent mapping
        const colors = [
            barColor,
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#8b5cf6', // Violet
            '#ec4899', // Pink
            '#06b6d4', // Cyan
            '#ef4444', // Red
            '#6366f1', // Indigo
            '#84cc16', // Lime
            '#14b8a6'  // Teal
        ];

        // Create filtered arrays with indices to maintain color consistency
        const dataWithIndices = values.map((val, i) => ({
            value: val,
            weekIndex: i,
            week: weeks[i]
        })).filter(item => item.value > 0);

        // Draw slices
        dataWithIndices.forEach((item, sliceIndex) => {
            const val = item.value;
            const weekIndex = item.weekIndex;
            const sliceAngle = (val / total) * 2 * Math.PI;
            // Use weekIndex to maintain consistent color mapping
            const color = colors[weekIndex % colors.length];

            // Add gap
            const gap = 0.02;
            const start = currentAngle + gap;
            const end = currentAngle + sliceAngle - gap;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, start, end);
            ctx.closePath();

            // Gradient for depth
            const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.4, centerX, centerY, radius);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, adjustColorOpacity(color, 0.8));

            ctx.fillStyle = gradient;
            ctx.fill();

            // Border
            ctx.strokeStyle = isLight ? '#ffffff' : '#1e1e1e';
            ctx.lineWidth = 2;
            ctx.stroke();

            currentAngle += sliceAngle;
        });

        // Draw Legend
        const legendX = w * 0.65;
        const legendY = 40;
        const lineHeight = 20;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '11px Inter, system-ui, sans-serif';

        dataWithIndices.forEach((item, legendIndex) => {
            const val = item.value;
            const weekIndex = item.weekIndex;
            const label = item.week;

            const y = legendY + legendIndex * lineHeight;
            // Don't draw if out of bounds
            if (y > h - 20) return;

            // Use the same weekIndex to get the same color as the slice
            const color = colors[weekIndex % colors.length];
            const percentage = ((val / total) * 100).toFixed(1) + '%';

            // Color dot
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(legendX, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Text
            ctx.fillStyle = textColor;
            let valText = val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val).toLocaleString();
            if (metric === 'rir') valText = val.toFixed(1);

            ctx.fillText(`${label}: ${valText} (${percentage})`, legendX + 12, y);
        });

        // Draw total in center (Donut style)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#ffffff' : '#1e1e1e'; // Match background
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.fillText('Total', centerX, centerY - 8);

        let totalText = total >= 1000 ? (total / 1000).toFixed(1) + 'k' : Math.round(total).toLocaleString();
        if (metric === 'rir') totalText = (total / values.filter(v => v > 0).length).toFixed(1); // Avg for RIR

        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillText(totalText, centerX, centerY + 8);
    }

    /* =================== Import/Export =================== */
    function safeAlert(msg) {
        const box = $('#importAlert');
        box.textContent = msg;
        box.classList.remove('hidden');
    }

    function clearAlert() {
        const box = $('#importAlert');
        box.textContent = '';
        box.classList.add('hidden');

        const errorList = $('#importErrorList');
        errorList.innerHTML = '';
        errorList.classList.add('hidden');
    }

    function handleFile(e) {
        clearAlert();
        app.importBuffer = null;
        $('#preview').classList.add('hidden');
        $('#previewList').innerHTML = '';

        const fileList = e.target.files;
        const file = fileList && fileList[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (!Array.isArray(data)) throw new Error('Formato inválido: se esperaba un array');

                // Validación más estricta
                const errors = [];
                data.forEach((s, i) => {
                    if (!s.name) errors.push(`Sesión ${i + 1}: falta el nombre`);
                    if (!s.date) errors.push(`Sesión ${i + 1}: falta la fecha`);
                    if (!s.exercises || !Array.isArray(s.exercises)) errors.push(`Sesión ${i + 1}: falta el array de ejercicios`);

                    if (s.exercises && Array.isArray(s.exercises)) {
                        s.exercises.forEach((e, j) => {
                            if (!e.name) errors.push(`Sesión ${i + 1}, ejercicio ${j + 1}: falta el nombre`);
                            if (!e.sets || !Array.isArray(e.sets)) errors.push(`Sesión ${i + 1}, ejercicio ${j + 1}: falta el array de sets`);

                            if (e.sets && Array.isArray(e.sets)) {
                                e.sets.forEach((set, k) => {
                                    if (!set.setNumber) errors.push(`Sesión ${i + 1}, ejercicio ${j + 1}, set ${k + 1}: falta el número de set`);
                                });
                            }
                        });
                    }
                });

                if (errors.length > 0) {
                    const errorList = $('#importErrorList');
                    errorList.innerHTML = '<strong>Errores de validación:</strong>';
                    errors.forEach(error => {
                        const item = document.createElement('div');
                        item.className = 'import-error-item';
                        item.textContent = error;
                        errorList.appendChild(item);
                    });
                    errorList.classList.remove('hidden');
                    return;
                }

                app.importBuffer = data;
                const list = $('#previewList');
                data.slice(0, 10).forEach(s => {
                    const li = document.createElement('li');
                    li.textContent = s.name;
                    list.appendChild(li);
                });
                if (data.length > 10) {
                    const li = document.createElement('li');
                    li.textContent = `… y ${data.length - 10} más`;
                    list.appendChild(li);
                }
                $('#preview').classList.remove('hidden');
            } catch (err) {
                safeAlert('El archivo no es válido. Por favor, revisa el formato.');
                console.error(err);
            }
        };
        reader.onerror = () => safeAlert('No se pudo leer el archivo.');
        reader.readAsText(file);
    }

    function normalizeSessionFromImport(src, dateISO) {
        return {
            id: uuid(),
            name: String(src.name || 'Sesión'),
            date: dateISO,
            completed: !!src.completed,
            exercises: (src.exercises || []).map(e => ({
                id: uuid(),
                name: String(e.name || 'Ejercicio'),
                sets: (e.sets || [{ setNumber: 1, kg: '', reps: '', rir: '' }]).map((st, i) => ({
                    id: uuid(),
                    setNumber: st.setNumber || (i + 1),
                    kg: String(st.kg || ''),
                    reps: String(st.reps || ''),
                    rir: String(st.rir || '')
                }))
            }))
        };
    }

    async function applyImport() {
        if (!app.importBuffer) {
            safeAlert('No hay datos que importar.');
            return;
        }

        clearAlert();

        const offset = +$('#targetWeek').value;

        // Calcula el lunes exacto de la semana objetivo (forzando 00:00 hora local)
        const monday = startOfWeek(addDays(new Date(), offset * 7));
        monday.setHours(0, 0, 0, 0);

        // Get existing session dates to avoid duplicates
        const existingDates = new Set(
            app.sessions.map(s => toLocalISO(parseLocalDate(s.date)))
        );

        // Map sessions: use real dates from JSON if available, otherwise use sequential dates
        const mapped = app.importBuffer.map((s, idx) => {
            let dateISO;

            // Try to use the date from the JSON if it exists and is valid
            if (s.date && typeof s.date === 'string') {
                try {
                    const parsedDate = parseLocalDate(s.date);
                    // Check if date is valid
                    if (!isNaN(parsedDate.getTime())) {
                        dateISO = toLocalISO(parsedDate);
                    } else {
                        // Invalid date, use sequential fallback
                        const sessionDate = new Date(monday);
                        sessionDate.setDate(monday.getDate() + idx);
                        sessionDate.setHours(12, 0, 0, 0);
                        dateISO = toLocalISO(sessionDate);
                    }
                } catch (e) {
                    // Error parsing date, use sequential fallback
                    const sessionDate = new Date(monday);
                    sessionDate.setDate(monday.getDate() + idx);
                    sessionDate.setHours(12, 0, 0, 0);
                    dateISO = toLocalISO(sessionDate);
                }
            } else {
                // No date in JSON, use sequential fallback
                const sessionDate = new Date(monday);
                sessionDate.setDate(monday.getDate() + idx);
                sessionDate.setHours(12, 0, 0, 0);
                dateISO = toLocalISO(sessionDate);
            }

            return normalizeSessionFromImport(s, dateISO);
        });

        // Filter out sessions that would duplicate existing dates (optional: you can remove this if you want to allow duplicates)
        // Normalize dates to YYYY-MM-DD format for comparison
        const newSessions = mapped.filter(s => {
            const sessionDate = toLocalISO(parseLocalDate(s.date));
            return !existingDates.has(sessionDate);
        });

        // Show warning if some sessions were skipped due to duplicate dates
        if (mapped.length > newSessions.length) {
            const skipped = mapped.length - newSessions.length;
            toast(`Se importaron ${newSessions.length} sesiones. ${skipped} sesión(es) se omitieron porque ya existen en esas fechas.`, 'warning');
        }

        // Inserta las sesiones
        app.sessions = [...app.sessions, ...newSessions];

        // Wait for save to complete before continuing
        try {
            await save();

            // Also save to sessions table
            if (typeof supabaseService !== 'undefined' && newSessions.length > 0) {
                const isAvailable = await supabaseService.isAvailable();
                if (isAvailable) {
                    // Save all imported sessions to sessions table in parallel
                    const savePromises = newSessions.map(session =>
                        supabaseService.saveSession(session).catch(error => {
                            console.warn(`Error guardando sesión ${session.id} en tabla sessions:`, error);
                            return null; // Continue even if one fails
                        })
                    );
                    await Promise.all(savePromises);
                }
            }

            // Always refresh to update UI (renderSessions will check if we're viewing the imported week)
            refresh();

            // Limpieza
            app.importBuffer = null;
            $('#fileInput').value = '';
            $('#preview').classList.add('hidden');
            $('#importAlert').classList.add('hidden');

            // Mensaje visual
            if (newSessions.length > 0) {
                toast('Entrenamiento importado correctamente ✔️', 'ok');
            }
        } catch (error) {
            console.error('Error al guardar sesiones importadas:', error);
            // Revert the sessions if save failed
            app.sessions = app.sessions.filter(s => !newSessions.some(ns => ns.id === s.id));
            toast('Error al guardar las sesiones importadas. Intenta de nuevo.', 'err');
        }
    }

    function exportSessions() {
        const blob = new Blob([JSON.stringify(app.sessions, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `training_diary_${toLocalISO(new Date())}.json`; a.click();
        URL.revokeObjectURL(url);
    }

    function exportRoutines() {
        if (!app.routines || app.routines.length === 0) {
            toast('No hay rutinas para exportar', 'warn');
            return;
        }
        const blob = new Blob([JSON.stringify(app.routines, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `routines_${toLocalISO(new Date())}.json`; a.click();
        URL.revokeObjectURL(url);
        toast('Rutinas exportadas correctamente', 'ok');
    }

    function clearRoutineAlert() {
        const alert = $('#routineImportAlert');
        if (alert) {
            alert.classList.add('hidden');
            alert.textContent = '';
        }
        const errorList = $('#routineImportErrorList');
        if (errorList) {
            errorList.classList.add('hidden');
            errorList.innerHTML = '';
        }
    }

    function safeRoutineAlert(msg) {
        const alert = $('#routineImportAlert');
        if (alert) {
            alert.textContent = msg;
            alert.classList.remove('hidden');
        }
    }

    function handleRoutineFile(e) {
        clearRoutineAlert();
        app.routineImportBuffer = null;
        const preview = $('#routinePreview');
        if (preview) preview.classList.add('hidden');
        const previewList = $('#routinePreviewList');
        if (previewList) previewList.innerHTML = '';

        const fileList = e.target.files;
        const file = fileList && fileList[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (!Array.isArray(data)) throw new Error('Formato inválido: se esperaba un array');

                // Validación de rutinas
                const errors = [];
                data.forEach((r, i) => {
                    if (!r.name) errors.push(`Rutina ${i + 1}: falta el nombre`);
                    if (!r.days || !Array.isArray(r.days)) errors.push(`Rutina ${i + 1}: falta el array de días`);

                    if (r.days && Array.isArray(r.days)) {
                        r.days.forEach((day, j) => {
                            if (!day.exercises || !Array.isArray(day.exercises)) {
                                errors.push(`Rutina ${i + 1}, día ${j + 1}: falta el array de ejercicios`);
                            }

                            if (day.exercises && Array.isArray(day.exercises)) {
                                day.exercises.forEach((ex, k) => {
                                    if (!ex.name) errors.push(`Rutina ${i + 1}, día ${j + 1}, ejercicio ${k + 1}: falta el nombre`);
                                    if (!ex.sets || !Array.isArray(ex.sets)) {
                                        errors.push(`Rutina ${i + 1}, día ${j + 1}, ejercicio ${k + 1}: falta el array de sets`);
                                    }
                                });
                            }
                        });
                    }
                });

                if (errors.length > 0) {
                    const errorList = $('#routineImportErrorList');
                    if (errorList) {
                        errorList.innerHTML = '<strong>Errores de validación:</strong>';
                        errors.forEach(error => {
                            const item = document.createElement('div');
                            item.className = 'import-error-item';
                            item.textContent = error;
                            errorList.appendChild(item);
                        });
                        errorList.classList.remove('hidden');
                    }
                    return;
                }

                app.routineImportBuffer = data;
                const list = $('#routinePreviewList');
                if (list) {
                    data.slice(0, 10).forEach(r => {
                        const li = document.createElement('li');
                        li.textContent = r.name || 'Rutina sin nombre';
                        list.appendChild(li);
                    });
                    if (data.length > 10) {
                        const li = document.createElement('li');
                        li.textContent = `… y ${data.length - 10} más`;
                        list.appendChild(li);
                    }
                }
                if (preview) preview.classList.remove('hidden');
            } catch (err) {
                safeRoutineAlert('El archivo no es válido. Por favor, revisa el formato.');
                console.error(err);
            }
        };
        reader.onerror = () => safeRoutineAlert('No se pudo leer el archivo.');
        reader.readAsText(file);
    }

    async function applyRoutineImport() {
        if (!app.routineImportBuffer) {
            safeRoutineAlert('No hay datos que importar.');
            return;
        }

        clearRoutineAlert();

        // Normalizar y agregar las rutinas
        const importedRoutines = app.routineImportBuffer.map(r => ({
            id: uuid(),
            createdAt: new Date().toISOString(),
            name: String(r.name || 'Rutina sin nombre'),
            days: (r.days || []).map(day => ({
                id: uuid(),
                name: String(day.name || 'Día sin nombre'),
                exercises: (day.exercises || []).map(ex => ({
                    id: uuid(),
                    name: String(ex.name || 'Ejercicio'),
                    sets: (ex.sets || []).map((set, idx) => ({
                        id: uuid(),
                        kg: String(set.kg || set.planKg || ''),
                        reps: String(set.reps || set.planReps || ''),
                        rir: String(set.rir || set.planRir || ''),
                        planKg: String(set.planKg !== undefined ? set.planKg : (set.kg || '')),
                        planReps: String(set.planReps !== undefined ? set.planReps : (set.reps || '')),
                        planRir: String(set.planRir !== undefined ? set.planRir : (set.rir || ''))
                    }))
                }))
            }))
        }));

        // Agregar las rutinas importadas
        app.routines = [...app.routines, ...importedRoutines];

        // Save to both user_data and routines table
        try {
            await save();
            // Also save each routine to routines table
            if (typeof supabaseService !== 'undefined') {
                const isAvailable = await supabaseService.isAvailable();
                if (isAvailable) {
                    let savedCount = 0;
                    let failedCount = 0;
                    // Save each imported routine to routines table
                    for (const routine of importedRoutines) {
                        try {
                            await supabaseService.saveRoutine(routine);
                            savedCount++;
                        } catch (error) {
                            console.warn('Error guardando rutina en tabla routines:', error);
                            failedCount++;
                            // Continue even if routines table save fails
                        }
                    }
                    // Show feedback if some routines failed to save
                    if (failedCount > 0 && savedCount > 0) {
                        console.warn(`${savedCount} rutinas guardadas en Supabase, ${failedCount} fallaron`);
                    }
                }
            }
        } catch (error) {
            // Remove imported routines if save failed
            app.routines = app.routines.filter(r => !importedRoutines.some(ir => ir.id === r.id));
            safeRoutineAlert('Error al guardar las rutinas. Por favor, intenta de nuevo.');
            console.error('Error al importar rutinas:', error);
            throw error;
        }

        // Limpieza
        app.routineImportBuffer = null;
        const fileInput = $('#routineFileInput');
        if (fileInput) {
            fileInput.value = '';
            // Create a new input to reset the file selection (needed for mobile)
            const newInput = fileInput.cloneNode(true);
            fileInput.parentNode.replaceChild(newInput, fileInput);
            newInput.addEventListener('change', (e) => {
                handleRoutineFile(e);
                const container = $('#routineFileInputContainer');
                if (container) {
                    container.style.display = 'block';
                }
            });
        }
        const container = $('#routineFileInputContainer');
        if (container) container.style.display = 'none';
        const preview = $('#routinePreview');
        if (preview) preview.classList.add('hidden');
        const previewList = $('#routinePreviewList');
        if (previewList) previewList.innerHTML = '';

        // Refrescar la lista de rutinas
        renderImportRoutineList();
        renderRoutines();

        // Mensaje visual
        toast(`Rutinas importadas correctamente (${importedRoutines.length}) ✔️`, 'ok');
    }

    function cancelRoutineImport() {
        app.routineImportBuffer = null;
        clearRoutineAlert();
        const fileInput = $('#routineFileInput');
        if (fileInput) {
            fileInput.value = '';
            // Create a new input to reset the file selection (needed for mobile)
            const newInput = fileInput.cloneNode(true);
            fileInput.parentNode.replaceChild(newInput, fileInput);
            newInput.addEventListener('change', (e) => {
                handleRoutineFile(e);
                const container = $('#routineFileInputContainer');
                if (container) {
                    container.style.display = 'block';
                }
            });
        }
        const container = $('#routineFileInputContainer');
        if (container) container.style.display = 'none';
        const preview = $('#routinePreview');
        if (preview) preview.classList.add('hidden');
        const previewList = $('#routinePreviewList');
        if (previewList) previewList.innerHTML = '';
    }

    /* =================== Plantillas =================== */
    function openTemplatePreview(key) {
        app.tmpTemplateKey = key;
        const list = templates[key] || [];
        const cont = $('#templatePreview'); cont.innerHTML = '';
        list.forEach((s, i) => {
            const card = document.createElement('div'); card.className = 'card'; card.style.padding = '10px';
            card.innerHTML = `<strong>${i + 1}. ${s.name}</strong><br><span style="color:var(--muted)">${s.ex.slice(0, 5).join(', ')}${s.ex.length > 5 ? '…' : ''}</span>`;
            cont.appendChild(card);
        });
        $('#templateDialog').showModal();
    }

    function importTemplateIntoVisibleWeek(ev) {
        if (ev) ev.preventDefault();
        const key = app.tmpTemplateKey; if (!key) return;
        const arr = templates[key] || [];
        const { ws } = getVisibleWeek(); // SIEMPRE desde lunes de la semana visible
        const toAdd = arr.map((it, idx) => ({
            id: uuid(),
            name: it.name,
            date: toLocalISO(addDays(ws, idx)),
            completed: false,
            exercises: it.ex.map(n => ({ id: uuid(), name: n, sets: [{ id: uuid(), setNumber: 1, kg: '', reps: '', rir: '' }] }))
        }));
        app.sessions = [...app.sessions, ...toAdd];
        save(); refresh(); $('#templateDialog').close();
        toast(`Plantilla «${key}» importada en la semana visible`, 'ok');
    }

    async function importRoutineIntoWeek(routineId) {
        const routine = app.routines.find(r => r.id === routineId);
        if (!routine) {
            toast('Rutina no encontrada', 'err');
            return;
        }
        const { ws } = getVisibleWeek();
        const days = routine.days || [];
        if (!days.length) {
            toast('La rutina no tiene días definidos', 'warn');
            return;
        }
        const toAdd = days.map((day, idx) => ({
            id: uuid(),
            name: day.name || `Sesión ${idx + 1}`,
            date: toLocalISO(addDays(ws, idx)),
            completed: false,
            exercises: (day.exercises || []).map(ex => ({
                id: uuid(),
                name: ex.name,
                sets: ((ex.sets && ex.sets.length) ? ex.sets : [{ planKg: '', planReps: '', planRir: '' }]).map((set, setIdx) => ({
                    id: uuid(),
                    setNumber: setIdx + 1,
                    kg: '',
                    reps: '',
                    rir: '',
                    planKg: set.planKg !== undefined ? set.planKg : (set.kg || ''),
                    planReps: set.planReps !== undefined ? set.planReps : (set.reps || ''),
                    planRir: set.planRir !== undefined ? set.planRir : (set.rir || '')
                }))
            }))
        }));

        app.sessions = [...app.sessions, ...toAdd];

        // Save to both user_data and sessions table
        try {
            await save();
            // Also save to sessions table
            if (typeof supabaseService !== 'undefined' && toAdd.length > 0) {
                const isAvailable = await supabaseService.isAvailable();
                if (isAvailable) {
                    // Save all sessions to sessions table in parallel
                    const savePromises = toAdd.map(session =>
                        supabaseService.saveSession(session).catch(error => {
                            console.warn(`Error guardando sesión ${session.id} en tabla sessions:`, error);
                            return null; // Continue even if one fails
                        })
                    );
                    await Promise.all(savePromises);
                }
            }
        } catch (error) {
            // Remove from app.sessions if save failed
            app.sessions = app.sessions.filter(s => !toAdd.some(ta => ta.id === s.id));
            console.error('Error al importar rutina:', error);
            toast('Error al importar la rutina', 'err');
            return;
        }

        refresh();
        toast(`Rutina «${routine.name}» importada en la semana visible`, 'ok');
    }

    /* =================== Selector de semana (panel Importar) =================== */
    function initWeekSelector() {
        const sel = $('#targetWeek'); if (!sel) return;
        sel.innerHTML = '';
        const base = startOfWeek(new Date());
        for (let i = -8; i <= 8; i++) {
            const ws = addDays(base, i * 7), we = addDays(ws, 6);
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${ws.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${we.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
            if (i === app.weekOffset) opt.selected = true;
            sel.appendChild(opt);
        }
    }

    /* =================== Toast =================== */
    function toast(msg, type = 'ok') {
        const cont = $('#toasts');
        const t = document.createElement('div');
        t.className = `toast toast--${type}`;
        t.textContent = msg;
        cont.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    }

    /* =================== Eventos =================== */
    function bindEvents() {
        setupTabs();

        // Manual de Usuario
        $('#btnManual').addEventListener('click', () => {
            $('#manualDialog').showModal();
        });

        $$('[data-close-dialog]').forEach(btn => {
            btn.addEventListener('click', (ev) => {
                ev.preventDefault();
                const targetId = btn.getAttribute('data-close-dialog');
                if (targetId) {
                    const dialog = document.getElementById(targetId);
                    if (dialog) dialog.close();
                } else {
                    const dialog = btn.closest('dialog');
                    if (dialog) dialog.close();
                }
            });
        });

        // Semana
        $('#prevWeek').addEventListener('click', () => { app.weekOffset--; refresh(); });
        $('#nextWeek').addEventListener('click', () => { app.weekOffset++; refresh(); });

        // Delete week button
        $('#btnDeleteWeek').addEventListener('click', () => {
            const weekSessions = getWeekSessions();
            if (weekSessions.length === 0) {
                toast('No hay sesiones en esta semana para borrar', 'warn');
                return;
            }

            // Set delete target for week deletion
            app.deleteTarget = {
                type: 'week',
                sessionIds: weekSessions.map(s => s.id)
            };

            // Show confirmation dialog
            $('#confirmTitle').textContent = 'Confirmar eliminación';
            $('#confirmMessage').textContent = `¿Estás seguro de que quieres borrar la semana? Se eliminarán ${weekSessions.length} sesión(es). Esta acción no se puede deshacer.`;
            $('#confirmDialog').showModal();
        });

        const addRoutineDayBtn = document.getElementById('addRoutineDay');
        if (addRoutineDayBtn) {
            addRoutineDayBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                addRoutineDay();
            });
        }

        const saveRoutineBtn = document.getElementById('saveRoutine');
        if (saveRoutineBtn) {
            saveRoutineBtn.addEventListener('click', handleSaveRoutine);
        }

        const resetRoutineBtn = document.getElementById('resetRoutine');
        if (resetRoutineBtn) {
            resetRoutineBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                resetRoutineBuilder();
            });
        }

        const routineDaysContainer = document.getElementById('routineDays');
        if (routineDaysContainer) {
            routineDaysContainer.addEventListener('click', (ev) => {
                const addExerciseBtn = ev.target.closest('.js-add-routine-exercise');
                if (addExerciseBtn) {
                    ev.preventDefault();
                    const day = addExerciseBtn.closest('.routine-day');
                    addRoutineExercise(day);
                    return;
                }
                const deleteDayBtn = ev.target.closest('.js-delete-routine-day');
                if (deleteDayBtn) {
                    ev.preventDefault();
                    const day = deleteDayBtn.closest('.routine-day');
                    if (day) day.remove();
                    updateRoutineDayTitles();
                    return;
                }
                const addSetBtn = ev.target.closest('.js-add-routine-set');
                if (addSetBtn) {
                    ev.preventDefault();
                    const ex = addSetBtn.closest('.routine-exercise');
                    addRoutineSet(ex);
                    return;
                }
                const deleteExerciseBtn = ev.target.closest('.js-delete-routine-exercise');
                if (deleteExerciseBtn) {
                    ev.preventDefault();
                    const ex = deleteExerciseBtn.closest('.routine-exercise');
                    if (ex) ex.remove();
                    return;
                }
                const deleteSetBtn = ev.target.closest('.js-delete-routine-set');
                if (deleteSetBtn) {
                    ev.preventDefault();
                    const ex = deleteSetBtn.closest('.routine-exercise');
                    const setEl = deleteSetBtn.closest('.routine-set');
                    if (setEl) setEl.remove();
                    updateRoutineSetIndexes(ex);
                }
            });
        }

        const defaultRoutineList = document.getElementById('defaultRoutineList');
        if (defaultRoutineList) {
            defaultRoutineList.addEventListener('click', (ev) => {
                const btn = ev.target.closest('.js-use-template');
                if (!btn) return;
                ev.preventDefault();
                loadTemplateIntoBuilder(btn.dataset.template);
                toast('Plantilla cargada en el creador', 'ok');
            });
        }

        const createdRoutineList = document.getElementById('createdRoutineList');
        if (createdRoutineList) {
            createdRoutineList.addEventListener('click', (ev) => {
                const item = ev.target.closest('.routine-created__item');
                if (!item) return;
                const routineId = item.dataset.routineId;
                if (!routineId) return;

                if (ev.target.closest('.js-toggle-routine')) {
                    ev.preventDefault();
                    const body = item.querySelector('.routine-created__body');
                    if (!body) return;
                    body.hidden = !body.hidden;
                    const btn = ev.target.closest('.js-toggle-routine');
                    if (btn) btn.textContent = body.hidden ? 'Ver' : 'Ocultar';
                    return;
                }

                if (ev.target.closest('.js-edit-routine')) {
                    ev.preventDefault();
                    const routine = app.routines.find(r => r.id === routineId);
                    if (!routine) return;
                    loadRoutineIntoBuilder(routine);
                    app.routineEditId = routine.id;
                    toast('Rutina cargada para editar', 'ok');
                    return;
                }

                if (ev.target.closest('.js-delete-routine')) {
                    ev.preventDefault();
                    app.deleteTarget = { type: 'routine', routineId };
                    showConfirmDialog('¿Eliminar esta rutina personalizada? Esta acción no se puede deshacer.');
                }
            });
        }

        const importRoutineList = document.getElementById('importRoutineList');
        if (importRoutineList) {
            importRoutineList.addEventListener('click', (ev) => {
                const btn = ev.target.closest('.js-import-user-routine');
                if (!btn) return;
                ev.preventDefault();
                importRoutineIntoWeek(btn.dataset.routineId);
            });
        }

        // Nueva sesión: por defecto lunes de semana visible
        $('#btnNewSession').addEventListener('click', () => {
            const { ws } = getVisibleWeek();
            $('#sessionDate').value = toLocalISO(ws);
            $('#sessionName').value = '';
            $('#sessionDialog').showModal();
        });

        // Copiar entrenamiento de la semana pasada
        $('#btnCopyLastWeek').addEventListener('click', () => {
            copyLastWeekWorkout();
        });

        // Guardar sesión
        $('#saveSession').addEventListener('click', async (ev) => {
            ev.preventDefault();
            const name = $('#sessionName').value.trim();
            const date = $('#sessionDate').value;
            if (!name || !date) {
                toast('Completa el nombre y la fecha', 'warn');
                return;
            }
            try {
                await addSession({ name, date });
                $('#sessionDialog').close();
                toast('Sesión creada', 'ok');
            } catch (error) {
                console.error('Error al crear sesión:', error);
                toast('Error al crear la sesión', 'err');
            }
        });

        // Allow closing session dialog without validation
        $('#sessionDialog').addEventListener('close', () => {
            // Reset form when closing
            $('#sessionName').value = '';
        });

        // Actualizar sesión
        $('#updateSession').addEventListener('click', async (ev) => {
            ev.preventDefault();
            const id = $('#editSessionDialog').dataset.sessionId;
            const name = $('#editSessionName').value.trim();
            const date = $('#editSessionDate').value;
            if (!name || !date || !id) return;
            try {
                await updateSession(id, { name, date });
                $('#editSessionDialog').close();
                toast('Sesión actualizada', 'ok');
            } catch (error) {
                console.error('Error al actualizar sesión:', error);
                toast('Error al actualizar la sesión', 'err');
            }
        });

        // Confirmar eliminación
        $('#confirmDelete').addEventListener('click', async (ev) => {
            ev.preventDefault();
            const { type, id, sessionId, exId, setId, routineId, goalId, sessionIds } = app.deleteTarget;

            if (type === 'session') {
                const sessionToDelete = app.sessions.find(s => s.id === id);
                app.sessions = app.sessions.filter(s => s.id !== id);

                // Also delete from sessions table
                if (sessionToDelete && typeof supabaseService !== 'undefined') {
                    const isAvailable = await supabaseService.isAvailable();
                    if (isAvailable) {
                        try {
                            await supabaseService.deleteSession(id);
                        } catch (error) {
                            console.warn('Error eliminando sesión de tabla sessions:', error);
                            // Continue even if sessions table delete fails
                        }
                    }
                }
            } else if (type === 'week') {
                // Delete all sessions from the visible week
                if (sessionIds && sessionIds.length > 0) {
                    app.sessions = app.sessions.filter(s => !sessionIds.includes(s.id));

                    // Also delete from sessions table
                    if (typeof supabaseService !== 'undefined') {
                        const isAvailable = await supabaseService.isAvailable();
                        if (isAvailable) {
                            // Delete all sessions in parallel
                            const deletePromises = sessionIds.map(sessionId =>
                                supabaseService.deleteSession(sessionId).catch(error => {
                                    console.warn(`Error eliminando sesión ${sessionId} de tabla sessions:`, error);
                                    return null; // Continue even if one fails
                                })
                            );
                            await Promise.all(deletePromises);
                        }
                    }
                }
            } else if (type === 'exercise') {
                const s = app.sessions.find(x => x.id === sessionId);
                if (s) s.exercises = s.exercises.filter(e => e.id !== exId);
            } else if (type === 'set') {
                const s = app.sessions.find(x => x.id === sessionId);
                if (s) {
                    const ex = s.exercises.find(e => e.id === exId);
                    if (ex) {
                        if (ex.sets.length <= 1) {
                            toast('Debe haber al menos un set', 'warn');
                            return;
                        }
                        ex.sets = ex.sets.filter(t => t.id !== setId);
                        ex.sets.forEach((t, i) => t.setNumber = i + 1);
                    }
                }
            } else if (type === 'routine') {
                if (routineId) {
                    // Delete from routines table first
                    if (typeof supabaseService !== 'undefined') {
                        const isAvailable = await supabaseService.isAvailable();
                        if (isAvailable) {
                            try {
                                await supabaseService.deleteRoutine(routineId);
                            } catch (error) {
                                console.warn('Error eliminando rutina de tabla routines:', error);
                                // Continue even if routines table delete fails
                            }
                        }
                    }
                    // Remove from app.routines
                    app.routines = app.routines.filter(r => r.id !== routineId);
                    if (app.routineEditId === routineId) {
                        resetRoutineBuilder();
                    }
                    // Save to update user_data
                    await save();
                }
            } else if (type === 'goal') {
                if (goalId) {
                    deleteGoal(goalId);
                    $('#confirmDialog').close();
                    return;
                }
            }

            try {
                await save();
                refresh();
                $('#confirmDialog').close();
                if (type === 'week') {
                    toast('Semana eliminada correctamente', 'ok');
                } else {
                    toast('Elemento eliminado', 'ok');
                }
            } catch (error) {
                console.error('Error al guardar después de eliminar:', error);
                toast('Error al guardar los cambios', 'err');
            }
        });

        // Delegación sesiones
        $('#sessions').addEventListener('click', (e) => {
            const card = e.target.closest('.session');
            if (!card) return;
            const id = card.dataset.id;

            // Edit session button - open edit dialog (name and date only)
            if (e.target.closest('.js-edit-session')) {
                e.preventDefault();
                const session = app.sessions.find(s => s.id === id);
                if (session) {
                    $('#editSessionDialog').dataset.sessionId = id;
                    $('#editSessionName').value = session.name || '';
                    $('#editSessionDate').value = session.date || '';
                    $('#editSessionDialog').showModal();
                }
                return;
            }

            // Save session changes
            if (e.target.closest('.js-save-session')) {
                e.preventDefault();
                saveSessionChanges(id);
                return;
            }

            // Cancel session changes
            if (e.target.closest('.js-cancel-session')) {
                e.preventDefault();
                cancelSessionChanges(id);
                return;
            }

            if (e.target.closest('.js-delete')) {
                // Check if in edit mode
                const editState = app.editingSessions[id];
                if (editState && editState.isEditing) {
                    toast('Guarda o cancela los cambios antes de eliminar', 'warn');
                    return;
                }
                deleteSession(id);
                return;
            }

            if (e.target.closest('.js-complete')) {
                // Check if in edit mode
                const editState = app.editingSessions[id];
                if (editState && editState.isEditing) {
                    toast('Guarda o cancela los cambios antes de marcar como completada', 'warn');
                    return;
                }
                toggleCompleted(id);
                return;
            }

            if (e.target.closest('.js-add-ex')) {
                // Adding exercises - no edit mode required
                app.currentSessionId = id;
                $('#exerciseName').value = '';
                $('#exerciseDialog').showModal();
                return;
            }
        });

        // Ejercicios / sets
        $('#sessions').addEventListener('click', (e) => {
            const exEl = e.target.closest('.exercise');
            if (!exEl) return;

            const sessionId = e.target.closest('.session').dataset.id;
            const exId = exEl.dataset.exId;

            if (e.target.closest('.js-add-set')) {
                addSet(sessionId, exId);
                return;
            }

            if (e.target.closest('.js-del-ex')) {
                deleteExercise(sessionId, exId);
                return;
            }

            if (e.target.closest('.js-del-set')) {
                const setId = e.target.closest('[data-set-id]').dataset.setId;
                deleteSet(sessionId, exId, setId);
                return;
            }

            if (e.target.closest('.js-rest-timer')) {
                openRestTimer();
                return;
            }

            if (e.target.closest('.js-prev-week-data')) {
                const clickedButton = e.target.closest('.js-prev-week-data');
                if (clickedButton) {
                    togglePrevWeekData(sessionId, exId, clickedButton);
                }
                return;
            }
        });

        // Use 'input' event for real-time updates while typing
        // This prevents keyboard from closing on mobile when moving between fields
        $('#sessions').addEventListener('input', (e) => {
            const setElement = e.target.closest('[data-set-id]');
            if (!setElement) return;

            const sessionId = e.target.closest('.session').dataset.id;
            const exId = e.target.closest('.exercise').dataset.exId;
            const setId = setElement.dataset.setId;

            // Update immediately without refresh to keep keyboard open
            if (e.target.classList.contains('js-kg')) updateSet(sessionId, exId, setId, 'kg', e.target.value.trim(), true);
            if (e.target.classList.contains('js-reps')) updateSet(sessionId, exId, setId, 'reps', e.target.value.trim(), true);
            if (e.target.classList.contains('js-rir')) updateSet(sessionId, exId, setId, 'rir', e.target.value.trim(), true);
        });

        // Restore original values when focusing on inputs if prev week data is active
        $('#sessions').addEventListener('focus', (e) => {
            if (e.target.classList.contains('js-kg') ||
                e.target.classList.contains('js-reps') ||
                e.target.classList.contains('js-rir')) {
                const setElement = e.target.closest('[data-set-id]');
                if (!setElement) return;

                const sessionId = e.target.closest('.session')?.dataset.id;
                const exId = e.target.closest('.exercise')?.dataset.exId;
                const setId = setElement.dataset.setId;

                if (sessionId && exId && setId) {
                    restoreOriginalValues(sessionId, exId, setId);
                }
            }
        }, true);

        // Refresh after user stops interacting with inputs for 1 second
        // This ensures UI updates without closing keyboard while typing
        let refreshTimer = null;
        $('#sessions').addEventListener('blur', (e) => {
            if (e.target.classList.contains('js-kg') ||
                e.target.classList.contains('js-reps') ||
                e.target.classList.contains('js-rir')) {
                // Delay refresh to allow focus to move to next input
                clearTimeout(refreshTimer);
                refreshTimer = setTimeout(() => {
                    // Check if any set input still has focus
                    const activeEl = document.activeElement;
                    const hasSetInputFocus = activeEl && (
                        activeEl.classList.contains('js-kg') ||
                        activeEl.classList.contains('js-reps') ||
                        activeEl.classList.contains('js-rir')
                    );

                    // Only refresh if no set input has focus
                    if (!hasSetInputFocus) {
                        refresh({ preserveTab: true });
                    }
                }, 500);
            }
        }, true);

        // Guardar ejercicio
        $('#saveExercise').addEventListener('click', (ev) => {
            ev.preventDefault();
            const name = $('#exerciseName').value.trim();
            if (!name) {
                toast('Escribe el nombre del ejercicio', 'warn');
                return;
            }
            addExercise(app.currentSessionId, name);
            $('#exerciseDialog').close();
            toast('Ejercicio añadido', 'ok');
        });

        // Allow closing exercise dialog without validation
        $('#exerciseDialog').addEventListener('close', () => {
            // Reset form when closing
            $('#exerciseName').value = '';
        });

        // Guardar nota de ejercicio
        $('#saveExerciseNote').addEventListener('click', (ev) => {
            ev.preventDefault();
            const dialog = $('#exerciseNoteDialog');
            const textarea = $('#exerciseNoteText');
            const sessionId = dialog.dataset.sessionId;
            const exId = dialog.dataset.exId;

            if (!sessionId || !exId) return;

            const noteText = textarea ? textarea.value : '';
            saveExerciseNote(sessionId, exId, noteText);
            dialog.close();
            refresh({ preserveTab: true });
            if (noteText.trim()) {
                toast('Nota guardada', 'ok');
            } else {
                toast('Nota eliminada', 'ok');
            }
        });

        // Reset exercise note dialog when closing
        $('#exerciseNoteDialog').addEventListener('close', () => {
            const textarea = $('#exerciseNoteText');
            if (textarea) textarea.value = '';
        });

        // Rest timer dialog - use event delegation
        document.addEventListener('click', (e) => {
            const timerBtn = e.target.closest('.timer-btn');
            if (timerBtn) {
                e.preventDefault();
                const minutes = parseInt(timerBtn.dataset.minutes);
                if (minutes) {
                    startRestTimer(minutes);
                }
                return;
            }

            const timerCancelBtn = e.target.closest('#timerCancel');
            if (timerCancelBtn) {
                e.preventDefault();
                stopRestTimer();
                return;
            }
        });

        // Close timer dialog when closing
        const restTimerDialog = $('#restTimerDialog');
        if (restTimerDialog) {
            restTimerDialog.addEventListener('close', () => {
                stopRestTimer();
            });
        }

        // Archivo JSON
        $('#fileInput').addEventListener('change', handleFile);
        $('#btnImport').addEventListener('click', applyImport);
        $('#btnExport').addEventListener('click', exportSessions);
        $('#btnExportRoutines').addEventListener('click', exportRoutines);

        // Importar rutinas
        $('#btnImportRoutines').addEventListener('click', () => {
            const fileInput = $('#routineFileInput');
            if (fileInput) {
                fileInput.click();
            }
        });
        $('#routineFileInput').addEventListener('change', (e) => {
            handleRoutineFile(e);
            // Show the container after file is selected
            const container = $('#routineFileInputContainer');
            if (container) {
                container.style.display = 'block';
            }
        });
        $('#btnConfirmImportRoutines').addEventListener('click', applyRoutineImport);
        $('#btnCancelImportRoutines').addEventListener('click', cancelRoutineImport);

        // Plantillas
        $('#templateButtons').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-template]');
            if (!btn) return;
            openTemplatePreview(btn.dataset.template);
        });

        $('#confirmTemplate').addEventListener('click', importTemplateIntoVisibleWeek);

        // Selector de período de estadísticas
        const statsPeriodSelect = $('#statsPeriod');
        if (statsPeriodSelect) {
            statsPeriodSelect.addEventListener('change', () => {
                app.statsPeriod = statsPeriodSelect.value;
                save(); // Guardar la preferencia
                buildStats(); // Recalcular estadísticas
            });
        }

        const profilePhotoInput = document.getElementById('profilePhoto');
        if (profilePhotoInput) {
            profilePhotoInput.addEventListener('change', handleProfilePhotoChange);
        }

        const generateAvatarBtn = document.getElementById('generateAvatar');
        if (generateAvatarBtn) {
            generateAvatarBtn.addEventListener('click', handleGenerateAvatar);
        }

        const avatarStyleSelect = document.getElementById('avatarStyle');
        if (avatarStyleSelect) {
            avatarStyleSelect.addEventListener('change', handleAvatarStyleChange);
        }

        const removePhotoBtn = document.getElementById('removePhoto');
        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', handleRemovePhoto);
        }

        const saveProfileBtn = document.getElementById('saveProfile');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', handleProfileSave);
        }

        const saveBodyMeasurementsBtn = document.getElementById('saveBodyMeasurements');
        if (saveBodyMeasurementsBtn) {
            saveBodyMeasurementsBtn.addEventListener('click', handleBodyMeasurementsSave);
        }

        const calculateBMRBtn = document.getElementById('calculateBMR');
        if (calculateBMRBtn) {
            calculateBMRBtn.addEventListener('click', handleBMRCalculate);
        }

        const addNoteBtn = document.getElementById('addNote');
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', handleAddNote);
        }

        const notesListEl = document.getElementById('notesList');
        if (notesListEl) {
            notesListEl.addEventListener('click', (ev) => {
                const btn = ev.target.closest('.js-delete-note');
                if (!btn) return;
                ev.preventDefault();
                deleteNote(btn.dataset.noteId);
            });
        }

        // Goals System
        const btnNewGoal = document.getElementById('btnNewGoal');
        if (btnNewGoal) {
            btnNewGoal.addEventListener('click', () => {
                $('#goalName').value = '';
                $('#goalType').value = 'weight';
                $('#goalTarget').value = '';
                $('#goalRepsTarget').value = '';
                $('#goalExercise').value = '';
                $('#goalDeadline').value = '';
                $('#goalAutoMilestones').checked = true;
                // Show exercise field for weight type by default
                $('#goalExerciseField').style.display = 'block';
                $('#goalRepsTargetField').style.display = 'none';
                $('#goalTargetLabel').textContent = 'Meta objetivo';
                $('#goalTitle').textContent = 'Nuevo Objetivo';
                $('#goalDialog').dataset.goalId = '';
                $('#goalDialog').showModal();
            });
        }

        const goalTypeSelect = document.getElementById('goalType');
        if (goalTypeSelect) {
            goalTypeSelect.addEventListener('change', (e) => {
                const type = e.target.value;
                const exerciseField = $('#goalExerciseField');
                const targetField = $('#goalTargetField');
                const targetLabel = $('#goalTargetLabel');
                const repsTargetField = $('#goalRepsTargetField');

                // Show/hide exercise field
                if (type === 'exercise' || type === 'weight' || type === 'repsWeight') {
                    if (exerciseField) exerciseField.style.display = 'block';
                } else {
                    if (exerciseField) exerciseField.style.display = 'none';
                }

                // Handle repsWeight type - show two inputs
                if (type === 'repsWeight') {
                    if (targetLabel) targetLabel.textContent = 'KG Objetivo';
                    if (targetField) targetField.style.display = 'block';
                    if (repsTargetField) repsTargetField.style.display = 'block';
                    if ($('#goalTarget')) $('#goalTarget').placeholder = 'Ej. 100';
                    if ($('#goalRepsTarget')) $('#goalRepsTarget').placeholder = 'Ej. 10';
                } else {
                    if (targetLabel) targetLabel.textContent = 'Meta objetivo';
                    if (targetField) targetField.style.display = 'block';
                    if (repsTargetField) repsTargetField.style.display = 'none';
                    if ($('#goalTarget')) {
                        if (type === 'weight' || type === 'loseWeight' || type === 'gainWeight') {
                            $('#goalTarget').placeholder = 'Ej. 100';
                        } else {
                            $('#goalTarget').placeholder = 'Ej. 100';
                        }
                    }
                }
            });
        }

        const saveGoalBtn = document.getElementById('saveGoal');
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                const name = $('#goalName').value.trim();
                const type = $('#goalType').value;
                const target = $('#goalTarget').value;
                const repsTarget = $('#goalRepsTarget').value;
                const exerciseName = $('#goalExercise').value.trim();
                const deadline = $('#goalDeadline').value;
                const autoMilestones = $('#goalAutoMilestones').checked;

                if (!name) {
                    toast('Escribe el nombre del objetivo', 'warn');
                    return;
                }

                if (type === 'repsWeight') {
                    if (!target || parseFloat(target) <= 0) {
                        toast('El KG objetivo debe ser mayor que 0', 'warn');
                        return;
                    }
                    if (!repsTarget || parseFloat(repsTarget) <= 0) {
                        toast('Las repeticiones objetivo deben ser mayores que 0', 'warn');
                        return;
                    }
                    if (!exerciseName) {
                        toast('Especifica el ejercicio', 'warn');
                        return;
                    }
                } else {
                    if (!target || parseFloat(target) <= 0) {
                        toast('La meta debe ser mayor que 0', 'warn');
                        return;
                    }
                    if ((type === 'exercise' || type === 'weight' || type === 'repsWeight') && !exerciseName) {
                        toast('Especifica el ejercicio', 'warn');
                        return;
                    }
                }

                addGoal({
                    name,
                    type,
                    target,
                    repsTarget: type === 'repsWeight' ? parseFloat(repsTarget) : null,
                    exerciseName: (type === 'exercise' || type === 'weight' || type === 'repsWeight') ? exerciseName : null,
                    deadline: deadline || null,
                    autoMilestones
                });

                $('#goalDialog').close();
            });
        }

    }

    /* =================== Refresh =================== */
    function render() {
        renderWeekbar();
        renderSummary();
        renderSessions();
        renderRoutines();
        renderProfile();
        renderGoals();
        renderRecentAchievements();
        renderAllAchievements();
        initWeekSelector();
    }

    function refresh({ preserveTab } = {}) {
        render();
        const statsVisible = $('#panel-stats').getAttribute('aria-hidden') === 'false';
        if (statsVisible || !preserveTab) {
            buildStats();
            resizeCanvas();
            drawChart();
        }
    }

    /* =================== Authentication =================== */
    let authSubscription = null;

    // Validate email domain
    function validateEmail(email) {
        const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
        const emailDomain = email.split('@')[1]?.toLowerCase();
        return allowedDomains.includes(emailDomain);
    }

    async function initAuth() {
        if (typeof supabaseService === 'undefined') {
            // Supabase not configured, show error
            showAuthScreen();
            const errorDiv = $('#authError');
            if (errorDiv) {
                errorDiv.textContent = 'Supabase no está configurado. Por favor configura las credenciales.';
                errorDiv.style.display = 'block';
            }
            return false;
        }

        // Check for existing session
        const session = await supabaseService.getSession();
        if (session) {
            // User is authenticated
            hideAuthScreen();
            showMainApp();
            setupAuthUI(true);
            await setupRealtimeSync();
            return true;
        } else {
            // Show auth screen
            showAuthScreen();
            return false;
        }
    }

    function showAuthScreen() {
        const authScreen = $('#authScreen');
        const mainApp = $('#mainApp');
        if (authScreen) authScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
    }

    function hideAuthScreen() {
        const authScreen = $('#authScreen');
        if (authScreen) authScreen.style.display = 'none';
    }

    function showMainApp() {
        const mainApp = $('#mainApp');
        if (mainApp) mainApp.style.display = 'block';
    }

    function setupAuthUI(isAuthenticated) {
        const authBtn = $('#authBtn');
        if (authBtn) {
            if (isAuthenticated) {
                authBtn.textContent = 'Cerrar Sesión';
                authBtn.onclick = handleSignOut;
                authBtn.style.display = 'block';
            } else {
                authBtn.style.display = 'none';
            }
        }
    }

    function updateAuthForm(tab) {
        const submitBtn = $('#authSubmit');
        const signupFields = $('#signupFields');
        const firstNameInput = $('#authFirstName');
        const lastNameInput = $('#authLastName');
        const forgotPasswordBtn = $('#btnForgotPassword');
        const confirmPasswordField = $('#confirmPasswordField');
        const confirmPasswordInput = $('#authConfirmPassword');

        if (tab === 'signin') {
            if (submitBtn) submitBtn.textContent = 'Iniciar Sesión';
            if (signupFields) signupFields.style.display = 'none';
            if (confirmPasswordField) confirmPasswordField.style.display = 'none';
            if (firstNameInput) firstNameInput.removeAttribute('required');
            if (lastNameInput) lastNameInput.removeAttribute('required');
            if (confirmPasswordInput) confirmPasswordInput.removeAttribute('required');
            if (forgotPasswordBtn) forgotPasswordBtn.style.display = 'block';
        } else {
            if (submitBtn) submitBtn.textContent = 'Registrarse';
            if (signupFields) signupFields.style.display = 'block';
            if (confirmPasswordField) confirmPasswordField.style.display = 'block';
            if (firstNameInput) firstNameInput.setAttribute('required', 'required');
            if (lastNameInput) lastNameInput.setAttribute('required', 'required');
            if (confirmPasswordInput) confirmPasswordInput.setAttribute('required', 'required');
            if (forgotPasswordBtn) forgotPasswordBtn.style.display = 'none';
        }
    }

    async function handleAuth(e) {
        if (e) e.preventDefault();

        const activeTab = $('.auth-tab-btn.active')?.dataset.tab || 'signin';

        // Clear previous messages
        const errorDiv = $('#authError');
        const successDiv = $('#authSuccess');
        const emailConfirmationMsg = $('#emailConfirmationMessage');
        if (errorDiv) errorDiv.style.display = 'none';
        if (successDiv) successDiv.style.display = 'none';
        // Hide email confirmation message when user tries to login
        if (activeTab === 'signin' && emailConfirmationMsg) {
            emailConfirmationMsg.style.display = 'none';
        }

        if (typeof supabaseService === 'undefined') {
            if (errorDiv) {
                errorDiv.textContent = 'Supabase no está configurado';
                errorDiv.style.display = 'block';
            }
            return;
        }

        const email = $('#authEmail')?.value.trim();
        const password = $('#authPassword')?.value;
        const confirmPassword = $('#authConfirmPassword')?.value;
        const firstName = $('#authFirstName')?.value.trim();
        const lastName = $('#authLastName')?.value.trim();
        
        // Ensure form state is correct before validation
        updateAuthForm(activeTab);

        // Validate email domain
        if (email && !validateEmail(email)) {
            if (errorDiv) {
                errorDiv.textContent = 'Solo se permiten correos de: @gmail.com, @outlook.com, @hotmail.com, @yahoo.com';
                errorDiv.style.display = 'block';
            }
            return;
        }

        // Validate required fields
        if (!email || !password) {
            if (errorDiv) {
                errorDiv.textContent = 'Por favor completa todos los campos';
                errorDiv.style.display = 'block';
            }
            return;
        }

        // Validate signup fields
        if (activeTab === 'signup') {
            if (!firstName || !lastName) {
                if (errorDiv) {
                    errorDiv.textContent = 'Por favor completa nombre y apellidos';
                    errorDiv.style.display = 'block';
                }
                return;
            }
            
            // Validate password confirmation
            if (!confirmPassword) {
                if (errorDiv) {
                    errorDiv.textContent = 'Por favor confirma tu contraseña';
                    errorDiv.style.display = 'block';
                }
                return;
            }
            
            if (password !== confirmPassword) {
                if (errorDiv) {
                    errorDiv.textContent = 'Las contraseñas no coinciden';
                    errorDiv.style.display = 'block';
                }
                return;
            }
        }

        try {
            let result;
            if (activeTab === 'signin') {
                result = await supabaseService.signIn(email, password);
                
                // Check if login was successful
                if (result && result.session) {
                    // Email confirmed, proceed to app
                    await load();
                    // Try to get user metadata from Supabase
                    const user = await supabaseService.getCurrentUser();
                    if (user && user.user_metadata) {
                        if (user.user_metadata.firstName) app.profile.firstName = user.user_metadata.firstName;
                        if (user.user_metadata.lastName) app.profile.lastName = user.user_metadata.lastName;
                        if (user.email) app.profile.email = user.email;
                        await save();
                    }

                    hideAuthScreen();
                    showMainApp();
                    setupAuthUI(true);
                    await setupRealtimeSync();
                    // Reload data from Supabase
                    await load();
                    // Initialize app if not already done
                    bindEvents();
                    render();
                    updateStreak();
                    updateWeeklyGoal();
                    checkAchievements();
                    // Fix: Only show toast once, check if already shown
                    if (!window.sessionToastShown) {
                        toast('Sesión iniciada correctamente', 'ok');
                        window.sessionToastShown = true;
                        // Reset flag after 2 seconds
                        setTimeout(() => { window.sessionToastShown = false; }, 2000);
                    }
                } else if (result && result.user && !result.session) {
                    // User exists but email not confirmed
                    if (errorDiv) {
                        errorDiv.textContent = 'Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.';
                        errorDiv.style.display = 'block';
                    }
                    // Clear password field
                    const passwordInput = $('#authPassword');
                    if (passwordInput) passwordInput.value = '';
                    return; // Don't proceed
                } else if (!result || !result.session) {
                    // No session - this shouldn't happen if login was successful, but handle it
                    if (errorDiv) {
                        errorDiv.textContent = 'No se pudo iniciar sesión. Verifica tus credenciales o confirma tu email.';
                        errorDiv.style.display = 'block';
                    }
                    return;
                }
            } else {
                // Sign up
                result = await supabaseService.signUp(email, password, {
                    firstName: firstName,
                    lastName: lastName
                });
                
                if (result) {
                    // Check if email confirmation is required
                    if (result.user && !result.session) {
                        // Email confirmation required - show success message first
                        toast('Confirmación enviada', 'ok');
                        
                        // Clear error messages
                        if (errorDiv) errorDiv.style.display = 'none';
                        const successDiv = $('#authSuccess');
                        if (successDiv) successDiv.style.display = 'none';
                        
                        // Reset form
                        const authForm = $('#authForm');
                        if (authForm) {
                            authForm.reset();
                            // Clear confirm password field
                            const confirmPasswordInput = $('#authConfirmPassword');
                            if (confirmPasswordInput) confirmPasswordInput.value = '';
                        }
                        
                        // Switch to login tab FIRST
                        const signinTab = $('.auth-tab-btn[data-tab="signin"]');
                        const signupTab = $('.auth-tab-btn[data-tab="signup"]');
                        if (signinTab && signupTab) {
                            signinTab.classList.add('active');
                            signupTab.classList.remove('active');
                            updateAuthForm('signin');
                        }
                        
                        // Pre-fill email in login form
                        const emailInput = $('#authEmail');
                        if (emailInput) emailInput.value = email;
                        
                        // Show email confirmation message below "Iniciar Sesión" AFTER switching tabs
                        // Use a small delay to ensure the tab switch is complete
                        setTimeout(() => {
                            const emailConfirmationMsg = $('#emailConfirmationMessage');
                            if (emailConfirmationMsg) {
                                emailConfirmationMsg.style.display = 'block';
                            }
                        }, 100);
                        
                        return; // Don't proceed to login
                    } else if (result.user && result.session) {
                        // Email already confirmed (shouldn't happen normally, but handle it)
                        // Save user profile data
                        app.profile.firstName = firstName;
                        app.profile.lastName = lastName;
                        app.profile.email = email;
                        await save();
                        
                        // Proceed to app
                        hideAuthScreen();
                        showMainApp();
                        setupAuthUI(true);
                        await setupRealtimeSync();
                        await load();
                        bindEvents();
                        render();
                        updateStreak();
                        updateWeeklyGoal();
                        checkAchievements();
                        if (!window.sessionToastShown) {
                            toast('Sesión iniciada correctamente', 'ok');
                            window.sessionToastShown = true;
                            setTimeout(() => { window.sessionToastShown = false; }, 2000);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            if (errorDiv) {
                // Check if error is about email not confirmed
                if (error.message && (error.message.includes('email') && error.message.includes('confirm'))) {
                    errorDiv.textContent = 'Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.';
                } else {
                    errorDiv.textContent = error.message || 'Error al autenticarse';
                }
                errorDiv.style.display = 'block';
            }
        }
    }

    async function handleSignOut() {
        if (typeof supabaseService === 'undefined') return;

        try {
            await supabaseService.signOut();
            if (authSubscription) {
                authSubscription.unsubscribe();
                authSubscription = null;
            }
            setupAuthUI(false);
            // Show auth screen
            showAuthScreen();
            // Reset form
            const authForm = $('#authForm');
            if (authForm) authForm.reset();
            const errorDiv = $('#authError');
            if (errorDiv) errorDiv.style.display = 'none';
            toast('Sesión cerrada', 'ok');
        } catch (error) {
            console.error('Sign out error:', error);
            toast('Error al cerrar sesión', 'warn');
        }
    }

    async function setupRealtimeSync() {
        if (typeof supabaseService === 'undefined') return;
        const isAvailable = await supabaseService.isAvailable();
        if (!isAvailable) return;

        // Subscribe to real-time changes
        authSubscription = await supabaseService.subscribeToChanges(async (newData) => {
            // Data changed on another device, reload
            await load();
            render();
            toast('Datos actualizados', 'ok');
        });
    }

    // Bind auth events
    function bindAuthEvents() {
        // Initialize form state based on active tab
        const activeTab = $('.auth-tab-btn.active')?.dataset.tab || 'signin';
        updateAuthForm(activeTab);
        
        // Auth tabs
        const authTabs = $$('.auth-tab-btn');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                updateAuthForm(tab.dataset.tab);
                // Clear error and success messages when switching tabs
                const errorDiv = $('#authError');
                const successDiv = $('#authSuccess');
                const emailConfirmationMsg = $('#emailConfirmationMessage');
                if (errorDiv) errorDiv.style.display = 'none';
                if (successDiv) successDiv.style.display = 'none';
                // Hide email confirmation message when switching tabs (user can see it again if needed)
                if (tab.dataset.tab === 'signup' && emailConfirmationMsg) {
                    emailConfirmationMsg.style.display = 'none';
                }
            });
        });

        // Auth form
        const authForm = $('#authForm');
        if (authForm) {
            authForm.addEventListener('submit', handleAuth);
        }

        // Real-time email validation
        const emailInput = $('#authEmail');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                const email = emailInput.value.trim();
                const errorDiv = $('#authError');
                if (email && !validateEmail(email)) {
                    if (errorDiv) {
                        errorDiv.textContent = 'Solo se permiten correos de: @gmail.com, @outlook.com, @hotmail.com, @yahoo.com';
                        errorDiv.style.display = 'block';
                    }
                } else if (errorDiv && errorDiv.textContent.includes('correos de')) {
                    errorDiv.style.display = 'none';
                }
            });
        }
    }

    /* =================== Init =================== */
    (async function init() {
        // Initialize authentication first
        const isAuthenticated = await initAuth();
        bindAuthEvents();

        // Only load app data if authenticated
        if (isAuthenticated) {
            // Load data
            await load();
            bindEvents();
            render();
            // Initialize competitive mode on load
            updateStreak();
            updateWeeklyGoal();
            checkAchievements();

            // Sync profile to Supabase after loading
            if (app.profile) {
                syncProfileToSupabase(app.profile.firstName, app.profile.lastName);
            }
        } else {
            // Just bind events for auth screen
            // Don't load app data until authenticated
        }
    })();

    /* =================== Profile Handlers =================== */
    function handleProfilePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast('Por favor selecciona un archivo de imagen', 'warn');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const photoData = event.target.result;
            app.profile.photo = photoData;
            save();

            const avatar = $('#profileAvatar');
            if (avatar) {
                avatar.src = photoData;
            }

            // Show remove photo button
            const removeBtn = $('#removePhoto');
            if (removeBtn) {
                removeBtn.style.display = 'block';
            }

            // Sync profile to Supabase
            syncProfileToSupabase(app.profile.firstName, app.profile.lastName);

            toast('Foto de perfil actualizada', 'ok');
        };
        reader.onerror = function () {
            toast('Error al cargar la imagen', 'err');
        };
        reader.readAsDataURL(file);
    }

    function handleGenerateAvatar() {
        // Generate new random seed
        app.profile.avatarSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        app.profile.photo = ''; // Clear photo when using generated avatar
        save();

        const avatar = $('#profileAvatar');
        if (avatar) {
            avatar.src = getCurrentAvatar();
        }

        // Hide remove photo button
        const removeBtn = $('#removePhoto');
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }
    }

    function handleAvatarStyleChange() {
        const styleSelect = $('#avatarStyle');
        if (!styleSelect) return;

        app.profile.avatarStyle = styleSelect.value;
        app.profile.photo = ''; // Clear photo when changing style
        save();

        const avatar = $('#profileAvatar');
        if (avatar) {
            avatar.src = getCurrentAvatar();
        }

        // Hide remove photo button
        const removeBtn = $('#removePhoto');
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }
    }

    function handleRemovePhoto() {
        app.profile.photo = '';
        save();

        const avatar = $('#profileAvatar');
        if (avatar) {
            avatar.src = getCurrentAvatar();
        }

        const photoInput = $('#profilePhoto');
        if (photoInput) {
            photoInput.value = '';
        }

        const removeBtn = $('#removePhoto');
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }

        toast('Foto eliminada', 'ok');
    }

    function handleProfileSave(e) {
        if (e) e.preventDefault();

        const firstName = $('#profileFirstName')?.value.trim() || '';
        const lastName = $('#profileLastName')?.value.trim() || '';
        const height = $('#profileHeight')?.value.trim() || '';
        const weight = $('#profileWeight')?.value.trim() || '';
        const bodyFat = $('#profileBodyFat')?.value.trim() || '';

        app.profile.firstName = firstName;
        app.profile.lastName = lastName;
        app.profile.height = height;
        app.profile.weight = weight;
        app.profile.bodyFat = bodyFat;

        // If no photo is set and no seed exists, generate seed from name
        if (!app.profile.photo && !app.profile.avatarSeed) {
            const nameSeed = (firstName + ' ' + lastName).trim() || 'default';
            app.profile.avatarSeed = nameSeed;
        }

        // Add to weight history if weight or bodyFat is provided
        if (weight || bodyFat) {
            const today = new Date().toISOString().split('T')[0];
            const existingEntry = app.profile.weightHistory?.find(entry => entry.date === today);

            if (existingEntry) {
                if (weight) existingEntry.weight = parseFloat(weight) || null;
                if (bodyFat) existingEntry.bodyFat = parseFloat(bodyFat) || null;
            } else {
                if (!app.profile.weightHistory) app.profile.weightHistory = [];
                app.profile.weightHistory.push({
                    date: today,
                    weight: weight ? parseFloat(weight) : null,
                    bodyFat: bodyFat ? parseFloat(bodyFat) : null
                });
            }
        }

        save();
        renderProfile();

        // Sync profile to Supabase profiles table
        syncProfileToSupabase(firstName, lastName);

        toast('Perfil actualizado', 'ok');
    }

    // Function to sync profile data to Supabase profiles table
    async function syncProfileToSupabase(firstName, lastName) {
        if (!supabase) return;

        try {
            const user = await supabaseService.getCurrentUser();
            if (!user) return;

            // Get avatar URL if exists
            const avatarUrl = app.profile.photo || null;

            // Update or insert profile in Supabase
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    first_name: firstName || null,
                    last_name: lastName || null,
                    avatar_url: avatarUrl
                }, {
                    onConflict: 'id'
                });

            if (error) {
                console.error('Error syncing profile to Supabase:', error);
            }
        } catch (error) {
            console.error('Error in syncProfileToSupabase:', error);
        }
    }

    /* =================== Notes Handlers =================== */
    function handleAddNote(e) {
        if (e) e.preventDefault();

        const noteText = $('#noteText');
        if (!noteText) return;

        const text = noteText.value.trim();
        if (!text) {
            toast('Escribe algo en la nota', 'warn');
            return;
        }

        if (!app.notes) app.notes = [];
        app.notes.push({
            id: uuid(),
            text: text,
            createdAt: new Date().toISOString()
        });

        save();
        noteText.value = '';
        renderNotes();
        toast('Nota guardada', 'ok');
    }

    function deleteNote(noteId) {
        if (!noteId) return;
        if (!app.notes) app.notes = [];
        app.notes = app.notes.filter(note => note.id !== noteId);
        save();
        renderNotes();
        toast('Nota eliminada', 'ok');
    }

    function renderNotes() {
        const notesList = $('#notesList');
        const notesEmpty = $('#notesEmpty');

        if (!notesList) return;

        if (!app.notes || app.notes.length === 0) {
            if (notesList) notesList.innerHTML = '';
            if (notesEmpty) notesEmpty.hidden = false;
            return;
        }

        if (notesEmpty) notesEmpty.hidden = true;

        const sortedNotes = [...app.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        notesList.innerHTML = sortedNotes.map(note => {
            const date = new Date(note.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            return `
                <div class="note-item">
                    <p>${note.text}</p>
                    <div class="note-meta">
                        <span>${date}</span>
                        <button class="btn btn--small js-delete-note" data-note-id="${note.id}" aria-label="Eliminar nota">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderProfile() {
        const avatar = $('#profileAvatar');
        if (avatar) {
            avatar.src = getCurrentAvatar();
        }

        const photoInput = $('#profilePhoto');
        if (photoInput) {
            photoInput.value = '';
        }

        // Set avatar style selector
        const styleSelect = $('#avatarStyle');
        if (styleSelect) {
            styleSelect.value = app.profile.avatarStyle || 'avataaars';
        }

        // Show/hide remove photo button
        const removeBtn = $('#removePhoto');
        if (removeBtn) {
            removeBtn.style.display = app.profile.photo ? 'block' : 'none';
        }

        const firstNameInput = $('#profileFirstName');
        if (firstNameInput) firstNameInput.value = app.profile.firstName || '';
        const lastNameInput = $('#profileLastName');
        if (lastNameInput) lastNameInput.value = app.profile.lastName || '';
        const heightInput = $('#profileHeight');
        if (heightInput) heightInput.value = app.profile.height || '';
        const weightInput = $('#profileWeight');
        if (weightInput) weightInput.value = app.profile.weight || '';
        const bodyFatInput = $('#profileBodyFat');
        if (bodyFatInput) bodyFatInput.value = app.profile.bodyFat || '';

        const historyBody = $('#profileHistoryBody');
        if (historyBody) {
            const entries = [...(app.profile.weightHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            if (!entries.length) {
                historyBody.innerHTML = '<tr><td colspan="3" style="padding:8px">Sin registros aún</td></tr>';
            } else {
                historyBody.innerHTML = entries.map(entry => {
                    const date = new Date(entry.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                    const hasWeight = typeof entry.weight === 'number' && Number.isFinite(entry.weight);
                    const hasFat = typeof entry.bodyFat === 'number' && Number.isFinite(entry.bodyFat);
                    const weight = hasWeight ? entry.weight.toFixed(1) : '—';
                    const fat = hasFat ? entry.bodyFat.toFixed(1) : '—';
                    return `<tr><td>${date}</td><td>${weight}</td><td>${fat}</td></tr>`;
                }).join('');
            }
        }

        // Render body measurements history
        const bodyMeasurementsHistoryBody = $('#bodyMeasurementsHistoryBody');
        if (bodyMeasurementsHistoryBody) {
            const entries = [...(app.profile.bodyMeasurementsHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            if (!entries.length) {
                bodyMeasurementsHistoryBody.innerHTML = '<tr><td colspan="7" style="padding:8px; color:var(--muted)">Sin registros aún</td></tr>';
            } else {
                bodyMeasurementsHistoryBody.innerHTML = entries.map(entry => {
                    const date = new Date(entry.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                    const formatValue = (val) => (typeof val === 'number' && Number.isFinite(val)) ? val.toFixed(1) : '—';
                    return `<tr>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${date}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.arms)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.chest)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.waist)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.hips)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.legs)}</td>
                                <td style="padding:8px; border-bottom:1px solid var(--border)">${formatValue(entry.calves)}</td>
                            </tr>`;
                }).join('');
            }
        }

        // Render notes
        renderNotes();

        // Render color swatches
        if (typeof window.renderColorSwatches === 'function') {
            window.renderColorSwatches();
        }

        // Render competitive mode
        renderCompetitiveMode();
    }

    function handleBodyMeasurementsSave(e) {
        if (e) e.preventDefault();

        const arms = $('#measurementArms')?.value.trim() || '';
        const chest = $('#measurementChest')?.value.trim() || '';
        const waist = $('#measurementWaist')?.value.trim() || '';
        const hips = $('#measurementHips')?.value.trim() || '';
        const legs = $('#measurementLegs')?.value.trim() || '';
        const calves = $('#measurementCalves')?.value.trim() || '';

        // Check if at least one measurement is provided
        if (!arms && !chest && !waist && !hips && !legs && !calves) {
            toast('Ingresa al menos una medida', 'warn');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const existingEntry = app.profile.bodyMeasurementsHistory?.find(entry => entry.date === today);

        const measurements = {
            date: today,
            arms: arms ? parseFloat(arms) : null,
            chest: chest ? parseFloat(chest) : null,
            waist: waist ? parseFloat(waist) : null,
            hips: hips ? parseFloat(hips) : null,
            legs: legs ? parseFloat(legs) : null,
            calves: calves ? parseFloat(calves) : null
        };

        if (existingEntry) {
            // Update existing entry, merge with existing values
            if (arms) existingEntry.arms = parseFloat(arms);
            if (chest) existingEntry.chest = parseFloat(chest);
            if (waist) existingEntry.waist = parseFloat(waist);
            if (hips) existingEntry.hips = parseFloat(hips);
            if (legs) existingEntry.legs = parseFloat(legs);
            if (calves) existingEntry.calves = parseFloat(calves);
        } else {
            if (!app.profile.bodyMeasurementsHistory) app.profile.bodyMeasurementsHistory = [];
            app.profile.bodyMeasurementsHistory.push(measurements);
        }

        // Clear form
        $('#measurementArms').value = '';
        $('#measurementChest').value = '';
        $('#measurementWaist').value = '';
        $('#measurementHips').value = '';
        $('#measurementLegs').value = '';
        $('#measurementCalves').value = '';

        save();
        renderProfile();
        toast('Medidas guardadas', 'ok');
    }

    function handleBMRCalculate(e) {
        if (e) e.preventDefault();

        const gender = $('#bmrGender')?.value || 'male';
        const age = parseFloat($('#bmrAge')?.value) || 0;
        const activity = parseFloat($('#bmrActivity')?.value) || 1.2;
        const goal = $('#bmrGoal')?.value || 'maintain';
        const weight = parseFloat(app.profile?.weight) || 0;
        const height = parseFloat(app.profile?.height) || 0;

        if (!age || age < 1 || age > 120) {
            toast('Ingresa una edad válida', 'warn');
            return;
        }

        if (!weight || weight <= 0) {
            toast('Ingresa tu peso en el perfil para calcular la TMB', 'warn');
            return;
        }

        if (!height || height <= 0) {
            toast('Ingresa tu altura en el perfil para calcular la TMB', 'warn');
            return;
        }

        // Calculate BMR using Mifflin-St Jeor equation
        // BMR (men) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
        // BMR (women) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        // Calculate TDEE (Total Daily Energy Expenditure)
        const tdee = Math.round(bmr * activity);

        // Calculate recommended calories based on goal
        let recommendedCalories = tdee;
        let goalText = '';
        if (goal === 'lose') {
            // Deficit of 500 kcal/day for ~0.5kg/week weight loss
            recommendedCalories = Math.round(tdee - 500);
            goalText = `Para perder grasa: ${recommendedCalories} kcal/día (déficit de 500 kcal)`;
        } else if (goal === 'gain') {
            // Surplus of 300-500 kcal/day for muscle gain
            recommendedCalories = Math.round(tdee + 400);
            goalText = `Para ganar masa muscular: ${recommendedCalories} kcal/día (superávit de 400 kcal)`;
        } else {
            goalText = `Para mantener peso: ${recommendedCalories} kcal/día`;
        }

        // Display results
        const resultsDiv = $('#bmrResults');
        const bmrValue = $('#bmrValue');
        const tdeeValue = $('#tdeeValue');
        const recommendedCaloriesDiv = $('#recommendedCalories');

        if (resultsDiv) resultsDiv.style.display = 'block';
        if (bmrValue) bmrValue.textContent = Math.round(bmr);
        if (tdeeValue) tdeeValue.textContent = tdee;
        if (recommendedCaloriesDiv) recommendedCaloriesDiv.textContent = goalText;
    }

    /* =================== Social Feature =================== */
    async function loadSocialData() {
        if (!window.supabaseCreateClient) return;
        console.log('Loading social data, table:', TABLE_FRIEND_REQUESTS);

        const user = await supabaseService.getCurrentUser();
        if (!user) {
            toast('Debes iniciar sesión para usar funciones sociales', 'warn');
            return;
        }

        // 1. Load my profile (use local state for immediate sync)
        const firstName = app.profile.firstName || '';
        const lastName = app.profile.lastName || '';
        const fullName = (firstName + ' ' + lastName).trim() || 'Usuario';

        const socialName = $('#socialName');
        const socialEmail = $('#socialEmail');
        const socialAvatar = $('#socialAvatar');

        if (socialName) socialName.textContent = fullName;
        if (socialEmail) socialEmail.textContent = app.profile.email || user.email;
        if (socialAvatar) socialAvatar.src = getCurrentAvatar();


        // 2. Load Pending Requests
        const { data: requestsRaw } = await supabase
            .from(TABLE_FRIEND_REQUESTS)
            .select('*, sender:profiles!sender_id(*)')
            .eq('receiver_id', user.id)
            .eq('status', 'pending');

        // Fix: Remove duplicates by request ID
        const seenRequestIds = new Set();
        const requests = (requestsRaw || []).filter(req => {
            if (!req || !req.id) return false;
            if (seenRequestIds.has(req.id)) return false;
            seenRequestIds.add(req.id);
            return true;
        });

        const reqList = $('#pendingRequestsList');
        reqList.innerHTML = '';
        if (requests && requests.length > 0) {
            // Fetch sender's user_data to get their profile name
            for (const req of requests) {
                const { data: senderData } = await supabase
                    .from('user_data')
                    .select('data')
                    .eq('user_id', req.sender_id)
                    .maybeSingle();

                const senderUserData = senderData?.data || {};
                const senderProfile = senderUserData.profile || {};

                // Get name from user_data profile (same as Perfil>Nombre) or from profiles table
                const firstName = senderProfile.firstName || req.sender.first_name || '';
                const lastName = senderProfile.lastName || req.sender.last_name || '';
                const fullName = (firstName + ' ' + lastName).trim();

                const div = document.createElement('div');
                div.className = 'routine-created__item';

                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap">
                        <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0">
                            <img src="${req.sender.avatar_url || senderProfile.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.sender.email}`}" style="width:40px; height:40px; border-radius:50%; flex-shrink:0">
                            <div style="min-width:0; flex:1">
                                <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${fullName || req.sender.email || 'Usuario'}</div>
                                <div style="font-size:0.8rem; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${req.sender.email}</div>
                            </div>
                        </div>
                        <div style="display:flex; gap:8px; flex-shrink:0">
                            <button class="btn btn--small btn--danger js-decline-request" data-id="${req.id}" aria-label="Rechazar" style="min-width:44px; padding:8px 12px; font-size:1.2rem; line-height:1">✕</button>
                            <button class="btn btn--small js-accept-request" data-id="${req.id}" aria-label="Aceptar" style="min-width:44px; padding:8px 12px; font-size:1.2rem; line-height:1; background:linear-gradient(135deg, #10b981, #059669); color:#ffffff; border:0; box-shadow:0 2px 8px rgba(16, 185, 129, 0.3)">✓</button>
                        </div>
                    </div>
                `;
                reqList.appendChild(div);
            }
        } else {
            reqList.innerHTML = '<div class="routine-empty">No tienes solicitudes pendientes.</div>';
        }

        // 3. Load Friends
        // Simplified: fetch requests where status=accepted and I am sender OR receiver
        const { data: friends1 } = await supabase
            .from(TABLE_FRIEND_REQUESTS)
            .select('*, friend:profiles!receiver_id(*)')
            .eq('sender_id', user.id)
            .eq('status', 'accepted');

        const { data: friends2 } = await supabase
            .from(TABLE_FRIEND_REQUESTS)
            .select('*, friend:profiles!sender_id(*)')
            .eq('receiver_id', user.id)
            .eq('status', 'accepted');

        // Fix: Remove duplicates by friend ID - more robust filtering
        const allFriendsRaw = [];
        
        // Add friends from first query (where I am sender)
        if (friends1 && Array.isArray(friends1)) {
            friends1.forEach(r => {
                if (r && r.friend && r.friend.id) {
                    allFriendsRaw.push(r.friend);
                }
            });
        }
        
        // Add friends from second query (where I am receiver)
        if (friends2 && Array.isArray(friends2)) {
            friends2.forEach(r => {
                if (r && r.friend && r.friend.id) {
                    allFriendsRaw.push(r.friend);
                }
            });
        }
        
        // Remove duplicates by friend ID
        const seenFriendIds = new Set();
        const allFriends = allFriendsRaw.filter(f => {
            if (!f || !f.id) return false;
            const friendId = String(f.id); // Convert to string for consistent comparison
            if (seenFriendIds.has(friendId)) {
                console.log('Duplicate friend filtered:', f.id, f.email);
                return false;
            }
            seenFriendIds.add(friendId);
            return true;
        });

        const friendsList = $('#friendsList');
        friendsList.innerHTML = '';
        if (allFriends.length > 0) {
            // Load user_data for each friend to get their current profile photo
            for (const f of allFriends) {
                // Fetch friend's user_data to get current profile photo
                const { data: friendData } = await supabase
                    .from('user_data')
                    .select('data')
                    .eq('user_id', f.id)
                    .maybeSingle();

                const friendUserData = friendData?.data || {};
                const friendProfile = friendUserData.profile || {};

                // Get name from user_data profile (same as Perfil>Nombre) or from profiles table
                const firstName = friendProfile.firstName || f.first_name || '';
                const lastName = friendProfile.lastName || f.last_name || '';
                const fullName = (firstName + ' ' + lastName).trim() || f.email || 'Usuario';

                // Get photo from profile first, then avatar_url, then generate
                const friendPhoto = friendProfile.photo || f.avatar_url || null;
                let avatarSrc;
                if (friendPhoto) {
                    avatarSrc = friendPhoto;
                } else {
                    // Generate avatar from email or name
                    const avatarSeed = friendProfile.avatarSeed || f.email || fullName;
                    avatarSrc = `https://api.dicebear.com/7.x/${friendProfile.avatarStyle || 'avataaars'}/svg?seed=${encodeURIComponent(avatarSeed)}`;
                }

                const div = document.createElement('div');
                div.className = 'routine-created__item';
                div.style.cursor = 'pointer';
                div.onclick = () => viewFriendStats(f.id);

                div.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px">
                        <img src="${avatarSrc}" style="width:40px; height:40px; border-radius:50%">
                        <div>
                            <div style="font-weight:600">${fullName}</div>
                            <div style="font-size:0.8rem; color:var(--muted)">Ver estadísticas</div>
                        </div>
                    </div>
                `;
                friendsList.appendChild(div);
            }
        } else {
            friendsList.innerHTML = '<div class="routine-empty">Aún no tienes amigos conectados.</div>';
        }
    }

    async function sendFriendRequest() {
        const email = $('#friendEmail').value.trim().toLowerCase();
        if (!email) return;

        const user = await supabaseService.getCurrentUser();
        if (!user) return;

        // Find user by email
        const { data: targetUser, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (error || !targetUser) {
            toast('Usuario no encontrado', 'err');
            return;
        }

        if (targetUser.id === user.id) {
            toast('No puedes enviarte solicitud a ti mismo', 'warn');
            return;
        }

        const { error: reqError } = await supabase
            .from(TABLE_FRIEND_REQUESTS)
            .insert({
                sender_id: user.id,
                receiver_id: targetUser.id
            });

        if (reqError) {
            if (reqError.code === '23505') { // Unique violation
                toast('Ya existe una solicitud o amistad', 'warn');
            } else {
                toast('Error al enviar solicitud', 'err');
            }
        } else {
            toast('Solicitud enviada', 'ok');
            $('#friendEmail').value = '';
        }
    }

    async function viewFriendStats(friendId) {
        // Fetch friend's profile
        const { data: friend } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', friendId)
            .single();

        if (!friend) {
            toast('No se pudo cargar el perfil del amigo', 'err');
            return;
        }

        // Fetch friend's user_data to get goals, achievements, sessions, etc.
        const { data: friendData } = await supabase
            .from('user_data')
            .select('data')
            .eq('user_id', friendId)
            .maybeSingle();

        const friendUserData = friendData?.data || {};

        // Get friend's name from user_data profile (same as in Perfil>Nombre) or from profiles table
        const friendProfileName = friendUserData.profile || {};
        const friendFirstName = friendProfileName.firstName || friend.first_name || '';
        const friendLastName = friendProfileName.lastName || friend.last_name || '';
        const friendFullName = (friendFirstName + ' ' + friendLastName).trim() || friend.email || 'Usuario';

        // Update friend profile header
        $('#friendName').textContent = friendFullName;
        // Use photo from profile first, then avatar_url, then generate from email
        const friendPhoto = friendProfileName.photo || friend.avatar_url || null;
        if (friendPhoto) {
            $('#friendAvatar').src = friendPhoto;
        } else {
            // Generate avatar from email or name
            const avatarSeed = friendProfileName.avatarSeed || friend.email || friendFullName;
            $('#friendAvatar').src = `https://api.dicebear.com/7.x/${friendProfileName.avatarStyle || 'avataaars'}/svg?seed=${encodeURIComponent(avatarSeed)}`;
        }
        $('#friendLastActive').textContent = `Miembro desde ${new Date(friend.updated_at || Date.now()).toLocaleDateString()}`;

        // Calculate stats from friend's sessions
        const friendSessions = friendUserData.sessions || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlySessions = friendSessions.filter(s => {
            if (!s.date) return false;
            const sessionDate = new Date(s.date);
            return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
        });

        // Calculate monthly volume
        let monthlyVolume = 0;
        monthlySessions.forEach(session => {
            (session.exercises || []).forEach(ex => {
                (ex.sets || []).forEach(set => {
                    const kg = parseFloat(set.kg) || 0;
                    const reps = parseReps(set.reps);
                    monthlyVolume += kg * reps;
                });
            });
        });

        // Get streak
        const streak = friendUserData.streak || { current: 0, lastDate: null };

        // Update stats display
        $('#friendSessions').textContent = monthlySessions.length;
        $('#friendVolume').textContent = Math.round(monthlyVolume) + ' kg';
        $('#friendStreak').textContent = streak.current + ' días';

        // Display recent sessions
        const recentSessions = friendSessions
            .filter(s => s.completed)
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, 5);

        const recentSessionsContainer = $('#friendRecentSessions');
        if (recentSessions.length === 0) {
            recentSessionsContainer.innerHTML = '<div class="routine-empty">No hay entrenamientos recientes.</div>';
        } else {
            recentSessionsContainer.innerHTML = recentSessions.map(session => {
                const date = session.date ? new Date(session.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }) : 'Sin fecha';
                return `
                    <div class="routine-created__item">
                        <div style="display:flex; justify-content:space-between; align-items:center">
                            <div>
                                <div style="font-weight:600">${session.name || 'Sin nombre'}</div>
                                <div style="font-size:0.8rem; color:var(--muted)">${date}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Display friend's goals
        const friendGoals = friendUserData.goals || [];
        const goalsContainer = $('#friendGoalsList');
        if (friendGoals.length === 0) {
            goalsContainer.innerHTML = '<div class="routine-empty">Aún no tiene objetivos.</div>';
        } else {
            goalsContainer.innerHTML = friendGoals.map(goal => {
                const progressPercent = Math.min(100, goal.progress || 0);
                const progressBar = goal.completed ? '100%' : `${progressPercent}%`;
                const goalClass = goal.completed ? 'completed' : '';

                let goalDescription = '';
                switch (goal.type) {
                    case 'weight':
                        goalDescription = `Aumentar peso a ${goal.target} kg${goal.exerciseName ? ` (${goal.exerciseName})` : ''}`;
                        break;
                    case 'loseWeight':
                        goalDescription = `Perder ${goal.target} kg`;
                        break;
                    case 'gainWeight':
                        goalDescription = `Ganar ${goal.target} kg`;
                        break;
                    case 'volume':
                        goalDescription = `Aumentar volumen total a ${goal.target} kg`;
                        break;
                    case 'repsWeight':
                        goalDescription = `${goal.repsTarget} reps con ${goal.target} kg${goal.exerciseName ? ` (${goal.exerciseName})` : ''}`;
                        break;
                    case 'sessions':
                        goalDescription = `Completar ${goal.target} sesiones`;
                        break;
                    case 'streak':
                        goalDescription = `Racha de ${goal.target} días`;
                        break;
                    case 'exercise':
                        goalDescription = `Mejorar ${goal.exerciseName || 'ejercicio'}`;
                        break;
                    default:
                        goalDescription = goal.name || 'Objetivo';
                }

                return `
                    <div class="goal-item ${goalClass}" style="opacity: ${goal.completed ? '0.6' : '1'}">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
                            <div style="font-weight:600">${goal.name || goalDescription}</div>
                            <div style="font-size:0.85rem; color:var(--muted)">${Math.round(progressPercent)}%</div>
                        </div>
                        <div class="goal-progress">
                            <div class="goal-progress-bar" style="width:${progressBar}"></div>
                        </div>
                        ${goal.deadline ? `<div style="font-size:0.75rem; color:var(--muted); margin-top:4px">Fecha límite: ${new Date(goal.deadline).toLocaleDateString('es-ES')}</div>` : ''}
                    </div>
                `;
            }).join('');
        }

        // Display friend's achievements
        const friendAchievements = friendUserData.achievements || [];
        const achievementsContainer = $('#friendAchievementsList');
        if (friendAchievements.length === 0) {
            achievementsContainer.innerHTML = '<div class="routine-empty">Aún no tiene logros.</div>';
        } else {
            const sortedAchievements = [...friendAchievements].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            achievementsContainer.innerHTML = sortedAchievements.map(ach => {
                const date = ach.date ? new Date(ach.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }) : '';
                return `
                    <div class="achievement-item" style="display:flex; align-items:center; gap:12px; padding:12px; background:var(--surface-2); border-radius:8px; margin-bottom:8px">
                        <div style="font-size:1.5rem">${ach.icon || '🏆'}</div>
                        <div style="flex:1">
                            <div style="font-weight:600">${ach.title || 'Logro'}</div>
                            ${date ? `<div style="font-size:0.75rem; color:var(--muted)">${date}</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Display friend's routines with copy option
        const friendRoutines = friendUserData.routines || [];
        const routinesContainer = $('#friendRoutinesList');
        if (routinesContainer) {
            if (friendRoutines.length === 0) {
                routinesContainer.innerHTML = '<div class="routine-empty">Aún no tiene rutinas creadas.</div>';
            } else {
                routinesContainer.innerHTML = friendRoutines.map(routine => {
                    // Calculate total exercises from all days
                    const totalExercises = (routine.days || []).reduce((sum, day) => sum + (day.exercises ? day.exercises.length : 0), 0);
                    const totalDays = (routine.days || []).length;

                    // Get all exercises from all days to display
                    const allExercises = [];
                    (routine.days || []).forEach(day => {
                        (day.exercises || []).forEach(ex => {
                            allExercises.push({
                                name: ex.name || 'Sin nombre',
                                dayName: day.name || 'Día',
                                sets: ex.sets ? ex.sets.length : 0
                            });
                        });
                    });

                    return `
                        <div class="routine-created__item">
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:8px">
                                <div style="flex:1">
                                    <div style="font-weight:600">${routine.name || 'Sin nombre'}</div>
                                    <div style="font-size:0.8rem; color:var(--muted)">
                                        ${totalDays} ${totalDays === 1 ? 'día' : 'días'} · ${totalExercises} ${totalExercises === 1 ? 'ejercicio' : 'ejercicios'}
                                    </div>
                                </div>
                                <button class="btn btn--small btn--ghost js-copy-friend-routine" data-routine-id="${routine.id}" title="Copiar rutina">
                                    📋 Copiar
                                </button>
                            </div>
                            ${allExercises.length > 0 ? `
                                <div style="padding-left:12px; border-left:2px solid var(--border); margin-top:8px">
                                    ${allExercises.map((ex, idx) => `
                                        <div style="margin-bottom:6px; font-size:0.85rem">
                                            <div style="font-weight:600; color:var(--text)">${idx + 1}. ${ex.name}</div>
                                            <div style="font-size:0.75rem; color:var(--muted); margin-top:2px">
                                                ${ex.dayName} · ${ex.sets} ${ex.sets === 1 ? 'set' : 'sets'}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            }
        }

        // Store friendId for delete and copy operations
        $('#friendStatsDialog').dataset.friendId = friendId;

        // Store friend sessions for chart (as string for data attribute)
        const friendSessionsStr = JSON.stringify(friendSessions);
        $('#friendStatsDialog').dataset.friendSessions = friendSessionsStr;

        // Draw friend's chart
        setTimeout(() => {
            drawFriendChart(friendSessions);
        }, 100); // Small delay to ensure canvas is rendered

        // Add event listeners for chart controls
        const chartTypeSelect = $('#friendChartType');
        const metricSelect = $('#friendChartMetric');

        if (chartTypeSelect) {
            chartTypeSelect.onchange = () => {
                const sessions = JSON.parse($('#friendStatsDialog').dataset.friendSessions || '[]');
                drawFriendChart(sessions);
            };
        }

        if (metricSelect) {
            metricSelect.onchange = () => {
                const sessions = JSON.parse($('#friendStatsDialog').dataset.friendSessions || '[]');
                drawFriendChart(sessions);
            };
        }

        $('#friendStatsDialog').showModal();
    }

    // Function to calculate weekly data for friend's sessions
    function weeklyDataFriend(sessions, period = 4, filter = 'all', metric = 'volume') {
        const weeks = [], values = [];
        const base = startOfWeek();

        for (let i = period - 1; i >= 0; i--) {
            const ws = addDays(base, -i * 7), we = addDays(ws, 6);
            const subset = sessions.filter(s => {
                if (!s.date) return false;
                const d = new Date(s.date);
                return d >= ws && d <= we;
            });

            let value = 0;
            if (metric === 'volume') {
                subset.forEach(s => (s.exercises || []).forEach(e => {
                    if (filter === 'all' || e.name === filter) {
                        (e.sets || []).forEach(st => value += (parseFloat(st.kg) || 0) * parseReps(st.reps));
                    }
                }));
            } else if (metric === 'rir') {
                let rirSum = 0, rirCount = 0;
                subset.forEach(s => (s.exercises || []).forEach(e => {
                    if (filter === 'all' || e.name === filter) {
                        (e.sets || []).forEach(st => {
                            const rir = parseRIR(st.rir);
                            if (rir > 0) {
                                rirSum += rir;
                                rirCount++;
                            }
                        });
                    }
                }));
                value = rirCount ? (rirSum / rirCount) : 0;
            } else if (metric === 'weight') {
                subset.forEach(s => (s.exercises || []).forEach(e => {
                    if (filter === 'all' || e.name === filter) {
                        (e.sets || []).forEach(st => {
                            const kg = parseFloat(st.kg) || 0;
                            if (kg > 0) value = Math.max(value, kg);
                        });
                    }
                }));
            }

            weeks.push(`Sem ${period - i}`);
            values.push(value);
        }
        return { weeks, values };
    }

    // Function to draw friend's chart
    function drawFriendChart(friendSessions) {
        const canvas = $('#friendProgressChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas for high DPI
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const w = rect.width;
        const h = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        // Get chart type and metric
        const chartTypeSelect = $('#friendChartType');
        const metricSelect = $('#friendChartMetric');
        const chartType = chartTypeSelect ? chartTypeSelect.value : 'pie';
        const metric = metricSelect ? metricSelect.value : 'volume';

        // Get colors from theme
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const barColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#5ea9ff';
        const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff6b9d';
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        const gridColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

        const padding = { t: 30, r: 20, b: 40, l: 50 };

        // Calculate weekly data
        const period = 4; // 4 weeks
        const { weeks, values } = weeklyDataFriend(friendSessions, period, 'all', metric);

        if (chartType === 'pie') {
            drawPieChart(ctx, canvas, weeks, values, metric, barColor, textColor, gridColor);
        } else {
            drawBarChart(ctx, canvas, weeks, values, metric, barColor, lineColor, gridColor, textColor, padding, w, h);
        }
    }

    // Bind Social Events
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'btnSendRequest') {
            e.preventDefault();
            await sendFriendRequest();
        }

        if (e.target.classList.contains('js-accept-request')) {
            e.preventDefault();
            const id = e.target.dataset.id;
            const { error } = await supabase
                .from(TABLE_FRIEND_REQUESTS)
                .update({ status: 'accepted' })
                .eq('id', id);

            if (!error) {
                toast('Solicitud aceptada', 'ok');
                loadSocialData();
            } else {
                toast('Error al aceptar solicitud', 'err');
            }
        }

        if (e.target.classList.contains('js-decline-request')) {
            e.preventDefault();
            const id = e.target.dataset.id;
            const { error } = await supabase
                .from(TABLE_FRIEND_REQUESTS)
                .update({ status: 'declined' })
                .eq('id', id);

            if (!error) {
                toast('Solicitud rechazada', 'ok');
                loadSocialData();
            } else {
                toast('Error al rechazar solicitud', 'err');
            }
        }

        // Delete friend
        if (e.target.id === 'btnDeleteFriend' || e.target.closest('#btnDeleteFriend')) {
            e.preventDefault();
            const friendId = $('#friendStatsDialog')?.dataset.friendId;
            if (!friendId) return;

            if (!confirm('¿Estás seguro de que quieres eliminar a este amigo?')) {
                return;
            }

            const user = await supabaseService.getCurrentUser();
            if (!user) return;

            // Delete friendship (both directions) - use proper PostgREST syntax
            try {
                // Delete where user is sender and friend is receiver
                const { error: error1 } = await supabase
                    .from(TABLE_FRIEND_REQUESTS)
                    .delete()
                    .eq('sender_id', user.id)
                    .eq('receiver_id', friendId)
                    .eq('status', 'accepted');

                // Delete where friend is sender and user is receiver
                const { error: error2 } = await supabase
                    .from(TABLE_FRIEND_REQUESTS)
                    .delete()
                    .eq('sender_id', friendId)
                    .eq('receiver_id', user.id)
                    .eq('status', 'accepted');

                if (error1 || error2) {
                    console.error('Error deleting friend:', error1 || error2);
                    toast('Error al eliminar amigo', 'err');
                } else {
                    toast('Amigo eliminado', 'ok');
                    $('#friendStatsDialog').close();
                    loadSocialData();
                }
            } catch (err) {
                console.error('Error deleting friend:', err);
                toast('Error al eliminar amigo', 'err');
            }
        }

        // Copy friend's routine
        if (e.target.classList.contains('js-copy-friend-routine') || e.target.closest('.js-copy-friend-routine')) {
            e.preventDefault();
            const routineId = e.target.closest('.js-copy-friend-routine')?.dataset.routineId || e.target.dataset.routineId;
            if (!routineId) return;

            const friendId = $('#friendStatsDialog')?.dataset.friendId;
            if (!friendId) return;

            // Fetch friend's user_data to get the routine
            const { data: friendData } = await supabase
                .from('user_data')
                .select('data')
                .eq('user_id', friendId)
                .maybeSingle();

            const friendUserData = friendData?.data || {};
            const friendRoutines = friendUserData.routines || [];
            const routineToCopy = friendRoutines.find(r => r.id === routineId);

            if (!routineToCopy) {
                toast('Rutina no encontrada', 'err');
                return;
            }

            // Create a copy of the routine with new ID
            const newRoutine = {
                ...routineToCopy,
                id: uuid(),
                name: `${routineToCopy.name} (Copiada)`,
                exercises: routineToCopy.exercises ? JSON.parse(JSON.stringify(routineToCopy.exercises)) : []
            };

            // Add to user's routines
            if (!app.routines) app.routines = [];
            app.routines.push(newRoutine);
            save();

            toast('Rutina copiada exitosamente', 'ok');

            // Refresh the dialog to show updated list
            const routinesContainer = $('#friendRoutinesList');
            if (routinesContainer) {
                const routineElement = e.target.closest('.routine-created__item');
                if (routineElement) {
                    routineElement.style.opacity = '0.5';
                    const copyBtn = routineElement.querySelector('.js-copy-friend-routine');
                    if (copyBtn) {
                        copyBtn.textContent = '✓ Copiada';
                        copyBtn.disabled = true;
                    }
                }
            }
        }
    });
    // Initialize Event Delegation
    setupDiaryEventDelegation();
});