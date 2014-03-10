var LostItemStatus = Backbone.Model.extend({
    defaults: {
        key: 0,
        name: 'Reported',
        selected: false
    }
}, {
    statuses: [
        {
            key: 0,
            name: 'Reported'
        },
        {
            key: 1,
            name: 'Sourcing'
        },
        {
            key: 2,
            name: 'Match Found'
        },
        {
            key: 3,
            name: 'Match Approved'
        },
        {
            key: -1,
            name: 'Refund Almost Required'
        },
        {
            key: -2,
            name: 'Refund Required'
        }
    ]
});

var LostItemStatusCollection = Backbone.Collection.extend({
    model: LostItemStatus
})