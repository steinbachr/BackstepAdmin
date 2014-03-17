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
            nearbyCompanies: new CompanyCollection([], {city: this.attributes.city}),
            foundItems: new FoundItemCollection([], {
                type: this.attributes.type,
                color: this.attributes.color,
                city: this.attributes.city.name
            })
        });
    },

    getAdditionalDetails: function($foundContainer) {
        this.attributes.foundItems.fetch({
            success: function(collection, response, options) {
                collection.forEach(function(item) {
                    new FoundItemView({
                        model: item,
                        $container: $foundContainer
                    }).render();
                });
            }
        });
    },

    sendEmail: function(subj) {
        var baseUrl = this.url();
        $.post(baseUrl+"send_item_email/?email=item_status_change&email_subj="+encodeURIComponent(subj));
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
                _this.filters.status !== undefined && m.attributes.status !== _this.filters.status && m.set({visible: false});
            }
            else if (_this.filters.status !== undefined) {
                m.attributes.status === _this.filters.status ? m.set({visible: true}) : m.set({visible: false});
            }
        });
    }
});