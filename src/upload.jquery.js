/**
 * This file is part of the upload.js package.
 *
 * (c) Dmytro Sokil <dmytro.sokil@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

if (typeof jQuery !== 'undefined') {
    jQuery.fn.upload = function() {
        var $elements = this;
        var options;

        // init
        if (arguments.length && typeof arguments[0] === 'object') {
            options = arguments[0];

            // init
            $elements.each(function() {
                $(this).data('selfInstance', new Upload(this, options));
            });
        } else {
            var command = arguments[0];
            options = Array.prototype.slice.call(arguments, 1);

            $elements.each(function() {
                // check if uploader initialised
                var instance = $(this).data('selfInstance');
                if (!instance) {
                    throw new Error('Upload not initialised');
                }

                // call Uploader method
                instance[command].apply(instance, options);
            });
        }
    };
}
