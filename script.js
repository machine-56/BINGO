const grid = document.getElementById('bingoGrid');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const modal = document.getElementById('confirmModal');
const trackerCells = document.querySelectorAll('.tracker-cell');

let currentNumber = 1;
let isGameStarted = false;
let fillHistory = []; 
let cellElements = [];

// Win line matrix mapping coordinates
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

// Generate cells with structural nodes to mount dots and clean stacked line entities
for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;

    // Direct structural text container
    const textNode = document.createTextNode('');
    cell.appendChild(textNode);

    // Overlay dot element tracking state visualisations
    const dot = document.createElement('div');
    dot.classList.add('marker-dot');
    cell.appendChild(dot);

    cell.addEventListener('click', () => handleCellClick(cell));
    grid.appendChild(cell);
    cellElements.push(cell);
}

// Intercept click updates for manual adjustment state modifications strictly outside runtime rules
trackerCells.forEach(tc => {
    tc.addEventListener('click', () => {
        if (!isGameStarted) tc.classList.toggle('active');
    });
});

function handleCellClick(cell) {
    const textNode = cell.childNodes[0];

    if (!isGameStarted) {
        // Setup Card Configuration Layout Sequence
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
        // Active Game Iteration Processing
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

    // Flush lines completely before programmatic redraw checks to ensure reliable layered overlaps
    cellElements.forEach(cell => {
        cell.querySelectorAll('.strike-line').forEach(el => el.remove());
    });

    winLines.forEach(line => {
        const isLineComplete = line.cells.every(index => cellElements[index].classList.contains('confirmed'));
        
        if (isLineComplete) {
            completedLinesCount++;
            // Mount separate absolute layered visual cross elements safely without logical class overwrites
            line.cells.forEach(index => {
                const strikeSpan = document.createElement('span');
                strikeSpan.classList.add('strike-line', line.type);
                cellElements[index].appendChild(strikeSpan);
            });
        }
    });

    // Mirror current progress scoring updates down to indicator headers
    trackerCells.forEach((tc, idx) => {
        if (idx < completedLinesCount) {
            tc.classList.add('active');
        } else {
            tc.classList.remove('active');
        }
    });
}

startBtn.addEventListener('click', () => {
    if (!isGameStarted) {
        isGameStarted = true;
        startBtn.innerHTML = '<i class="fa-regular fa-circle-question"></i>';
        startBtn.className = 'btn btn-secondary';
    } else {
        modal.classList.add('show');
    }
});

// Structural hard master wipe logic trigger execution
resetBtn.addEventListener('click', () => clearBoard(false));

// Re-use current structural board parameters shortcut confirmation callback
document.getElementById('modalYes').addEventListener('click', () => {
    modal.classList.remove('show');
    clearBoard(true); 
});
document.getElementById('modalNo').addEventListener('click', () => {
    modal.classList.remove('show');
});

function clearBoard(preserveNumbers = false) {
    cellElements.forEach(cell => {
        cell.querySelectorAll('.strike-line').forEach(el => el.remove());
        cell.classList.remove('temp', 'confirmed');
        
        if (!preserveNumbers) {
            cell.childNodes[0].nodeValue = '';
        }
    });

    trackerCells.forEach(tc => tc.classList.remove('active'));
    
    if (!preserveNumbers) {
        currentNumber = 1;
        isGameStarted = false;
        fillHistory = [];
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
        startBtn.className = 'btn btn-success';
    } else {
        isGameStarted = true;
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fa-regular fa-circle-question"></i>';
        startBtn.className = 'btn btn-secondary';
    }
}