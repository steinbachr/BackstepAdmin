var AttemptView = Backbone.View.extend({
    template: _.template("<div class='res <% if (success) { %>success<% } else if (success === undefined || success === null) { %>unknown<% } else { %>failure<% } %>'></div>"),

    render:  function() {
        return this.template(this.model.attributes);
    }
});