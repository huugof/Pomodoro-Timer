const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const modeText = document.getElementById('mode-text');
const toggleModeButton = document.getElementById('toggle-mode');
const progressRing = document.querySelector('.progress-ring-circle');
const addTimeButton = document.getElementById('add-time');

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 140;

let timeLeft = WORK_TIME;
let timerId = null;
let isWorkTime = true;
let currentTotalTime = WORK_TIME;

progressRing.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`;

function setProgress(percent) {
    const offset = CIRCLE_CIRCUMFERENCE - (percent / 100 * CIRCLE_CIRCUMFERENCE);
    progressRing.style.strokeDashoffset = offset;
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    
    document.title = `${timeString} - ${isWorkTime ? 'Focus' : 'Break'} Timer`;
    
    const progress = (timeLeft / currentTotalTime) * 100;
    setProgress(progress);
}

function showCustomAlert(message, onConfirm) {
    const alertOverlay = document.createElement("div");
    alertOverlay.className = "alert-overlay";

    const alertBox = document.createElement("div");
    alertBox.className = "alert-box";

    const messageText = document.createElement("p");
    messageText.className = "alert-message";
    messageText.textContent = isWorkTime ? "Time for a Break!" : "Time to Work!";

    const actionButton = document.createElement("button");
    actionButton.className = "alert-button";
    actionButton.textContent = "Start";

    alertBox.appendChild(messageText);
    alertBox.appendChild(actionButton);
    alertOverlay.appendChild(alertBox);
    document.body.appendChild(alertOverlay);

    // Animate in
    requestAnimationFrame(() => {
        alertOverlay.style.opacity = "1";
        alertBox.style.transform = "scale(1)";
    });

    // Handle closing
    const closeAlert = () => {
        alertOverlay.style.opacity = "0";
        alertBox.style.transform = "scale(0.95)";
        setTimeout(() => {
            document.body.removeChild(alertOverlay);
            if (onConfirm) {
                onConfirm();
                // Start the timer automatically after switching modes
                if (!timerId) {
                    toggleTimer();
                }
            }
        }, 200);
    };

    // Event listeners
    actionButton.addEventListener("click", closeAlert);
    alertOverlay.addEventListener("click", (e) => {
        if (e.target === alertOverlay) closeAlert();
    });

    // Handle Escape key
    document.addEventListener("keydown", function escapeHandler(e) {
        if (e.key === "Escape") {
            closeAlert();
            document.removeEventListener("keydown", escapeHandler);
        }
    });
}

function toggleTimer() {
    const startIcon = `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M8 5v14l11-7z"/>
    </svg>`;
    
    const pauseIcon = `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>`;

    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        startButton.innerHTML = startIcon;
    } else {
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                startButton.innerHTML = startIcon;
                
                const message = `${isWorkTime ? "Focus" : "Break"} time is over!`;
                showCustomAlert(message, () => {
                    isWorkTime = !isWorkTime;
                    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
                    currentTotalTime = timeLeft;
                    if (modeText) {
                        modeText.textContent = isWorkTime ? "Focus Time" : "Break Time";
                    }
                    document.body.classList.toggle("break-mode");
                    updateDisplay();
                });
                
                if (Notification.permission === "granted") {
                    new Notification("Timer Complete", {
                        body: message
                    });
                }
            }
        }, 1000);
        startButton.innerHTML = pauseIcon;
    }
}

function reset() {
    clearInterval(timerId);
    timerId = null;
    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
    currentTotalTime = timeLeft;
    
    startButton.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M8 5v14l11-7z"/>
    </svg>`;
    
    if (modeText) {
        modeText.textContent = isWorkTime ? 'Focus Time' : 'Break Time';
    }
    
    updateDisplay();
    setProgress(100);
}

function toggleMode() {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
    currentTotalTime = timeLeft;
    
    document.body.classList.toggle('break-mode');
    
    updateDisplay();
    setProgress(100);
    
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        startButton.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M8 5v14l11-7z"/>
        </svg>`;
    }
}

function addFiveMinutes() {
    timeLeft += 5 * 60;
    currentTotalTime += 5 * 60;
    updateDisplay();
}

function handleTouchStart(e) {
    const button = e.currentTarget;
    button.classList.add('touch-active');
}

function handleTouchEnd(e) {
    const button = e.currentTarget;
    button.classList.remove('touch-active');
}

// Map buttons to their click handlers
const buttonHandlers = {
    'start': toggleTimer,
    'reset': reset,
    'toggle-mode': toggleMode,
    'add-time': addFiveMinutes
};

[startButton, resetButton, toggleModeButton, addTimeButton].forEach(button => {
    const originalHandler = buttonHandlers[button.id];
    
    button.addEventListener('click', originalHandler);
    button.addEventListener('touchstart', handleTouchStart);
    button.addEventListener('touchend', handleTouchEnd);
    button.addEventListener('touchcancel', handleTouchEnd);
    // Remove mouseleave listener as it's not needed for touch devices
});

if (Notification.permission === 'default') {
    Notification.requestPermission();
}

updateDisplay(); 