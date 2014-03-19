var FoundItemView = Backbone.View.extend({
    tplDeferred: utils.fetchTemplate("found_item.html"),

    initialize: function(options) {
        this.template = _.template($.parseJSON(this.tplDeferred.responseText).template);
        this.currentLostItem = options.lostItem;

        var _this = this;
        this.model.on('change', function() {
            _this.render();
        });
    },

    events: {
        'click .sourcing-btn': 'createAttempt'
    },

    createAttempt: function(e) {
        var successVal = (function() {
            if ($(e.target).hasClass("success")) {
                return true;
            } else if ($(e.target).hasClass("failure")) {
                return false;
            } else {
                return undefined;
            }
        }());

        /* if the sourcing attempt was a success, then move the item into the match found stage and set is_matched=true
         * for the found item
        */
        if (successVal) {
            this.currentLostItem.save({status: 2}, {patch: true});
            this.model.save({is_matched: 'True'}, {patch: true});
        }

        var newAttempt = {
            lost_item: this.currentLostItem.attributes.id,
            found_item: this.model.attributes.id,
            success: successVal
        };

        var newAttemptObj = window.attempts.create(newAttempt);
        newAttemptObj.set({
            'view': new AttemptView({
                model: newAttemptObj
            })
        });

        this.model.attributes.sourcingAttempts.push(newAttemptObj);
        this.currentLostItem.attributes.sourcingAttempts.push(newAttemptObj);
        this.currentLostItem.trigger('newSourcingAttempt');

        this.render();
    },

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});