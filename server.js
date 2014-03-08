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
            console.log("fetched companies were " + JSON.stringify(companies));

            /* add a key for 'sourcing attempts' for each company in the response */
            companies = companies.map(function(company) {
                company['sourcing_attempts'] = item.sourcing_attempts.filter(function(attempt) {
                    return attempt.company === company.id;
                });

                return company;
            });

            res.send(subRenderer.render('item_details.html', {
                item: item,
                messages: item.item_messages,
                companies: companies
            }));
        });
    });
});

app.get('/items/:id/nearby-found/', function(req, res){
    var id = req.params.id;

    rest.get(api.items+id+"/nearby_found_items/", {}).on('complete', function(nearby, response) {
        console.log("fetched items were " + nearby);
        res.send(JSON.stringify(nearby));
    });
});

app.post('/items/:id/status/', function(req, res) {
    var id = req.params.id,
        newStatus = req.body.status,
        oldStatus = req.body.oldStatus;

    /* when an item in new messages is marked for removal, this method is called which issues a put request to mark the item as seen */
    rest.putJson(api.items+id+"/", {
        status: newStatus
    }).on('complete', function(data, response) {
            console.log("now sending email to user");
            /* once we get a response, send the user an email telling them about the item update */
            rest.post(api.items+id+api.actions.sendItemEmail('item_status_change', 'You Have A New Status Update for Your Lost Item!'), {});
    });

    res.send();
});

app.post('/items/:id/sourcing-attempt/', function(req, res) {
    var id = req.params.id,
        result = req.body.result,
        companyId = req.body.companyId,
        success = result === 'success';

    var postParams = (function(result) {
        var params = {
            company: companyId,
            item: id
        };

        if (result) {
            params['success'] = success ? 'True' : 'False';
        }

        return params;
    }(result));

    /* when an item in new messages is marked for removal, this method is called which issues a put request to mark the item as seen */
    rest.postJson(api.attempts, postParams).on('complete', function(data, response) {
            console.log("created new sourcing attempt "+JSON.stringify(data));
            /* if the result was a success, then update the items status to 'match found' and email the user telling them so */
            if (success) {
                rest.putJson(api.items+id+"/", { status: 2 }).on('complete', function(item, resp) {
                    console.log('item status updated');
                    rest.post(api.items+id+api.actions.sendItemEmail('potential_match_found', 'Potential Match Found'), {});
                    res.send();
                });
            } else {
                res.send();
            }
    });
});

app.post('/items/:id/action-required/', function(req, res) {
    var id = req.params.id,
        message = req.body.message;

    rest.putJson(api.items+id+"/", {
        action_required: 'True',
        action_required_message: message
    }).on('complete', function(data, response) {
        console.log("set action required");
        rest.post(api.items+id+api.actions.sendItemEmail('action_required', 'Action Required For Your Lost Item'), {});
        res.send();
    });
});