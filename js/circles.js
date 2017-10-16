//create positions for circles
		var circleImages = ["b3_0.png", "b1.png", "b3_2.png", "b4_0.png", "b4_1.png", "b5.png", "b6_0.png", "b6_1.png", "b7_0.png", "u1.png", "u2.png", "u3.png", "u4.png", "u5.png", "u6.png", "u7.png", "b1.png", "b1_1.png", "b1_3.png", "b2_0.png", "b3_0.png", "b3_2.png", "b4_0.png", "b4_1.png", "b5.png", "b6_0.png", "b6_1.png",
							//"b1_1.png", "b1 _3.png", "b2_0.png", "b7_0.png", "u1.png", "u2.png", "u3.png", "u4.png",
							//"u5.png", "b1.png", "b1_1.png", "b1_3.png",
							"b2_0.png", "b3_0.png", "b3_2.png", "b4_0.png", "b4_1.png", "b5.png", "b6_0.png", "b6_1.png", "b7_0.png", "u1.png", "u2.png", "u3.png", "u4.png", "u5.png", "u6.png", "u7.png", "b1.png", "b1_1.png", "b1_3.png", "b2_0.png", "b3_0.png"],
			circleColWidth = document.getElementById('circleDock').offsetWidth,
			positions = [],
			usedPositions = [],
			
			colCount = 9,
			rowCount = 6,
			imageGutter = 10;
			imageSize = Math.floor((circleColWidth - (colCount * imageGutter)) / colCount);
		for(i=0; i<colCount; i++) {
			for(j=0; j<rowCount; j++) {
				positions.push([i* (imageSize + imageGutter),j* (imageSize + imageGutter)]);
			}
		}

		//draw circles and translate
		circleDock = d3.select("#circleDock").append("svg").style("height",rowCount * (imageSize + imageGutter)).style("width",circleColWidth)
		circleDock.selectAll("image").data(circleImages).enter().append("image")
			.attr("href",function(d){return "img/circles/" + d;})
			.attr("width",imageSize).attr("height",imageSize)
			.attr("x", function(d,i){
				rand = Math.floor(Math.random() * positions.length);
				usedPositions.push(positions[rand]);
				positions.splice(rand,1);
				return usedPositions[usedPositions.length-1][0];
			})
			.attr("y",function(d,i){
				return usedPositions[i][1];
			})
			.on("mouseover", function(d){
				//d3.select(this).attr("transform","translate(0,0),scale(200)")
			})
			.on("mouseout", function(d){
				d3.select(this)
				//.attr("width",imageSize)
				//.attr("height",imageSize)
			})

		//Draw circles for not presented data
		//circleDock.selectAll("circle").data(positions).enter().append("circle")
		//.attr("class","noData")
		//.attr("cx",function(d) {return d[0] + imageSize / 2})
		//.attr("cy",function(d) {return d[1] + imageSize / 2})
		//.attr("r",imageSize / 2)
		//it might look good to leave it out completely.

		//create connections between images (leaving out grey circles)
		var loopLength = usedPositions.length -1 //needed, beacause we reduce the length in the loop
		for(i=0; i<=loopLength; i++) {
			if(i%2 == 0) {
				circleDock.append("line")
				.attr("x1",usedPositions[i][0] + imageSize / 2)
				.attr("y1",usedPositions[i][1] + imageSize / 2)
				.attr("x2",usedPositions[i+1][0] + imageSize / 2)
				.attr("y2",usedPositions[i+1][1] + imageSize / 2)
				.attr("class","line"+i)
				.attr("stroke","white")
				.attr("stroke-width","5")
				.attr("opacity","0")

				circleDock.append("circle")
				.attr("r",imageSize / 10)
				.attr("cx",usedPositions[i][0] + imageSize / 2)
				.attr("cy",usedPositions[i][1] + imageSize / 2)
				.attr("class","line"+i)
				.attr("fill","white")
				.attr("opacity",0)

				circleDock.append("circle")
				.attr("r",imageSize / 10)
				.attr("cx",usedPositions[i+1][0] + imageSize / 2)
				.attr("cy",usedPositions[i+1][1] + imageSize / 2)
				.attr("class","line"+i)
				.attr("fill","white")
				.attr("opacity",0)

				//create triggers for each line to appear 
				new ScrollMagic.Scene({
					triggerElement: "#triggerCircleDock",
					//duration: 50,
					offset: i * 10
				})
				.addIndicators({name: "trigger circle " +i})
				.triggerHook(0)
				.addTo(controller)
				.setTween(".line"+i, 0.5, {opacity: 1})

				//flatten bubble Cluster

				
				//XX this dies not work, no function possible within .setTween()
				//research: find out wether setTween can trigger anything but css-stateents (eg. position transformation)

				new ScrollMagic.Scene({
			 		triggerElement: "#triggerFlattening",
			 		//duration: 10,
			 		offset: i*10
				})
				.triggerHook(0)
				.addTo(controller)
				.addIndicators({name: "trigger flattening " +i})
				.setTween(".line"+i, 0.5, {})
			}
		}

		
		
