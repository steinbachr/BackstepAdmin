var base = {
    counterCont: '.counter',
    refreshCont: '.refresh',
    locationsCont: '.locations-container',
    statesCont: '.states-header',
    resultsCont: '.results',
    popupCont: '.popup',
    overlayCont: '.overlay',
    messagesCont: '.messages-container ul',

    messageTpl: "<li data-id='<%= id %>'><span class='iconic bolt'></span>" +
        "A <%= color %> <%= type %> lost. Identifying Characteristics: <%= identifying_characteristics %>" +
        "<span class='iconic x'></span></li>",

    addedFilters: {
        status: undefined,
        city: undefined
    },

    openedItemId: null,

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
    setup draggable / droppable bindings
     */
    _dragDropBinding: function() {
        var _this = this;

        $(this.resultsCont).find('.result').draggable({
            appendTo: 'body',
            helper: "clone"
        });

        $(this.statesCont).find('a').each(function() {
            $(this).droppable({
                hoverClass: "selected",
                tolerance: "pointer",
                drop: function(event, ui) {
                    var $item = ui.draggable,
                        $statusTarget = $(event.target),
                        statusKey = $statusTarget.data('key');

                    /* persist the change */
                    $.post(urls.items + $item.data('id') + "/status/", {
                        status: statusKey,
                        oldStatus: $item.data('status')
                    });

                    /* show the change on the frontend */
                    var oldCount = parseInt($statusTarget.find('.count').text());
                    $statusTarget.find('.count').text(oldCount + 1);
                    $item.attr('data-status', statusKey);
                    _this._filterResults(undefined);

                }
            });
        });
    },

    init: function() {
        this.clickBindings();
        this._dragDropBinding();

        this.addedFilters.status = 0;
        this._filterResults(undefined);
    },

    clickBindings: function() {
        var _this = this;

        $(this.refreshCont).on('click', function() {
            location.reload();
        });

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

        /**-- Results Click Bindings --**/
        $(this.resultsCont).on('click', 'div.result', function() {
            var resultId = $(this).data('id'),
                $details = $(_this.popupCont),
                $overlay = $(_this.overlayCont);
            _this.openedItemId = resultId;

            $overlay.show();
            $.get(urls.items + resultId + "/").success(function(rendered) {
                $details.html(rendered);
                $details.fadeIn();
            });

            $(this).siblings().removeClass('selected');
            $(this).addClass('selected');
        });

        $(this.overlayCont).on('click', function(evt) {
            $(_this.popupCont).fadeOut();
            $(this).hide();
        });

        $(document).on('click', '.nearby-items-header', function() {
            var deferred = $.get(urls.items+_this.openedItemId+"/nearby-found/", {}),
                $_this = $(this);

            $(this).next().slideToggle();
            deferred.success(function(data) {
                var items = $.parseJSON(data);
                var itemTpl = _.template("<tr><td><a href='http://www.back-step.com<%= finder.profile_url %>' target='_blank'><%= finder.name %></a></td><td><%= color %></td><td><%= type %></td><td><%= identifying_characteristics %></td></tr>");
                var compiled = "";
                _.each(items, function(item) {
                    compiled += itemTpl(item);
                });

                $_this.next().find('tbody').html(compiled);
            });
        })
    }
};

$(document).ready(function() {
    base.init();
});
