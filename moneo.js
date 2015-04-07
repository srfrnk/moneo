var mongoose = require("mongoose");
var neo4j = require("neo4j");
var async = require("async");
var util = require("util");


module.exports = function (schema, options) {
    "use strict";

    if (!!mongoose.options.debug && !module.exports.httpOrg) {
        module.exports.httpOrg = neo4j.GraphDatabase.prototype.http;
        neo4j.GraphDatabase.prototype.http = function (opts, cb) {
            if (mongoose.options.debug === true) {
                console.log("Neo4J Request:", JSON.stringify(opts.body));
            }
            else {
                mongoose.options.debug("Neo4J Request", "", JSON.stringify(opts.body), "", "");
            }
            return module.exports.httpOrg.call(this, opts, cb);
        };
    }

    var graphDb = new neo4j.GraphDatabase({url: 'http://localhost:7474'});

    function cypherQuery(query, params, cb) {

    }

    schema.static('cypherQuery', cypherQuery);
    schema.add({_neo4j: {type: 'Boolean', default: false}});

    schema.pre('save', function (next) {
        this._neo4j = true;
        next();
    });

    schema.post('save', function (doc, next) {
        var props = {};
        var propsStr = Object.keys(props).map(function (key) {
            var val = props[key];
            if (val instanceof String) {
                val = '\'' + val + '\'';
            }
            else if (val instanceof Object) {
                val = util.format(val);
            }
            else if (val instanceof Array) {
                val = util.format(val);
            }
            else {
                val = val.toString();
            }
            return 'n.' + key.toString() + '=' + val;
        }).join(',');

        graphDb.cypher({
                query: 'merge (n:' + doc.constructor.modelName + '{' +
                'mongoId:\'' + doc._id.toHexString() + '\',' +
                'mongoCol:\'' + doc.constructor.collection.name + '\',' +
                'mongoModel:\'' + doc.constructor.modelName + '\'' +
                '}' + ' )' +
                (propsStr.length > 0 ? (' on create set ' + propsStr) : '') +
                (propsStr.length > 0 ? (' on match set ' + propsStr) : '') +
                ' return n'
            },
            function (err) {
                next(err)
            });
    });

    schema.pre('insert', function (next) {
        next();
    });
    schema.post('insert', function (doc, next) {
        next();
    });

    schema.pre('update', function (next) {
        next();
    });
    schema.post('update', function (doc, next) {
        next();
    });
};
