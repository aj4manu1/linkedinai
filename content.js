// Debounce function to limit how often createButtons is called
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Create buttons for selected text
function createButtons(selectedText) {
    const existingContainer = document.getElementById('linkedin-ai-buttons');
    if (existingContainer) {
        existingContainer.remove();
    }

    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'linkedin-ai-buttons';
    buttonsContainer.style.position = 'absolute';
    buttonsContainer.style.zIndex = 1000;
    buttonsContainer.style.backgroundColor = 'white';
    buttonsContainer.style.border = '1px solid #ccc';
    buttonsContainer.style.padding = '10px';
    buttonsContainer.style.borderRadius = '5px';
    buttonsContainer.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.2)';
    buttonsContainer.style.maxWidth = '300px';

    // Create header
    const header = document.createElement('div');
    header.style.fontWeight = 'bold';
    header.style.color = '#0a66c2';
    header.innerHTML = 'LinkedIn AI <span style="font-size: 18px;">🤖</span>';
    header.style.marginBottom = '10px';
    buttonsContainer.appendChild(header);

    // Create buttons
    ['Simplify', 'Reply', 'Read More'].forEach(action => {
        const button = document.createElement('button');
        button.innerText = action;
        button.style.margin = '5px';
        button.style.padding = '5px 10px';
        button.style.border = 'none';
        button.style.borderRadius = '3px';
        button.style.backgroundColor = '#0a66c2';
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        button.addEventListener('click', function() {
            console.log(`${action} button clicked`);
            chrome.runtime.sendMessage({ action: action.toLowerCase().replace(' ', ''), text: selectedText }, function(response) {
                console.log('Response from background:', response);
            });
        });
        buttonsContainer.appendChild(button);
    });

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerText = '✖'; // Use a better close icon
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.width = '24px';
    closeButton.style.height = '24px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.backgroundColor = '#ff5a5f'; // Close button color
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.addEventListener('click', function() {
        buttonsContainer.remove();
        const responseContainer = document.getElementById('linkedin-ai-response');
        if (responseContainer) {
            responseContainer.remove();
        }
    });
    buttonsContainer.appendChild(closeButton);

    document.body.appendChild(buttonsContainer);

    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    buttonsContainer.style.top = `${rect.bottom + window.scrollY}px`;
    buttonsContainer.style.left = `${rect.left + window.scrollX}px`;
}

// Event listener for mouseup event
document.addEventListener('mouseup', debounce(function() {
    try {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 0) {
            createButtons(selectedText);
        }
    } catch (error) {
        console.error('Error in mouseup event listener:', error);
    }
}, 300)); // Adjust debounce delay as needed

// Handle messages from background script
chrome.runtime.onMessage.addListener(function(message) {
    console.log('Message received in content script:', message);
    if (message.action === 'displayResponse') {
        displayResponse(message.response);
    }
});

// Function to convert URLs to clickable links
function convertURLsToLinks(text) {
    const urlPattern = /(\b(https?|ftp):\/\/[^\s/$.?#].[^\s]*)/gi;
    return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
}

// Display response in a div
function displayResponse(response) {
    try {
        let responseContainer = document.getElementById('linkedin-ai-response');
        if (!responseContainer) {
            responseContainer = document.createElement('div');
            responseContainer.id = 'linkedin-ai-response';
            responseContainer.style.position = 'absolute';
            responseContainer.style.zIndex = 1000;
            responseContainer.style.backgroundColor = 'white';
            responseContainer.style.border = '1px solid #ccc';
            responseContainer.style.padding = '10px';
            responseContainer.style.borderRadius = '5px';
            responseContainer.style.width = '400px'; // Increased width
            responseContainer.style.maxHeight = '400px'; // Adjust height as needed
            responseContainer.style.overflow = 'auto'; // Ensure vertical scrolling
            responseContainer.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.2)';
            responseContainer.style.resize = 'both'; // Allow resizing both horizontally and vertically
            responseContainer.style.minWidth = '200px'; // Minimum width
            responseContainer.style.minHeight = '200px'; // Minimum height

            // Create a container for the response text
            const responseContent = document.createElement('div');
            responseContent.id = 'linkedin-ai-response-text';
            responseContent.style.width = '100%';
            responseContent.style.height = 'calc(100% - 40px)'; // Adjust to fill container, subtracting space for the copy button
            responseContent.style.padding = '5px';
            responseContent.style.color = 'black'; // Ensure text is black for visibility
            responseContent.style.backgroundColor = 'white';
            responseContent.style.whiteSpace = 'pre-wrap'; // Preserve formatting
            responseContent.style.wordWrap = 'break-word'; // Wrap long words
            responseContent.style.overflow = 'auto'; // Allow scrolling within the text area

            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.innerText = 'Copy';
            copyButton.style.marginTop = '10px';
            copyButton.style.padding = '5px 10px';
            copyButton.style.border = 'none';
            copyButton.style.borderRadius = '3px';
            copyButton.style.backgroundColor = '#0a66c2';
            copyButton.style.color = 'white';
            copyButton.style.cursor = 'pointer';
            copyButton.addEventListener('click', function() {
                const text = responseContent.innerText;
                navigator.clipboard.writeText(text).then(() => {
                    console.log('Text copied to clipboard');
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });

            responseContainer.appendChild(responseContent);
            responseContainer.appendChild(copyButton);
            document.body.appendChild(responseContainer);
        }

        const responseContent = document.getElementById('linkedin-ai-response-text');
        responseContent.innerHTML = convertURLsToLinks(response); // Convert URLs to clickable links

        responseContainer.style.display = 'block';
        const buttonsContainer = document.getElementById('linkedin-ai-buttons');
        if (buttonsContainer) {
            const rect = buttonsContainer.getBoundingClientRect();
            responseContainer.style.top = `${rect.bottom + window.scrollY + 10}px`;
            responseContainer.style.left = `${rect.left + window.scrollX}px`;
        }
    } catch (error) {
        console.error('Error displaying response:', error);
    }
}
