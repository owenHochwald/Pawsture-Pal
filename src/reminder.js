document.addEventListener('DOMContentLoaded', () => {
    const adjustButton = document.getElementById('adjust-button');
    const dismissButton = document.getElementById('dismiss-button');
    const tipMessage = document.getElementById('tip-message');

    // Get the tip from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tip = urlParams.get('tip');
    if (tip) {
        tipMessage.textContent = decodeURIComponent(tip);
    }

    // Handle adjust button click
    adjustButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'adjusted' }, () => {
            window.close();
        });
    });

    // Handle dismiss button click
    dismissButton.addEventListener('click', () => {
        window.close();
    });

    // Auto-close after 30 seconds if no action taken
    setTimeout(() => {
        window.close();
    }, 30000);
});
