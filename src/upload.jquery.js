$.fn.uploader = function() {

    var $element = $(this);

    // init
    if (arguments.length && typeof arguments[0] === 'object') {
        // init
        $element.data('selfInstance', new Uploader($element, arguments[0]));
    }
    // configure initialised
    else {

        // check if uploader initialised
        var u = $element.data('selfInstance');
        if (!u) {
            throw new Error('Uploader not initialised');
        }

        // return uploader object
        if (!arguments.length) {
            return u;
        }

        // call Uploader method
        u[arguments[0]].apply(u, Array.prototype.slice.call(arguments, 1));
    }

};