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
  

        var stateName = document.getElementById('State_Name');
        stateName.innerHTML= stateslist
        console.log(stateName);
        var number = data.getInfoBoxData([1780,1990], " TX");
        var numberOfAccidents = data.accidents
        var accidentsNumber = document.getElementById('Accidents_Number');
        accidentsNumber.innerHTML=numberOfAccidents
        var naturalCausesNumber = document.getElementById('Natural_Causes');
        naturalCausesNumber.innerHTML=number[2].total
        var suspectKnownNumber = document.getElementById('Suspect_Known');
        suspectKnownNumber.innerHTML=number[2].total
        var illnessNumber = document.getElementById('Illness');
        illnessNumber.innerHTML=number[2].total
        var otherCausesNumber = document.getElementById('Other_Causes');
        otherCausesNumber.innerHTML=number[2].total
        
        console.log(number);
 

    }
    
    that.changeData=changeData;
    that.init = init;
    return that;
};

