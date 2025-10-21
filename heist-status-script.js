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
const yourShareLootEl = document.getElementById('yourShareLoot');
const escapeBonusTotalEl = document.getElementById('escapeBonusTotal');
const remainingPrizePoolEl = document.getElementById('remainingPrizePool');
const playerCountEl = document.getElementById('playerCount');
const movesCountEl = document.getElementById('movesCount');
const trapCardsContainerEl = document.getElementById('trapCardsContainer');
const relicsContainerEl = document.getElementById('relicsContainer');
const actionLogEl = document.getElementById('actionLog');
const lootLostEl = document.getElementById('lootLost');
const movesSurvivedEl = document.getElementById('movesSurvived');
const duplicateTrapsEl = document.getElementById('duplicateTraps');
const lootSecuredEl = document.getElementById('lootSecured');
const yourShareEl = document.getElementById('yourShare');
const escapeBonusEl = document.getElementById('escapeBonus');
const relicRewardEl = document.getElementById('relicReward');

// Game constants
const PRIZE_POOL = 5000000; // $5,000,000
const ESCAPE_BONUS_PERCENTAGE = 0.05; // 5% of loot goes to escape bonus
const INITIAL_PLAYER_COUNT = 500; // Start with 500 players
const TRAP_TYPES = [
    { name: 'Security Guard', icon: '👮', color: '#ff6b6b' },
    { name: 'Laser Fields', icon: '🔴', color: '#ff0000' },
    { name: 'Hounds', icon: '🐕', color: '#ff8c42' },
    { name: 'Surveillance Systems', icon: '📹', color: '#4ecdc4' },
    { name: 'Anti-Touch Sensors', icon: '⚡', color: '#ffd700' },
    { name: 'Data Security Devices', icon: '🔒', color: '#95e1d3' }
];

const RELIC_TYPES = [
    { name: 'Ancient Crown', icon: '👑', color: '#ffd700', rarity: 'Legendary' },
    { name: 'Diamond Necklace', icon: '💎', color: '#4ecdc4', rarity: 'Rare' },
    { name: 'Golden Chalice', icon: '🏆', color: '#ffed4e', rarity: 'Rare' },
    { name: 'Ruby Ring', icon: '💍', color: '#ff6b6b', rarity: 'Uncommon' },
    { name: 'Emerald Statue', icon: '🗿', color: '#00ff41', rarity: 'Uncommon' },
    { name: 'Sapphire Gem', icon: '💠', color: '#4169e1', rarity: 'Common' }
];

