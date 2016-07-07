"use strict";

var isNode = require("itsa-utils").isNode,
    win = isNode ? global.window : window;

if (win) {
    require("./lib/polyfill.js")(win);
    require("./lib/window.js")(win);
    require("./lib/document.js")(win);
    require("./lib/element.js")(win);
    require("./lib/cookies.js")(win);
}
