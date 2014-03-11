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
app.use(express.basicAuth('test', 'test'));




/*****-----< Routes >-----*****/
app.get('/', function(req, res){
    rest.get(api.items, {}).on('complete', function(data, response) {
        res.render('page', {
            title: 'Admin Home',
            itemsCount: data.length
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