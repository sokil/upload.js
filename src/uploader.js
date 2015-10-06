function Uploader($element, options) {
    var self = this;

    this.fileInput = $element;

    // config
    this.options = $.extend({}, {
        crossDomain: null,
        transport: null, // set upload transport
        progressHandlerUrl: null, // only for iframe
        uploadHandlerUrl: null,
        uploadHandlerParams: function() {},
        classname: null,
        onchoose: function() {},
        onsuccess: function(response) {},
        onerror: function(message) {},
        oninvalidfile: function(code) {},
        onbeforeupload: function() {},
        onafterupload: function() {},
        onprogress: function(loaded, total) {},
        supportedFormats: [],
        maxSize: null,
        responseType: 'json',
        fileInputName: $element.attr('name') || 'f',
        autoUpload: true
    }, options);

    // container
    this.container = this.fileInput.parent()
        .css({overflow: 'hidden'});

    if (this.container.css('position') === 'static') {
        this.container.css({'position': 'relative'});
    }

    if (this.options.classname) {
        this.container.addClass(this.options.classname);
    }

    // button
    this.fileInput
        .css({
            opacity: 0,
            position: 'absolute',
            zIndex: 100,
            top: '0px',
            right: '0px',
            fontSize: '200px',
            padding: '0px',
            margin: '0px',
            cursor: 'pointer'
        });

    // auto upload
    if(options.autoUpload) {
        this.fileInput.change(function() {
            self.uploadFile();
        });
    }

    // register event handlers
    if('function' === typeof options.onchoose) {
        this.fileInput.change($.proxy(options.onchoose, this));
    }

    this.fileInput.appendTo(this.container);
}

/**
 * Class
 */
Uploader.prototype = {
    VALIDATE_ERROR_SIZE: 0,
    VALIDATE_ERROR_FORMAT: 1,
    isCrossDomain: function()
    {
        if (null !== this.options.crossDomain) {
            return !!this.options.crossDomain;
        }

        return (this.options.uploadHandlerUrl.indexOf(location.host) === -1);
    },
    setOption: function(name, value)
    {
        this.options[name] = value;
        return this;
    },
    setTransport: function(transport)
    {
        this.options.transport = transport;
        return this;
    },
    setUploadHandlerUrl: function(url)
    {
        this.options.uploadHandlerUrl = url;
        return this;
    },
    // check allowed file size and format
    _validate: function()
    {
        var file = this.fileInput.get(0).files[0];

        // size
        if (this.options.maxSize && file.size > this.options.maxSize) {
            throw this.VALIDATE_ERROR_SIZE;
        }

        // format
        if (this.options.supportedFormats.length) {
            var currentFormat = file.name.substr(file.name.lastIndexOf('.') + 1),
                    formatAllowed = false;

            for (var i = 0; i < this.options.supportedFormats.length; i++) {
                if (currentFormat.toLowerCase() === this.options.supportedFormats[i].toLowerCase()) {
                    formatAllowed = true;
                    break;
                }
            }

            if (!formatAllowed) {
                throw this.VALIDATE_ERROR_FORMAT;
            }
        }
    },
    uploadFile: function()
    {
        try {
            this._validate();
        }
        catch (code) {
            this.options.oninvalidfile.call(this, code);
            return;
        }

        if (this.options.onbeforeupload.call(this) === false) {
            return;
        }
        // upload
        if (this.options.transport) {
            var transportName = this.options.transport + 'Transport';
            this[transportName]();
        }
        else {
            try {
                this._xhrUpload();
            }
            catch (e) {
                this._formUpload();
            }
        }

        return this;
    },



    // get progress from nginx upload progress module
    _nginxUpdateProgress: function() {
        var self = this;

        // append profgress id
        var url = this.options.progressHandlerUrl;
        if (-1 === url.indexOf('X-Progress-ID')) {
            url = this._appendQueryParams(url, {'X-Progress-ID': uuid});
        }

        // get status
        $.get(url, function(responseText) {
            var response = eval(responseText);
            switch (response.state)
            {
                case 'uploading':
                    this.options.onprogress.call(self, response.received, response.size);
                    setTimeout(self._nginxUpdateProgress, 5000);
                    break;
            }

        });
    },

    buildUploadHandlerUrl: function(additionalParams)
    {
        var params = this.options.uploadHandlerParams();

        if (typeof additionalParams !== 'undefined') {
            params = $.extend({}, params, additionalParams);
        }

        return this.appendQueryParams(this.options.uploadHandlerUrl, params);
    },

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