const height = 410;
const width = 365;


/*** DEFS ***/

// hard coded
const getTextWidth = (text, font) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const width = context.measureText(text).width;
    d3.select(canvas).remove()
    return width;
};
const margin = {top: 5, left: 5, right: (width * 0.05) + 5, bottom: (height * 0.05) + 5};
const normalArcOpacity = 0.9;
const theUnhoveredArcOpacity = 0.5;
const formatIntoPercentage = d3.format('.0%');
const percentageDescription = '% of System Run Hours Logged in Optimization Mode';
const percentDescriptionRectOpacity = 0.8


// exposed props
const data = {
    backgroundColor: 'white',
    standardColor: '#ff8600',
    optimizedColor: 'rgb(44, 139, 246)',
        // if data not able to be pulled upon async try, will change values of these bools
    includeCHs: true,
    includePCPs: true,
    includeSCPs: true,
    includeCDPs: true,
    includeCTFs: true,

    color_CHs: '#0ece2b',
    color_PCPs: '#060084',
    color_SCPs: '#5fdaef',
    color_CDPs: '#e26302',
    color_CTFs: '#f92f2f',

    overallArcThickness: 40,

    percentageFont: '38.0pt Nirmala UI',
    legendFont: '12.0pt Nirmala UI',
    tooltipHeaderFont: '16pt Nirmala UI',
    tooltipFont: '10pt Nirmala UI',
    tooltipPadding: 20,
    tooltipVerticalTextPadding: 20,
    tooltipHorizontalTextPadding: 5,
    extraPaddingUnderTooltipHeader: 3,

    paddingBetweenOverallAndModuleArcs: 7,
    paddingBetweenOverallArcs: 0.08,
    moduleArcThickness: 10,


    /*** NEW ONES HERE *****/
    percentDescriptionFont: '9.0pt Nirmala UI',
    paddingBetweenPercentAndMiddle: 0,
    paddingBetweenPercentDescriptionAndMiddle: 40,
    tooltipFillColor: '#f2f2f2',
    paddingAboveLegendBars: 25,
    paddingUnderLegendText: 5,
    modulePercentFont: '26.0pt Nirmala UI',
		extraPaddingAboveModulePercent: 30,
		percentDescriptionRectHeight: 35
};



// other sources:

data.graphicHeight = height;
data.graphicWidth = width;

// globals per instance
data.hovered = {optimized: false, standard: false, current: 'neither'};
data.activeModule = 'none'
data.percentIsHovered = false;

// calculated
data.maxTooltipTextWidths = {
    type: getTextWidth('CDPs:', 'bold ' + data.tooltipFont),
    hours: getTextWidth('5555 HRS', data.tooltipFont),
    percent: getTextWidth('55%', data.tooltipFont)
};
data.totalTooltipTextWidth = data.maxTooltipTextWidths.type + data.maxTooltipTextWidths.hours + data.maxTooltipTextWidths.percent + (data.tooltipHorizontalTextPadding * 2);


const maxChartHeight = data.graphicHeight - (margin.top + margin.bottom + data.paddingAboveLegendBars + data.paddingUnderLegendText + data.moduleArcThickness )
const maxChartWidth = data.graphicWidth - (margin.left + margin.right);
console.log('maxHeight: ', maxChartHeight, 'maxWidth: ', maxChartWidth)
data.hoveredOuterRadius = maxChartHeight < maxChartWidth ? maxChartHeight / 2 : maxChartWidth / 2;
data.moduleOuterRadius = data.hoveredOuterRadius - data.moduleArcThickness;
data.moduleInnerRadius = data.moduleOuterRadius - data.moduleArcThickness;
data.overallOuterRadius = data.moduleInnerRadius - data.paddingBetweenOverallAndModuleArcs;
data.overallInnerRadius = data.overallOuterRadius - data.overallArcThickness;
data.tooltipDiameter = (data.overallInnerRadius * 2) - data.tooltipPadding || 180;




    // TODO: Calculate from data resolves and props 
        //Chillers
const CHS = {type: 'CHs', optimizedHours: 1199, standardHours: 1200, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_CHs};
        //Primary Pumps
const PCP = {type: 'PCPs', optimizedHours: 1500, standardHours: 1500, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_PCPs};
        //Secondary Pumps
const SCP = {type: 'SCPs', optimizedHours: 2250, standardHours: 2750, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_SCPs};
        //Condenser Pumps
const CDP = {type: 'CDPs', optimizedHours: 2450, standardHours: 250, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_CDPs};
        //Chiller Towers
const CTF = {type: 'CTFs', optimizedHours: 1800, standardHours: 1200, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_CTFs};


