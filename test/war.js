// לוגיקת מלחמה
const war = {
    performAction(participantKey, action, isAuto = false) {
        if (!game.currentWar || !game.currentWar.participants[participantKey] || 
            !game.currentWar.participants[participantKey].isActive) return;

        game.warTurns++;
        game.totalTurnsAllWars++;
        
        const participant = game.currentWar.participants[participantKey];
        const displayName = utils.getDisplayName(participantKey, game.currentWar.isCivilWar);
        const flag = COUNTRIES[participant.country].flag;
        
        const opponents = this.getOpponents(participantKey);
        if (opponents.length === 0) {
            this.endWar(participantKey);
            return;
        }
        
        const targetKey = opponents[Math.floor(Math.random() * opponents.length)];
        const target = game.currentWar.participants[targetKey];
        const targetDisplayName = utils.getDisplayName(targetKey, game.currentWar.isCivilWar);
        const targetFlag = COUNTRIES[target.country].flag;
        
        const powerRatio = participant.strength / target.strength;
        this.executeAction(action, participant, target, displayName, targetDisplayName, flag, targetFlag, powerRatio);

        this.checkParticipantElimination();
        
        if (!isAuto && game.currentWar.activeCount > 1) {
            setTimeout(() => this.aiParticipantsResponse(participantKey), 500);
        }
        
        this.checkWarEnd();
        ui.updateWarStatus();
        ui.updateRankings();
        ui.updateStats();
    },

    executeAction(action, participant, target, displayName, targetDisplayName, flag, targetFlag, powerRatio) {
        let damage = 0;
        let counterDamage = 0;

        switch(action) {
            case 'attack':
                damage = 5 + Math.random() * 10 * powerRatio;
                counterDamage = 3 + Math.random() * 8 * (1/powerRatio);
                target.strength -= damage;
                participant.strength -= counterDamage;
                ui.addLog(`⚔️ ${flag} ${displayName} תוקף את ${targetFlag} ${targetDisplayName}! נגרם ${damage.toFixed(1)} נזק, וספג ${counterDamage.toFixed(1)} נזק בתגובה`, game.currentWar.isCivilWar);
                break;

            case 'defend':
                counterDamage = 2 + Math.random() * 5 * (1/powerRatio);
                participant.strength -= counterDamage;
                participant.morale += 5;
                ui.addLog(`🛡️ ${flag} ${displayName} מתמקד בהגנה. ${targetFlag} ${targetDisplayName} מנצל ותוקף, נגרם ${counterDamage.toFixed(1)} נזק`, game.currentWar.isCivilWar);
                break;

            case 'retreat':
                damage = 8 + Math.random() * 12 * (1/powerRatio);
                participant.strength -= damage;
                participant.morale -= 15;
                ui.addLog(`🏃 ${flag} ${displayName} נסוג! ${targetFlag} ${targetDisplayName} רודף ותוקף, נגרם ${damage.toFixed(1)} נזק חמור`, game.currentWar.isCivilWar);
                break;
        }
    },

    getOpponents(participantKey) {
        return Object.keys(game.currentWar.participants).filter(key => 
            key !== participantKey && game.currentWar.participants[key].isActive
        );
    },

    checkParticipantElimination() {
        Object.keys(game.currentWar.participants).forEach(key => {
            const participant = game.currentWar.participants[key];
            if (participant.isActive && (participant.strength <= 0 || participant.morale <= 0)) {
                participant.isActive = false;
                game.currentWar.activeCount--;
                const displayName = utils.getDisplayName(key, game.currentWar.isCivilWar);
                const flag = COUNTRIES[participant.country].flag;
                ui.addLog(`💀 ${flag} ${displayName} הובס ויצא מהמלחמה!`, game.currentWar.isCivilWar);
            }
        });
    },

    aiParticipantsResponse(skipKey) {
        const activeParticipants = Object.keys(game.currentWar.participants).filter(key => 
            key !== skipKey && game.currentWar.participants[key].isActive
        );
        
        activeParticipants.forEach((key, index) => {
            setTimeout(() => {
                const actions = ['attack', 'defend', 'retreat'];
                const weights = [
                    CONST.ACTION_WEIGHTS.attack,
                    CONST.ACTION_WEIGHTS.defend,
                    CONST.ACTION_WEIGHTS.retreat
                ];
                const action = utils.weightedRandom(actions, weights);
                this.performAction(key, action, true);
            }, index * 300);
        });
    },

    checkWarEnd() {
        if (!game.currentWar) return;

        if (game.currentWar.activeCount <= 1) {
            const winner = Object.entries(game.currentWar.participants).find(([key, p]) => p.isActive);
            if (winner) {
                this.endWar(winner[0]);
            }
        }
    },

    endWar(winnerKey) {
        const winner = game.currentWar.participants[winnerKey];
        const displayName = utils.getDisplayName(winnerKey, game.currentWar.isCivilWar);
        const flag = COUNTRIES[winner.country].flag;
        
        if (game.currentWar.isCivilWar) {
            ui.addLog(`🏆 ${flag} ${displayName} ניצח במלחמת האזרחים לאחר ${game.warTurns} סיבובים!`, true);
            alert(`🏆 ${displayName} ניצח במלחמת האזרחים!\n\nהמלחמה נמשכה ${game.warTurns} סיבובים`);
        } else {
            ui.addLog(`🏆 ${flag} ${displayName} ניצח במלחמה הרב-משתתפית לאחר ${game.warTurns} סיבובים!`);
            alert(`🏆 ${displayName} ניצח במלחמה!\n\nהמלחמה נמשכה ${game.warTurns} סיבובים`);
        }
        
        game.stopAutoBattle();
        game.currentWar = null;
        ui.elements.warControls.style.display = 'none';
        ui.updateRankings();
        ui.updateStats();
        ui.renderMap();
    },

    createControlButtons() {
        const container = ui.elements.warControlButtons;
        container.innerHTML = '';
        
        const activeParticipants = Object.entries(game.currentWar.participants).filter(([key, p]) => p.isActive);
        const participantCount = activeParticipants.length;
        
        if (participantCount > 5) {
            this.createCompactButtons(container, activeParticipants);
        } else {
            this.createFullButtons(container, activeParticipants);
        }
    },

    createCompactButtons(container, activeParticipants) {
        activeParticipants.forEach(([participantKey, participant]) => {
            const displayName = utils.getDisplayName(participantKey, game.currentWar.isCivilWar);
            const flag = COUNTRIES[participant.country].flag;
            
            const buttonGroup = document.createElement('div');
            buttonGroup.style.marginBottom = '15px';
            buttonGroup.innerHTML = `
                <div style="text-align: center; font-weight: bold; margin-bottom: 5px;">
                    ${flag} ${displayName}
                </div>
                <button class="attack" onclick="war.performAction('${participantKey}', 'attack')">⚔️ התקף</button>
                <button class="defend" onclick="war.performAction('${participantKey}', 'defend')">🛡️ הגן</button>
                <button class="retreat" onclick="war.performAction('${participantKey}', 'retreat')">🏃 נסוג</button>
            `;
            container.appendChild(buttonGroup);
        });
        
        const generalButtons = document.createElement('div');
        generalButtons.style.marginTop = '20px';
        generalButtons.style.paddingTop = '15px';
        generalButtons.style.borderTop = '2px solid rgba(255, 255, 255, 0.3)';
        generalButtons.innerHTML = `
            <button class="peace" onclick="war.proposePeace()" style="width: 48%; display: inline-block; margin: 1%;">☮️ הצע שלום</button>
            <button class="peace" onclick="war.surrender()" style="width: 48%; display: inline-block; margin: 1%;">🏳️ כניעה</button>
        `;
        container.appendChild(generalButtons);
    },

    createFullButtons(container, activeParticipants) {
        activeParticipants.forEach(([participantKey, participant]) => {
            const displayName = utils.getDisplayName(participantKey, game.currentWar.isCivilWar);
            const flag = COUNTRIES[participant.country].flag;
            
            const buttonGroup = document.createElement('div');
            buttonGroup.style.marginBottom = '15px';
            buttonGroup.innerHTML = `
                <div style="text-align: center; font-weight: bold; margin-bottom: 5px;">
                    ${flag} ${displayName}
                </div>
                <button class="attack" onclick="war.performAction('${participantKey}', 'attack')">⚔️ התקף</button>
                <button class="defend" onclick="war.performAction('${participantKey}', 'defend')">🛡️ הגן</button>
                <button class="retreat" onclick="war.performAction('${participantKey}', 'retreat')">🏃 נסוג</button>
                <button class="peace" onclick="war.proposePeaceFor('${participantKey}')">☮️ שלום</button>
                <button class="peace" onclick="war.surrenderFor('${participantKey}')">🏳️ כניעה</button>
            `;
            container.appendChild(buttonGroup);
        });
    },

    proposePeaceFor(participantKey) {
        if (!game.currentWar || !game.currentWar.participants[participantKey] || 
            !game.currentWar.participants[participantKey].isActive) {
            alert('משתתף זה אינו פעיל במלחמה');
            return;
        }

        const participant = game.currentWar.participants[participantKey];
        const displayName = utils.getDisplayName(participantKey, game.currentWar.isCivilWar);
        const flag = COUNTRIES[participant.country].flag;

        if (Math.random() < CONST.PEACE_CHANCE) {
            ui.addLog(`🕊️ ${flag} ${displayName} הציע שלום והצעה התקבלה! ${displayName} יוצא מהמלחמה`, game.currentWar.isCivilWar);
            participant.isActive = false;
            game.currentWar.activeCount--;
            this.createControlButtons();
            ui.updateWarStatus();
            ui.renderMap();
            this.checkWarEnd();
        } else {
            ui.addLog(`❌ ${flag} ${displayName} הציע שלום אך ההצעה נדחתה! הלחימה נמשכת`, game.currentWar.isCivilWar);
        }
    },

    proposePeace() {
        if (!game.currentWar) {
            alert('אין מלחמה פעילה');
            return;
        }

        const activeParticipants = Object.entries(game.currentWar.participants)
            .filter(([key, p]) => p.isActive);
        
        if (activeParticipants.length === 0) {
            alert('אין משתתפים פעילים במלחמה');
            return;
        }

        const countryKey = prompt(`בחר מדינה שתציע שלום (רשום את המספר):\n\n${
            activeParticipants.map(([key, p], idx) => {
                const displayName = utils.getDisplayName(key, game.currentWar.isCivilWar);
                const flag = COUNTRIES[p.country].flag;
                return `${idx + 1}. ${flag} ${displayName}`;
            }).join('\n')
        }`);

        if (!countryKey) return;

        const index = parseInt(countryKey) - 1;
        if (!utils.isValidIndex(index, 0, activeParticipants.length)) {
            alert('בחירה לא חוקית');
            return;
        }

        const [selectedKey, selectedParticipant] = activeParticipants[index];
        this.proposePeaceFor(selectedKey);
    },

    surrenderFor(participantKey) {
        if (!game.currentWar || !game.currentWar.participants[participantKey] || 
            !game.currentWar.participants[participantKey].isActive) {
            alert('משתתף זה אינו פעיל במלחמה');
            return;
        }

        const participant = game.currentWar.participants[participantKey];
        const displayName = utils.getDisplayName(participantKey, game.currentWar.isCivilWar);
        const flag = COUNTRIES[participant.country].flag;

        if (confirm(`האם אתה בטוח ש-${displayName} יכריז על כניעה?`)) {
            ui.addLog(`🏳️ ${flag} ${displayName} הכריז על כניעה ויוצא מהמלחמה!`, game.currentWar.isCivilWar);
            participant.isActive = false;
            game.currentWar.activeCount--;
            this.createControlButtons();
            ui.updateWarStatus();
            ui.renderMap();
            this.checkWarEnd();
        }
    },

    surrender() {
        if (!game.currentWar) {
            alert('אין מלחמה פעילה');
            return;
        }

        const activeParticipants = Object.entries(game.currentWar.participants)
            .filter(([key, p]) => p.isActive);
        
        if (activeParticipants.length === 0) {
            alert('אין משתתפים פעילים במלחמה');
            return;
        }

        const countryKey = prompt(`בחר מדינה שתכריז על כניעה (רשום את המספר):\n\n${
            activeParticipants.map(([key, p], idx) => {
                const displayName = utils.getDisplayName(key, game.currentWar.isCivilWar);
                const flag = COUNTRIES[p.country].flag;
                return `${idx + 1}. ${flag} ${displayName}`;
            }).join('\n')
        }`);

        if (!countryKey) return;

        const index = parseInt(countryKey) - 1;
        if (!utils.isValidIndex(index, 0, activeParticipants.length)) {
            alert('בחירה לא חוקית');
            return;
        }

        const [selectedKey, selectedParticipant] = activeParticipants[index];
        this.surrenderFor(selectedKey);
    }
};