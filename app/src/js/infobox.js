/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.infobox = function () {
    "use strict";

    var that = {};

    //TODO no remove update instead!
    function initInfobox() {
        console.log("init Infobox");
        document.getElementById("nav-icon1").addEventListener("click", changeView);
        var deathInfoBox = d3.select("#textdata");
        deathInfoBox.append("div").attr("id","menudata").classed("hidden",true);
        deathInfoBox.append("div").attr("id","deathinfodata")
    }
    
    //names hat oberkateogorie mit unterkategorien der ausgewählten menupunkte
    function updateSelection(names){
        //ausgewählte menuelemente hier anzeigen
        var menudata = d3.select("#menudata");
        menudata.selectAll("*").remove();
        //TODO oberkategorie(1/5) + aufklappen für die unterkategorien!
        console.log(names);
    }
    
    function changeView(){
        console.log("change infobox");
        var menu=document.getElementById("menudata")
        var deathinfo=document.getElementById("deathinfodata")
        if(menu.classList.contains("hidden")){
            menu.classList.remove("hidden");
            deathinfo.classList.add("hidden");
        }else{
            menu.classList.add("hidden");
            deathinfo.classList.remove("hidden");
        }
    }
    
    function mapPointClicked(data){
        var deathInfoBox = d3.select("#deathinfodata");
        deathInfoBox.selectAll("*").remove();

        deathInfoBox.append("p")
            .text(data.name)
            .attr("class", "deathInfoHeading")
        deathInfoBox
            .append("p").text(function () {
                if (data.value.length == 1) {
                    return "1 Death"
                } else {
                    return data.value.length + " Deaths"
                }
            }).attr("class","deathNumber");
        deathInfoBox.append("div")
            .attr("id", "deathInfoEntries");

        let entry = d3.select("#deathInfoEntries").selectAll("div").data(data.value).enter().append("div").attr("class", "deathInfoEntry");
        entry.append("p")
            .text(function (d) {
                return d.person;
            })
            .attr("class", "deathEntryVictim");
        entry.append("p")
            .text(function (d) {
                return d.eow;
            })
            .attr("class", "deathEntryEOW");
        entry.append("p")
            .text(function (d) {
                return d.cause_short;
            })
            .attr("class", "deathEntryCause");
    }
    
    initInfobox();
    that.updateSelection=updateSelection;
    that.mapPointClicked=mapPointClicked;
    return that;
};