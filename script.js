const grid = document.getElementById('bingoGrid');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const modal = document.getElementById('confirmModal');
const trackerCells = document.querySelectorAll('.tracker-cell');

// Sidebar Control Interactivity Targets
const sidebar = document.getElementById('settingsSidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
const btnGroupItems = document.querySelectorAll('.btn-group-item');
const penColorSelect = document.getElementById('penColorSelect');
const modCellColor = document.getElementById('modCellColor');
const modBingoColor = document.getElementById('modBingoColor');
const modApplyFontToUI = document.getElementById('modApplyFontToUI');
const crossWidthSlider = document.getElementById('crossWidthSlider');
const widthVal = document.getElementById('widthVal');

// Storage Target Flags
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieReject = document.getElementById('cookieReject');

let currentNumber = 1;
let isGameStarted = false;
let fillHistory = []; 
let cellElements = [];
let storageAllowed = null; 

// Permanent Dark Baseline Configuration (No more system-check headaches)
const cleanDefaultSettings = {
    viewMode: 'default',
    font: 'standard',
    applyFontToUI: false,
    theme: 'dark',
    penColor: 'default',
    modCell: false,
    modBingo: false,
    crossWidth: '2',
    borderStyle: 'fused'
};

// --- MULTI-PROFILE STORAGE SYSTEM ARCHITECTURE ---
let userSettings = { ...cleanDefaultSettings };
let customSettingsBackup = { ...cleanDefaultSettings, viewMode: 'customised' };

const winLines = [
    { type: 'horizontal', cells: [0, 1, 2, 3, 4] },
    { type: 'horizontal', cells: [5, 6, 7, 8, 9] },
    { type: 'horizontal', cells: [10, 11, 12, 13, 14] },
    { type: 'horizontal', cells: [15, 16, 17, 18, 19] },
    { type: 'horizontal', cells: [20, 21, 22, 23, 24] },
    { type: 'vertical', cells: [0, 5, 10, 15, 20] },
    { type: 'vertical', cells: [1, 6, 11, 16, 21] },
    { type: 'vertical', cells: [2, 7, 12, 17, 22] },
    { type: 'vertical', cells: [3, 8, 13, 18, 23] },
    { type: 'vertical', cells: [4, 9, 14, 19, 24] },
    { type: 'diagonal-left', cells: [0, 6, 12, 18, 24] },
    { type: 'diagonal-right', cells: [4, 8, 12, 16, 20] }
];

// --- ENGINE STATE STORAGE MANAGERS ---
function initStorageTracking() {
    const consent = getCookie('bingo_cookie_consent');
    if (consent === 'accepted') {
        storageAllowed = true;
        loadSavedSettings(localStorage);
    } else if (consent === 'rejected') {
        storageAllowed = false;
        loadSavedSettings(sessionStorage);
    } else {
        cookieBanner.classList.add('show');
        applyThemeEngineState(); 
    }
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function saveSettings() {
    const storageTarget = storageAllowed ? localStorage : sessionStorage;
    if (userSettings.viewMode === 'customised') {
        storageTarget.setItem('bingo_user_settings', JSON.stringify(customSettingsBackup));
    } else {
        storageTarget.setItem('bingo_user_settings', JSON.stringify(userSettings));
    }
}

function loadSavedSettings(storageEngine) {
    const raw = storageEngine.getItem('bingo_user_settings');
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed.viewMode === 'customised') {
                customSettingsBackup = { ...parsed };
                userSettings = { ...parsed };
            } else {
                userSettings = { ...parsed };
                customSettingsBackup = { ...cleanDefaultSettings, viewMode: 'customised' };
            }
            applySettingsToDOMControls();
            applyThemeEngineState();
        } catch(e) { 
            userSettings = { ...cleanDefaultSettings }; 
            customSettingsBackup = { ...cleanDefaultSettings, viewMode: 'customised' };
        }
    } else {
        applyThemeEngineState();
    }
}

