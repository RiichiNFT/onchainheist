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
const playersToEliminateEl = document.getElementById('playersToEliminate');
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
const ESCAPE_BONUS_PERCENTAGE = 0.12; // 12% of loot goes to escape bonus
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
    { name: 'BAYC NFT', image: 'visuals/bayc.jpg', color: '#ffd700', rarity: 'Legendary' },
    { name: 'CryptoPunk NFT', image: 'visuals/punk.jpg', color: '#4ecdc4', rarity: 'Legendary' },
    { name: 'Ethernals NFT', image: 'visuals/ethernals.jpg', color: '#ffed4e', rarity: 'Legendary' }
];

// Game state
let gameData = {
    accumulatedLoot: 0,
    playerLootShare: 0, // Track per-player loot share directly (avoids rounding errors)
    lastRoundLoot: 0, // Loot accumulated before current round started (for escape calculation)
    lastRoundPlayerShare: 0, // Per-player share from last round (for escape calculation)
    escapeBonusPool: 0, // Available for claiming NOW
    pendingEscapeBonus: 0, // Just drawn, available NEXT round
    remainingPrizePool: PRIZE_POOL, // Track remaining prize pool
    playerCount: INITIAL_PLAYER_COUNT, // Start with 500 players
    eliminatedPlayers: 0, // Track eliminated players (caught by traps)
    movesCount: 0,
    lootDrawCount: 0, // Track how many times loot has been drawn
    trapCards: [],
    uniqueTrapTypes: new Set(), // Track unique security threats for security level
    relics: [], // Available relics (for raffle)
    discoveredRelics: [], // All discovered relics (for display)
    newlyDiscoveredRelic: null, // Relic discovered this turn (not yet available for raffle)
    oddsChangedLogged: false, // Track if odds change message has been logged
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
    lootLostEl.textContent = formatMoney(gameData.playerLootShare);
    movesSurvivedEl.textContent = gameData.movesCount;
    
    // Show the trap information or elimination message
    if (duplicateTrap) {
        duplicateTrapsEl.innerHTML = `
            <div class="alarm-trap-card">
                <div class="trap-icon" style="background: ${duplicateTrap.color};">${duplicateTrap.icon}</div>
                <div class="trap-name">${duplicateTrap.name}</div>
                <div class="alarm-text">DUPLICATE DETECTED!</div>
            </div>
        `;
    } else {
        duplicateTrapsEl.innerHTML = `
            <div class="alarm-trap-card">
                <div class="trap-icon" style="background: #ff0000;">💀</div>
                <div class="trap-name">All Players Eliminated</div>
                <div class="alarm-text">${gameData.eliminatedPlayers} PLAYERS CAUGHT BY TRAPS!</div>
            </div>
        `;
    }
}

