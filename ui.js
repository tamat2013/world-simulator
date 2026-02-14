// ניהול ממשק משתמש
const ui = {
    elements: {},

    init() {
        this.cacheElements();
        this.attachEventListeners();
    },

    cacheElements() {
        this.elements = {
            participantsList: document.getElementById('participantsList'),
            warControls: document.getElementById('warControls'),
            warControlButtons: document.getElementById('warControlButtons'),
            warStatus: document.getElementById('warStatus'),
            worldMap: document.getElementById('worldMap'),
            eventLog: document.getElementById('eventLog'),
            countryInfo: document.getElementById('countryInfo'),
            rankingsBody: document.getElementById('rankingsBody'),
            tooltip: document.getElementById('tooltip'),
            activeWars: document.getElementById('activeWars'),
            totalTurns: document.getElementById('totalTurns'),
            countriesAtWar: document.getElementById('countriesAtWar'),
            countriesAtPeace: document.getElementById('countriesAtPeace'),
            battleSpeed: document.getElementById('battleSpeed'),
            speedDisplay: document.getElementById('speedDisplay'),
            autoBattle: document.getElementById('autoBattle'),
            autoBattleIndicator: document.getElementById('autoBattleIndicator'),
            allowCivilWar: document.getElementById('allowCivilWar'),
            animatedLines: document.getElementById('animatedLines')
        };
    },

    attachEventListeners() {
        this.elements.battleSpeed.addEventListener('input', (e) => {
            const speed = e.target.value / 1000;
            this.elements.speedDisplay.textContent = speed.toFixed(1) + ' שניות';
            if (game.autoBattleInterval) {
                game.stopAutoBattle();
                game.startAutoBattle();
            }
        });

        this.elements.autoBattle.addEventListener('change', () => {
            game.toggleAutoBattle();
        });

        this.elements.animatedLines.addEventListener('change', () => {
            this.renderMap();
        });
    },

    populateSelects() {
        for (let i = 1; i <= CONST.MAX_PARTICIPANTS; i++) {
            const select = document.getElementById(`participant${i}`);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '';
                Object.keys(COUNTRIES).sort().forEach(country => {
                    const option = new Option(
                        `${COUNTRIES[country].flag} ${country} (כוח: ${COUNTRIES[country].power})`,
                        country
                    );
                    select.add(option);
                });
                if (currentValue && COUNTRIES[currentValue]) {
                    select.value = currentValue;
                }
            }
        }
    },

    createParticipantItem(num) {
        const div = document.createElement('div');
        div.className = 'participant-item';
        div.id = `participant-item-${num}`;
        div.innerHTML = `
            <label style="flex: 1;">משתתף ${num}:</label>
            <select id="participant${num}" style="width: auto; flex: 2;"></select>
            ${num > 2 ? `<button class="remove-participant" onclick="game.removeParticipant(${num})">✖</button>` : ''}
        `;
        return div;
    },

    renderMap() {
        const map = this.elements.worldMap;
        map.innerHTML = '';
        game.attackLines = [];

        Object.entries(COUNTRIES).forEach(([name, data]) => {
            const marker = this.createCountryMarker(name, data);
            map.appendChild(marker);
        });

        this.renderAttackLines();
    },

    createCountryMarker(name, data) {
        const marker = document.createElement('div');
        marker.className = 'country-marker';
        marker.style.left = `${data.x}%`;
        marker.style.top = `${data.y}%`;
        marker.style.background = data.color;
        marker.innerHTML = data.flag;
        marker.title = name;
        
        marker.addEventListener('click', () => this.showCountryInfo(name));
        marker.addEventListener('mouseenter', (e) => this.showTooltip(e, name));
        marker.addEventListener('mouseleave', () => this.hideTooltip());

        if (game.currentWar) {
            const isInWar = Object.values(game.currentWar.participants).some(p => 
                p.country === name && p.isActive
            );
            if (isInWar) {
                marker.classList.add(game.currentWar.isCivilWar ? 'civil-war' : 'at-war');
            }
        }

        return marker;
    },

    renderAttackLines() {
        if (!game.currentWar || !this.elements.animatedLines.checked) return;

        const map = this.elements.worldMap;
        const mapRect = map.getBoundingClientRect();
        
        if (game.currentWar.isCivilWar) {
            this.renderCivilWarLines(map, mapRect);
        } else {
            this.renderRegularWarLines(map, mapRect);
        }
    },

    renderCivilWarLines(map, mapRect) {
        const activeParticipants = Object.values(game.currentWar.participants).filter(p => p.isActive);
        if (activeParticipants.length === 0) return;

        const country = activeParticipants[0].country;
        const countryData = COUNTRIES[country];
        const centerX = (countryData.x / 100) * mapRect.width;
        const centerY = (countryData.y / 100) * mapRect.height;
        
        for (let angle = 0; angle < 360; angle += 45) {
            const rad = (angle * Math.PI) / 180;
            const length = 80;
            
            const line = document.createElement('div');
            line.className = 'attack-line civil-war-line';
            line.style.position = 'absolute';
            line.style.left = centerX + 'px';
            line.style.top = centerY + 'px';
            line.style.width = length + 'px';
            line.style.height = '3px';
            line.style.transformOrigin = '0 50%';
            line.style.transform = `rotate(${angle}deg)`;
            line.style.animation = 'attackPulse 0.8s infinite';
            
            map.appendChild(line);
            game.attackLines.push(line);
        }
    },

    renderRegularWarLines(map, mapRect) {
        const activeParticipants = Object.entries(game.currentWar.participants)
            .filter(([key, p]) => p.isActive)
            .map(([key, p]) => ({ key, country: p.country }));
        
        for (let i = 0; i < activeParticipants.length; i++) {
            for (let j = i + 1; j < activeParticipants.length; j++) {
                const country1 = COUNTRIES[activeParticipants[i].country];
                const country2 = COUNTRIES[activeParticipants[j].country];
                
                const x1 = (country1.x / 100) * mapRect.width;
                const y1 = (country1.y / 100) * mapRect.height;
                const x2 = (country2.x / 100) * mapRect.width;
                const y2 = (country2.y / 100) * mapRect.height;
                
                const distance = utils.calculateDistance(x1, y1, x2, y2);
                const angle = utils.calculateAngle(x1, y1, x2, y2);
                
                const line = document.createElement('div');
                line.className = 'attack-line';
                line.style.position = 'absolute';
                line.style.left = x1 + 'px';
                line.style.top = y1 + 'px';
                line.style.width = distance + 'px';
                line.style.height = '3px';
                line.style.transformOrigin = '0 50%';
                line.style.transform = `rotate(${angle}deg)`;
                line.style.animation = 'attackPulse 1s infinite';
                
                map.appendChild(line);
                game.attackLines.push(line);
            }
        }
    },

    showTooltip(e, country) {
        const data = COUNTRIES[country];
        this.elements.tooltip.innerHTML = `<strong>${data.flag} ${country}</strong><br>כוח: ${data.power}/100`;
        this.elements.tooltip.style.display = 'block';
        this.elements.tooltip.style.left = e.pageX + 10 + 'px';
        this.elements.tooltip.style.top = e.pageY + 10 + 'px';
    },

    hideTooltip() {
        this.elements.tooltip.style.display = 'none';
    },

    showCountryInfo(country) {
        const data = COUNTRIES[country];
        let status = 'שלווה';
        
        if (game.currentWar) {
            const isInWar = Object.values(game.currentWar.participants).some(p => 
                p.country === country && p.isActive
            );
            if (isInWar) {
                status = game.currentWar.isCivilWar ? 'מלחמת אזרחים!' : 'במלחמה';
            }
        }
        
        this.elements.countryInfo.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">${data.flag}</div>
            <strong>${country}</strong><br>
            <strong>כוח צבאי:</strong> ${data.power}/100<br>
            <strong>סטטוס:</strong> ${status}
        `;
    },

    addLog(message, isCivilWar = false) {
        const entry = document.createElement('div');
        entry.className = 'log-entry' + (isCivilWar ? ' civil-war' : '');
        entry.innerHTML = `<strong>[${utils.getFormattedTime()}]</strong> ${message}`;
        this.elements.eventLog.insertBefore(entry, this.elements.eventLog.firstChild);
    },

    updateRankings() {
        const tbody = this.elements.rankingsBody;
        tbody.innerHTML = '';
        
        const sorted = Object.entries(COUNTRIES).sort((a, b) => b[1].power - a[1].power);
        
        sorted.forEach(([name, data], index) => {
            const row = tbody.insertRow();
            
            let status = '🕊️';
            if (game.currentWar) {
                const isInWar = Object.values(game.currentWar.participants).some(p => 
                    p.country === name && p.isActive
                );
                if (isInWar) {
                    status = game.currentWar.isCivilWar ? '⚔️🆚⚔️ מלחמת אזרחים' : '⚔️ במלחמה';
                }
            }
            
            row.innerHTML = `
                <td class="rank-medal">${utils.getRankMedal(index)}</td>
                <td>${data.flag} ${name}</td>
                <td>${data.power}</td>
                <td>${status}</td>
            `;
        });
    },

    updateStats() {
        this.elements.activeWars.textContent = game.currentWar ? '1' : '0';
        this.elements.totalTurns.textContent = game.totalTurnsAllWars;
        const inWar = game.currentWar ? game.currentWar.activeCount : 0;
        this.elements.countriesAtWar.textContent = inWar;
        this.elements.countriesAtPeace.textContent = CONST.TOTAL_COUNTRIES - inWar;
    },

    updateWarStatus() {
        if (!game.currentWar) return;

        let html = `<strong>סיבוב ${game.warTurns}</strong><br>`;
        
        if (game.currentWar.isCivilWar) {
            html += `<div style="text-align: center; color: #ff00ff; font-weight: bold; margin: 10px 0;">💥 מלחמת אזרחים 💥</div>`;
            this.elements.warStatus.classList.add('civil-war-info');
        } else {
            this.elements.warStatus.classList.remove('civil-war-info');
        }
        
        Object.entries(game.currentWar.participants).forEach(([key, participant], index) => {
            if (!participant.isActive) return;
            
            const displayName = utils.getDisplayName(key, game.currentWar.isCivilWar);
            const flag = COUNTRIES[participant.country].flag;
            const maxPower = COUNTRIES[participant.country].power;
            const percent = Math.max(0, (participant.strength / maxPower * 100));
            
            html += `
                <div style="margin: 10px 0;">
                    <div>${flag} ${displayName}</div>
                    <div class="power-bar">
                        <div class="power-fill participant-${(index % 6) + 1}" style="width: ${percent}%">
                            ${percent.toFixed(0)}%
                        </div>
                    </div>
                </div>
            `;
        });
        
        this.elements.warStatus.innerHTML = html;
    }
};