/* eslint-env browser  */

var d3 = d3 || {};
d3.main = function() {
  "use strict";

  var that ={};

  function init() {
    console.log("init main");
    var timeline= new d3.timeline();
    timeline.initTimeline();
    var map = new d3.map();
    map.initMap();
    var data= new d3.data();
    data.initData();
  }
    

  that.init = init;
  return that;
};