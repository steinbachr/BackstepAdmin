var express = require('express'),
    cons = require('consolidate'),
    _ = require('underscore'),
    rest = require('restler');
    subRenderer = require('./renderer.js'),
    api = require('./api_urls.js');
    constants = require('./constants.js');

/* create the server and its connections */
var app = express(),
    http = require('http'),
    server = http.createServer(app),
    socket = require('socket.io').listen(server);





/*****-----< App Configurations >-----*****/
app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use('/static', express.static('static'));
server.listen(process.env.PORT || 3000);





/*****-----< View Helpers >-----*****/
/*
this helper function is for rendering the locations header as appropriate
@param locName - the selected location name
@param locations - array of objects with keys of city names and values of the number of items in that city
@return rendered string of the locations header
*/
var renderLocation = function(locName, locations) {
    return subRenderer.render('locations_header.html', {
        defaultShow: 3,
        fullExpand: false,
        locs: locations
    });
};

/*
like renderLocation, but for completion state
@param selectedStatus - the selected completion status (name)
@param statusCounts - an array which matches up one-to-one with constants.statuses and contains the num of items for each status
@return the rendered completion_states.html file
 */
var renderCompletionStates = function(selectedStatus, statusCounts) {
    return subRenderer.render('completion_states.html', {
        selectedStatus: {
            name: selectedStatus
        },
        statuses: constants.statuses,
        counts: statusCounts
    });
};

/*
render the results of a filter operation
@param results - the results to render
 */
var renderResults = function(results) {
    return subRenderer.render('results.html', {
        results: results
    });
};




/*****-----< Routes >-----*****/
app.get('/', function(req, res){
    rest.get(api.items, {}).on('complete', function(data, response) {
        console.log("got " + data.length + " items");

        /* bucket the items in the response by their status and get the counts for each bucket */
        var statusCounts = constants.statuses.map(function(status) {
            return data.filter(function(item) {
                return item.status === status.key
            }).length;
        });

        /* bucket the items in the response by their location and construct a mapping of location names to the num of items in that location */
        var locations = {};
        data.map(function(item) {
            var cityItemCount = locations[item.city];
            locations[item.city] = cityItemCount ? cityItemCount + 1 : 1;
        });

        res.render('page', {
            title: 'Admin Home',
            itemsCount: data.length,
            locations: renderLocation('Las Vegas', locations),
            completionStates: renderCompletionStates('Reported', statusCounts),
            results: renderResults(data)
        });
    });
});

app.get('/items/:id/', function(req, res){
    var id = req.params.id;
    rest.get(api.items + id + "/", {}).on('complete', function(item, response) {
        var city = encodeURIComponent(item.city);

        /* now get all companies near the item's city */
        var filterObj = {};
        filterObj[api.filters.companies.city] = city;
        rest.get(api.includeFilters(api.companies, filterObj), {}).on('complete', function(companies, response) {
            console.log("fetched companies were " + companies);
            res.send(subRenderer.render('item_details.html', {
                item: item,
                messages: item.item_messages,
                companies: companies
            }));
        });
    });
});

app.post('/items/:id/seen/', function(req, res) {
    var id = req.params.id;
    console.log('issuing put request for admin seen');
    /* when an item in new messages is marked for removal, this method is called which issues a put request to mark the item as seen */
    rest.putJson(api.items+id+"/", {
        admin_seen: 1
    });

    res.send();
});



/*****-----< Socket.io >-----*****/
(function() {
    /* this function checks our remote BackStep api for any new items and emits the event through the given socket */
    var pollApi = function(client) {
        var filterObj = {};
        filterObj[api.filters.items.adminSeen] = 'False';

        rest.get(api.includeFilters(api.items, filterObj), {}).on('complete', function (data, response) {
            console.log("data is "+data);

            client.emit('newItems', {
                items: JSON.stringify(data)
            });


            /* only after we've received a response, should we try and poll again */
            startPolling(client);
        });
    };

    var startPolling = function(client) {
        setTimeout(function() {
	        pollApi(client);
        }, 10000);
    };

    socket.on('connection', function(client) {
        pollApi(client);
    });
}());
