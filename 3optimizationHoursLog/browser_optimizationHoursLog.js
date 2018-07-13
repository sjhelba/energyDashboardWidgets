const widget = {};  //TODO: remove for Niagara
const height = 410;
const width = 365;


/*** DEFS ***/

// hard coded
function makeDropdown(arrOfOptions = [], funcToRunOnSelection = valOfSelection => console.log('selected: ' + valOfSelection), elementToAppendTo = d3.select('svg'), x = 5, y = 50, leftAligned = true, minDropdownWidth = 125, horizontalPadding = 5, verticalPadding = 5, strokeColor = 'black', backgroundFill = 'white', hoveredFill = '#d5d6d4', font = '10.0pt Nirmala UI', textColor = 'black', defaultSelection, funcToRunOnOpen, funcToRunOnClose, arrOfArgsToPassInToFuncsAfterVal, dropdownBorderRadius = 5) {
	const arrowWidth = getTextWidth('8', font) / 1.5;
	const textWidth = (arrowWidth * 2) + arrOfOptions.reduce((accum, curr) => {
		let currTextWidth = getTextWidth(curr, font);
		return currTextWidth > accum ? currTextWidth : accum;
	}, 0);
	const textHeight = getTextHeight(font);
	const dropdownWidth = minDropdownWidth > textWidth + (horizontalPadding * 2) ? minDropdownWidth : textWidth + (horizontalPadding * 2);
	const rowHeight = textHeight + (verticalPadding * 2);
	const textY = verticalPadding + (textHeight / 2);
	let clickedSelection = defaultSelection || defaultSelection === 0 ? defaultSelection : arrOfOptions[0];
	const dropdownHeight = rowHeight * (arrOfOptions.length + 1);
	let open = false;
	function generatePath () {
		let x1, y1, x2, y2, x3, y3;
		x1 = dropdownWidth - (horizontalPadding + arrowWidth);
		x2 = x1 + arrowWidth;
		x3 = x1 + (arrowWidth / 2);
		y1 = textY;
		y2 = textY;
		y3 = textY + (arrowWidth / 2);
		return `M${x1},${y1} L${x2},${y2} L${x3},${y3} z`;
	}
	// dropdownGroup
	const dropdownGroup = elementToAppendTo.append('g')
		.attr('class', 'dropdownGroup')
		.attr('transform', `translate(${x + 6},${y + 6})`)
	//outer container
	const outerContainer = dropdownGroup.append('rect')
		.attr('class', 'outerContainerRect')
		.attr('width', dropdownWidth + 12)
		.attr('height', rowHeight + 12)
		.attr('fill', backgroundFill)
		.attr('rx', dropdownBorderRadius)
		.attr('stroke', strokeColor)
		.attr('x', - 6)
		.attr('y', - 6)
		.attr('stroke-width', '0.5px')
		.on('click', function () {
			toggleDrop()
		})
	//rows
	const dropdownRows = dropdownGroup.selectAll('.dropdownRows')
		.data(arrOfOptions)
		.enter().append('g')
			.attr('class', (d, i) => 'dropdownRows ' + i + 'dropdownRow')
			.attr('transform', (d, i) => open ? `translate(0, ${rowHeight * (i + 1)})` : 'translate(0,0)')
			.on('mouseenter', function() {
				dropdownRows.selectAll('rect').attr('fill', backgroundFill);
				d3.select(this).select('rect').attr('fill', hoveredFill);
			})
			.on('mouseleave', function() {
				d3.select(this).select('rect').attr('fill', backgroundFill);
			})
			.on('click', function (d) {
				changeClickedSelection(d);
				toggleDrop();
			});
	const rowRects = dropdownRows.append('rect')
		.attr('class', (d, i) => 'rowRect ' + i + 'rowRect')
		.attr('width', dropdownWidth)
		.attr('height', rowHeight)
		.attr('fill', d => d === clickedSelection ? hoveredFill : backgroundFill)
	dropdownRows.append('text')
		.attr('class', (d, i) => 'rowText ' + i + 'rowText')
		.text(d => d)
		.attr('dominant-baseline', 'middle')
		.attr('x', d => leftAligned ? horizontalPadding : (dropdownWidth / 2) - (getTextWidth(d, font) / 2))
		.attr('y', textY)
		.style('font', font)
		.style('fill', textColor)
		.style('cursor', 'default')
	// Selected window
	const selectedGroup = dropdownGroup.append('g')
		.attr('class', 'selectedGroup')
		.on('mouseenter', function() {
			selectedRect.attr('fill', hoveredFill);
		})
		.on('mouseleave', function() {
			if (!open) selectedRect.attr('fill', backgroundFill);
		})
		.on('click', function () {
			toggleDrop()
		});
	const selectedRect = selectedGroup.append('rect')
		.attr('class', 'selectedRect')
		.attr('width', dropdownWidth)
		.attr('height', rowHeight)
		.attr('fill', backgroundFill)
	const selectedText = selectedGroup.append('text')
		.attr('class', 'selectedText')
		.text(clickedSelection)
		.attr('dominant-baseline', 'middle')
		.attr('x', leftAligned ? horizontalPadding : ((dropdownWidth - (arrowWidth * 2)) / 2) - ((getTextWidth(clickedSelection, font)) / 2))
		.attr('y', textY)
		.style('font', font)
		.style('fill', textColor)
		.style('cursor', 'default')
	selectedGroup.append('path')
		.attr('class', 'arrowPath')
		.attr('d', generatePath())
		.attr('fill', textColor)
		.attr('stroke', textColor)
	function changeClickedSelection (newSelectionValue) {
		selectedRect.attr('fill', backgroundFill);
		clickedSelection = newSelectionValue;
		selectedText.text(clickedSelection);
		funcToRunOnSelection(newSelectionValue, ...arrOfArgsToPassInToFuncsAfterVal);
	}
	function toggleDrop () {
		open = !open;
		if (open) {
			funcToRunOnOpen(...arrOfArgsToPassInToFuncsAfterVal)
		} else {
			funcToRunOnClose(...arrOfArgsToPassInToFuncsAfterVal)
		}
		rowRects.attr('fill', d => d === clickedSelection ? hoveredFill : backgroundFill);
		outerContainer.transition()
			.attr('height', open ? dropdownHeight + 12: rowHeight + 12);
		dropdownRows.transition()
			.attr('transform', (d, i) => open ? `translate(0, ${rowHeight * (i + 1)})` : `translate(0,0)`);
	}
	return dropdownGroup;
}
const getTextWidth = (text, font) => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	context.font = font;
	const width = context.measureText(text).width;
	d3.select(canvas).remove()
	return width;
};
const getTextHeight = font => {
	let num = '';
	const indexOfLastDigit = font.indexOf('pt') - 1;
	for (let i = 0; i <= indexOfLastDigit; i++){
		if (!isNaN(font[i]) || font[i] === '.') num += font[i];
	}
	num = +num;
	return num * 1.33333333333;
};
const margin = { top: 5, left: 5, right: 5, bottom: (height * 0.02) + 5 };
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
	includeTWPs: true,
	includeCTFs: true,

	color_CHs: '#0ece2b',
	color_PCPs: '#060084',
	color_SCPs: '#5fdaef',
	color_TWPs: '#e26302',
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


