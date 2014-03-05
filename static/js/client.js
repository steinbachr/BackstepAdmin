var base = {
    counterCont: '.counter',
    locationsCont: '.locations-container',
    statesCont: '.states-header',
    resultsCont: '.results',
    popupCont: '.popup',
    messagesCont: '.messages-container ul',

    messageTpl: "<li data-id='<%= id %>'><span class='iconic bolt'></span>" +
        "A <%= color %> <%= type %> lost. Identifying Characteristics: <%= identifying_characteristics %>" +
        "<span class='iconic x'></span></li>",
    socket: mySocket.init(urls.baseUrl),

    addedFilters: {
        status: undefined,
        city: undefined
    },

    /*
    filter the results of the page
    @param $btn - the button that was clicked for the filter
    */
    _filterResults: function($btn) {
        $(this.resultsCont).find('.result').hide();

        var $results = $(this.resultsCont).find(".result");
        for (var filt in this.addedFilters) {
            $results = this.addedFilters[filt] !== undefined ? $results.filter(".result[data-"+filt+"='"+this.addedFilters[filt]+"']") : $results;
        }
        $results.show();

        if ($btn) {
            $btn.siblings().removeClass('selected');
            $btn.addClass('selected');
        }
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

//        var prevCount = parseInt($(_this.counterCont).find('.total-items').text());
//        $(_this.counterCont).find('.total-items').text(prevCount + items.length);
        $(_this.messagesCont).html(allCompiled);
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
        this.clickBindings();
        /* websocket bindings */
        this._socketBinding();

        this.addedFilters.status = 0;
        this._filterResults(undefined);
    },

    clickBindings: function() {
        var _this = this;

        /**-- Locations bar click bindings --**/
        $(this.locationsCont).on('click', '.purple-link', function() {
            _this.addedFilters.city = $(this).find('.city-name').text();
            _this._filterResults($(this));
        });
        $(this.locationsCont).on('click', '.remove-filter', function() {
            _this.addedFilters.city = undefined;
            _this._filterResults($(this));
        });


        /**-- State bar click bindings --**/
        $(this.statesCont).on('click', '.state-btn', function() {
            _this.addedFilters.status = $(this).data('key');
            _this._filterResults($(this));
        });

        /**-- Messages click bindings --**/
        $(this.messagesCont).on('click', '.x', function() {
            var $message = $(this).closest('li'),
                itemId = $message.data('id');
            $.post(urls.items+itemId+"/seen/");
            $message.fadeOut();
        });

        /**-- Results Click Bindings --**/
        $(this.resultsCont).on('click', 'div', function() {
            var resultId = $(this).data('id'),
                $details = $(_this.popupCont);

            $('body').css('overflow', 'hidden');
            $.get(urls.items + resultId + "/").success(function(rendered) {
                $details.html(rendered);

                $(document).on('click', function(evt) {
                    if ($(evt.target).closest('.popup').length < 1 && $details.is(':visible')) {
                        $details.fadeOut();
                        $('body').css('overflow', 'scroll');
                    }

                });

                $details.fadeIn();
            });

            $(this).siblings().removeClass('selected');
            $(this).addClass('selected');
        });
    }
};

$(document).ready(function() {
    base.init();
});
