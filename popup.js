var readLater = document.querySelector('button.readlater-btn');
var readingList = document.querySelector('ul.reading-list');

var toRead = [];
var storage = chrome.storage.local;

function gogogo() {
    var id = this.parentNode.dataset.id;
    var location = toRead[id].location;
    // console.log(this.href);
    chrome.extension.sendMessage({action: "scroll", location: location }, function(response) {
        console.log(response);
    });
    chrome.tabs.create({
        url: this.href
    }, function (tab) {
        // tabid = tab.id;
        // console.log("Sending message to chrome ext:");
        // chrome.extension.sendMessage({action: "scroll", location: location, tab: tabid }, function(response) {
        //     console.log(response);
        // });

        // chrome.tabs.onUpdated.addListener(function(tab, changeInfo) {
        //     console.log("Added Listener.");
        //     if (changeInfo.status === 'complete') {
        //         console.log("Scrolling...");
        //         chrome.tabs.sendMessage(tab, {action: "scroll", location: location}, function(response) {});
        //     }
        // });

        // get the new window and scroll to the last location
        // chrome.tabs.query({
        //     active: true,
        //     windowId: chrome.windows.WINDOW_ID_CURRENT
        // }, 
        // function (tabsArray) {
        //     var tab = tabsArray[0];
        //     var theTab = tab.id;

        //     chrome.tabs.onUpdated.addListener(function(theTab, changeInfo) {
        //         // console.log("Listener added.");
        //         if (changeInfo.status === 'complete') {
        //             console.log("Trying to scroll!");
        //             chrome.tabs.sendMessage(theTab, {action: "scroll", location: location}, function(response) {
        //             });
        //         }
        //     });
        // });

    });
}
function addToRead(toRead) {
  // Save it using the Chrome extension storage API.
  storage.set({'toRead': toRead}, function() {
    // Notify that we saved.
    console.log('Success!');
  });
}
function removeItem() {
    var parent = this.parentNode;
    console.log(parent);
    parent.innerHTML = '';
    var id = parent.dataset.id;
    toRead.splice(id, 1);
    addToRead(toRead);
    parent.parentNode.removeChild(parent);
}

function makePretty (id, url, title) {
    var prettyText = 
        '<li data-id="' + id + '">' +
        '<a href="#" class="remove-item">X</a> '
        + '<a href="' + url + '">' + title + '</a></li>';
    return prettyText;
}

function populateList (toRead) {
    for (var i = 0; i < toRead.length; i++)
    {
        // var prettyText = makePretty(i, toRead[i].url, toRead[i].title);
        var newItem = document.createElement("li");
        var deleteAnchor = document.createElement("a");
        var newAnchor = document.createElement("a");
        var newText = document.createTextNode(toRead[i].title);
        var deleteX = document.createTextNode("X");

        newAnchor.addEventListener('click', gogogo);
        deleteAnchor.addEventListener('click', removeItem);
        deleteAnchor.href = "#";
        newItem.setAttribute('data-id', i);
        newAnchor.href = toRead[i].url;
        deleteAnchor.className = "remove-item";

        newAnchor.appendChild(newText);
        deleteAnchor.appendChild(deleteX);
        newItem.appendChild(deleteAnchor);
        newItem.appendChild(newAnchor);
        readingList.appendChild(newItem);
    }
}

storage.get('toRead', function(items) {
  console.log(items.toRead);
  if (items.toRead) {
      toRead = items.toRead;
      populateList(toRead);
  } else {
      toRead = [];
  }
});

var addPage = function (toReadList) {
    var location;
    chrome.tabs.query({
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    }, function (tabsArray) {
        var tab = tabsArray[0];
        console.log(tab);
        var url = tab.url;
        var title = tab.title;
        var id = tab.id;
        console.log(chrome.tabs);

        // get the scroll location
        chrome.tabs.sendMessage(id, {action: "reqLoc"}, function (response) {
            console.log("RESPONSE FROM content.js is: ");
            console.log(response.location);

            var newToRead = { url: url, title: title, location: response.location }
            console.log(newToRead);
            toRead.push(newToRead);
            addToRead(toRead);


            var newItem = document.createElement("li");
            var deleteAnchor = document.createElement("a");
            var newAnchor = document.createElement("a");
            var newText = document.createTextNode(title);
            var deleteX = document.createTextNode("X");

            newAnchor.addEventListener('click', gogogo);
            deleteAnchor.addEventListener('click', removeItem);
            
            deleteAnchor.href = "#";
            newItem.setAttribute('data-id', toRead.length-1);
            newAnchor.href = url;
            deleteAnchor.className = "remove-item";

            newAnchor.appendChild(newText);
            deleteAnchor.appendChild(deleteX);
            newItem.appendChild(deleteAnchor);
            newItem.appendChild(newAnchor);
            readingList.appendChild(newItem);
        });

    });

};


readLater.addEventListener('click', addPage);
