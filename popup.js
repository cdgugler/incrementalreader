var readLater = document.querySelector('button.readlater-btn');
var readingList = document.querySelector('ul.reading-list');

var toRead = [];
var storage = chrome.storage.local;

// notify eventPage when popup closed to clean up list and save
var background = chrome.extension.getBackgroundPage();
window.addEventListener("unload", function (event) {
    background.console.log("Popup closed.");
});

function gogogo() {
    var id = this.parentNode.dataset.id,
        location = toRead[id].location,
        url = this.href;
    // send open request to eventPage
    chrome.extension.sendMessage({action: "openReadItem", location: toRead[id]["location"], url:url }, function(response) {
        console.log(response);
    });
}
// updates local storage 
function addToRead(toRead) {
    // Save it using the Chrome extension storage API.
    storage.set({'toRead': toRead}, function() {
    // Notify that we saved.
    console.log('Saved to Local storage!');
  });
}
// removes item from popup.html & local storage
function removeItem() {
    // parent is LI element
    var parent = this.parentNode;
    parent.innerHTML = '';
    // var id = parent.dataset.id;
    // toRead.splice(id, 1);
    var url = parent.dataset.url,
        loc = parent.dataset.loc;
    // remove item by url & loc as those should be unique
    // removing by id scuffles up the current list on the page
    for (var i = 0; i < toRead.length; i++) {
        if (toRead[i].url == url && toRead[i].location == loc) {
            console.log("Found match!");
            toRead.splice(i, 1);
            break;
        }
    }
    addToRead(toRead);
    parent.parentNode.removeChild(parent);
}

function populateList (toRead) {
    for (var i = 0; i < toRead.length; i++)
    {
        var newLi = document.createElement("li");
        var deleteAnchor = document.createElement("a");
        var newAnchor = document.createElement("a");
        var newText = document.createTextNode(toRead[i].title);
        var deleteX = document.createTextNode("X");

        newAnchor.addEventListener('click', gogogo);
        deleteAnchor.addEventListener('click', removeItem);
        deleteAnchor.href = "#";
        newLi.setAttribute('data-id', i);
        newLi.setAttribute('data-url', toRead[i].url);
        newLi.setAttribute('data-loc', toRead[i].location);
        newAnchor.href = toRead[i].url;
        deleteAnchor.className = "remove-item";

        newAnchor.appendChild(newText);
        deleteAnchor.appendChild(deleteX);
        newLi.appendChild(deleteAnchor);
        newLi.appendChild(newAnchor);
        readingList.appendChild(newLi);
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
