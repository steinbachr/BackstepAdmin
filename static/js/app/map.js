gMap = {
    init: function($container) {
        /* start at a high level, u.s. map */
        var mapOptions = {
            center: new google.maps.LatLng(40.397, -100.644),
            zoom: 4
        };

        this.gMap = new google.maps.Map($container.get(0), mapOptions);
        this.geocoder = new google.maps.Geocoder();
        this.lostItems = [];
    },

    _geocode: function(addr, onGeocode) {
        this.geocoder.geocode({
            address: addr
        }, function(results, status) {
            onGeocode(results[0].geometry.location);
        });
    },

    /* create markers on the map for each of the lostItems */
    createMapMarkers: function() {
        var _this = this;

        _.each(this.lostItems, function(item) {
            var city = item.city;

            this._geocode(city, function(latLng) {
                var marker = new google.maps.Marker({
                    position: latLng,
                    title:"Hello World!"
                });

                marker.setMap(_this.gMap);
            });
        });

        this.gMap.setCenter(this.lostItems[0].city);
    }
};