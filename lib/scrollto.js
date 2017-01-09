"use strict";

module.exports = function (WINDOW) {

    var STRING = "string",
    DOCUMENT = WINDOW.document,
    TRANSITION = "transition",
    PX = "px",
    STYLE = "style",
    _IMPORTANT = " !important",
    _LEFT = "-left",
    _TOP = "-top",
    MARGIN = "margin",
    MARGIN_LEFT = MARGIN+_LEFT,
    MARGIN_TOP = MARGIN+_TOP,
    SCROLL_TIMER = 20,
    utils = require("itsa-utils"),
    async = utils.async,
    later = utils.later,
    css3Transition = DOCUMENT.body.style && (typeof DOCUMENT.body.style.transitionProperty===STRING),
    IE8_Events = !DOCUMENT.documentElement.addEventListener,
    calcSupport, vendorTransition, evTransitionEnd, objToStyle, styleToObj;

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

    return function(container, currentLeft, currentTop, newLeft, newTop, transitionTime) {
        var incrementX = 1,
            incrementY = 1,
            downX = true,
            downY = true,
            top = currentTop,
            left = currentLeft,
            windowContainer = (container===WINDOW),
            laterFn, afterTrans, currentMarginTop, currentMarginLeft, marginTop, marginLeft, timeOut,
            prevStyle, prevStyleObj, inlinestyleNoTrans, maxTop, maxLeft, timer;
        (newLeft===undefined) && (newLeft=(container===WINDOW) ? container.itsa_getScrollLeft() : container.scrollLeft);
        (newTop===undefined) && (newTop=(container===WINDOW) ? container.itsa_getScrollTop() : container.scrollTop);

        if ((currentLeft!==newLeft) || (currentTop!==newTop)) {
            windowContainer && (container=WINDOW.document.documentElement);
            if (transitionTime) {
                if (windowContainer && (calcSupport===undefined)) {
                    calcSupport=require("../helpers/css-calc")(WINDOW);
                }
                // on the full-screen, we can use CSS3 transition :)
                if (windowContainer && css3Transition && calcSupport) {
                    afterTrans = function(e) {
                        var node = e.target, newLeft, newTop,
                            inlinestyleNoTrans, prevStyle;
                        if (node===e.currentTarget) {
                            if (IE8_Events) {
                                node.detachEvent("on"+evTransitionEnd, afterTrans);
                            }
                            else {
                                node.removeEventListener(evTransitionEnd, afterTrans, true);
                            }
                            timer = node.itsa_getData("itsa_scrollTimer");
                            if (timer) {
                                // only the first end-transition we will take (in case of simultanious mulitple events)
                                timer.cancel();
                                inlinestyleNoTrans = container.itsa_getData("itsa_scrollToInlinestyleNoTrans");
                                prevStyle = container.itsa_getData("itsa_scrollToPrevStyle");
                                node.setAttribute(STYLE, inlinestyleNoTrans); // without transitions
                                newLeft = container.itsa_getData("itsa_scrollToNewLeft");
                                newTop = container.itsa_getData("itsa_scrollToNewTop");
                                // we might need a correction, when the original `html` had a margint-top/left set!
                                newLeft += parseInt(container.itsa_getStyle("marginLeft"), 10);
                                newTop += parseInt(container.itsa_getStyle("marginTop"), 10);
                                WINDOW.scrollTo(newLeft, newTop);
                                // cleaning up
                                if (prevStyle) {
                                    node.setAttribute(STYLE, prevStyle); // with possible transition (when defined before)
                                }
                                else {
                                    node.removeAttribute(STYLE);
                                }
                                node.itsa_removeData("itsa_scrollToInlinestyleNoTrans");
                                node.itsa_removeData("itsa_scrollToPrevStyle");
                                node.itsa_removeData("itsa_scrollTimer");
                                node.itsa_removeData("itsa_scrollToNewLeft");
                                node.itsa_removeData("itsa_scrollToNewTop");
                            }
                        }
                    };

                    // cautious: newLeft and newTop cannot just get any value you want: it migh be limited by the scrolloffset
                    // if window-scroll, then we set the css to HTML
                    timer = container.itsa_getData("itsa_scrollTimer");
                    timer && timer.cancel();

                    prevStyle = container.getAttribute(STYLE);
                    prevStyleObj = styleToObj(prevStyle);

                    // first: define the inlyne-style when there was no transition:
                    // use the right transition-css - vendor-specific:
                    vendorTransition || (vendorTransition=require("../helpers/vendor-css")(WINDOW).generator(TRANSITION));
                    prevStyleObj[vendorTransition] = "none"+_IMPORTANT;
                    inlinestyleNoTrans = objToStyle(prevStyleObj);

                    // to be able to use `scrollWidth` right in IE, we NEED to disable possible scrollbars:
                    prevStyleObj.overflow = "hidden"+(windowContainer ? "" : _IMPORTANT);
                    // set the original style, but only if not yet set
                    if (!timer) {
                        container.itsa_setData("itsa_scrollToInlinestyleNoTrans", inlinestyleNoTrans);
                        container.itsa_setData("itsa_scrollToPrevStyle", prevStyle);
                        container.setAttribute(STYLE, objToStyle(prevStyleObj)); // with possible transition (when defined before)
                    }

                    maxTop = container.scrollHeight - WINDOW.itsa_getHeight();
                    maxLeft = container.scrollWidth - WINDOW.itsa_getWidth();
                    (maxTop<newTop) && (newTop=maxTop);
                    (maxLeft<newLeft) && (newLeft=maxLeft);

                    currentMarginTop = parseInt(container.itsa_getStyle(MARGIN_TOP), 10);
                    currentMarginLeft = parseInt(container.itsa_getStyle(MARGIN_LEFT), 10);

                    newTop -= parseInt(currentMarginTop, 10);
                    newLeft -= parseInt(currentMarginLeft, 10);

                    container.itsa_setData("itsa_scrollToNewLeft", newLeft); // -parseInt(currentMarginLeft, 10));
                    container.itsa_setData("itsa_scrollToNewTop", newTop); //-parseInt(currentMarginTop, 10));

                    marginTop = currentTop - newTop;
                    marginLeft = currentLeft - newLeft;

                    // now, set the new inline styles:
                    marginTop && (prevStyleObj[MARGIN_TOP] = marginTop+PX+_IMPORTANT);
                    marginLeft && (prevStyleObj[MARGIN_LEFT] = marginLeft+PX+_IMPORTANT);

                    // now set inlinestyle with transition:
                    prevStyleObj[vendorTransition] = transitionTime + "ms ease-in-out"+_IMPORTANT;

                    // set eventlistener: revert when transition is ready:
                    evTransitionEnd || (evTransitionEnd=require("../helpers/vendor-"+TRANSITION+"-end")(WINDOW));
                    if (IE8_Events) {
                        container.attachEvent("on"+evTransitionEnd, afterTrans);
                    }
                    else {
                        container.addEventListener(evTransitionEnd, afterTrans, true);
                    }
                    // also, in case when the transistion-end event does not occur for some reason:
                    // we always need to have a backup that resets the scrollbehaviour of the container:
                    timeOut = transitionTime+50;
                    timer = later(afterTrans.bind(null, {target: container, currentTarget: container}), timeOut);
                    container.itsa_setData("itsa_scrollTimer", timer);

                    // force transition:
                    container.setAttribute(STYLE, objToStyle(prevStyleObj));
                }
                else {
                    // animate
                    incrementX = (newLeft - left) * (SCROLL_TIMER/transitionTime);
                    incrementY = (newTop - top) * (SCROLL_TIMER/transitionTime);
                    downX = (newLeft>left);
                    downY = (newTop>top);
                    laterFn = container.itsa_getData("itsa_scrollTimer");
                    laterFn && laterFn.cancel();
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
                            container.itsa_removeData("itsa_scrollTimer");
                            laterFn.cancel();
                        }
                    }, 0, SCROLL_TIMER);
                    container.itsa_setData("itsa_scrollTimer", laterFn);
                }
            }
            else {
                async(function() {
                    if (windowContainer) {
                        WINDOW.scrollTo(newLeft, newTop);
                    }
                    else {
                        container.itsa_scrollTo(newLeft, newTop);
                    }
                });
            }
        }
    };

};
