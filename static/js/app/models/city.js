var City = Backbone.Model.extend({});

var CityCollection = Backbone.Collection.extend({
    model: City,
    url: "http://www.back-step.com/api/cities/"
})