data.modulesData = [];
if (data.includeCHs) data.modulesData.push(CHS);
if (data.includePCPs) data.modulesData.push(PCP);
if (data.includeSCPs) data.modulesData.push(SCP);
if (data.includeCDPs) data.modulesData.push(CDP);
if (data.includeCTFs) data.modulesData.push(CTF);

//set totalHours
data.modulesData.forEach(mod => mod.totalHours = mod.optimizedHours + mod.standardHours)
//set normalized hours
const minTotalHours = data.modulesData.reduce((accum, curr) => !accum || (accum && curr.totalHours < accum) ? curr.totalHours : accum, 0)
data.modulesData.forEach(mod => {
    const normalizedTotal = mod.totalHours / minTotalHours;
    mod.normalizedOptimizedHours = mod.optimizedHours / normalizedTotal;
    mod.normalizedStandardHours = mod.standardHours / normalizedTotal;
})


const standardHours = data.modulesData.reduce((accum, curr) => accum + curr.normalizedStandardHours, 0);
const optimizedHours = data.modulesData.reduce((accum, curr) => accum + curr.normalizedOptimizedHours, 0);

data.overallData = [{category: 'standard', hours: standardHours}, {category: 'optimized', hours: optimizedHours}];
data.percent = formatIntoPercentage(data.overallData[1].hours / (data.overallData[0].hours + data.overallData[1].hours));


data.legendWidth = data.moduleOuterRadius * 2;
data.legendColorRectsWidth = data.legendWidth / data.modulesData.length;



data.percentDescriptionRectWidth = getTextWidth(percentageDescription, data.percentDescriptionFont) + 10;




/*** Initialization ***/

const widget = {};  //TODO: remove for Niagara
const outerDiv = d3.select('#outer')
    .style('height', height + 'px')
    .style('width', width + 'px')
widget.svg = outerDiv.append('svg')
    .attr('class', 'log')
    .attr('width', '95%')
    .attr('height', '95%');


d3.select(widget.svg.node().parentNode).style('background-color', data.backgroundColor)

const graphicGroup = widget.svg.append('g').attr('class', 'graphicGroup');
const graphicRectForTestingOnly = graphicGroup.append('rect')	//TODO: Remove
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('height', data.graphicHeight)
    .attr('width', data.graphicWidth)








/*** ARCS ***/

const allDonutGroupsGroup = graphicGroup.append('g')
    .attr('class', 'allDonutGroupsGroup')
    .attr('transform', `translate(${(data.graphicWidth - (margin.left + margin.right)) / 2}, ${margin.top + data.hoveredOuterRadius})`)


//overall arcs
    //group
const overallDonutGroup = allDonutGroupsGroup.append('g')
    .attr('class', 'overallDonutGroup');

    // generators
const overallArcsDataGenerator = d3.pie()
    .value(d => d.hours)
    .sort(() => -1) // keep in order regardless of values
    .padAngle(data.paddingBetweenOverallArcs)
const overallArcPathGenerator = d3.arc()
    .innerRadius(data.overallInnerRadius)
    .outerRadius(data.overallOuterRadius);
    

    //paths
const overallArcPaths = overallDonutGroup.selectAll('.overallPath')
    .data(overallArcsDataGenerator(data.overallData))
    .enter().append('path')
        .attr('d', overallArcPathGenerator)
        .attr('class', (d, i) => data.overallData[i].category === 'standard' ? 'standardArcPath overallPath standardPath' : 'optimizedArcPath overallPath optimizedPath')
        .attr('fill', (d, i) => data.overallData[i].category === 'optimized' ? data.optimizedColor : data.standardColor)
        .style('fill-opacity', (d, i) => data.hovered[data.overallData[i].category] ? 1 : normalArcOpacity);


    // get start and end angles of overall arc paths
const angles = {optimized: {start: 0, end: 0}, standard: {start: 0, end: 0}};
overallArcPaths.filter((d, i) => {
    angles[data.overallData[i].category].start = d.startAngle;
    angles[data.overallData[i].category].end = d.endAngle;
})





// module arcs
const moduleArcPathGenerator = d3.arc()
    .innerRadius(data.moduleInnerRadius)
    .outerRadius(data.moduleOuterRadius);

const hoveredModuleArcPathGenerator = d3.arc()
    .innerRadius(data.moduleInnerRadius) 
    .outerRadius(data.hoveredOuterRadius);

	// func determines whether individual module is hovered and calls corresponding path generator for module arc paths accordingly 
const determinePathGenerator = lineData => data.activeModule === data.modulesData[lineData.index].type ? hoveredModuleArcPathGenerator(lineData) : moduleArcPathGenerator(lineData)


    //standard module arcs
      //group
