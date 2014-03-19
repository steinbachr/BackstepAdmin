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

        this.on("change:status", function() {
            if (this.attributes.status === 2) {
                this.sendEmail("potential_match_found", "A potential match has been found for your lost item!");
            } else {
                this.sendEmail("item_status_change", "Your Item's Status Has Changed!");
            }
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

    /*
    check if the filed_datetime of this item is within the last day.
    @return true if so, false otherwise
     */
    filedInPastDay: function() {
        var filedDate = Date.parse(this.attributes.filed_datetime),
            today = Date.now();
        var elapsedTime = today - filedDate; // returns diff in milliseconds

       return (elapsedTime / (1000 * 60 * 60)) <= 24;
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