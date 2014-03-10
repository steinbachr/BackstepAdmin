var ItemStatusView = Backbone.View.extend({
    initialize: function(options) {
        this.$container = $('.states-header nav');
        this.template = _.template(options.template);

        var _this = this;
        this.model.on('change', function() {
            _this.render();
        });

        this.$el.droppable({
            hoverClass: "selected",
            tolerance: "pointer",
            drop: function(event, ui) {
                var $item = ui.draggable,
                    statusKey = _this.model.attributes.key;

                /* persist the change */
                var itemModel = window.lostItems.getById($item.data('id'));
                var deferred = itemModel.save({status: statusKey}, {patch: true});

                _this.model.set({count: _this.model.attributes.count + 1});
            }
        });
    },

    events: {
        'click': 'filterResults'
    },

    filterResults: function() {
        window.lostItems.filters.status = this.model.attributes.key;
        window.lostItems.filterResults();

        this.$el.siblings().removeClass('selected');
        this.$el.addClass('selected');
    },

    render:  function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});