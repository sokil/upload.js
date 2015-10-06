var FormTransport = function() {
    // check if proggress id already in url
    var additionalRequestParams = {};
    if (-1 === this.options.uploadHandlerUrl.indexOf('X-Progress-ID')) {
        // generate X-Progress-ID
        var uuid = "";
        for (var i = 0; i < 32; i++) {
            uuid += Math.floor(Math.random() * 16).toString(16);
        }

        additionalRequestParams['X-Progress-ID'] = uuid;
    }

    // prepare request uri
    var requestUri = this._buildUploadHandlerUrl(additionalRequestParams);

    // create iframe
    var $iframe = $('<iframe src="javascript:void(0);" style="display:none;" name="iframeUpload"></iframe>')
        .appendTo(document.body);

    var $form = $('<form method="post" enctype="multipart/form-data" action="' + requestUri + '" target="iframeUpload" style="display:none;"/>')
        .appendTo(document.body);

    // clone input
    var clonedFileInput = this.fileInput.clone(true),
        fileInputParent = this.fileInput.parent();

    // move file input to iframe form
    $(this.fileInput).attr('name', this.options.fileInputName).appendTo($form);

    // add clean file input to old location
    this.fileInput = clonedFileInput.appendTo(fileInputParent);

    var self = this;
    $iframe.load(function() {
        try {
            var response = $iframe.contents().find('body').html();
            if (self.options.responseType === 'json') {
                response = response ? eval("(" + response + ")") : {};
            }

            self.options.onsuccess.call(self, response);
        }
        catch (e) {
            self.options.onerror.call(self, e);

        }

        self.options.onafterupload.call(self);

        $iframe.remove();
        $form.remove();
    });

    setTimeout(self._nginxUpdateProgress, 1000);

    // submit form
    $form.submit();
};