/* eslint-env browser  */
/* global d3  */
//Selects the proper Data from csv and Counts the Deaths for every stats(stored via Object)
//http://stackoverflow.com/questions/10615290/select-data-from-a-csv-before-loading-it-with-javascript-d3-library
//https://stackoverflow.com/questions/14446511/what-is-the-most-efficient-method-to-groupby-on-a-javascript-array-of-objects

var Index = Index || {};
Index.data = function (datainitialised) {
    "use strict";

    var that = {},
        rawdata,catIdData;

    //csv Dateien einlesen
    function initData() {
        d3.csv("data/finalData.csv", function (csv) {
            //daten können abgefragt werden!
            rawdata = csv;
            
            d3.csv("data/cat-id.csv", function (csv) {
            catIdData=csv;
                datainitialised();
            });
            //Callback für main
            
        });
        
    }
    function getFilterRawData(){
        return catIdData;
    }
    

    function filterData(year, filters, state) {
        var filtered;
        if (filters == undefined && state != undefined) {
            filtered = rawdata.filter(function (row) {
                return row['year'] <= year[1] & row['year'] >= year[0] & row['state'] == state;
            });
        } else if (state == undefined && (filters != undefined && filters.length > 0)) {
            filtered = rawdata.filter(function (row) {
                return row['year'] <= year[1] & row['year'] >= year[0] & filters.indexOf(row['id']) > -1;
            });

        } //else if (state == undefined && (filters == undefined || filters.length === 0)) {
        else if (state == undefined && filters == undefined) {
            filtered = rawdata.filter(function (row) {
                return row['year'] <= year[1] & row['year'] >= year[0];
            });
        }
        if(filtered==undefined)filtered=[];
        return filtered;
    }

    //data for the map
    //for every state the number of deaths
    function getMapData(year, filters) {
        var stateYear = filterData(year, filters, undefined);
        var sumStates = sumData(stateYear, "state");
        //--> { NY: 4,  US: 3,  SC: 1,  NC: 1,  KY: 1, …}
        return transformObjectToArray(sumStates)
    }


    //data for the Infobox
    //for every cause the num of deaths
    function getInfoBoxData(year, state) {
        
        var yearCause = filterData(year, undefined, state);
        //alle in detailkategorien
        var totaldeaths= yearCause.length;
        var causeDetail = sumData(yearCause, "id");
        //transform for Cause
        var transform = [];
        for (var key in causeDetail) {
            var name;
            catIdData.forEach(function(line){
                if(key==line.id){
                    name=line.cause_short;
                }
            });
            var entry = {
                id: key,
                value: causeDetail[key],
                name: name,
                percentage: Math.round(causeDetail[key]/totaldeaths*10000)/100
            };
            transform.push(entry);
        }
        causeDetail=transform;
    
        var illness = ["10", "11", "27","35"];
        var accidents = ["08", "16", "17", "20", "22", "23", "24", "25", "26", "29", "32", "33"];
        var naturalCauses = ["04", "05", "06", "07", "09", "12", "14", "15", "21", "36"];
        var others = ["28"];
        var suspectknown =["01", "02", "03", "18", "19", "30", "31", "34"];
        
        var mainArray = [
            {name: "natural", array: naturalCauses, id:100, ids: naturalCauses},
            {name: "accidents", array: accidents, id:101, ids: accidents},
            {name: "suspectknown", array: suspectknown, id:102, ids: suspectknown},
            {name: "illness", array: illness, id:103, ids: illness},
            {name: "others", array: others, id:104, ids: others}
        ];
        
        mainArray.forEach(function (element) {
            var total=0;
            var newArray=[];
            element["array"].forEach(function (cat) {
                causeDetail.forEach(function (cat2) {
                if(cat==cat2["id"]){
                    cat2.oberkategorie=element.name;
                    newArray.push(cat2);
                    total=total+cat2["value"]
                    } 
                });
            });
                element["array"] = newArray;
                element.value=total
                element.percentage=Math.round(total/totaldeaths*10000)/100;
        });
        //console.log(mainArray);
        return mainArray;
    }

    //data for timelineGraph
    //for every year the number of deaths
    function getdataTimeline() {
        var sumStates = sumData(rawdata, "year");
        return transformObjectToArray(sumStates);
    }

    function sumData(data, column) {
        var sumObject = {};
        data.forEach(function (i) {
            sumObject[i[column]] = (sumObject[i[column]] || 0) + 1;
        });
        return sumObject
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

    
    function getMapDrawData(callback) {
        d3.tsv("data/us-state-names.tsv", function (statenames) {
            //https://gist.github.com/shawnbot/e6a857780ec2fe6002f7
            d3.json("data/us-state.json", function (error, json) {
                var states = topojson.feature(json, json.objects.states).features
                if (error) throw error;
                //joins the contourData with the StatenameData
                states.forEach(function (state) {
                    for (var i = 0; i < statenames.length; i++) {
                        if (statenames[i].id == state.id) {
                            state.statenameshort = statenames[i].code;
                            state.statename = statenames[i].name;
                        }
                    }
                });
                //console.log(states);
                //{type: "Feature", id: 1, properties: {}, geometry: Object, statename: "AL"}
                callback(states);
            });
        });
    }
    
    function groupBy(array,key){
        return array.reduce(function (output, entry) {
            (output[entry[key]] = output[entry[key]] || []).push(entry);
            return output;
        }, {});
    }

    //function lat/lng und anzahl der getöteten personen
    function getMapPointData(callback, year, causeArray) {
        var filtered = filterData(year, causeArray, undefined);
        var testData = groupBy(filtered, 'dept_name');
        var finaldata= transformObjectToArray(testData);
        callback(finaldata);
    }

    that.getFilterRawData = getFilterRawData;
    that.getMapPointData = getMapPointData;
    that.getMapDrawData = getMapDrawData;
    that.getdataTimeline = getdataTimeline;
    that.getInfoBoxData = getInfoBoxData;
    that.getMapData = getMapData;
    that.initData = initData;
    return that;
};
