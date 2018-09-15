/**
 * This file is part of the upload.js package.
 *
 * (c) Dmytro Sokil <dmytro.sokil@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var helper = {
    /**
     * Extend object
     * @returns {{}}
     */
    extend: function() {
        var result = {};
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            for (var key in obj) {
                result[key] = obj[key];
            }
        }

        return result;
    },

    /**
     * Generate UUID
     */
    generateUUID: function() {
        var uuid = "";
        for (var i = 0; i < 32; i++) {
            uuid += Math.floor(Math.random() * 16).toString(16);
        }

        return uuid;
    },

    /**
     * Add query parameters to url
     * @param  url
     * @param params
     */
    appendQueryParams: function(url, params)
    {

        var queryString = [],
            queryMarkPos = url.indexOf('?');

        if (queryMarkPos >= 0) {
            queryString = url.substr(queryMarkPos + 1).split('&');
            url = url.substr(0, queryMarkPos);
        }

        for (var key in params) {
            queryString.push(key + '=' + encodeURIComponent(params[key]));
        }

        if (queryString.length > 0) {
            url += '?' + queryString.join('&');
        }

        return url;
    }
};
