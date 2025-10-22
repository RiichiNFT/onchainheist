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
const gameLogEl = document.getElementById('gameLog');
const playerLogEl = document.getElementById('playerLog');
const lootLostEl = document.getElementById('lootLost');
const movesSurvivedEl = document.getElementById('movesSurvived');
const duplicateTrapsEl = document.getElementById('duplicateTraps');
const yourTotalShareEl = document.getElementById('yourTotalShare');
const escapeBonusLabelEl = document.getElementById('escapeBonusLabel');
const thievesEscapedEl = document.getElementById('thievesEscaped');
const relicRewardEl = document.getElementById('relicReward');

// Game constants
const PRIZE_POOL = 5000000; // $5,000,000
const ESCAPE_BONUS_PERCENTAGE = 0.05; // 5% of loot goes to escape bonus
const INITIAL_PLAYER_COUNT = 500; // Start with 500 players
const MAX_RELICS = 3; // Only 3 relics available in the entire heist
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
    escapeBonusPool: 0, // Available for claiming NOW
    pendingEscapeBonus: 0, // Just drawn, available NEXT round
    remainingPrizePool: PRIZE_POOL, // Track remaining prize pool
    playerCount: INITIAL_PLAYER_COUNT, // Start with 500 players
    movesCount: 0,
    lootDrawCount: 0, // Track how many times loot has been drawn
    trapCards: [],
    relics: [], // Available relics (for raffle)
    discoveredRelics: [], // All discovered relics (for display)
    newlyDiscoveredRelic: null, // Relic discovered this turn (not yet available for raffle)
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

// Show prize pool depletion state
function showPrizePoolDepletionState(wonRelic) {
    hideAllStates();
    successState.classList.remove('hidden');
    
    const share = gameData.accumulatedLoot / gameData.playerCount;
    const escapeBonusShare = gameData.escapeBonusPool / gameData.playerCount;
    const totalShare = share + escapeBonusShare;
    
    // Display total share with escape bonus in parentheses
    yourTotalShareEl.textContent = formatMoney(totalShare);
    escapeBonusLabelEl.textContent = `(${formatMoney(escapeBonusShare)} Escape Bonus)`;
    
    // Display number of thieves remaining
    thievesEscapedEl.textContent = gameData.playerCount;
    
    // Display relic reward if won final raffle
    if (wonRelic) {
        relicRewardEl.innerHTML = `
            <div class="relic-won">
                <h3>🎊 FINAL RELIC RAFFLE WON! 🎊</h3>
                <div class="won-relic-card">
                    <div class="relic-icon" style="background: ${wonRelic.color};">${wonRelic.icon}</div>
                    <div class="relic-name">${wonRelic.name}</div>
                    <div class="relic-rarity ${wonRelic.rarity.toLowerCase()}">${wonRelic.rarity}</div>
                </div>
                <p class="relic-message">💰 Prize pool depleted! You won the final raffle for remaining relics!</p>
            </div>
        `;
    } else if (gameData.relics.length > 0) {
        relicRewardEl.innerHTML = `
            <div class="relic-not-won">
                <p class="relic-message">💰 Prize pool depleted! Unfortunately, you didn't win the final relic raffle.</p>
            </div>
        `;
    } else {
        relicRewardEl.innerHTML = `
            <div class="relic-not-won">
                <p class="relic-message">💰 Prize pool depleted! All relics were claimed before depletion.</p>
            </div>
        `;
    }
}

