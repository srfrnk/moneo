module.exports = function (schema, options) {

    function cypherQuery(query,params,cb) {

    }

    schema.static('cypherQuery', cypherQuery);
    schema.add({_neo4j: {type:'Boolean',default:false}});

    schema.pre('save', function (next) {
        this._neo4j=true;
        next();
    });

    schema.post('save', function () {
    });

    schema.pre('insert', function (next) {next();});
    schema.post('insert', function () {});

    schema.pre('update', function (next) {next();});
    schema.post('update', function () {});
};
