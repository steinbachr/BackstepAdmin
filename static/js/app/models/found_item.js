var FoundItem = Backbone.Model.extend({});

var FoundItemCollection = Backbone.Collection.extend({
    model: FoundItem,
    baseUrl: "http://www.back-step.com/api/found",

    initialize: function(models, args) {
        this.url = function() {
            return this.baseUrl + '?' + $.param(args);
        };
    }
});

