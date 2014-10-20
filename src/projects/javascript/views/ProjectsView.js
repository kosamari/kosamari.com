'use strict';

var Backbone    = require('backbone'),
    template    = require('../../templates/base.html');

var ProjectsView = module.exports = Backbone.View.extend({
  events: {},
  initialize: function(options){
    this.parent = options.parent;
    return this;
  },
  render : function(){
    this.$el.html(template);
    return this;
  }

});