// Show prize pool depletion state
function showPrizePoolDepletionState(wonRelic) {
    hideAllStates();
    successState.classList.remove('hidden');
    
    const share = gameData.playerLootShare;
    const escapeBonusShare = Math.floor(gameData.escapeBonusPool / gameData.playerCount);
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
                <h3>🎊 FINAL ARTIFACT RAFFLE WON! 🎊</h3>
                <div class="won-relic-card">
                    <div class="relic-icon" style="background: ${wonRelic.color};">
                        <img src="${wonRelic.image}" alt="${wonRelic.name}" class="relic-image">
                    </div>
                    <div class="relic-name">${wonRelic.name}</div>
                    <div class="relic-rarity ${wonRelic.rarity.toLowerCase()}">${wonRelic.rarity}</div>
                </div>
                <p class="relic-message">💰 Prize pool depleted! You won the final raffle for remaining artifacts!</p>
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

// Show solo winner state (last player standing)
function showSoloWinnerState(totalWinnings, allRelics) {
    hideAllStates();
    successState.classList.remove('hidden');
    
    // Display total winnings (all remaining prize pool)
    yourTotalShareEl.textContent = formatMoney(totalWinnings);
    escapeBonusLabelEl.textContent = `(SOLO WINNER - TOOK EVERYTHING!)`;
    
    // Display that you were the last one standing
    thievesEscapedEl.textContent = '1 (YOU)';
    
    // Display all relics won
    if (allRelics.length > 0) {
        relicRewardEl.innerHTML = `
            <div class="relic-won">
                <h3>🏆 JACKPOT! ALL RELICS CLAIMED! 🏆</h3>
                ${allRelics.map(relic => `
                    <div class="won-relic-card">
                        <div class="relic-icon" style="background: ${relic.color};">
                            <img src="${relic.image}" alt="${relic.name}" class="relic-image">
                        </div>
                        <div class="relic-name">${relic.name}</div>
                        <div class="relic-rarity ${relic.rarity.toLowerCase()}">${relic.rarity}</div>
                    </div>
                `).join('')}
                <p class="relic-message">As the last thief standing, you claimed ALL remaining relics!</p>
            </div>
        `;
    } else {
        relicRewardEl.innerHTML = `
            <div class="relic-not-won">
                <p class="relic-message">All relics were already claimed, but you got all the remaining money!</p>
            </div>
        `;
    }
}

// Show success state
function showSuccessState(escapeBonus, wonRelic, totalEscapees, raffleHeld, playerLootShare, playerEscapeBonusShare) {
    hideAllStates();
    successState.classList.remove('hidden');
    
    // Use the passed-in player shares (calculated before escape)
    const share = playerLootShare || 0;
    const escapeBonusShare = playerEscapeBonusShare || 0;
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
                <h3>🎊 ARTIFACT WON! 🎊</h3>
                <div class="won-relic-card">
                    <div class="relic-icon" style="background: ${wonRelic.color};">
                        <img src="${wonRelic.image}" alt="${wonRelic.name}" class="relic-image">
                    </div>
                    <div class="relic-name">${wonRelic.name}</div>
                    <div class="relic-rarity ${wonRelic.rarity.toLowerCase()}">${wonRelic.rarity}</div>
                </div>
                <p class="relic-message">You won the raffle and claimed this precious artifact!</p>
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
    // Use the tracked per-player loot share (avoids rounding errors from changing player count)
    yourShareLootEl.textContent = formatMoney(gameData.playerLootShare);
    
    // Show escape bonus pool - total of current claimable + pending for next round
    const totalEscapeBonus = gameData.escapeBonusPool + gameData.pendingEscapeBonus;
    escapeBonusTotalEl.textContent = formatMoney(totalEscapeBonus);
    
    remainingPrizePoolEl.textContent = formatMoney(gameData.remainingPrizePool);
    playerCountEl.textContent = gameData.playerCount;
    movesCountEl.textContent = gameData.movesCount;
    
    // Calculate and display players to eliminate next round based on security level
    const securityLevel = gameData.uniqueTrapTypes.size;
    let eliminationRate = 0;
    if (securityLevel === 1) eliminationRate = 0.15;
    else if (securityLevel === 2) eliminationRate = 0.30;
    else if (securityLevel === 3) eliminationRate = 0.45;
    else if (securityLevel === 4) eliminationRate = 0.60;
    else if (securityLevel >= 5) eliminationRate = 0.75;
    
    const playersToEliminate = Math.floor(gameData.playerCount * eliminationRate);
    playersToEliminateEl.textContent = playersToEliminate;
    
    // Update trap cards display
    if (gameData.trapCards.length === 0) {
        trapCardsContainerEl.innerHTML = '<div class="empty-state">Security Level 0</div>';
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
        relicsContainerEl.innerHTML = '<div class="empty-state">No Artifacts found</div>';
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
                    <div class="relic-icon" style="background: ${relic.color};">
                        <img src="${relic.image}" alt="${relic.name}" class="relic-image">
                    </div>
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
    // If there's no loot and no relics to incentivize escape, no one leaves
    if (gameData.accumulatedLoot === 0 && gameData.relics.length === 0) {
        addLogEntry(`😌 No players escaped this round. All ${gameData.playerCount} players remain in the heist.`, 'info', 'player');
        return;
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
        if (gameData.escapeBonusPool > 100000) { // Big bonus pool incentive ($100k+)
            escapeRate += 0.03; // Add 3% if big bonus pool exists
        } else if (gameData.escapeBonusPool > PRIZE_POOL * 0.1) { // Only if bonus > 10% of pool
            escapeRate += 0.01; // Add 1% if significant bonus exists
        }
        
    } else {
        // Normal behavior for players with $10k+
        escapeRate = 0.05; // 5% base rate
        
        // Increase escape rate based on trap count (risk assessment)
        const trapRiskIncentive = gameData.trapCards.length * 0.03; // 3% per trap
        escapeRate += trapRiskIncentive;
        
        // MAJOR INCENTIVE: Big escape bonus pool ($100k+)
        if (gameData.escapeBonusPool > 100000) {
            escapeRate += 0.15; // Add 15% if bonus pool exceeds $100k!
        } else {
            // Normal escape bonus incentive (up to +10%)
            const bonusIncentive = Math.min((gameData.escapeBonusPool / PRIZE_POOL) * 20, 0.10);
            escapeRate += bonusIncentive;
        }
        
        // Increase escape rate if there are relics (4% per relic, up to +15%)
        const relicIncentive = Math.min(gameData.relics.length * 0.04, 0.15);
        escapeRate += relicIncentive;
    }
    
    // BONUS: Newly discovered relic creates excitement/fear - more escapes
    if (gameData.newlyDiscoveredRelic) {
        escapeRate += 0.05; // Add 5% when a relic was just discovered
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
    
    // Escaping players get LAST ROUND's per-player share only (not current round loot)
    // This ensures they don't get loot revealed in the current round
    const perPlayerLoot = gameData.lastRoundPlayerShare;
    const escapingPlayersLoot = perPlayerLoot * escapingPlayers;
    
    // Remove escaping players' loot from accumulated total
    // Remaining players will share what's left (including all current round loot)
    gameData.accumulatedLoot -= escapingPlayersLoot;
    
    // Split ONLY claimable escape bonus among escapees (not pending bonus from current round)
    // Pending bonus stays for next round, just like loot distribution
    let escapeBonusPerPlayer = 0;
    
    if (gameData.escapeBonusPool > 0) {
        escapeBonusPerPlayer = Math.floor(gameData.escapeBonusPool / escapingPlayers);
        const totalBonusPaid = escapeBonusPerPlayer * escapingPlayers;
        const remainder = gameData.escapeBonusPool - totalBonusPaid;
        gameData.escapeBonusPool = remainder; // Reset to remainder only
        // pendingEscapeBonus stays untouched for next round
    }
    
    // Remove escaped players from player count
    const originalCount = gameData.playerCount;
    gameData.playerCount = Math.max(1, gameData.playerCount - escapingPlayers);
    
    const escapePercentDisplay = (escapePercentage * 100).toFixed(1);
    
    // Build the consolidated log message
    let logMessage = `🏃 ${escapingPlayers} player(s) escaped with loot (${escapePercentDisplay}%)! Each got ${formatMoney(perPlayerLoot)}`;
    
    if (escapeBonusPerPlayer > 0) {
        logMessage += ` + ${formatMoney(escapeBonusPerPlayer)} bonus`;
    }
    
    logMessage += `. ${gameData.playerCount} players remain.`;
    
    // Check if there are relics available for raffle
    // Safety check: Must have relics AND escaping players
    let logType = 'info';
    if (gameData.relics.length > 0 && escapingPlayers > 0) {
        // Calculate threshold: 6.5% per relic
        const raffleThreshold = gameData.relics.length * 0.065;
        const thresholdPercent = (raffleThreshold * 100).toFixed(1);
        const actualEscapePercent = (escapePercentage * 100).toFixed(1);
        
        if (escapePercentage < raffleThreshold) {
            // Below threshold - hold raffle for ALL available relics
            const relicsToRaffle = [...gameData.relics]; // Copy array since we'll be modifying it
            const raffleResults = [];
            const winners = new Set(); // Track which players have won (max 1 per player)
            
            for (let i = 0; i < relicsToRaffle.length; i++) {
                const relic = relicsToRaffle[i];
                
                // Find a winner who hasn't won yet
                let winnerIndex;
                let attempts = 0;
                do {
                    winnerIndex = Math.floor(Math.random() * escapingPlayers) + 1;
                    attempts++;
                    // If all players have won or we've tried too many times, allow duplicate
                    if (attempts > 100 || winners.size >= escapingPlayers) break;
                } while (winners.has(winnerIndex));
                
                winners.add(winnerIndex);
                raffleResults.push({ winner: winnerIndex, relic: relic });
                
                // Remove the relic from the pool
                const relicIndex = gameData.relics.findIndex(r => r.name === relic.name);
                if (relicIndex !== -1) {
                    gameData.relics.splice(relicIndex, 1);
                }
            }
            
            // Build log message for raffle results
            if (raffleResults.length === 1) {
                const result = raffleResults[0];
                logMessage += ` ✨ ARTIFACT RAFFLE: Player #${result.winner} won ${result.relic.name}.`;
            } else {
                logMessage += ` ✨ ARTIFACT RAFFLE: ${raffleResults.map(r => `Player #${r.winner} won ${r.relic.name}`).join(', ')}.`;
            }
            logMessage += ` (${actualEscapePercent}% < ${thresholdPercent}% threshold). ${gameData.relics.length} relics remain.`;
            logType = 'relic';
        } else {
            // At or above threshold - no raffle
            logMessage += ` ⚠️ No relic raffle (${actualEscapePercent}% ≥ ${thresholdPercent}% threshold for ${gameData.relics.length} relic(s)).`;
            logType = 'warning';
        }
    }
    
    // Add single consolidated log entry
    // Check if it's a teasing message (empty-handed escape)
    if (perPlayerLoot === 0 && escapeBonusPerPlayer === 0) {
        logMessage = `😅 ${escapingPlayers} player(s) chickened out with NOTHING (${escapePercentDisplay}%)! Better safe than sorry, right? ${gameData.playerCount} braver players remain.`;
        logType = 'warning';
    }
    
    addLogEntry(logMessage, logType, 'player');
}

// Make a move
function makeMove() {
    if (!gameData.gameActive) return;
    
    gameData.movesCount++;
    
    // After first move, change button text from "Start Heist" to "Double Down"
    if (gameData.movesCount === 1) {
        const continueBtnIcon = continueBtn.querySelector('.btn-icon');
        const continueBtnText = continueBtn.querySelector('.btn-text');
        continueBtnIcon.textContent = '💰';
        continueBtnText.textContent = 'DOUBLE DOWN';
    }
    
    // ELIMINATION MECHANIC: Eliminate players based on security level
    if (gameData.uniqueTrapTypes.size > 0) {
        // Security Level based elimination rates
        const securityLevel = gameData.uniqueTrapTypes.size;
        let eliminationRate = 0;
        
        // Security Level elimination rates: 15%, 30%, 45%, 60%, 75% (caps at 75%)
        if (securityLevel === 1) eliminationRate = 0.15;
        else if (securityLevel === 2) eliminationRate = 0.30;
        else if (securityLevel === 3) eliminationRate = 0.45;
        else if (securityLevel === 4) eliminationRate = 0.60;
        else if (securityLevel >= 5) eliminationRate = 0.75;
        
        const playersToEliminate = Math.floor(gameData.playerCount * eliminationRate);
        
        if (playersToEliminate > 0) {
            gameData.playerCount = Math.max(0, gameData.playerCount - playersToEliminate);
            gameData.eliminatedPlayers += playersToEliminate;
            
            const eliminationPercent = (eliminationRate * 100).toFixed(0);
            addLogEntry(`⚠️ SECURITY ELIMINATION! ${playersToEliminate} players caught (${eliminationPercent}% elimination rate at Security Level ${securityLevel}). ${gameData.playerCount} players remain.`, 'danger', 'player');
            
            // Check if all players eliminated
            if (checkAllPlayersEliminated()) {
                return;
            }
        }
    }
    
    // Save current loot values as last round's values (before new draw)
    // This is what players get if they escape this round
    gameData.lastRoundLoot = gameData.accumulatedLoot;
    gameData.lastRoundPlayerShare = gameData.playerLootShare;
    
    // Activate pending escape bonus from previous round (make it claimable)
    if (gameData.pendingEscapeBonus > 0) {
        gameData.escapeBonusPool += gameData.pendingEscapeBonus; // Add to existing pool (accumulates if unclaimed)
        gameData.pendingEscapeBonus = 0;
        updateGameDisplay(); // Update display immediately
    }
    
    // Activate newly discovered relic from previous round (make it available for raffle)
    if (gameData.newlyDiscoveredRelic) {
        gameData.relics.push(gameData.newlyDiscoveredRelic);
        gameData.newlyDiscoveredRelic = null;
        updateGameDisplay(); // Update display to show relic as available
    }
    
    // Check if all relics have been TAKEN (claimed by players via raffle)
    // All relics are taken when: all discovered AND none available AND none pending
    const allRelicsTaken = gameData.discoveredRelics.length >= MAX_RELICS && 
                           gameData.relics.length === 0 && 
                           gameData.newlyDiscoveredRelic === null;
    
    // Log odds change when all relics are taken
    if (allRelicsTaken && !gameData.oddsChangedLogged) {
        addLogEntry(`🎊 ALL ${MAX_RELICS} RELICS TAKEN! Odds now 60% loot, 40% trap!`, 'relic', 'game');
        gameData.oddsChangedLogged = true;
    }
    
    // Adjust odds based on whether all relics are taken
    // HIGH RISK MODE: Before all relics taken: 50% loot, 40% trap, 10% relic
    // After all relics taken: 60% loot, 40% trap
    const random = Math.random();
    
    if (allRelicsTaken) {
        // All relics taken - only loot and traps
        if (random < 0.60) {
            // Loot outcome
            drawLoot();
        } else {
            // Trap outcome
            drawTrap();
        }
    } else {
        // Still relics available or undiscovered
        if (random < 0.50) {
            // Loot outcome
            drawLoot();
        } else if (random < 0.90) {
            // Trap outcome (40% chance)
            drawTrap();
        } else {
            // Relic outcome (10% chance)
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
        
        // Check if only 1 player remains - they win everything!
        checkSoloWinner();
    }, 100);
}

// Draw loot
function drawLoot() {
    gameData.lootDrawCount++;
    
    // Determine percentage range based on loot draw count
    // High risk, high reward: aggressive percentages for fast-paced games
    let minPercent, maxPercent;
    if (gameData.lootDrawCount <= 2) {
        // Draws 1-2: 20%-35%
        minPercent = 0.20;
        maxPercent = 0.35;
    } else if (gameData.lootDrawCount <= 4) {
        // Draws 3-4: 30%-45%
        minPercent = 0.30;
        maxPercent = 0.45;
    } else if (gameData.lootDrawCount <= 6) {
        // Draws 5-6: 40%-55%
        minPercent = 0.40;
        maxPercent = 0.55;
    } else {
        // Draws 7+: 45%-60%
        minPercent = 0.45;
        maxPercent = 0.60;
    }
    
    const percentage = Math.random() * (maxPercent - minPercent) + minPercent;
    const totalLoot = Math.floor(gameData.remainingPrizePool * percentage); // Use REMAINING prize pool
    
    // 12% goes to pending escape bonus (available next round)
    let escapeBonus = Math.floor(totalLoot * ESCAPE_BONUS_PERCENTAGE);
    const lootAmount = totalLoot - escapeBonus;
    
    // Calculate per-player share (rounded down)
    const perPlayerAmount = Math.floor(lootAmount / gameData.playerCount);
    
    // Calculate actual distributed loot (may be less than lootAmount due to rounding)
    const distributedLoot = perPlayerAmount * gameData.playerCount;
    
    // Any remainder from rounding goes to escape bonus
    const remainder = lootAmount - distributedLoot;
    escapeBonus += remainder;
    
    // Store total accumulated loot (exactly what's distributed to players)
    gameData.accumulatedLoot += distributedLoot;
    
    // Update per-player share directly (this is what each remaining player has)
    gameData.playerLootShare += perPlayerAmount;
    
    gameData.pendingEscapeBonus = escapeBonus; // Set as pending (not yet claimable)
    gameData.remainingPrizePool -= totalLoot; // Deduct from remaining prize pool
    
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
    
    // Include "All relics found!" in the discovery message if this is the last one
    let logMessage = `✨ RELIC DISCOVERED! Found ${randomRelic.name} ${randomRelic.icon} (${randomRelic.rarity}) - ${gameData.discoveredRelics.length}/${MAX_RELICS} relics found. Available next turn!`;
    if (gameData.discoveredRelics.length >= MAX_RELICS) {
        logMessage += ` 🎊 All relics found!`;
    }
    
    addLogEntry(logMessage, 'relic', 'game');
}

// Draw trap
function drawTrap() {
    const randomTrap = TRAP_TYPES[Math.floor(Math.random() * TRAP_TYPES.length)];
    
    // Check if this is a duplicate (same trap drawn before)
    const isDuplicate = gameData.trapCards.some(trap => trap.name === randomTrap.name);
    
    gameData.trapCards.push(randomTrap);
    
    if (isDuplicate) {
        // DUPLICATE TRAP = INSTANT GAME OVER FOR EVERYONE!
        addLogEntry(`🚨 DUPLICATE TRAP! ${randomTrap.name} ${randomTrap.icon} encountered again!`, 'danger', 'game');
        triggerAlarm(randomTrap);
        return;
    }
    
    // New unique security threat - increase security level
    gameData.uniqueTrapTypes.add(randomTrap.name);
    const securityLevel = gameData.uniqueTrapTypes.size;
    
    // Calculate elimination rate based on security level
    let eliminationRate = 0;
    if (securityLevel === 1) eliminationRate = 15;
    else if (securityLevel === 2) eliminationRate = 30;
    else if (securityLevel === 3) eliminationRate = 45;
    else if (securityLevel === 4) eliminationRate = 60;
    else if (securityLevel >= 5) eliminationRate = 75;
    
    addLogEntry(`🚨 NEW SECURITY THREAT! ${randomTrap.name} ${randomTrap.icon} discovered! Security Level now ${securityLevel}. Elimination rate: ${eliminationRate}% per round.`, 'danger', 'game');
}

// Check if all players eliminated (new end condition)
function checkAllPlayersEliminated() {
    if (gameData.playerCount <= 0) {
        gameData.gameActive = false;
        addLogEntry(`💀 ALL PLAYERS ELIMINATED! Everyone was caught by the traps!`, 'danger', 'game');
        
        setTimeout(() => {
            showGameOverState(null);
        }, 1500);
        return true;
    }
    return false;
}

// Check if only 1 player remains (solo winner!)
function checkSoloWinner() {
    if (gameData.playerCount === 1 && gameData.gameActive) {
        gameData.gameActive = false;
        
        addLogEntry(`🏆 SOLO VICTORY! You're the last thief standing! You take EVERYTHING!`, 'relic', 'game');
        
        // Player gets all remaining prize pool + all remaining relics
        const soloWinnings = gameData.remainingPrizePool;
        const allRelics = [...gameData.relics, ...(gameData.newlyDiscoveredRelic ? [gameData.newlyDiscoveredRelic] : [])];
        
        // Clear everything
        gameData.remainingPrizePool = 0;
        gameData.relics = [];
        gameData.newlyDiscoveredRelic = null;
        
        setTimeout(() => {
            showSoloWinnerState(soloWinnings, allRelics);
        }, 1500);
        return true;
    }
    return false;
}

// Trigger alarm (game over) - DUPLICATE TRAP
function triggerAlarm(duplicateTrap) {
    gameData.gameActive = false;
    addLogEntry(`🚨 ALARM TRIGGERED! Duplicate ${duplicateTrap.name} detected! EVERYONE ELIMINATED!`, 'danger', 'game');
    
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
                    
                    addLogEntry(`🎉 YOU WON THE FINAL RAFFLE! Claimed ${wonRelic.name}`, 'relic', 'player');
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
    
    // MAJOR INCENTIVE: Big escape bonus pool ($100k+)
    let bonusIncentive;
    if (gameData.escapeBonusPool > 100000) {
        bonusIncentive = 0.20; // 20% bonus if pool exceeds $100k!
    } else {
        bonusIncentive = Math.min((gameData.escapeBonusPool / PRIZE_POOL) * 15, 0.12);
    }
    
    const relicIncentive = Math.min(gameData.relics.length * 0.04, 0.15);
    
    // BONUS: Newly discovered relic creates excitement/fear
    const newRelicBonus = gameData.newlyDiscoveredRelic ? 0.05 : 0;
    
    const totalEscapeRate = baseEscapeRate + bonusIncentive + relicIncentive + newRelicBonus;
    
    const otherEscapingPlayers = Math.floor((gameData.playerCount - 1) * totalEscapeRate);
    const totalEscapees = otherEscapingPlayers + 1; // +1 for the player
    
    // Calculate what percentage of remaining players are escaping
    const escapePercentage = totalEscapees / gameData.playerCount;
    
    // Player gets CURRENT loot share (including this round) when manually escaping
    // This is different from AI escapes which use lastRoundPlayerShare
    const playerLootShare = gameData.playerLootShare;
    
    // Maintain per-player share: remove escaping players' loot from accumulated loot
    const escapingPlayersLoot = playerLootShare * totalEscapees;
    gameData.accumulatedLoot -= escapingPlayersLoot;
    
    // Split ONLY claimable escape bonus among escapees (not pending bonus from current round)
    // Pending bonus stays for next round, just like loot distribution
    let escapeBonusShare = 0;
    let totalEscapeBonus = 0;
    
    if (gameData.escapeBonusPool > 0) {
        escapeBonusShare = Math.floor(gameData.escapeBonusPool / totalEscapees);
        totalEscapeBonus = escapeBonusShare * totalEscapees;
        const remainder = gameData.escapeBonusPool - totalEscapeBonus;
        gameData.escapeBonusPool = remainder; // Reset to remainder only
        // pendingEscapeBonus stays untouched for next round
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
            // Below threshold - hold raffle for ALL available relics
            const relicsToRaffle = [...gameData.relics]; // Copy array since we'll be modifying it
            const raffleResults = [];
            let playerHasWon = false; // Track if player has won (max 1 per player)
            const winnerIndices = new Set(); // Track which other players have won
            
            for (let i = 0; i < relicsToRaffle.length; i++) {
                const relic = relicsToRaffle[i];
                
                // Determine winner for this relic
                // If player hasn't won yet, give them a chance
                const winnerSlot = Math.floor(Math.random() * totalEscapees);
                const isPlayerWinner = (winnerSlot === 0) && !playerHasWon; // Player is slot 0
                
                if (isPlayerWinner) {
                    // Player wins this relic
                    playerHasWon = true;
                    wonRelic = relic; // Only store the first one they win
                    raffleResults.push({ winner: 'You', relic: relic });
                } else {
                    // Another player wins
                    // Find an NPC winner who hasn't won yet
                    let npcWinnerIndex;
                    let attempts = 0;
                    do {
                        npcWinnerIndex = Math.floor(Math.random() * (totalEscapees - 1)) + 1; // 1 to totalEscapees-1
                        attempts++;
                        if (attempts > 100 || winnerIndices.size >= (totalEscapees - 1)) break;
                    } while (winnerIndices.has(npcWinnerIndex));
                    
                    winnerIndices.add(npcWinnerIndex);
                    raffleResults.push({ winner: `Player #${npcWinnerIndex}`, relic: relic });
                }
                
                // Remove the relic from the pool
                const relicIndex = gameData.relics.findIndex(r => r.name === relic.name);
                if (relicIndex !== -1) {
                    gameData.relics.splice(relicIndex, 1);
                }
            }
            
            // Build log message
            if (wonRelic) {
                const otherWinners = raffleResults.filter(r => r.winner !== 'You');
                if (otherWinners.length > 0) {
                    addLogEntry(`🎉 WON ARTIFACT RAFFLE! You claimed ${wonRelic.name}! Others won: ${otherWinners.map(r => `${r.winner} (${r.relic.name})`).join(', ')}. (${actualEscapePercent}% < ${thresholdPercent}% threshold). ${gameData.relics.length} artifacts remain.`, 'relic', 'player');
                } else {
                    addLogEntry(`🎉 WON ARTIFACT RAFFLE! Claimed ${wonRelic.name} (${actualEscapePercent}% escaped < ${thresholdPercent}% threshold). ${gameData.relics.length} artifacts remain.`, 'relic', 'player');
                }
            } else {
                addLogEntry(`😔 Lost the artifact raffle among ${totalEscapees} escapees. Winners: ${raffleResults.map(r => `${r.winner} (${r.relic.name})`).join(', ')}. (${actualEscapePercent}% escaped)`, 'info', 'player');
            }
        } else {
            // At or above threshold - too many people, no raffle
            addLogEntry(`⚠️ Too many escapees for relic raffle (${actualEscapePercent}% ≥ ${thresholdPercent}% threshold for ${gameData.relics.length} relic(s)). Relics remain in vault!`, 'warning', 'player');
        }
    }
    
    // Check if player escaped empty-handed (teasing message)
    if (playerLootShare === 0 && escapeBonusShare === 0) {
        if (wonRelic) {
            addLogEntry(`🏃 YOU ESCAPED... with NO MONEY but at least you got a ${wonRelic.name}! Better than nothing... barely! 😅`, 'warning', 'player');
        } else {
            addLogEntry(`🏃 YOU ESCAPED... with absolutely NOTHING! ${totalEscapees} players fled empty-handed. Hey, at least you're safe... right? 😅`, 'warning', 'player');
        }
    } else {
        addLogEntry(`🏃 ESCAPING WITH LOOT! ${totalEscapees} players escaped this round. Your share: ${formatMoney(playerLootShare)} + Escape Bonus: ${formatMoney(escapeBonusShare)}`, 'success', 'player');
    }
    
    setTimeout(() => {
        showSuccessState(totalEscapeBonus, wonRelic, totalEscapees, raffleWasHeld, playerLootShare, escapeBonusShare);
    }, 1000);
}

// Reset game
function resetGame() {
    gameData = {
        accumulatedLoot: 0,
        playerLootShare: 0,
        lastRoundLoot: 0,
        lastRoundPlayerShare: 0,
        escapeBonusPool: 0,
        pendingEscapeBonus: 0,
        remainingPrizePool: PRIZE_POOL,
        playerCount: INITIAL_PLAYER_COUNT,
        eliminatedPlayers: 0,
        movesCount: 0,
        lootDrawCount: 0,
        trapCards: [],
        uniqueTrapTypes: new Set(),
        relics: [],
        discoveredRelics: [],
        newlyDiscoveredRelic: null,
        oddsChangedLogged: false,
        gameActive: false
    };
    
    gameLogEl.innerHTML = '<div class="log-entry initial">Waiting for game to start...</div>';
    playerLogEl.innerHTML = '<div class="log-entry initial">No player actions yet...</div>';
}

// Start game
function startGame() {
    resetGame();
    gameData.gameActive = true;
    
    // Reset button to "Start Heist"
    const continueBtnIcon = continueBtn.querySelector('.btn-icon');
    const continueBtnText = continueBtn.querySelector('.btn-text');
    continueBtnIcon.textContent = '🎯';
    continueBtnText.textContent = 'START HEIST';
    
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
