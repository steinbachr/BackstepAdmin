/*
a helper file for rendering sub_views
 */
var fs = require("fs"),
    _ =  require("underscore");

module.exports = {
    /*
    this function fetches a template from the file system without rendering it
    @param tpl - name of the template to render
     */
    fetch: function(tpl) {
        var base = 'templates/';

        /* read the contents of the file synchronously */
        var html = fs.readFileSync(base+tpl, {
            encoding: 'utf-8'
        });

        return html;
    },

    /*
    the primary function of this module, renderSubview renders a view having the given name and returns the rendered html
    @param viewName - the name of the subview to render
    @param tplObj - the object of template variables to render the view with
     */
    render: function(viewName, tplObj) {
        var base = 'views/sub_views/';

        /* read the contents of the file synchronously */
        var html = fs.readFileSync(base+viewName, {
            encoding: 'utf-8'
        });
        var tpl = _.template(html);

        return tpl(tplObj);
    }
}
