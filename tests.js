/*global describe*/
/*global it*/
/*global afterAll*/
/*global beforeAll*/

var async = require("async");
var mongoose = require('mongoose');
var neo4j = require("neo4j");
var moneo = require("./index");

describe("moneo", function () {
    var PersonSchema, PersonModel, ClassSchema, ClassModel;

    beforeAll(function () {
        mongoose.connect('mongodb://localhost/test');
    });

    afterAll(function () {
        mongoose.disconnect();
    });

    PersonSchema = mongoose.Schema({
        firstName: String,
        lastName: String,
        takenClasses:[{
            class:{type: mongoose.Schema.ObjectId, ref: 'Class'},
            grade:Number,
            year:Number
        }]
    });

    ClassSchema = mongoose.Schema({
        title: String,
        teacher:{type: mongoose.Schema.ObjectId, ref: 'Person'}
    });

    PersonSchema.plugin(moneo);
    ClassSchema.plugin(moneo);

    PersonModel = mongoose.model('Person', PersonSchema);
    ClassModel = mongoose.model('Class', ClassSchema);

    it("loads", function () {
        expect(!!PersonModel.cypherQuery).toBeTruthy();
    });

    it("saves", function (done) {
        var person1 = new PersonModel();
        person1.firstName = "Neil";
        person1.lastName = "Young";

        var person2 = new PersonModel();
        person2.firstName = "Lynard";
        person2.lastName = "Skynard";

        var class1=new ClassModel();
        class1.title="Rock'nRoll 101";
        class1.teacher=person2;

        person1.takenClasses=[{
            class:class1,
            grade:60,
            year:1969
        }];

        async.series([person1.save,person2.save,class1.save], function (err, res) {
            expect(person1._neo4j).toBeTruthy();
            expect(person2._neo4j).toBeTruthy();
            expect(class1._neo4j).toBeTruthy();
            done();
        });
    });
});
