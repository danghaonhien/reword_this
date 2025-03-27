// Background script for the Chrome Extension
// This script runs in the background and handles context menu creation and message passing

// Create a context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'rewordThis',
    title: 'Reword This',
    contexts: ['selection'] // Only show when text is selected
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'rewordThis' && info.selectionText) {
    // Open the extension popup with the selected text
    if (tab?.id) {
      // Send message to the content script with the selected text
      chrome.tabs.sendMessage(tab.id, {
        type: 'GET_SELECTION',
        text: info.selectionText
      });
      
      // Open the popup
      chrome.windows.create({
        url: chrome.runtime.getURL(`index.html?text=${encodeURIComponent(info.selectionText)}`),
        type: 'popup',
        width: 600,
        height: 800
      });
    }
  }
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // You can add additional message handling here if needed
  if (message.type === 'TRACK_USAGE') {
    // Example: Track usage (for analytics if implemented)
    console.log('Usage tracked:', message.data);
  }
  
  return true; // Indicates async response
}); 