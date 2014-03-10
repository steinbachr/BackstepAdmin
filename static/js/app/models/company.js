var Company = Backbone.Model.extend({});

var CompanyCollection = Backbone.Collection.extend({
    model: Company,
    baseUrl: "http://www.back-step.com/api/companies/",

    initialize: function(models, args) {
        this.url = function() {
            return this.baseUrl + '?city=' + args.city;
        };
    }
});