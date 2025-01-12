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
                
                isWorkTime = !isWorkTime;
                timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
                modeText.textContent = isWorkTime ? 'Focus Time' : 'Break Time';
                document.querySelector('.container').classList.toggle('break-mode');
                updateDisplay();
                
                if (Notification.permission === 'granted') {
                    new Notification('Timer Complete', {
                        body: isWorkTime ? 'Time to focus!' : 'Time for a break!'
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
    isWorkTime = true;
    timeLeft = WORK_TIME;
    currentTotalTime = WORK_TIME;
    startButton.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M8 5v14l11-7z"/>
    </svg>`;
    modeText.textContent = 'Focus Time';
    document.querySelector('.container').classList.remove('break-mode');
    updateDisplay();
}

function toggleMode() {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
    currentTotalTime = timeLeft;
    
    document.querySelector('.container').classList.toggle('break-mode');
    
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

startButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', reset);
toggleModeButton.addEventListener('click', toggleMode);
addTimeButton.addEventListener('click', addFiveMinutes);

if (Notification.permission === 'default') {
    Notification.requestPermission();
}

updateDisplay(); 