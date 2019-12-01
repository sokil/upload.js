Upload.js
=========

[![npm](https://img.shields.io/npm/v/upload.js.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/upload.js)
[![npm](https://img.shields.io/npm/dt/upload.js.svg)](https://www.npmjs.com/package/upload.js)


Fully customizable frontend uploader component. UI you are making yourself.

## Install
```
npm install upload.js
```

## Usage

### Configuration

If you use jQuery:

```javascript
$('#fileInput').upload({
    transport: 'xhr', // available transports: 'xhr' and 'iframe'
    uploadUrl: '/upload', // may be function
    withCredentials: true, // add cookies and auth for CORS requests
    progressUrl: '/progress',
    allowedFormats: [
        'application/vnd.ms-excel', // may be MIME type
        'xslx' // may be extension
    ],
    maxSize: null,
    name: "file", // default name of file, used if it not set in input element
    autoUpload: true,
    multiple: false,
    onsuccess: function(response) {
        $('#status').html(response);
    },
    onerror: function(response) {
        $('#status').html(response);
    },
    onprogress: function(loaded, total) {
        // Twitter bootstrap progress
        var persents = Math.ceil(loaded / total * 100);
        var $progress = $('#fileInput')
            .closest('form')
            .find('.progress')
            .show();

        $progress.find('.progress-bar')
            .css({width: persents + "%"})
            .text(persents + '%');

        if(100 === persents) {
            setTimeout(function() {
                $progress.hide();
                $progress.find('.progress-bar')
                    .css({width: "0%"})
                    .text('0%');
            }, 800);
        }
    },
    onchoose: function(event) {
        // event: file input change event
        // this: instance of Upload class 
    },
    oninvalidfile: function(error) {
        // Error may be:
        // * "Multiple upload not allowed": when options.multiple set to false but multiple files uploaded
        // * "Size of file not allowed": when uploaded file size greater than options.maxSize
        // * "Format not allowed": when type of file not patch options.allowedFormats
    },
    onbeforeupload: function() {},
    onafterupload: function() {}
});
```

If you like plain old JS:

```javascript
const upload = new Upload(document.getElementById('fileInput'), {
    uploadUrl: '/upload', // may be function
});
```

### Autoupload and manual upload

By default input configured to auto upload file. To disable autoupload, set `autoUpload` configuration parameter to false, and then call method `uploadFile`:

```javascript
const upload = new Upload(
    document.getElementById('fileInput'), 
    {
        autoUpload: false,
    }
);

upload.uploadFile();
```


## Sandbox
Backend and frontend may be tested in sandbox https://github.com/sokil/php-upload-sandbox. Clone repo and start server.

## Backends

Language         | Library
-----------------|------------------------------------
PHP Library      | https://github.com/sokil/php-upload
Symfony Bundle   | https://github.com/sokil/FileStorageBundle

## Styles

Library has no styles. But you can do your own:

```html
<a id="newAttachment" class="btn-upload btn btn-success btn-xs pull-right">
    <input type="file" id="fileInput" name="file">
    <label for="fileInput">
        <span class="glyphicon glyphicon-upload"></span>&nbsp;Додати файл
    </label>
</a>
```

```less
.btn-upload {
    overflow: hidden;
    input {
        opacity: 0;
        width: 0.1px;
        height: 0.1px;
        position: absolute;
    }
    label {
        padding: 0;
        margin: 0;
        font-weight: 400;
    }
}
```
