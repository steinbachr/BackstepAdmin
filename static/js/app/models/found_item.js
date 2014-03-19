var FoundItem = Backbone.Model.extend({
    url: function() {
        if (this.isNew()) {
            return this.collection.baseUrl;
        }
        return this.collection.baseUrl + "/" + this.id + "/";
    }
});

var FoundItemCollection = Backbone.Collection.extend({
    model: FoundItem,
    baseUrl: "http://www.back-step.com/api/found",

    initialize: function(models, args) {
        this.url = function() {
            return this.baseUrl + '?' + $.param(args);
        };
    }
});

