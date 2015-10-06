Upload.js
=========

Fully customizable frontend uploader component. UI you are making yourself.

## Quick example

```javascript
$('#fileInput').uploader({
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

## Backends

Language | Library
---------|--------
PHP      | https://github.com/sokil/php-upload
