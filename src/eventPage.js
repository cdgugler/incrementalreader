var iReader = iReader || {};

// handle messages
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    // openReadItem: user clicked item in read list
    if(request.action == "openArticle") {
        iReader.openArticle(request.location, request.url);
    }
});

// handle new tab scrolling
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // only check if toScroll has members
    if (changeInfo.status === 'complete' && iReader.toScroll.length > 0) {
        iReader.scrollArticle(tabId);
    }
});

// context menu to save selections
iReader.highlighter = chrome.contextMenus.create( { "title": "Highlight Text",
                                                "contexts": ["selection"],
                                                "onclick": iReader.highlightText } );
// array of {}  (url, title, location)
// list of items to read later
iReader.articles = [];

// array of {} (tabid, location)
// tracks articles that need to scroll once loaded
iReader.toScroll = [];

// tell content script to handle highlight
iReader.highlightText = function (info, tab) {
    chrome.tabs.sendMessage(tab.id, { action: "getSelection"});
}

// open article from popup in new tab
iReader.openArticle = function (location, url) {
    chrome.tabs.create({
        url: url
    }, function (tab) {
        var tabId = tab.id;
        iReader.toScroll.push({tab:tabId, location: location});
    });
}

// notify tab to scroll to saved location via content script
iReader.scrollArticle = function (tabId) {
    // find correct tab
    for (var i = 0; i < this.toScroll.length; i++) {
        if (this.toScroll[i].tab == tabId) {
            chrome.tabs.sendMessage(tabId,
                                    {
                                        action: "scroll",
                                        location: this.toScroll[i].location,
                                        tabid: tabId
                                    },
                                   function(response) {});
            this.toScroll.splice(i, 1);
            break;
        }
    }
}