const properties = [
	{
		name: 'dropdownFillColor',
		value: 'white',
		typeSpec: 'gx:Color'
	},
	{
		name: 'hoveredFillColor',
		value: '#d5d6d4',
		typeSpec: 'gx:Color'
	},
	{
		name: 'dropdownLabelColor',
		value: '#333333',
		typeSpec: 'gx:Color'
	},
	{
		name: 'dropdownTextColor',
		value: 'black',
		typeSpec: 'gx:Color'
	},
	{
		name: 'dropdownStrokeColor',
		value: 'black',
		typeSpec: 'gx:Color'
	},
	{
		name: 'dropdownLabelFont',
		value: 'bold 11pt Nirmala UI',
		typeSpec: 'gx:Font'
	},
	{
		name: 'dropdownFont',
		value: '11pt Nirmala UI',
		typeSpec: 'gx:Font'
	},
	{
		name: 'paddingLeftOfDropdowns',
		value: 5
	},
	{
		name: 'paddingUnderDropdownLabels',
		value: 8
	},
	{
		name: 'dateDropdownWidth',
		value: 100
	},
	{
		name: 'dropdownBorderRadius',
		value: 5
	},
	{
		name: 'paddingBetweenDropdowns',
		value: 25
	},
	{
		name: 'paddingUnderDropdowns',
		value: 15
	}
];

