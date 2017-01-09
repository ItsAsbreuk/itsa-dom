/**
 * Adding sugar utilities to the window-object
 *
 *
 * <i>Copyright (c) 2016 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module itsa-dom
 * @class window
 * @since 0.0.1
*/

"use strict";

module.exports = function (WINDOW) {

    var scrollTo = require("./scrollto")(WINDOW);

    var getScrollOffsets = function() {
        var doc = WINDOW.document;
        // this works for all browsers in non quircks-mode and only for IE9+:
        if (WINDOW.pageXOffset!==undefined) { // do not "just" check for `window.pageXOffset` --> it could be `0`
            return {
                x: WINDOW.pageXOffset,
                y: WINDOW.pageYOffset
            };
        }
        // for IE (or any other browser) in standards mode
        if (doc && (doc.compatMode === "CSS1Compat")) {
            return {
                x: doc.documentElement && doc.documentElement.scrollLeft,
                y: doc.documentElement && doc.documentElement.scrollTop
            };
        }
        // for browsers in quircks mode:
        return {
            x: doc && doc.body && doc.body.scrollLeft,
            y: doc && doc.body && doc.body.scrollTop
        };
    },

    getViewportSize = function() {
        var doc = WINDOW.document;
        // this works for all browsers in non quircks-mode and only for IE9+:
        if (WINDOW.innerWidth!==undefined) { // do not "just" check for `window.innerWidth` --> it could be `0`
            return {
                w: WINDOW.innerWidth,
                h: WINDOW.innerHeight
            };
        }
        // for IE (or any other browser) in standards mode
        if (doc && (doc.compatMode === "CSS1Compat")) {
            return {
                w: doc.documentElement && doc.documentElement.clientWidth,
                h: doc.documentElement && doc.documentElement.clientHeight
            };
        }
        // for browsers in quircks mode:
        return {
            w: doc && doc.body && doc.body.clientWidth,
            h: doc && doc.body && doc.body.clientHeight
        };
    };

    /**
     * Gets the left-scroll offset of the WINDOW.
     *
     * @method getScrollLeft
     * @return {Number} left-offset in pixels
     * @since 0.0.1
    */
    WINDOW.itsa_getScrollLeft = function() {
        return getScrollOffsets().x;
    };
    /**
     * Gets the top-scroll offset of the WINDOW.
     *
     * @method getScrollTop
     * @return {Number} top-offset in pixels
     * @since 0.0.1
    */
    WINDOW.itsa_getScrollTop = function() {
        return getScrollOffsets().y;
    };
   /**
    * Gets the width of the WINDOW.
    *
    * @method getWidth
    * @return {Number} width in pixels
    * @since 0.0.1
    */
    WINDOW.itsa_getWidth = function() {
        return getViewportSize().w;
    };
   /**
    * Gets the height of the WINDOW.
    *
    * @method getHeight
    * @return {Number} width in pixels
    * @since 0.0.1
    */
    WINDOW.itsa_getHeight = function() {
        return getViewportSize().h;
    };

    WINDOW.itsa_scrollTo = function(left, top, transitionTime) {
        if (!transitionTime) {
            WINDOW.scrollTo(left, top);
        }
        else {
            scrollTo(WINDOW, WINDOW.itsa_getScrollLeft(), WINDOW.itsa_getScrollTop(), left, top, transitionTime);
        }
    };

};