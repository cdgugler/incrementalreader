chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("content.js recvd message");
    if (request.action == "reqLoc")
    {
        var location = window.pageYOffset || document.documentElement.scrollTop;
        sendResponse({location: location});
    } else if (request.action == "scroll") {
        tabid = request.tabid;
        // chrome.tabs.onUpdated.addListener(function(tabid, changeInfo) {
        //     console.log("Added Listener.");
        //     if (changeInfo.status === 'complete') {
        //         console.log("Scrolling...");
        //     }
        // });
        console.log("Attempting to scroll.");
        if(request.location)
        {
            console.log("Scroll set");
            window.scrollTo(0, request.location);
        } else {
            console.log("No location found?");
        }
    } else {
        console.log("Bad request");
        sendResponse({});
    }
});
