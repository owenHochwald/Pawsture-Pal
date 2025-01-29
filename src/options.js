document.addEventListener('DOMContentLoaded', () => {
    // Handle donate button click
    document.getElementById('donate-button').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({
            url: 'https://ko-fi.com/pawsturepal'
        });
    });
});
