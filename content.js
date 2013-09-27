chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    // handles request for current location in document
    if (request.action == "reqLoc") {
        var location = window.pageYOffset || document.documentElement.scrollTop;
        sendResponse({location: location});
    } else if (request.action == "scroll") {
        // handle request to scroll document window
        if(request.location)
        {
            console.log("Scroll set");
            window.scrollTo(0, request.location);
        } else {
            console.log("No location found?");
        }
    } else if (request.action == "getSelection") {

        // DOM METHOD
        // console.log(window.getSelection().getRangeAt(0).cloneContents());
        // var highlightText = window.getSelection().toString();

        var highlightRange = window.getSelection().getRangeAt(0);
        console.log(highlightRange);
        console.log(highlightRange.commonAncestorContainer);   
        console.log(highlightRange.commonAncestorContainer.childNodes);   
        var startContainer = highlightRange.startContainer;
        var endContainer = highlightRange.endContainer;
        if (startContainer == endContainer) console.log('Start matches end!');
        var containerNodes = highlightRange.commonAncestorContainer.childNodes;
        var newNode = document.createElement('span');
        newNode.style.backgroundColor = "yellow";

        // check if start & end are same, if so split end node
        if (startContainer == endContainer) {
            // splits node at startOffset, returns text after the split location
            var splitNode = startContainer.splitText(highlightRange.startOffset);
            // modifies splitNode, returns text node after split as temp
            var temp = splitNode.splitText(highlightRange.endOffset);
            // insert newNode before splitNode in the parentNode
            var insertElement = startContainer.parentNode.insertBefore(newNode, splitNode);
            // move splitNode into (as child of ) insertElement ( which is newNode )
            insertElement.appendChild(splitNode);
        } else {
            // ensure offsets are text node positions
            var startOffset = startContainer.nodeType === 3 ? highlightRange.startOffset : 0;
            console.log('Start offset ' + startOffset);
            var endOffset = endContainer.nodeType === 3 ? highlightRange.endOffset : 0;
            if (startOffset > 0) {
                var firstTextNode = startContainer.splitText(startOffset);
                highlightRange.setStart(firstTextNode, 0);
            }
            if (endOffset > 0) {
                var endTextNode = endContainer.splitText(endOffset);
            }
            var textNodes = [];
            textNodes = getTextNodes(highlightRange.commonAncestorContainer, textNodes);
            // textNodes[0].parentNode.removeChild(textNodes[0]);
            var realNodes = [];
            for (var i = 0; i < textNodes.length; i++) {
                if (rangeIntersectsNode(highlightRange, textNodes[i])) {
                    realNodes.push(textNodes[i]);
                }
            }
            console.log(realNodes);
            highlightNode(realNodes, 0, realNodes.length - 1);
        }
    } else {
        // No match for request.action
        console.log("Bad request");
        sendResponse({});
    }
});

function highlightNode(textNodes, start, end) {
    var numNodes = end + 1 - start;
    for (var i = 0; i < numNodes; i++) {
        // create span node element to wrap text node
        var newNode = document.createElement('span');
        newNode.style.backgroundColor = "yellow";
        var insertElement = textNodes[i].parentNode.insertBefore(newNode, textNodes[i]);
        // move splitNode into (as child of ) insertElement ( which is newNode )
        insertElement.appendChild(textNodes[i]);
    }
}

function rangeIntersectsNode(range, node) {
    var nodeRange;
    if (range.intersectsNode) {
        return range.intersectsNode(node);
    } else {
        nodeRange = node.ownerDocument.createRange();
        try {
            nodeRange.selectNode(node);
        } catch (e) {
            nodeRange.selectNodeContents(node);
        }
        return range.compareBoundaryPoints(Range.END_TO_START, nodeRange) == -1 &&
            range.compareBoundaryPoints(Range.START_TO_END, nodeRange) == 1;
    }
}

// gets all text nodes inside container node and returns array nodes
function getTextNodes (node, nodes) {
    if (node.nodeType == 3) {
        nodes.push(node);
    }
    var children = node.childNodes;
    for (var i = 0; i < node.childNodes.length; i++) {
        getTextNodes(node.childNodes[i], nodes);
    }
    return nodes;
}

function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        // gets html by appending a fragment to an html element and returning
        // the elements innerHTML
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}


// highlighting functions from http://www.nsftools.com/misc/SearchAndHighlight.htm
function doHighlight(bodyText, searchTerm, highlightStartTag, highlightEndTag) 
{
  // the highlightStartTag and highlightEndTag parameters are optional
  if ((!highlightStartTag) || (!highlightEndTag)) {
    highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
    highlightEndTag = "</font>";
  }
  // find all occurences of the search term in the given text,
  // and add some "highlight" tags to them (we're not using a
  // regular expression search, because we want to filter out
  // matches that occur within HTML tags and script blocks, so
  // we have to do a little extra validation)
  var newText = "";
  var i = -1;
  var lcSearchTerm = searchTerm.toLowerCase();
  var lcBodyText = bodyText.toLowerCase();

  while (bodyText.length > 0) {
    i = lcBodyText.indexOf(lcSearchTerm, i+1);
    if (i < 0) {
      newText += bodyText;
      bodyText = "";
    } else {
      // skip anything inside an HTML tag
      if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
        // skip anything inside a <script> block
        if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i)) {
          newText += bodyText.substring(0, i) + highlightStartTag + bodyText.substr(i, searchTerm.length) + highlightEndTag;
          bodyText = bodyText.substr(i + searchTerm.length);
          lcBodyText = bodyText.toLowerCase();
          i = -1;
        }
      }
    }
  }
  return newText;
}

function highlightSearchTerms(searchText, treatAsPhrase, warnOnFailure, highlightStartTag, highlightEndTag)
{
  // if the treatAsPhrase parameter is true, then we should search for 
  // the entire phrase that was entered; otherwise, we will split the
  // search string so that each word is searched for and highlighted
  // individually
  if (treatAsPhrase) {
    searchArray = [searchText];
  } else {
    searchArray = searchText.split(" ");
  }

  if (!document.body || typeof(document.body.innerHTML) == "undefined") {
    if (warnOnFailure) {
      alert("Sorry, for some reason the text of this page is unavailable. Searching will not work.");
    }
    return false;
  }

  var bodyText = document.body.innerHTML;
  console.log(bodyText);
  for (var i = 0; i < searchArray.length; i++) {
    bodyText = doHighlight(bodyText, searchArray[i], highlightStartTag, highlightEndTag);
  }
  document.body.innerHTML = bodyText;
  return true;
}

