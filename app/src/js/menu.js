/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.menu = function (filterSelected) {
    "use strict";
    console.log($("#chart").width());
    
    const width = $("#chart").width(),
        height = width,
          thickness=0.105*width,
          color = d3.scaleOrdinal()
                .range(["rgb(255, 77, 77)", "rgb(255, 102, 102)", "rgb(255, 128, 128)", "rgb(255, 153, 153)", "rgb(255, 179, 179)", "rgb(255, 204, 204)", "rgb(255, 230, 230)"]),
          colorSub = d3.scaleOrdinal()
                .range(["rgb(33, 33, 255)", "rgb(63, 63, 255)", "rgb(93, 93, 255)", "rgb(123, 123, 255)", "rgb(153, 153, 255)", "rgb(183, 183, 255)", "rgb(213, 213, 230)"]);
    var that = {},svg,filters=[],filterdata;


    function init(filterdataraw) {
        console.log("init menu");
        createSvg();
        //createButtons();
        initFilters(filterdataraw);
    }

    function initFilters(filterdataraw){
        filterdata=filterdataraw;
        filters=getAllFilterIds();
        //console.log(filters);
    }

    function createSvg(){
        svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
        svg.append('defs');
    }
    
    function createButtons(){
        //Button: SelectAll mit rect umrandung
        //Button: RemoveAll mit image 
        //TODO schöner!!
        var button=svg.append('g')
        .attr('transform', 'translate(' + ((width/2)-40)  + ',' + ((height/2)-70) + ')')
        .classed("button",true)
        .classed("text45",true)
        let button1=button.append("g").attr("id","button1")
        button1.append("text")
            .text("unselectAll")
            .attr("dy","5px");
        button1.append('rect').attr('width', 12)
            .attr('stroke', "black")
            .attr('height', 12)
            .attr('fill','#fff')
            .attr('x','85px')
            .attr('y','-6px')
        button1.on("click",unSelectAll)
        let button2=button.append("g").attr("id","button2")
        button2.append("text")
            .text("selectAll")
            .attr("dy","22px");
        button2.append('image').attr('width', 12)
            .attr('stroke', "black")
            .attr('height', 12)
            .attr('xlink:href', "https://www.transparenttextures.com/patterns/black-twill.png")
            .attr('x','85px')
            .attr('y','10px')
        button2.on("click",selectAll)
    }
    
    function unSelectAll(){
        filters=[];
        selectionChanged();
        updateSelection();
        //console.log("unselect All");
    }
    
    function selectAll(){
        filters=getAllFilterIds();
        selectionChanged();
        updateSelection()
        //console.log("select All");
    }
    
    //wird aufgerufen wenn Staaten ausgewählt werden mit liste der ausgewählten Staaten
    function changeData(state, data) {
        d3.select('#chart').selectAll("g").remove();
        createButtons();
        createArc(data);
        createTextLeftCorner(state);
    }
    
    function updateSelection(){
        var ids=getAllFilterIds();
        //console.log(filters);
        ids.forEach(function(d){
        var selection = d3.select("#u"+d);
        if(selection.data().length!=0){
            if(filters.indexOf(d)==-1){
                selection.attr("fill", selection.data()[0].data.color)
                }else{
                selection.attr("fill","url(#pattern-"+selection.data()[0].data.id+")")
                }
            }
        })
        var oberkat=d3.selectAll(".firstarc > path").data()
        oberkat.forEach(function(d){
            checkAllSelected(d.data.name)
        })
        
    }

    function createArc(data) {
        var radius = Math.min(width, height) / 2;            
       
         var pie = d3.pie()
            .value(function (d) {
                return d.value;
            })
            .sort(null);

        var innerchart= svg.append('g')
            .attr('transform', 'translate(' + (width / 2)  + ',' + (height / 2) + ')')
            .classed("firstarc",true);

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
                //return color(d.data.name);
                return "url(#pattern-"+d.data.id+")"
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
        updateSelection();
        //draw all unterkat charts
            drawSencondArcs(data);
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
    
    function getAllFilterIds(){
        var allIds=[];
        //console.log(filterdata);
        for (var i=0;i<filterdata.length;i++) {
            allIds.push(filterdata[i].id);
        }
        //console.log(allIds);
        return allIds;
    }
    
    function createTextCenter(name, value, percentage){
        svg.select(".text").remove();
        //TODO startposition des Textfeldes über g bestimmen!!
        var textfield= svg.append('g')
            .classed("text",true)
        
        textfield.append("text").selectAll("text").data([name,value,percentage+"%"])
                        .enter()
                        .append("tspan")
                        .text(function (d) {
                        return d;
                        })
                        .attr("x","50%")
                        .attr("y","45%")
                        .attr("dy",function (d,i) {
                            return  i*20;
                            })
                        .attr("text-anchor","middle")
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
        
        var outerchart= svg.append('g')
        .attr('transform', 'translate(' + (width /2) +',' + (height / 2) + ')')
        .classed("secondarc",true)
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr("class",function (d) {
            return (d.name);
        }).attr("visibility","hidden");
        
        
        
        // arc
        var outerArc = d3.arc()
            .innerRadius(width-6*thickness+1)
            .outerRadius(width-5*thickness+1);

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
            .attr('fill', function (d) {
                d.data.color=colorSub(d.data.name);
                createPattern(d.data);
                if(filters.indexOf(d.data.id)==-1){
                    return colorSub(d.data.name);
                }else{
                    return "url(#pattern-"+d.data.id+")";
                }
            })
            .attr('id', function (d) {
                return "u"+d.data.id;
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
            .on("click", selectUnselect);
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
    
    function selectUnselect(d){
        let el=d3.select(this);
        let id=el.data()[0].data.id
        let index = filters.indexOf(id);
            if(index==-1){
                //console.log("anwählen");
                filters.push(el.data()[0].data.id);
                //el.classed("pieselected",true);
                el.attr("fill","url(#pattern-"+el.data()[0].data.id+")")
            }else{
                //console.log("abwählen");
                filters.splice(index, 1);
                    //el.classed("pieselected",false);
                el.attr("fill", el.data()[0].data.color)
            }
        markPie(el);
        selectionChanged();
        checkAllSelected(d.data.oberkategorie);
    }
    
    function createPattern(data){
        var allpatterns= d3.select('defs').append('pattern')
                .attr('id', "pattern-" +data.id)
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
    
    function checkAllSelected(oberkategorie){
        var maincat= d3.select("#"+oberkategorie);
        var maincatnum = maincat.data()[0].data.array.length;
        var ids=maincat.data()[0].data.ids;
        
        let changed=false
        for(var i=0;i<ids.length;i++){
            if(filters.indexOf(ids[i])==-1){
                maincat.attr("fill", maincat.data()[0].data.color)
             //maincat.attr("fill","url(#pattern-"+maincat.data()[0].data.id+")")
                changed=true;
                break;
            }
        }
        if(!changed){
            //maincat.attr("fill", maincat.data()[0].data.color)
            maincat.attr("fill","url(#pattern-"+maincat.data()[0].data.id+")")
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
        return filters;
    }
    
    function getSelectedNames(){
        var names=[];
        filters.forEach(function(d){
            filterdata.forEach(function(e){
                if(d==e.id){
                    names.push(e.cause_short);
                }
            })
        })
        return names;
    }
    
    function selectionChanged(){
       filterSelected(filters);
    }
    
    that.getSelectedNames = getSelectedNames;
    that.getSelectedFilters = getSelectedFilters;
    that.changeData = changeData;
    that.init = init;
    return that;
};
