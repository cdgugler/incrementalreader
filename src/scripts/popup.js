var iReader = iReader || {};

// popup btn and list should move under iReader.popup
iReader.readLaterBtn = document.querySelector('button.readlater-btn'),
iReader.articleUl = document.querySelector('ul.article-list'),
iReader.articles = [];
iReader.storage = chrome.storage.local;

iReader.storage.get('articles', function(items) {
  console.log(items.articles);
  if (items.articles) {
      iReader.articles = items.articles;
      iReader.populateList(iReader.articles);
  } else {
      iReader.articles = [];
  }
});

iReader.openArticle = function () {
    var id = this.parentNode.dataset.id,
        location = iReader.articles[id].location,
        url = this.href;
    // send open request to eventPage
    chrome.extension.sendMessage({action: "openArticle", location: iReader.articles[id]["location"], url:url }, function(response) {
        console.log(response);
    });
}

// updates local storage 
iReader.saveArticles = function (articles) {
    // Save it using the Chrome extension storage API.
    iReader.storage.set({'articles': articles}, function() {
    // Notify that we saved.
    console.log('Saved to Local storage!');
  });
}

// removes item from view & local storage
iReader.removeArticle = function () {
    // parent is LI element
    var parent = this.parentNode;
    parent.innerHTML = '';
    var url = parent.dataset.url;
    for (var i = 0; i < iReader.articles.length; i++) {
        if (iReader.articles[i].url == url) {
            console.log("Found match!");
            iReader.articles.splice(i, 1);
            break;
        }
    }
    iReader.saveArticles(iReader.articles);
    parent.parentNode.removeChild(parent);
}

iReader.populateList = function (articles) {
    for (var i = 0; i < articles.length; i++)
    {
        var newLi = document.createElement("li");
        var deleteAnchor = document.createElement("a");
        var newAnchor = document.createElement("a");
        var newText = document.createTextNode(articles[i].title);
        var deleteX = document.createTextNode("X");

        newAnchor.addEventListener('click', iReader.openArticle);
        deleteAnchor.addEventListener('click', iReader.removeArticle);
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
        iReader.articleUl.appendChild(newLi);
    }
}

iReader.addArticle = function () {
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
            var article = { url: url, title: title, location: response.location }
            iReader.articles.push(article);
            iReader.saveArticles(iReader.articles);

            var newItem = document.createElement("li");
            var deleteAnchor = document.createElement("a");
            var newAnchor = document.createElement("a");
            var newText = document.createTextNode(title);
            var deleteX = document.createTextNode("X");

            newAnchor.addEventListener('click', iReader.openArticle);
            deleteAnchor.addEventListener('click', iReader.removeArticle);
            
            deleteAnchor.href = "#";
            newItem.setAttribute('data-id', iReader.articles.length-1);
            newAnchor.href = url;
            deleteAnchor.className = "remove-item";

            newAnchor.appendChild(newText);
            deleteAnchor.appendChild(deleteX);
            newItem.appendChild(deleteAnchor);
            newItem.appendChild(newAnchor);
            iReader.articleUl.appendChild(newItem);
        });

    });

};

iReader.readLaterBtn.addEventListener('click', iReader.addArticle);
