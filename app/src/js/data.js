/* eslint-env browser  */

//Selects the proper Data from csv and Counts the Deaths for every stats(stored via Object)
//http://stackoverflow.com/questions/10615290/select-data-from-a-csv-before-loading-it-with-javascript-d3-library

var d3 = d3 || {};
d3.data = function (datainitialised) {
    "use strict";

    var that = {},
        rawdata;

    function initData() {
        d3.csv("data/clean_data.csv", function (csv) {
            //daten können abgefragt werden!
            rawdata = csv;
            console.log("data ready");
            //Callback --> map and timeline
            datainitialised();
            
            //getInfoBoxData(1890, " TX");
        });
        
    }
    //year is never undefined?!
    function filterData(year, filters,state){
        var filtered;
        if (filters == undefined && state!=undefined) {
            filtered = rawdata.filter(function (row) {
                return row['year'] <= year & row['state'] == state;
            });
        } else if (state==undefined && filters!=undefined) {
            filtered = rawdata.filter(function (row) {
                return row['year'] <= year & filters.indexOf(row['cause_short']) > -1;
            });
            
        } else if(state==undefined && filters == undefined){
            filtered = rawdata.filter(function (row) {
                return row['year'] <= year;
            });
        }
        return filtered;
    }

    //data for the map
    //for every state the number of deaths
    function getMapData(year, filters) {
        var stateYear= filterData(year,filters,undefined);
        var sumStates = sumData(stateYear,"state");
        //--> { NY: 4,  US: 3,  SC: 1,  NC: 1,  KY: 1, …}
        return transformObjectToArray(sumStates)
    }


    //data for the Infobox
    //for every cause the num of deaths
    function getInfoBoxData(year, state) {
        var yearCause=filterData(year,undefined,state);
        //alle in detailkategorien
        var causeDetail = sumData(yearCause, "cause_short");
        causeDetail=transformObjectToArray(causeDetail);
        //TODO fest einteilen
        var naturalCauses=["Fall","Drowned","Structure collapse","Fire","Animal related","Weather/Natural disaster","Esposure","Heat exhaustion","Explosion","Asphyxiation"];
        var accidents=["Gunfire(Accident)","Struck by streetcar","Struck by train","Train accident","Electrocuted","Boating accident","Bicycle accident","Struck by vehicle","Automobile accident","Motorcycle accident","Training accident","Aircraft accident"];
        var suspectknown=["Gunfire","Stabbed","Assault","Bomb","Poisoned","Vehicle pursuit","Vehicular assault","Terrorist attack"];
        //TODO detail for others herausfinden
        var others=[""];
        var mainArray={natural:naturalCauses,accidents: accidents,suspectknown: suspectknown};
        var sumCategory={};
        var total=0;
        causeDetail.forEach(function (i) {
            for (var category in mainArray){
               if(mainArray[category].indexOf(i.name) > -1){
                sumCategory[category] = (sumCategory[category] || 0) + i.value;
                } 
            }
            total+=i.value;
        });
        
        sumCategory=transformObjectToArray(sumCategory);
        //TODO 3.Array welche daten werden noch gebraucht?!
        var response=[sumCategory,causeDetail,{total:total}];
        console.log(response);
        //Array 0 mit Hauptkategorien Array 1 mit detailkat.
        return response;
    }

    //data for timelineGraph
    //for every year the number of deaths
    function getdataTimeline() {
        var sumStates= sumData(rawdata,"year");
        return transformObjectToArray(sumStates);
    }
    
    function sumData(data, column){
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
            //loads the jsonlist with states and their contour
            //ohne internet!!
            //https://gist.github.com/shawnbot/e6a857780ec2fe6002f7
            d3.json("data/us-state.json", function (error, json) {
                //console.log(json);
                var states = topojson.feature(json, json.objects.states).features
                if (error) throw error;
                //console.log(json);
                //joins the contourData with the StatenameData
                states.forEach(function (state) {
                    for (var i = 0; i < statenames.length; i++) {
                        if (statenames[i].id == state.id) {
                            state.statename = statenames[i].code;
                        }
                    }
                });
                //console.log(states);
                //{type: "Feature", id: 1, properties: {}, geometry: Object, statename: "AL"}
                callback(states);
            });
        });
    }

    //function lat/lng und anzahl der getöteten personen
    function getMapPointData(callback,year,causeArray) {
    //TODO performance verbessern: Daten vorher joinen?
    var filtered = filterData(year,causeArray,undefined);
    var difPlaces=sumData(filtered, "dept_name");
    difPlaces=transformObjectToArray(difPlaces);
    //console.log(difPlaces);
        
        d3.csv("data/latlngFordept_name.csv", function (coordinates) {
            //daten können abgefragt werden!
            //console.log("coordinates ready:"+year);
            //console.log(coordinates);
            //join where coordinates.dept_name===rawdata.dept_name
            
            difPlaces.forEach(function (place) {
               for (var i = 0; i < coordinates.length; i++) {
                        if (coordinates[i].dept_name == place.name) {
                            place.lat = coordinates[i].lat;
                            place.lng = coordinates[i].lng;
                        }
                    }
            });
            //console.log(difPlaces);
            callback(difPlaces);
        });
    }
    
    
    that.getMapPointData = getMapPointData;
    that.getMapDrawData = getMapDrawData;
    that.getdataTimeline = getdataTimeline;
    that.getInfoBoxData = getInfoBoxData;
    that.getMapData = getMapData;
    that.initData = initData;
    return that;
};
