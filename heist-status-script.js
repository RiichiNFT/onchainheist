// Get DOM elements
const waitingState = document.getElementById('waitingState');
const readyState = document.getElementById('readyState');
const countdownTimerEl = document.getElementById('countdownTimer');
const backToLobbyBtn = document.getElementById('backToLobbyBtn');
const makeMoveBtn = document.getElementById('makeMoveBtn');

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
    waitingState.classList.remove('hidden');
    readyState.classList.add('hidden');
    
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
    waitingState.classList.add('hidden');
    readyState.classList.remove('hidden');
}

// Update countdown display
function updateCountdownDisplay(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    countdownTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Back to lobby button
backToLobbyBtn.addEventListener('click', () => {
    window.location.href = 'lobby.html';
});

// Make your move button
makeMoveBtn.addEventListener('click', () => {
    console.log('Starting the heist gameplay...');
    alert('💎 Let\'s execute this heist!');
    // Redirect to actual game page
    // window.location.href = 'game.html';
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

