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
        'click .purple-link': 'filterResults'
    },

    filterResults: function() {
        window.lostItems.filters.city = this.model.attributes.name;
        window.lostItems.filterResults();
        
        var previouslySelected = window.cities.findWhere({selected: true})
        previouslySelected && previouslySelected.set({selected: false});

        this.model.set({selected: true});
    },

    render:  function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});