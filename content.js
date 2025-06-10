// Create a popup element
const popup = document.createElement('div');
popup.id = 'mcq-helper-popup';
popup.style.display = 'none';
document.body.appendChild(popup);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'showAnswer') {
        showPopup(request.answer);
    }
});

// Function to show the popup with the answer
function showPopup(answer) {
    popup.textContent = answer;
    popup.style.display = 'block';

    // Position the popup near the selected text
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        popup.style.left = `${rect.left + window.scrollX}px`;
        popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    }
}

// Hide popup when clicking outside
document.addEventListener('click', (e) => {
    if (e.target !== popup && !popup.contains(e.target)) {
        popup.style.display = 'none';
    }
}); 