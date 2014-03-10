var LostItem = Backbone.Model.extend({
    defaults: {
        visible: true
    },
    url: function() {
        if (this.isNew()) {
            return this.collection.url;
        }
        return this.collection.url + "/" + this.id + "/";
    },

    initialize: function() {
        this.set({
            nearbyCompanies: new CompanyCollection([], {city: this.city}),
            nearbyItems: []
        });
    },

    getDetails: function() {
        return this.attributes.nearbyCompanies.fetch();
    },

    sendEmail: function(subj, message) {
        this.collection.url('item_status_change')
    }
});

var LostItemCollection = Backbone.Collection.extend({
    model: LostItem,
    url: "http://www.back-step.com/api/items",
    filters: {
        city: undefined,
        status: undefined
    },

    getById: function(id) {
        return this.findWhere({id: id});
    },

    filterResults: function() {
        var _this = this;
        _.each(this.models, function(m) {
            if (_this.filters.city !== undefined) {
                m.attributes.city.name === _this.filters.city ? m.set({visible: true}) : m.set({visible: false});
                _this.filters.status && m.attributes.status !== _this.filters.status && m.set({visible: false});
            }
            else if (_this.filters.status !== undefined) {
                m.attributes.status === _this.filters.status ? m.set({visible: true}) : m.set({visible: false});
            }
        });
    }
});