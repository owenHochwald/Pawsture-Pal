// Keep service worker active
chrome.runtime.onStartup.addListener(() => {
    initializeExtension();
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
    initializeExtension();
});

// Array of posture tips and cat facts
const tips = [
    "Meow! Sit up straight like a proud cat! ",
    "Don't slouch! Even cats maintain perfect posture! ",
    "Stretch your paws... I mean, arms! Take a break! ",
    "Keep your head high like a noble feline! ",
    "A good posture makes you as graceful as a cat! ",
    "Remember to keep your feet flat on the ground! ",
    "Roll your shoulders back, just like a cat's stretch! ",
    "Your screen should be at eye level, human! ",
    "Take a moment to stretch like I do! ",
    "Channel your inner cat and stand tall!",
    "A feline's poise comes from proper posture—let's mimic that!",
    "Sit up straight, just like a cat on the prowl!",
    "Don't forget to align your spine—feline grace starts there!",
    "Stay limber, stretch those legs and paws!",
    "Good posture is key to being as sleek as a cat!",
    "Keep your shoulders relaxed, like a cat lounging in the sun!",
    "Take a break and stretch, just like a cat before a nap!",
    "A cat’s posture is always on point—yours can be too!",
    "Cats never hunch—neither should you!"
];

// Initialize extension
function initializeExtension() {
    chrome.storage.local.get(['reminderCount', 'interval', 'theme', 'lastResetDate', 'yesterdayCount'], (result) => {
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
    if (message.type === 'updateInterval') {
        createAlarm(message.interval);
    } else if (message.type === 'checkPosture') {
        showNotification();
    } else if (message.type === 'adjusted') {
        // Increment reminder count when user clicks "I've Adjusted!"
        chrome.storage.local.get(['reminderCount'], (result) => {
            const newCount = (result.reminderCount || 0) + 1;
            chrome.storage.local.set({ reminderCount: newCount });
        });
    }
});

// Create alarm function
function createAlarm(interval) {
    chrome.alarms.clear('postureReminder', () => {
        let delayInMinutes = parseFloat(interval);
        
        if (delayInMinutes < 0.5) {
            delayInMinutes = 0.5;
        }

        chrome.alarms.create('postureReminder', {
            delayInMinutes: delayInMinutes,
            periodInMinutes: delayInMinutes
        });
    });
}

// Show notification function
function showNotification() {
    checkAndResetDaily();

    chrome.notifications.getAll((notifications) => {
        if (Object.keys(notifications).length === 0) {
            const tip = tips[Math.floor(Math.random() * tips.length)];
            chrome.notifications.create({
                type: 'basic',
                iconUrl: chrome.runtime.getURL('icons/icon128.png'),
                title: 'Pawsture Check! ',
                message: tip,
                priority: 2,
                requireInteraction: true,
                buttons: [
                    { title: ' Adjusted!' },
                    { title: ' Dismiss' }
                ]
            });
        }
    });
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (buttonIndex === 0) { // Adjusted button
        // Increment reminder count
        chrome.storage.local.get(['reminderCount'], (result) => {
            const newCount = (result.reminderCount || 0) + 1;
            chrome.storage.local.set({ reminderCount: newCount });
        });
    }
    // Clear notification for both buttons
    chrome.notifications.clear(notificationId);
});