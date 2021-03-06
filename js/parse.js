//go through all possible labels and give less intensity to less certain labels
function parseLabels(collation) {
	var labels = {};
	Object.keys(collation).forEach(function(key) {	
		var labelArray = collation[key].metrics.Top5PlaceLabels;
		if(typeof labelArray !== "undefined") {
			labelArray.forEach(function(label,i) {
				var label = label.replace(/\//g, '_').slice(3);
				if(Object.keys(labels).indexOf(label) === -1) {labels[label] = [];}
				labels[label][key] = {};
				labels[label][key].Certainty = (6-i);
				labels[label][key].trueSkill = collation[key].trueSkill;
				labels[label][key].LatLong = new L.LatLng(
   					collation[key].location.lat,
   					collation[key].location.long,
   					labels[label][key].Certainty
   				);
			})
		}
	});
	return labels;
}

//put together all necessary informations from various jsons into one Oject (combinations)
function parseCombinations(collation) {
	var combinations = {};
	Object.keys(collation).forEach(function(key){
		if(
			collation[key].beautified.flag //if the location is beautifiable
			&& key != collation[key].beautified.XformedKeys[0][0]//this condition could be optimized - take first alternative if keys are the same
			&& collation[key].trueSkill < collation[collation[key].beautified.XformedKeys[0][0]].trueSkill) { //only take combinations where the beautified trueskill is bigger than the original trueskill
			//define object and assign key
			combinations[key] = { LatLng: {}, Original: {}, Beautified: {}}
			combinations[key].LatLng = new L.LatLng(
   				collation[key].location.lat,
   				collation[key].location.long
   			);

   			var segments = ["Sky", "Building", "Pole", "Road Marking", "Road", "Pavement", "Tree", "Sign Symbol", "Fence", "Vehicle", "Pedestrian", "Bike"]
   			//all original metrics / segments
			var Original = combinations[key].Original
			Original.Key = key; //redundant, but i like it
   			Original.Metrics = {};
   			Original.Metrics.GreenCover = collation[key].metrics.GreenCover;
   			Original.Metrics.Openness = collation[key].metrics.Openness;
			Original.Metrics.Landmarks = collation[key].metrics.TnomyScores.Landmark;
			Original.Metrics.Walkability = collation[key].metrics.TnomyScores.Walkable;
			Original.Metrics.Complexity = collation[key].metrics.VisualComplexity;
			Original.trueSkill = collation[key].trueSkill;
			Original.Segnet = {};
			segments.forEach(function(segment){
				Original.Segnet[segment]= collation[key].metrics.segnet[segment]
			})
			Original.Labels = [];
			collation[key].metrics.Top5PlaceLabels.forEach(function(label){
				Original.Labels.push(label.replace(/\//g, '_').slice(3))
			})
	
   			//all beautified metrics / segments
			var Beautified = combinations[key].Beautified
			Beautified.Key = collation[key].beautified.XformedKeys[0][0];
   			Beautified.Metrics = {};
   			Beautified.Metrics.GreenCover = collation[Beautified.Key].metrics.GreenCover;
   			Beautified.Metrics.Openness = collation[Beautified.Key].metrics.Openness;
			Beautified.Metrics.Landmarks = collation[Beautified.Key].metrics.TnomyScores.Landmark;
			Beautified.Metrics.Walkability = collation[Beautified.Key].metrics.TnomyScores.Walkable;
			Beautified.Metrics.Complexity = collation[Beautified.Key].metrics.VisualComplexity;
			Beautified.trueSkill = collation[Beautified.Key].trueSkill;
			Beautified.Segnet = {};
			segments.forEach(function(segment){
				Beautified.Segnet[segment]= collation[Beautified.Key].metrics.segnet[segment]
			})
			Beautified.Labels = [];
			collation[Beautified.Key].metrics.Top5PlaceLabels.forEach(function(label){
				Beautified.Labels.push(label.replace(/\//g, '_').slice(3))
			})
		}
	})
	//console.log(combinations);
	return combinations;
}

//parse global extreme values of all segnet value changes
function segnetMinMax(combinations) {
	var allSegnets = {
		"Sky": {},"Building": {},"Pole": {},"Road Marking": {},"Road": {},"Pavement": {},"Tree": {},"Sign Symbol": {},"Fence": {},"Vehicle": {},"Pedestrian": {},"Bike": []
	};
	
	Object.keys(allSegnets).forEach(function(segment) {
		["Original","Beautified"].forEach(function(version) {
			allSegnets[segment][version] = []
			allSegnets[segment].Change = []
		})
		Object.keys(combinations).forEach(function(key){
			var original = combinations[key].Original.Segnet[segment];
			if(typeof original === 'undefined') {original = 0};
			var beautified = combinations[key].Beautified.Segnet[segment];
			if(typeof beautified === 'undefined') {beautified = 0};
			var change = beautified - original
			
			allSegnets[segment].Original.push(original)
			allSegnets[segment].Beautified.push(beautified)
			allSegnets[segment].Change.push(change)
		})
	})

	var minMax = {};
	Object.keys(allSegnets).forEach(function(segment) {
		minMax[segment] = {}
		minMax[segment].values = allSegnets[segment] //only necessary for DNA of
		minMax[segment].minChange = allSegnets[segment].Change.reduce(function(a, b) {return Math.min(a, b);});
		minMax[segment].maxChange = allSegnets[segment].Change.reduce(function(a, b) {return Math.max(a, b);});

		var min = [
			allSegnets[segment].Original.reduce(function(a, b) {return Math.min(a, b)}),
			allSegnets[segment].Beautified.reduce(function(a, b) {return Math.min(a, b)})
		]
		minMax[segment].min = min.reduce(function(a, b) {return Math.min(a, b)})

		var max = [
			allSegnets[segment].Original.reduce(function(a, b) {return Math.max(a, b)}),
			allSegnets[segment].Beautified.reduce(function(a, b) {return Math.max(a, b)})
		]
		minMax[segment].max = max.reduce(function(a, b) {return Math.max(a, b)})
	})
	return minMax;
}

function allChanges(combinations) {
	var dimensions = {
		'Metrics': {
			'GreenCover': {},
			'Openness': {},
			'Landmarks': {},
			'Walkability': {},
			'Complexity': {}
		},
		'Segnet': {
			'Sky': {},
			'Building': {},
			'Pole': {},
			'Road Marking': {},
			'Road': {},
			'Pavement': {},
			'Tree': {},
			'Sign Symbol': {},
			'Fence': {},
			'Vehicle': {},
			'Pedestrian': {},
			'Bike': {}
		}
	}

	Object.keys(dimensions).forEach(function(dimension){
		var maxDimension = 0
		Object.keys(dimensions[dimension]).forEach(function(element){
			var elements = dimensions[dimension]
			var versions = ["Original","Beautified"]

			versions.forEach(function(version) {
				elements[element][version] = []
				elements[element].Change = []
			})
			Object.keys(combinations).forEach(function(key){
				var original = combinations[key].Original[dimension][element];
				if(typeof original === 'undefined') {original = 0};
				var beautified = combinations[key].Beautified[dimension][element];
				if(typeof beautified === 'undefined') {beautified = 0};
				var change = beautified - original
				
				elements[element].Original.push(original)
				elements[element].Beautified.push(beautified)
				elements[element].Change.push(change)
				//get biggest value within dimension
				if(change > maxDimension) {maxDimension = change}
			})
		})

		var minMax = {};
		Object.keys(dimensions[dimension]).forEach(function(element){
			var elements = dimensions[dimension]
			minMax[element] = {}
			minMax[element].values = 	elements[element] //only necessary for DNA of
			minMax[element].minChange = 	elements[element].Change.reduce(function(a, b) {return Math.min(a, b);});
			minMax[element].maxChange = 	elements[element].Change.reduce(function(a, b) {return Math.max(a, b);});
		//
			var min = [
				elements[element].Original.reduce(function(a, b) {return Math.min(a, b)}),
				elements[element].Beautified.reduce(function(a, b) {return Math.min(a, b)})
			]
			minMax[element].min = min.reduce(function(a, b) {return Math.min(a, b)})
		//
			var max = [
				elements[element].Original.reduce(function(a, b) {return Math.max(a, b)}),
				elements[element].Beautified.reduce(function(a, b) {return Math.max(a, b)})
			]
			minMax[element].max = max.reduce(function(a, b) {return Math.max(a, b)})
			
		})
		//get biggest value within dimension
		dimensions[dimension].max = maxDimension

		dimensions[dimension].values = minMax
	})
	return dimensions
}
