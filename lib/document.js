"use strict";

/**
 * Adding sugar utilities to the document-object
 *
 *
 * <i>Copyright (c) 2016 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module itsa-dom
 * @class document
 * @since 0.0.1
*/

module.exports = function (WINDOW) {

    var DOCUMENT = WINDOW.document;

    if (DOCUMENT) {
        /**
         * Gets an ElementArray of Elements, specified by the css-selector.
         *
         * @method itsa_getAll
         * @param cssSelector {String} css-selector to match
         * @return {ElementArray} ElementArray of Elements that match the css-selector
         * @since 0.0.1
         */
        DOCUMENT.itsa_getAll = function(cssSelector) {
            return this.querySelectorAll(cssSelector);
        };

        /**
         * Gets one Element, specified by the css-selector. To retrieve a single element by id,
         * you need to prepend the id-name with a `#`. When multiple Element's match, the first is returned.
         *
         * @method itsa_getElement
         * @param cssSelector {String} css-selector to match
         * @return {Element|null} the Element that was search for
         * @since 0.0.1
         */
        DOCUMENT.itsa_getElement = function(cssSelector) {
            return ((cssSelector[0]==="#") && (cssSelector.indexOf(" ")===-1)) ? this.getElementById(cssSelector.substr(1)) : this.querySelector(cssSelector);
        };

       /**
        * Tests if an Element would be selected by the specified cssSelector.
        * Alias for `matchesSelector()`
        *
        * @method itsa_test
        * @param element {Element} The Element to test
        * @param cssSelector {String} the css-selector to test against
        * @return {Boolean} whether or not the node matches the selector
        * @since 0.0.1
        */
        DOCUMENT.itsa_test = function(element, cssSelector) {
            return element.matchesSelector(cssSelector);
        };
    }

};