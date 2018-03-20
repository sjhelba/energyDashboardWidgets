// DEFS
const optimizedIcon = './images/leaf_green.svg';
const standardIcon = './images/leaf_grey.svg';
const graphicHeight = 400;
const graphicWidth = 600;
const svg = d3.select('body').append('svg').attr('class', 'log').attr('width', graphicWidth).attr('height', graphicHeight)
const overallArcThickness = 40;
const overallInnerRadius = 80;
const overallOuterRadius = overallInnerRadius + overallArcThickness;

const arcOpacity = 0.9

const tooltipHeaderFont = '12pt Nirmala UI';
const tooltipFont = '10pt Nirmala UI'

const legendWidth = 100;
const legendHeight = 120;

const tooltipHeight = 130;
const tooltipWidth = 150;
const tooltipPadding = 20;
const tooltipFillOpacity = 0.95


const paddingBetweenOverallAndModuleArcs = 7;
const paddingBetweenStandardAndOptimizedArcs = 0.08;

const moduleArcThickness = 10;
const moduleInnerRadius = overallOuterRadius + paddingBetweenOverallAndModuleArcs;
const moduleOuterRadius = moduleInnerRadius + moduleArcThickness;

const standardHours = 1;
const optimizedHours = 8;
const overallData = [{category: 'standard', hours: standardHours}, {category: 'optimized', hours: optimizedHours}];
const percent = d3.format('.0%')(overallData[1].hours / (overallData[0].hours + overallData[1].hours));
const standardColor = '#ff8600';
const optimizedColor = 'rgb(44, 139, 246)';
const percentageFont = '32.0pt Nirmala UI'
const currentStateTextFont = 'bold 13.0pt Nirmala UI';
const hoursFont = '12.0pt Nirmala UI';
const legendFont = '12.0pt Nirmala UI';
const currentStateHeight = 50;
const currentStateWidth = 200;
const paddingUnderLegend = 0;
const currentlyIsOptimized = true;
const active = {optimized: false, standard: false, current: 'optimized'};

const margin = {top: 20, left: 50, right: 20};

const getStartingCoordinatesOfPath = path => {
    return {
        x: path.node().getPointAtLength(0).x,
        y: path.node().getPointAtLength(0).y
    }
};

const CHS = {type: 'CHS', optimizedHours: 80, standardHours: 20, color: '#0ece2b'};
const PCP = {type: 'PCP', optimizedHours: 60, standardHours: 40, color: '#060084'};
const SCP = {type: 'SCP', optimizedHours: 90, standardHours: 10, color: '#5fdaef'};
const CDP = {type: 'CDP', optimizedHours: 75, standardHours: 25, color: '#e26302'};
const CT = {type: 'CT', optimizedHours: 95, standardHours: 5, color: '#f92f2f'};

const modulesData = [];
modulesData.push(CHS, PCP, SCP, CDP, CT);


// APPENDING

const graphicGroup = svg.append('g').attr('class', 'graphicGroup')
const graphicRectForTestingOnly = graphicGroup.append('rect')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('height', graphicHeight)
    .attr('width', graphicWidth)

const currentStateGroup = graphicGroup.append('g')
    .attr('class', 'currentStateGroup')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

const allDonutGroupsGroup = graphicGroup.append('g')
    .attr('class', 'allDonutGroupsGroup')
    .attr('transform', `translate(${margin.left + tooltipWidth + (moduleOuterRadius)}, ${margin.top + legendHeight + paddingUnderLegend + moduleOuterRadius})`)


// ARCS

//overall arcs
    //group
const overallDonutGroup = allDonutGroupsGroup.append('g')
    .attr('class', 'overallDonutGroup');

    // generators
const overallArcsDataGenerator = d3.pie()
    .value(d => d.hours)
    .sort((a, b) => -1)
    .padAngle(paddingBetweenStandardAndOptimizedArcs)
const overallArcPathGenerator = d3.arc()
    .innerRadius(overallInnerRadius)
    .outerRadius(overallOuterRadius);
    

    //paths
const overallArcPaths = overallDonutGroup.selectAll('.overallPath')
    .data(overallArcsDataGenerator(overallData))
    .enter().append('path')
        .attr('d', overallArcPathGenerator)
        .attr('class', (d, i) => overallData[i].category === 'standard' ? 'standardArcPath overallPath standardPath' : 'optimizedArcPath overallPath optimizedPath')
        .attr('fill', (d, i) => overallData[i].category === 'optimized' ? optimizedColor : standardColor)
        .style('fill-opacity', (d, i) => active[overallData[i].category] ? 1 : arcOpacity);


    // get start and end angles of overall arc paths