properties.forEach(prop => data[prop.name] = prop.value);

// other sources:

data.graphicHeight = height;
data.graphicWidth = width;

// globals per instance
data.hovered = { optimized: false, standard: false, current: 'neither' };
data.activeModule = 'none'
data.percentIsHovered = false;

// calculated
	// SIZING //
data.dropdownGroupHeight = margin.top + getTextHeight(data.dropdownLabelFont) + data.paddingUnderDropdownLabels + getTextHeight(data.dropdownFont) + data.paddingUnderDropdowns;
data.graphicHeight = data.graphicHeight - (data.dropdownGroupHeight + margin.top);
data.graphicWidth = data.graphicWidth - (margin.left + margin.right);



data.maxTooltipTextWidths = {
	type: getTextWidth('TWPs:', 'bold ' + data.tooltipFont),
	hours: getTextWidth('5555 HRS', data.tooltipFont),
	percent: getTextWidth('55%', data.tooltipFont)
};
data.totalTooltipTextWidth = data.maxTooltipTextWidths.type + data.maxTooltipTextWidths.hours + data.maxTooltipTextWidths.percent + (data.tooltipHorizontalTextPadding * 2);


const maxChartHeight = data.graphicHeight - (margin.top + margin.bottom + data.paddingAboveLegendBars + data.paddingUnderLegendText + data.moduleArcThickness)
const maxChartWidth = data.graphicWidth - (margin.left + margin.right);
console.log('maxHeight: ', maxChartHeight, 'maxWidth: ', maxChartWidth)
data.hoveredOuterRadius = maxChartHeight < maxChartWidth ? maxChartHeight / 2 : maxChartWidth / 2;
data.moduleOuterRadius = data.hoveredOuterRadius - data.moduleArcThickness;
data.moduleInnerRadius = data.moduleOuterRadius - data.moduleArcThickness;
data.overallOuterRadius = data.moduleInnerRadius - data.paddingBetweenOverallAndModuleArcs;
data.overallInnerRadius = data.overallOuterRadius - data.overallArcThickness;
data.tooltipDiameter = (data.overallInnerRadius * 2) - data.tooltipPadding || 180;



// IGNORE OLD DATA COLLECTION HERE FOR NIAGARA VERSION
// TODO: Calculate from data resolves and props 
//Chillers
const CHS = { type: 'CHs', optimizedHours: 1199, standardHours: 1200, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_CHs };
//Primary Pumps
const PCP = { type: 'PCPs', optimizedHours: 1500, standardHours: 1500, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_PCPs };
//Secondary Pumps
const SCP = { type: 'SCPs', optimizedHours: 2250, standardHours: 2750, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_SCPs };
//Condenser Pumps
const TWP = { type: 'TWPs', optimizedHours: 2450, standardHours: 250, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_TWPs };
//Chiller Towers
const CTF = { type: 'CTFs', optimizedHours: 1800, standardHours: 1200, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_CTFs };


data.modulesData = [];
if (data.includeCHs) data.modulesData.push(CHS);
if (data.includePCPs) data.modulesData.push(PCP);
if (data.includeSCPs) data.modulesData.push(SCP);
if (data.includeTWPs) data.modulesData.push(TWP);
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

data.overallData = [{ category: 'standard', hours: standardHours }, { category: 'optimized', hours: optimizedHours }];
data.percent = formatIntoPercentage(data.overallData[1].hours / (data.overallData[0].hours + data.overallData[1].hours));


data.legendWidth = width - ((margin.left * 4) + (margin.right * 4));
data.legendColorRectsWidth = data.legendWidth / data.modulesData.length;




data.percentDescriptionRectWidth = getTextWidth(percentageDescription, data.percentDescriptionFont) + 10;




