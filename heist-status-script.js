// Get DOM elements
const waitingState = document.getElementById('waitingState');
const readyState = document.getElementById('readyState');
const gameState = document.getElementById('gameState');
const gameOverState = document.getElementById('gameOverState');
const successState = document.getElementById('successState');

const countdownTimerEl = document.getElementById('countdownTimer');
const backToLobbyBtn = document.getElementById('backToLobbyBtn');
const makeMoveBtn = document.getElementById('makeMoveBtn');
const continueBtn = document.getElementById('continueBtn');
const escapeBtn = document.getElementById('escapeBtn');
const retryBtn = document.getElementById('retryBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

// Game state elements
const accumulatedLootEl = document.getElementById('accumulatedLoot');
const playerCountEl = document.getElementById('playerCount');
const movesCountEl = document.getElementById('movesCount');
const trapCardsContainerEl = document.getElementById('trapCardsContainer');
const actionLogEl = document.getElementById('actionLog');
const lootLostEl = document.getElementById('lootLost');
const movesSurvivedEl = document.getElementById('movesSurvived');
const duplicateTrapsEl = document.getElementById('duplicateTraps');
const lootSecuredEl = document.getElementById('lootSecured');
const yourShareEl = document.getElementById('yourShare');

// Game constants
const PRIZE_POOL = 10000000; // $10,000,000
const TRAP_TYPES = [
    { name: 'Security Guard', icon: '👮', color: '#ff6b6b' },
    { name: 'Laser Fields', icon: '🔴', color: '#ff0000' },
    { name: 'Hounds', icon: '🐕', color: '#ff8c42' },
    { name: 'Surveillance Systems', icon: '📹', color: '#4ecdc4' },
    { name: 'Anti-Touch Sensors', icon: '⚡', color: '#ffd700' },
    { name: 'Data Security Devices', icon: '🔒', color: '#95e1d3' }
];

// Game state
let gameData = {
    accumulatedLoot: 0,
    playerCount: Math.floor(Math.random() * 5) + 1, // Random 1-5 players
    movesCount: 0,
    trapCards: [],
    gameActive: false
};

// Get heist start time from localStorage or set new one
let heistStartTime = localStorage.getItem('heistStartTime');

if (!heistStartTime) {
    // Set heist to start 3 minutes from now
    heistStartTime = Date.now() + (3 * 60 * 1000); // 3 minutes in milliseconds
    localStorage.setItem('heistStartTime', heistStartTime);
} else {
    heistStartTime = parseInt(heistStartTime);
}

// Check heist status and display appropriate state
function checkHeistStatus() {
    const now = Date.now();
    const timeUntilHeist = heistStartTime - now;
    
    if (timeUntilHeist <= 0) {
        // Heist has started
        showReadyState();
    } else {
        // Heist hasn't started yet
        showWaitingState(timeUntilHeist);
    }
}

// Show waiting state
function showWaitingState(timeRemaining) {
    hideAllStates();
    waitingState.classList.remove('hidden');
    
    // Update countdown every second
    const countdownInterval = setInterval(() => {
        const now = Date.now();
        const remaining = heistStartTime - now;
        
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            checkHeistStatus();
        } else {
            updateCountdownDisplay(remaining);
        }
    }, 1000);
    
    // Initial display
    updateCountdownDisplay(timeRemaining);
}

// Show ready state
function showReadyState() {
    hideAllStates();
    readyState.classList.remove('hidden');
}

// Show game state
function showGameState() {
    hideAllStates();
    gameState.classList.remove('hidden');
    updateGameDisplay();
}

// Show game over state
function showGameOverState(duplicateTrap) {
    hideAllStates();
    gameOverState.classList.remove('hidden');
    
    lootLostEl.textContent = formatMoney(gameData.accumulatedLoot);
    movesSurvivedEl.textContent = gameData.movesCount;
    
    // Show the duplicate trap that triggered the alarm
    duplicateTrapsEl.innerHTML = `
        <div class="alarm-trap-card">
            <div class="trap-icon" style="background: ${duplicateTrap.color};">${duplicateTrap.icon}</div>
            <div class="trap-name">${duplicateTrap.name}</div>
            <div class="alarm-text">DUPLICATE DETECTED!</div>
        </div>
    `;
}

// Show success state
function showSuccessState() {
    hideAllStates();
    successState.classList.remove('hidden');
    
    const share = gameData.accumulatedLoot / gameData.playerCount;
    
    lootSecuredEl.textContent = formatMoney(gameData.accumulatedLoot);
    yourShareEl.textContent = formatMoney(share);
}

// Hide all states
function hideAllStates() {
    waitingState.classList.add('hidden');
    readyState.classList.add('hidden');
    gameState.classList.add('hidden');
    gameOverState.classList.add('hidden');
    successState.classList.add('hidden');
}

