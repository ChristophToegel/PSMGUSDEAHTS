/*
$(document).ready(function () {
    $(".pull").click(function () {
        $(".menu").slideToggle("fast");
    });


    $(document).on("click", ".icheckbox", function () {
        $(this).iCheck("toggle");
    });


    $(".icheckbox.master").on("ifUnchecked", function (event) {
        $(this).parent().parent().find(".icheckbox").iCheck("uncheck");
    });

    $(".icheckbox.master").on("ifChecked", function (event) {
        $(this).parent().parent().find(".icheckbox").iCheck("check");
    });

    $(document).on("click", ".icheckbox", function () {
        console.log($("div").not(".master").not(".master_cat"));
        getCheckedCats();
    });
    
    function getCheckedCats() {
        var dic = $("input[type=checkbox]:checked").map(function () {
            return $(this).parent().parent().attr("id");
        }).toArray();

        console.log(dic);
    }

});

*/
/* eslint-env browser  */

var d3 = d3 || {};
d3.menu = function (callback) {
    "use strict";

    var that = {};

    function init() {
        console.log("init menu");
        //daten einlesen
        
    $(".pull").click(function () {
        $(".menu").slideToggle("fast");
    });


    $(document).on("click", ".icheckbox", function () {
        $(this).iCheck("toggle");
    });


    $(".icheckbox.master").on("ifUnchecked", function (event) {
        $(this).parent().parent().find(".icheckbox").iCheck("uncheck");
    });

    $(".icheckbox.master").on("ifChecked", function (event) {
        $(this).parent().parent().find(".icheckbox").iCheck("check");
    });

    $(document).on("click", ".icheckbox", function () {
        //console.log($("div").not(".master").not(".master_cat"));
        console.log("click auf filters");
        callback(getCheckedCats());
    });
    
    }
    
    //fail wird bei jedem click aufgerufen.
    function getCheckedCats() {
        var dic = $("input[type=checkbox]:checked").map(function () {
            return $(this).parent().parent().attr("id");
        }).toArray();
        //console.log("getCheckedCats() wird aufgerufen!");
        return dic;
        console.log(dic);
    }
    
    that.getCheckedCats=getCheckedCats;
    that.init = init;
    return that;
};
