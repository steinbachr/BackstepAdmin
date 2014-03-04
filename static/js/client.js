var base = {
    counterCont: '.counter',
    locationsCont: '.locations-container',
    statesCont: '.states-header',
    resultsCont: '.results',
    messagesCont: '.messages-container ul',
    messageTpl: "<li><span class='iconic bolt'></span>" +
        "A <%= color %> <%= type %> lost. Identifying Characteristics: <%= identifying_characteristics %>" +
        "<span class='iconic x'></span></li>",

    baseUrl: 'http://backstep-admin.herokuapp.com',
    socket: mySocket.init(this.baseUrl),

    /*
    filter the results of the page
     @param filterVal - the value to use for filtering
    */
    _filterResults: function(filterVal) {
        $(this.resultsCont).children().hide();
        $(this.resultsCont).find("div[data-status='"+filterVal+"']").show();
    },

    /*
    setup the socket bindings (for responses)
     */
    _socketResponseBinding: function(resp) {
        var _this = this;
        var allCompiled = '',
            items = $.parseJSON(resp.items);

        _.each(items, function(item) {
            var tpl = _.template(_this.messageTpl),
                compiled = tpl(item);

            allCompiled += compiled;
        });

        var prevCount = parseInt($(_this.counterCont).find('.total-items').text());
        $(_this.counterCont).find('.total-items').text(prevCount + items.length);
        $(_this.messagesCont).append(allCompiled);
    },

    /*
    bind to the emitting sockets from the server
     */
    _socketBinding: function() {
        var _this = this;
        this.socket.bindMessage('newItems', function(resp) {
            _this._socketResponseBinding.call(_this, resp);
        });
    },

    init: function() {
        var _this = this;
        this.clickBindings();

        /* websocket bindings */
        this._socketBinding();
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
            var statusQuery = $(this).data('key');
            _this._filterResults(statusQuery);

            $(this).siblings().removeClass('selected');
            $(this).addClass('selected');
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
