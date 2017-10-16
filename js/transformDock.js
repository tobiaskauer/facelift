var stages = [
	  		{name: "first", id: "b3_0", labels: ["im a list element","bar"]},
	  		{name: "second", id: "b3_1", labels: ["foo","bar"]},
	  		{name: "last", id: "b3_2", labels: ["foo","bar"]}
	  	],

	  	labels = [
	  		["im a new label","im another label"],
	  		["im a new label on second stage","im another label in second stage"],
	  		["im a new label, im here too","im also another label"],
	  	]

		metrics = [
			{name: "walkability", values: [1, 1.2, 4, 5]},
			{name: "openness", values: [2, 4, 4.3, 4.4]},
			{name: "greenspace", values: [1, 4, 4.4, 7]},
			{name: "complexity", values: [1, 1.2, 4, 10]},
			{name: "landmarks", values: [2, 4, 4.3, 8]}
		],


	  	picHeight = document.getElementById('u3').offsetHeight,
	  	colWidth = document.getElementById('metricVis').offsetWidth;
		svg = d3.select('#metricVis').append('svg').style("height",picHeight).style("width",colWidth)
	  
	  	//add groups and labels for circles
	  	circles = svg.selectAll('g').data(metrics).enter().append('g')
	  	.attr('transform', function(d, i) {
	  		return 'translate(0,'+ (i * (picHeight /metrics.length) + (picHeight / metrics.length / 2))  +')'
	  	})
	  	.append("text").text(function(d) {return d.name;})
	  	.attr("class","metricLabel")
	  	.style("fill","white")
	  	.attr('transform',function(d){return 'translate('+colWidth / 2+',0)'});

	  	// create and update circles
	  	updateCircles(0);
	  	function updateCircles(number) {
	  		d3.selectAll('g').data(metrics).append("circle")
	  		.attr("class","metricCircle")
	  		.attr("id",function(d){return d.name + number;})
	  		.attr("cx",colWidth / 2)
	  		.attr("cy",-8)
	  		.attr("r",function(d) {return d.values[number]*10+"px"})
	  	}
	  	
		//exchange images while scrolling, trigger circle update
		var slideDuration = 300,
			slideOffset = 150;
		stages.forEach(function(stage,i) {
			var number = i+1;
			new ScrollMagic.Scene({
				triggerElement: "#triggerTransformDock",
				duration: slideDuration,
				offset: slideOffset + (i * slideDuration)
			})
			.setTween("#"+stage.id, 0.5, {opacity: 1}) // trigger a TweenMax.to tween
			//.addIndicators({name: stage.name + " (duration: 300)"}) // add indicators (requires plugin)
			.triggerHook(0)
			.addTo(controller)
			.on("enter", function(event) {
				if(event.scrollDirection == "FORWARD") {updateCircles(number)}
			})
			.on("leave",function(event) {
				if(event.scrollDirection == "REVERSE") {
					metrics.forEach(function(metric,i) {item = d3.select("#"+metric.name + number).remove()})
				}
			});
		})

		//create and update labels
		updateLabels(0);
		function updateLabels(stage){
			//var labelsVar = d3.select(".labelVis .labels li");
			//console.log(labelsVar);
			d3.selectAll("li").data(labels[stage])
			//.exit()
			.append("li").text(function(d) {console.log(d); return d})
		}