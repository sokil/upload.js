(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('upload', ["jquery"], function (a0) {
      return (root['Upload'] = factory(a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("jquery"));
  } else {
    root['Upload'] = factory(jQuery);
  }
}(this, function ($) {

(function($) {
    function uploader($element, options) {
        var self = this;
        this.fileInput = $element;
        this.options = $.extend({}, {
            crossDomain: null,
            transport: null,
            progressHandlerUrl: null,
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
            responseType: "json",
            fileInputName: $element.attr("name") || "f",
            autoUpload: true
        }, options);
        this.container = this.fileInput.parent().css({
            overflow: "hidden"
        });
        if (this.container.css("position") === "static") {
            this.container.css({
                position: "relative"
            });
        }
        if (this.options.classname) {
            this.container.addClass(this.options.classname);
        }
        this.fileInput.css({
            opacity: 0,
            position: "absolute",
            zIndex: 100,
            top: "0px",
            right: "0px",
            fontSize: "200px",
            padding: "0px",
            margin: "0px",
            cursor: "pointer"
        });
        if (options.autoUpload) {
            this.fileInput.change(function() {
                self.uploadFile();
            });
        }
        if ("function" === typeof options.onchoose) {
            this.fileInput.change($.proxy(options.onchoose, this));
        }
        this.fileInput.appendTo(this.container);
    }
    uploader.prototype = {
        VALIDATE_ERROR_SIZE: 0,
        VALIDATE_ERROR_FORMAT: 1,
        isCrossDomain: function() {
            if (null !== this.options.crossDomain) {
                return !!this.options.crossDomain;
            }
            return this.options.uploadHandlerUrl.indexOf(location.host) === -1;
        },
        setOption: function(name, value) {
            this.options[name] = value;
            return this;
        },
        setTransport: function(transport) {
            this.options.transport = transport;
            return this;
        },
        setUploadHandlerUrl: function(url) {
            this.options.uploadHandlerUrl = url;
            return this;
        },
        _validate: function() {
            var file = this.fileInput.get(0).files[0];
            if (this.options.maxSize && file.size > this.options.maxSize) {
                throw this.VALIDATE_ERROR_SIZE;
            }
            if (this.options.supportedFormats.length) {
                var currentFormat = file.name.substr(file.name.lastIndexOf(".") + 1), formatAllowed = false;
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
        uploadFile: function() {
            try {
                this._validate();
            } catch (code) {
                this.options.oninvalidfile.call(this, code);
                return;
            }
            if (this.options.onbeforeupload.call(this) === false) {
                return;
            }
            if (this.options.transport) {
                this["_" + this.options.transport + "Upload"]();
            } else {
                try {
                    this._xhrUpload();
                } catch (e) {
                    this._formUpload();
                }
            }
            return this;
        },
        _streamUpload: function() {
            var self = this;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) {
                    return;
                }
                try {
                    if (xhr.status !== 200) {
                        throw new Error("Server returns error code " + xhr.status);
                    }
                    var response = xhr.responseText;
                    if (self.options.responseType === "json") {
                        response = response ? eval("(" + response + ")") : {};
                    }
                    self.options.onsuccess.call(self, response);
                } catch (e) {
                    self.options.onerror.call(self, e.message);
                }
                self.options.onafterupload.call(self);
            };
            if ("upload" in xhr) {
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
        },
        _xhrUpload: function() {
            var self = this;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) {
                    return;
                }
                try {
                    if (xhr.status !== 200) {
                        throw new Error("Server returns error code " + xhr.status);
                    }
                    var response = xhr.responseText;
                    if (self.options.responseType === "json") {
                        response = response ? eval("(" + response + ")") : {};
                    }
                    self.options.onsuccess.call(self, response);
                } catch (e) {
                    self.options.onerror.call(self, e.message);
                }
                self.options.onafterupload.call(self);
            };
            if ("upload" in xhr) {
                xhr.upload.onprogress = function(e) {
                    self.options.onprogress.call(self, e.loaded, e.total);
                };
            } else {
                setTimeout(self._nginxUpdateProgress, 1e3);
            }
            var uri = this._buildUploadHandlerUrl(), formData = new FormData();
            formData.append(this.options.fileInputName, this.fileInput.get(0).files[0]);
            xhr.open("POST", uri, true);
            if (!this.isCrossDomain()) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            }
            xhr.send(formData);
        },
        _formUpload: function() {
            var additionalRequestParams = {};
            if (-1 === this.options.uploadHandlerUrl.indexOf("X-Progress-ID")) {
                var uuid = "";
                for (var i = 0; i < 32; i++) {
                    uuid += Math.floor(Math.random() * 16).toString(16);
                }
                additionalRequestParams["X-Progress-ID"] = uuid;
            }
            var requestUri = this._buildUploadHandlerUrl(additionalRequestParams);
            var $iframe = $('<iframe src="javascript:void(0);" style="display:none;" name="iframeUpload"></iframe>').appendTo(document.body);
            var $form = $('<form method="post" enctype="multipart/form-data" action="' + requestUri + '" target="iframeUpload" style="display:none;"/>').appendTo(document.body);
            var clonedFileInput = this.fileInput.clone(true), fileInputParent = this.fileInput.parent();
            $(this.fileInput).attr("name", this.options.fileInputName).appendTo($form);
            this.fileInput = clonedFileInput.appendTo(fileInputParent);
            var self = this;
            $iframe.load(function() {
                try {
                    var response = $iframe.contents().find("body").html();
                    if (self.options.responseType === "json") {
                        response = response ? eval("(" + response + ")") : {};
                    }
                    self.options.onsuccess.call(self, response);
                } catch (e) {
                    self.options.onerror.call(self, e);
                }
                self.options.onafterupload.call(self);
                $iframe.remove();
                $form.remove();
            });
            setTimeout(self._nginxUpdateProgress, 1e3);
            $form.submit();
        },
        _nginxUpdateProgress: function() {
            var self = this;
            var url = this.options.progressHandlerUrl;
            if (-1 === url.indexOf("X-Progress-ID")) {
                url = this._appendQueryParams(url, {
                    "X-Progress-ID": uuid
                });
            }
            $.get(url, function(responseText) {
                var response = eval(responseText);
                switch (response.state) {
                  case "uploading":
                    this.options.onprogress.call(self, response.received, response.size);
                    setTimeout(self._nginxUpdateProgress, 5e3);
                    break;
                }
            });
        },
        _buildUploadHandlerUrl: function(additionalParams) {
            var params = this.options.uploadHandlerParams();
            if (typeof additionalParams !== "undefined") {
                params = $.extend({}, params, additionalParams);
            }
            return this._appendQueryParams(this.options.uploadHandlerUrl, params);
        },
        _appendQueryParams: function(url, params) {
            var queryString = [], queryMarkPos = url.indexOf("?");
            if (queryMarkPos >= 0) {
                queryString = url.substr(queryMarkPos + 1).split("&");
                url = url.substr(0, queryMarkPos);
            }
            for (var key in params) {
                queryString.push(key + "=" + encodeURIComponent(params[key]));
            }
            if (queryString.length > 0) {
                url += "?" + queryString.join("&");
            }
            return url;
        }
    };
    $.fn.uploader = function() {
        var $element = $(this);
        if (arguments.length && typeof arguments[0] === "object") {
            $element.data("selfInstance", new uploader($element, arguments[0]));
        } else {
            var u = $element.data("selfInstance");
            if (!u) {
                throw new Error("Uploader not initialised");
            }
            if (!arguments.length) {
                return u;
            }
            u[arguments[0]].apply(u, Array.prototype.slice.call(arguments, 1));
        }
    };
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return uploader;
        });
    }
})(jQuery);
return Upload;

}));
