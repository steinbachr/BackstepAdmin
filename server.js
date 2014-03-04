var express = require('express'),
    cons = require('consolidate'),
    _ = require('underscore'),
    rest = require('restler');
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    subRenderer = require('./renderer.js'),
    api = require('./api_urls.js');
    constants = require('./constants.js');

/* create the server and its connections */
var app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);





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
@return rendered string of the locations header
*/
var renderLocation = function(locName) {
    return subRenderer.render('locations_header.html', {
        defaultShow: 2,
        fullExpand: false,
        selectedLocation: {
            name: locName
        },
        locs: [
            {
                name: 'Las Vegas'
            },
            {
                name: 'New York'
            },
            {
                name: 'New Vegas'
            }
        ]
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
        console.log("getting all items");

        /* bucket the items in the response by their status and get the counts for each bucket */
        var statusCounts = constants.statuses.map(function(status) {
            return data.filter(function(item) {
                return item.status === status.key
            }).length;
        });

        res.render('page', {
            title: 'Admin Home',
            locations: renderLocation('Las Vegas'),
            completionStates: renderCompletionStates('Reported', statusCounts),
            results: renderResults(data)
        });
    });
});




/*****-----< Socket.io >-----*****/
(function() {
    /* this function checks our remote BackStep api for any new items and emits the event through the given socket */
    var pollApi = function(socket) {
        rest.get(api.includeFilter(api.items, api.availableFilters.unseenItems, undefined), {}).on('complete', function (data, response) {
            console.log("data is "+data);
            socket.emit('newItems', {
                items: JSON.stringify(data)
            });

            /* for each item, make a PUT request to the api to update its admin_seen field */
            _.each(data, function(item) {
                rest.putJson(api.items+item.id+"/", {
                    admin_seen: 1
                });
            });
        });
    };

    /* borrowed from http://stackoverflow.com/questions/16500514/node-js-recursive-settimeout-inside-of-a-psuedoclass */
    var Ticker = function(time) {
        var self = this;
        this.time = time;
        setInterval(function() {
            self.emit('tick');
        }, self.time);
    };
    util.inherits(Ticker, EventEmitter);
    var ticker = new Ticker(4000);

    /* whenever a new 'tick' occurs, poll the api and emit the socket event */
    io.sockets.on('connection', function (socket) {
        ticker.on('tick', function() {
            pollApi(socket);
        })
    });
}());
