utils = Object.create({
    /*
    a wrapper around a CORS ajax request
     @return jQuery deferred object
    */
    makeCORSRequest: function(url, type, data) {
        return $.ajax({
            url: url,
            type: type,
            crossDomain: true,
            data: JSON.stringify(data),
            dataType: "json"
        });
    },

    /*
    fetch a template file from the filesystem
    @return jQuery deferred
     */
    fetchTemplate: function(tplName) {
        return $.get('/fetch-template/', {
            template: tplName
        });
    }
});

$.fn.outerHtml = function(newHtml) {
    var $el = $(this);
    $el.wrap('<div>').html(newHtml).unwrap();
}