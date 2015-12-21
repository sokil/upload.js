var IframeTransport = function(
    fileInput,
    uploadUrl,
    beforeUploadCallback,
    progressCallback,
    successCallback,
    errorCallback,
    afterUploadCallback
) {
    this.uuid = helper.generateUUID();

    // check if progress id already in uploadUrl
    uploadUrl = helper.appendQueryParams(uploadUrl, {
        'X-Progress-ID': this.uuid
    });

    // create iframe
    var iframe = document.createElement('iframe');
    iframe.src = "javascript:void(0);";
    iframe.style = "display:none;";
    iframe.name = "iframeUpload";
    document.body.appendChild(iframe);

    // create form
    var form = document.createElement('form');
    form.method = "post";
    form.enctype = "multipart/form-data";
    form.action = uploadUrl;
    form.target = "iframeUpload";
    form.style = "display:none;";
    document.body.appendChild(form);

    // clone input
    var clonedFileInput = fileInput.cloneNode(true),
        fileInputParent = fileInput.parentNode;

    // move file input to form
    form.appendChild(fileInput);

    // add clean file input to old location
    fileInputParent.appendChild(clonedFileInput);
    fileInput = clonedFileInput;

    var self = this;
    iframe.addEventListener('load', function() {
        try {
            var response = iframe.contentDocument.body.innerHTML;
            response = response ? JSON.parse(response) : {};
            successCallback.call(self, response);
        } catch (e) {
            errorCallback.call(self, e);
        }

        afterUploadCallback.call(self);

        iframe.parentNode.removeChild(iframe);
        form.parentNode.removeChild(form);
    });

    // start check of progress
    this.checkProgress(progressCallback);
}

IframeTransport.prototype = {
    createIframe: function() {

    },

    setProgressUrl: function(url) {
        this.progressUrl = url;
    },

    checkProgress: function(callback) {

        var self = this;

        // prepare url
        this.progressUrl = helper.appendQueryParams(
            this.progressUrl,
            {'X-Progress-ID': this.uuid}
        );

        // prepare xhr
        this.xhr = new XMLHttpRequest();
        this.xhr.open('GET', this.progressUrl, true);
        this.xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) {
                return;
            }

            var response = eval(responseText);

            switch (response.state) {
                case 'uploading':
                    callback.call(self, response.received, response.size);
                    setTimeout(function() {
                        self.xhr.send(null);
                    }, interval);
                    break;
            }
        };

        this.xhr.send(null);
    },

    send: function() {
        for (var i = 0; i < this.files.length; i++) {
            if (this.beforeUploadCallback.call(this) === false) {
                return;
            }
        }
        // submit form
        this.form.submit();
    }
};
