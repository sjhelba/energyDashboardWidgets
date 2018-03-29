// DEFS
const enabledIcon = './images/leaf_green.svg';
const disabledIcon = './images/leaf_grey.svg';
const graphicHeight = 400;
const graphicWidth = 500
const svg = d3.select('body').append('svg').attr('class', 'log').attr('width', graphicWidth).attr('height', graphicHeight)
const outerRadius = 100;
const innerRadius = 60;
const arcThickness = outerRadius - innerRadius;
const disabledHours = 1.4;
const enabledHours = 8;
const data = [{category: 'disabledHours', hours: disabledHours}, {category: 'enabledHours', hours: enabledHours}];
const percent = d3.format('.0%')(data[1].hours / (data[0].hours + data[1].hours));
const enabledColor = 'blue';
const disabledColor = 'orange';
const percentageFont = '32.0pt Nirmala UI'
const currentStateTextFont = 'bold 13.0pt Nirmala UI';
const hoursFont = '12.0pt Nirmala UI';
const currentStateHeight = 50;
const currentStateWidth = 200;
const paddingUnderCurrentState = 30;
const currentlyIsEnabled = true;

const margin = {top: 20, left: 20};

const getStartingCoordinatesOfPath = path => {
    return {
        x: path.node().getPointAtLength(0).x,
        y: path.node().getPointAtLength(0).y
    }
};

let startAngle = {};

// GENERATORS ETC
const arcsDataGenerator = d3.pie().value(d => d.hours).sort((a, b) => -1)
const arcsData = arcsDataGenerator(data);
const arcPathGenerator = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(arcThickness / 2); // arcThickness / 2 is max roundedness possible



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
const donutGroup = graphicGroup.append('g')
    .attr('class', 'donutGroup')
    .attr('transform', `translate(${margin.left + (outerRadius * 2)}, ${margin.top + currentStateHeight + paddingUnderCurrentState + outerRadius})`)

// ARCS
const arcGroups = donutGroup.selectAll('.arc')
  .data(arcsData)
  .enter().append('g')
    .attr('class', 'arc')
    

const arcPaths = arcGroups.append('path')
    .attr('d', arcPathGenerator)
    .attr('id', (d, i) => i === 0 ? 'disabledArcPath' : 'enabledArcPath')
    .attr('fill', (d, i) => i === 0 ? enabledColor : disabledColor);

// get startAngle of paths
arcPaths.filter((d, i) => {
    startAngle[i] = arcPathGenerator.startAngle()(d);
})



const enabledArcPathGenerator = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle[1])
    .endAngle(startAngle[1] + 6);

const disabledArcPathGenerator = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle[0])
    .endAngle(startAngle[0] + 6);


const disabledArcPath = d3.select('#disabledArcPath');
const enabledArcPath = d3.select('#enabledArcPath');
const disabledArcPathStartingCoordinates = getStartingCoordinatesOfPath(disabledArcPath);
const enabledArcPathStartingCoordinates = getStartingCoordinatesOfPath(enabledArcPath);


const newArcsDataGenerator = d3.pie().value(d => d).sort((a, b) => -1)
const disabledTextPath = arcGroups.append('path')
    .data(newArcsDataGenerator([1]))
    .attr('id', 'disabledTextPath')
    .attr('d', disabledArcPathGenerator)
    .attr('fill', 'none');

const enabledTextPath = arcGroups.append('path')
    .attr('id', 'enabledTextPath')
    .attr('d', enabledArcPathGenerator)
    .attr('fill', 'none');


// LABELS

const disabledTextAbovePath = disabledArcPathStartingCoordinates.y < 0;
const enabledTextAbovePath = enabledArcPathStartingCoordinates.y < 0;

const disabledText = donutGroup.append('text').append("textPath")
    .attr("xlink:href", "#disabledTextPath") // ID of path text follows
    .text(disabledHours + ' HOURS')
    .attr("startOffset", (arcThickness / 4))
    .style('font', hoursFont)

const enabledText = donutGroup.append('text').append("textPath")
    .attr("xlink:href", "#enabledTextPath") // ID of path text follows
    .text(enabledHours + ' HOURS')
    .attr("startOffset", (arcThickness / 4))
    .style('font', hoursFont)



/* EXAMPLE */

/*

const titleOutput = chartGroup.append("text").append("textPath")
    .attr("xlink:href", "#titlePath") // ID of path text follows
    .style("text-anchor","middle")
    .attr("startOffset", "20%")
    .style('font', titleFont)
    .attr('fill', titleColor)
    .text(gaugeTitle);

const unitsOutput = chartGroup.append("text").append("textPath")
    .attr("xlink:href", "#unitsPath") // ID of path text follows
    .style("text-anchor","end")
    .attr("startOffset", "50%")
    .style('font', unitsFont)
    .attr('fill', unitsColor)
    .text(units);

*/




// PERCENT
const percentageText = donutGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font', percentageFont)
    .text(percent);


// CURRENT STATE
const currentStateImage = currentStateGroup.append('svg:image')
    .attr('xlink:href', currentlyIsEnabled ? enabledIcon : disabledIcon)
    .attr('x', 0)
    .attr('y', currentStateHeight * 0.125)
    .attr('height', currentStateHeight * .75)
    .attr('width', currentStateWidth / 4)


const currentStateText = currentStateGroup.append('text')
    .attr('transform', `translate(${(currentStateWidth / 4) + 2}, 0)`)
    .attr('y', currentStateHeight / 2)
    .attr('dominant-baseline', 'middle')
    .style('font', currentStateTextFont)
    .text('Optimization ' + (currentlyIsEnabled ? 'Enabled' : 'Disabled'))