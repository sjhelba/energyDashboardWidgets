// DEFS
const enabledIcon = './images/enabledIcon.png';
const disabledIcon = './images/disabledIcon.png';
const graphicHeight = 400;
const graphicWidth = 500
const svg = d3.select('body').append('svg').attr('width', graphicWidth).attr('height', graphicHeight)
const outerRadius = 100;
const innerRadius = 60;
const arcThickness = outerRadius - innerRadius;
const disabledHours = 1.4;
const enabledHours = 8;
const data = [disabledHours, enabledHours];
const percent = d3.format('.0%')(data[1] / (data[0] + data[1]));
const enabledColor = 'blue';
const disabledColor = 'orange';
const percentageFont = '32.0pt Nirmala UI'
const currentStateTextFont = 'bold 13.0pt Nirmala UI';
const currentStateHeight = 50;
const currentStateWidth = 200;
const paddingUnderCurrentState = 30;
const currentlyIsEnabled = true;

const margin = {top: 20, left: 20};

// GENERATORS ETC
const arcsDataGenerator = d3.pie().value(d => d).sort((a, b) => -1)
const arcsData = arcsDataGenerator(data);
const arcPathGenerator = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(arcThickness / 2) // arcThickness / 2 is max roundedness possible

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
    .attr('fill', (d, i) => i === 0 ? enabledColor : disabledColor);


// LABELS
const centerOfDisabledPath = {}, centerOfEnabledPath = {}, disabledL = {}, enabledL = {};

// get center of arcs (note switch of 0 and 1 index)
[centerOfDisabledPath.x, centerOfDisabledPath.y] = arcPathGenerator.centroid(arcsData[1])
[centerOfEnabledPath.x, centerOfEnabledPath.y] = arcPathGenerator.centroid(arcsData[0])

// get x2 and y2 for 'to Arc' paths
disabledL.y = centerOfDisabledPath.y < 1 ? 'up' : 'down'; // up if y of centroid of disabled path is halfway or above center of donut
enabledL.y = centerOfEnabledPath.y < 1 ? 'up' : 'down'; // up if y of centroid of enabled path is halfway or above center of donut
disabledL.x = centerOfDisabledPath.x > 0 ? 'right' : 'left'; // to right if x of centroid of disabled path is to the right of the center of donut
enabledL.x = centerOfDisabledPath.x > 0 ? 'right' : 'left';  // to right if x of centroid of enabled path is to the right of the center of donut


const disabledToArcPath = donutGroup.append('path')
    .attr('d', `M${centerOfDisabledPath.x},${centerOfDisabledPath.y}L${centerOfDisabledPath.x + (arcThickness)},${centerOfDisabledPath.y - (arcThickness / 2)}`)
    .attr('stroke', 'black')

const enabledToArcPath = donutGroup.append('path')
    .attr('d', `M${centerOfDisabledPath.x},${centerOfDisabledPath.y}L${centerOfDisabledPath.x + (arcThickness)},${centerOfDisabledPath.y - (arcThickness / 2)}`)
    .attr('stroke', 'black')



// const disabledTextPath = svg.append('path')
//     .attr('id', 'disabledTextPath')
// const enabledTextPath = svg.append('path')
//     .attr('id', 'enabledTextPath')
// const disabledText = svg.append('text')
//     .attr("xlink:href","#disabledTextPath")
//     .text(disabledHours + 'HOURS')
// const enabledText = svg.append('text')
//     .attr("xlink:href","#enabledTextPath")
//     .text(enabledHours + 'HOURS')


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