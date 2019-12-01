/**
 * This file is part of the upload.js package.
 *
 * (c) Dmytro Sokil <dmytro.sokil@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

function Upload(element, options) {
    var self = this;

    this.fileInput = element;
    if (element.tagName !== 'INPUT' || element.type !== 'file') {
        throw Error('Upload must be applied to input of file type');
    }

    // configuration
    this.options = helper.extend({}, {
        /**
         * Events
         */
        onchoose: function() {},
        oninvalidfile: function(code) {},
        onsuccess: function(response) {},
        onerror: function(message) {},
        onbeforeupload: function() {},
        onafterupload: function() {},
        onprogress: function(loaded, total) {},
        /**
         * Validation
         */
        allowedFormats: [], // may be MIME type or extension
        maxSize: null,
        /**
         * Transport
         */
        transport: 'xhr',
        withCredentials: false,
        uploadUrl: null,
        /**
         * Progress
         */
        progressUrl: null,
        /**
         * User interface
         */
        name: 'file', // default name of file, if it not set in input element
        autoUpload: true,
        multiple: false
    }, options);

    // handle file change
    this.fileInput.addEventListener('change', function(e) {
        // register event handlers
        if ('function' === typeof options.onchoose) {
            options.onchoose.call(self, e);
        }

        // auto upload
        if (self.options.autoUpload) {
            self.uploadFile.call(self);
        }
    });

    // upload url
    if (!this.options.uploadUrl) {
        throw Error('Upload URL not specified');
    }

    // name
    if (!element.getAttribute('name')) {
        element.setAttribute('name', this.options.name);
    }


    // set transport
    this.setTransport(this.options.transport);

    // multiple
    if (this.options.multiple && this.transport instanceof XhrTransport) {
        element.setAttribute('multiple', 'multiple');
    } else {
        element.removeAttribute('multiple');
    }
}

/**
 * Class
 */
Upload.prototype = {

    setTransport: function(transportName) {
        // detect transport
        if (!transportName || ['xhr', 'iframe'].indexOf(transportName) === -1) {
            transportName = 'xhr';
        }

        var Transport;
        if (transportName === 'xhr' && 'undefined' !== typeof FormData) {
            Transport = XhrTransport;
        } else {
            Transport = IframeTransport;
        }

        // execute transport
        this.transport = new Transport(
            this.fileInput,
            this.options.withCredentials,
            this.options.onbeforeupload,
            this.options.onprogress,
            this.options.onsuccess,
            this.options.onerror,
            this.options.onafterupload
        );

        if (this.options.progressUrl && transportName === 'iframe') {
            this.transport.setProgressUrl(this.options.progressUrl);
        }
    },

    /**
      * Check allowed file size and format
      */
    validate: function() {

        // check for multi upload
        if (!this.options.multiple && this.fileInput.files.length > 1) {
            throw Error('Multiple upload not allowed');
        }

        for (var i = 0; i < this.fileInput.files.length; i++) {
            var file = this.fileInput.files[i];

            // size
            if (this.options.maxSize && file.size > this.options.maxSize) {
                throw Error('Size of file not allowed');
            }

            // extension
            if (this.options.allowedFormats.length) {
                var lastPointPos = file.name.lastIndexOf('.');
                var extension = (lastPointPos === -1) ? null : file.name.substr(lastPointPos + 1).toLowerCase();
                var isExtensionSupported = extension && this.options.allowedFormats.indexOf(extension) !== -1;
                var isMimeTypeSupported = this.options.allowedFormats.indexOf(file.type) !== -1;
                if (!isExtensionSupported && !isMimeTypeSupported) {
                    throw 'Format not allowed';
                }
            }
        }
    },

    uploadFile: function() {
        try {
            this.validate();
        } catch (code) {
            this.options.oninvalidfile.call(this, code);
            return;
        }

        var uploadUrl;

        if ('function' === typeof this.options.uploadUrl) {
            uploadUrl = this.options.uploadUrl.call(this);
        } else {
            uploadUrl = this.options.uploadUrl;
        }

        this.transport.send(uploadUrl);

        return this;
    }
};
