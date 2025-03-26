// Content script for the Chrome Extension
// This script runs on web pages and handles text replacement

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    // Get the current selection
    const selection = window.getSelection()?.toString() || '';
    
    // Send it back to the background script or popup
    chrome.runtime.sendMessage({
      type: 'TEXT_SELECTED',
      text: selection || message.text
    });
  }
  
  if (message.type === 'REPLACE_TEXT') {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Replace the selected text with the rewritten text
      range.deleteContents();
      range.insertNode(document.createTextNode(message.text));
      
      // Confirm replacement was successful
      chrome.runtime.sendMessage({
        type: 'TEXT_REPLACED',
        success: true
      });
    } else {
      // No valid selection to replace
      chrome.runtime.sendMessage({
        type: 'TEXT_REPLACED',
        success: false,
        error: 'No valid text selection found.'
      });
    }
  }
  
  return true; // Indicates async response
}); 