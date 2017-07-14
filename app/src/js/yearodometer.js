/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.yearodometer = function () {
    "use strict";

    var that = {};

    //TODO no remove update instead!
    function initOdometer() {
        console.log("init Infobox");
    }
    
    function updateDateInfo(date) {
        let $yearInfoEl1 = $("#yearSel1");
        let $yearInfoEl2 = $("#yearSel2");

        var yearSel1 = document.getElementById('yearSel1');
        var yearSel2 = document.getElementById('yearSel2');

        window.odometerOptions = {
            auto: false, // Don't automatically initialize everything with class 'odometer'
            format: 'd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
        };

        var od1 = new Odometer({
            el: yearSel1,
            format: 'd',
            theme: 'minimal'
        });

        var od2 = new Odometer({
            el: yearSel2,
            format: 'd',
            theme: 'minimal'
        });

        od1.update(date[0]);
        od2.update(date[1]);
    }

    that.updateDateInfo=updateDateInfo;
    return that;
};