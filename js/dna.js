function elementDNA(elements) {
	var width = $(".elementDNA").width();
	var height = 200
	var svg = d3.select(".elementDNA").append("svg").attr("width",width).attr("height",height)
	
	//scales
	var xPos = d3.scaleLinear().domain([0,Object.keys(elements).length]).range([0,width])
	var yPos = d3.scaleLinear().domain([0,elements.Sky.values.Change.length]).range([12,height])
	
	var ordered_elements = ["Sign Symbol","Bike","Tree","Pavement","Pole","Vehicle","Fence","Building","Sky","Road Marking","Pedestrian","Road"]

	//Object.keys(elements).forEach(function(element,i) {
	ordered_elements.forEach(function(element,i) {
		//draw DNA
		var group = svg.append("g").attr("class","values "+element)
		group.selectAll("rect").data(elements[element].values.Change).enter()
		.append("g").attr("class",function(d,j){return "combination"+(j+1)}).append("rect")
		.attr("width",width/Object.keys(elements).length)
		.attr("height",height/elements.Sky.values.Change.length)
		.attr("class",function(d,j){return "combination"+(j+1)})
		.attr("x",function(d,j){return xPos(i)})
		.attr("y",function(d,j){return yPos(j)})
		.attr("fill",function(d){
			normalized = 2* ((d - elements[element].minChange) / (elements[element].maxChange - elements[element].minChange)) -1
			if(normalized > 0) {return "#08B3F7"} else {return "#F93A02"}
			//if(d > 0) {return "#08B3F7"} else {return "#F93A02"}
		})
		.style("opacity",function(d,i){
			normalized = 2* ((d - elements[element].minChange) / (elements[element].maxChange - elements[element].minChange)) -1
			return Math.abs(normalized)
			//return Math.abs(d) * 5
		})
		.on('mouseover', function (d,i){
			d3.selectAll(".dna .values g").style("opacity",.2)
			d3.selectAll(".dna g."+d3.select(this).attr("class")).style("opacity",1)
		})
		.on('mouseout', function (d,i){
			d3.selectAll(".dna .values g").style("opacity",1)
		})

		//labels
		var labels = svg.append("g").attr("class","labels")
		labels.selectAll("text").data(ordered_elements).enter().append("text")
		.attr("x",function(d,i){
			return xPos(i)+ (width/Object.keys(elements).length / 2)
		})
		.attr("y",8)
		.attr("fill","darkgrey")
		.style("font-size",8)
		.attr("text-anchor","middle")
		.text(function(d){return d})
	})
}

function metricDNA(metrics) {
	var width = $(".metricDNA").width();
	var height = 200
	var svg = d3.select(".metricDNA").append("svg").attr("width",width).attr("height",height)

	var xPos = d3.scaleLinear().domain([0,Object.keys(metrics).length]).range([0,width])
	var yPos = d3.scaleLinear().domain([0,metrics.Openness.length]).range([12,height])

	ordered_metrics = ["GreenCover","Complexity","Walkability","Openness","Landmarks"]

	//Object.keys(metrics).forEach(function(metric,i) {
	ordered_metrics.forEach(function(metric,i) {
		//draw DNA
		var group = svg.append("g").attr("class","values "+metric)
		group.selectAll("rect").data(metrics[metric]).enter()
		.append("g").attr("class",function(d,j){return "combination"+(j+1)}).append("rect")
		.attr("width",width/Object.keys(metrics).length)
		.attr("height",height/metrics.Openness.length)
		.attr("class",function(d,j){return "combination"+(j+1)})
		.attr("x",function(d,j){return xPos(i)})
		.attr("y",function(d,j){return yPos(j)})
		.attr("fill",function(d){
			if(d > 0) {return "#08B3F7"} else {return "#F93A02"}
		})
		.style("opacity",function(d){

			return Math.abs(d) / 5
		})
		.on('mouseover', function (d,i){
			d3.selectAll(".dna .values g").style("opacity",.2)
			d3.selectAll(".dna g."+d3.select(this).attr("class")).style("opacity",1)
		})
		.on('mouseout', function (d,i){
			d3.selectAll(".dna .values g").style("opacity",1)
		})

		//labels
		var labels = svg.append("g").attr("class","labels")
		labels.selectAll("text").data(ordered_metrics).enter().append("text")
		.attr("x",function(d,i){
			return xPos(i)+ (width/Object.keys(metrics).length / 2)
		})
		.attr("y",8)
		.attr("fill","darkgrey")
		.style("font-size",8)
		.attr("text-anchor","middle")
		.text(function(d){return d})
	})
}