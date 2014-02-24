var base = {
    locationsCont: '.locations-container',
    statesCont: '.states-header',
    locFilterUrl: '/filter/location',
    stateFilterUrl: '/filter/state',

    /*
    filter the results of the page
     @param filterUrl - the url to make the GET request to
     @param filterVal - the value to use for filtering
     @return jQuery deferred containing filter result
    */
    _filterResults: function(filterUrl, filterVal) {
        return $.get(filterUrl, {q: filterVal.trim()});
    },

    init: function() {
        this.clickBindings();
    },

    clickBindings: function() {
        var _this = this;

        /**-- Locations bar click bindings --**/
        $(this.locationsCont).on('click', 'span:not(.show-all)', function() {
            var locQuery = $(this).text();
            var filterResult = _this._filterResults(_this.locFilterUrl, locQuery);
            filterResult.done(function(resp) {
                $(_this.locationsCont).html(resp);
            });
        });
        $(this.locationsCont).on('click', '.show-all', function() {
            $('.extra-loc').toggle();
            $(this).text() === '<<' ? $(this).text('>>') : $(this).text('<<');
        });

        /**-- State bar click bindings --**/
        $(this.statesCont).on('click', '.state-btn', function() {
            var stateQuery = $(this).text();
            var filterResult = _this._filterResults(_this.stateFilterUrl, stateQuery);
            filterResult.done(function(resp) {
                $(_this.statesCont).html(resp);
            });
        })
    }
};

$(document).ready(function() {
    base.init();
});
