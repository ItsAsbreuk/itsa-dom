"use strict";

/**
 * Adding sugar utilities to Element
 *
 *
 * <i>Copyright (c) 2016 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module itsa-dom
 * @class Element
 * @since 0.0.1
*/

require("itsa-jsext/lib/object");
require("itsa-jsext/lib/string");
require("itsa-jsext/lib/function");

var toCamelCase = function(input) {
        input || (input="");
        return input.replace(/-(.)/g, function(match, group) {
            return group.toUpperCase();
        });
    },
    fromCamelCase = function(input) {
        input || (input="");
        return input.replace(/[a-z]([A-Z])/g, function(match, group) {
            return match[0]+"-"+group.toLowerCase();
        });
    },
    STRING = "string",
    OVERFLOW = "overflow",
    SCROLL = "scroll",
    BORDER = "border",
    WIDTH = "width",
    STYLE = "style",
    _LEFT = "-left",
    _TOP = "-top",
    BORDER_LEFT_WIDTH = BORDER+_LEFT+"-"+WIDTH,
    BORDER_RIGHT_WIDTH = BORDER+"-right-"+WIDTH,
    BORDER_TOP_WIDTH = BORDER+_TOP+"-"+WIDTH,
    BORDER_BOTTOM_WIDTH = BORDER+"-bottom-"+WIDTH;

