var express = require('express'),
    cons = require('consolidate'),
    subRenderer = require('./renderer.js');
var app = express();

/*****-----< App Configurations >-----*****/
app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use('/static', express.static('static'));
app.listen(3000);





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
}





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