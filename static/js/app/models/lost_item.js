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
            foundItems: [],
            sourcingAttempts: []
        });
    },

    /*
    get additional details about a lost item
    @param $foundContainer - the container to use for holding the FoundItems section
     */
    getAdditionalDetails: function($foundContainer) {
        var _this = this;

        this.attributes.foundItems.forEach(function(item) {
            item.set({
                sourcingAttempts: window.attempts.where({found_item: item.attributes.id, lost_item: _this.attributes.id})
            });

            new FoundItemView({
                model: item,
                el: $foundContainer,
                lostItem: _this
            }).render();
        });
    },

    sendEmail: function(tpl, subj) {
        var baseUrl = this.url();
        $.post(baseUrl+"send_item_email/?email="+tpl+"&email_subj="+encodeURIComponent(subj));
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