// Show success state
function showSuccessState(escapeBonus, wonRelic, totalEscapees, raffleHeld) {
    hideAllStates();
    successState.classList.remove('hidden');
    
    const share = gameData.accumulatedLoot / gameData.playerCount;
    const escapeBonusShare = escapeBonus / totalEscapees;
    const totalShare = share + escapeBonusShare;
    
    // Display total share with escape bonus in parentheses
    yourTotalShareEl.textContent = formatMoney(totalShare);
    escapeBonusLabelEl.textContent = `(${formatMoney(escapeBonusShare)} Escape Bonus)`;
    
    // Display number of thieves who escaped with the player
    thievesEscapedEl.textContent = totalEscapees;
    
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
        const thresholdPercent = (gameData.relics.length * 6.5).toFixed(1);
        relicRewardEl.innerHTML = `
            <div class="relic-not-won">
                <p class="relic-message">⚠️ Too many players escaped (≥${thresholdPercent}% for ${gameData.relics.length} relic(s)) - no relic raffle held. Relics remain unclaimed in the vault.</p>
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
    
    // Show escape bonus pool - current claimable + pending for next round
    if (gameData.pendingEscapeBonus > 0 && gameData.escapeBonusPool > 0) {
        escapeBonusTotalEl.innerHTML = `${formatMoney(gameData.escapeBonusPool)} <span style="color: #00ff41; font-size: 0.75rem;">claimable</span><br><span style="color: #ffed4e; font-size: 0.75rem;">+${formatMoney(gameData.pendingEscapeBonus)} next round</span>`;
    } else if (gameData.pendingEscapeBonus > 0) {
        escapeBonusTotalEl.innerHTML = `$0<br><span style="color: #ffed4e; font-size: 0.75rem;">+${formatMoney(gameData.pendingEscapeBonus)} next round</span>`;
    } else if (gameData.escapeBonusPool > 0) {
        escapeBonusTotalEl.innerHTML = `${formatMoney(gameData.escapeBonusPool)} <span style="color: #00ff41; font-size: 0.75rem;">claimable</span>`;
    } else {
        escapeBonusTotalEl.textContent = '$0';
    }
    
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
    
    // Update relics display - show all discovered relics
    if (gameData.discoveredRelics.length === 0) {
        relicsContainerEl.innerHTML = '<div class="empty-state">No relics discovered yet...</div>';
    } else {
        relicsContainerEl.innerHTML = gameData.discoveredRelics.map((relic, index) => {
            // Check if this is the newly discovered relic (not yet available)
            const isNewlyDiscovered = gameData.newlyDiscoveredRelic && relic.name === gameData.newlyDiscoveredRelic.name;
            
            // Check if this relic is available for raffle
            const isAvailable = gameData.relics.some(r => r.name === relic.name);
            
            // Determine status
            let statusText, statusClass;
            if (isNewlyDiscovered) {
                statusText = '🆕 Next Turn';
                statusClass = 'relic-new';
            } else if (isAvailable) {
                statusText = '✨ Available';
                statusClass = '';
            } else {
                statusText = '🎁 Claimed';
                statusClass = 'relic-claimed';
            }
            
            return `
                <div class="relic-card ${statusClass}">
                    <div class="relic-icon" style="background: ${relic.color};">${relic.icon}</div>
                    <div class="relic-info">
                        <div class="relic-name">${relic.name}</div>
                        <div class="relic-rarity ${relic.rarity.toLowerCase()}">${relic.rarity}</div>
                        <div class="relic-status">${statusText}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Add log entry
function addLogEntry(message, type = 'normal', category = 'game') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = message;
    
    // Route to the correct log based on category
    const targetLog = category === 'player' ? playerLogEl : gameLogEl;
    
    targetLog.insertBefore(logEntry, targetLog.firstChild);
    
    // Animate entry
    setTimeout(() => {
        logEntry.style.opacity = '1';
        logEntry.style.transform = 'translateY(0)';
    }, 10);
    
    // Keep only last 10 entries per log
    while (targetLog.children.length > 10) {
        targetLog.removeChild(targetLog.lastChild);
    }
}