// Update countdown display
function updateCountdownDisplay(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    countdownTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format money
function formatMoney(amount) {
    return '$' + amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// Update game display
function updateGameDisplay() {
    accumulatedLootEl.textContent = formatMoney(gameData.accumulatedLoot);
    playerCountEl.textContent = gameData.playerCount;
    movesCountEl.textContent = gameData.movesCount;
    
    // Update trap cards display
    if (gameData.trapCards.length === 0) {
        trapCardsContainerEl.innerHTML = '<div class="empty-state">No traps encountered yet...</div>';
    } else {
        trapCardsContainerEl.innerHTML = gameData.trapCards.map(trap => `
            <div class="trap-card">
                <div class="trap-icon" style="background: ${trap.color};">${trap.icon}</div>
                <div class="trap-name">${trap.name}</div>
            </div>
        `).join('');
    }
}

// Add log entry
function addLogEntry(message, type = 'normal') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = message;
    
    actionLogEl.insertBefore(logEntry, actionLogEl.firstChild);
    
    // Animate entry
    setTimeout(() => {
        logEntry.style.opacity = '1';
        logEntry.style.transform = 'translateY(0)';
    }, 10);
    
    // Keep only last 10 entries
    while (actionLogEl.children.length > 10) {
        actionLogEl.removeChild(actionLogEl.lastChild);
    }
}

// Make a move
function makeMove() {
    if (!gameData.gameActive) return;
    
    gameData.movesCount++;
    
    // 70% chance of loot, 30% chance of trap
    const random = Math.random();
    
    if (random < 0.7) {
        // Loot outcome
        drawLoot();
    } else {
        // Trap outcome
        drawTrap();
    }
    
    updateGameDisplay();
}

// Draw loot
function drawLoot() {
    const percentage = Math.random() * 0.29 + 0.01; // Random between 1% and 30%
    const lootAmount = Math.floor(PRIZE_POOL * percentage);
    const perPlayerAmount = Math.floor(lootAmount / gameData.playerCount);
    
    gameData.accumulatedLoot += perPlayerAmount;
    
    const percentageStr = (percentage * 100).toFixed(1);
    addLogEntry(`💰 LOOT SECURED! Drew ${percentageStr}% of prize pool (${formatMoney(perPlayerAmount)} per player)`, 'success');
}

// Draw trap
function drawTrap() {
    const randomTrap = TRAP_TYPES[Math.floor(Math.random() * TRAP_TYPES.length)];
    gameData.trapCards.push(randomTrap);
    
    addLogEntry(`⚠️ TRAP ENCOUNTERED! ${randomTrap.name} ${randomTrap.icon}`, 'warning');
    
    // Check for duplicates
    const trapCounts = {};
    gameData.trapCards.forEach(trap => {
        trapCounts[trap.name] = (trapCounts[trap.name] || 0) + 1;
    });
    
    // Check if any trap has 2 or more occurrences
    for (let trapName in trapCounts) {
        if (trapCounts[trapName] >= 2) {
            // Trigger alarm
            const duplicateTrap = TRAP_TYPES.find(t => t.name === trapName);
            triggerAlarm(duplicateTrap);
            return;
        }
    }
}

// Trigger alarm (game over)
function triggerAlarm(duplicateTrap) {
    gameData.gameActive = false;
    addLogEntry(`🚨 ALARM TRIGGERED! Two ${duplicateTrap.name} detected! YOU'VE BEEN CAPTURED!`, 'danger');
    
    setTimeout(() => {
        showGameOverState(duplicateTrap);
    }, 1500);
}

// Escape with loot
function escapeWithLoot() {
    if (!gameData.gameActive) return;
    
    gameData.gameActive = false;
    addLogEntry(`🏃 ESCAPING WITH LOOT! Total: ${formatMoney(gameData.accumulatedLoot)}`, 'success');
    
    setTimeout(() => {
        showSuccessState();
    }, 1000);
}

// Reset game
function resetGame() {
    gameData = {
        accumulatedLoot: 0,
        playerCount: Math.floor(Math.random() * 5) + 1,
        movesCount: 0,
        trapCards: [],
        gameActive: false
    };
    
    actionLogEl.innerHTML = '<div class="log-entry initial">Ready to start the heist...</div>';
}

// Start game
function startGame() {
    resetGame();
    gameData.gameActive = true;
    showGameState();
    addLogEntry(`🎯 HEIST STARTED! ${gameData.playerCount} player(s) in the crew.`, 'info');
}

// Back to lobby button
backToLobbyBtn.addEventListener('click', () => {
    window.location.href = 'lobby.html';
});

// Make your move button (from ready state)
makeMoveBtn.addEventListener('click', () => {
    startGame();
});

// Continue button (make another move in game)
continueBtn.addEventListener('click', () => {
    makeMove();
});

// Escape button
escapeBtn.addEventListener('click', () => {
    escapeWithLoot();
});

// Retry button
retryBtn.addEventListener('click', () => {
    startGame();
});

// Play again button
playAgainBtn.addEventListener('click', () => {
    startGame();
});

// Button click effects
const buttons = document.querySelectorAll('.action-btn');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    });
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    checkHeistStatus();
});
