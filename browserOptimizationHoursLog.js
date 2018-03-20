// DEFS
const optimizedIcon = './images/leaf_green.svg';
const standardIcon = './images/leaf_grey.svg';

const data = {};

data.graphicHeight = 400;
data.graphicWidth = 450;



const widget = {};
widget.svg = d3.select('body').append('svg')
    .attr('class', 'log')
    .attr('width', data.graphicWidth)
    .attr('height', data.graphicHeight)






const overallArcThickness = 40;
const overallInnerRadius = 100;
const overallOuterRadius = overallInnerRadius + overallArcThickness;

const normalArcOpacity = 0.9
const theUnhoveredArcOpacity = 0.5

const tooltipHeaderFont = '12pt Nirmala UI';
const tooltipFont = '10pt Nirmala UI'

const legendWidth = 80;
const legendHeight = 120;

const tooltipDiameter = 180;
const tooltipPadding = 20;

const currentStateHeight = 40;
const currentStateWidth = 200;
const paddingUnderCurrentState = 0;
const paddingLeftOfLegend = 10;

const paddingBetweenOverallAndModuleArcs = 7;
const paddingBetweenStandardAndOptimizedArcs = 0.08;

const moduleArcThickness = 10;
const moduleInnerRadius = overallOuterRadius + paddingBetweenOverallAndModuleArcs;
const moduleOuterRadius = moduleInnerRadius + moduleArcThickness;
const hoveredOuterRadius = moduleOuterRadius + moduleArcThickness;


const CHS = {type: 'CHs', optimizedHours: 80, standardHours: 20, color: '#0ece2b', displayName: 'Chillers'};
const PCP = {type: 'PCPs', optimizedHours: 60, standardHours: 40, color: '#060084', displayName: 'Pri Pumps'};
const SCP = {type: 'SCPs', optimizedHours: 90, standardHours: 10, color: '#5fdaef', displayName: 'Sec Pumps'};
const CDP = {type: 'CDPs', optimizedHours: 75, standardHours: 25, color: '#e26302', displayName: 'Cdp Pumps'};
const CT = {type: 'CTFs', optimizedHours: 95, standardHours: 5, color: '#f92f2f', displayName: 'Towers'};

const modulesData = [];
modulesData.push(CHS, PCP, SCP, CDP, CT);


const standardHours = modulesData.reduce((accum, curr) => accum + curr.standardHours, 0) || 1;
const optimizedHours = modulesData.reduce((accum, curr) => accum + curr.optimizedHours, 0) || 8;
const overallData = [{category: 'standard', hours: standardHours}, {category: 'optimized', hours: optimizedHours}];
const percent = d3.format('.0%')(overallData[1].hours / (overallData[0].hours + overallData[1].hours));
const standardColor = '#ff8600';
const optimizedColor = 'rgb(44, 139, 246)';
const percentageFont = '38.0pt Nirmala UI'
const currentStateTextFont = 'bold 13.0pt Nirmala UI';
const hoursFont = '12.0pt Nirmala UI';
const legendFont = '12.0pt Nirmala UI';

const currentlyIsOptimized = true;
const hovered = {optimized: false, standard: false, current: 'neither'};

const margin = {top: 5, left: 5, right: 5};

const getStartingCoordinatesOfPath = path => {
    return {
        x: path.node().getPointAtLength(0).x,
        y: path.node().getPointAtLength(0).y
    }
};




// APPENDING

const graphicGroup = widget.svg.append('g').attr('class', 'graphicGroup')
const graphicRectForTestingOnly = graphicGroup.append('rect')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('height', data.graphicHeight)
    .attr('width', data.graphicWidth)

const currentStateGroup = graphicGroup.append('g')
    .attr('class', 'currentStateGroup')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

const allDonutGroupsGroup = graphicGroup.append('g')
    .attr('class', 'allDonutGroupsGroup')
    .attr('transform', `translate(${margin.left + hoveredOuterRadius}, ${margin.top + currentStateHeight + paddingUnderCurrentState + hoveredOuterRadius})`)


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
        .style('fill-opacity', (d, i) => hovered[overallData[i].category] ? 1 : normalArcOpacity);


    // get start and end angles of overall arc paths
const angles = {optimized: {start: 0, end: 0}, standard: {start: 0, end: 0}};
overallArcPaths.filter((d, i) => {
    angles[overallData[i].category].start = d.startAngle;
    angles[overallData[i].category].end = d.endAngle;
})



// module arcs
const moduleArcPathGenerator = d3.arc()
    .innerRadius(moduleInnerRadius)
    .outerRadius(moduleOuterRadius);

const hoveredModuleArcPathGenerator = d3.arc()
    .innerRadius(moduleOuterRadius && moduleInnerRadius) // ASK DREW IF HE PREFERS MOVE (moduleOuterRadius) OR GROW (moduleInnerRadius)
    .outerRadius(hoveredOuterRadius);

    //standard module arcs
        //group
const standardDonutGroup = allDonutGroupsGroup.append('g')
    .attr('class', 'standardDonutGroup')

      // generator
