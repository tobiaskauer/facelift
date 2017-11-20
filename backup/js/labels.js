
	//Get Labels, calculate mean value and push to array (which is sortable)
	function getLabelList(labels, treshold) {
		var labelList = [];
	
		var meanMinMax = [1000,0]
		var totalMinMax = [1000,0]
		Object.keys(labels).forEach(function(label){
			//calculate mean TrueSkill Score for each label
			var mean = [];
			Object.keys(labels[label]).forEach(function(key){
				var trueSkill = labels[label][key].trueSkill;
				mean.push(trueSkill);
			})
	
			//write array of labels
			if(mean.length > treshold) { //5 is a random value to reduce number of labels with not enough frequency (currently resulting in ~50 labels)
				var avg = mean.reduce(function(a,b){return a+b},0) / mean.length
				if(avg < meanMinMax[0]) {meanMinMax[0] = avg}
				if(avg > meanMinMax[1]) {meanMinMax[1] = avg}
	
				labelList.push({
					"label": label,
					"mean": avg,
					"total": mean.length
				})
	
				//find min/max for scale
				if(mean.length < totalMinMax[0]) {totalMinMax[0] = mean.length}
				if(mean.length > totalMinMax[1]) {totalMinMax[1] = mean.length}
			}
		})
	
		//sort labels descending by mean TrueSkill
		var sortedLabels = labelList.sort(function (a,b) {return  b.mean - a.mean;});
	
	
		return [sortedLabels, meanMinMax, totalMinMax]
	}
	
	function getLabelSize(value, totalMinMax, logScale) {
		var scale;
		if(logScale) {
			scale = d3.scaleLog().domain([totalMinMax[0],totalMinMax[1]]).range([5,20]);
		} else {
			scale = d3.scaleLinear().domain([totalMinMax[0],totalMinMax[1]]).range([5,20]);
		}
		return scale(value);
	}
	
	//create list from array with d3		
	function createList(labelList) {
		var sortedLabels = labelList[0],
			meanMinMax = labelList[1],
			totalMinMax  = labelList[2];
	
		//Scales, that calculate color / font size for list items
		var scaleMean = d3.scaleLinear().domain([meanMinMax[0],meanMinMax[1]]).range([d3.rgb("#F93A02"),d3.rgb("#08B3F7")]);
		
	
		//clear old list and create a new one
		d3.select("#labels ul").remove();
		var ulLabels = d3.select("#labels").append("ul");
	
		ulLabels.selectAll("li").data(sortedLabels).enter().append("li")
		.text(function(d){
			return d.label
		})
		.style("color",function(d){return scaleMean(d.mean)})
		.style("font-size",function(d){
			return getLabelSize(d.total,totalMinMax, true)+"px";
		})
		.style("line-height",function(d){
			return getLabelSize(d.total,totalMinMax, true)+"px";
		})
		.attr("id",function(d){return d.label})
	
		//If hovered, toggle "active" class and trigger function, that collects mouseOver-actions
		.on("mouseover",function(d){
			d3.select(this).classed("active",true);
			mouseOverLabel(d.label);
		})
		.on("mouseout",function(d){
			d3.select(this).classed("active",false);
		})
	
		//if clicked, toggle "hotLabel"-class as add current label to list of hot labels.
		.on("click",function(d){
			currentLabel = d3.select(this);
			if(currentLabel.classed("hotLabel")) {
				var position = hotLabels.indexOf(d.label);
				splice = hotLabels.splice(position,1);
	
				currentLabel.classed("hotLabel",false)
			} else {
				hotLabels.push(d.label);
				currentLabel.classed("hotLabel",true)
			}
		})
	} 