/* fake data for dropdowns */
data.availableDates = {   // In Niagara version, this should be an empty object filled in with measured data
	2016: ['Oct', 'Nov', 'Dec'],
	2017: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	2018: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
};  
data.availableYears = Object.keys(data.availableDates).sort((a, b) => b - a);



//GLOBAL VARS
if (!widget.legendPinned) widget.legendPinned = 'none';
if (!widget.overallPinned) widget.overallPinned = 'none';
	//for dropdowns
if (!widget.yearSelected) widget.yearSelected = data.availableYears[0];
if (!widget.monthSelected) widget.monthSelected = data.availableDates[widget.yearSelected][data.availableDates[widget.yearSelected].length - 1];
if (!widget.updateDateWidgetRendering) widget.updateDateWidgetRendering = () => {
	// renderWidget(data);
	console.log('rerender widget for ' + widget.monthSelected + ' ' + widget.yearSelected);
}
if (!widget.dropdownYearChanged) widget.dropdownYearChanged = val => {
	widget.yearSelected = val;
	widget.monthSelected = data.availableDates[widget.yearSelected].includes(widget.monthSelected) ? widget.monthSelected : data.availableDates[widget.yearSelected][data.availableDates[widget.yearSelected].length - 1];
	widget.updateDateWidgetRendering();
};
if (!widget.dropdownMonthChanged) widget.dropdownMonthChanged = val => {
	widget.monthSelected = val;
	widget.updateDateWidgetRendering();
};





/*** Initialization ***/

const outerDiv = d3.select('#outer')
	.style('height', height + 'px')
	.style('width', width + 'px')
widget.svg = outerDiv.append('svg')
	.attr('class', 'log')
	.attr('width', '100%')
	.attr('height', '100%')
	.style('overflow', 'hidden');


d3.select(widget.svg.node().parentNode)
	.style('background-color', data.backgroundColor)
	.on('mousedown', function () {
		resetLegendPins();
		resetOverallPins();
	})

const graphicGroup = widget.svg.append('g')
	.attr('class', 'graphicGroup')
	.attr('transform', `translate(0,${data.dropdownGroupHeight})`);





	

/*** ARCS ***/

const allDonutGroupsGroup = graphicGroup.append('g')
	.attr('class', 'allDonutGroupsGroup')
	.attr('transform', `translate(${(data.graphicWidth - (margin.left + margin.right)) / 2}, ${data.hoveredOuterRadius})`)


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
const angles = { optimized: { start: 0, end: 0 }, standard: { start: 0, end: 0 } };
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

function renderTooltip(moduleObj) {    // moduleObj passed in if an individual module is active

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
		.on('mouseenter', function () {
			if (widget.legendPinned === 'none' && widget.overallPinned === 'none'){
				data.percentIsHovered = true;
				renderPercentageDescription();
			}
		})
		.on('mouseleave', function () {
			data.percentIsHovered = false;
			renderPercentageDescription();
		})
}


// events
const optimizedPaths = widget.svg.selectAll('.optimizedPath')
const standardPaths = widget.svg.selectAll('.standardPath')

optimizedPathsHoverArc
	.on('mouseenter', function() {
		attemptOverallTooltipOpen('optimized');
	})
	.on('mouseleave', function() {
		attemptOverallTooltipClose('optimized');
	})
	.on('mousedown', function() {
		d3.event.stopPropagation();
	})
	.on('click', function() {
		toggleOverallTooltipPin('optimized');
	});
standardPathsHoverArc
	.on('mouseenter', function() {
		attemptOverallTooltipOpen('standard');
	})
	.on('mouseleave', function() {
		attemptOverallTooltipClose('standard');
	})
	.on('mousedown', function() {
		d3.event.stopPropagation();
	})
	.on('click', function() {
		toggleOverallTooltipPin('standard');
	});
	









/*** LEGEND ***/

const legendGroup = widget.svg.append('g').attr('transform', `translate(${margin.left * 4}, ${margin.top + (data.hoveredOuterRadius * 2) + data.paddingAboveLegendBars + data.dropdownGroupHeight})`);

