var express = require('express'),
    cons = require('consolidate'),
    _ = require('underscore'),
    request = require('request');
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    subRenderer = require('./renderer.js'),
    api = require('./api_urls.js');

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
@param stateName - the selected completion state (name)
@return the rendered completion_states.html file
 */
var renderCompletionStates = function(stateName) {
    return subRenderer.render('completion_states.html', {
        selectedState: {
            name: stateName
        },
        states: [
            {
                name: 'Reported'
            },
            {
                name: 'Sourcing'
            },
            {
                name: 'Match Found'
            },
            {
                name: 'Match Approved'
            },
            {
                name: 'Delivered'
            },
            {
                name: 'Refund Almost Required'
            },
            {
                name: 'Refund Required'
            }
        ]
    });
};





/*****-----< Routes >-----*****/
app.get('/', function(req, res){
    res.render('page', {
        title: 'Admin Home',
        locations: renderLocation('Las Vegas'),
        completionStates: renderCompletionStates('Reported'),
        results: subRenderer.render('results.html', {
            results: []
        })
    });
});

app.get('/filter/location', function(req, res) {
    var locQuery = req.param('q');
    res.send(renderLocation(locQuery));
});

app.get('/filter/state', function(req, res) {
    var stateQuery = req.param('q');
    res.send(renderCompletionStates(stateQuery));
});




/*****-----< Socket.io >-----*****/
(function() {
    /* this function checks our remote BackStep api for any new items and emits the event through the given socket */
    var pollApi = function(socket) {
        request(api.items, function (error, response, items) {
            console.log(items);
            socket.emit('newItems', {
                items: items
            });

            /* for each item, make a PUT request to the api to update its admin_seen field */
//            items = JSON.parse(items);
//            _.each(items, function(item) {
//                request.put(api.items+item.id+"/admin_seen/", {
//                    admin_seen: 1
//                });
//            });
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
