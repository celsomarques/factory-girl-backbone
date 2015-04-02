var Backbone = require('backbone');
var factory = require('factory-girl');
var Adapter = require('../factory-girl-backbone');
var should = require('chai').should();
var context = describe;

var TestAdapter = function() {
  this.db = [];
};
TestAdapter.prototype = new Adapter();
TestAdapter.prototype.save = function(doc, Model, cb) {
  this.db.push(doc);
  process.nextTick(function() {
    cb(null, doc);
  });
};
TestAdapter.prototype.destroy = function(doc, Model, cb) {
  var db = this.db;
  var i = db.indexOf(doc);
  if (i != -1) this.db = db.slice(0, i).concat(db.slice(i + 1));
  process.nextTick(cb);
};


var User = Backbone.Model.extend({ urlRoot: '/users' })

describe('test backbone adapter', function() {

  var adapter = new TestAdapter();
  factory.setAdapter(adapter);

  var countModels = function(cb) {
    process.nextTick(function() {
      cb(null, adapter.db.length);
    });
  };

  beforeEach(function() {
    factory.define('user', User, {
      name: 'Rudy'
    });
  });

  it('builds a new unsaved Backbone.Model', function(done) {
    factory.build('user', function(err, model) {
      if (err) return done(err);
      model.should.be.an.instanceOf(User);
      model.get('name').should.equal('Rudy');

      countModels(function(err, length) {
        if (err) return done(err);
        length.should.equal(0);
        done();
      });
    });
  });

  it('creates a saved Backbone.Model', function(done) {
    factory.create('user', function(err, model) {
      if (err) return done(err);
      model.should.be.an.instanceOf(User);
      model.get('name').should.equal('Rudy');

      countModels(function(err, length) {
        if (err) return done(err);
        length.should.equal(1);
        done();
      });
    });
  });

  it('cleans up saved Backbone models', function(done) {
    factory.create('user', function(err, model) {
      if (err) return done(err);
      factory.cleanup(function(err) {
        if (err) return done(err);
        countModels(function(err, length) {
          if (err) return done(err);
          length.should.equal(0);
          done();
        });
      });
    });
  });
});
