var ItemStatusView = Backbone.View.extend({
    initialize: function(options) {
        this.$container = $('.states-header nav');
        this.template = _.template(options.template);

        var _this = this;
        this.model.on('change', function() {
            _this.render();
        });
    },

    events: {
        'click': 'filterResults'
    },

    filterResults: function() {
        window.lostItems.filters.status = this.model.attributes.key;
        window.lostItems.filterResults();

        var previouslySelected = window.statuses.findWhere({selected: true});
        previouslySelected && previouslySelected.set({selected: false});

        this.model.set({selected: true});
    },

    render:  function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});