function labelBeauty(){
	var width = $(".labelBeauty").width();
	var margin = width/10;
	var height = 800
	var svg = d3.select(".labelBeauty").append("svg").attr("width",width).attr("height",height)
	
	var trueSkillMinMax = [1000,0];
	Object.keys(combinations).forEach(function(key){
		["Original","Beautified"].forEach(function(version) {
			var trueSkill = combinations[key][version].trueSkill
			if(trueSkill < trueSkillMinMax[0]) {trueSkillMinMax[0] = trueSkill}
			if(trueSkill > trueSkillMinMax[1]) {trueSkillMinMax[1] = trueSkill}
		})
	})
	trueSkillScale = d3.scaleLinear().domain([trueSkillMinMax[0],trueSkillMinMax[1]]).range([200,700])

	var originalsG = svg.append("g").attr("class","originals")
	originalsG.selectAll("circle").data(Object.keys(combinations)).enter()
	.append("circle")
	.attr("r",5)
	.attr("fill","white")
	.style("opacity",0.1)
	.attr("cx",margin)
	.attr("cy",function(d){
		return trueSkillScale(combinations[d].Original.trueSkill)
	})

	var allLabels = getLabelList(labels,3);
	var labelPosition = d3.scaleLinear().domain([allLabels[1][0],allLabels[1][1]]).range([margin,height-margin])
	//var labelPosition = d3.scaleLinear().domain([0,allLabels[0].length]).range([margin,height-margin])
	var labelSize = d3.scaleLog().domain([allLabels[2][0],allLabels[2][1]]).range([5,16])
	var labelColor = d3.scaleLinear().domain([allLabels[1][0],allLabels[1][1]]).range([d3.rgb("#F93A02"),d3.rgb("#08B3F7")])
	var labelsG = svg.append("g").attr("class","labels")
	var reverseLabels = allLabels[0].slice().reverse()
	labelsG.selectAll("text").data(reverseLabels).enter().append("text")
	.attr("class",function(d){return d.label})
	.text(function(d){return d.label})
	.attr("fill",function(d,i){return labelColor(d.mean)})
	.attr("text-anchor","middle")
	.style("z-index",999)
	//.attr("font-weight","bold")
	.style("font-size",function(d,i){
		return labelSize(d.total)
	})
	.attr("x",width/2)
	.attr("y",function(d,i){return labelPosition(d.mean)})
	//.attr("y",function(d,i){return labelPosition(i)})
	.on("mouseover",function(d){
		d3.selectAll(".labelBeauty path."+d.label).attr("opacity","0.5")
	})
	.on("mouseout",function(d){
		d3.selectAll(".labelBeauty path."+d.label).attr("opacity","0.1")
	})


	var beautifiedG = svg.append("g").attr("class","beautified")
	beautifiedG.selectAll("circle").data(Object.keys(combinations)).enter()
	.append("circle")
	.attr("r",5)
	.attr("opacity",.1)
	.attr("fill","white")
	.attr("cx",width-margin)
	.attr("cy",function(d){
		return trueSkillScale(combinations[d].Beautified.trueSkill)
	})

	var labelListArray = [];
	allLabels[0].forEach(function(element){
		labelListArray.push(element.label)
	})


	Object.keys(combinations).forEach(function(key){
		var originalPaths = originalsG.append("g").attr("class",key)
		originalPaths.selectAll("path").data(combinations[key].Original.Labels).enter().append("path")
		.attr("class",function(d){return d})
		.attr("stroke","#fff")
		.attr("opacity",function(d,i){return "0.0"+i*2})
		.style("z-index",1)
		.attr("fill","none")
		.attr("stroke-width","1")
		.attr("d",function(d){
			if(labelListArray.indexOf(d) !== -1){
				var x1 = margin;
				var y1 = trueSkillScale(combinations[key].Original.trueSkill) ;
				var x2 = d3.select(".labels ."+d).attr("x")
				var y2 = d3.select(".labels ."+d).attr("y") -4
				return 	"M"+x1+" "+y1+" C "+(parseInt(x1)+100)+" "+y1+", "+(parseInt(x2)-100)+" "+y2+", "+x2+" "+y2
			}
		});

		var beautifulPaths = beautifiedG.append("g").attr("class",key)
		beautifulPaths.selectAll("path").data(combinations[key].Beautified.Labels).enter().append("path")
		.attr("class",function(d){return d})
		.attr("stroke","#fff")
		.attr("opacity",function(d,i){return "0.0"+i*2})
		.style("z-index",1)
		.attr("fill","none")
		.attr("stroke-width","1")
		.attr("d",function(d){
			if(labelListArray.indexOf(d) !== -1){
				var x1 = width-margin;
				var y1 = trueSkillScale(combinations[key].Beautified.trueSkill);
				var x2 = d3.select(".labels ."+d).attr("x")
				var y2 = d3.select(".labels ."+d).attr("y") -4
				return 	"M"+x1+" "+y1+" C "+(parseInt(x1)-100)+" "+y1+", "+(parseInt(x2)+100)+" "+y2+", "+x2+" "+y2
			}
		});
	})
}