// Game state
let gameData = {
    accumulatedLoot: 0,
    escapeBonusPool: 0,
    remainingPrizePool: PRIZE_POOL, // Track remaining prize pool
    playerCount: INITIAL_PLAYER_COUNT, // Start with 500 players
    movesCount: 0,
    lootDrawCount: 0, // Track how many times loot has been drawn
    trapCards: [],
    relics: [],
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
        // Heist has started - go directly to game
        startGame();
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
    
    // Show player's share of loot that was lost
    const playerShareLost = gameData.accumulatedLoot / gameData.playerCount;
    lootLostEl.textContent = formatMoney(playerShareLost);
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
function showSuccessState(escapeBonus, wonRelic, totalEscapees, raffleHeld) {
    hideAllStates();
    successState.classList.remove('hidden');
    
    const share = gameData.accumulatedLoot / gameData.playerCount;
    const escapeBonusShare = escapeBonus / totalEscapees;
    
    lootSecuredEl.textContent = formatMoney(gameData.accumulatedLoot);
    yourShareEl.textContent = formatMoney(share);
    escapeBonusEl.textContent = formatMoney(escapeBonusShare);
    
    // Display relic reward based on raffle status
    if (wonRelic) {
        relicRewardEl.innerHTML = `
            <div class="relic-won">
                <h3>🎊 RELIC WON! 🎊</h3>
                <div class="won-relic-card">
                    <div class="relic-icon" style="background: ${wonRelic.color};">${wonRelic.icon}</div>
                    <div class="relic-name">${wonRelic.name}</div>
                    <div class="relic-rarity ${wonRelic.rarity.toLowerCase()}">${wonRelic.rarity}</div>
                </div>
                <p class="relic-message">You won the raffle and claimed this precious relic!</p>
            </div>
        `;
    } else if (gameData.relics.length > 0 && raffleHeld) {
        relicRewardEl.innerHTML = `
            <div class="relic-not-won">
                <p class="relic-message">Unfortunately, you didn't win the relic raffle this time.</p>
            </div>
        `;
    } else if (gameData.relics.length > 0 && !raffleHeld) {
        relicRewardEl.innerHTML = `
            <div class="relic-not-won">
                <p class="relic-message">⚠️ Too many players escaped (≥5%) - no relic raffle held. Relics remain unclaimed in the vault.</p>
            </div>
        `;
    } else {
        relicRewardEl.innerHTML = '';
    }
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
    // Calculate player's share of loot
    const playerShareLoot = gameData.accumulatedLoot / gameData.playerCount;
    
    yourShareLootEl.textContent = formatMoney(playerShareLoot);
    escapeBonusTotalEl.textContent = formatMoney(gameData.escapeBonusPool);
    remainingPrizePoolEl.textContent = formatMoney(gameData.remainingPrizePool);
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
    
    // Update relics display
    if (gameData.relics.length === 0) {
        relicsContainerEl.innerHTML = '<div class="empty-state">No relics discovered yet...</div>';
    } else {
        relicsContainerEl.innerHTML = gameData.relics.map(relic => `
            <div class="relic-card">
                <div class="relic-icon" style="background: ${relic.color};">${relic.icon}</div>
                <div class="relic-info">
                    <div class="relic-name">${relic.name}</div>
                    <div class="relic-rarity ${relic.rarity.toLowerCase()}">${relic.rarity}</div>
                </div>
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

// Simulate players escaping
function simulatePlayerEscapes() {
    // Only simulate escapes if there's loot or relics to incentivize escape
    if (gameData.accumulatedLoot === 0 && gameData.relics.length === 0) {
        return; // No one escapes if there's nothing to gain
    }
    
    // Calculate escape probability based on bonus pool and relics
    // Base escape rate: 5% per round
    let escapeRate = 0.05;
    
    // Increase escape rate based on escape bonus pool (up to +10%)
    const bonusIncentive = Math.min((gameData.escapeBonusPool / PRIZE_POOL) * 20, 0.10);
    escapeRate += bonusIncentive;
    
    // Increase escape rate if there are relics (2% per relic, up to +10%)
    const relicIncentive = Math.min(gameData.relics.length * 0.02, 0.10);
    escapeRate += relicIncentive;
    
    // Calculate number of players escaping (at least 1 if conditions are met)
    const escapingPlayers = Math.max(1, Math.floor(gameData.playerCount * escapeRate));
    
    // Remove escaped players from player count
    gameData.playerCount = Math.max(1, gameData.playerCount - escapingPlayers);
    
    addLogEntry(`🏃 ${escapingPlayers} player(s) escaped with loot! ${gameData.playerCount} players remain.`, 'info');
}

// Make a move
function makeMove() {
    if (!gameData.gameActive) return;
    
    gameData.movesCount++;
    
    // 60% chance of loot, 25% chance of trap, 15% chance of relic
    const random = Math.random();
    
    if (random < 0.60) {
        // Loot outcome
        drawLoot();
    } else if (random < 0.85) {
        // Trap outcome
        drawTrap();
    } else {
        // Relic outcome
        drawRelic();
    }
    
    // Simulate other players escaping after each round
    simulatePlayerEscapes();
    
    updateGameDisplay();
}

// Draw loot
function drawLoot() {
    gameData.lootDrawCount++;
    
    // Determine percentage range based on loot draw count
    let minPercent, maxPercent;
    if (gameData.lootDrawCount <= 5) {
        // First 5 times: 1%-10%
        minPercent = 0.01;
        maxPercent = 0.10;
    } else if (gameData.lootDrawCount <= 10) {
        // Next 5 times (6-10): 5%-15%
        minPercent = 0.05;
        maxPercent = 0.15;
    } else {
        // All subsequent times (11+): 10%-20%
        minPercent = 0.10;
        maxPercent = 0.20;
    }
    
    const percentage = Math.random() * (maxPercent - minPercent) + minPercent;
    const totalLoot = Math.floor(PRIZE_POOL * percentage);
    
    // 5% goes to escape bonus pool
    const escapeBonus = Math.floor(totalLoot * ESCAPE_BONUS_PERCENTAGE);
    const lootAmount = totalLoot - escapeBonus;
    
    // Loot is split equally among REMAINING players only
    // Store total accumulated loot (not per player)
    gameData.accumulatedLoot += lootAmount;
    gameData.escapeBonusPool += escapeBonus;
    gameData.remainingPrizePool -= totalLoot; // Deduct from remaining prize pool
    
    const perPlayerAmount = Math.floor(lootAmount / gameData.playerCount);
    const percentageStr = (percentage * 100).toFixed(1);
    addLogEntry(`💰 LOOT SECURED! Drew ${percentageStr}% of prize pool (${formatMoney(perPlayerAmount)} per player + ${formatMoney(escapeBonus)} to escape bonus)`, 'success');
}

// Draw relic
function drawRelic() {
    const randomRelic = RELIC_TYPES[Math.floor(Math.random() * RELIC_TYPES.length)];
    gameData.relics.push(randomRelic);
    
    addLogEntry(`✨ RELIC DISCOVERED! Found ${randomRelic.name} ${randomRelic.icon} (${randomRelic.rarity})`, 'relic');
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
    
    // Simulate this round's escapees (player + some others)
    // Calculate how many total players are escaping this round
    const baseEscapeRate = 0.08; // 8% base rate when player escapes
    const bonusIncentive = Math.min((gameData.escapeBonusPool / PRIZE_POOL) * 15, 0.12);
    const relicIncentive = Math.min(gameData.relics.length * 0.03, 0.12);
    const totalEscapeRate = baseEscapeRate + bonusIncentive + relicIncentive;
    
    const otherEscapingPlayers = Math.floor((gameData.playerCount - 1) * totalEscapeRate);
    const totalEscapees = otherEscapingPlayers + 1; // +1 for the player
    
    // Calculate what percentage of remaining players are escaping
    const escapePercentage = totalEscapees / gameData.playerCount;
    
    // Calculate escape bonus per escapee
    const escapeBonusShare = gameData.escapeBonusPool / totalEscapees;
    
    // Determine if player wins a relic
    // Only hold raffle if LESS than 5% of remaining players are escaping
    // (Prevents mass exodus from claiming all relics)
    let wonRelic = null;
    if (gameData.relics.length > 0) {
        if (escapePercentage < 0.05) {
            // Less than 5% escaping - hold exclusive raffle
            const winChance = 1 / totalEscapees;
            if (Math.random() < winChance) {
                wonRelic = gameData.relics[Math.floor(Math.random() * gameData.relics.length)];
                addLogEntry(`🎉 WON RELIC RAFFLE! Claimed ${wonRelic.name} ${wonRelic.icon} (${totalEscapees} escapees participated)`, 'relic');
            } else {
                addLogEntry(`😔 Lost the relic raffle among ${totalEscapees} escapees... Better luck next time!`, 'info');
            }
        } else {
            // 5% or more escaping - too many people, no raffle
            addLogEntry(`⚠️ Too many escapees for relic raffle (${totalEscapees} ≥ 5% of ${gameData.playerCount}). Relics remain in vault!`, 'warning');
        }
    }
    
    const playerLootShare = gameData.accumulatedLoot / gameData.playerCount;
    addLogEntry(`🏃 ESCAPING WITH LOOT! ${totalEscapees} players escaped this round. Your share: ${formatMoney(playerLootShare)} + Escape Bonus: ${formatMoney(escapeBonusShare)}`, 'success');
    
    setTimeout(() => {
        showSuccessState(gameData.escapeBonusPool, wonRelic, totalEscapees, escapePercentage < 0.05);
    }, 1000);
}

// Reset game
function resetGame() {
    gameData = {
        accumulatedLoot: 0,
        escapeBonusPool: 0,
        remainingPrizePool: PRIZE_POOL,
        playerCount: INITIAL_PLAYER_COUNT,
        movesCount: 0,
        lootDrawCount: 0,
        trapCards: [],
        relics: [],
        gameActive: false
    };
    
    actionLogEl.innerHTML = '<div class="log-entry initial">Ready to start the heist...</div>';
}

// Start game
function startGame() {
    resetGame();
    gameData.gameActive = true;
    showGameState();
    addLogEntry(`🎯 HEIST STARTED! ${gameData.playerCount} thieves entered the vault.`, 'info');
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