// --- RENDERING CONFIGURATION PIPELINE ---
function applySettingsToDOMControls() {
    const activeSource = (userSettings.viewMode === 'default') ? cleanDefaultSettings : userSettings;

    btnGroupItems.forEach(btn => {
        const type = btn.dataset.setting;
        const val = btn.dataset.value;
        
        if (activeSource[type] === val) {
            btn.parentElement.querySelectorAll('.btn-group-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    });

    penColorSelect.value = activeSource.penColor;
    modCellColor.checked = activeSource.modCell;
    modBingoColor.checked = activeSource.modBingo;
    modApplyFontToUI.checked = activeSource.applyFontToUI;
    crossWidthSlider.value = activeSource.crossWidth;
    widthVal.textContent = activeSource.crossWidth;

    // Force profile buttons to follow the viewMode status explicitly
    btnGroupItems.forEach(btn => {
        if (btn.dataset.setting === 'viewMode' && userSettings.viewMode === btn.dataset.value) {
            btn.parentElement.querySelectorAll('.btn-group-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    });
}

function applyThemeEngineState() {
    const activeProfile = (userSettings.viewMode === 'default') ? cleanDefaultSettings : userSettings;

    document.documentElement.setAttribute('data-theme', activeProfile.theme);
    document.documentElement.setAttribute('data-font', activeProfile.font);
    document.documentElement.setAttribute('data-ui-font-override', activeProfile.applyFontToUI ? 'true' : 'false');
    
    document.documentElement.style.setProperty('--strike-thickness', activeProfile.crossWidth + 'px');
    
    if (activeProfile.borderStyle === 'fused') {
        document.documentElement.style.setProperty('--grid-gap', '0px');
        grid.classList.add('fused-grid');
    } else {
        document.documentElement.style.setProperty('--grid-gap', '4px');
        grid.classList.remove('fused-grid');
    }

    let colorHex = activeProfile.theme === 'dark' ? '#ffffff' : '#000000';
    if (activeProfile.penColor === 'blue') colorHex = '#0055ff';
    if (activeProfile.penColor === 'green') colorHex = '#2d4a2c';
    if (activeProfile.penColor === 'red') colorHex = '#dc3545';

    document.documentElement.style.setProperty('--pen-base', colorHex);

    if (activeProfile.modCell) {
        document.documentElement.style.setProperty('--cell-border-color', colorHex);
    } else {
        document.documentElement.style.setProperty('--cell-border-color', activeProfile.theme === 'dark' ? '#ffffff' : '#222222');
    }

    if (activeProfile.modBingo) {
        document.documentElement.style.setProperty('--tracker-default-bg', 'var(--body-bg)');
        document.documentElement.style.setProperty('--tracker-active-bg', colorHex);
        document.documentElement.style.setProperty('--tracker-text-default', colorHex);
        document.documentElement.style.setProperty('--tracker-text-active', 'var(--body-bg)');
    } else {
        document.documentElement.style.removeProperty('--tracker-default-bg');
        document.documentElement.style.removeProperty('--tracker-active-bg');
        document.documentElement.style.removeProperty('--tracker-text-default');
        document.documentElement.style.removeProperty('--tracker-text-active');
    }
    
    const uiMode = activeProfile.theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark';
    
    startBtn.className = `btn ${uiMode}`;
    sidebarToggleBtn.className = `btn ${uiMode}`;
    document.getElementById('modalYes').className = `btn ${uiMode}`;
    cookieAccept.className = `btn ${uiMode} btn-sm`;
}

function switchToCustomViewMode() {
    if (userSettings.viewMode === 'default') {
        userSettings.viewMode = 'customised';
        const customBtn = document.querySelector('.btn-group-item[data-setting="viewMode"][data-value="customised"]');
        if(customBtn) {
            customBtn.parentElement.querySelectorAll('.btn-group-item').forEach(b => b.classList.remove('active'));
            customBtn.classList.add('active');
        }
    }
}

// --- INTERACTIVE EVENT ACTION ROUTER ---
sidebarToggleBtn.addEventListener('click', () => sidebar.classList.add('open'));
sidebarCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));

btnGroupItems.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const item = e.target;
        item.parentElement.querySelectorAll('.btn-group-item').forEach(b => b.classList.remove('active'));
        item.classList.add('active');

        const targetSetting = item.dataset.setting;
        const targetValue = item.dataset.value;

        if (targetSetting === 'viewMode') {
            userSettings.viewMode = targetValue;
            if (targetValue === 'default') {
                userSettings = { ...cleanDefaultSettings };
            } else if (targetValue === 'customised') {
                userSettings = { ...customSettingsBackup };
            }
            applySettingsToDOMControls();
        } else {
            switchToCustomViewMode();
            userSettings[targetSetting] = targetValue;
            customSettingsBackup[targetSetting] = targetValue;
        }

        applyThemeEngineState();
        saveSettings();
    });
});

penColorSelect.addEventListener('change', (e) => {
    switchToCustomViewMode();
    userSettings.penColor = e.target.value;
    customSettingsBackup.penColor = e.target.value;
    applyThemeEngineState();
    saveSettings();
});

modCellColor.addEventListener('change', (e) => {
    switchToCustomViewMode();
    userSettings.modCell = e.target.checked;
    customSettingsBackup.modCell = e.target.checked;
    applyThemeEngineState();
    saveSettings();
});

modBingoColor.addEventListener('change', (e) => {
    switchToCustomViewMode();
    userSettings.modBingo = e.target.checked;
    customSettingsBackup.modBingo = e.target.checked;
    applyThemeEngineState();
    saveSettings();
});

modApplyFontToUI.addEventListener('change', (e) => {
    switchToCustomViewMode();
    userSettings.applyFontToUI = e.target.checked;
    customSettingsBackup.applyFontToUI = e.target.checked;
    applyThemeEngineState();
    saveSettings();
});

crossWidthSlider.addEventListener('input', (e) => {
    switchToCustomViewMode();
    widthVal.textContent = e.target.value;
    userSettings.crossWidth = e.target.value;
    customSettingsBackup.crossWidth = e.target.value;
    applyThemeEngineState();
    saveSettings();
});

cookieAccept.addEventListener('click', () => {
    setCookie('bingo_cookie_consent', 'accepted', 365);
    storageAllowed = true;
    cookieBanner.classList.remove('show');
    saveSettings();
});

cookieReject.addEventListener('click', () => {
    setCookie('bingo_cookie_consent', 'rejected', 365);
    storageAllowed = false;
    cookieBanner.classList.remove('show');
    saveSettings();
});

// --- CORE GAME LOGIC ROUTINES ---
for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;

    const textNode = document.createTextNode('');
    cell.appendChild(textNode);

    const dot = document.createElement('div');
    dot.classList.add('marker-dot');
    cell.appendChild(dot);

    cell.addEventListener('click', () => handleCellClick(cell));
    grid.appendChild(cell);
    cellElements.push(cell);
}

trackerCells.forEach(tc => {
    tc.addEventListener('click', () => {
        if (!isGameStarted) tc.classList.toggle('active');
    });
});

function handleCellClick(cell) {
    const textNode = cell.childNodes[0];
    if (!isGameStarted) {
        if (!textNode.nodeValue) {
            textNode.nodeValue = currentNumber;
            fillHistory.push(cell);
            currentNumber++;
        } else {
            const lastFilledCell = fillHistory[fillHistory.length - 1];
            if (cell === lastFilledCell) {
                textNode.nodeValue = '';
                fillHistory.pop();
                currentNumber--;
            }
        }
        startBtn.disabled = fillHistory.length !== 25;
    } else {
        if (cell.classList.contains('confirmed')) return; 
        if (cell.classList.contains('temp')) {
            cell.classList.remove('temp');
            cell.classList.add('confirmed');
            checkBingoProgress(); 
        } else {
            document.querySelectorAll('.cell.temp').forEach(c => c.classList.remove('temp'));
            cell.classList.add('temp');
        }
    }
}

function checkBingoProgress() {
    let completedLinesCount = 0;
    cellElements.forEach(cell => {
        cell.querySelectorAll('.strike-line').forEach(el => el.remove());
    });
    winLines.forEach(line => {
        const isLineComplete = line.cells.every(index => cellElements[index].classList.contains('confirmed'));
        if (isLineComplete) {
            completedLinesCount++;
            line.cells.forEach(index => {
                const strikeSpan = document.createElement('span');
                strikeSpan.classList.add('strike-line', line.type);
                cellElements[index].appendChild(strikeSpan);
            });
        }
    });
    trackerCells.forEach((tc, idx) => {
        if (idx < completedLinesCount) {
            tc.classList.add('active');
        } else {
            if (!isGameStarted) tc.classList.remove('active');
        }
    });
}

startBtn.addEventListener('click', () => {
    if (!isGameStarted) {
        isGameStarted = true;
        startBtn.innerHTML = '<i class="fa-regular fa-circle-question"></i>';
        applyThemeEngineState();
    } else {
        modal.classList.add('show');
    }
});

resetBtn.addEventListener('click', () => clearBoard(false));
document.getElementById('modalYes').addEventListener('click', () => { modal.classList.remove('show'); clearBoard(true); });
document.getElementById('modalNo').addEventListener('click', () => { modal.classList.remove('show'); });

function clearBoard(preserveNumbers = false) {
    cellElements.forEach(cell => {
        cell.querySelectorAll('.strike-line').forEach(el => el.remove());
        cell.classList.remove('temp', 'confirmed');
        if (!preserveNumbers) cell.childNodes[0].nodeValue = '';
    });
    trackerCells.forEach(tc => tc.classList.remove('active'));
    if (!preserveNumbers) {
        currentNumber = 1; isGameStarted = false; fillHistory = [];
        startBtn.disabled = true; startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
        applyThemeEngineState();
    } else {
        isGameStarted = true; startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fa-regular fa-circle-question"></i>';
        applyThemeEngineState();
    }
}

// Fire Lifecycle Enclosure on Clean Slate
initStorageTracking();
applySettingsToDOMControls();