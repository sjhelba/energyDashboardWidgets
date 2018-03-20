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
const hovered = {optimized: false, standard: false, current: 'neither'};
const margin = {top: 5, left: 5, right: 5, bottom: 5};
const normalArcOpacity = 0.9;
const theUnhoveredArcOpacity = 0.5;
const formatIntoPercentage = d3.format('.0%');


// other sources:
const currentlyIsOptimized = true; // TODO: ASK ABOUT WHERE GETTING THIS INFO (jq value, latest history of each module, ord for bool, ...?)

const optimizedIcon = './images/leaf_green.svg';
const standardIcon = './images/leaf_grey.svg';

const data = {};

data.graphicHeight = 400;
data.graphicWidth = 400;





// exposed props
data.backgroundColor = 'white';
data.standardColor = '#ff8600';
data.optimizedColor = 'rgb(44, 139, 246)';
    // if data not able to be pulled upon async try, will change values of these bools
data.includeCHs = true;
data.includePCPs = true;
data.includeSCPs = true;
data.includeCDPs = true;
data.includeCTFs = true;

data.color_CHs = '#0ece2b';
data.color_PCPs = '#060084';
data.color_SCPs = '#5fdaef';
data.color_CDPs = '#e26302';
data.color_CTFs = '#f92f2f';

data.overallArcThickness = 40;

data.percentageFont = '38.0pt Nirmala UI';
data.currentStateTextFont = 'bold 13.0pt Nirmala UI';
data.legendFont = '12.0pt Nirmala UI';
data.tooltipHeaderFont = '12pt Nirmala UI';
data.tooltipFont = '10pt Nirmala UI';
data.tooltipPadding = 20;
data.tooltipVerticalTextPadding = 20;
data.tooltipHorizontalTextPadding = 5;
data.extraPaddingUnderTooltipHeader = 3;
data.paddingBetweenLegendTexts = 7;
data.paddingBetweenLegendBoxesAndTexts = 5;
data.paddingLeftOfLegend = 10;
data.paddingBetweenCurrentStateImageAndText = 10;
data.paddingUnderCurrentState = 5;
data.paddingBetweenOverallAndModuleArcs = 7;
data.paddingBetweenOverallArcs = 0.08;
data.moduleArcThickness = 10;

data.legendColorRectsSize = 15;
data.currentStateImageSize = 40;


// calculated
data.maxTooltipTextWidths = {
    type: getTextWidth('CDPs:', 'bold ' + data.tooltipFont),
    hours: getTextWidth('5555 HRS', data.tooltipFont),
    percent: getTextWidth('55%', data.tooltipFont)
};
data.totalTooltipTextWidth = data.maxTooltipTextWidths.type + data.maxTooltipTextWidths.hours + data.maxTooltipTextWidths.percent + (data.tooltipHorizontalTextPadding * 2);



const maxChartHeight = data.graphicHeight - (margin.top + margin.bottom + data.currentStateImageSize + data.paddingUnderCurrentState)
const maxChartWidth = data.graphicWidth - (margin.left + margin.right + data.paddingLeftOfLegend + data.legendColorRectsSize + data.paddingBetweenLegendBoxesAndTexts + data.maxTooltipTextWidths.type);
data.hoveredOuterRadius = maxChartHeight < maxChartWidth ? maxChartHeight / 2 : maxChartWidth / 2;
data.moduleOuterRadius = data.hoveredOuterRadius - data.moduleArcThickness;
data.moduleInnerRadius = data.moduleOuterRadius - data.moduleArcThickness;
data.overallOuterRadius = data.moduleInnerRadius - data.paddingBetweenOverallAndModuleArcs;
data.overallInnerRadius = data.overallOuterRadius - data.overallArcThickness;
data.tooltipDiameter = (data.overallInnerRadius * 2) - data.tooltipPadding || 180;




