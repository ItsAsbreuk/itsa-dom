"use strict";

var isNode = (typeof global!=="undefined") && ({}.toString.call(global)==="[object global]") && (!global.document || ({}.toString.call(global.document)!=="[object HTMLDocument]")),
    win = isNode ? global.window : window;

if (win) {
    require("./lib/polyfill.js")(win);
    require("./lib/window.js")(win);
    require("./lib/document.js")(win);
    require("./lib/element.js")(win);
}