function mouseOverLabel(currentLabel) {
	hotLabels.push(currentLabel);
	drawHeatMap();
	hotLabels.splice(-1,1)
}

function drawHeatMap() {
	//create array of coordinates, that have the current hot labels
	var heatmapArray = [];
	hotLabels.forEach(function(label) {
		Object.keys(labels[label]).forEach(function(key){
			heatmapArray.push(labels[label][key].LatLong);
		})
	})

	if(heat._leaflet_id) {map.removeLayer(heat)}; //remove old map
	heat = L.heatLayer(heatmapArray, {
		radius: 40,
		blur: 50,
		gradient: {'0': 'lightgrey','0.4': 'Purple','0.6': 'Red','0.8': 'Yellow','1': 'White'}
	})

	map.addLayer(heat); //add new layer
}

//create a dot for each label
function showLabelsOnMap(labels) {
	var labelLayer = L.layerGroup().addTo(map)
	var minMax = getLabelList(labels, 5)[1];
	var colorScale = d3.scaleLinear().domain([minMax[0],minMax[1]]).range([d3.rgb("#F93A02"),d3.rgb("#08B3F7")]);
	var sizeScale = d3.scaleLog().domain([minMax[0],minMax[1]]).range([8, 3])

	Object.keys(labels).forEach(function(label) {
		Object.keys(labels[label]).forEach(function(key,i) {
			var marker = L.circleMarker(
				labels[label][key].LatLong,{
					weight: 0,
					radius: sizeScale(labels[label][key].trueSkill),
					color: colorScale(labels[label][key].trueSkill),
					fillOpacity: 0.1
				});
			labelLayer.addLayer(marker);
		})
	})
}

//show dots for all combinations (and add listenever for mouseover)
function showCombinationsOnMap(globalSegnetMinMax) {
	var combinationLayer = L.layerGroup().addTo(map)
	var minMax = sortedLabels[1];
	var sizeScale = d3.scaleLog().domain([minMax[0],minMax[1]]).range([7, 3])

	Object.keys(combinations).forEach(function(key) {
		var marker = L.circleMarker(
			combinations[key].LatLng, {
				radius: ( sizeScale(combinations[key].Original.trueSkill)),
				weight: 2,
				color: 'white',
				fillOpacity: 0}
		)
		.on({
			mouseover: function(){
				marker.setStyle({radius: marker._radius + 10});
			},
			mouseout: function(){
				marker.setStyle({radius: marker._radius - 10});
			},
			click: function(){
				openComparison(combinations[key], globalSegnetMinMax);
			}
		});
		combinationLayer.addLayer(marker);
	})
}