/************************
::OLD VERSION:: 
data.overallInnerRadius = data.graphicHeight < data.graphicWidth ? data.graphicHeight / 4 : data.graphicWidth / 4;  //100
data.overallOuterRadius = data.overallInnerRadius + data.overallArcThickness;
data.tooltipDiameter = (data.overallInnerRadius * 2) - data.tooltipPadding || 180;
data.currentStateImageSize = data.graphicHeight / 10 || 40;
data.moduleInnerRadius = data.overallOuterRadius + data.paddingBetweenOverallAndModuleArcs;
data.moduleOuterRadius = data.moduleInnerRadius + data.moduleArcThickness;
data.hoveredOuterRadius = data.moduleOuterRadius + data.moduleArcThickness; //167 (d: 334)
data.maxTooltipTextWidths = {
    type: getTextWidth('CDPs:', 'bold ' + data.tooltipFont),
    hours: getTextWidth('5555 HRS', data.tooltipFont),
    percent: getTextWidth('55%', data.tooltipFont)
};
data.totalTooltipTextWidth = data.maxTooltipTextWidths.type + data.maxTooltipTextWidths.hours + data.maxTooltipTextWidths.percent + (data.tooltipHorizontalTextPadding * 2);

console.log('height: ', 400 - (margin.top + data.currentStateImageSize + data.paddingUnderCurrentState), 'width: ', 450 - (margin.left + margin.right + data.paddingLeftOfLegend + data.legendColorRectsSize + data.paddingBetweenLegendBoxesAndTexts + data.maxTooltipTextWidths.type));


*************************************/






    // TODO: Calculate from data resolves and props
        //Chillers
const CHS = {type: 'CHs', optimizedHours: 8700, standardHours: 60, color: data.color_CHs};
        //Primary Pumps
const PCP = {type: 'PCPs', optimizedHours: 8000, standardHours: 760, color: data.color_PCPs};
        //Secondary Pumps
const SCP = {type: 'SCPs', optimizedHours: 8215, standardHours: 545, color: data.color_SCPs};
        //Condenser Pumps
const CDP = {type: 'CDPs', optimizedHours: 760, standardHours: 8000, color: data.color_CDPs};
        //Chiller Towers
const CTF = {type: 'CTFs', optimizedHours: 5010, standardHours: 3750, color: data.color_CTFs};

data.modulesData = [];
if (data.includeCHs) data.modulesData.push(CHS);
if (data.includePCPs) data.modulesData.push(PCP);
if (data.includeSCPs) data.modulesData.push(SCP);
if (data.includeCDPs) data.modulesData.push(CDP);
if (data.includeCTFs) data.modulesData.push(CTF);

const standardHours = data.modulesData.reduce((accum, curr) => accum + curr.standardHours, 0);
const optimizedHours = data.modulesData.reduce((accum, curr) => accum + curr.optimizedHours, 0);

data.overallData = [{category: 'standard', hours: standardHours}, {category: 'optimized', hours: optimizedHours}];
data.percent = formatIntoPercentage(data.overallData[1].hours / (data.overallData[0].hours + data.overallData[1].hours));










/*** Initialization ***/

const widget = {};  //TODO: remove for Niagara
widget.svg = d3.select('body').append('svg')
    .attr('class', 'log')
    .attr('width', data.graphicWidth)
    .attr('height', data.graphicHeight);


d3.select(widget.svg.node().parentNode).style('background-color', data.backgroundColor)

const graphicGroup = widget.svg.append('g').attr('class', 'graphicGroup');
const graphicRectForTestingOnly = graphicGroup.append('rect')	//TODO: Remove
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('height', data.graphicHeight)
    .attr('width', data.graphicWidth)




/*** CURRENT STATE ***/

const currentStateGroup = graphicGroup.append('g')
    .attr('class', 'currentStateGroup')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)


	//currentState Image
currentStateGroup.append('svg:image')
    .attr('xlink:href', currentlyIsOptimized ? optimizedIcon : standardIcon)
    .attr('height', data.currentStateImageSize)
    .attr('width', data.currentStateImageSize)

	//currentState Text
currentStateGroup.append('text')
    .attr('transform', `translate(${data.currentStateImageSize + data.paddingBetweenCurrentStateImageAndText}, 0)`)
    .attr('y', data.currentStateImageSize / 2)
    .attr('dominant-baseline', 'middle')
    .style('font', data.currentStateTextFont)
    .text('Optimization ' + (currentlyIsOptimized ? 'Enabled' : 'Disabled'));









/*** ARCS ***/

const allDonutGroupsGroup = graphicGroup.append('g')
    .attr('class', 'allDonutGroupsGroup')
    .attr('transform', `translate(${margin.left + data.hoveredOuterRadius}, ${margin.top + data.currentStateImageSize + data.paddingUnderCurrentState + data.hoveredOuterRadius})`)


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
        .style('fill-opacity', (d, i) => hovered[data.overallData[i].category] ? 1 : normalArcOpacity);


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
    .innerRadius(data.moduleOuterRadius && data.moduleInnerRadius) // TODO: ASK DREW IF HE PREFERS MOVE (data.moduleOuterRadius) OR GROW (data.moduleInnerRadius)
    .outerRadius(data.hoveredOuterRadius);

    //standard module arcs
      //group
