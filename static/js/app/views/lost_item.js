var LostItemsView = Backbone.View.extend({
    className: "result",
    tagName: "div",

    initialize: function(options) {
        this.$container = $('.results-body');
        this.template = _.template(options.template);

        var _this = this;
        this.model.on('change:visible', function() {
            _this.visibility();
        });
        this.model.on('change', function() {
            _this.render();
        });
        this.model.on('newSourcingAttempt', function() {
            _this.render();
        });

        this.$el.data('id', this.model.attributes.id);
        this.$el.draggable({
            appendTo: 'body',
            helper: "clone"
        });

        this.model.filedInPastDay() && this.$el.addClass("recent");
    },

    events: {
        click: 'itemDetails'
    },

    itemDetails: function() {
        var tplDeferred = utils.fetchTemplate('item_details.html');
        var _this = this;
        $.when(tplDeferred).then(function(data, resp) {
            new LostItemDetailsView({
                model: _this.model,
                template: $.parseJSON(tplDeferred.responseText).template
            });
        });

        this.$el.siblings().removeClass('selected');
        this.$el.addClass('selected');
    },

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },

    visibility: function() {
        this.model.attributes.visible ? this.$el.show() : this.$el.hide();
    }
});

var LostItemDetailsView = Backbone.View.extend({
    initialize: function(options) {
        this.template = _.template(options.template);
        this.$el = $('.popup');
        this.$overlay = $('.overlay');

        this.render();
        this.model.getAdditionalDetails(this.$el.find('.nearby-items tbody'));
    },

    events: {
        'click h3': 'expandSection',
        'click .action-btn': 'actionRequired'
    },

    hide: function() {
        this.$el.fadeOut();
        this.$overlay.hide();
    },

    expandSection: function(e) {
        $(e.target).next().slideDown();
    },

    actionRequired: function(e) {
        var actionMessage = $(e.target).prev('input').val();
        this.model.save({
            action_required: 'True',
            action_required_message: actionMessage
        }, {patch: true});
        this.hide();
    },

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        this.$el.fadeIn();
        this.$overlay.show();
    }
});