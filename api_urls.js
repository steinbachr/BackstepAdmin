module.exports = {
    items: "http://www.back-step.com/api/items/",

    availableFilters: {
        unseenItems: "unseen"
    },
    includeFilter: function(endpoint, filterName) {
        /* insert a ? if not already inserted */
        if (endpoint.indexOf('?') < 0) {
            endpoint += "?";
        }

        endpoint += filterName + "=1&";
        return endpoint;
    }
}