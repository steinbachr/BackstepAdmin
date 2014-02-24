var base = {
    locationsCont: '.locations-container',
    locFilterUrl: '/filter/location',

    init: function() {

    },

    clickBindings: function() {
        var _this = this;

        $(this.locationsCont).on('click', 'span', function() {
            var locQuery = $(this).text();
            $.get(_this.locFilterUrl, {location: locQuery}, function(resp) {

            });
        });
    }
};

$(document).ready(function() {
    base.init();
});
