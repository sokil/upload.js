/**
 * This file is part of the upload.js package.
 *
 * (c) Dmytro Sokil <dmytro.sokil@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var XhrTransport = function(
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
    this.withCredentials = withCredentials;
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;
    this.beforeUploadCallback = beforeUploadCallback;
    this.afterUploadCallback = afterUploadCallback;
    this.progressCallback = progressCallback;
};

XhrTransport.prototype = {
    createXhr: function() {
        var self = this;
        
        var xhr = new XMLHttpRequest();

        // allow CORS request with cookies
        if (this.withCredentials === true) {
            xhr.withCredentials = true;
        }
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) {
                return;
            }

            try {
                if (xhr.status !== 200) {
                    throw new Error('Server returns error code ' + xhr.status);
                }
                var response = JSON.parse(xhr.responseText);
                self.successCallback.call(self, response);
            } catch (e) {
                self.errorCallback.call(self, e.message);
            }

            self.afterUploadCallback.call(self);
        };

        // init progress
        if ('upload' in xhr) {
            xhr.upload.onprogress = function(e) {
                self.progressCallback.call(self, e.loaded, e.total);
            };
        }

        return xhr;
    },

    /**
     * @param {string} uploadUrl
     */
    send: function(uploadUrl) {

        var xhr = [];
        var files = this.fileInput.files;

        for (var i = 0; i < files.length; i++) {
            if (this.beforeUploadCallback.call(this) === false) {
                break;
            }

            xhr[i] = this.createXhr();
            xhr[i].open("POST", uploadUrl, true);
            xhr[i].setRequestHeader("X-Requested-With", "XMLHttpRequest");

            var formData = new FormData();
            formData.append(this.name, files[i]);

            xhr[i].send(formData);
        }
    }
};
