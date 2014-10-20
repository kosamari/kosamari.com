'use strict';

var Backbone = require('backbone'),
    _        = require('underscore'),
    template = require('../../templates/base.html'),
    CardView      = require('../views/CardView'),
    dataset = require('../collections/data.json');

var MainView = module.exports = Backbone.View.extend({
  subviews:{},
  initialize: function(){
    this.collection = new Backbone.Collection;
    this.collection.add(dataset);
    this.render();
  },
  render:function(){
    this.$el.append(template);
    this.createCards(this.collection);
  },
  createCards : function(collection){
    var _this = this;

    _.each(collection.models, function(model){
      var tmp = new CardView({model:model});
      // _this.subviews.push(tmp);
      _this.$('#cards').append(tmp.render().$el);
    })
  }

});