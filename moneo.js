var neo4j = require("neo4j");
var async = require("async");
var util = require("util");

module.exports = function (schema, options) {
    "use strict";

    var graphDb = new neo4j.GraphDatabase('http://localhost:7474');

    function cypherQuery(query, params, cb) {

    }

    schema.static('cypherQuery', cypherQuery);
    schema.add({_neo4j: {type: 'Boolean', default: false}});

    schema.pre('save', function (next) {
        this._neo4j = true;
        next();
    });

    schema.post('save', function (doc) {

        var props = {
            mongoId: doc._id.toHexString(),
            mongoCol: doc.constructor.collection.name,
            mongoModel: doc.constructor.modelName
        };

        graphDb.cypher({
                query: 'create (n:' + doc.constructor.modelName + util.format(props) + ' ) return n'
            },
            function (err/*, results*/) {
                if (err) {
                    throw err
                }
            });
    });

    schema.pre('insert', function (next) {
        next();
    });
    schema.post('insert', function (doc) {
    });

    schema.pre('update', function (next) {
        next();
    });
    schema.post('update', function (doc) {
    });
};
