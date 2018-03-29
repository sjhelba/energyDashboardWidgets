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
		name: 'boolOrd',
		value: 'default/ord/path'
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
data.margin = {top: 5, left: 5, right: 5, bottom: (jqHeight * 0.02) + 5};
data.graphicHeight = jqHeight - (data.margin.top + data.margin.bottom);
data.graphicWidth = jqWidth - (data.margin.left + data.margin.right);

  // GLOBALS PER INSTANCE //



  // FAKE DATA //
	data.targetBool = true;



  // CALCULATED DEFS //
  if (!widget.on) widget.on = data.targetBool;





////////////////////////////////////////////////////////////////
	// Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
////////////////////////////////////////////////////////////////

 // INITIALIZATION //
const outerDiv = d3.select('#outer')
	.style('height', jqHeight + 'px')
	.style('width', jqWidth + 'px');
widget.svg = outerDiv.append('svg')
	.attr('class', 'log')
	.attr('width', '100%')
	.attr('height', '98%');
d3.select(widget.svg.node().parentNode).style('background-color', data.backgroundColor);


// GRAPHIC GROUP //
const graphicGroup = widget.svg.append('g').attr('class', 'graphicGroup');
const graphicRectForTestingOnly = graphicGroup.append('rect')	//TODO: Remove
	.attr('fill', 'none')
	.attr('stroke', 'black')
	.attr('height', data.graphicHeight)
	.attr('width', data.graphicWidth);

const centeredGroup = graphicGroup.append('g')
	.attr('class', 'centeredGroup')
	.attr('transform', `translate(${data.graphicWidth / 2}, ${data.graphicHeight / 2})`);

// BUTTON BACKGROUND //
const buttonMargin = 5;
const buttonWidth = data.graphicWidth - (buttonMargin * 2)
const endCircleRadius = buttonWidth / 6
const rectHeight = endCircleRadius * 2
const rectWidth = endCircleRadius * 4
const buttonBackgroundFill = () => widget.on ? '#66FF00' : '#D3D3D3';
const cy = ((data.graphicHeight / 2) + (rectHeight / 2)) - buttonMargin
const rectLeftX = buttonMargin + endCircleRadius;
const rectRightX = rectLeftX + rectWidth

graphicGroup.append('rect')
	.attr('class', 'buttonBackground')
	.attr('x', rectLeftX)
	.attr('y', cy - (rectHeight / 2))
	.attr('width', rectWidth)
	.attr('height', rectHeight)
	.attr('fill', buttonBackgroundFill())

graphicGroup.append('circle')
	.attr('class', 'buttonBackground')
	.attr('cx', rectLeftX)
	.attr('cy', cy)
	.attr('r', endCircleRadius)
	.attr('fill', buttonBackgroundFill())

graphicGroup.append('circle')
	.attr('class', 'buttonBackground')
	.attr('cx', rectRightX)
	.attr('cy', cy)
	.attr('r', endCircleRadius)
	.attr('fill', buttonBackgroundFill())


// BUTTON KNOB
const knobRadius = endCircleRadius - (endCircleRadius * 0.13)

graphicGroup.append('circle')
	.attr('class', 'knob')
	.attr('fill', 'white')
	.attr('r', knobRadius)
	.attr('cy', cy)
	.attr('cx', widget.on ? rectRightX: rectLeftX)



// CLICKABLE SPACE
graphicGroup.append('rect')
	.attr('x', buttonMargin)
	.attr('y', cy - (rectHeight / 2))
	.attr('width', rectWidth + (endCircleRadius * 2))
	.attr('height', rectHeight)
	.attr('opacity', 0)
	.on('click', function(){
		widget.on = !widget.on
		// TODO: In Niagara, change actual bool in tree
		graphicGroup.select('.knob')
			.transition()
				.attr('cx', widget.on ? rectRightX: rectLeftX);
		graphicGroup.selectAll('.buttonBackground')
			.transition()
				.attr('fill', buttonBackgroundFill());
	})



/*

TODO STILL:
- Make popup window give Are you sure options
- Attach off and on texts
- Fix properties
- Make sizes dynamic


*/