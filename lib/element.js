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
    TRANSITION = "transition",
    STRING = "string",
    OVERFLOW = "overflow",
    SCROLL = "scroll",
    BORDER = "border",
    WIDTH = "width",
    PX = "px",
    STYLE = "style",
    _IMPORTANT = " !important",
    _LEFT = "-left",
    _TOP = "-top",
    BORDER_LEFT_WIDTH = BORDER+_LEFT+"-"+WIDTH,
    BORDER_RIGHT_WIDTH = BORDER+"-right-"+WIDTH,
    BORDER_TOP_WIDTH = BORDER+_TOP+"-"+WIDTH,
    BORDER_BOTTOM_WIDTH = BORDER+"-bottom-"+WIDTH,
    MARGIN = "margin",
    MARGIN_LEFT = MARGIN+_LEFT,
    MARGIN_TOP = MARGIN+_TOP,
    SCROLL_TIMER = 20,
    utils = require("itsa-utils"),
    async = utils.async,
    later = utils.later;

module.exports = function (WINDOW) {
    require("./window")(WINDOW);

    var DOCUMENT = WINDOW.document,
        css3Transition = DOCUMENT.body.style && (typeof DOCUMENT.body.style.transitionProperty===STRING),
        IE8_Events = !DOCUMENT.documentElement.addEventListener,
        scrollTo, calcSupport, vendorTransition, evTransitionEnd, objToStyle, styleToObj;

    objToStyle = function(obj) {
        var styles = "";
        obj.itsa_each(function(value, key) {
            styles += key+":"+value+";";
        });
        return styles;
    };

    styleToObj = function(styles) {
        var styleArray,
            obj = {};
        if (!styles) {
            return obj;
        }
        styleArray = styles.split(";");
        styleArray.forEach(function(style) {
            var styleDetails = style.split(":"),
                key = styleDetails[0] && styleDetails[0].toLowerCase().itsa_trim(),
                value = styleDetails[1] && styleDetails[1].toLowerCase().itsa_trim();
            if ((key!==undefined) && (value!==undefined)) {
                obj[key] = value;
            }
        });
        return obj;
    };

    scrollTo = function(container, currentLeft, currentTop, newLeft, newTop, transitionTime) {
        // todo: css3 scrolling when available:
        // http://codepen.io/kayhadrin/pen/KbalA
        var incrementX = 1,
            incrementY = 1,
            downX = true,
            downY = true,
            top = currentTop,
            left = currentLeft,
            windowContainer = (container===WINDOW),
            laterFn, afterTrans, currentMarginTop, currentMarginLeft, marginTop, marginLeft,
            prevStyle, prevStyleObj, inlinestyleNoTrans, afterTransFnRef, maxTop, maxLeft;
        (newLeft===undefined) && (newLeft=container.scrollLeft);
        (newTop===undefined) && (newTop=container.scrollTop);

        if ((currentLeft!==newLeft) || (currentTop!==newTop)) {
            if (transitionTime) {
                if (windowContainer && (calcSupport===undefined)) {
                    calcSupport=require("../helpers/css-calc")(WINDOW);
                }
                // on the full-screen, we can use CSS3 transition :)
                if (windowContainer && css3Transition && calcSupport) {
                    afterTrans = function(e, inlinestyleNoTrans, prevStyle, newLeft, newTop) {
                        var node = e.target;
                        if (node===e.currentTarget) {
                            if (IE8_Events) {
                                node.detachEvent("on"+evTransitionEnd, afterTransFnRef);
                            }
                            else {
                                node.removeEventListener(evTransitionEnd, afterTransFnRef, true);
                            }
                            node.setAttribute(STYLE, inlinestyleNoTrans); // without transitions
                            WINDOW.scrollTo(newLeft, newTop);
                            if (prevStyle) {
                                node.setAttribute(STYLE, prevStyle); // with possible transition (when defined before)
                            }
                            else {
                                node.removeAttribute(STYLE);
                            }
                        }
                    };

                    // cautious: newLeft and newTop cannot just get any value you want: it migh be limited by the scrolloffset
                    // if window-scroll, then we set the css to HTML
                    container = WINDOW.document.documentElement;
                    prevStyle = container.getAttribute(STYLE);
                    prevStyleObj = styleToObj(prevStyle);

                    // first: define the inlyne-style when there was no transition:
                    // use the right transition-css - vendor-specific:
                    vendorTransition || (vendorTransition=require("../helpers/vendor-css")(WINDOW).generator(TRANSITION));
                    prevStyleObj[vendorTransition] = "none"+_IMPORTANT;
                    inlinestyleNoTrans = objToStyle(prevStyleObj);

                    // to be able to use `scrollWidth` right in IE, we NEED to disable possible scrollbars:
                    prevStyleObj.overflow = "hidden"+_IMPORTANT;
                    // already set this style to the `head` --> we disable the scrollbars
                    container.setAttribute(STYLE, objToStyle(prevStyleObj)); // with possible transition (when defined before)

                    maxTop = container.scrollHeight - WINDOW.itsa_getHeight();
                    maxLeft = container.scrollWidth - WINDOW.itsa_getWidth();
                    (maxTop<newTop) && (newTop=maxTop);
                    (maxLeft<newLeft) && (newLeft=maxLeft);

                    currentMarginTop = container.itsa_getStyle(MARGIN_TOP);
                    currentMarginLeft = container.itsa_getStyle(MARGIN_LEFT);

                    marginTop = currentTop - newTop;
                    marginLeft = currentLeft - newLeft;

                    if (parseInt(currentMarginTop, 10)) {
                        marginTop = "calc("+currentMarginTop+" "+((marginTop<0) ? "- "+(-1*marginTop) : marginTop)+PX+")";
                    }
                    else {
                        marginTop += PX;
                    }
                    if (parseInt(currentMarginLeft, 10)) {
                        marginLeft = "calc("+currentMarginLeft+" "+((marginLeft<0) ? "- "+(-1*marginLeft) : marginLeft)+PX+")";
                    }
                    else {
                        marginLeft += PX;
                    }

                    // now, set the new inline styles:
                    marginTop && (prevStyleObj[MARGIN_TOP] = marginTop+_IMPORTANT);
                    marginLeft && (prevStyleObj[MARGIN_LEFT] = marginLeft+_IMPORTANT);
                    // now set inlinestyle with transition:
                    prevStyleObj[vendorTransition] = transitionTime + "ms ease-in-out"+_IMPORTANT;

                    // set eventlistener: revert when transition is ready:
                    evTransitionEnd || (evTransitionEnd=require("../helpers/vendor-"+TRANSITION+"-end")(WINDOW));
                    afterTransFnRef = afterTrans.itsa_rbind(null, inlinestyleNoTrans, prevStyle, newLeft, newTop);
                    if (IE8_Events) {
                        container.attachEvent("on"+evTransitionEnd, afterTransFnRef);
                    }
                    else {
                        container.addEventListener(evTransitionEnd, afterTransFnRef, true);
                    }

                    // force transition:
                    container.setAttribute(STYLE, objToStyle(prevStyleObj));
                }
                else {
                    // animate
                    incrementX = (newLeft - left) * (SCROLL_TIMER/transitionTime);
                    incrementY = (newTop - top) * (SCROLL_TIMER/transitionTime);
                    downX = (newLeft>left);
                    downY = (newTop>top);
                    laterFn = later(function() {
                        left += incrementX;
                        top += incrementY;
                        if (downX) {
                            (left<=newLeft) || (left=newLeft);
                        }
                        else {
                            (left>=newLeft) || (left=newLeft);
                        }
                        if (downY) {
                            (top<=newTop) || (top=newTop);
                        }
                        else {
                            (top>=newTop) || (top=newTop);
                        }
                        if (windowContainer) {
                            container.scrollTo(Math.round(left), Math.round(top));
                        }
                        else {
                            container.itsa_scrollTo(Math.round(left), Math.round(top));
                        }
                        if (top===newTop) {
                            laterFn.cancel();
                        }
                    }, 0, SCROLL_TIMER);
                }
            }
            else {
                async(function() {
                    if (windowContainer) {
                        container.scrollTo(newLeft, newTop);
                    }
                    else {
                        container.itsa_scrollTo(newLeft, newTop);
                    }
                });
            }
        }
    };

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
            // TODO: transitioned: http://wibblystuff.blogspot.nl/2014/04/in-page-smooth-scroll-using-css3.html
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
                    scrollLeft = parentOverflowNode.scrollLeft;
                    scrollTop = parentOverflowNode.scrollTop;
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
        * Forces the Element to be inside the visible window.
        *
        * @method itsa_scrollIntoView
        * @param [atTop] {Element} the Element where it should be forced into its view.
        * @param [atLeft] {Element} the Element where it should be forced into its view.
        * @param [transitionTime] {Element} the Element where it should be forced into its view.
        * @chainable
        * @since 0.0.1
        */
        ElementPrototype.itsa_scrollIntoView = function(atTop, atLeft, transitionTime) {
            var node = this,
                newTop, newLeft, windowTop, windowLeft, windowBottom, windowRight;
            windowTop = WINDOW.itsa_getScrollTop();
            if (atTop || (node.itsa_top<windowTop)) {
                // position top of node on top of window
                newTop = Math.round(node.itsa_top + windowTop);
            }
            if (!atTop) {
                windowBottom = windowTop+WINDOW.itsa_getHeight();
                if (node.itsa_bottom>windowBottom) {
                    newTop = Math.round(node.itsa_bottom - windowBottom + windowTop);
                }
            }
            windowLeft = WINDOW.itsa_getScrollLeft();
            if (atLeft || (node.itsa_left<windowLeft)) {
                // position left of node on left of window
                newLeft = Math.round(node.itsa_left + windowLeft);
            }
            if (!atLeft) {
                windowRight = windowLeft+WINDOW.itsa_getWidth();
                if (node.itsa_right>windowRight) {
                    newLeft = Math.round(node.itsa_right - windowRight + windowLeft);
                }
            }
            scrollTo(WINDOW, windowLeft, windowTop, newLeft, newTop, transitionTime);
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

    }(WINDOW.Element.prototype));

};