const standardDonutGroup = allDonutGroupsGroup.append('g')
    .attr('class', 'standardDonutGroup')

      // generator
const standardArcsDataGenerator = d3.pie()
    .value(d => d.normalizedStandardHours)
    .sort(() => -1)	// keep in order regardless of values
    .startAngle(angles.standard.start + (data.paddingBetweenOverallArcs / 2))
    .endAngle(angles.standard.end - (data.paddingBetweenOverallArcs / 2));

    
      //standard module arc paths
standardDonutGroup.selectAll('.standardPath')
	.data(standardArcsDataGenerator(data.modulesData))
	.enter().append('path')
		.attr('d', data.hovered.standard ? hoveredModuleArcPathGenerator : determinePathGenerator)
		.attr('class', (d, i) => `${data.modulesData[i].type}ArcPath modulePath standardModulePath standardPath`)
		.attr('fill', (d, i) => data.modulesData[i].color)
		.style('fill-opacity', (d, i) => {
				if (data.hovered.standard || data.activeModule === data.modulesData[i].type) return 1;
				if (data.activeModule === 'none' && data.hovered.current === 'neither') return normalArcOpacity;
				return theUnhoveredArcOpacity;
		});




    //optimized module arcs
      //group
const optimizedDonutGroup = allDonutGroupsGroup.append('g')
    .attr('class', 'optimizedDonutGroup')

      // generator
const optimizedArcsDataGenerator = d3.pie()
    .value(d => d.normalizedOptimizedHours)
    .sort(() => -1) // keep in order regardless of values
    .startAngle(angles.optimized.start + (data.paddingBetweenOverallArcs / 2))
    .endAngle(angles.optimized.end - (data.paddingBetweenOverallArcs / 2));


      //optimized module arc paths
optimizedDonutGroup.selectAll('.optimizedPath')
    .data(optimizedArcsDataGenerator(data.modulesData))
    .enter().append('path')
        .attr('d', data.hovered.optimized ? hoveredModuleArcPathGenerator : determinePathGenerator)
        .attr('class', (d, i) => `${data.modulesData[i].type}ArcPath modulePath optimizedModulePath optimizedPath`)
        .attr('fill', (d, i) => data.modulesData[i].color)
        .style('fill-opacity', (d, i) => {
            if (data.hovered.optimized || data.activeModule === data.modulesData[i].type) return 1;
            if (data.activeModule === 'none' && data.hovered.current === 'neither') return normalArcOpacity;
            return theUnhoveredArcOpacity;
        });


// hoverable invisible arcs
	//generators
const hoverableStandardArcPathGenerator = d3.arc()
.innerRadius(data.overallInnerRadius)
.outerRadius(data.hoveredOuterRadius)
.startAngle(angles.standard.start)
.endAngle(angles.standard.end)

const hoverableOptimizedArcPathGenerator = d3.arc()
	.innerRadius(data.overallInnerRadius)
	.outerRadius(data.hoveredOuterRadius)
	.startAngle(angles.optimized.start)
	.endAngle(angles.optimized.end)

	//paths
const standardPathsHoverArc = allDonutGroupsGroup.append('path')
	.attr('d', hoverableStandardArcPathGenerator)
	.style('opacity', '0')
const optimizedPathsHoverArc = allDonutGroupsGroup.append('path')
	.attr('d', hoverableOptimizedArcPathGenerator)
	.style('opacity', '0')





/*** TOOLTIPS AND ARC HOVERS ***/

