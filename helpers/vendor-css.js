"use strict";

/*
 * Returns the vendor-specific transform-property for the current environment.
 *
 * `transform`, `-webkit-transform`, `-moz-transform`, `-ms-transform`, `-o-transform` or `undefined` when not supported
 */

var toCamelCase = function(input) {
        return input.replace(/-(.)/g, function(match, group) {
            return group.toUpperCase();
        });
    },
    isNode = (typeof global!=="undefined") && ({}.toString.call(global)==="[object global]") && (!global.document || ({}.toString.call(global.document)!=="[object HTMLDocument]")),
    UNDEFINED = "undefined",
    VendorCSS;

module.exports = function (window) {


    if (VendorCSS) {
        return VendorCSS; // VendorCSS was already created
    }

    var DOCUMENT_STYLE = window.document.documentElement.style,
        VENDORS = ["-webkit-", "-moz-", "-ms-", "-o-"];

    VendorCSS = {
        generator: function(cssProperty) {
            var vendorProperty;
            if (cssProperty==="") {
                return "";
            }
            if (!isNode && !VendorCSS.cssProps[cssProperty]) {
                if (typeof DOCUMENT_STYLE[cssProperty] !== UNDEFINED) {
                    vendorProperty = cssProperty;
                }
                else {
                    VENDORS.some(function(val) { // then vendor specific
                        var property = val + cssProperty,
                            propertyCamelCase = toCamelCase(property);
                        if ((typeof DOCUMENT_STYLE[property] !== UNDEFINED) || (typeof DOCUMENT_STYLE[propertyCamelCase] !== UNDEFINED)) {
                            vendorProperty = property;
                        }
                        return vendorProperty;
                    });
                }
                VendorCSS.cssProps[vendorProperty] = true;
            }
            return vendorProperty || cssProperty;
        },

        cssProps: {}
    };

    return VendorCSS;
};