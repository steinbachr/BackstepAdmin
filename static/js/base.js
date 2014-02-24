var base = {
    locationsCont: '.locations-container',
    statesCont: '.states-header',
    messagesCont: '.messages-container ul',
    messageTpl: "<li><span class='iconic bolt'></span>" +
        "A <%= color %> <%= type %> lost. Identifying Characteristics: <%= identifying_characteristics %>" +
        "<span class='iconic x'></span></li>",

    baseUrl: 'http://backstep-admin.herokuapp.com',
    locFilterUrl: '/filter/location',
    stateFilterUrl: '/filter/state',

    socket: mySocket.init(this.baseUrl),

    /*
    filter the results of the page
     @param filterUrl - the url to make the GET request to
     @param filterVal - the value to use for filtering
     @return jQuery deferred containing filter result
    */
    _filterResults: function(filterUrl, filterVal) {
        return $.get(filterUrl, {q: filterVal.trim()});
    },

    /*
    check if we have any new messages on the server
     */
    _pollServer: function() {
        this.socket.sendMessage('newItemsRequest', {});
    },

    /*
    setup the socket bindings (for responses)
     */
    _socketResponseBinding: function() {
        var _this = this;

        this.socket.bindMessage('newItemsResponse', function(resp) {
            var allCompiled = '',
                items = $.parseJSON(resp.items);

            _.each(items, function(item) {
                var tpl = _.template(_this.messageTpl),
                    compiled = tpl(item);

                allCompiled += compiled;
            });

            $(_this.messagesCont).append(allCompiled);
        });
    },

    init: function() {
        var _this = this;
        this.clickBindings();

        /* websocket bindings */
        (function pollServer() {
            setTimeout(function() { _this._pollServer.apply(_this, []); pollServer(); }, 10000);
        }());
        this._socketResponseBinding();
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
        });

        /**-- Messages click bindings --**/
        $(this.messagesCont).on('click', '.x', function() {
            $(this).closest('li').fadeOut();
        })
    }
};

$(document).ready(function() {
    base.init();
});