function renderTooltip (moduleObj) {    // moduleObj passed in if an individual module is active

    const selectionForCheck = widget.svg.select('.tooltipGroup')
    if (!selectionForCheck.empty()) selectionForCheck.remove();

    const tooltipGroup = allDonutGroupsGroup.append('g')
        .attr('class', 'tooltipGroup')
        .style('opacity', data.hovered.current !== 'neither' || data.activeModule !== 'none' ? 1 : 0)

	//tooltip circle
    tooltipGroup.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', data.tooltipDiameter / 2)
				.attr('fill', data.tooltipFillColor)



    const tooltipTextGroup = tooltipGroup.append('g')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', 0)
        .attr('y', 0)
        .style('font', data.tooltipFont)
        .attr('transform', `translate(0, -${data.tooltipDiameter / 4})`);


        //text
            //header
    tooltipTextGroup.append('text')
        .attr('class', 'category')
        .text(moduleObj ? `${moduleObj.type}:` : `${data.hovered.current.toUpperCase()}:`)
        .attr('fill', () => {
            if (moduleObj) return moduleObj.color;
            return data.hovered.optimized ? data.optimizedColor : data.standardColor;
        })
        .style('font', data.tooltipHeaderFont)
        .style('font-weight', 'bold')
        .style('text-decoration', 'underline');

            

    if (!moduleObj) {
        const tooltipModuleGroups = tooltipTextGroup.selectAll('g')
            .data(data.modulesData)
            .enter().append('g')
                .attr('text-anchor', 'start')
                .attr('class', d => `${d.type}TooltipTextGroup`)
                .attr('transform', `translate(-${data.totalTooltipTextWidth / 2}, 0)`);

        //typeTexts
        tooltipModuleGroups.append('text')
            .attr('class', '.data .type')
            .text(d => `${d.type}:`)
            .attr('y', (d, i) => data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * (i + 1)))
            .style('font-weight', 'bold')

        //hoursTexts
        tooltipModuleGroups.append('text')
            .attr('class', '.data .hours')
            .text(d => `${d[`${data.hovered.current}Hours`]} HRS`)
            .attr('x', data.tooltipHorizontalTextPadding + data.maxTooltipTextWidths.type)
            .attr('y', (d, i) => data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * (i + 1)))


        //percentageTexts
        tooltipModuleGroups.append('text')
            .attr('class', '.data .percents')
            .text(d => formatIntoPercentage(d[`${data.hovered.current}Hours`] / (d.standardHours + d.optimizedHours)))
            .attr('x', (data.tooltipHorizontalTextPadding * 2) + data.maxTooltipTextWidths.type + data.maxTooltipTextWidths.hours)
            .attr('y', (d, i) => data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * (i + 1)))
    } else {
        //for individual modules' tooltips
        //
        tooltipTextGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', 0)
            .text(`${moduleObj.optimizedHours} OPTIMIZED HRS`)
            .attr('y', data.extraPaddingUnderTooltipHeader + data.tooltipVerticalTextPadding)

        tooltipTextGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', 0)
            .text(`${moduleObj.standardHours} STANDARD HRS`)
            .attr('y', data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * 2))

        tooltipTextGroup.append('text')
            .text(formatIntoPercentage(moduleObj.optimizedHours / (moduleObj.standardHours + moduleObj.optimizedHours)))
            .attr('x', 0)
            .attr('text-anchor', 'middle')
            .style('font', data.modulePercentFont)
            .attr('y', data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * 3) + data.extraPaddingAboveModulePercent)

    }

		//overarching circle for percent description tooltip event listening 
		tooltipGroup.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', data.tooltipDiameter / 2)
			.attr('opacity', 0)
			.on('mouseenter', function(){
				data.percentIsHovered = true;
				renderPercentageDescription();
			})
			.on('mouseleave', function(){
				data.percentIsHovered = false;
				renderPercentageDescription();
			})	
}


    // events
const optimizedPaths = widget.svg.selectAll('.optimizedPath')
const standardPaths = widget.svg.selectAll('.standardPath')

optimizedPathsHoverArc
    .on('mouseenter', function(){
			console.log('entered')
        data.hovered.optimized = true;
        data.hovered.current = 'optimized'

        widget.svg.selectAll('.percentage').style('opacity', 0)
        optimizedPaths.style('fill-opacity', 1);
        standardPaths.style('fill-opacity', theUnhoveredArcOpacity)
        widget.svg.selectAll('.optimizedModulePath')
            .transition()
                .attr('d', hoveredModuleArcPathGenerator)
        renderTooltip()
    })
    .on('mouseleave', function(){
        data.hovered.optimized = false;
        data.hovered.current = 'neither'

        widget.svg.selectAll('.percentage').style('opacity', 1)
        standardPaths.style('fill-opacity', normalArcOpacity)
        optimizedPaths.style('fill-opacity', normalArcOpacity);
        widget.svg.selectAll('.optimizedModulePath')
            .transition()
                .attr('d', moduleArcPathGenerator)
        renderTooltip()
    });
standardPathsHoverArc
    .on('mouseenter', function(){
        data.hovered.standard = true;
        data.hovered.current = 'standard'

        widget.svg.selectAll('.percentage').style('opacity', 0)
        standardPaths.style('fill-opacity', 1);
        optimizedPaths.style('fill-opacity', theUnhoveredArcOpacity)
        widget.svg.selectAll('.standardModulePath')
            .transition()
                .attr('d', hoveredModuleArcPathGenerator)
        renderTooltip()
    })
    .on('mouseleave', function(){
        data.hovered.standard = false;
        data.hovered.current = 'neither'

        widget.svg.selectAll('.percentage').style('opacity', 1)
        standardPaths.style('fill-opacity', normalArcOpacity);
        optimizedPaths.style('fill-opacity', normalArcOpacity);
        widget.svg.selectAll('.standardModulePath')
            .transition()
                .attr('d', moduleArcPathGenerator)
        renderTooltip()
    });









