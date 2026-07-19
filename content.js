// Get the current website domain
const hostname = window.location.hostname;

// Function to check if the current site natively has a dark background
function isNativeDarkMode() {
    const bgColor = window.getComputedStyle(document.body).backgroundColor;
    // Extract RGB values from the background color
    const rgb = bgColor.match(/\d+/g);
    
    if (rgb && rgb.length >= 3) {
        // Calculate perceived brightness using the YIQ formula
        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
        // If brightness is less than 128, we consider it a dark background
        return brightness < 128;
    }
    return false;
}

// Function to toggle the extension's CSS class
function applyExtensionDarkMode(shouldApply) {
    if (shouldApply) {
        document.documentElement.classList.add('dark-mode-active');
    } else {
        document.documentElement.classList.remove('dark-mode-active');
    }
}

// Main logic to determine if we should apply dark mode
function initializeDarkMode() {
    chrome.storage.local.get(['globalEnabled', 'siteSettings'], (result) => {
        // Global toggle (defaults to true)
        const globalEnabled = result.globalEnabled !== false; 
        
        // Site specific settings mapping
        const siteSettings = result.siteSettings || {};
        const currentSiteInfo = siteSettings[hostname] || {};

        // 1. If the extension is turned off globally, remove dark mode and exit
        if (!globalEnabled) {
            applyExtensionDarkMode(false);
            return;
        }

        // 2. If the user explicitly whitelisted this site, remove dark mode and exit
        if (currentSiteInfo.whitelisted) {
            applyExtensionDarkMode(false);
            return;
        }

        // 3. Auto-detection for first-time visits
        if (currentSiteInfo.autoDetected === undefined) {
            const isDark = isNativeDarkMode();
            
            if (isDark) {
                // Native dark mode detected: whitelist it automatically
                siteSettings[hostname] = { whitelisted: true, autoDetected: true };
                chrome.storage.local.set({ siteSettings });
                applyExtensionDarkMode(false);
            } else {
                // No native dark mode: mark as checked, do not whitelist, apply our CSS
                siteSettings[hostname] = { whitelisted: false, autoDetected: true };
                chrome.storage.local.set({ siteSettings });
                applyExtensionDarkMode(true);
            }
        } else {
            // Already processed before and not whitelisted, so apply extension
            applyExtensionDarkMode(true);
        }
    });
}

// Run logic on page load
initializeDarkMode();

// Listen for settings changes from the popup in real-time
chrome.storage.onChanged.addListener((changes) => {
    if (changes.globalEnabled || changes.siteSettings) {
        initializeDarkMode();
    }
});