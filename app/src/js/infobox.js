/* eslint-env browser  */

var Index = Index || {};
Index.infobox = function () {
    "use strict";
    
    const width = 440,
        height = 440,
          thickness=50,
          color = d3.scaleOrdinal()
                .range(["rgb(255, 77, 77)", "rgb(255, 102, 102)", "rgb(255, 128, 128)", "rgb(255, 153, 153)", "rgb(255, 179, 179)", "rgb(255, 204, 204)", "rgb(255, 230, 230)"]);
    var that = {},svg;


    function init() {
        console.log("init infobox");
        createSvg();
        
    }

    function createSvg(){
        svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }
    
    //wird aufgerufen wenn Staaten ausgewählt werden mit liste der ausgewählten Staaten
    function changeData(state, data) {
        createArc(data);
    }

    function createArc(data) {
        var radius = Math.min(width, height) / 2;
        //removes the existing arc
        d3.select('#chart').selectAll("g").remove();            
       
         var pie = d3.pie()
            .value(function (d) {
                return d.value;
            })
            .sort(null);

        var innerchart= svg.append('g')
            .attr('transform', 'translate(' + (width / 2) +
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
                return color(d.data.name);
            })
            .on("mouseover", function (d) {
                let el=d3.select(this);
                el.classed("pieselected",true);
                markPie(el);
            })
            .on("mouseout", function (d) {
               let el=d3.select(this);
                el.classed("pieselected",false);
            })
            .on("click", detailDataRequested);
        
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
    
    //http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    function markPie(el) {
        //el._groups[0][0].classList.add("selectedState");
        d3.selection.prototype.moveToFront = function () {
            return this.each(function () {
                this.parentNode.appendChild(this);
            });
        };
        el.moveToFront()
    }
    
    function createTextClicked(name, value){
        svg.select(".text").remove();
        var textfield= svg.append('g').classed("text",true)
            .attr('transform', 'translate(' + (width / 2) +
              ',' + (height / 2) + ')');
        textfield.append('text').html(name+" <br/> "+value);
    }


    function detailDataRequested(event){
        createTextClicked(event.data.name,event.data.value);
        
        var data =event.data.array;
        var radius = Math.min(width, height) / 2;
        
        var outerArc = d3.arc()
            .innerRadius(width-6*thickness)
            .outerRadius(width-5*thickness);

        var pie = d3.pie()
            .value(function (d) {
                return d.value;
            })
            .sort(null);
        
        svg.select(".secondarc").remove();
        var outerchart= svg.append('g').classed("secondarc",true)
            .attr('transform', 'translate(' + (width / 2) +
              ',' + (height / 2) + ')');
        
        var path = outerchart.selectAll('path')
            .append("g")
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', outerArc)
            .attr('fill', function (d) {
                return color(d.data.name);
            })
            .on("mouseover", function (d) {
                let el=d3.select(this);
                el.classed("pieselected",true);
                markPie(el);
            })
            .on("mouseout", function (d) {
               let el=d3.select(this);
                el.classed("pieselected",false);
            })
        
    }
    
    that.changeData = changeData;
    that.init = init;
    return that;
};
