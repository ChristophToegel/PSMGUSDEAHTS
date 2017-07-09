/* eslint-env browser  */

var Index = Index || {};
Index.menu = function (filterSelected) {
    "use strict";
    console.log($("#chart").width());
    
    const width = $("#chart").width(),
        height = width,
          thickness=50,
          color = d3.scaleOrdinal()
                .range(["rgb(255, 77, 77)", "rgb(255, 102, 102)", "rgb(255, 128, 128)", "rgb(255, 153, 153)", "rgb(255, 179, 179)", "rgb(255, 204, 204)", "rgb(255, 230, 230)"]),
          colorSub = d3.scaleOrdinal()
                .range(["rgb(33, 33, 255)", "rgb(63, 63, 255)", "rgb(93, 93, 255)", "rgb(123, 123, 255)", "rgb(153, 153, 255)", "rgb(183, 183, 255)", "rgb(213, 213, 230)"]);

    var that = {},svg;


    function init() {
        console.log("init menu");
        createSvg();
        
    }

    function createSvg(){
        svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
        svg.append('defs');
    }
    
    //wird aufgerufen wenn Staaten ausgewählt werden mit liste der ausgewählten Staaten
    function changeData(state, data) {
        d3.select('#chart').selectAll("g").remove(); 
        createArc(data);
        createTextLeftCorner(state);
    }

    function createArc(data) {  
        var radius = Math.min(width, height) / 2;            
       
         var pie = d3.pie()
            .value(function (d) {
                return d.value;
            })
            .sort(null);

        var innerchart= svg.append('g')
            .attr('transform', 'translate(' + (width / 2)  +
              ',' + (height / 2) + ')');

        var arc = d3.arc()
            .innerRadius(width-7*thickness)
            .outerRadius(width-6*thickness);
      
        var path = innerchart.selectAll('path')
            .append("g")
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d) {
                d.data.color=color(d.data.name);
                createPattern(d.data);
                return color(d.data.name);
            })
            .attr('id', function (d) {
                return d.data.name;
            })
            .on("mouseover", function (d) {
                let el=d3.select(this);
                createTextCenter(d.data.value,d.data.name, d.data.percentage);
                el.classed("piehover",true);
            })
            .on("mouseout", function (d) {
               let el=d3.select(this);
                el.classed("piehover",false);
            })
            .on("click", showSecondArc)
            .transition()
            .ease(d3.easeLinear)
            .duration(800)
            .attrTween("d", function(d){
                d.innerRadius=0;
                var i= d3.interpolate({startAngle:0, endAngle:0},d);
                return function(t){return arc(i(t));};
            });
        
        //draw all unterkat charts
            drawSencondArcs(data);
        
      /*//add textLabel 
       var labelArc = d3.arc()
            .outerRadius(radius-50)
            .innerRadius(radius-70);
            
        svg.selectAll('text')
            .append("g")
            .data(pie(dataset))
            .enter()
            .append("text")
            .attr("transform", function (d) {
                return "translate(" + labelArc.centroid(d) + ")";
            })
            .text(function (d) {
                return d.data.name;
            });
            */
    }
    
    //clickLogic
    function showSecondArc(d){
        //console.log(d);
        var selected=d3.selectAll('g[visibility = visible]');
        //element schon ausgewählt
        if(selected.data().length != 0){
            //gleiches element
            if(selected.data()[0].name==d.data.name){
                d3.selectAll("."+d.data.name).attr("visibility","hidden");
            }else{
                //unterschiedlich
                d3.selectAll("."+selected.data()[0].name).attr("visibility","hidden");
                d3.selectAll("."+d.data.name).attr("visibility","visible")
            }
        }else{
        //nichts ausgewählt
        d3.selectAll("."+d.data.name).attr("visibility","visible")
        }
    }
    
    //http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    function markPie(el) {
        d3.selection.prototype.moveToFront = function () {
            return this.each(function () {
                this.parentNode.appendChild(this);
            });
        };
        el.moveToFront()
    }
    
    
    
    function createTextCenter(name, value, percentage){
        svg.select(".text").remove();
        //TODO startposition des Textfeldes über g bestimmen!!
        var textfield= svg.append('g').classed("text",true)
            .attr('transform', 'translate(185, 200 )');
        
        textfield.append("text").selectAll("text").data([name,value,percentage+"%"])
                        .enter()
                        .append("tspan")
                        .text(function (d) {
                        return d;
                        })
                        .attr("x",function (d,i) {
                            return 0;
                            })
                        .attr("y",function (d,i) {
                            return i*20;
                            });
    }
    
    function createTextRightCorner(name, percentage){
        svg.select(".textselected").remove();
        //TODO startposition des Textfeldes über g bestimmen!!
        var textfield= svg.append('g').classed("textselected",true)
            .attr('transform', 'translate(335, 20 )');
        
        textfield.append("text").selectAll("text").data([name,percentage])
                        .enter()
                        .append("tspan")
                        .text(function (d) {
                        return d;
                        })
                        .attr("x",function (d,i) {
                            return 0;
                            })
                        .attr("y",function (d,i) {
                            return i*20;
                            });
    }
    
    function createTextLeftCorner(state){
        var state=d3.select("#"+state).data();
        svg.select(".textstate").remove();
        //TODO startposition des Textfeldes über g bestimmen!!
        var textfield= svg.append('g').classed("textstate",true)
            .attr('transform', 'translate(50, 20 )');
        textfield.append("text").selectAll("text").data(state)
                        .enter()
                        .append("tspan")
                        .text(function (d) {
                        return d.statename;
                        })
                        .attr("x",function (d,i) {
                            return 0;
                            })
                        .attr("y",function (d,i) {
                            return i*20;
                            });
    }


    function drawSencondArcs(data){
        //für jede oberkategorie eigenen chart zeichnen!
        
        var radius = Math.min(width, height) / 2;
        
        var outerchart= svg.append('g').attr('transform', 'translate(' + (width /2) +',' + (height / 2) + ')').classed("secondarc",true).selectAll('g').data(data).enter().append('g').attr("class",function (d) {
            return (d.name);
        }).attr("visibility","hidden");
        
        
        // arc
        var outerArc = d3.arc()
            .innerRadius(width-6*thickness+2)
            .outerRadius(width-5*thickness+2);

        var pie = d3.pie()
            .value(function (d) {
                return d.value;
            })
            .sort(d3.descending);
        
        
        var path = outerchart.selectAll('path')
            .data(function(d) {
                return pie(d.array);})
            .enter()
            .append('path')
            .attr('d', outerArc)
            //zu beginn alle der unterkategorie ausgewählt
            .classed("pieselected",true)
            .attr('fill', function (d) {
<<<<<<< HEAD
                return colorSub(d.data.name);
=======
                d.data.color=color(d.data.name);
                return color(d.data.name);
>>>>>>> origin/master
            })
            .on("mouseover", function (d,i) {
                let el=d3.select(this);
                el.classed("piehover",true);
                createTextCenter(d.data.value,d.data.name,d.data.percentage);
            })
            .on("mouseout", function (d) {
               let el=d3.select(this);
                el.classed("piehover",false);
            })
            .on("click", function(d){
                let el=d3.select(this);
                if(el.classed("pieselected")){
                    el.classed("pieselected",false);
                }else{
                    el.classed("pieselected",true);
                }
                checkAllSelected(d.data.oberkategorie);
                markPie(el);
                selectionChanged();
            });
            /*.transition()
            .ease(d3.easeLinear)
            .duration(200)
            .attrTween("d", function(d){
                d.innerRadius=0;
                var i= d3.interpolate({startAngle:0, endAngle:0},d);
                return function(t){return outerArc(i(t));};
            });
            */
        //}
    }
    
    function createPattern(data){
        var allpatterns= d3.select('defs').append('pattern')
                .attr('id', "pattern-" +data.name)
                .attr('width', 12)
                .attr('height', 12)
                .attr('patternUnits', 'userSpaceOnUse');
        allpatterns.append('rect')
                .attr('width', 12)
                .attr('stroke', "none")
                .attr('height', 12)
                .attr('fill', data.color)
        allpatterns.append('image')
                .attr('width', 12)
                .attr('height', 12)
                .attr('xlink:href', "https://www.transparenttextures.com/patterns/black-twill.png")
    }
    
    //wenn unterpunkte ausgewählt dann TODO pattern und nicht heller
    function checkAllSelected(oberkategorie){
        var maincat= d3.select("#"+oberkategorie);
        var maincatnum = maincat.data()[0].data.array.length;
        var selnum = d3.selectAll("."+oberkategorie).selectAll(".pieselected").size()
        if(selnum==maincatnum){
            maincat.attr("opacity", 1);
            maincat.attr("fill", maincat.data()[0].data.color)
        }else{
            var color=maincat.attr("fill");
            maincat.attr("fill","url(#pattern-"+maincat.data()[0].data.name+")")
        }
    }
    
    //muss arc bekommen 
    function pieAnimation(d){
        //var arc = d3.arc()
        //    .innerRadius(width-6*thickness+2)
        //    .outerRadius(width-5*thickness+2);
        d.innerRadius=0;
        var i= d3.interpolate({startAngle:0, endAngle:0},d);
        return function(t){return arc(i(t));};
    }
    
    //main kann sich die filter holen!
    function getSelectedFilters(){
        //array mit ID der ausgewählten kategorien!!
        var ids=[];
        var filters=d3.selectAll(".pieselected").data();
        //13 is missing others?
        //console.log(filters);
        for(var i=0;i<filters.length;i++){
            ids.push(filters[i].data.id);
        }
        return ids;
    }
    
    function selectionChanged(){
        let ids=getSelectedFilters();
        //callback für main
       filterSelected(ids);
    }
    that.getSelectedFilters= getSelectedFilters;
    that.changeData = changeData;
    that.init = init;
    return that;
};
