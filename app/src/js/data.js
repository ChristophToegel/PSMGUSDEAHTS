/* eslint-env browser  */

var d3 = d3 || {};
d3.data = function(test) {
  "use strict";

  var that ={};

  function initData() {
    console.log("init Data");
  }

  that.initData = initData;
  return that;
};