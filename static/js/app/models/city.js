var City = Backbone.Model.extend({
    defaults: {
        selected: false
    }
});

var CityCollection = Backbone.Collection.extend({
    model: City,
    url: "http://www.back-step.com/api/cities/"
})