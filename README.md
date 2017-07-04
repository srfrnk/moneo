# moneo
Mongoose -> Neo4J plugin / middleware

[![Build Status](https://travis-ci.org/srfrnk/moneo.svg)](https://travis-ci.org/srfrnk/moneo)

[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

## Required: 
- node / iojs
- mongoose

## Installation
```

$ npm i -S moneo


```

-- View on [npmjs](https://www.npmjs.com/package/moneo)

## Usage

```javascript

var moneo = require("moneo")({url:'http://localhost:7474'});

SomeSchema.plugin(moneo);

```

!!! Connection string must of course be changed... !!! 

## Supported functionality

To mark schema property to be stored into a neo4j node property add ```nodeProperty: true```. Default is false. 
e.g.
```javascript

SomeSchema = mongoose.Schema({
    firstName: {type: String, nodeProperty: true}, // Will be persisted to neo4j 
    lastName: {type: String, nodeProperty: true}, // Will be persisted to neo4j
    mongoSpecificValue1: {type: String, nodeProperty: false}, // Will not be persisted to neo4j
    mongoSpecificValue2: String // Will not be persisted to neo4j
});

```

Simple ref properties will be used to create relations. Use ```relName:'Relation Name'``` to specify relation name.
e.g.
```javascript

SomeSchema = mongoose.Schema({
    teacher: {type: mongoose.Schema.ObjectId, ref: 'OtherSchema', relName: "Taught By"},
});

```

A nested schema including a ref property will be used to create relations with properties.
e.g.
```javascript

SomeSchema = mongoose.Schema({
    supervisor: {
        person: {type: mongoose.Schema.ObjectId, ref: 'OtherSchema', relName: "Supervised By"},
        startDate: Date
    },
});

```

Array of ref properties will be used to create multiple relations.
e.g.
```javascript

SomeSchema = mongoose.Schema({
    students: [{type: mongoose.Schema.ObjectId, ref: 'OtherSchema', relName: 'Teaches'}]
});

```

Array of objects that include a ref property will be used to create multiple relations with relation properties.
e.g.
```javascript

SomeSchema = mongoose.Schema({
    takenClasses: [{
        class: {type: mongoose.Schema.ObjectId, ref: 'OtherSchema',relName:'Takes Class'},
        grade: Number,
        year: Number
    }]
});

```

To run a cypher query the static model ```cypherQuery(opts,cb,_tx)``` function can be used. It behaves the same as ```neo4j.GraphDatabase.cypher(options,cb,_tx)```.
e.g.
```javascript

SomeModel.cypherQuery({query: 'match (n:Person)-[r:Takes_Class]-(c:Class) return n,r,c'}, function (err, res)     {
    // if ok - res contains results...
});

```

## Demo project
[test-for-moneo](https://github.com/akarsh/test-for-mone) project demonstrates the usage of moneo. It covers the above mentioned functionality examples.

## Contributions
### Since this is very new code.... I expect bugs.... so please open issues!

### If you wish to contribute - Please:
* Keep my code style
* Add/maintain tests
* Don't break what you can't fix :)
