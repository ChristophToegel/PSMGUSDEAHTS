/* eslint-env browser  */

var Index = Index || {};
Index.infobox = function (data) {
    "use strict";

    var that = {};
    
    
    function init() {
        console.log("init infobox");
    }
    
    //wird aufgerufen wenn Staaten ausgewählt werden mit liste der ausgewählten Staaten
    function changeData(stateslist){
        console.log("Auswahländerung: "+stateslist);
    }
    
    that.changeData=changeData;
    that.init = init;
    return that;
};