const angles = {optimized: {start: 0, end: 0}, standard: {start: 0, end: 0}};
overallArcPaths.filter((d, i) => {
    angles[overallData[i].category].start = d.startAngle;
    angles[overallData[i].category].end = d.endAngle;
})

    //get centroids of overall arc paths
const [standardCentroidXCoord, optimizedCentroidXCoord] = overallArcsDataGenerator(overallData).map((d, i) => overallArcPathGenerator.centroid(d)[0])
    //centroids on left or right of chart (for tooltip placement)
const isCentroidOnLeft = {standard: standardCentroidXCoord < 0, optimized: optimizedCentroidXCoord < 0};

//standard module arcs
    //group
const standardDonutGroup = allDonutGroupsGroup.append('g')
    .attr('class', 'standardDonutGroup')

    // generators
const standardArcsDataGenerator = d3.pie()
    .value(d => d.standardHours)
    .sort((a, b) => -1)
    .startAngle(angles.standard.start + (paddingBetweenStandardAndOptimizedArcs / 2))
    .endAngle(angles.standard.end - (paddingBetweenStandardAndOptimizedArcs / 2));

const standardArcPathGenerator = d3.arc()
    .innerRadius(moduleInnerRadius)
    .outerRadius(moduleOuterRadius);
    
    //paths
const standardArcPaths = standardDonutGroup.selectAll('.standardPath')
    .data(standardArcsDataGenerator(modulesData))
    .enter().append('path')
        .attr('d', standardArcPathGenerator)
        .attr('class', (d, i) => `${modulesData[i].type}ArcPath standardModulePath standardPath`)
        .attr('fill', (d, i) => modulesData[i].color)
        .style('fill-opacity', (d, i) => active.standard ? 1 : 0.5);




//optimized module arcs
    //group
const optimizedDonutGroup = allDonutGroupsGroup.append('g')
    .attr('class', 'optimizedDonutGroup')

    // generators
const optimizedArcsDataGenerator = d3.pie()
    .value(d => d.optimizedHours)
    .sort((a, b) => -1)
    .startAngle(angles.optimized.start + (paddingBetweenStandardAndOptimizedArcs / 2))
    .endAngle(angles.optimized.end - (paddingBetweenStandardAndOptimizedArcs / 2));

const optimizedArcPathGenerator = d3.arc()
    .innerRadius(moduleInnerRadius)
    .outerRadius(moduleOuterRadius);
    
    //paths
const optimizedArcPaths = optimizedDonutGroup.selectAll('.optimizedPath')
    .data(optimizedArcsDataGenerator(modulesData))
    .enter().append('path')
        .attr('d', optimizedArcPathGenerator)
        .attr('class', (d, i) => `${modulesData[i].type}ArcPath optimizedModulePath optimizedPath`)
        .attr('fill', (d, i) => modulesData[i].color)
        .style('fill-opacity', (d, i) => active.optimized ? 1 : arcOpacity);













// PERCENT

const percentageText = overallDonutGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font', percentageFont)
    .text(percent);


// CURRENT STATE

const currentStateImage = currentStateGroup.append('svg:image')
    .attr('xlink:href', currentlyIsOptimized ? optimizedIcon : standardIcon)
    .attr('x', 0)
    .attr('y', currentStateHeight * 0.125)
    .attr('height', currentStateHeight * .75)
    .attr('width', currentStateWidth / 4)


const currentStateText = currentStateGroup.append('text')
    .attr('transform', `translate(${(currentStateWidth / 4) + 2}, 0)`)
    .attr('y', currentStateHeight / 2)
    .attr('dominant-baseline', 'middle')
    .style('font', currentStateTextFont)
    .text('Optimization ' + (currentlyIsOptimized ? 'Enabled' : 'Disabled'));



