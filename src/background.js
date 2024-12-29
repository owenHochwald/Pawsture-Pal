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

// Initialize reminder count
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['reminderCount', 'interval'], (result) => {
        if (!result.reminderCount) {
            chrome.storage.local.set({ reminderCount: 0 });
        }
        if (!result.interval) {
            chrome.storage.local.set({ interval: 30 }); // Default 30 minutes
        }
        createAlarm(result.interval || 30);
    });
});

// Handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'postureReminder') {
        showNotification();
    }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateInterval') {
        createAlarm(message.interval);
    }
});

// Create alarm function
function createAlarm(interval) {
    chrome.alarms.clear('postureReminder', () => {
        chrome.alarms.create('postureReminder', {
            periodInMinutes: interval
        });
    });
}

// Show notification function
function showNotification() {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Posture Pal',
        message: tip,
        priority: 2
    });

    // Increment reminder count
    chrome.storage.local.get(['reminderCount'], (result) => {
        const newCount = (result.reminderCount || 0) + 1;
        chrome.storage.local.set({ reminderCount: newCount });
    });
}

// Handle notification click
chrome.notifications.onClicked.addListener((notificationId) => {
    chrome.notifications.clear(notificationId);
});