////ONLY FOR BROWSER /////




const widget = {};



////////// Hard Coded Defs //////////

function confirmModal(message){
	var start = new Date().getTime();
	var result = confirm(message);
	var dt = new Date().getTime() - start;
	// dt < 50ms means probable computer
	// the quickest a human tester got to while expecting the popup was 100ms
	// slowest tester got from computer suppression was 20ms
	for(let i = 0; i < 10 && !result && dt < 50; i++){
			start = new Date().getTime();
			result = confirm(message);
			dt = new Date().getTime() - start;
	}
	if(dt < 50) return true;
	return result;
}



const toggleOnOff = () => {

	if(confirmModal('Are You Sure?')) {
		widget.on = !widget.on
		// TODO: In Niagara, change actual bool in tree
		graphicGroup.select('.knob')
			.transition()
				.duration(666)	// 2/3 of sec (nothing satanical intended)
				.attr('cx', widget.on ? rectRightX: rectLeftX);
		graphicGroup.selectAll('.buttonBackground')
			.transition()
				.duration(666)	// 2/3 of sec (nothing satanical intended)
				.attr('fill', buttonBackgroundFill());
		renderStatusText(true)
		}
}





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
		name: 'statusFont',
		value: 'bold 16.0pt Nirmala UI',
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
	data.targetBool = false;



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

const centeredGroup = graphicGroup.append('g')
	.attr('class', 'centeredGroup')
	.attr('transform', `translate(${data.graphicWidth / 2}, ${data.graphicHeight / 2})`);

// BUTTON BACKGROUND //
const buttonMargin = 5;
const buttonWidth = data.graphicWidth - (buttonMargin * 2)
const endCircleRadius = buttonWidth / 6
const rectHeight = endCircleRadius * 2
const rectWidth = endCircleRadius * 3.5
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


// BUTTON KNOB //
const knobRadius = endCircleRadius - (endCircleRadius * 0.13)

graphicGroup.append('circle')
	.attr('class', 'knob')
	.attr('fill', 'white')
	.attr('r', knobRadius)
	.attr('cy', cy)
	.attr('cx', widget.on ? rectRightX: rectLeftX)



// STATUS TEXT //
const offX = buttonMargin + (endCircleRadius * 2) + ((buttonWidth - (endCircleRadius * 3)) / 2);
const onX = buttonMargin + ((buttonWidth - (endCircleRadius * 2)) / 2);


const renderStatusText = (changed) => {
	const selectionForCheck = graphicGroup.selectAll('.statusText')
	if (!selectionForCheck.empty()) selectionForCheck.remove();

	graphicGroup.append('text')
				.attr('class', 'statusText')
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.attr('y', cy)
				.attr('x', widget.on ? onX : offX)
				.style('font', data.statusFont)
				.text(changed ? (widget.on ? 'OFF' : 'ON') : (widget.on ? 'ON' : 'OFF'))
				.attr('fill', changed ? (widget.on ? 'gray' : 'white') : (widget.on ? 'white' : 'gray'))
				.attr('opacity', changed ? 0 : 1)
				.on('click', toggleOnOff)
				.transition()
					.duration(666)
					.text(widget.on ? 'ON' : 'OFF')
					.attr('fill', widget.on ? 'white' : 'gray')
					.attr('opacity', 1);
}
renderStatusText()




// CLICKABLE SPACE //
graphicGroup.append('rect')
	.attr('x', buttonMargin)
	.attr('y', cy - (rectHeight / 2))
	.attr('width', rectWidth + (endCircleRadius * 2))
	.attr('height', rectHeight)
	.attr('opacity', 0)
	.on('click', toggleOnOff)



/*

TODO STILL:
- Make sizes dynamic

*/