const standardArcsDataGenerator = d3.pie()
    .value(d => d.standardHours)
    .sort((a, b) => -1)
    .startAngle(angles.standard.start + (paddingBetweenStandardAndOptimizedArcs / 2))
    .endAngle(angles.standard.end - (paddingBetweenStandardAndOptimizedArcs / 2));

    
     //paths
const standardArcPaths = standardDonutGroup.selectAll('.standardPath')
    .data(standardArcsDataGenerator(modulesData))
    .enter().append('path')
        .attr('d', moduleArcPathGenerator)
        .attr('class', (d, i) => `${modulesData[i].type}ArcPath modulePath standardModulePath standardPath`)
        .attr('fill', (d, i) => modulesData[i].color)
        .style('fill-opacity', (d, i) => hovered.standard ? 1 : normalArcOpacity);




    //optimized module arcs
     //group
const optimizedDonutGroup = allDonutGroupsGroup.append('g')
    .attr('class', 'optimizedDonutGroup')

     // generator
const optimizedArcsDataGenerator = d3.pie()
    .value(d => d.optimizedHours)
    .sort((a, b) => -1)
    .startAngle(angles.optimized.start + (paddingBetweenStandardAndOptimizedArcs / 2))
    .endAngle(angles.optimized.end - (paddingBetweenStandardAndOptimizedArcs / 2));


        //paths
const optimizedArcPaths = optimizedDonutGroup.selectAll('.optimizedPath')
    .data(optimizedArcsDataGenerator(modulesData))
    .enter().append('path')
        .attr('d', moduleArcPathGenerator)
        .attr('class', (d, i) => `${modulesData[i].type}ArcPath modulePath optimizedModulePath optimizedPath`)
        .attr('fill', (d, i) => modulesData[i].color)
        .style('fill-opacity', (d, i) => hovered.optimized ? 1 : normalArcOpacity);













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
    .attr('height', currentStateHeight * 0.85)
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
    const selectionForCheck = widget.svg.select('.tooltipGroup')
    if (!selectionForCheck.empty()) selectionForCheck.remove();

    const tooltipGroup = allDonutGroupsGroup.append('g')
        .attr('class', 'tooltipGroup')
        .style('opacity', hovered.optimized || hovered.standard ? 1 : 0)


    const tooltipCircle = tooltipGroup.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', tooltipDiameter / 2)
        .attr('fill', '#f2f2f2')
        .style('opacity', hovered.optimized || hovered.standard ? 1 : 0)



    const tooltipTextGroup = tooltipGroup.append('g')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', 0)
        .attr('y', 0)
        .style('font', tooltipFont)
        .attr('transform', `translate(0, -${tooltipDiameter / 4})`);


        //text
            //either current or optimized
    tooltipTextGroup.append('text')
        .attr('class', 'category')
        .text(`${hovered.current.toUpperCase()}:`)
        .attr('fill', hovered.optimized ? optimizedColor : standardColor)
        .style('font', tooltipHeaderFont)
        .style('font-weight', 'bold')
        .style('text-decoration', 'underline');

    const tooltipModuleGroups = tooltipTextGroup.selectAll('g')
        .data(modulesData)
        .enter().append('g')
            .attr('class', d => `${d.type}tooltipTextGroup`)
            .attr('transform', `translate(-${tooltipDiameter / 4}, 0)`);

            

    const typeTexts = tooltipModuleGroups.append('text')
            .attr('class', '.data .type')
            .text(d => `${d.type}:`)
            .attr('x', 0)
            .attr('y', (d, i) => 3 + tooltipPadding * (i + 1))
            .style('font-weight', 'bold')
    const typeTextsBBoxes = typeTexts.nodes().map(text => text.getBoundingClientRect());

    const hoursTtexts = tooltipModuleGroups.append('text')
            .attr('class', '.data .hours')
            .text(d => `${d[`${hovered.current}Hours`]} HRS`)
            .attr('x', (d, i) => 20 + typeTextsBBoxes[0].width)
            .attr('y', (d, i) => 3 + tooltipPadding * (i + 1))
    const hoursTtextsBBoxes = hoursTtexts.nodes().map(text => text.getBoundingClientRect());

    tooltipModuleGroups.append('text')
            .attr('class', '.data .percents')
            .text(d => `${100 * (d[`${hovered.current}Hours`] / (d.standardHours + d.optimizedHours))}%`)
            .attr('x', (d, i) => 25 + typeTextsBBoxes[0].width + hoursTtextsBBoxes[0].width)
            .attr('y', (d, i) => 3 + tooltipPadding * (i + 1))
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









// LEGEND

const legendGroup = graphicGroup.append('g').attr('transform', `translate(${margin.left + (hoveredOuterRadius * 2) + paddingLeftOfLegend}, ${margin.top + currentStateHeight + paddingUnderCurrentState + moduleArcThickness})`);


const legendTextPadding = 7
const legendColorRectsSize = 15
    // legendGroup.append('rect').attr('height', legendHeight).attr('width', legendWidth)
const legendModuleGroups = legendGroup.selectAll('.legendModuleGroup')
    .data(modulesData)
    .enter().append('g')
        .attr('class', d => `legendModuleGroup .${d.type}LegendModuleGroup`)
        .attr('transform', (d, i) => `translate(7, ${(i * legendTextPadding) + (i * legendColorRectsSize) + 5})`)
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
        

















