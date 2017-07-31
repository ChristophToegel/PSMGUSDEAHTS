/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.yearodometer = function () {
    "use strict";

    var that = {},
        od1, od2, counter;

    function initOdometer() {
        var yearSel1 = document.getElementById('yearSel1');
        var yearSel2 = document.getElementById('yearSel2');

        od1 = new Odometer({
            el: yearSel1,
            format: 'd',
            theme: 'minimal'
        });

        od2 = new Odometer({
            el: yearSel2,
            format: 'd',
            theme: 'minimal'
        });


    }

    function initCounter() {
        counter = document.getElementById("totalCount");
    }

    function updateOdometerDate(date) {
        od1.update(date[0]);
        od2.update(date[1]);
    }

    function updateCounter(sumDeath) {
        counter.innerHTML = sumDeath + " displayed Cases";
    }

    initCounter();
    initOdometer();
    that.updateCounter = updateCounter;
    that.updateOdometerDate = updateOdometerDate;
    return that;
};
