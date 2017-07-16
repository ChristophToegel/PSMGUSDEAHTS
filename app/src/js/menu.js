/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.menu = function (filterSelected,allFilterSelected,noFilterSelected,oberkategorieSelected) {
    "use strict";
    console.log($("#chart").width());
    
    const width = $("#chart").width(),
          height = width,
          thickness = 0.105 * width,
          color = d3.scaleOrdinal()
                .range(["rgb(255, 62, 62)","rgb(255, 82, 82)","rgb(255, 102, 102)", "rgb(255, 128, 128)", "rgb(255, 153, 153)", ]),
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
        button1.on("click",noFilterSelected)
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
        button2.on("click",allFilterSelected)
    }
   
    //wird aufgerufen wenn Staaten ausgewählt werden mit liste der ausgewählten Staaten
    function changeData(state, data) {
        d3.select('#chart').selectAll("g").remove();
        createButtons();
        createArc(data);
        createTextLeftCorner(state);
    }

    function createArc(data) {
        var radius = Math.min(width, height) / 2;            
       
         var pie = d3.pie()
            .value(function (d) {
                return d.value;})
            .sort(null);

        var innerChart= svg.append('g')
            .attr('transform', 'translate(' + (width / 2)  + ',' + (height / 2) + ')')
            .classed("firstarc",true);

        var arc = d3.arc()
            .innerRadius(width - 7 * thickness)
            .outerRadius(width - 6 * thickness);
      
        var path = innerChart.selectAll('path')
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
                return "o"+d.data.id;
            })
            .on("mouseover", function (d) {
                showSecondArc(d);
                let el=d3.select(this);
                createTextCenter(d.data.value,d.data.name, d.data.percentage);
                el.classed("piehover",true);
            })
            .on("mouseout", function (d) {
               let el=d3.select(this);
                el.classed("piehover",false);
            })
            .on("click", function (d){
              oberkategorieSelected(d.data.id)  
            })
            .transition()
            .ease(d3.easeLinear)
            .duration(600)
            .attrTween("d", function(d){
                d.innerRadius=0;
                var i= d3.interpolate({startAngle:0, endAngle:0},d);
                return function(t){return arc(i(t));};
            });
        //draw all unterkat charts
            drawSecondArcs(data);
    }
    
    //clickLogic 
    function showSecondArc(d){
        //console.log(d);
        var selected = d3.selectAll('g[visibility = visible]');
        //element schon ausgewählt
        if (selected.data().length != 0){
            //gleiches element
            if (selected.data()[0].name == d.data.name){
               // d3.selectAll("."+d.data.name)           
                //    .attr("visibility","hidden");
            } else {
                //unterschiedlich
                d3.selectAll("." + selected.data()[0].name).attr("visibility","hidden");
                d3.selectAll("." + d.data.name).attr("visibility","visible")
            }
        } else {
        //nichts ausgewählt
        d3.selectAll("." + d.data.name).attr("visibility","visible")
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
        var textfield= svg.append('g')
                .classed("text",true)
        
        textfield.append("text").selectAll("text")
                .data([name,value,percentage+"%"])
                .enter()
                .append("tspan")
                .text(function (d) {
                    return d;})
                .attr("x","50%")
                .attr("y","45%")
                .attr("dy",function (d,i) {
                    return  i * 20;})
                .attr("text-anchor","middle")
                .style("fill", "black")
                .style("stroke-opacity", 0.4)
                .style("stroke", "black");
    }
    
    function createTextRightCorner(name, percentage){
        svg.select(".textselected").remove();
        //TODO startposition des Textfeldes über g bestimmen!!
        var textfield = svg.append('g')
                .classed("textselected",true)
                .attr('transform', 'translate(335, 20 )');
        
        textfield.append("text").selectAll("text")
                .data([name,percentage])
                .enter()
                .append("tspan")
                .text(function (d) {
                    return d;})
                .attr("x",function (d,i) {
                    return 0;})
                .attr("y",function (d,i) {
                    return i * 20;});
    }
    
    function createTextLeftCorner(state){
        var state = d3.select("#"+state).data();
        svg.select(".textstate").remove();
        //TODO startposition des Textfeldes über g bestimmen!!
        var textfield= svg.append('g').classed("textstate",true)
            .attr('transform', 'translate(50, 20 )');
        textfield.append("text")
                .selectAll("text")
                .data(state)
                .enter()
                .append("tspan")
                .text(function (d) {
                    return d.statename;})
                .attr("x",function (d,i) {
                    return - 50;})
                .attr("y",function (d,i) {
                            return 0;})
                .style("fill", "black")
                .style("stroke-opacity", 0.5)
                .style("stroke", "black");
                   
    }


    function drawSecondArcs(data){
        //für jede oberkategorie eigenen chart zeichnen!
        var radius = Math.min(width, height) / 2;
        
        var outerChart= svg.append('g')
                .attr('transform', 'translate(' + (width / 2) + ',' +         (height / 2) + ')')
                .classed("secondarc",true)
                .selectAll('g')
                .data(data)
                .enter()
                .append('g')
                .attr("class",function (d) {
                    return(d.name);})
                .attr("visibility","hidden");
        
        // arc
        var outerArc = d3.arc()
            .innerRadius(width-6*thickness+1)
            .outerRadius(width-5*thickness+1);

        var pie = d3.pie()
                        .value(function (d) {
                            return d.value;
                        })
                        .sort(d3.descending);
        
        var path = outerChart.selectAll('path')
            .data(function(d) {
                return pie(d.array);})
            .enter()
            .append('path')
            .attr('d', outerArc)
            //zu beginn alle der unterkategorie ausgewählt
            .attr('fill', function (d) {
                d.data.color=colorSub(d.data.name);
                createPattern(d.data);
                return colorSub(d.data.name);
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
            .on("click", function (d) {
               filterSelected(d3.select(this).data()[0].data.id);
            })
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
    
    //muss arc bekommen 
    function pieAnimation(d){
        //var arc = d3.arc()
        //    .innerRadius(width-6*thickness+2)
        //    .outerRadius(width-5*thickness+2);
        d.innerRadius = 0;
        var i = d3.interpolate({startAngle:0, endAngle:0},d);
        return function(t){return arc(i(t));};
    }
    
    function updateViewSelection(oberkategorien,categories,partsOberkategorein){
        //alle oberkateogrien
        var allOberkat=d3.selectAll(".firstarc > path").data()
        allOberkat.forEach(function(d){
            //console.log(d.data.id);
            var el=d3.select("#o"+d.data.id);
            if(oberkategorien.indexOf(d.data.id)!=-1){
                 el.classed("pieselected",false);
                el.attr("fill","url(#pattern-"+el.data()[0].data.id+")")
            }else{
                if(partsOberkategorein.indexOf(d.data.id)!=-1){
                    el.classed("pieselected",true);
                }else{
                    el.classed("pieselected",false);
                }
                el.attr("fill", el.data()[0].data.color);
            }
        //console.log(oberkategorien);
        //alle categorien
        var allkat=d3.selectAll("."+d.data.name+"> path").data()
        allkat.forEach(function(d){
            //console.log(d.data.id);
            var el=d3.select("#u"+d.data.id);
            
            if(categories.indexOf(d.data.id)!=-1){
                el.attr("fill","url(#pattern-"+el.data()[0].data.id+")")
            }else{
                el.attr("fill", el.data()[0].data.color);
            }
        })
        })
    }
    
    
    that.updateViewSelection=updateViewSelection;
    that.changeData = changeData;
    that.init = init;
    return that;
};
