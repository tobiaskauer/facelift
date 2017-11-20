
function openComparison(location, segnetMinMax) {
   // console.log(location)
    $("#overlay").fadeIn();
    $(".closeOverlay").click(function(){
        $("#overlay").fadeOut();
    })
    $(document).keyup(function(e) {
        if (e.keyCode == 27) { $("#overlay").fadeOut(); }   // esc
    });

    //identify and preload next items
    var combinationsArray = Object.keys(combinations);
   	var nextKey = combinationsArray.indexOf(location.Original.Key) + 1;
   	var prevKey = nextKey - 2;
   	if(nextKey == 82) {nextKey = 2}
   	if(prevKey == 0) {prevKey = combinationsArray.length -2}
   	var nextLocation = combinations[combinationsArray[nextKey]];
   	var prevLocation = combinations[combinationsArray[prevKey]];
   	new Image().src = "img/BostonBeautified/"+prevLocation.Original.Key+".jpg";
   	new Image().src = "img/BostonBeautified/"+prevLocation.Beautified.Key+".jpg";
   	new Image().src = "img/BostonBeautified/"+nextLocation.Original.Key+".jpg";
   	new Image().src = "img/BostonBeautified/"+nextLocation.Beautified.Key+".jpg";
   	d3.select(".prevLocation").on("click",function(){openComparison(prevLocation)});
   	d3.select(".nextLocation").on("click",function(){openComparison(nextLocation)});

   	//exchange images
   	d3.select(".description .key").text("#"+location.Original.Key)
    d3.selectAll(".images div").selectAll("*").remove()
    d3.selectAll(".images .c1").append("img").attr("class","Original").attr("src","img/BostonBeautified/"+location.Original.Key+".jpg")
    d3.selectAll(".images .c2").append("img").attr("class","Beautified").attr("src","img/BostonBeautified/"+location.Beautified.Key+".jpg")

    //get container width for comparison
    var listSize = $(".labelList").width();
    labelComparison(location, listSize);

    //all variables needed for the radarchart
	var radarSize = $(".radarChart").width(),
		margin = {top: radarSize/8, right: radarSize/8, bottom: radarSize/8, left: radarSize/8},
		width = Math.min(radarSize, window.innerWidth - 10) - margin.left - margin.right,
		height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20),
		radarChartOptions = {
		  w: width,
		  h: height,
		  margin: margin,
		  maxValue: 5,
		  levels: 5,
		  roundStrokes: true,
		  color: d3.scaleOrdinal().range(["#08B3F7","#F93A02"])
		},
	data = []; //parse location metrics into array readable for radarchart
	["Beautified", "Original"] // draw beautified version first, since it usually is bigger
	.forEach(function(version,i) {
		data[i] = [];
		Object.keys(location[version].Metrics).forEach(function(dimension) {
			var dimensions = {axis: dimension, value: location[version].Metrics[dimension]}
			data[i].push(dimensions)
		})
	})
	//Call function to draw the Radar chart
	RadarChart(".radarChart", data, radarChartOptions);
	segnetChart(location);

	//show Labels on Top
	function labelComparison(location, listSize) {
		d3.select(".comparison .labelList svg").remove();
		var svg = d3.select(".comparison .labelList").append("svg")
			.attr("width",listSize)
			.attr("height", 90)
		
		//scales
		var position = d3.scaleLinear().domain([0,sortedLabels[0].length]).range([30,listSize]); //give some space for text rotation
		var certaintyScale = d3.scaleLinear().range([0.1,1]).domain([0,5])
	
		//create groups for translation and text-elements for rotation
		var reverseLabels = sortedLabels[0].slice().reverse(); //we want the beauiful labels on the right side
		svg.selectAll("text").data(reverseLabels).enter()
		.append("g")
		.attr("transform",function(d,i){
			return "translate("+position(i)+",10)"
		})
		.append("text")
		.attr("id",function(d){return d.label})
		.text(function(d){return d.label;})
		.style("fill",function(d){return colorLabelComparison(d.mean)})
		.style("text-anchor","end")
		.style("font-weight","400")
		.style("font-size","9")
		.style("transform","rotate(-45deg)");
	
		//what are the current combinations labels?
		var locationLabels = {};
		locationLabels.Original = location.Original.Labels;
		locationLabels.Beautified = location.Beautified.Labels;

		//color Labels when image is hovered
		d3.selectAll(".comparison .Original, .comparison .Beautified")
		.on("mouseover",function(d){
			//change Label color
			var version = d3.select(this).attr("class")
			d3.selectAll(".labelList text").each(function(){
				var currentElement = d3.select(this)
				var currentLabel = currentElement.attr("id")
				var certainty = locationLabels[version].indexOf(currentLabel);
				if(certainty !== -1) {
					currentElement
					.style("opacity",certaintyScale(certainty))
					.style("fill","white")
					.style("font-weight","bold")
					.style("font-size","11")
				} else {
					currentElement.style("opacity",".2")
				}
			})
			
			d3.select(".radarChart #"+version+" path").style("fill-opacity", 1)//highlight radarblob
			d3.select(".segnetChart ."+version+"").style("opacity",1) //highlight segnet
			d3.select(".segnetChart .boxes").style("opacity",0) //highlight segnet
			d3.selectAll(".comparison img").style("opacity",.5)
			d3.select(this).style("opacity",1)
		})
		.on("mouseout",function(){
			d3.selectAll(".labelList text")
			.style("font-weight","400")
			.style("font-size","9")
			.style("opacity",1)
			.style("fill",function(d){
				return colorLabelComparison(d.mean)
			})
			d3.selectAll(".radarChart path").style("fill-opacity", .15)
			d3.selectAll(".segnetChart .Original, .segnetChart .Beautified").style("opacity",0)
			d3.select(".segnetChart .boxes").style("opacity",1) //highlight segnet
			d3.selectAll(".comparison img").style("opacity",1)
		})
	}
	
	function colorLabelComparison(value) {
		var meanMinMax = sortedLabels[1];
		var color = d3.scaleLinear().domain([meanMinMax[0],meanMinMax[1]]).range([d3.rgb("#F93A02"),d3.rgb("#08B3F7")]);
		return color(value)
	}



	function segnetChart(location) {
		//console.log(globalSegnetMinMax);
		var width = $(".comparison .segnetChart").width();
		d3.select(".comparison .segnetChart").selectAll("*").remove()
		var svg = d3.select(".comparison .segnetChart").append("svg").attr("width",width).attr("height",270)
		
		var versions = ["Original","Beautified"];
		//var segmentMinMax = [1000,0]; 

		//write all in array and calculate min and max values
		var allSegments = [];
		Object.keys(location.Original.Segnet).forEach(function(segment,i) {
			allSegments[i] = [];
			versions.forEach(function(version,j){
				var value = location[version].Segnet[segment];
				//if(value < segmentMinMax[0]) {segmentMinMax[0] = value}
				//if(value > segmentMinMax[1]) {segmentMinMax[1] = value}
	
				allSegments[i][0] = segment;
				if(typeof value === 'undefined') {
					allSegments[i][j+1] = 0
				} else {
					allSegments[i][j+1] = value;
				}
			})
		})

		//scales
		var scale = {};
		Object.keys(globalSegnetMinMax).forEach(function(segment){
			var size = globalSegnetMinMax[segment].length
			scale[segment] = d3.scaleLinear().domain([0,size]).range([30,width])
		})
		var scalePosition = d3.scaleLinear().domain([0,11]).range([20,250]); // y position
		
		//get difference of each segment
		allSegments.forEach(function(segment,i){
			var name = segment[0],
				beautified = segment[2],
				original= segment[1],
				allValues = globalSegnetMinMax[name]
			allSegments[i][3] = scale[name](allValues.indexOf(beautified)) - scale[name](allValues.indexOf(original))
		})
		var sortedSegments= allSegments.sort(function (a,b) {return  b[3] - a[3];}); // sort by decreasing relative difference 

		//lines + legend
		var axis = svg.append("g").attr("class","lines")
		axis.selectAll("line").data(sortedSegments).enter().append("line")
		.attr("x1",30)
		.attr("y1",function(d,i){return scalePosition(i)})
		.attr("x2",width)
		.attr("y2",function(d,i){return scalePosition(i)})
		.attr("stroke","white")
		.attr("opacity",".4")
		axis.selectAll("text").data(sortedSegments).enter().append("text")
		.attr("x",0)
		.attr("y",function(d,i){return scalePosition(i)})
		.text(function(d){return d[0]})
		.style("font-size",7)
		.style("fill","white")
		.attr("opacity",".7");

		//create gradients for increasing and decreasing bars
		var defs = svg.append("defs");
		var increase = defs.append("linearGradient").attr("id", "increase").attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");
			increase.append("stop").attr('class', 'start').attr("offset", "0%").attr("stop-color", "#F93A02").attr("stop-opacity", 1);
			increase.append("stop").attr('class', 'end').attr("offset", "100%").attr("stop-color", "#08B3F7").attr("stop-opacity", 1);
		var decline = defs.append("linearGradient").attr("id", "decline").attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");
			decline.append("stop").attr('class', 'start').attr("offset", "0%").attr("stop-color", "#08B3F7").attr("stop-opacity", 1);
			decline.append("stop").attr('class', 'end').attr("offset", "100%").attr("stop-color", "#F93A02").attr("stop-opacity", 1);
		
		//draw shapes for comparison
		svg.append("g").attr("class","boxes").selectAll("polygon").data(sortedSegments).enter()
		.append("polygon")
		.attr("fill",function(d){
			if(d[2] > d[1]) {return "url(#increase)"} else {return "url(#decline)"}
		})
		.attr("points",function(d,i){
			var y1 = scalePosition(i) - 5
			var y2 = y1 + 10;
			var x1 = scale[d[0]](globalSegnetMinMax[d[0]].indexOf(d[1])); // Original... I'm actually surprised this works
			var x2 = scale[d[0]](globalSegnetMinMax[d[0]].indexOf(d[2])); // Beautified
			return x1+","+y1+" "+x2+","+(y1 + 3)+" "+x2+","+(y2 - 3)+" "+x1+","+y2+" "+x1+","+y1
		})

		//draw circles for both versions
		versions.forEach(function(version,i){
			var circles = svg.append("g").attr("class",version).style("opacity",0)
			circles.selectAll("circle").data(sortedSegments).enter().append("circle")
			.attr("r",3)
			.style("fill",function(d){
				if(i){return "#08B3F7"}
					else {return "#F93A02"}
			})
			.attr("cx",function(d,j){
				return scale[d[0]](globalSegnetMinMax[d[0]].indexOf(d[i+1]))
			})
			.attr("cy",function(d,j){
				return scalePosition(j)
			})
		})



		/*svg.append("g").attr("class","values").selectAll("path").data(sortedSegments).enter()
		.append("path")
		.attr("fill",function(d){
			if(d[2] > d[1]) {return "url(#increase)"} else {return "url(#decline)"}
		})
		.attr("d",function(d,i){
			var y1 = scalePosition(i) - 2
			var y2 = y1 + 4;
			var x1 = scale[d[0]](globalSegnetMinMax[d[0]].indexOf(d[1])); // Original... I'm actually surprised this works
			var x2 = scale[d[0]](globalSegnetMinMax[d[0]].indexOf(d[2])); // Beautified
			return "M"+x1+" "+y1+" H "+x2+" V "+y2+" H "+x1+" L "+x1+" "+y1+""
		})*/



	



		//var scaleSegment = d3.scaleLinear().domain([0,segmentMinMax[1]]).range([0,width/2])
		//var segmentPosition = d3.scaleLinear().domain([0,allSegments.length]).range([20,270])
		//console.log(allSegments)
		/*
		//create bars
		versions.forEach(function(version,i){
			svg.append("g").attr("class",version).style("opacity",.7).selectAll("rect").data(allSegments).enter()
			.append("rect").attr("height",15)
			.attr("class",function(d){return d[0]})
			
			.attr("width",function(d){
				return scaleSegment(d[i+1])
			})
			.attr("y",function(d,j){
				return segmentPosition(j);
			})
			.style("fill",function(d){
				if(i){return "#08B3F7"}
					else {return "#F93A02"}
			})
			.attr("x",function(d){
				if(i){return width/2}
					else {return width/2 - scaleSegment(d[i+1])}
			})
		})

		//create legend
		svg.append("g").attr("class","legens").selectAll("text").data(allSegments).enter().append("text")
		.attr("text-anchor",function(d){
			if(width/2 +scaleSegment(d[2]) > (width * .75)) {
				return "end";
			} else {
				return "beginning"
			}
		})
		.attr("x",function(d){
			var correction;
			if(width/2 +scaleSegment(d[2]) > (width * .75)) {correction = -3} else {correction = 2}
			return width/2 + scaleSegment(d[2]) + correction
		})
		.attr("fill","white")
		.attr("font-size",9)
		.attr("font-weight",300)
		.attr("y",function(d,i){
				return segmentPosition(i) + 10;
			})
		.text(function(d){
			var plus = "";
			if(d[3] > 0) {plus = "+"}
			return plus+d[3]+'% '+d[0]
		})*/
	


	}
}