// Simulate players escaping
function simulatePlayerEscapes() {
    // Only simulate escapes if there's loot or relics to incentivize escape
    if (gameData.accumulatedLoot === 0 && gameData.relics.length === 0) {
        return; // No one escapes if there's nothing to gain
    }
    
    // Calculate player's share of loot
    const playerShare = gameData.accumulatedLoot / gameData.playerCount;
    
    // Base escape rate depends on loot amount
    let escapeRate;
    const hasBreakEven = playerShare >= 10000;
    
    if (!hasBreakEven) {
        // Players with < $10k are VERY reluctant to escape
        // They only escape if there's extreme danger (multiple traps)
        const trapCount = gameData.trapCards.length;
        
        if (trapCount === 0) {
            escapeRate = 0.001; // 0.1% - almost no one leaves without danger
        } else if (trapCount === 1) {
            escapeRate = 0.005; // 0.5% - minimal escape with 1 trap
        } else if (trapCount === 2) {
            escapeRate = 0.02; // 2% - getting nervous
        } else {
            // 3+ traps - real danger, escape despite low loot
            escapeRate = 0.05 + (trapCount - 2) * 0.03; // 5% base + 3% per additional trap
        }
        
        // With low loot, bonus and relic incentives are minimal (only if significant)
        if (gameData.escapeBonusPool > PRIZE_POOL * 0.1) { // Only if bonus > 10% of pool
            escapeRate += 0.01; // Add 1% if significant bonus exists
        }
        
    } else {
        // Normal behavior for players with $10k+
        escapeRate = 0.05; // 5% base rate
        
        // Increase escape rate based on trap count (risk assessment)
        const trapRiskIncentive = gameData.trapCards.length * 0.03; // 3% per trap
        escapeRate += trapRiskIncentive;
        
        // Increase escape rate based on escape bonus pool (up to +10%)
        const bonusIncentive = Math.min((gameData.escapeBonusPool / PRIZE_POOL) * 20, 0.10);
        escapeRate += bonusIncentive;
        
        // Increase escape rate if there are relics (2% per relic, up to +10%)
        const relicIncentive = Math.min(gameData.relics.length * 0.02, 0.10);
        escapeRate += relicIncentive;
    }
    
    // Calculate number of players escaping
    // Only force at least 1 player if escape rate is reasonable (>= 0.5%)
    const calculatedEscapes = Math.floor(gameData.playerCount * escapeRate);
    const escapingPlayers = (escapeRate >= 0.005 && calculatedEscapes === 0) ? 1 : calculatedEscapes;
    
    // If no one is escaping, log it and return
    if (escapingPlayers === 0) {
        addLogEntry(`😌 No players escaped this round. All ${gameData.playerCount} players remain in the heist.`, 'info', 'player');
        return;
    }
    
    // Calculate what percentage of remaining players are escaping
    const escapePercentage = escapingPlayers / gameData.playerCount;
    
    // Maintain per-player share: remove escaping players' loot from accumulated loot
    const perPlayerLoot = gameData.accumulatedLoot / gameData.playerCount;
    const escapingPlayersLoot = perPlayerLoot * escapingPlayers;
    gameData.accumulatedLoot -= escapingPlayersLoot;
    
    // Split escape bonus pool among escapees - remainder stays, then reset pool to 0 + remainder
    let escapeBonusPerPlayer = 0;
    let remainder = 0;
    
    if (gameData.escapeBonusPool > 0) {
        escapeBonusPerPlayer = Math.floor(gameData.escapeBonusPool / escapingPlayers);
        const totalBonusPaid = escapeBonusPerPlayer * escapingPlayers;
        remainder = gameData.escapeBonusPool - totalBonusPaid;
        gameData.escapeBonusPool = remainder; // Reset to 0 + remainder
    }
    
    // Remove escaped players from player count
    const originalCount = gameData.playerCount;
    gameData.playerCount = Math.max(1, gameData.playerCount - escapingPlayers);
    
    const escapePercentDisplay = (escapePercentage * 100).toFixed(1);
    
    if (escapeBonusPerPlayer > 0) {
        addLogEntry(`🏃 ${escapingPlayers} player(s) escaped with loot (${escapePercentDisplay}%)! Each got ${formatMoney(perPlayerLoot)} + ${formatMoney(escapeBonusPerPlayer)} bonus. ${gameData.playerCount} players remain.`, 'info', 'player');
    } else {
        addLogEntry(`🏃 ${escapingPlayers} player(s) escaped with loot (${escapePercentDisplay}%)! Each got ${formatMoney(perPlayerLoot)}. ${gameData.playerCount} players remain.`, 'info', 'player');
    }
    
    // Check if there are relics available for raffle
    // Safety check: Must have relics AND escaping players
    if (gameData.relics.length > 0 && escapingPlayers > 0) {
        // Calculate threshold: 6.5% per relic
        const raffleThreshold = gameData.relics.length * 0.065;
        const thresholdPercent = (raffleThreshold * 100).toFixed(1);
        const actualEscapePercent = (escapePercentage * 100).toFixed(1);
        
        if (escapePercentage < raffleThreshold) {
            // Below threshold - hold raffle
            // Double-check relics still exist before raffle
            if (gameData.relics.length > 0) {
                const winnerIndex = Math.floor(Math.random() * escapingPlayers) + 1;
                const relicIndex = Math.floor(Math.random() * gameData.relics.length);
                const wonRelic = gameData.relics[relicIndex];
                
                // Verify we got a valid relic
                if (wonRelic) {
                    // Remove the won relic from the pool
                    gameData.relics.splice(relicIndex, 1);
                    
                    addLogEntry(`✨ RELIC RAFFLE! Player #${winnerIndex} won ${wonRelic.name} ${wonRelic.icon} (${actualEscapePercent}% escaped < ${thresholdPercent}% threshold). ${gameData.relics.length} relics remain.`, 'relic', 'player');
                }
            }
        } else {
            // At or above threshold - no raffle
            addLogEntry(`⚠️ Too many escapees (${actualEscapePercent}% ≥ ${thresholdPercent}% threshold for ${gameData.relics.length} relic(s)). No raffle held.`, 'warning', 'player');
        }
    }
}

