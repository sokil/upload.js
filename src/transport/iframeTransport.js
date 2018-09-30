/**
 * This file is part of the upload.js package.
 *
 * (c) Dmytro Sokil <dmytro.sokil@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var IframeTransport = function(
    fileInput,
    withCredentials,
    beforeUploadCallback,
    progressCallback,
    successCallback,
    errorCallback,
    afterUploadCallback
) {
    this.fileInput = fileInput;
    this.name = fileInput.getAttribute('name');
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;
    this.beforeUploadCallback = beforeUploadCallback;
    this.afterUploadCallback = afterUploadCallback;
    this.progressCallback = progressCallback;

    this.uuid = helper.generateUUID();
}

IframeTransport.prototype = {
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

    /**
     * @param {string} uploadUrl
     */
    send: function(uploadUrl) {
        if (this.beforeUploadCallback.call(this) === false) {
            return;
        }

        // check if progress id already in uploadUrl
        uploadUrl = helper.appendQueryParams(uploadUrl, {
            'X-Progress-ID': this.uuid
        });

        // create iframe
        var iframe = document.createElement('iframe');
        iframe.src = "javascript:void(0);";
        iframe.style.display = "none";
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
        var clonedFileInput = this.fileInput.cloneNode(true),
            fileInputParent = this.fileInput.parentNode;

        // move file input to form
        form.appendChild(this.fileInput);

        // add clean file input to old location
        fileInputParent.appendChild(clonedFileInput);
        this.fileInput = clonedFileInput;

        var self = this;
        iframe.addEventListener('load', function() {
            try {
                var body = iframe.contentDocument.body;
                var response = body.textContent || body.innerText;
                response = response ? JSON.parse(response) : {};
                self.successCallback.call(self, response);
            } catch (e) {
                self.errorCallback.call(self, e);
            }

            self.afterUploadCallback.call(self);

            iframe.parentNode.removeChild(iframe);
            form.parentNode.removeChild(form);
        });

        // submit form
        form.submit();

        // start check of progress
        if (this.progressUrl) {
            this.checkProgress(this.progressCallback);
        }
    }
};
