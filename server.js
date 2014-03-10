var express = require('express'),
    cons = require('consolidate'),
    _ = require('underscore'),
    rest = require('restler'),
    url = require('url'),
    subRenderer = require('./renderer.js'),
    api = require('./api_urls.js');
    constants = require('./constants.js');

/* create the server and its connections */
var app = express(),
    http = require('http'),
    server = http.createServer(app);





/*****-----< App Configurations >-----*****/
app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use('/static', express.static('static'));
app.use(express.json());
app.use(express.bodyParser());
server.listen(process.env.PORT || 3000);
app.use(express.basicAuth('steinbachr', 'leonhall'));



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




/*****-----< Routes >-----*****/
app.get('/', function(req, res){
    rest.get(api.items, {}).on('complete', function(data, response) {
        /* make sure we're not showing items that have a finder, these items should only appear when we're trying to source an item */
        data = data.filter(function(el) {
            return el.finder === null;
        });

        /* bucket the items in the response by their status and get the counts for each bucket */
        var statusCounts = constants.statuses.map(function(status) {
            return data.filter(function(item) {
                return item.status === status.key
            }).length;
        });

        res.render('page', {
            title: 'Admin Home',
            itemsCount: data.length,
            completionStates: renderCompletionStates('Reported', statusCounts)
        });
    });
});

app.get('/fetch-template/', function(req, res) {
    var urlParts = url.parse(req.url, true);
    var tpl = urlParts.query.template;

    res.send(JSON.stringify({
        template: subRenderer.fetch(tpl)
    }));
});