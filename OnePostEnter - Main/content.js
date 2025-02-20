// Storage for recorded buttons
let recordedButtons = {};
let isRecording = false;

// Function to generate a unique selector for an element
function generateSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.getAttribute('data-testid')) return `[data-testid="${element.getAttribute('data-testid')}"]`;
    
    let selector = element.tagName.toLowerCase();
    if (element.className) {
        selector += `.${Array.from(element.classList).join('.')}`;
    }
    return selector;
}

// Load saved buttons when the script starts
try {
    recordedButtons = JSON.parse(localStorage.getItem('recordedButtons')) || {};
} catch (error) {
    console.error('Error loading saved buttons:', error);
    recordedButtons = {};
}

// Add recording functionality
document.addEventListener('click', function(event) {
    if (!isRecording) return;
    
    const clickedElement = event.target.closest('button');
    if (clickedElement) {
        const hostname = window.location.hostname;
        const selector = generateSelector(clickedElement);
        recordedButtons[hostname] = selector;
        
        // Save to localStorage
        try {
            localStorage.setItem('recordedButtons', JSON.stringify(recordedButtons));
            console.log(`Recorded button for ${hostname}:`, selector);
            alert('Button recorded! You can now use Enter to submit.');
        } catch (error) {
            console.error('Error saving button:', error);
            alert('Failed to save button. Please try again.');
        }
        
        isRecording = false;
    }
});

// Add keyboard event listeners
document.addEventListener('keydown', function(event) {
    // Recording toggle shortcut (Ctrl+Shift+R)
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        isRecording = !isRecording;
        if (isRecording) {
            alert('Recording mode activated. Click the submit button you want to use.');
        } else {
            alert('Recording mode deactivated.');
        }
    }
    
    // Handle Enter key using recorded buttons
    if (event.key === 'Enter' && !event.shiftKey) {
        const activeElement = document.activeElement;
        const hostname = window.location.hostname;
        
        // Check if we have a recorded button for this site and if we're in an input element
        if (recordedButtons[hostname] && 
            (activeElement.tagName === 'TEXTAREA' || 
             activeElement.tagName === 'INPUT' || 
             activeElement.getAttribute('contenteditable') === 'true')) {
            
            try {
                const submitButton = document.querySelector(recordedButtons[hostname]);
                if (submitButton && !submitButton.disabled) {
                    event.preventDefault();
                    submitButton.click();
                } else if (!submitButton) {
                    console.warn('Recorded button not found in the page');
                }
            } catch (error) {
                console.error('Error clicking recorded button:', error);
            }
        }
    }
});