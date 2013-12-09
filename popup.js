var iReader = iReader || {};

iReader.popup = {};
iReader.popup.readLaterBtn = document.querySelector('button.readlater-btn'),
iReader.popup.articleList = document.querySelector('ul.article-list'),
iReader.popup.articles = [];

var storage = chrome.storage.local;

// notify eventPage when popup closed to clean up list and save
var background = chrome.extension.getBackgroundPage();
window.addEventListener("unload", function (event) {
    background.console.log("Popup closed.");
});

function gogogo() {
    var id = this.parentNode.dataset.id,
        location = iReader.popup.articles[id].location,
        url = this.href;
    // send open request to eventPage
    chrome.extension.sendMessage({action: "openArticle", location: iReader.popup.articles[id]["location"], url:url }, function(response) {
        console.log(response);
    });
}
// updates local storage 
function addToRead(articles) {
    // Save it using the Chrome extension storage API.
    storage.set({'articles': articles}, function() {
    // Notify that we saved.
    console.log('Saved to Local storage!');
  });
}
// removes item from popup.html & local storage
function removeItem() {
    // parent is LI element
    var parent = this.parentNode;
    parent.innerHTML = '';
    var url = parent.dataset.url;
    for (var i = 0; i < iReader.popup.articles.length; i++) {
        if (iReader.popup.articles[i].url == url) {
            console.log("Found match!");
            iReader.popup.articles.splice(i, 1);
            break;
        }
    }
    addToRead(iReader.popup.articles);
    parent.parentNode.removeChild(parent);
}

function populateList (articles) {
    for (var i = 0; i < articles.length; i++)
    {
        var newLi = document.createElement("li");
        var deleteAnchor = document.createElement("a");
        var newAnchor = document.createElement("a");
        var newText = document.createTextNode(articles[i].title);
        var deleteX = document.createTextNode("X");

        newAnchor.addEventListener('click', gogogo);
        deleteAnchor.addEventListener('click', removeItem);
        deleteAnchor.href = "#";
        newLi.setAttribute('data-id', i);
        newLi.setAttribute('data-url', articles[i].url);
        newLi.setAttribute('data-loc', articles[i].location);
        newAnchor.href = articles[i].url;
        deleteAnchor.className = "remove-item";

        newAnchor.appendChild(newText);
        deleteAnchor.appendChild(deleteX);
        newLi.appendChild(deleteAnchor);
        newLi.appendChild(newAnchor);
        iReader.popup.articleList.appendChild(newLi);
    }
}

storage.get('articles', function(items) {
  console.log(items.articles);
  if (items.articles) {
      iReader.popup.articles = items.articles;
      populateList(iReader.popup.articles);
  } else {
      iReader.popup.articles = [];
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
            iReader.popup.articles.push(newToRead);
            addToRead(iReader.popup.articles);


            var newItem = document.createElement("li");
            var deleteAnchor = document.createElement("a");
            var newAnchor = document.createElement("a");
            var newText = document.createTextNode(title);
            var deleteX = document.createTextNode("X");

            newAnchor.addEventListener('click', gogogo);
            deleteAnchor.addEventListener('click', removeItem);
            
            deleteAnchor.href = "#";
            newItem.setAttribute('data-id', iReader.popup.articles.length-1);
            newAnchor.href = url;
            deleteAnchor.className = "remove-item";

            newAnchor.appendChild(newText);
            deleteAnchor.appendChild(deleteX);
            newItem.appendChild(deleteAnchor);
            newItem.appendChild(newAnchor);
            iReader.popup.articleList.appendChild(newItem);
        });

    });

};


iReader.popup.readLaterBtn.addEventListener('click', addPage);
