/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.menu = function (filterSelected,allFilterSelected,noFilterSelected,oberkategorieSelected,subcategorychanged) {
    "use strict";
    console.log($("#chart").width());
    
    const width = $("#chart").width(),
          height = width,
          thickness = 0.105 * width,
          color = d3.scaleOrdinal()
                .range(["rgb(255, 223, 223)", "rgb(255, 173, 173)", "rgb(255, 122, 122)", "rgb(255, 92, 92)","rgb(255, 52, 52)"]),
          colorSub = d3.scaleOrdinal()
                .range(["rgb(103, 103, 255)", "rgb(123, 123, 255)", "rgb(143, 143, 255)", "rgb(163, 163, 255)", "rgb(183, 183, 255)", "rgb(193, 193, 255)", "rgb(213, 213, 230)"]);
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
        createButtons();
    }
    
    function createButtons(){
        //Button: SelectAll mit rect umrandung
        //Button: RemoveAll mit image 
        //TODO schöner!!
        var button = svg.append('g')
        .attr('transform', 'translate(' + ((width/2)-46)  + ',' + ((height/2)-70) + ')')
        .classed("button",true)
        .classed("text45",true)
        let button1=button.append("g").attr("id","button1")
        button1.append("text")
            .text("Select None")
            .attr("dx","-5px")
            .attr("dy","10px")
            .style("fill", "#4e4e5e")
            .style("stroke-opacity", 0.1)
            .style("stroke", "black");
        button1.append('rect').attr('width', 12)
            .attr('stroke', "black")
            .attr('height', 12)
            .attr('fill','#fff')
            .attr('x','88px')
            .attr('y','-1px')
        button1.on("click",noFilterSelected)
        
        let button2=button.append("g").attr("id","button2")
        button2.append("text")
            .attr('transform', 'translate(' + 0 + ',' + ((height/2)-70) + ')')
            .text("Select All")
            .attr("dx","2px")
            .attr("dy","22px")
            .style("fill", "#4e4e5e")
            .style("stroke-opacity", 0.1)
            .style("stroke", "black");
        button2.append('rect').attr('width', 12)
            .attr('transform', 'translate(' + 0 + ',' + ((height/2)-70) + ')')
            .attr('stroke', "black")
            .attr('height', 12)
            .attr('fill','#fff')
            .attr('x','78px')
            .attr('y','10px')
        button2.append('image').attr('width', 12)
            .attr('transform', 'translate(' + 0 + ',' + ((height/2)-70) + ')')
            .attr('stroke', "black")
            .attr('width', 12)
            .attr('height', 12)
            .attr('xlink:href', "https://www.transparenttextures.com/patterns/black-twill.png")
            .attr('x','78px')
            .attr('y','10px')
        button2.on("click",allFilterSelected)
    }
   
    //wird aufgerufen wenn Staaten ausgewählt werden mit liste der ausgewählten Staaten
    function changeData(state, data) {
        createArc(data);
        createTextLeftCorner(state);
        
    }

    function createArc(data) {
        var radius = Math.min(width, height) / 2;            
       
         var pie = d3.pie()
            .value(function (d) {
                return d.value;})
            .sort(null);

        if (d3.select(".firstarc").empty()) {
            var innerChart = svg.append('g')
            .attr('transform', 'translate(' + (width / 2)  + ',' + (height / 2) + ')')
            .classed("firstarc",true);
            var path = innerChart.selectAll('path')
            .append("g")
            .data(pie(data))
            .enter()
            .append('path')
        }else{
            var innerChart=d3.select(".firstarc")
            var path=innerChart.selectAll('path')
                .data(pie(data))
        }

        var arc = d3.arc()
            .innerRadius(width - 7 * thickness)
            .outerRadius(width - 6 * thickness);
      
            path.attr('d', arc)
            .attr('fill', function (d) {
                d.data.color=color(d.data.name);
                createPattern(d.data);
                return color(d.data.name);
            })
            .attr('id', function (d) {
                return "o"+d.data.id;
            })
            .on("mouseover", function (d) {
                drawSecondArc(d.data.array)
                subcategorychanged(d.data);
                let el=d3.select(this);
                createTextCenter(d.data);
                el.classed("piehover",true);
            })
            .on("mouseout", function (d) {
               let el=d3.select(this);
                el.classed("piehover",false);
            })
            .on("click", function (d){
              oberkategorieSelected(d.data.id)  
            })
    }
    function hideSecondArc(){
        drawSecondArc([]);
    }
    //test secondArc animation
    function drawSecondArc(data){
        var radius = Math.min(width, height) / 2;
        // arc
        var outerArc = d3.arc()
            .innerRadius(width-6*thickness)
            .outerRadius(width-5*thickness+1);

        var pie = d3.pie()
                        .value(function (d) {
                            return d.value;
                        })
                        .sort(d3.descending);
        
        
        if (d3.select(".secondarc").empty()) {
            var outerChart= svg.append('g')
                .attr('transform', 'translate(' + (width / 2) + ',' +         (height / 2) + ')')
                .classed("secondarc",true);
            var path=outerChart.selectAll('path')
                .data(pie(data))
                .enter()
                .append('path')
        }else{
            var outerChart=d3.select(".secondarc")
            var path=outerChart.selectAll('path')
                .data(pie(data))
        }
        createOuterArcProp(path,outerArc);
            path.exit().remove();
            //wenn mehr dann hinzufügen
            path = path.enter().insert("path")
            createOuterArcProp(path,outerArc)
    }
    //test secondArc animation
    function createOuterArcProp(path,outerArc){
        path.attr('d', outerArc)
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
                createTextCenter(d.data);
            })
            .on("mouseout", function (d) {
               let el=d3.select(this);
                el.classed("piehover",false);
            })
            .on("click", function (d) {
               filterSelected(d3.select(this).data()[0].data.id);
            })
            .transition()
            .ease(d3.easeLinear)
            .duration(500)
            .attrTween("d", function(d){
                d.innerRadius=0;
                var i= d3.interpolate({startAngle:0, endAngle:0},d);
                return function(t){return outerArc(i(t));};
            });
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
    
    function createTextCenter(data){
        var dataArray=[data.name,data.value+" cases",data.percentage+" %"];
        if (d3.select(".text").empty()) {
            var textfield= svg.append('g')
                .classed("text",true).append("text").selectAll('tspan')
                .data(dataArray)
                .enter().append("tspan")
        }else{
            var textfield=d3.select(".text>text")
            textfield=textfield.selectAll('tspan')
            .data(dataArray)
        }
        
        textfield.text(function (d) {
                    return d;})
                .attr("x","50%")
                .attr("y","45%")
                .attr("dy",function (d,i) {
                    return  i * 20;})
                .attr("text-anchor","middle")
                
                .style("fill", "#4e4e5e")
                .style("stroke-opacity", 0.1)
                .style("stroke", "black");
    }
    
    function createTextLeftCorner(state){
        var state = d3.select("#"+state).data();
        svg.select(".textstate").remove();
        //TODO startposition des Textfeldes über g bestimmen!!
        var textfield = svg.append('g')
                .classed("textstate", true)
                .attr('transform', 'translate(50, 20 )')
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
                .style("fill", "#4e4e5e")
                .style("stroke-opacity", 0.1)
                .style("stroke", "black");
                   
    }


    function createPattern(data){
        if(d3.select("#pattern-"+data.id).empty()){
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
                    console.log(partsOberkategorein+" "+d.data.id);
                    el.classed("pieselected",true);
                }else{
                    el.classed("pieselected",false);
                }
                el.attr("fill", el.data()[0].data.color);
            }
        })
        updateViewOuterArc(categories);
    }
    
    function updateViewOuterArc(categories){
        var subCat=d3.selectAll(".secondarc > path").data()
        subCat.forEach(function(d){
            var el=d3.select("#u"+d.data.id);
            if(categories.indexOf(d.data.id)!=-1){
                el.attr("fill","url(#pattern-"+el.data()[0].data.id+")")
            }else{
                el.attr("fill", el.data()[0].data.color);
            }
        })
    }
    
    that.hideSecondArc=hideSecondArc;
    that.updateViewOuterArc = updateViewOuterArc;
    that.updateViewSelection = updateViewSelection;
    that.changeData = changeData;
    that.init = init;
    return that;
};
