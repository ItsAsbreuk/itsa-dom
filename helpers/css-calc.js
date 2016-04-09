"use strict";

module.exports = function (window) {
    var document = window.document,
        body = document.body,
        node, supportsCalc, childNode;
    childNode = document.createElement("div");
    childNode.setAttribute("style", "width: calc(10px - 2px); opacity:0; position: absolute; z-index: -1; left:-9999px; top:-9999px;");
    node = body.appendChild(childNode);
    supportsCalc = (node.offsetWidth===8);
    body.removeChild(node);
    return supportsCalc;
};