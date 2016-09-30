Upload.js
=========

[![npm](https://img.shields.io/npm/v/upload.js.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/upload.js)

Fully customizable frontend uploader component. UI you are making yourself.

## Install
```
npm install upload.js
```

## Quick example

```javascript
$('#fileInput').upload({
    transport: 'xhr',
    uploadHandlerUrl: '/upload',
    progressHandlerUrl: '/progress',
    uploadHandlerParams: function() {
        return {additionalParam: 'additionalValue'};
    },
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
    responseType: 'html'
});
```
## Sandbox
Backend and frontend may be tested in sandbox https://github.com/sokil/php-upload-sandbox. Clone repo and start server.

## Backends

Language         | Library
-----------------|------------------------------------
PHP Library      | https://github.com/sokil/php-upload
Symfony Bundle   | https://github.com/sokil/FileStorageBundle
