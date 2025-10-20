// Get DOM elements
const startBtn = document.getElementById('startBtn');

// Enter button functionality
startBtn.addEventListener('click', () => {
    // Redirect to lobby page with jackpot
    window.location.href = 'lobby.html';
});

// Add button click sound effects (optional)
const buttons = document.querySelectorAll('.lobby-btn');
buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        // Add hover sound effect here if you have audio files
    });
    
    button.addEventListener('click', () => {
        // Add click sound effect here
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    });
});


