// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const intervalInput = document.getElementById('interval');
    const saveButton = document.getElementById('save');
    const feedbackDiv = document.getElementById('feedback');
    const reminderCount = document.getElementById('reminder-count');
    const yesterdayCount = document.getElementById('yesterday-count');
    const timeRemaining = document.getElementById('time-remaining');
    const themeToggle = document.getElementById('theme-toggle');

    // Load saved settings and start timer
    loadSettings();
    loadReminderCount();
    loadYesterdayCount();
    loadTheme();
    updateTimeRemaining();

    // Update timer every second
    setInterval(updateTimeRemaining, 1000);

    // Save settings when button is clicked
    saveButton.addEventListener('click', saveSettings);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Handle donate button click
    document.getElementById('donate-button').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({
            url: 'https://ko-fi.com/posturepal'
        });
    });

    // Function to load saved settings
    function loadSettings() {
        chrome.storage.local.get(['interval'], (result) => {
            if (result.interval) {
                intervalInput.value = result.interval;
            }
        });
    }

    // Function to save settings
    function saveSettings() {
        const interval = parseFloat(intervalInput.value);
        
        // Validate interval
        if (isNaN(interval) || interval < 0.5 || interval > 120) {
            alert('Please enter an interval between 0.5 and 120 minutes.');
            return;
        }

        // Save to storage
        chrome.storage.local.set({
            interval: interval
        }, () => {
            // Show feedback
            showFeedback();
            
            // Update alarm
            chrome.runtime.sendMessage({
                type: 'updateInterval',
                interval: interval
            });
        });
    }

    // Function to show feedback
    function showFeedback() {
        feedbackDiv.style.display = 'block';
        feedbackDiv.textContent = 'Settings saved!';
        setTimeout(() => {
            feedbackDiv.style.display = 'none';
        }, 2000);
    }

    // Function to load reminder count
    function loadReminderCount() {
        chrome.storage.local.get(['reminderCount'], (result) => {
            reminderCount.textContent = result.reminderCount || 0;
        });
    }

    // Function to load yesterday's count
    function loadYesterdayCount() {
        chrome.storage.local.get(['yesterdayCount'], (result) => {
            yesterdayCount.textContent = result.yesterdayCount || 0;
        });
    }

    // Function to update time remaining display
    function updateTimeRemaining() {
        chrome.alarms.get('postureReminder', (alarm) => {
            if (alarm) {
                const now = new Date().getTime();
                const timeLeft = alarm.scheduledTime - now;
                
                if (timeLeft > 0) {
                    const minutes = Math.floor(timeLeft / 60000);
                    const seconds = Math.floor((timeLeft % 60000) / 1000);
                    timeRemaining.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                } else {
                    timeRemaining.textContent = '00:00';
                    // Trigger notification if time is up
                    chrome.runtime.sendMessage({ type: 'checkPosture' });
                }
            } else {
                timeRemaining.textContent = '--:--';
            }
        });
    }

    // Theme functions
    function loadTheme() {
        chrome.storage.local.get(['theme'], (result) => {
            if (result.theme === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
                themeToggle.textContent = '🌞';
            } else {
                document.body.setAttribute('data-theme', 'light');
                themeToggle.textContent = '🌓';
            }
        });
    }

    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '🌞' : '🌓';
        
        chrome.storage.local.set({ theme: newTheme });
    }
});