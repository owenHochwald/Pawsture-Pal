// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Get UI elements
    const intervalInput = document.getElementById('interval');
    const optionsButton = document.getElementById('optionsButton');
    const helpButton = document.getElementById('helpButton');
    const reminderCount = document.getElementById('reminder-count');
    const yesterdayCount = document.getElementById('yesterday-count');
    const timeRemaining = document.getElementById('time-remaining');
    const themeToggle = document.getElementById('theme-toggle');
    const donateButton = document.getElementById('donate-button');

    // Load saved settings and start timer
    loadSettings();
    loadTheme();
    updateTimeRemaining();

    // Update timer every second
    setInterval(updateTimeRemaining, 1000);

    // Save interval when changed
    intervalInput.addEventListener('change', function() {
        let interval = parseFloat(this.value);
        if (interval < 0.5) interval = 0.5;
        chrome.storage.local.set({ interval: interval });
        chrome.runtime.sendMessage({ type: 'updateInterval', interval: interval });
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Options button
    optionsButton.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    // Help button
    helpButton.addEventListener('click', function() {
        chrome.tabs.create({ url: 'help/help.html' });
    });

    // Donate button
    donateButton.addEventListener('click', function() {
        chrome.tabs.create({ url: 'https://ko-fi.com/posturepal' });
    });

    // Function to load saved settings
    function loadSettings() {
        chrome.storage.local.get(['interval', 'reminderCount', 'yesterdayCount'], function(data) {
            if (data.interval) {
                intervalInput.value = data.interval;
            }
            if (data.reminderCount !== undefined) {
                reminderCount.textContent = data.reminderCount;
            }
            if (data.yesterdayCount !== undefined) {
                yesterdayCount.textContent = data.yesterdayCount;
            }
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