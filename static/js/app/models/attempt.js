var LostItemAttempt = Backbone.Model.extend({
    render: function() {
        return this.attributes.view.render();
    }
});

var LostItemAttemptCollection = Backbone.Collection.extend({
    model: LostItemAttempt,
    url: "http://www.back-step.com/api/attempts/"
});