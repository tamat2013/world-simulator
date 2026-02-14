// נתוני מדינות
const COUNTRIES = {
    'ארה"ב': { power: 100, flag: '🇺🇸', x: 15, y: 35, color: '#1e40af' },
    'סין': { power: 95, flag: '🇨🇳', x: 75, y: 40, color: '#dc2626' },
    'רוסיה': { power: 90, flag: '🇷🇺', x: 60, y: 25, color: '#16a34a' },
    'הודו': { power: 75, flag: '🇮🇳', x: 70, y: 50, color: '#ea580c' },
    'בריטניה': { power: 70, flag: '🇬🇧', x: 45, y: 28, color: '#7c3aed' },
    'צרפת': { power: 68, flag: '🇫🇷', x: 47, y: 32, color: '#0891b2' },
    'גרמניה': { power: 67, flag: '🇩🇪', x: 50, y: 30, color: '#4338ca' },
    'יפן': { power: 65, flag: '🇯🇵', x: 85, y: 38, color: '#be123c' },
    'דרום קוריאה': { power: 60, flag: '🇰🇷', x: 82, y: 42, color: '#059669' },
    'איטליה': { power: 55, flag: '🇮🇹', x: 50, y: 36, color: '#0284c7' },
    'טורקיה': { power: 53, flag: '🇹🇷', x: 55, y: 38, color: '#dc2626' },
    'ברזיל': { power: 50, flag: '🇧🇷', x: 30, y: 65, color: '#16a34a' },
    'ישראל': { power: 48, flag: '🇮🇱', x: 54, y: 45, color: '#2563eb' },
    'איראן': { power: 45, flag: '🇮🇷', x: 62, y: 43, color: '#15803d' },
    'מצרים': { power: 42, flag: '🇪🇬', x: 53, y: 48, color: '#b91c1c' },
    'ספרד': { power: 40, flag: '🇪🇸', x: 44, y: 38, color: '#eab308' },
    'אוסטרליה': { power: 38, flag: '🇦🇺', x: 82, y: 75, color: '#0891b2' },
    'קנדה': { power: 36, flag: '🇨🇦', x: 18, y: 22, color: '#dc2626' },
    'ערב הסעודית': { power: 35, flag: '🇸🇦', x: 58, y: 48, color: '#16a34a' },
    'מקסיקו': { power: 32, flag: '🇲🇽', x: 12, y: 48, color: '#15803d' },
    'ארגנטינה': { power: 30, flag: '🇦🇷', x: 28, y: 78, color: '#0891b2' },
    'דרום אפריקה': { power: 28, flag: '🇿🇦', x: 52, y: 75, color: '#eab308' },
    'אינדונזיה': { power: 25, flag: '🇮🇩', x: 78, y: 62, color: '#dc2626' },
    'פקיסטן': { power: 23, flag: '🇵🇰', x: 68, y: 45, color: '#16a34a' },
    'ניגריה': { power: 20, flag: '🇳🇬', x: 50, y: 60, color: '#15803d' },
    'וונצואלה': { power: 18, flag: '🇻🇪', x: 25, y: 55, color: '#0891b2' }
};

// קבועים
const CONST = {
    MAX_PARTICIPANTS: 6,
    MIN_PARTICIPANTS: 2,
    TOTAL_COUNTRIES: 24,
    PEACE_CHANCE: 0.5,
    ACTION_WEIGHTS: {
        attack: 0.6,
        defend: 0.3,
        retreat: 0.1
    }
};
