/* eslint-env browser  */

var d3 = d3 || {};
d3.main = function() {
  "use strict";

  var that ={},map;

  function init() {
    console.log("init main");
    var timeline= new d3.timeline(yearSelected);
    timeline.initTimeline();
    map = new d3.map();
    map.initMap();
    var data= new d3.data();
    data.initData();
  }
    
    function yearSelected(curyear){
        console.log("test "+ curyear);
        console.log(map.testDataSelection)
        map.testDataSelection(curyear);
    }
    

  that.init = init;
  return that;
};