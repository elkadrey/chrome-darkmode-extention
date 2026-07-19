const globalToggleBtn = document.getElementById('globalToggleBtn');
const whitelistToggleBtn = document.getElementById('whitelistToggleBtn');
const currentSiteLabel = document.getElementById('currentSite');

let currentHostname = '';

// Get the current active tab and setup the UI
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    currentHostname = url.hostname;
    currentSiteLabel.textContent = currentHostname;

    chrome.storage.local.get(['globalEnabled', 'siteSettings'], (result) => {
        const globalEnabled = result.globalEnabled !== false; // Default true
        const siteSettings = result.siteSettings || {};
        const currentSiteInfo = siteSettings[currentHostname] || {};
        const isWhitelisted = currentSiteInfo.whitelisted === true;

        updateGlobalUI(globalEnabled);
        updateWhitelistUI(isWhitelisted);
    });
});

// Handle Global Toggle Click
globalToggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['globalEnabled'], (result) => {
        const newState = result.globalEnabled === false ? true : false;
        chrome.storage.local.set({ globalEnabled: newState }, () => {
            updateGlobalUI(newState);
        });
    });
});

// Handle Whitelist Toggle Click
whitelistToggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['siteSettings'], (result) => {
        const siteSettings = result.siteSettings || {};
        // Keep autoDetected flag if it exists, otherwise initialize it
        const currentSiteInfo = siteSettings[currentHostname] || { autoDetected: true };
        
        // Toggle the whitelist status
        const isCurrentlyWhitelisted = currentSiteInfo.whitelisted === true;
        currentSiteInfo.whitelisted = !isCurrentlyWhitelisted;
        
        siteSettings[currentHostname] = currentSiteInfo;

        chrome.storage.local.set({ siteSettings }, () => {
            updateWhitelistUI(currentSiteInfo.whitelisted);
        });
    });
});

// UI helper functions
function updateGlobalUI(isEnabled) {
    globalToggleBtn.textContent = isEnabled ? 'Global: ON' : 'Global: OFF';
    globalToggleBtn.className = isEnabled ? 'global-on' : 'global-off';
}

function updateWhitelistUI(isWhitelisted) {
    whitelistToggleBtn.textContent = isWhitelisted ? 'Remove from Whitelist' : 'Add to Whitelist';
    whitelistToggleBtn.className = isWhitelisted ? 'whitelist-remove' : 'whitelist-add';
}