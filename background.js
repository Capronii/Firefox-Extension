let datatable = {};

function resetData(tabId) {
    datatable[tabId] = {
        thirdPartyRequests: 0,
        firstPartyCookies: 0,
        thirdPartyCookies: 0,
        localStorageItems: 0,
        sessionStorageItems: 0,
    };
}

browser.tabs.onActivated.addListener(activeInfo => {
    if (!datatable[activeInfo.tabId]) {
        resetData(activeInfo.tabId);
    }
});

browser.webRequest.onCompleted.addListener(
    details => {
        if (details.tabId !== -1) {
            if (!datatable[details.tabId]) resetData(details.tabId);

            const requestUrl = new URL(details.url);
            const requestDomain = requestUrl.hostname;


            browser.tabs.get(details.tabId).then(tab => {
                const tabUrl = new URL(tab.url);
                const tabHostname = tabUrl.hostname;
                if (requestDomain !== tabHostname) {
                    datatable[details.tabId].thirdPartyRequests++;
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
                datatable[tabId].firstPartyCookies++;
            } else {
                datatable[tabId].thirdPartyCookies++;
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
        resetData(tabId);
        injectScript(tabId);
    }
});


browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "storageData") {
        let tabId = message.tabId;
        datatable[tabId].localStorageItems = message.localStorageCount;
        datatable[tabId].sessionStorageItems = message.sessionStorageCount;
        datatable[tabId].canvasFingerprintDetected = message.canvasFingerprint;
    }

    if (message.request === "getData") {
        const tabId = message.tabId;
        const responseData = {
            ...datatable[tabId],
            score: score_calculator(tabId)
        };
        sendResponse(responseData);
    }
});


function score_calculator(tabId) {
    const data = datatable[tabId] || resetData(tabId);
    let score = 100;  
    score -= data.thirdPartyRequests * 3;  
    score -= data.thirdPartyCookies;  
    score -= data.localStorageItems * 2;  
    score -= data.sessionStorageItems;  
    return Math.max(score, 0);
}