const standardDonutGroup = allDonutGroupsGroup.append('g')
    .attr('class', 'standardDonutGroup')

      // generator
const standardArcsDataGenerator = d3.pie()
    .value(d => d.standardHours)
    .sort(() => -1)	// keep in order regardless of values
    .startAngle(angles.standard.start + (data.paddingBetweenOverallArcs / 2))
    .endAngle(angles.standard.end - (data.paddingBetweenOverallArcs / 2));

    
      //standard module arc paths
standardDonutGroup.selectAll('.standardPath')
    .data(standardArcsDataGenerator(data.modulesData))
    .enter().append('path')
        .attr('d', moduleArcPathGenerator)
        .attr('class', (d, i) => `${data.modulesData[i].type}ArcPath modulePath standardModulePath standardPath`)
        .attr('fill', (d, i) => data.modulesData[i].color)
        .style('fill-opacity', hovered.standard ? 1 : normalArcOpacity);




    //optimized module arcs
      //group
const optimizedDonutGroup = allDonutGroupsGroup.append('g')
    .attr('class', 'optimizedDonutGroup')

      // generator
const optimizedArcsDataGenerator = d3.pie()
    .value(d => d.optimizedHours)
    .sort(() => -1) // keep in order regardless of values
    .startAngle(angles.optimized.start + (data.paddingBetweenOverallArcs / 2))
    .endAngle(angles.optimized.end - (data.paddingBetweenOverallArcs / 2));


      //optimized module arc paths
optimizedDonutGroup.selectAll('.optimizedPath')
    .data(optimizedArcsDataGenerator(data.modulesData))
    .enter().append('path')
        .attr('d', moduleArcPathGenerator)
        .attr('class', (d, i) => `${data.modulesData[i].type}ArcPath modulePath optimizedModulePath optimizedPath`)
        .attr('fill', (d, i) => data.modulesData[i].color)
        .style('fill-opacity', hovered.optimized ? 1 : normalArcOpacity);













/*** PERCENT ***/

	//percentage text
overallDonutGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font', data.percentageFont)
    .text(data.percent);







/*** TOOLTIPS AND ARC HOVERS ***/

function renderTooltip () {

    const selectionForCheck = widget.svg.select('.tooltipGroup')
    if (!selectionForCheck.empty()) selectionForCheck.remove();

    const tooltipGroup = allDonutGroupsGroup.append('g')
        .attr('class', 'tooltipGroup')
        .style('opacity', hovered.optimized || hovered.standard ? 1 : 0)

	//tooltip circle
    tooltipGroup.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', data.tooltipDiameter / 2)
        .attr('fill', '#f2f2f2')
        .style('opacity', hovered.optimized || hovered.standard ? 1 : 0)



    const tooltipTextGroup = tooltipGroup.append('g')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', 0)
        .attr('y', 0)
        .style('font', data.tooltipFont)
        .attr('transform', `translate(0, -${data.tooltipDiameter / 3.5})`);     //TODO: Check to see if this works well given different sizes


        //text
            //either current or optimized
    tooltipTextGroup.append('text')
        .attr('class', 'category')
        .text(`${hovered.current.toUpperCase()}:`)
        .attr('fill', hovered.optimized ? data.optimizedColor : data.standardColor)
        .style('font', data.tooltipHeaderFont)
        .style('font-weight', 'bold')
        .style('text-decoration', 'underline');



    const tooltipModuleGroups = tooltipTextGroup.selectAll('g')
        .data(data.modulesData)
        .enter().append('g')
            .attr('text-anchor', 'start')
            .attr('class', d => `${d.type}tooltipTextGroup`)
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
        .text(d => `${d[`${hovered.current}Hours`]} HRS`)
        .attr('x', data.tooltipHorizontalTextPadding + data.maxTooltipTextWidths.type)
        .attr('y', (d, i) => data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * (i + 1)))


    //percentageTexts
    tooltipModuleGroups.append('text')
        .attr('class', '.data .percents')
        .text(d => d3.format('.0%')(d[`${hovered.current}Hours`] / (d.standardHours + d.optimizedHours)))
        .attr('x', (data.tooltipHorizontalTextPadding * 2) + data.maxTooltipTextWidths.type + data.maxTooltipTextWidths.hours)
        .attr('y', (d, i) => data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * (i + 1)))
}
renderTooltip();


    // events
