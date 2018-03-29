////ONLY FOR BROWSER /////

const widget = {};



////////// Hard Coded Defs //////////
  


////////////////////////////////////////////////////////////////
	// Define Widget Constructor & Exposed Properties
////////////////////////////////////////////////////////////////
const properties = [
	{
		name: 'backgroundColor',
		value: 'white',
		typeSpec: 'gx:Color'
	},
	{
		name: 'includeCTFs',
		value: true
	},
	{
		name: 'tooltipFillColor',
		value: '#f2f2f2',
		typeSpec: 'gx:Color'
	},
	{
		name: 'paddingUnderLegendText',
		value: 5
	},
	{
		name: 'modulePercentFont',
		value: '26.0pt Nirmala UI',
		typeSpec: 'gx:Font'
	}
];


////////////////////////////////////////////////////////////////
	// /* SETUP DEFINITIONS AND DATA */
////////////////////////////////////////////////////////////////
	// FROM USER // 
const data = {};
properties.forEach(prop => data[prop.name] = prop.value);

  // FROM JQ //
const jqHeight = 150;
const jqWidth = 150;

  // SIZING //
data.margin = {top: 5, left: 5, right: 5, bottom: (height * 0.02) + 5};
data.graphicHeight = jqHeight - (data.margin.top + data.margin.bottom);
data.graphicWidth = jqWidth - (data.margin.left + data.margin.right);

  // GLOBALS PER INSTANCE //
if (!widget.hovered) widget.hovered = { optimized: false, standard: false, current: 'neither' };
if (!widget.activeModule) widget.activeModule = 'none';
if (!widget.percentIsHovered) widget.percentIsHovered = false;

  // FAKE DATA //




  // CALCULATED DEFS //
  





////////////////////////////////////////////////////////////////
	// Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
////////////////////////////////////////////////////////////////

 // INITIALIZATION //
const outerDiv = d3.select('#outer')
    .style('height', height + 'px')
    .style('width', width + 'px');
widget.svg = outerDiv.append('svg')
    .attr('class', 'log')
    .attr('width', '95%')
    .attr('height', '95%');
d3.select(widget.svg.node().parentNode).style('background-color', data.backgroundColor);


// GRAPHIC GROUP FOR TESTING //
const graphicGroup = widget.svg.append('g').attr('class', 'graphicGroup');
const graphicRectForTestingOnly = graphicGroup.append('rect')	//TODO: Remove
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('height', data.graphicHeight)
    .attr('width', data.graphicWidth);








