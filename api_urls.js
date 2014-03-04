module.exports = {
    items: "http://127.0.0.1:8000/api/items/",

    availableFilters: {
        unseenItems: "unseen",
        status: "status"
    },

    /**
     *
     * @param endpoint - the base api endpoint to query
     * @param filterName - the name of the filter
     * @param filterVal (optional) - if included, use this as the value of the filter. Else just use 1.
     * @returns the fully qualified url to query
     */
    includeFilter: function(endpoint, filterName, filterVal) {
        filterVal = filterVal !== undefined ? filterVal : 1;

        /* insert a ? if not already inserted */
        if (endpoint.indexOf('?') < 0) {
            endpoint += "?";
        }

        endpoint += filterName + "=" + filterVal + "&";
        console.log("getting url "+endpoint);

        return endpoint;
    }
}