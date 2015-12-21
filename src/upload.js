function Upload(element, options) {
    var self = this;

    this.fileInput = element;
    if (element.tagName !== 'INPUT' || element.type !== 'file') {
        throw Error('Upload must be applied to input of file type');
    }

    this.container = element.parentNode;

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
        allowedFormats: [],
        maxSize: null,
        /**
         * Transport
         */
        transport: 'xhr',
        crossDomain: null,
        uploadUrl: null,
        /**
         * Progress
         */
        progressUrl: null,
        /**
         * User interface
         */
        name: 'f',
        autoUpload: true,
        multiple: false
    }, options);

    // auto upload
    if(this.options.autoUpload) {
        this.fileInput.addEventListener('change', function() {
            self.uploadFile.call(self);
        });
    }

    // multiple
    if (this.options.multiple) {
        element.setAttribute('multiple', 'multiple');
    } else {
        element.removeAttribute('multiple');
    }

    // register event handlers
    if('function' === typeof options.onchoose) {
        this.fileInput.addEventListener('change', options.onchoose);
    }

    // upload url
    if (!this.options.uploadUrl) {
        throw Error('Upload URL not specified');
    }

    // name
    element.setAttribute('name', this.options.name);
}

/**
 * Class
 */
Upload.prototype = {

    setOption: function(name, value) {
        this.options[name] = value;
        return this;
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
                var extension = file.name
                    .substr(file.name.lastIndexOf('.') + 1)
                    .toLowerCase();

                if (-1 === this.options.allowedFormats.indexOf(extension) &&
                    -1 === this.options.allowedFormats.indexOf(file.type)) {
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

        // url
        var uploadUrl;
        if ('function' === typeof this.options.uploadUrl) {
            uploadUrl = this.options.uploadUrl();
        } else {
            uploadUrl = this.options.uploadUrl;
        }

        // detect transport
        var transportName;
        if (this.options.transport && ['xhr', 'iframe'].indexOf(this.options.transport) !== -1) {
            transportName = this.options.transport;
        }

        var Transport;
        if (transportName === 'xhr' && 'undefined' !== typeof FormData) {
            Transport = XhrTransport;
        } else {
            Transport = IframeTransport;
        }

        // execute transport
        var transport = new Transport(
            this.fileInput,
            uploadUrl,
            this.options.onbeforeupload,
            this.options.onprogress,
            this.options.onsuccess,
            this.options.onerror,
            this.options.onafterupload
        );

        if (transportName === 'iframe') {
            transport.setProgressUrl(this.options.progressUrl);
        }

        transport.send();

        return this;
    }
};