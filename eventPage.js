chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        console.log("Request is: ");
        console.log(request);
        if (request.action == "scroll") {
            // var tab = request.tab;
            var location = request.location;
            chrome.tabs.onUpdated.addListener(function(tab, changeInfo) {
                console.log("Added Listener.");
                console.log(tab);
                if (changeInfo.status === 'complete') {
                    console.log("Scrolling...");
                    console.log(tab);
                    chrome.tabs.sendMessage(tab,
                        {
                        action: "scroll",
                        location: location,
                        tabid: tab
                        }, 
                        function(response) {});

                    // chrome.tabs.sendMessage(tab, {action: "scroll", location: location}, function(response) {});
                }
            });
            console.log("Message Received at eventPage");
            sendResponse({response: "got it"});
        }
});
