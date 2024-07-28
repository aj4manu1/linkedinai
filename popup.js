document.addEventListener('DOMContentLoaded', function() {
  const statusDiv = document.getElementById('status');

  // Check if API key is set
  chrome.storage.sync.get(['apiKey'], function(result) {
      if (result.apiKey) {
          showStatus('API key is set. Extension is ready to use.', 'success');
      } else {
          showStatus('Please set your API key in the options page.', 'error');
      }
  });

  function showStatus(message, type) {
      statusDiv.textContent = message;
      statusDiv.className = type;
      statusDiv.style.display = 'block';
  }
});