const optimizedPaths = widget.svg.selectAll('.optimizedPath')
const standardPaths = widget.svg.selectAll('.standardPath')

optimizedPaths
    .on('mouseenter', function(){
        hovered.optimized = true;
        hovered.current = 'optimized'

        optimizedPaths.style('fill-opacity', 1);
        standardPaths.style('fill-opacity', theUnhoveredArcOpacity)
        widget.svg.selectAll('.optimizedModulePath')
            .transition()
                .attr('d', hoveredModuleArcPathGenerator)
        renderTooltip()
    })
    .on('mouseleave', function(){
        hovered.optimized = false;
        hovered.current = 'neither'

        standardPaths.style('fill-opacity', normalArcOpacity)
        optimizedPaths.style('fill-opacity', normalArcOpacity);
        widget.svg.selectAll('.optimizedModulePath')
            .transition()
                .attr('d', moduleArcPathGenerator)
        renderTooltip()
    });
standardPaths
    .on('mouseenter', function(){
        hovered.standard = true;
        hovered.current = 'standard'

        standardPaths.style('fill-opacity', 1);
        optimizedPaths.style('fill-opacity', theUnhoveredArcOpacity)
        widget.svg.selectAll('.standardModulePath')
            .transition()
                .attr('d', hoveredModuleArcPathGenerator)
        renderTooltip()
    })
    .on('mouseleave', function(){
        hovered.standard = false;
        hovered.current = 'neither'

        standardPaths.style('fill-opacity', normalArcOpacity);
        optimizedPaths.style('fill-opacity', normalArcOpacity);
        widget.svg.selectAll('.standardModulePath')
            .transition()
                .attr('d', moduleArcPathGenerator)
        renderTooltip()
    });









/*** LEGEND ***/

const legendGroup = graphicGroup.append('g').attr('transform', `translate(${margin.left + (data.hoveredOuterRadius * 2) + data.paddingLeftOfLegend}, ${margin.top + data.currentStateImageSize + data.paddingUnderCurrentState + data.moduleArcThickness})`);

const legendModuleGroups = legendGroup.selectAll('.legendModuleGroup')
    .data(data.modulesData)
    .enter().append('g')
        .attr('class', d => `legendModuleGroup .${d.type}LegendModuleGroup`)
        .attr('transform', (d, i) => `translate(0, ${(i * data.paddingBetweenLegendTexts) + (i * data.legendColorRectsSize)})`)
        .on('mouseenter', function(d){
            const that = d3.select(this);
            that.selectAll('rect').style('stroke-opacity', '1')
            that.selectAll('text').style('font-weight', 'bold')
            widget.svg.selectAll('.modulePath').style('fill-opacity', theUnhoveredArcOpacity)
            widget.svg.selectAll('.arcPath').style('fill-opacity', theUnhoveredArcOpacity)
            widget.svg.selectAll(`.${d.type}ArcPath`)
                .style('fill-opacity', 1)
                .transition()
                    .attr('d', hoveredModuleArcPathGenerator)
        })
        .on('mouseleave', function(d){
            const that = d3.select(this);
            that.selectAll('rect').style('stroke-opacity', '0')
            that.selectAll('text').style('font-weight', 'normal')
            widget.svg.selectAll('.modulePath').style('fill-opacity', normalArcOpacity)
            widget.svg.selectAll('.arcPath').style('fill-opacity', normalArcOpacity)
            widget.svg.selectAll(`.${d.type}ArcPath`)
                .transition()
                    .attr('d', moduleArcPathGenerator)
        })

legendModuleGroups.append('rect')
    .attr('height', data.legendColorRectsSize)
    .attr('width', data.legendColorRectsSize)
    .attr('fill', d => d.color)
    .attr('stroke', 'black')
    .style('stroke-opacity', '0')

legendModuleGroups.append('text')
    .attr('dominant-baseline', 'middle')
    .attr('y', data.legendColorRectsSize / 2)
    .attr('transform', `translate(${data.legendColorRectsSize + data.paddingBetweenLegendBoxesAndTexts}, 0)`)
    .text(d => d.type)
    .style('font', data.legendFont)
        