const legendModuleGroups = legendGroup.selectAll('.legendModuleGroup')
	.data(data.modulesData)
	.enter().append('g')
	.attr('class', d => `legendModuleGroup .${d.type}LegendModuleGroup`)
	.attr('transform', (d, i) => `translate(${i * data.legendColorRectsWidth}, 0)`)
	.on('mouseenter', function (d) {
		attemptLegendTooltipOpen(d, d3.select(this));
	})
	.on('mouseleave', function (d) {
		attemptLegendTooltipClose(d, d3.select(this));
	})
	.on('mousedown', function () {
		d3.event.stopPropagation();
	})
	.on('click', function (d) {
		toggleLegendTooltipPin(d, d3.select(this));
	})

const legendRects = legendModuleGroups.append('rect')
	.attr('height', data.moduleArcThickness)
	.attr('width', data.legendColorRectsWidth)
	.attr('y', data.paddingUnderLegendText)
	.attr('fill', d => d.color)
	.attr('stroke', 'black')
	.style('stroke-opacity', d => data.activeModule === d.type ? '1' : '0')

const legendTexts = legendModuleGroups.append('text')
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
function renderPercentageDescription() {
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
			.attr('pointer-events', 'none')

		allDonutGroupsGroup.append('text')
			.attr('class', 'percentageDescription')
			.style('font', data.percentDescriptionFont)
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('y', data.paddingBetweenPercentDescriptionAndMiddle)
			.style('opacity', 1)
			.text(percentageDescription)
			.attr('pointer-events', 'none');
	}
}
renderPercentageDescription();






//************************ DROPDOWNS *************************//
const dropdownsGroup = widget.svg.append('g')
	.attr('class', 'dropdownsGroup')
	.attr('transform', `translate(${margin.left + data.paddingLeftOfDropdowns},${margin.top})`)

//Year Dropdown
dropdownsGroup.append('text')
	.attr('dominant-baseline', 'hanging')
	.text('Year')
	.attr('x', 5)
	.attr('fill', data.dropdownLabelColor)
	.style('font', data.dropdownLabelFont);

makeDropdown(data.availableYears, widget.dropdownYearChanged, dropdownsGroup, 0, getTextHeight(data.dropdownLabelFont) + data.paddingUnderDropdownLabels, true, data.dateDropdownWidth, 5, 0, data.dropdownStrokeColor, data.dropdownFillColor, data.hoveredFillColor, data.dropdownFont, data.dropdownTextColor, widget.yearSelected, () => {}, () => {}, [], data.dropdownBorderRadius)

//Month Dropdown
dropdownsGroup.append('text')
	.attr('dominant-baseline', 'hanging')
	.attr('x', data.dateDropdownWidth + data.paddingBetweenDropdowns + 10)
	.text('Month')
	.attr('fill', data.dropdownLabelColor)
	.style('font', data.dropdownLabelFont);

makeDropdown(data.availableDates[widget.yearSelected], widget.dropdownMonthChanged, dropdownsGroup, data.dateDropdownWidth + data.paddingBetweenDropdowns, getTextHeight(data.dropdownLabelFont) + data.paddingUnderDropdownLabels, true, data.dateDropdownWidth, 5, 0, data.dropdownStrokeColor, data.dropdownFillColor, data.hoveredFillColor, data.dropdownFont, data.dropdownTextColor, widget.monthSelected, () => {}, () => {}, [], data.dropdownBorderRadius)







// /*** CLICK TO STICK FUNCTIONS ****/

//OVERALL FUNCS
function openOverallTooltip(optimizedOrStandard) {
	if (optimizedOrStandard === 'optimized') {
		data.hovered.optimized = true;
		data.hovered.current = 'optimized'

		widget.svg.selectAll('.percentage').style('opacity', 0)
		optimizedPaths.style('fill-opacity', 1);
		standardPaths.style('fill-opacity', theUnhoveredArcOpacity)
		widget.svg.selectAll('.optimizedModulePath')
			.transition()
			.attr('d', hoveredModuleArcPathGenerator)
		renderTooltip()
	} else {
		data.hovered.standard = true;
		data.hovered.current = 'standard'

		widget.svg.selectAll('.percentage').style('opacity', 0)
		standardPaths.style('fill-opacity', 1);
		optimizedPaths.style('fill-opacity', theUnhoveredArcOpacity)
		widget.svg.selectAll('.standardModulePath')
			.transition()
			.attr('d', hoveredModuleArcPathGenerator)
		renderTooltip()
	}
}

