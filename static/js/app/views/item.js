var LostItemsView = Backbone.View.extend({
    initialize: function(options) {
        this.$container = $('.results-body');
        this.template = _.template(options.template);

        var _this = this;
        this.model.on('change:visible', function() {
            _this.visibility();
        });
    },

    render:  function() {
        this.$el = $(this.template(this.model.attributes));
        this.$container.append(this.$el);
        return this;
    },

    visibility: function() {
        this.model.attributes.visible ? this.$el.show() : this.$el.hide();
    }
});