// Make a move
function makeMove() {
    if (!gameData.gameActive) return;
    
    gameData.movesCount++;
    
    // Activate pending escape bonus from previous round (make it claimable)
    if (gameData.pendingEscapeBonus > 0) {
        gameData.escapeBonusPool += gameData.pendingEscapeBonus; // Add to existing pool (accumulates if unclaimed)
        gameData.pendingEscapeBonus = 0;
        updateGameDisplay(); // Update display immediately
    }
    
    // Activate newly discovered relic from previous round (make it available for raffle)
    if (gameData.newlyDiscoveredRelic) {
        gameData.relics.push(gameData.newlyDiscoveredRelic);
        addLogEntry(`🎁 ${gameData.newlyDiscoveredRelic.name} ${gameData.newlyDiscoveredRelic.icon} is now available for raffle!`, 'relic', 'game');
        gameData.newlyDiscoveredRelic = null;
        updateGameDisplay(); // Update display to show relic as available
    }
    
    // Check if all 3 relics have been discovered
    const allRelicsDrawn = gameData.discoveredRelics.length >= MAX_RELICS;
    
    // Adjust odds based on relic availability
    // Before all relics: 57.5% loot, 30% trap, 12.5% relic
    // After all relics: 70% loot, 30% trap
    const random = Math.random();
    
    if (allRelicsDrawn) {
        // All relics drawn - only loot and traps
        if (random < 0.70) {
            // Loot outcome
            drawLoot();
        } else {
            // Trap outcome
            drawTrap();
        }
    } else {
        // Still relics available
        if (random < 0.575) {
            // Loot outcome
            drawLoot();
        } else if (random < 0.875) {
            // Trap outcome
            drawTrap();
        } else {
            // Relic outcome
            drawRelic();
        }
    }
    
    // Update display after game environment changes
    updateGameDisplay();
    
    // Check if prize pool is depleted
    if (gameData.remainingPrizePool <= 0) {
        triggerPrizePoolDepletion();
        return;
    }
    
    // Small delay to ensure game environment logs appear first, then simulate player actions
    setTimeout(() => {
        simulatePlayerEscapes();
        updateGameDisplay();
    }, 100);
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
    const totalLoot = Math.floor(gameData.remainingPrizePool * percentage); // Use REMAINING prize pool
    
    // 5% goes to pending escape bonus (available next round)
    const escapeBonus = Math.floor(totalLoot * ESCAPE_BONUS_PERCENTAGE);
    const lootAmount = totalLoot - escapeBonus;
    
    // Loot is split equally among REMAINING players only
    // Store total accumulated loot (not per player)
    gameData.accumulatedLoot += lootAmount;
    gameData.pendingEscapeBonus = escapeBonus; // Set as pending (not yet claimable)
    gameData.remainingPrizePool -= totalLoot; // Deduct from remaining prize pool
    
    const perPlayerAmount = Math.floor(lootAmount / gameData.playerCount);
    const percentageStr = (percentage * 100).toFixed(1);
    const remainingPercent = ((gameData.remainingPrizePool / PRIZE_POOL) * 100).toFixed(1);
    addLogEntry(`💰 LOOT SECURED! Drew ${percentageStr}% of remaining prize pool (${formatMoney(perPlayerAmount)} per player + ${formatMoney(escapeBonus)} Escape Bonus). ${remainingPercent}% of total pool remains.`, 'success', 'game');
}