// TOOLTIPS AND ARC HOVERS
function renderTooltip () {

    //make sure to change checker for Niagara:
    const selectionForCheck = d3.select('.tooltipGroup')
    if (!selectionForCheck.empty()) selectionForCheck.remove();
    const tooltipGroup = allDonutGroupsGroup.append('g')
        .attr('class', 'tooltipGroup')
        .style('opacity', active.optimized || active.standard ? 1 : 0)
        .attr('transform', `translate(${isCentroidOnLeft[active.current] ? -(moduleOuterRadius + tooltipWidth + 10): moduleOuterRadius + 10}, ${-(tooltipHeight / 2)})`)


    tooltipGroup.append("polygon")
        .attr('points', active.optimized ? `${tooltipWidth - 10},0 ${tooltipWidth + 15},0, ${tooltipWidth - 10},40` : `-15,0 10,0, 10,40`)
        .attr('fill', '#f2f2f2')
        .attr("rx", 10)
        .attr("ry", 10)

    const tooltipRect = tooltipGroup.append('rect')
        .attr('height', tooltipHeight)
        .attr('width', tooltipWidth)
        .attr('fill', '#f2f2f2')
        .style('opacity', active.optimized || active.standard ? tooltipFillOpacity : 0)
        // .attr('stroke', 'black')
        .attr("rx", 10)
        .attr("ry", 10);





    const tooltipText = tooltipGroup.append('text')
        .attr('dominant-baseline', 'hanging')
        .attr('x', 10)
        .attr('y', 0)
        .style('font', tooltipFont);


        //tspans
    tooltipText.append('tspan')
        .attr('class', 'category')
        .text(`${active.current.toUpperCase()}:`)
        .attr('x', 10)
        .attr('y', 0)
        .attr('fill', active.optimized ? optimizedColor : standardColor)
        .style('font', tooltipHeaderFont)
        .style('font-weight', 'bold')
        .style('text-decoration', 'underline');

    const typeTspans = tooltipText.selectAll('.type')
        .data(modulesData)
        .enter().append('tspan')
            .attr('class', '.data .type')
            .text(d => `${d.type}:`)
            .attr('x', 10)
            .attr('y', (d, i) => 3 + tooltipPadding * (i + 1))
            .style('font-weight', 'bold')
    const typeTspansBBoxes = typeTspans.nodes().map(tspan => tspan.getBoundingClientRect());

    const hoursTspans = tooltipText.selectAll('.hours')
        .data(modulesData)
        .enter().append('tspan')
            .attr('class', '.data .hours')
            .text(d => `${d[`${active.current}Hours`]} HRS`)
            .attr('x', (d, i) => 20 + typeTspansBBoxes[0].width)
            .attr('y', (d, i) => 3 + tooltipPadding * (i + 1))
    const hoursTspansBBoxes = hoursTspans.nodes().map(tspan => tspan.getBoundingClientRect());

    tooltipText.selectAll('.percents')
        .data(modulesData)
        .enter().append('tspan')
            .attr('class', '.data .percents')
            .text(d => `${100 * (d[`${active.current}Hours`] / (d.standardHours + d.optimizedHours))}%`)
            .attr('x', (d, i) => 35 + typeTspansBBoxes[0].width + hoursTspansBBoxes[0].width)
            .attr('y', (d, i) => 3 + tooltipPadding * (i + 1))
}
renderTooltip();

    // events


const optimizedPaths = d3.selectAll('.optimizedPath')
    .on('mouseenter', function(){
        active.optimized = true;
        active.current = 'optimized'

        optimizedPaths.style('fill-opacity', 1);
        renderTooltip()
    })
    .on('mouseleave', function(){
        active.optimized = false;

        optimizedPaths.style('fill-opacity', arcOpacity);
        renderTooltip()
    });
const standardPaths = d3.selectAll('.standardPath')
    .on('mouseenter', function(){
        active.standard = true;
        active.current = 'standard'

        standardPaths.style('fill-opacity', 1);
        renderTooltip()
    })
    .on('mouseleave', function(){
        active.standard = false;

        standardPaths.style('fill-opacity', arcOpacity);
        renderTooltip()
    });









// LEGEND

const legendGroup = graphicGroup.append('g').attr('transform', `translate(${graphicWidth - (legendWidth + margin.right)}, ${margin.top})`);
const legendTextPadding = 7
const legendColorRectsSize = 15
    
const legendModuleGroups = legendGroup.selectAll('.legendModuleGroup')
    .data(modulesData)
    .enter().append('g')
        .attr('class', d => `legendModuleGroup .${d.type}LegendModuleGroup`)
        .attr('transform', (d, i) => `translate(7, ${(i * legendTextPadding) + (i * legendColorRectsSize) + 5})`)
        .on('mouseenter', function(d){
            const that = d3.select(this);
            that.selectAll('rect').style('stroke-opacity', '1')
            that.selectAll('text').style('font-weight', 'bold')
            svg.selectAll(`.${d.type}ArcPath`).style('fill-opacity', 1);
        })
        .on('mouseleave', function(d){
            const that = d3.select(this);
            that.selectAll('rect').style('stroke-opacity', '0')
            that.selectAll('text').style('font-weight', 'normal')
            svg.selectAll(`.${d.type}ArcPath`).style('fill-opacity', 0.5);
        })

legendModuleGroups.append('rect')
    .attr('height', legendColorRectsSize)
    .attr('width', legendColorRectsSize)
    .attr('fill', d => d.color)
    .attr('stroke', 'black')
    .style('stroke-opacity', '0')

legendModuleGroups.append('text')
    .attr('dominant-baseline', 'middle')
    .attr('y', legendColorRectsSize / 2)
    .attr('transform', `translate(${legendColorRectsSize + 7}, 0)`)
    .text(d => d.type)
    .style('font', legendFont)
        

















