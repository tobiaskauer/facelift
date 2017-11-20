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

//parse global extreme values of all segnet values
function segnetMinMax(combinations) {
	var allSegnets = {
		"Sky": [],"Building": [],"Pole": [],"Road Marking": [],"Road": [],"Pavement": [],"Tree": [],"Sign Symbol": [],"Fence": [],"Vehicle": [],"Pedestrian": [],"Bike": []
	};
	Object.keys(combinations).forEach(function(key){
		["Original","Beautified"].forEach(function(version) {
			Object.keys(combinations[key][version].Segnet).forEach(function(segment) {
				var value = combinations[key][version].Segnet[segment]
				if(typeof value !== 'undefined') { //this is not perfect, since 0 values are ignored for the minMax... but i can live with it
					allSegnets[segment].push(value)
				} 
			})
		})
	})
	Object.keys(allSegnets).forEach(function(segment){
		allSegnets[segment] = allSegnets[segment].sort(function (a,b) {return  a - b;})
	})
	return allSegnets
}