var StreamTransport = function() {
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
    }

    var file = this.fileInput.get(0).files[0];

    var params = {};
    params[this.options.fileInputName] = file.name;

    var uri = this._buildUploadHandlerUrl(params);

    xhr.open("POST", uri, true);

    if (!this.isCrossDomain()) {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
    }

    xhr.send(file);
}