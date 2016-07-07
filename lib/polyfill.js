/**
 * A few basic polyfills for window and Element
 *
 *
 * <i>Copyright (c) 2016 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module itsa-dom
 * @class polyfill
 * @since 0.0.1
*/

"use strict";

var CONSOLE = {
        log: function() { /* NOOP */ },
        info: function() { /* NOOP */ },
        warn: function() { /* NOOP */ },
        error: function() { /* NOOP */ }
    };

module.exports = function (WINDOW) {
    WINDOW.console || (function(GlobalPrototype) {
        GlobalPrototype && (GlobalPrototype.console=CONSOLE);
    }(WINDOW.prototype));

    WINDOW.Element && WINDOW.Element.prototype && (function(ElementPrototype) {

        ElementPrototype.matchesSelector ||
            (ElementPrototype.matchesSelector = ElementPrototype.mozMatchesSelector ||
                                                ElementPrototype.msMatchesSelector ||
                                                ElementPrototype.oMatchesSelector ||
                                                ElementPrototype.webkitMatchesSelector ||
                                                function (selector) {
                                                    var node = this,
                                                        nodes = (node.parentNode || WINDOW.document).querySelectorAll(selector),
                                                        i = -1;
                                                    while (nodes[++i] && (nodes[i] !== node));
                                                    return !!nodes[i];
                                                }
            );

        if (Object.defineProperty
            && Object.getOwnPropertyDescriptor
            && Object.getOwnPropertyDescriptor(ElementPrototype, "textContent")
            && !Object.getOwnPropertyDescriptor(ElementPrototype, "textContent").get) {
            (function() {
                var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
                Object.defineProperty(Element.prototype, "textContent", {
                    get: function() {
                        return innerText.get.call(this);
                    },
                    set: function(s) {
                        return innerText.set.call(this, s);
                    }
                });
            }());
        }

    }(WINDOW.Element.prototype));
};