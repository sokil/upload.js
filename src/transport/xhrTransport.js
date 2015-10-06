var XhrTransport = function() {
    var self = this;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) {
            return;
        }

        try {
            if (xhr.status !== 200) {
                throw new Error('Server returns error code ' + xhr.status);
            }

            var response = xhr.responseText;
            if (self.options.responseType === 'json') {
                response = response ? eval("(" + response + ")") : {};
            }

            self.options.onsuccess.call(self, response);
        }
        catch (e) {
            self.options.onerror.call(self, e.message);
        }

        self.options.onafterupload.call(self);
    };

    if ('upload' in xhr) {
        xhr.upload.onprogress = function(e) {
            self.options.onprogress.call(self, e.loaded, e.total);
        };
    } else {
        setTimeout(self._nginxUpdateProgress, 1000);
    }

    var uri = this._buildUploadHandlerUrl(),
        formData = new FormData();

    formData.append(this.options.fileInputName, this.fileInput.get(0).files[0]);

    // send
    xhr.open("POST", uri, true);

    if (!this.isCrossDomain()) {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    }

    xhr.send(formData);
};