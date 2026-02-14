// לוגיקת משחק ראשי
const game = {
    currentWar: null,
    attackLines: [],
    warTurns: 0,
    autoBattleInterval: null,
    totalTurnsAllWars: 0,
    participantCount: 2,

    init() {
        ui.init();
        this.initializeParticipants();
        ui.populateSelects();
        ui.renderMap();
        ui.updateRankings();
        ui.updateStats();
        ui.addLog('המשחק מוכן! ארגן מלחמה עם 2 או יותר משתתפים');
    },

    initializeParticipants() {
        for (let i = 1; i <= 2; i++) {
            const item = ui.createParticipantItem(i);
            ui.elements.participantsList.appendChild(item);
        }
        ui.populateSelects();
    },

    addParticipant() {
        if (this.participantCount >= CONST.MAX_PARTICIPANTS) {
            alert(`מקסימום ${CONST.MAX_PARTICIPANTS} משתתפים במלחמה`);
            return;
        }
        
        this.participantCount++;
        const item = ui.createParticipantItem(this.participantCount);
        ui.elements.participantsList.appendChild(item);
        ui.populateSelects();
    },

    removeParticipant(num) {
        if (this.participantCount <= CONST.MIN_PARTICIPANTS) {
            alert(`צריכים לפחות ${CONST.MIN_PARTICIPANTS} משתתפים במלחמה`);
            return;
        }
        
        const item = document.getElementById(`participant-item-${num}`);
        if (item) {
            item.remove();
            this.participantCount--;
            this.renumberParticipants();
        }
    },

    renumberParticipants() {
        const items = document.querySelectorAll('.participant-item');
        items.forEach((item, index) => {
            const label = item.querySelector('label');
            if (label) label.textContent = `משתתף ${index + 1}:`;
        });
    },

    startWar() {
        const participants = this.collectParticipants();
        
        if (participants.length < CONST.MIN_PARTICIPANTS) {
            alert(`צריך לפחות ${CONST.MIN_PARTICIPANTS} משתתפים במלחמה`);
            return;
        }
        
        const allowCivilWar = ui.elements.allowCivilWar.checked;
        const uniqueParticipants = [...new Set(participants)];
        
        if (!allowCivilWar && uniqueParticipants.length !== participants.length) {
            alert('בחרת את אותה מדינה פעמיים! אפשר מלחמות אזרחים בהגדרות אם אתה רוצה');
            return;
        }
        
        const isCivilWar = uniqueParticipants.length === 1;
        const participantData = this.createParticipantData(participants, isCivilWar);
        
        this.currentWar = {
            participants: participantData,
            isCivilWar: isCivilWar,
            activeCount: participants.length
        };
        
        this.warTurns = 0;
        this.logWarStart(participants, uniqueParticipants, isCivilWar);
        
        ui.elements.warControls.style.display = 'block';
        war.createControlButtons();
        ui.updateWarStatus();
        ui.updateRankings();
        ui.updateStats();
        ui.renderMap();
        
        if (ui.elements.autoBattle.checked) {
            this.startAutoBattle();
            ui.elements.autoBattleIndicator.style.display = 'block';
        }
    },

    collectParticipants() {
        const participants = [];
        for (let i = 1; i <= this.participantCount; i++) {
            const select = document.getElementById(`participant${i}`);
            if (select && select.value) {
                participants.push(select.value);
            }
        }
        return participants;
    },

    createParticipantData(participants, isCivilWar) {
        const participantData = {};
        participants.forEach((country, index) => {
            const key = utils.getParticipantKey(country, index, isCivilWar);
            participantData[key] = {
                country: country,
                strength: COUNTRIES[country].power,
                morale: 100,
                isActive: true,
                originalCountry: country
            };
        });
        return participantData;
    },

    logWarStart(participants, uniqueParticipants, isCivilWar) {
        if (isCivilWar) {
            ui.addLog(`💥 מלחמת אזרחים פרצה ב${uniqueParticipants[0]}! ${participants.length} סיעות נלחמות על השליטה!`, true);
        } else {
            const countryList = participants.map(c => COUNTRIES[c].flag + ' ' + c).join(', ');
            ui.addLog(`🔥 מלחמה רב-משתתפית החלה! משתתפים: ${countryList}`);
        }
    },

    toggleAutoBattle() {
        const enabled = ui.elements.autoBattle.checked;
        
        if (enabled && this.currentWar) {
            this.startAutoBattle();
            ui.elements.autoBattleIndicator.style.display = 'block';
        } else {
            this.stopAutoBattle();
            ui.elements.autoBattleIndicator.style.display = 'none';
        }
    },

    startAutoBattle() {
        if (!this.currentWar) return;
        
        const speed = parseInt(ui.elements.battleSpeed.value);
        
        this.autoBattleInterval = setInterval(() => {
            if (!this.currentWar || this.currentWar.activeCount <= 1) {
                this.stopAutoBattle();
                return;
            }
            
            const activeKeys = Object.keys(this.currentWar.participants).filter(key => 
                this.currentWar.participants[key].isActive
            );
            
            if (activeKeys.length > 0) {
                const randomKey = activeKeys[Math.floor(Math.random() * activeKeys.length)];
                const actions = ['attack', 'defend', 'retreat'];
                const weights = [
                    CONST.ACTION_WEIGHTS.attack,
                    CONST.ACTION_WEIGHTS.defend,
                    CONST.ACTION_WEIGHTS.retreat
                ];
                const action = utils.weightedRandom(actions, weights);
                
                war.performAction(randomKey, action, true);
            }
        }, speed);
    },

    stopAutoBattle() {
        if (this.autoBattleInterval) {
            clearInterval(this.autoBattleInterval);
            this.autoBattleInterval = null;
        }
        ui.elements.autoBattleIndicator.style.display = 'none';
    }
};

// אתחול המשחק
window.addEventListener('DOMContentLoaded', () => {
    game.init();
});