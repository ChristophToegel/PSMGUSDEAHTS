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
            
            //getInfoBoxData(1890, " TX");
        });
        
    }
    
    function filterData(year, filters){
        if (filters == undefined) {
            var stateYear = rawdata.filter(function (row) {
                return row['year'] <= year;
            });
        } else {
            var stateYear = rawdata.filter(function (row) {
                return row['year'] <= year & filters.indexOf(row['cause_short']) > -1;
            });
        }
        return stateYear;
    }

    //data for the map
    //for every state the number of deaths
    function getMapData(year, filters) {
        /*if (filters == undefined) {
            var stateYear = rawdata.filter(function (row) {
                return row['year'] <= year;
            });
        } else {
            var stateYear = rawdata.filter(function (row) {
                return row['year'] <= year & filters.indexOf(row['cause_short']) > -1;
            });
        }*/
        var stateYear= filterData(year,filters);
        var sumStates = sumState(stateYear);
        //--> { NY: 4,  US: 3,  SC: 1,  NC: 1,  KY: 1, …}
        return transformObjectToArray(sumStates)
    }

    function sumState(data) {
        var sumData = {};
        data.forEach(function (i) {
            sumData[i.state] = (sumData[i.state] || 0) + 1;
        });
        return sumData;
    }

    //data for the Infobox
    //for every cause the num of deaths
    function getInfoBoxData(year, state) {
        if (state == undefined) {
            var yearCause = rawdata.filter(function (row) {
                return row['year'] <= year;
            });
        } else {
            var yearCause = rawdata.filter(function (row) {
                return row['year'] <= year & row['state'] == state;
            });
        }
        //alle in detailkategorien
        var cause = sumCause(yearCause);
        cause=transformObjectToArray(cause);
        console.log(cause);
        //cause in oberkategorien aufteilen
        var naturalCauses=["Fall","Drowned","Structure collapse","Fire","Animal related","Weather/Natural disaster","Esposure","Heat exhaustion","Explosion","Asphyxiation"];
        var accidents=["Gunfire(Accident)","Struck by streetcar","Struck by train","Train accident","Electrocuted","Boating accident","Bicycle accident","Struck by vehicle","Automobile accident","Motorcycle accident","Training accident","Aircraft accident"];
        var suspectknown=["Gunfire","Stabbed","Assault","Bomb","Poisoned","Vehicle pursuit","Vehicular assault","Terrorist attack"];
        //TODO detail for others herausfinden
        //TODO oberkategorie Array mit String dann automatisch mit mainCategory["natural"]!!
        var others=[""];
        var mainCategory = {natural:0,accidents:0,suspectknown:0};
        var total=0;
        cause.forEach(function (i) {
            //console.log(i.name);
            if(naturalCauses.indexOf(i.name) > -1){
                mainCategory.natural += i.value;
            }
            if(accidents.indexOf(i.name) > -1){
                mainCategory.accidents += i.value;
            }
            if(suspectknown.indexOf(i.name) > -1){
                mainCategory.suspectknown += i.value;
            }
            if(others.indexOf(i.name) > -1){
                mainCategory.others += i.value;
            }
            total+=i.value;
        });
        
        mainCategory=transformObjectToArray(mainCategory);
        //TODO 3.Array welche daten werden noch gebraucht?!
        var response=[mainCategory,cause,{total:total}];
        //console.log(response);
        //Array 0 mit Hauptkategorien Array 1 mit detailkat.
        return response;
    }

    function sumCause(data) {
        var sumCause = {};
        data.forEach(function (i) {
            sumCause[i.cause_short] = (sumCause[i.cause_short] || 0) + 1;
        });
        return sumCause;
    }

    //data for timelineGraph
    //for every year the number of deaths
    function getdataTimeline() {
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
    
    function sumPlaces(data) {
        var sumPlaces = {};
        data.forEach(function (i) {
            sumPlaces[i.dept_name] = (sumPlaces[i.dept_name] || 0) + 1;
        });
        return sumPlaces;
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
    if(year==undefined){
        year=1990;
    }

    var filtered = filterData(year,causeArray);
    //console.log(filtered.length);
    var difPlaces=sumPlaces(filtered);
    difPlaces=transformObjectToArray(difPlaces);
    //console.log(difPlaces);
        
        d3.csv("data/testCoordinates.csv", function (coordinates) {
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
