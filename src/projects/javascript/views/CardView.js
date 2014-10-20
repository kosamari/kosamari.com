/* Dependencies */
var $           = require('jquery'),
    _           = require('underscore'),
    Backbone    = require('backbone'),
    template    = require('../../templates/card.html');;
        
var CardView = module.exports = Backbone.View.extend({

  initialize: function(options){
    return this;
  },
  
  render: function(){
    var _this = this;
    this.$el
        .html(template({
          image: _this.model.get('image'),
          url:_this.model.get('url'),
          cta:_this.model.get('cta'),
          name: _this.model.get('name'),
          desc: _this.model.get('desc')
        }));
    return this;
  }

});
