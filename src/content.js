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
        var startContainer = highlightRange.startContainer;
        var endContainer = highlightRange.endContainer;
        // var containerNodes = highlightRange.commonAncestorContainer.childNodes;
        var newNode = document.createElement('mark');
        newNode.style.backgroundColor = "yellow";
        console.log('Before ' + highlightRange.endOffset);

        // check if start & end are same, if so split end node
        if (startContainer == endContainer) {
            // splits node at startOffset, returns text after the split location
            var splitNode = startContainer.splitText(highlightRange.startOffset);
            // modifies splitNode, returns text node after split as temp
            console.log('After ' + highlightRange.endOffset);
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
        var newNode = document.createElement('mark');
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
