/**
 * This file is part of the upload.js package.
 *
 * (c) Dmytro Sokil <dmytro.sokil@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

$.fn.upload = function() {

    var $element = this,
        element = $element.get(0);

    // init
    if (arguments.length && typeof arguments[0] === 'object') {
        // init
        $element.data('selfInstance', new Upload(element, arguments[0]));
    } else {
        // check if uploader initialised
        var instance = $element.data('selfInstance');
        if (!instance) {
            throw new Error('Upload not initialised');
        }

        // call Uploader method
        instance[arguments[0]].apply(instance, Array.prototype.slice.call(arguments, 1));
    }

};
