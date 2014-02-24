var base = {
    locationsCont: '.locations-container',
    statesCont: '.states-header',
    messagesCont: '.messages-container ul',

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
        this.socket.sendMessage('statusRequest', {});
    },

    /*
    setup the socket bindings (for responses)
     */
    _socketResponseBinding: function() {
        var _this = this;
        this.socket.bindMessage('statusResponse', function(status) {
            var tpl = _.template("<li><span class='iconic bolt'></span><%= content %></li>"),
                compiled = tpl(status);
            $(_this.messagesCont).append(compiled);
        });
    },

    init: function() {
        var _this = this;
        this.clickBindings();

        /* websocket bindings */
        /* simulation only */
        for (var i = 0, len = 5 ; i < len ; i++) {
            setTimeout(function() { _this._pollServer.apply(_this, []); }, _.random(i*1000, i*6000));
        }

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
        })
    }
};

$(document).ready(function() {
    base.init();
});
