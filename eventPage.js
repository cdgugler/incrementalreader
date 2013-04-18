// handle messages
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    // openReadItem: user clicked item in read list
    if(request.action == "openReadItem") {
        iReader.openReadItem(request.location, request.url);
    }
});

// handle new tab scrolling
chrome.tabs.onUpdated.addListener(function(tab, changeInfo) {
    // only check if readItemWaitList has members
    if (changeInfo.status === 'complete' && iReader.readItemWaitList.length > 0) {
        iReader.scrollReadItem(tab);
    }
});

var iReader = {
    // list of items to read later, array of objects, {url, title, location}
    readItems: [],
    // list keeps track of pages that need scrolled once completely loaded
    readItemWaitList: [],
    // create new tab and add to wait list
    openReadItem: function (location, url) {
        chrome.tabs.create({
            url: url
        }, function (tab) {
            var tabid = tab.id;
            iReader.readItemWaitList.push({tab:tabid, location: location});
        });
    },
    scrollReadItem: function (tab) {
        // input (tab) is the target tab id
        // find correct tab and send message to content.js to scroll
        for (var i = 0; i < this.readItemWaitList.length; i++) {
            if (this.readItemWaitList[i].tab == tab) {
                chrome.tabs.sendMessage(tab,
                                        {
                                            action: "scroll",
                                            location: this.readItemWaitList[i].location,
                                            tabid: tab
                                        },
                                       function(response) {}
                                       );
                this.readItemWaitList.splice(i, 1);
                break; 
            }
        }
    }
};