function RadarChart(id, data, options, size) {
	var cfg = {
	 w: 500,				//Width of the circle
	 h: 500,				//Height of the circle
	 margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
	 levels: 3,				//How many levels or inner circles should there be drawn
	 maxValue: 0, 			//What is the value that the biggest circle will represent
	 labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.15, 	//The opacity of the area of the blob
	 dotRadius: 4, 			//The size of the colored circles of each blog
	 opacityCircles: 0.1, 	//The opacity of the circles of each blob
	 strokeWidth: 2, 		//The width of the stroke around each blob
	 roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scaleOrdinal(d3.schemeCategory10)	//Color function
	};
	
	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if
	
	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
		
	var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		Format = d3.format(''),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
	
	//Scale for the radius
	var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);
		
	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();
	
	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
			.attr("class", "radar"+id);
	//Append a g element		
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
	
	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#7B7B7B")
		.style("stroke", "#7B7B7B")
		.style("fill-opacity", cfg.opacityCircles)
		//.style("filter" , "url(#glow)");

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "10px")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "9px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){return d})
		.call(wrap, cfg.wrapWidth);

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////
	
	//The radial line function
	var radarLine = d3.lineRadial()
		.curve(d3.curveBasisClosed)
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });
		
	if(cfg.roundStrokes) {
		radarLine.curve(d3.curveCardinalClosed)
	}
				
	//Create a wrapper for the blobs	
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper")
		.attr("id", function(d,i){
			if(i) {return "Original"}  else {return "Beautified"}
		});
			
	//Append the backgrounds	
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) {return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});
		
	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)");		
	
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		//.style("fill", function(d,i,j) { return cfg.color(j); })
		.style("fill", "white")
		.style("fill-opacity", 0.8);

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;
					
			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Format(d.value))
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});
		
	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);
	
	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap	
}