// Draw relic
function drawRelic() {
    // Check if max relics already drawn
    if (gameData.discoveredRelics.length >= MAX_RELICS) {
        // Shouldn't happen, but fallback to loot
        drawLoot();
        return;
    }
    
    const randomRelic = RELIC_TYPES[Math.floor(Math.random() * RELIC_TYPES.length)];
    
    // Store as newly discovered (available for raffle next turn)
    gameData.newlyDiscoveredRelic = randomRelic;
    gameData.discoveredRelics.push(randomRelic); // Add to discovered relics for display
    
    addLogEntry(`✨ RELIC DISCOVERED! Found ${randomRelic.name} ${randomRelic.icon} (${randomRelic.rarity}) - ${gameData.discoveredRelics.length}/${MAX_RELICS} relics found. Available next turn!`, 'relic', 'game');
    
    // Notify when all relics are found
    if (gameData.discoveredRelics.length >= MAX_RELICS) {
        addLogEntry(`🎊 ALL ${MAX_RELICS} RELICS FOUND! No more relics available - odds now 70% loot, 30% trap!`, 'relic', 'game');
    }
}

// Draw trap
function drawTrap() {
    const randomTrap = TRAP_TYPES[Math.floor(Math.random() * TRAP_TYPES.length)];
    gameData.trapCards.push(randomTrap);
    
    addLogEntry(`🚨 TRAP ENCOUNTERED! ${randomTrap.name} ${randomTrap.icon} discovered in the vault!`, 'warning', 'game');
    
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
    addLogEntry(`🚨 ALARM TRIGGERED! Two ${duplicateTrap.name} detected! YOU'VE BEEN CAPTURED!`, 'danger', 'game');
    
    setTimeout(() => {
        showGameOverState(duplicateTrap);
    }, 1500);
}

