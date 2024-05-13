let tabsData = {};

function resetTabData(tabId) {
    tabsData[tabId] = {
        thirdPartyRequests: 0,
        firstPartyCookies: 0,
        thirdPartyCookies: 0,
        localStorageItems: 0,
        sessionStorageItems: 0,
    };
}

browser.tabs.onActivated.addListener(activeInfo => {
    if (!tabsData[activeInfo.tabId]) {
        resetTabData(activeInfo.tabId);
    }
});

browser.webRequest.onCompleted.addListener(
    details => {
        if (details.tabId !== -1) {
            if (!tabsData[details.tabId]) resetTabData(details.tabId);

            const requestUrl = new URL(details.url);
            const requestDomain = requestUrl.hostname;


            browser.tabs.get(details.tabId).then(tab => {
                const tabUrl = new URL(tab.url);
                const tabHostname = tabUrl.hostname;
                if (requestDomain !== tabHostname) {
                    tabsData[details.tabId].thirdPartyRequests++;
                }
                countCookies(details.url, tabHostname, details.tabId);
            });
        }
    },
    { urls: ["<all_urls>"] }
);


function countCookies(url, tabHostname, tabId) {
    browser.cookies.getAll({url: url}).then(cookies => {
        cookies.forEach(cookie => {
            const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
            if (cookieDomain.includes(tabHostname)) {
                tabsData[tabId].firstPartyCookies++;
            } else {
                tabsData[tabId].thirdPartyCookies++;
            }
        });
    });
}

function injectScript(tabId) {
    const code = `
        browser.runtime.sendMessage({
            type: 'storageData',
            tabId: ${tabId},
            localStorageCount: localStorage.length,
            sessionStorageCount: sessionStorage.length,
        });
    `;
    browser.tabs.executeScript(tabId, {code: code});
}

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
        resetTabData(tabId);
        injectScript(tabId);
    }
});


browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "storageData") {
        let tabId = message.tabId;
        tabsData[tabId].localStorageItems = message.localStorageCount;
        tabsData[tabId].sessionStorageItems = message.sessionStorageCount;
        tabsData[tabId].canvasFingerprintDetected = message.canvasFingerprint;
    }

    if (message.request === "getData") {
        const tabId = message.tabId;
        const responseData = {
            ...tabsData[tabId],
            score: calculatePrivacyScore(tabId)
        };
        sendResponse(responseData);
    }
});


function calculatePrivacyScore(tabId) {
    const data = tabsData[tabId] || resetTabData(tabId);
    let score = 100;  // Start with a perfect score
    score -= data.thirdPartyRequests * 3;  // Deduct points for third-party requests
    score -= data.thirdPartyCookies;  // Deduct points for third-party cookies
    score -= data.localStorageItems * 2;  // Deduct points for each localStorage item
    score -= data.sessionStorageItems;  // Deduct points for each sessionStorage item
    return Math.max(score, 0);  // Ensure score is not negative
}


