module.exports = {
    items: "http://www.back-step.com/api/items/",
    companies: "http://www.back-step.com/api/companies/",

    filters: {
        items: {
            adminSeen: "admin_seen",
            status: "status",
            city: "city"
        },
        companies: {
            city: "city"
        }
    },

    actions: {
        sendItemEmail: (function() {
            var subject = encodeURIComponent("You Have A New Status Update for Your Lost Item!");
            return '/send_item_email/?email=item_status_change&' + subject;
        }())
    },


    /**
     *
     * @param endpoint - the base api endpoint to query
     * @param filters - object having keys of filter names and values of filter values
     * @returns the fully qualified url to query
     */
    includeFilters: function(endpoint, filters) {
        /* insert a ? if not already inserted */
        if (endpoint.indexOf('?') < 0) {
            endpoint += "?";
        }

        var queryString = Object.keys(filters).reduce(function(prev, cur) {
            return prev + cur + "=" + filters[cur] + "&";
        }, "");

        endpoint += queryString;
        console.log("getting url "+endpoint);

        return endpoint;
    }
}