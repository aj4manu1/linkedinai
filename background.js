function callAPI(action, text) {
    console.log('callAPI function called with action:', action, 'and text:', text);

    chrome.storage.sync.get(['apiKey'], function(result) {
        const apiKey = result.apiKey || '';
        if (!apiKey) {
            console.error('No API key found');
            return;
        }

        const url = 'https://api.openai.com/v1/chat/completions';
        console.log('Calling API:', url);

        const requestBody = {
            model: "gpt-3.5-turbo",  // or "gpt-4"
            messages: [{ role: 'user', content: getPrompt(action, text) }],
            max_tokens: 2000,  // Increased token limit to handle longer responses
            temperature: 0.7,  // Adjust as needed for creativity
            top_p: 1,  // Adjust sampling strategy
            n: 1,  // Number of responses to generate
            stop: null,  // No specific stop sequences
        };

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };

        fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            console.log('API response:', data);
            if (data.choices && data.choices.length > 0) {
                const responseText = data.choices[0].message.content;
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'displayResponse', response: responseText });
                });
            } else {
                console.error('Unexpected API response format:', data);
                chrome.notifications.create('', {
                    title: 'LinkedIn AI',
                    message: 'Unexpected API response format',
                    type: 'basic'
                });
            }
        })
        .catch(error => {
            console.error('API call error:', error);
            chrome.notifications.create('', {
                title: 'LinkedIn AI',
                message: 'Failed to call API: ' + error.message,
                type: 'basic'
            });
        });
    });
}

function getPrompt(action, text) {
    switch(action) {
        case 'simplify':
            return `Explain this in a simple way for a layman to understand: ${text}`;
        case 'reply':
            return `Create an engaging reply on LinkedIn for this post: ${text}`;
        case 'readmore':
            return `A detailed explanation with links from the web to read more: ${text}`;
        default:
            return text;
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Message received in background script:', request);
    if (['simplify', 'reply', 'readmore'].includes(request.action)) {
        callAPI(request.action, request.text);
    } else {
        console.warn('Unhandled action:', request.action);
    }
    sendResponse({ status: 'ok' });
});
