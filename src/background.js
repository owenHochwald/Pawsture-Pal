// Keep service worker active
chrome.runtime.onStartup.addListener(() => {
    console.log('Service worker starting up...');
    initializeExtension();
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed/updated...');
    initializeExtension();
});

// Array of posture tips and cat facts
const tips = [
    "Meow! Sit up straight like a proud cat! 🐱",
    "Time to arch your back, just like I do! 🐈",
    "Don't slouch! Even cats maintain perfect posture! 😺",
    "Stretch your paws... I mean, arms! Take a break! 🐾",
    "Keep your head high like a noble feline! 👑",
    "A good posture makes you as graceful as a cat! ✨",
    "Remember to keep your feet flat on the ground! 🐈‍⬛",
    "Roll your shoulders back, just like a cat's stretch! 🌟",
    "Your screen should be at eye level, human! 👀",
    "Take a moment to stretch like I do! 🐱"
];

// Initialize extension
function initializeExtension() {
    chrome.storage.local.get(['reminderCount', 'interval', 'theme', 'lastResetDate', 'yesterdayCount'], (result) => {
        console.log('Initializing with stored data:', result);
        
        // Set default values if not present
        const defaults = {
            reminderCount: 0,
            interval: 30,
            theme: 'light',
            lastResetDate: new Date().toDateString(),
            yesterdayCount: 0
        };

        // Update any missing values
        const updates = {};
        Object.keys(defaults).forEach(key => {
            if (result[key] === undefined) {
                updates[key] = defaults[key];
            }
        });

        if (Object.keys(updates).length > 0) {
            console.log('Setting default values:', updates);
            chrome.storage.local.set(updates);
        }

        // Create initial alarm
        createAlarm(result.interval || defaults.interval);
    });
}

// Check and reset daily counter
function checkAndResetDaily() {
    chrome.storage.local.get(['lastResetDate', 'reminderCount'], (result) => {
        const today = new Date().toDateString();
        if (result.lastResetDate !== today) {
            console.log('Resetting daily counter. Previous count:', result.reminderCount);
            chrome.storage.local.set({
                yesterdayCount: result.reminderCount || 0,
                reminderCount: 0,
                lastResetDate: today
            });
        }
    });
}

// Handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    console.log('Alarm triggered:', alarm);
    if (alarm.name === 'postureReminder') {
        checkAndResetDaily();
        showNotification();
        // Create next alarm
        chrome.storage.local.get(['interval'], (result) => {
            createAlarm(result.interval || 30);
        });
    }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message);
    if (message.type === 'updateInterval') {
        createAlarm(message.interval);
    } else if (message.type === 'checkPosture') {
        showNotification();
    } else if (message.type === 'adjusted') {
        // Increment reminder count when user clicks "I've Adjusted!"
        chrome.storage.local.get(['reminderCount'], (result) => {
            const newCount = (result.reminderCount || 0) + 1;
            console.log('Incrementing reminder count to:', newCount);
            chrome.storage.local.set({ reminderCount: newCount });
        });
    }
});

// Create alarm function
function createAlarm(interval) {
    console.log('Creating alarm with interval:', interval);
    chrome.alarms.clear('postureReminder', () => {
        // Convert interval to milliseconds for more precise timing
        let delayInMinutes = parseFloat(interval);
        
        if (delayInMinutes < 0.5) {
            console.warn('Interval too short, setting to minimum 0.5 minutes');
            delayInMinutes = 0.5;
        }

        chrome.alarms.create('postureReminder', {
            delayInMinutes: delayInMinutes,
            periodInMinutes: delayInMinutes
        });

        // Verify alarm was created
        chrome.alarms.get('postureReminder', (alarm) => {
            console.log('Alarm created:', alarm);
        });
    });
}

// Show notification function
function showNotification() {
    console.log('Attempting to show notification...');
    checkAndResetDaily();
    const tip = tips[Math.floor(Math.random() * tips.length)];
    
    // Create popup window for notification
    chrome.windows.create({
        url: `src/reminder.html?tip=${encodeURIComponent(tip)}`,
        type: 'popup',
        width: 340,
        height: 440,
        left: Math.floor(screen.width - 340),
        top: Math.floor(screen.height - 440)
    }, (window) => {
        if (chrome.runtime.lastError) {
            console.error('Popup creation error:', chrome.runtime.lastError);
            // Fallback to system notification if popup fails
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'src/icons/icon128.png',
                title: 'Posture Check! 🐱',
                message: tip,
                priority: 2,
                requireInteraction: true,
                buttons: [
                    { title: '✨ Adjusted!' },
                    { title: '❌ Dismiss' }
                ]
            });
        } else {
            console.log('Reminder popup created:', window);
        }
    });
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    console.log('Notification button clicked:', { notificationId, buttonIndex });
    if (buttonIndex === 0) { // Adjusted button
        // Increment reminder count
        chrome.storage.local.get(['reminderCount'], (result) => {
            const newCount = (result.reminderCount || 0) + 1;
            console.log('Incrementing reminder count to:', newCount);
            chrome.storage.local.set({ reminderCount: newCount });
        });
    }
    // Clear notification for both buttons
    chrome.notifications.clear(notificationId);
});