module.exports = {
    items: "http://www.back-step.com/api/items/",
    companies: "http://www.back-step.com/api/companies/",
    attempts: "http://www.back-step.com/api/attempts/",

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
        sendItemEmail: function(emailTpl, emailSubj) {
            return '/send_item_email/?email='+emailTpl+'&email_subj=' + encodeURIComponent(emailSubj);
        }
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
    },

    /**
     * get the equivalent pythonic boolean value (True, False) for the given javascript value
     * @param jsVal
     */
    booleanForApi: function(jsVal) {
        return jsVal ? 'True' : 'False';
    }
};