function attemptOverallTooltipOpen(optimizedOrStandard) {
	if (widget.overallPinned === 'none' && widget.legendPinned === 'none') openOverallTooltip(optimizedOrStandard);
}

function resetOverallPins() {
	if (widget.overallPinned !== 'none') {
		closeOverallTooltip(widget.overallPinned);
		widget.overallPinned = 'none';
	}
}

function closeOverallTooltip(optimizedOrStandard) {
	if (optimizedOrStandard === 'optimized') {
		data.hovered.optimized = false;
		data.hovered.current = 'neither'

		widget.svg.selectAll('.percentage').style('opacity', 1)
		standardPaths.style('fill-opacity', normalArcOpacity)
		optimizedPaths.style('fill-opacity', normalArcOpacity);
		widget.svg.selectAll('.optimizedModulePath')
			.transition()
			.attr('d', moduleArcPathGenerator)
		renderTooltip()
	} else {
		data.hovered.standard = false;
		data.hovered.current = 'neither'

		widget.svg.selectAll('.percentage').style('opacity', 1)
		standardPaths.style('fill-opacity', normalArcOpacity);
		optimizedPaths.style('fill-opacity', normalArcOpacity);
		widget.svg.selectAll('.standardModulePath')
			.transition()
			.attr('d', moduleArcPathGenerator)
		renderTooltip()
	}
}

function attemptOverallTooltipClose(optimizedOrStandard) {
	if (widget.overallPinned === 'none' && widget.legendPinned === 'none') closeOverallTooltip(optimizedOrStandard);
}

function pinOverallTooltip(optimizedOrStandard) {
	if (widget.legendPinned !== 'none' || widget.overallPinned !== 'none') {
		resetLegendPins();
		resetOverallPins();
	}
	openOverallTooltip(optimizedOrStandard);
	widget.overallPinned = optimizedOrStandard;
}

function toggleOverallTooltipPin(optimizedOrStandard) {
	if (widget.overallPinned === optimizedOrStandard) {
		resetOverallPins();
	} else {
		pinOverallTooltip(optimizedOrStandard);
	}
}


// LEGEND FUNCS
function openLegendTooltip(d, that) {
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
}

function attemptLegendTooltipOpen(d, that) {
	if (widget.legendPinned === 'none' && widget.overallPinned === 'none') openLegendTooltip(d, that);
}

function resetLegendPins() {
	if (widget.legendPinned !== 'none') {
		closeLegendTooltip(widget.legendPinned);
		widget.legendPinned = 'none';
	}
}

function closeLegendTooltip(d) {
	legendRects.style('stroke-opacity', '0')
	legendTexts.style('font-weight', 'normal')
	data.activeModule = 'none';
	widget.svg.selectAll('.percentage').style('opacity', 1)
	widget.svg.selectAll('.modulePath').style('fill-opacity', normalArcOpacity)
	widget.svg.selectAll('.arcPath').style('fill-opacity', normalArcOpacity)
	widget.svg.selectAll(`.${d.type}ArcPath`)
		.transition()
		.attr('d', moduleArcPathGenerator);
	renderTooltip();
}

function attemptLegendTooltipClose(d) {
	if (widget.legendPinned === 'none' && widget.overallPinned === 'none') closeLegendTooltip(d);
}

function pinLegendTooltip(d, that) {
	if (widget.legendPinned !== 'none' || widget.overallPinned !== 'none') {
		resetLegendPins();
		resetOverallPins();
	}
	openLegendTooltip(d, that);
	widget.legendPinned = d;
}

function toggleLegendTooltipPin(d, that) {
	if (widget.legendPinned === d) {
		resetLegendPins();
	} else {
		pinLegendTooltip(d, that);
	}
}