document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveButton = document.getElementById('saveButton');
    const statusMessage = document.getElementById('statusMessage');

    // Load existing API key
    chrome.storage.sync.get(['apiKey'], function(result) {
        try {
            apiKeyInput.value = result.apiKey || '';
        } catch (error) {
            console.error('Error loading API key:', error);
            showStatus('Error loading API key', 'error');
        }
    });

    // Save API key on button click
    saveButton.addEventListener('click', function(event) {
        event.preventDefault();  // Prevent form submission
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter a valid API key', 'error');
            return;
        }

        chrome.storage.sync.set({ apiKey: apiKey }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving API key:', chrome.runtime.lastError);
                showStatus('Error saving API key', 'error');
            } else {
                console.log('API key saved.');
                showStatus('API key saved successfully', 'success');
            }
        });
    });

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type;
        statusMessage.style.display = 'block';
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }
});
