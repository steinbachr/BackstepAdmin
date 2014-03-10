var AttemptView = Backbone.View.extend({
    events: {
        'click .action-btn': 'createAttempt'
    },

    render:  function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});