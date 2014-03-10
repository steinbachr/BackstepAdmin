var LostItem = Backbone.Model.extend({
    defaults: {
        visible: false
    }
});

var LostItemCollection = Backbone.Collection.extend({
    model: LostItem,
    url: "http://www.back-step.com/api/items/",
    filters: {
        city: undefined,
        status: undefined
    },

    filterResults: function() {
        var _this = this;
        _.each(this.models, function(m) {
            if (_this.filters.city !== undefined) {
                m.attributes.city === _this.filters.city ? m.set({visible: true}) : m.set({visible: false});
                _this.filters.status && m.attributes.status !== _this.filters.status && m.set({visible: false});
            }
            else if (_this.filters.status !== undefined) {
                m.attributes.status === _this.filters.status ? m.set({visible: true}) : m.set({visible: false});
            }
        });
    }
});