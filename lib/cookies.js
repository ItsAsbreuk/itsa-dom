"use strict";

/**
 * Adding easy to use cookie-methods to the document-object
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

var TMP_COOKIE_NAME = "itsa_tmp_cookie_check";

module.exports = function (WINDOW) {

    var DOCUMENT = WINDOW.document,
        COOKIE_SUPPORT = false;

    if (DOCUMENT) {
        /**
         * Gets all cookie-keys
         *
         * @method itsa_cookieKeys
         * @param cssSelector {String} css-selector to match
         * @return {Array} All the cookie-keys
         * @since 0.0.1
         */
        DOCUMENT.itsa_cookieKeys = function () {
            var aKeys = DOCUMENT.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/),
                nLen = aKeys.length,
                nIdx;
            for (nIdx = 0; nIdx < nLen; nIdx++) {
                aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
            }
            return aKeys;
        };

        /**
         * Tells whether the browser has cookies enabled
         *
         * @method itsa_cookieSupport
         * @return {Boolean} Whether the browser has cookies enabled
         * @since 0.0.1
         */
        DOCUMENT.itsa_cookieSupport = function () {
            return COOKIE_SUPPORT;
        };

        /**
         * Gets a cookie from the document
         *
         * @method itsa_getCookie
         * @param name {String} cookie-name
         * @return {String} The cookie-value
         * @since 0.0.1
         */
        DOCUMENT.itsa_getCookie = function (name) {
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        };

        /**
         * Check if a cookie exists
         *
         * @method itsa_hasCookie
         * @param name {String} The name of the cookie to test
         * @return {Boolean} Whether the cookie exists
         * @since 0.0.1
         */
        DOCUMENT.itsa_hasCookie = function (name) {
            if (!name) {
                return false;
            }
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(DOCUMENT.cookie);
        };

        /**
         * Removes a cookie from the document.
         *
         * @method itsa_removeCookie
         * @param name {String} The name of the cookie to remove
         * @param [path] {String} E.g., "/", "/mydir"; if not specified, defaults to the current path of the current document location (string or null).
         *                        The path must be absolute (see RFC 2965).
         * @param [domain] {String} E.g., "example.com",  or "subdomain.example.com"; if not specified, defaults to the host portion of the current document location (string or null),
         *                          but not including subdomains. Contrary to earlier specifications, leading dots in domain names are ignored. If a domain is specified,
         *                          subdomains are always included.
         * @return {Boolean} If removal was succesfull (returns `false` when coockie does not exist)
         * @since 0.0.1
         */
        DOCUMENT.itsa_removeCookie = function (name, path, domain) {
            if (!DOCUMENT.itsa_hasCookie(name)) {
                return false;
            }
            DOCUMENT.cookie = encodeURIComponent(name) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "");
            return true;
        };

        /**
         * Sets a cookie to the document.
         *
         * @method itsa_setCookie
         * @param name {String} The name of the cookie to create/overwrite
         * @param value {String} The value of the cookie
         * @param [end] {Number|String|Date} The max-age in seconds (e.g. 31536e3 for a year, Infinity for a never-expires cookie),
         *                                   or the expires date in GMTString format or as Date object; if not, the specified
         *                                   the cookie will expire at the end of the session (number – finite or Infinity – string, Date object or null).
         * @param [path] {String} The path from where the cookie will be readable. E.g., "/", "/mydir"; if not specified, defaults to the current path
         *                        of the current document location (string or null). The path must be absolute (see RFC 2965). For more information on
         *                        how to use relative paths in this argument, see this paragraph.
         * @param [domain] {String} The domain from where the cookie will be readable. E.g., "example.com", ".example.com" (includes all subdomains) or
         *                          "subdomain.example.com"; if not specified, defaults to the host portion of the current document location (string or null).
         * @param [secure] {Boolean} The cookie will be transmitted only over secure protocol as https (boolean or null).
         * @return {Boolean} Whether the cookie was created succesfully
         * @since 0.0.1
         */
        DOCUMENT.itsa_setCookie = function (name, value, end, path, domain, secure) {
            var sExpires = "";
            if (/^(?:expires|max\-age|path|domain|secure)$/i.test(name)) {
                return false;
            }
            if (typeof end==="number") {
                sExpires = (end === Infinity) ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + end;
            }
            else if (typeof end==="string") {
                sExpires = "; expires=" + end;
            }
            else if (end && (({}.toString).call(end)==="[object Date]")) {
                sExpires = "; expires=" + end.toUTCString();
            }
            DOCUMENT.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + sExpires + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "") + (secure ? "; secure" : "");
            return true;
        };

        // now try to set a cookie and check if it is indeed set and bind it to COOKIE_SUPPORT:
        DOCUMENT.itsa_setCookie(TMP_COOKIE_NAME, "true");
        (COOKIE_SUPPORT=(DOCUMENT.itsa_getCookie(TMP_COOKIE_NAME)==="true")) && DOCUMENT.itsa_removeCookie(TMP_COOKIE_NAME);
    }

};