/*** LEGEND ***/

const legendGroup = graphicGroup.append('g').attr('transform', `translate(${((data.graphicWidth - (margin.left + margin.right)) / 2) - (data.legendWidth / 2)}, ${margin.top + (data.hoveredOuterRadius * 2) + data.paddingAboveLegendBars})`);

const legendModuleGroups = legendGroup.selectAll('.legendModuleGroup')
    .data(data.modulesData)
    .enter().append('g')
        .attr('class', d => `legendModuleGroup .${d.type}LegendModuleGroup`)
        .attr('transform', (d, i) => `translate(${i * data.legendColorRectsWidth}, 0)`)
        .on('mouseenter', function(d){
            const that = d3.select(this);
            that.selectAll('rect').style('stroke-opacity', '1')
            that.selectAll('text').style('font-weight', 'bold')

            data.activeModule = d.type;
            widget.svg.selectAll('.percentage').style('opacity', 0)
            widget.svg.selectAll('.modulePath').style('fill-opacity', theUnhoveredArcOpacity)
            widget.svg.selectAll('.arcPath').style('fill-opacity', theUnhoveredArcOpacity)
            widget.svg.selectAll(`.${d.type}ArcPath`)
                .style('fill-opacity', 1)
                .transition()
                    .attr('d', hoveredModuleArcPathGenerator);
            renderTooltip(d);
        })
        .on('mouseleave', function(d){
            const that = d3.select(this);
            that.selectAll('rect').style('stroke-opacity', '0')
            that.selectAll('text').style('font-weight', 'normal')

            data.activeModule = 'none';
            widget.svg.selectAll('.percentage').style('opacity', 1)
            widget.svg.selectAll('.modulePath').style('fill-opacity', normalArcOpacity)
            widget.svg.selectAll('.arcPath').style('fill-opacity', normalArcOpacity)
            widget.svg.selectAll(`.${d.type}ArcPath`)
                .transition()
                    .attr('d', moduleArcPathGenerator);
            renderTooltip();
        })

legendModuleGroups.append('rect')
    .attr('height', data.moduleArcThickness)
    .attr('width', data.legendColorRectsWidth)
    .attr('y', data.paddingUnderLegendText)
    .attr('fill', d => d.color)
    .attr('stroke', 'black')
    .style('stroke-opacity', d => data.activeModule === d.type ? '1' : '0')

legendModuleGroups.append('text')
    // .attr('dominant-baseline', 'hanging')
    .attr('text-anchor', 'middle')
    .attr('x', data.legendColorRectsWidth / 2)
    .text(d => d.type)
    .style('font', data.legendFont)
    .style('font-weight', d => data.activeModule === d.type ? 'bold' : 'normal')
        











		/*** PERCENT ***/

			//percentage
		allDonutGroupsGroup.append('text')
			.attr('class', 'percentage')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('y', -data.paddingBetweenPercentAndMiddle)
			.style('font', data.percentageFont)
			.style('opacity', data.hovered.current === 'neither' && data.activeModule === 'none' ? 1 : 0)
			.text(data.percent);


			//percentage description
		function renderPercentageDescription (){
			const selectionForCheck = widget.svg.selectAll('.percentageDescription')
    	if (!selectionForCheck.empty()) selectionForCheck.remove();

			if (data.percentIsHovered) {
				allDonutGroupsGroup.append('rect')
					.attr('class', 'percentageDescription')
					.attr('x', -(data.percentDescriptionRectWidth / 2))
					.attr('y', data.paddingBetweenPercentDescriptionAndMiddle - (data.percentDescriptionRectHeight / 2))
					.attr('height', data.percentDescriptionRectHeight)
					.attr('width', data.percentDescriptionRectWidth)
					.attr('fill', data.tooltipFillColor)
					.attr('rx', '10px')
					.attr('ry', '10px')
					.style('opacity', percentDescriptionRectOpacity) 
		
					allDonutGroupsGroup.append('text')
					.attr('class', 'percentageDescription')
					.style('font', data.percentDescriptionFont)
					.attr('text-anchor', 'middle')
					.attr('dominant-baseline', 'middle')
					.attr('y', data.paddingBetweenPercentDescriptionAndMiddle)
					.style('opacity', 1) 
					.text(percentageDescription);
			}
		}


		renderPercentageDescription();