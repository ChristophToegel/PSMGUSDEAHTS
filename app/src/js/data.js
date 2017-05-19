/* eslint-env browser  */

//Selects the proper Data from csv and Counts the Deaths for every stats(stored via Object)
//http://stackoverflow.com/questions/10615290/select-data-from-a-csv-before-loading-it-with-javascript-d3-library

var d3 = d3 || {};
d3.data = function (datainitialised) {
    "use strict";

    var that = {},
        rawdata, intitialised = false;

    function initData() {
        d3.csv("data/clean_data.csv", function (csv) {
            //daten können abgefragt werden!
            rawdata = csv;
            console.log("data ready");
            //Callback --> map and timeline
            datainitialised();
        });
        getMapDrawData();
    }

    //data for the map
    //for every state the number of deaths
    function getMapData(year,filters) {
        if(filters==undefined){
            var stateYear = rawdata.filter(function (row) {
            return row['year'] <= year;
            });
        }
        else{
            var stateYear = rawdata.filter(function (row) {
            return row['year'] <= year & filters.indexOf(row['cause_short']) > -1;
            });
        }
        var sumStates = sumState(stateYear); 
        //--> { NY: 4,  US: 3,  SC: 1,  NC: 1,  KY: 1, …}
        return transformObjectToArray(sumStates)
    }
    
    function sumState(data){
        var sumData = {};
       data.forEach(function (i) {
            sumData[i.state] = (sumData[i.state] || 0) + 1;
        }); 
        return sumData;
    }

    //data for the Infobox
    //for every cause the num of deaths
    function getInfoBoxData(year,state) {
        if(state==undefined){
            var yearCause = rawdata.filter(function (row) {
            return row['year'] <= year;
        });
        }
        else{
            var yearCause = rawdata.filter(function (row) {
            return row['year'] <= year & row['state'] == state;
        });
        }
        var cause=sumCause(yearCause);
        return transformObjectToArray(cause);
    }
    
    function sumCause(data){
        var sumCause = {};
        data.forEach(function (i) {
            sumCause[i.cause_short] = (sumCause[i.cause_short] || 0) + 1;
        });
        return sumCause;
    }
    
    //data for timelineGraph
    //for every year the number of deaths
    function getdataTimeline(){
        var sumStates = {};
        var stateYear = rawdata;
        stateYear.forEach(function (i) {
            sumStates[i.year] = (sumStates[i.year] || 0) + 1;
        });
        return transformObjectToArray(sumStates); 
    }
    
    function transformObjectToArray(object) {
        var transform = [];
        for (var key in object) {
            var entry = {
                name: key,
                value: object[key]
            };
            transform.push(entry);
        }
        return transform;
    }
    
    
    function getMapDrawData(){
    }
    
    that.getMapDrawData = getMapDrawData;
    that.getdataTimeline = getdataTimeline;
    that.getInfoBoxData = getInfoBoxData;
    that.getMapData = getMapData;
    that.initData = initData;
    return that;
};
