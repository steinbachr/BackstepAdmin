var CityView = Backbone.View.extend({
    tagName: 'span',
    className: 'city',

    initialize: function(options) {
        this.$container = $('.locations-container nav');
        this.template = _.template(options.template);

        var _this = this;
        this.model.on('change', function(){
            _this.render();
        });
    },

    events: {
        'click': 'filterResults'
    },

    filterResults: function() {
        window.lostItems.filters.city = this.model.attributes.name;
        window.lostItems.filterResults();

        this.$el.siblings().removeClass('selected');
        this.$el.addClass('selected');
    },

    render:  function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});