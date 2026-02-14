// פונקציות עזר
const utils = {
    // בחירה אקראית משוקללת
    weightedRandom(items, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        
        for (let i = 0; i < items.length; i++) {
            if (random < weights[i]) return items[i];
            random -= weights[i];
        }
        return items[0];
    },

    // קבלת זמן מעוצב
    getFormattedTime() {
        return new Date().toLocaleTimeString('he-IL');
    },

    // חישוב מרחק בין שתי נקודות
    calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // חישוב זווית
    calculateAngle(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    },

    // קבלת מדליית דירוג
    getRankMedal(index) {
        const medals = ['🥇', '🥈', '🥉'];
        return medals[index] || (index + 1);
    },

    // בדיקת תקינות מספר
    isValidIndex(index, min, max) {
        return !isNaN(index) && index >= min && index < max;
    },

    // יצירת מפתח ייחודי למשתתף
    getParticipantKey(country, index, isCivilWar) {
        return isCivilWar ? `${country}-סיעה-${index + 1}` : country;
    },

    // קבלת שם תצוגה למשתתף
    getDisplayName(participantKey, isCivilWar) {
        return participantKey;
    }
};