// Prize pool depletion (game ends, raffle remaining relics)
function triggerPrizePoolDepletion() {
    gameData.gameActive = false;
    addLogEntry(`💰 PRIZE POOL DEPLETED! All money has been taken from the vault!`, 'warning', 'game');
    
    // Check if there are unclaimed relics
    const unclaimedRelics = gameData.relics.length;
    if (unclaimedRelics > 0 && gameData.playerCount > 0) {
        addLogEntry(`✨ ${unclaimedRelics} relic(s) remain! All ${gameData.playerCount} remaining thieves will raffle for them!`, 'relic', 'player');
        
        // Player has a chance to win one of the remaining relics
        const winChance = 1 / gameData.playerCount;
        let wonRelic = null;
        if (Math.random() < winChance) {
            // Verify relics still exist before accessing
            if (gameData.relics.length > 0) {
                const relicIndex = Math.floor(Math.random() * gameData.relics.length);
                wonRelic = gameData.relics[relicIndex];
                
                // Verify we got a valid relic
                if (wonRelic) {
                    // Remove the won relic from the pool
                    gameData.relics.splice(relicIndex, 1);
                    
                    addLogEntry(`🎉 YOU WON THE FINAL RAFFLE! Claimed ${wonRelic.name} ${wonRelic.icon}`, 'relic', 'player');
                }
            }
        }
        
        setTimeout(() => {
            showPrizePoolDepletionState(wonRelic);
        }, 1500);
    } else {
        addLogEntry(`🏃 No relics remain. Time to escape!`, 'info', 'player');
        setTimeout(() => {
            showPrizePoolDepletionState(null);
        }, 1500);
    }
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
    
    // Calculate per-player loot share BEFORE reducing player count
    const playerLootShare = gameData.accumulatedLoot / gameData.playerCount;
    
    // Maintain per-player share: remove escaping players' loot from accumulated loot
    const escapingPlayersLoot = playerLootShare * totalEscapees;
    gameData.accumulatedLoot -= escapingPlayersLoot;
    
    // Split escape bonus pool among escapees - remainder stays, then reset pool to 0 + remainder
    let escapeBonusShare = 0;
    let totalEscapeBonus = 0;
    
    if (gameData.escapeBonusPool > 0) {
        escapeBonusShare = Math.floor(gameData.escapeBonusPool / totalEscapees);
        totalEscapeBonus = escapeBonusShare * totalEscapees;
        const remainder = gameData.escapeBonusPool - totalEscapeBonus;
        gameData.escapeBonusPool = remainder; // Reset to 0 + remainder
    }
    
    // Update player count
    gameData.playerCount = Math.max(1, gameData.playerCount - totalEscapees);
    
    // Determine if player wins a relic
    // Dynamic threshold: 6.5% per relic (1 relic = 6.5%, 2 relics = 13%, 3 relics = 19.5%, etc.)
    // (Prevents mass exodus from claiming all relics)
    let wonRelic = null;
    let raffleWasHeld = false;
    
    // Store the count BEFORE any raffle, for display purposes
    const relicsBeforeRaffle = gameData.relics.length;
    
    if (gameData.relics.length > 0 && totalEscapees > 0) {
        const raffleThreshold = gameData.relics.length * 0.065;
        const thresholdPercent = (raffleThreshold * 100).toFixed(1);
        const actualEscapePercent = (escapePercentage * 100).toFixed(1);
        
        if (escapePercentage < raffleThreshold) {
            raffleWasHeld = true;
            // Below threshold - hold exclusive raffle
            const winChance = 1 / totalEscapees;
            if (Math.random() < winChance) {
                // Double-check relics still exist
                if (gameData.relics.length > 0) {
                    const relicIndex = Math.floor(Math.random() * gameData.relics.length);
                    wonRelic = gameData.relics[relicIndex];
                    
                    // Verify we got a valid relic
                    if (wonRelic) {
                        // Remove the won relic from the pool
                        gameData.relics.splice(relicIndex, 1);
                        
                        addLogEntry(`🎉 WON RELIC RAFFLE! Claimed ${wonRelic.name} ${wonRelic.icon} (${actualEscapePercent}% escaped < ${thresholdPercent}% threshold). ${gameData.relics.length} relics remain.`, 'relic', 'player');
                    }
                }
            } else {
                addLogEntry(`😔 Lost the relic raffle among ${totalEscapees} escapees (${actualEscapePercent}% escaped)... Better luck next time!`, 'info', 'player');
            }
        } else {
            // At or above threshold - too many people, no raffle
            addLogEntry(`⚠️ Too many escapees for relic raffle (${actualEscapePercent}% ≥ ${thresholdPercent}% threshold for ${gameData.relics.length} relic(s)). Relics remain in vault!`, 'warning', 'player');
        }
    }
    
    addLogEntry(`🏃 ESCAPING WITH LOOT! ${totalEscapees} players escaped this round. Your share: ${formatMoney(playerLootShare)} + Escape Bonus: ${formatMoney(escapeBonusShare)}`, 'success', 'player');
    
    setTimeout(() => {
        showSuccessState(totalEscapeBonus, wonRelic, totalEscapees, raffleWasHeld);
    }, 1000);
}

// Reset game
function resetGame() {
    gameData = {
        accumulatedLoot: 0,
        escapeBonusPool: 0,
        pendingEscapeBonus: 0,
        remainingPrizePool: PRIZE_POOL,
        playerCount: INITIAL_PLAYER_COUNT,
        movesCount: 0,
        lootDrawCount: 0,
        trapCards: [],
        relics: [],
        discoveredRelics: [],
        newlyDiscoveredRelic: null,
        gameActive: false
    };
    
    gameLogEl.innerHTML = '<div class="log-entry initial">Waiting for game to start...</div>';
    playerLogEl.innerHTML = '<div class="log-entry initial">No player actions yet...</div>';
}

// Start game
function startGame() {
    resetGame();
    gameData.gameActive = true;
    showGameState();
    addLogEntry(`🎯 HEIST STARTED! ${gameData.playerCount} thieves entered the vault.`, 'info', 'game');
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
