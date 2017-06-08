/* eslint-env browser  */


   var Index = Index || {};
Index.chart = function (data) {
    "use strict";


    
    
    function init() {
        console.log("init chart");
        
    }
    
    //wird aufgerufen wenn Staaten ausgewählt werden mit liste der ausgewählten Staaten
    function changeData(stateslist){
        console.log("Auswahländerung: "+stateslist);
  

        var stateName = document.getElementById('State_Name');
        stateName.innerHTML= stateslist
        console.log(stateName);
        var number = data.getInfoBoxData([1780,1990], " "+stateslist);
        var numberOfAccidents = data.accidents
        var accidentsNumber = document.getElementById('Accidents_Number');
        accidentsNumber.innerHTML=number[0][2].value
        var naturalCausesNumber = document.getElementById('Natural_Causes');
        naturalCausesNumber.innerHTML=number[0][1].value
        var suspectKnownNumber = document.getElementById('Suspect_Known');
        suspectKnownNumber.innerHTML=number[0][0].value
        var illnessNumber = document.getElementById('Illness');
        illnessNumber.innerHTML=number[2].total
        var otherCausesNumber = document.getElementById('Other_Causes');
        otherCausesNumber.innerHTML=number[0][1].total
        var totalNumber = document.getElementById('Total_Number');
        totalNumber.innerHTML = number[2].total
        console.log(number);
 

    }
     var dataset = [
        {
            label: 'Accidents',
            count: changeData.accidentsNumber
        },
        {
            label: 'Natural Causes',
            count: changeData.naturalCausesNumber
        },
        {
            label: 'Suspect Known',
            count: changeData.suspectknown
        },
        {
            label: 'Illness',
            count: changeData.illnessNumber
        },
        {
            label: 'Others',
            count: changeData.otherCausesNumber
        }
        ];
    
    that.changeData=changeData;
    that.init = init;
    that.dataset = dataset;
    return that;
};