module.exports = function (WINDOW) {
    require("./window")(WINDOW);

    var DOCUMENT = WINDOW.document,
        scrollTo = require("./scrollto")(WINDOW);

    if (WINDOW.Element && WINDOW.Element.prototype) {
        (function(ElementPrototype) {

            /**
             * Reference to the first of sibbling HTMLElements.
             *
             * @method itsa_first
             * @param [cssSelector] {String} to return the first Element that matches the css-selector
             * @param [container] {HTMLElement} the container-element to search within --> this lead into searching out of the same level
             * @return {HTMLElement}
             * @since 0.0.1
             */
            ElementPrototype.itsa_first = function(cssSelector, container) {
                var containerNode = container || this.parentNode;
                return cssSelector ? containerNode.querySelector(cssSelector) : containerNode.children[0];
            };

            /**
             * Reference to the first child-HTMLElement.
             *
             * @method itsa_firstChild
             * @param [cssSelector] {String} to return the first Element that matches the css-selector or `undefined` when not found
             * @return {HTMLElement}
             * @since 0.0.1
             */
            ElementPrototype.itsa_firstChild = function(cssSelector) {
                var children = this.children,
                    node;
                if (!cssSelector) {
                    return children[0];
                }
                Array.prototype.some.call(children, function(childNode) {
                    childNode.matchesSelector(cssSelector) && (node=childNode);
                    return node;
                });
                return node;
            };

           /**
            * Forces the Element to be inside an ancestor-Element that has the `overfow="scroll" set.
            *
            * @method forceIntoNodeView
            * @param [ancestor] {Element} the Element where it should be forced into its view.
            *        Only use this when you know the ancestor and this ancestor has an `overflow="scroll"` property
            *        when not set, this method will seek through the doc-tree upwards for the first Element that does match this criteria.
            * @chainable
            * @since 0.0.1
            */
            ElementPrototype.itsa_forceIntoNodeView = function(ancestor, transitionTime) {
                var node = this,
                    parentOverflowNode = node.parentNode,
                    left, width, right, height, top, bottom, scrollLeft, scrollTop, parentOverflowNodeX, parentOverflowNodeY,
                    parentOverflowNodeStartTop, parentOverflowNodeStartLeft, parentOverflowNodeStopRight, parentOverflowNodeStopBottom, newX, newY;
                if (parentOverflowNode) {
                    if (ancestor) {
                        parentOverflowNode = ancestor;
                    }
                    else {
                        while (parentOverflowNode && (parentOverflowNode!==DOCUMENT) && !((parentOverflowNode.itsa_getStyle(OVERFLOW)===SCROLL) || (parentOverflowNode.itsa_getStyle(OVERFLOW+"-y")===SCROLL))) {
                            parentOverflowNode = parentOverflowNode.parentNode;
                        }
                    }
                    if (parentOverflowNode && (parentOverflowNode!==DOCUMENT)) {
                        left = node.itsa_left;
                        width = node.offsetWidth;
                        right = left + width;
                        height = node.offsetHeight;
                        top = node.itsa_top;
                        bottom = top + height;
                        scrollLeft = (parentOverflowNode===WINDOW) ? parentOverflowNode.itsa_getScrollLeft() : parentOverflowNode.scrollLeft;
                        scrollTop = (parentOverflowNode===WINDOW) ? parentOverflowNode.itsa_getScrollTop() : parentOverflowNode.scrollTop;
                        parentOverflowNodeX = parentOverflowNode.itsa_left;
                        parentOverflowNodeY = parentOverflowNode.itsa_top;
                        parentOverflowNodeStartTop = parentOverflowNodeY+parseInt(parentOverflowNode.itsa_getStyle(BORDER_TOP_WIDTH), 10);
                        parentOverflowNodeStartLeft = parentOverflowNodeX+parseInt(parentOverflowNode.itsa_getStyle(BORDER_LEFT_WIDTH), 10);
                        parentOverflowNodeStopRight = parentOverflowNodeX+parentOverflowNode.offsetWidth-parseInt(parentOverflowNode.itsa_getStyle(BORDER_RIGHT_WIDTH), 10);
                        parentOverflowNodeStopBottom = parentOverflowNodeY+parentOverflowNode.offsetHeight-parseInt(parentOverflowNode.itsa_getStyle(BORDER_BOTTOM_WIDTH), 10);

                        if (left<parentOverflowNodeStartLeft) {
                            newX = Math.max(0, scrollLeft+left-parentOverflowNodeStartLeft);
                        }
                        else if (right>parentOverflowNodeStopRight) {
                            newX = scrollLeft + right - parentOverflowNodeStopRight;
                        }
                        if (top<parentOverflowNodeStartTop) {
                            newY = Math.max(0, scrollTop+top-parentOverflowNodeStartTop);
                        }
                        else if (bottom>parentOverflowNodeStopBottom) {
                            newY = scrollTop + bottom - parentOverflowNodeStopBottom;
                        }
                        scrollTo(parentOverflowNode, scrollLeft, scrollTop, newX, newY, transitionTime);
                    }
                }
                return node;
            };

           /**
            * Focusses the node (if focussable), and forces the Element to be inside the visible window.
            *
            * @method itsa_focus
            * @param [atTop] {Element} the Element where it should be forced into its view.
            * @param [atLeft] {Element} the Element where it should be forced into its view.
            * @param [transitionTime] {Element} the Element where it should be forced into its view.
            * @chainable
            * @since 0.0.1
            */
            ElementPrototype.itsa_focus = function(atTop, atLeft, transitionTime) {
                // var instance = this;
                var currentY = WINDOW.itsa_getScrollTop(),
                    currentX = WINDOW.itsa_getScrollLeft();
                // focussing will bring the element into view directly, we don;t want that.
                // We want to scroll it into the view: therefore reset the scroll-position
                this.focus();
                WINDOW.scrollTo(currentX, currentY);
                this.itsa_scrollIntoView(atTop, atLeft, transitionTime);
            };

            /**
             * Gets an ElementArray of Elements that lie within this Element and match the css-selector.
             *
             * @method itsa_getAll
             * @param cssSelector {String} css-selector to match
             * @param [inspectProtectedNodes=false] {Boolean} no deepsearch in protected Nodes or iTags --> by default, these elements should be hidden
             * @return {ElementArray} ElementArray of Elements that match the css-selector
             * @since 0.0.1
             */
            ElementPrototype.itsa_getAll = function(cssSelector) {
                return this.querySelectorAll(cssSelector);
            };

           /**
            * Returns data set specified by `key`. If not set, `undefined` will be returned.
            * The data is efficiently stored on the vnode.
            *
            * @method itsa_getData
            * @param key {string} name of the key
            * @return {Any|undefined} data set specified by `key`
            * @since 0.0.1
            */
            ElementPrototype.itsa_getData = function(key) {
                return this._data && this._data[key];
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
            ElementPrototype.itsa_getElement = function(cssSelector) {
                return this.querySelector(cssSelector);
            };

           /**
            * Returns inline style of the specified property. `Inline` means: what is set directly on the Element,
            * this doesn't mean necesairy how it is looked like: when no css is set inline, the Element might still have
            * an appearance because of other CSS-rules.
            *
            * In most cases, you would be interesting in using `getStyle()` instead.
            *
            * Note: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
            *
            * @method itsa_getInlineStyle
            * @param cssProperty {String} the css-property to look for
            * @param [pseudo] {String} to look inside a pseudo-style
            * @return {String|undefined} css-style
            * @since 0.0.1
            */
            ElementPrototype.itsa_getInlineStyle = function(cssProperty) {
                var styles = this.getAttribute(STYLE) || "",
                    styleArray = styles.split(";"),
                    value;
                cssProperty = fromCamelCase(cssProperty);
                styleArray.some(function(style) {
                    var styleDetails = style.split(":"),
                        key = styleDetails[0].toLowerCase().itsa_trim();
                    if (key===cssProperty) {
                        value = styleDetails[1] ? styleDetails[1].toLowerCase().itsa_trim() : "";
                    }
                    return (value!==undefined);
                });
                return value;
            };

           /**
            * Returns cascaded style of the specified property. `Cascaded` means: the actual present style,
            * the way it is visible (calculated through the DOM-tree).
            *
            * <ul>
            *     <li>Note1: values are absolute: percentages and points are converted to absolute values, sizes are in pixels, colors in rgb/rgba-format.</li>
            *     <li>Note2: you cannot query shotcut-properties: use `margin-left` instead of `margin`.</li>
            *     <li>Note3: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine.</li>
            *     <li>Note4: you can query `transition`, `transform`, `perspective` and `transform-origin` instead of their vendor-specific properties.</li>
            *     <li>Note5: `transition` or `transform` return an Object instead of a String.</li>
            * </ul>
            *
            * @method itsa_getStyle
            * @param cssProperty {String} property that is queried
            * @param [pseudo] {String} to query pseudo-element, fe: `:before` or `:first-line`
            * @return {String|Object} value for the css-property: this is an Object for the properties `transition` or `transform`
            * @since 0.0.1
            */
            ElementPrototype.itsa_getStyle = function(cssProperty, pseudo) {
                // Cautious: when reading the property `transform`, getComputedStyle should
                // read the calculated value, but some browsers (webkit) only calculate the style on the current element
                // In those cases, we need a patch and look up the tree ourselves
                //  Also: we will return separate value, NOT matrices
                return WINDOW.getComputedStyle(this, pseudo)[toCamelCase(cssProperty)];
            };

           /**
            * Whether the Element has a specific class.
            *
            * @method itsa_hasClass
            * @param classname {String} the class to check for
            * @return {Boolean}
            * @since 0.0.1
            */
            ElementPrototype.itsa_hasClass = function(classname) {
                var classes = this.className || "";
                return classes.itsa_contains(classname);
            };

           /**
            * If the Element has data set specified by `key`. The data could be set with `itsa_setData()`.
            *
            * @method itsa_hasData
            * @param key {string} name of the key
            * @return {Boolean}
            * @since 0.0.1
            */
            ElementPrototype.itsa_hasData = function(key) {
                return !!(this._data && (this._data[key]!==undefined));
            };

           /**
            * Indicates whether Element currently has the focus.
            *
            * @method itsa_hasFocus
            * @param [inside=false] {Boolean} whether focus may also lie on a descendent Element
            * @return {Boolean}
            * @since 0.0.1
            */
            ElementPrototype.itsa_hasFocus = function(inside) {
                return (DOCUMENT.activeElement===this) || (inside ? this.itsa_hasFocusInside() : false);
            };

           /**
            * Indicates whether the current focussed Element lies inside this Element (on a descendant Element).
            *
            * @method itsa_hasFocusInside
            * @return {Boolean}
            * @since 0.0.1
            */
            ElementPrototype.itsa_hasFocusInside = function() {
                var activeElement = DOCUMENT.activeElement;
                return (this!==activeElement) && this.contains(activeElement);
            };

           /**
            * Returns whether the inline style of the specified property is present. `Inline` means: what is set directly on the Element.
            *
            * Note: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
            *
            * @method itsa_hasInlineStyle
            * @param cssProperty {String} the css-property to look for
            * @return {Boolean} whether the inlinestyle was present
            * @since 0.0.1
            */
            ElementPrototype.itsa_hasInlineStyle = function(cssProperty) {
                return !!this.itsa_getInlineStyle(cssProperty);
            };

           /**
             * Checks whether the Element lies within the specified selector (which can be a CSS-selector or a Element)
             *
             * @example
             * var divnode = childnode.itsa_inside('div.red');
             *
             * @example
             * var divnode = childnode.itsa_inside(containerNode);
             *
             * @method itsa_inside
             * @param selector {Element|String} the selector, specified by a Element or a css-selector
             * @return {Element|false} the nearest Element that matches the selector, or `false` when not found
             * @since 0.0.1
             */
            ElementPrototype.itsa_inside = function(selector) {
                var instance = this,
                    parentNode;
                if (typeof selector===STRING) {
                    parentNode = instance.parentNode;
                    while (parentNode && parentNode.matchesSelector && !parentNode.matchesSelector(selector)) {
                        parentNode = parentNode.parentNode;
                    }
                    return parentNode.matchesSelector ? parentNode : false;
                }
                else {
                    // selector should be an Element
                    return ((selector!==instance) && selector.contains(instance)) ? selector : false;
                }
            };

           /**
             * Checks whether a point specified with x,y is within the Element's region.
             *
             * @method itsa_insidePos
             * @param x {Number} x-value for new position (coordinates are page-based)
             * @param y {Number} y-value for new position (coordinates are page-based)
             * @return {Boolean} whether there is a match
             * @since 0.0.1
             */
            ElementPrototype.itsa_insidePos = function(x, y) {
                var instance = this,
                    left = instance.itsa_left,
                    top = instance.itsa_top,
                    right = left + instance.offsetWidth,
                    bottom = top + instance.offsetHeight;
                return (x>=left) && (x<=right) && (y>=top) && (y<=bottom);
            };

            /**
             * Whether the element is an Itag-element
             *
             * @method itsa_isEmpty
             * @return {Boolean}
             * @since 0.0.1
             */
            ElementPrototype.itsa_isEmpty = function() {
                return (this.childNodes.length===0);
            };

            /**
             * Reference to the last of sibbling node's, where the related dom-node is an Element(nodeType===1).
             *
             * @method itsa_last
             * @param [cssSelector] {String} to return the last Element that matches the css-selector
             * @param [container] {HTMLElement} the container-element to search within --> this lead into searching out of the same level
             * @return {Element}
             * @since 0.0.1
             */
            ElementPrototype.itsa_last = function(cssSelector, container) {
                var containerNode = container || this.parentNode,
                    allNodes = cssSelector ? containerNode.querySelectorAll(cssSelector) : containerNode.children,
                    len = allNodes.length;
                return allNodes[len-1];
            };

            /**
             * Reference to the last child-HTMLElement.
             *
             * @method itsa_lastChild
             * @param [cssSelector] {String} to return the last Element that matches the css-selector or `undefined` when not found
             * @return {HTMLElement}
             * @since 0.0.1
             */
            ElementPrototype.itsa_lastChild = function(cssSelector) {
                var children = this.children,
                    lastIndex = children.length-1,
                    i = lastIndex,
                    node, childNode;
                if (!cssSelector) {
                    return children[lastIndex];
                }
                while ((i>=0) && !node) {
                    childNode = children[i];
                    (childNode.matchesSelector(cssSelector)) && (node=childNode);
                    i--;
                }
                return node;
            };

           /**
             * Checks whether the Element has its rectangle inside the outbound-Element.
             * This is no check of the DOM-tree, but purely based upon coordinates.
             *
             * @method itsa_rectangleInside
             * @param outboundElement {Element} the Element where this element should lie inside
             * @return {Boolean} whether the Element lies inside the outboundElement
             * @since 0.0.1
             */
            ElementPrototype.itsa_rectangleInside = function(outboundElement) {
                var instance = this,
                    outerRect = outboundElement.getBoundingClientRect(),
                    innerRect = instance.getBoundingClientRect();
                return (outerRect.left<=innerRect.left) &&
                       (outerRect.top<=innerRect.top) &&
                       ((outerRect.left+outboundElement.offsetWidth)>=(innerRect.left+instance.offsetWidth)) &&
                       ((outerRect.top+outboundElement.offsetHeight)>=(innerRect.top+instance.offsetHeight));
            };

           /**
            * Removes data specified by `key` that was set by using `itsa_setData()`.
            * When no arguments are passed, all node-data (key-value pairs) will be removed.
            *
            * @method itsa_removeData
            * @param [key] {string} name of the key, when not set, all data is removed
            * @param [deep] {Boolean} whether to set the data to all descendants recursively
            * @chainable
            * @since 0.0.1
            */
            ElementPrototype.itsa_removeData = function(key, deep) {
                var instance = this;
                if (instance._data) {
                    if (key) {
                        delete instance._data[key];
                    }
                    else {
                        // we cannot just redefine _data, for it is set as readonly
                        instance.itsa_emptyObject();
                        if (deep) {
                            instance.children.forEach(function(element) {
                                element.itsa_removeData(key, true);
                            });
                        }
                    }
                }
                return instance;
            };

           /**
            * Forces the Element to be inside the visible window.
            *
            * @method itsa_scrollIntoView
            * @param [atTop] {Element} the Element where it should be forced into its view.
            * @param [atLeft] {Element} the Element where it should be forced into its view.
            * @param [transitionTime] {Element} the Element where it should be forced into its view.
            * @param [marginTop] {Element} additional top-margin
            * @param [marginLeft] {Element} additional left-margin
            * @chainable
            * @since 0.0.1
            */
            ElementPrototype.itsa_scrollIntoView = function(atTop, atLeft, transitionTime, marginTop, marginLeft) {
                var node = this,
                    newTop, newLeft, windowTop, windowLeft, windowBottom, windowRight;
                windowTop = WINDOW.itsa_getScrollTop();
                marginTop || (marginTop=0);
                marginLeft || (marginLeft=0);
                if (atTop || ((node.itsa_top-marginTop)<windowTop)) {
                    // position top of node on top of window
                    newTop = node.itsa_top;
                }
                if (!atTop) {
                    windowBottom = windowTop+WINDOW.itsa_getHeight();
                    if (node.itsa_bottom>windowBottom) {
                        // correct based on the bottom of the node, but never more than difference between top-node and top-window:
                        newTop = Math.round(Math.min((node.itsa_bottom - windowBottom), (node.itsa_top - windowTop)) + windowTop);
                    }
                }
                windowLeft = WINDOW.itsa_getScrollLeft();
                if (atLeft || ((node.itsa_left-marginLeft)<windowLeft)) {
                    // position left of node on left of window
                    newLeft = node.itsa_left;
                }
                if (!atLeft) {
                    windowRight = windowLeft+WINDOW.itsa_getWidth();
                    if (node.itsa_right>windowRight) {
                        // correct based on the right of the node, but never more than difference between left-node and left-window:
                        newLeft = Math.round(Math.min((node.itsa_right - windowRight), (node.itsa_left - windowLeft)) + windowLeft);
                    }
                }
                (newLeft!==undefined) && (newLeft-=marginLeft);
                (newTop!==undefined) && (newTop-=marginTop);
                scrollTo(WINDOW, windowLeft, windowTop, newLeft, newTop, transitionTime);
            };

            /**
             * Scrolls the content of the Element into the specified scrollposition.
             * Only available when the Element has overflow.
             *
             * @method itsa_scrollTo
             * @param x {Number} left-offset in pixels
             * @param y {Number} top-offset in pixels
             * @chainable
             * @since 0.0.1
            */
            ElementPrototype.itsa_scrollTo = function(x, y) {
                var instance = this;
                instance.scrollLeft = x;
                instance.scrollTop = y;
                return instance;
            };

            /**
             * Stores arbitary `data` at the Element (actually at vnode). This has nothing to do with node-attributes whatsoever,
             * it is just a way to bind any data to the specific Element so it can be retrieved later on with `itsa_getData()`.
             *
             * @method itsa_setData
             * @param key {string} name of the key
             * @param value {Any} the value that belongs to `key`
             * @param [deep] {Boolean} whether to set the data to all descendants recursively
             * @chainable
             * @since 0.0.1
            */
            ElementPrototype.itsa_setData = function(key, value, deep) {
                var instance = this;
                if (value!==undefined) {
                    instance._data || Object.itsa_protectedProp(instance, "_data", {});
                    instance._data[key] = value;
                    if (deep) {
                        instance.children.forEach(function(element) {
                            element.itsa_setData(key, value, true);
                        });
                    }
                }
                return instance;
            };

            if (Object.defineProperty
                && Object.getOwnPropertyDescriptor
                && (!Object.getOwnPropertyDescriptor(ElementPrototype, "itsa_bottom") ||
                    !Object.getOwnPropertyDescriptor(ElementPrototype, "itsa_bottom").get)) {
                    Object.defineProperties(ElementPrototype, {

                       /**
                        * Gets the bottom y-position (in the DOCUMENT) of the element in pixels.
                        * DOCUMENT-related: regardless of the WINDOW's scroll-position.
                        *
                        * @property itsa_bottom
                        * @since 0.0.1
                        */
                        itsa_bottom: {
                            get: function() {
                                return this.itsa_top + this.offsetHeight;
                            }
                        },

                       /**
                        * Returns the Elments `id`
                        *
                        * @method itsa_id
                        * @return {String|undefined} Elements `id`
                        * @since 0.0.1
                        */
                        itsa_id: {
                            get: function() {
                                return this.getAttribute("id");
                            }
                        },

                       /**
                        * Gets or set the innerHeight of the element in pixels. Excluded the borders.
                        * Included are padding.
                        *
                        * The getter is calculating through `offsetHeight`, the setter will set inline css-style for the height.
                        *
                        * Values are numbers without unity.
                        *
                        * @property itsa_innerHeight
                        * @type {Number}
                        * @since 0.0.1
                        */
                        itsa_innerHeight: {
                            get: function() {
                                var instance = this,
                                    borderTop = parseInt(instance.itsa_getStyle("border-top-width"), 10) || 0,
                                    borderBottom = parseInt(instance.itsa_getStyle("border-bottom-width"), 10) || 0;
                                return instance.offsetHeight - borderTop - borderBottom;
                            }
                        },

                       /**
                        * Gets or set the innerHeight of the element in pixels. Excluded the borders.
                        * Included are padding.
                        *
                        * The getter is calculating through `offsetHeight`, the setter will set inline css-style for the height.
                        *
                        * Values are numbers without unity.
                        *
                        * @property itsa_innerWidth
                        * @type {Number}
                        * @since 0.0.1
                        */
                        itsa_innerWidth: {
                            get: function() {
                                var instance = this,
                                    borderLeft = parseInt(instance.itsa_getStyle("border-left-width"), 10) || 0,
                                    borderRight = parseInt(instance.itsa_getStyle("border-right-width"), 10) || 0;
                                return instance.offsetWidth - borderLeft - borderRight;
                            }
                        },

                       /**
                        * Gets the x-position (in the DOCUMENT) of the element in pixels.
                        * DOCUMENT-related: regardless of the WINDOW's scroll-position.
                        *
                        * @property itsa_left
                        * @since 0.0.1
                        */
                        itsa_left: {
                            get: function() {
                                return Math.round(this.getBoundingClientRect().left + WINDOW.itsa_getScrollLeft());
                            }
                        },

                       /**
                        * Gets the right-position (in the DOCUMENT) of the element in pixels.
                        * DOCUMENT-related: regardless of the WINDOW's scroll-position.
                        *
                        * @property itsa_right
                        * @since 0.0.1
                        */
                        itsa_right: {
                            get: function() {
                                return this.itsa_left + this.offsetWidth;
                            }
                        },

                       /**
                        * Gets the y-position (in the DOCUMENT) of the element in pixels.
                        * DOCUMENT-related: regardless of the WINDOW's scroll-position.
                        *
                        * @property itsa_top
                        * @since 0.0.1
                        */
                        itsa_top: {
                            get: function() {
                                return Math.round(this.getBoundingClientRect().top + WINDOW.itsa_getScrollTop());
                            }
                        }

                    });
            }

        }(WINDOW.Element.prototype));
    }
};