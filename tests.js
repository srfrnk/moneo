/*global describe*/
/*global it*/
/*global afterAll*/
/*global beforeAll*/

var async = require("async");
var mongoose = require('mongoose');
var neo4j = require("neo4j");

/*
mongoose.set('debug', function (coll, method, query, doc, options) {
    console.log();
    console.log(coll, method, query, doc, options);
});
*/

var moneo = require("./index");

describe("moneo", function () {
    var PersonSchema, PersonModel, ClassSchema, ClassModel;
    var graphDb;

    beforeAll(function (done) {
        mongoose.connect('mongodb://localhost/test');
        graphDb = new neo4j.GraphDatabase({url: 'http://localhost:7474'});
        async.series([
                function (next) {
                    graphDb.cypher({query: "match (n) delete n"}, next);
                },
                function (next) {
                    graphDb.cypher({query: "match [r] delete r"}, next);
                }],
            done);
    });

    afterAll(function () {
        mongoose.disconnect();
    });


    beforeEach(function () {
    });

    afterEach(function () {
    });

    PersonSchema = mongoose.Schema({
        firstName: String,
        lastName: String,
        takenClasses: [{
            class: {type: mongoose.Schema.ObjectId, ref: 'Class'},
            grade: Number,
            year: Number
        }]
    });

    ClassSchema = mongoose.Schema({
        title: String,
        teacher: {type: mongoose.Schema.ObjectId, ref: 'Person'}
    });

    PersonSchema.plugin(moneo);
    ClassSchema.plugin(moneo);

    PersonModel = mongoose.model('Person', PersonSchema);
    ClassModel = mongoose.model('Class', ClassSchema);

    it("loads", function () {
        expect(!!PersonModel.cypherQuery).toBeTruthy();
    });

    it("should save objects without relations", function (done) {
        var person1 = new PersonModel();
        person1.firstName = "Neil";
        person1.lastName = "Young";

        var person2 = new PersonModel();
        person2.firstName = "Lynard";
        person2.lastName = "Skynard";

        var class1 = new ClassModel();
        class1.title = "Rock'nRoll 101";

        async.series([person1.save, person2.save, class1.save], function (err, res) {
            expect(person1._neo4j).toBeTruthy();
            expect(person2._neo4j).toBeTruthy();
            expect(class1._neo4j).toBeTruthy();

            expect(person1._id instanceof mongoose.Types.ObjectId).toBeTruthy();
            expect(person2._id instanceof mongoose.Types.ObjectId).toBeTruthy();
            expect(class1._id instanceof mongoose.Types.ObjectId).toBeTruthy();

            done(err);
        });
    });

    it("should save objects once", function (done) {
        var person1 = new PersonModel();
        person1.firstName = "Neil";
        person1.lastName = "Young";

        async.series([person1.save, person1.save, function (next) {
            graphDb.cypher({query: 'match (n:Person {mongoId:\'' + person1._id.toHexString() + '\'}) return n'}, next);
        }], function (err, res) {
            expect(err).toBeUndefined();
            var nodes = res[2];
            console.log(JSON.stringify(nodes));
            expect(nodes.length).toBe(1);
            done(err);
        });
    });

    it('should create graph reps for simple DBRef property', function (done) {
        var person1 = new PersonModel();
        person1.firstName = "Neil";
        person1.lastName = "Young";

        var class1 = new ClassModel();
        class1.title = "Rock'nRoll 101";
        class1.teacher = person1;

        async.series([person1.save, class1.save], function (err, res) {
            expect(person1._neo4j).toBeTruthy();
            expect(class1._neo4j).toBeTruthy();

            expect(person1._id instanceof mongoose.Types.ObjectId).toBeTruthy();
            expect(class1._id instanceof mongoose.Types.ObjectId).toBeTruthy();

            expect(class1.teacher._id instanceof mongoose.Types.ObjectId).toBeTruthy();
            expect(class1.teacher._id).toBe(person1._id);

            done();
        });
    });

/*
    it("saves", function (done) {
        var person1 = new PersonModel();
        person1.firstName = "Neil";
        person1.lastName = "Young";

        var person2 = new PersonModel();
        person2.firstName = "Lynard";
        person2.lastName = "Skynard";

        var class1 = new ClassModel();
        class1.title = "Rock'nRoll 101";
        class1.teacher = person2;

        person1.takenClasses = [{
            class: class1,
            grade: 60,
            year: 1969
        }];

        async.series([person1.save, person2.save, class1.save], function (err, res) {
            expect(person1._neo4j).toBeTruthy();
            expect(person2._neo4j).toBeTruthy();
            expect(class1._neo4j).toBeTruthy();

            expect(person1._id instanceof mongoose.Types.ObjectId).toBeTruthy();
            expect(person2._id instanceof mongoose.Types.ObjectId).toBeTruthy();
            expect(class1._id instanceof mongoose.Types.ObjectId).toBeTruthy();

            done();
        });
    });
*/
});
