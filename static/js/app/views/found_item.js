var FoundItemView = Backbone.View.extend({
    tplDeferred: utils.fetchTemplate("found_item.html"),

    initialize: function(options) {
        this.template = _.template($.parseJSON(this.tplDeferred.responseText).template);
        this.$container = options.$container;

        var _this = this;
        this.model.on('change', function() {
            _this.render();
        });
    },

    render: function() {
        this.$container.append(this.template(this.model.attributes));
        return this;
    }
});