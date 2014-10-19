var util = require('util'),
    TokenStore = require('passwordless-tokenstore'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcrypt'));

function BookshelfStore(Model) {
  TokenStore.call(this);
  this._Model = Model;
};

util.inherits(BookshelfStore, TokenStore);

BookshelfStore.prototype.authenticate = function(token, uid, callback) {
  if(!token || !uid || !callback) {
    throw new Error('TokenStore:authenticate called with invalid parameters');
  }
  var Model = this._Model;
  Model.query(function(qb) {
    qb.where('uid', uid).andWhere('ttl', '>', new Date());
  }).fetch().then(function(model) {
    if (!model) return null;
    return bcrypt.compareAsync(token, model.get('token')).then(function(matches) {
      if (!matches) return null;
      return model;
    });
  }).then(function(model) {
    if (!model) return callback(null, false, null);
    callback(null, true, model.get('origin'));
  }).catch(callback);
};

BookshelfStore.prototype.storeOrUpdate = function(token, uid, msToLive, originUrl, callback) {
  if(!token || !uid || !msToLive || !callback) {
    throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
  }
  var Model = this._Model;
  Model.forge({uid: uid}).fetch().then(function(model) {
    if (!model) model = new Model({uid: uid});
    return bcrypt.hashAsync(token, 10).then(function(hash) {
      return model.save({
        token: hash,
        uid: uid,
        ttl: new Date(Date.now() + msToLive),
        origin: originUrl
      });
    });
  }).then(function() { callback(); }).catch(callback);
};

BookshelfStore.prototype.invalidateUser = function(uid, callback) {
  if(!uid || !callback) {
    throw new Error('TokenStore:invalidateUser called with invalid parameters');
  }
  this._Model.where({uid: uid}).fetch().then(function(model) { // Bookshelf models have no reference to bookshelf or knex..
    return model && model.destroy();
  }).then(function() {
    callback();
  }).catch(callback);
};

BookshelfStore.prototype.length = function(callback) {
  this._Model.fetchAll().then(function(col) { // This is horrible for performance, I know..
    callback(null, col.length);
  }).catch(callback);
};

BookshelfStore.prototype.clear = function(callback) {
  if (!callback) throw new Error('TokenStore:clear is missing callback');
  this._Model.query().del().then(function() {
    callback();
  }).catch(callback);
};


module.exports = BookshelfStore;
