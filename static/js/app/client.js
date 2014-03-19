client = {
    init: function() {
        window.lostItems = new LostItemCollection;
        window.cities = new CityCollection;
        window.statuses = new LostItemStatusCollection;
        window.attempts = new LostItemAttemptCollection;

        var attemptsDeferred = window.attempts.fetch();

        var itemTplDeferred = utils.fetchTemplate('item.html'),
            statusTplDeferred = utils.fetchTemplate('item_status.html'),
            cityTplDeferred = utils.fetchTemplate('city.html');

        /* once we've gotten all the templates we can continue */
        $.when(itemTplDeferred, statusTplDeferred, cityTplDeferred).then(function(data, resp) {
            var itemTpl = $.parseJSON(itemTplDeferred.responseText).template,
                statusTpl = $.parseJSON(statusTplDeferred.responseText).template,
                cityTpl = $.parseJSON(cityTplDeferred.responseText).template;

            window.lostItems.fetch({
                success: function(collection, response, options) {
                    _.each(collection.models, function(model) {
                        var view = new LostItemsView({
                            model: model,
                            template: itemTpl
                        }).render();

                        view.$container.append(view.$el);

                        /* get items close to the current item that have been found */
                        var nearbyFoundItems = new FoundItemCollection([], {
                            type: model.attributes.type,
                            color: model.attributes.color,
                            city: model.attributes.city.name,
                            is_matched: 'False'
                        });
                        nearbyFoundItems.fetch({
                            success: function(collection, response, options) {
                               model.set({ foundItems: collection });
                            }
                        });

                        /* get sourcing attempts for the current item */
                        $.when(attemptsDeferred).then(function() {
                            var itemAttempts = window.attempts.where({lost_item: model.attributes.id});
                            itemAttempts.forEach(function(attempt) {
                                var view = new AttemptView({
                                    model: attempt
                                });
                                attempt.set({'view': view})
                            });

                            model.set({
                                sourcingAttempts: itemAttempts
                            });
                        });
                    });

                    /* create the nav bar for filtering items by their location */
                    var cityCounts = collection.countBy(function(item) {
                        return item.attributes.city.name;
                    });
                    _.each(_.keys(cityCounts), function(cityName) {
                        var city = new City({name: cityName, count:cityCounts[cityName]});
                        var view = new CityView({
                            model: city,
                            template: cityTpl
                        }).render();

                        view.$container.append(view.$el);
                        window.cities.add(city);
                    });

                    /* create the nav bar for filtering items by their status */
                    var statuses = [];
                    _.each(LostItemStatus.statuses, function(status) {
                        statuses.push({
                            key: status.key,
                            name: status.name,
                            count: collection.filter(function(item) {
                                return item.attributes.status === status.key;
                            }).length
                        })
                    });
                    _.each(statuses, function(stat) {
                        var itemStatus = new LostItemStatus({
                            key: stat.key,
                            name: stat.name,
                            count: stat.count
                        });
                        var view = new ItemStatusView({
                            model: itemStatus,
                            template: statusTpl
                        }).render();

                        view.$container.append(view.$el);
                        window.statuses.add(itemStatus);
                    });
                }
            });
        });
    }
};

$(document).ready(function() {
    client.init();

    $('.overlay').on('click', function() {
        $(this).hide();
        $(".popup").fadeOut();
    })
});