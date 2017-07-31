/* eslint-env browser  */
/* global d3  */
/* global topojson  */
//Selects the proper Data from csv and Counts the Deaths for every stats(stored via Object)
//http://stackoverflow.com/questions/10615290/select-data-from-a-csv-before-loading-it-with-javascript-d3-library
//https://stackoverflow.com/questions/14446511/what-is-the-most-efficient-method-to-groupby-on-a-javascript-array-of-objects

var Index = Index || {};
Index.data = function (datainitialised) {
    "use strict";

    var that = {},
        rawdata;

    //reads csv Data callback for main if ready
    function initData() {
        d3.csv("data/DeathData.csv", function (csv) {
            rawdata = csv;
            //callback for main
            datainitialised();
        });   
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
        }
        else if (state == undefined && filters == undefined) {
            filtered = rawdata.filter(function (row) {
                return row['year'] <= year[1] & row['year'] >= year[0];
            });
        }
        if(filtered==undefined)filtered=[];
        return filtered;
    }

    //data for the map for the Choropleth and the sumDeathElement
    function getMapData(year, filters) {
        var stateYear = filterData(year, filters, undefined);
        var totaldeaths=stateYear.length;
        var sumStates = sumData(stateYear, "state");
        return [transformObjectToArray(sumStates),totaldeaths]
    }


    //data for the donut chart menu 
    function getMenuData(year, state,structure,catId) {
        var yearCause = filterData(year, undefined, state);
        var totaldeaths = yearCause.length;
        var subcategoryData = sumData(yearCause, "id");
        //join Catname via CatId
        subcategoryData = addCatName(subcategoryData,catId,totaldeaths);
        structure=fillStrcture(structure,subcategoryData,totaldeaths);
        return structure;
    }
    
    //for every Uppercategory join subcategoryData
    function fillStrcture(structure,subcategoryData,totaldeaths){
        structure.forEach(function (upperCategory) {
            var total = 0;
            var newArray = [];
            upperCategory["ids"].forEach(function (cat) {
                subcategoryData.forEach(function (cat2) {
                if(cat == cat2["id"]){
                    cat2.oberkategorie = upperCategory.name;
                    newArray.push(cat2);
                    total = total+cat2["value"]
                    } 
                });
            });
                upperCategory["array"] = newArray;
                upperCategory.value = total
                upperCategory.percentage = Math.round(total/totaldeaths*10000)/100;
        });
        return structure;
    }
    
    function addCatName(subcategoryData,catId,totaldeaths){
        var result = [];
        for (var key in subcategoryData) {
            var name;
            catId.forEach(function(subcategory){
                if(key == subcategory.id){
                    name = subcategory.cause_short;
                }
            });
            var entry = {
                id: key,
                value: subcategoryData[key],
                name: name,
                percentage: Math.round(subcategoryData[key]/totaldeaths*10000)/100
            };
            result.push(entry);
        }
        return result;
    }

    //data in order to for timelineGraph (for every year the number of deaths)
    function getdataTimeline() {
        var sumStates = sumData(rawdata, "year");
        return transformObjectToArray(sumStates);
    }

    //aggregates data
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

    //Data for every dept
    function getMapPointData(callback, year, causeArray) {
        var filteredRawData = filterData(year, causeArray, undefined);
        var deptData = groupBy(filteredRawData, 'dept_name');
        deptData = transformObjectToArray(deptData);
        deptData=splitdeptData(deptData);
        callback(deptData[1],deptData[0]);
    }

    function splitdeptData(deptData){
        var split = d3.scaleQuantile().range(["normal", "normal", "extrem", "extrem"]);
        split.domain([
                d3.min(deptData, function (d) {
                return d.value.length;
            }),
                d3.max(deptData, function (d) {
                return d.value.length;
            })
        ]);
        var extreme=[];
        var normal=[];
        deptData.forEach(function(d){
              if(d.value.length>=split.quantiles()[split.quantiles().length-2]){
                  extreme.push(d);
              }else{
                  normal.push(d);
              }       
        })
        return [normal,extreme];
    }
    
    that.getMapPointData = getMapPointData;
    that.getMapDrawData = getMapDrawData;
    that.getdataTimeline = getdataTimeline;
    that.getMenuData = getMenuData;
    that.getMapData = getMapData;
    that.initData = initData;
    return that;
};
