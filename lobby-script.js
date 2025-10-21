// Get DOM elements
const navHowToPlayBtn = document.getElementById('navHowToPlayBtn');
const onChainHeistBtn = document.getElementById('onChainHeistBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const connectWalletBtn = document.getElementById('connectWalletBtn');
const enterHeistBtn = document.getElementById('enterHeistBtn');
const modal = document.getElementById('howToPlayModal');
const closeModalBtn = document.getElementById('closeModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const jackpotAmountEl = document.getElementById('jackpotAmount');
const countdownEl = document.getElementById('countdown');

// Total jackpot amount
const TOTAL_JACKPOT = 5000000; // $5,000,000

// Animate jackpot counter
function animateJackpot(target) {
    let current = 0;
    const increment = target / 100;
    const duration = 2000; // 2 seconds
    const stepTime = duration / 100;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        jackpotAmountEl.textContent = '$' + Math.floor(current).toLocaleString();
    }, stepTime);
}

// Initialize jackpot and heist timer on page load
window.addEventListener('DOMContentLoaded', () => {
    animateJackpot(TOTAL_JACKPOT);
    
    // Set heist start time if not already set
    if (!localStorage.getItem('heistStartTime')) {
        const heistStartTime = Date.now() + (3 * 60 * 1000); // 3 minutes from now
        localStorage.setItem('heistStartTime', heistStartTime);
    }
});

// Countdown timer (3 minutes)
let timeRemaining = 180; // 3 minutes in seconds

function updateCountdown() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeRemaining > 0) {
        timeRemaining--;
    } else {
        countdownEl.textContent = 'NOW!';
        countdownEl.style.color = '#ff0000';
    }
}

// Start countdown
setInterval(updateCountdown, 1000);

// Show modal when "How to Play" button is clicked
navHowToPlayBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Navigation buttons
onChainHeistBtn.addEventListener('click', () => {
    console.log('On-Chain Heist clicked');
    alert('🔗 On-Chain Heist feature coming soon!');
});

leaderboardBtn.addEventListener('click', () => {
    console.log('Leaderboard clicked');
    alert('🏆 Leaderboard feature coming soon!');
});

// Connect Wallet button
connectWalletBtn.addEventListener('click', () => {
    console.log('Connect Wallet clicked');
    alert('👛 Wallet connection feature coming soon!');
});

// Close modal when X is clicked
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when button is clicked
modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Enter Heist button functionality
enterHeistBtn.addEventListener('click', () => {
    // Set heist start time to now so it starts immediately
    localStorage.setItem('heistStartTime', Date.now());
    // Redirect to heist status page
    window.location.href = 'heist-status.html';
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

// Add button click effects
const buttons = document.querySelectorAll('.lobby-btn');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    });
});

