'use strict';

var $        = require('jquery'),
    Backbone = require('backbone'),
    MainView       = require('./views/MainView');

Backbone.$ = $;

var app = window.app = {};
app.mainView = new MainView({el : $('#main')});

Backbone.history.start();