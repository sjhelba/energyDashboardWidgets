////ONLY FOR BROWSER /////

const widget = {};


////////// Hard Coded Defs //////////
const getJSDateFromTimestamp = d3.timeParse('%d-%b-%y %I:%M:%S.%L %p UTC%Z');
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
  for(let i = 0; i <= indexOfLastDigit; i++){
    if(!isNaN(font[i]) || font[i] === '.') num += font[i];
	}
	num = +num
  return num * 1.33333333333;
};

const unhoveredOpacity = 0.25;
const duration = 2000;

const indexOfType = {
	CHs: 0,
	PCPs: 1,
	SCPs: 2,
	CDPs: 3,
	CTFs: 4
};
const types = [
	'CHs',
	'PCPs',
	'SCPs',
	'CDPs',
	'CTFs'
];
const categories = [{name: 'baseline', displayName: 'Baseline'}, {name: 'projected', displayName: 'Projected'}, {name: 'measured', displayName: 'Measured'}];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const updateDateWidgetRendering = () => {
	data.dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected, [data.baselineData, data.projectedData, data.measuredData])
	renderWidget();
}

const dropdownYearChanged = () => {
	widget.yearDropDownSelected = d3.event.target.value;
	widget.monthDropDownSelected = 'All';
	updateDateWidgetRendering()
};
const dropdownMonthChanged = () => {
	widget.monthDropDownSelected = d3.event.target.value;
	updateDateWidgetRendering()
};


const resetElements = elementsToReset => {
	const selectionForCheck = widget.svg.selectAll(elementsToReset)
  if (!selectionForCheck.empty()) selectionForCheck.remove();
};

const getNextNiceVal = uglyMaxNum => {
	const innerFunc = (origVal) => {
		origVal = Math.ceil(origVal);

		let arr = origVal.toString().split('').map(str => +str);
		const digits = arr.length
		if (digits === 1) return origVal >= 5 ? 10 : 5;
		for (let i = 2; i < digits; i++){
			arr[i] = 0;
		}
		if (arr[1] < 5){
			arr[1] = '5';
		} else {
			arr[0] = arr[0] + 1;
			arr[1] = '0';
		}

		return arr.join('')
	};
	return innerFunc(uglyMaxNum - 1) === uglyMaxNum ? uglyMaxNum : innerFunc(uglyMaxNum);
};


const getDataForDate = (month, year, categoriesData = [data.baselineData, data.projectedData, data.measuredData]) => {
	let categoryDataForDate = [
		{
			category: 'baseline',
			kwh: 0,
			cost: 0.05,
			trh: 0
		},
		{
			category: 'projected',
			kwh: 0,
			cost: 0.05
		},
		{
			category: 'measured',
			kwh: 0,
			cost: 0.05,
			trh: 0
		}
	];
	let equipmentDataForDate = [
		{
			type: 'CHs',
			utilityRate: [
				{
					category: 'baseline',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				},
				{
					category: 'projected',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				},
				{
					category: 'measured',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				}
			],
			kwh: [
				{
					category: 'baseline',
          value: 0,
          accumulated: 0
				},
				{
					category: 'projected',
					value: 0,
          accumulated: 0
				},
				{
					category: 'measured',
					value: 0,
          accumulated: 0
				}
			]
		},
		{
			type: 'PCPs',
			utilityRate: [
				{
					category: 'baseline',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				},
				{
					category: 'projected',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				},
				{
					category: 'measured',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				}
			],
			kwh: [
				{
					category: 'baseline',
					value: 0,
          accumulated: 0
				},
				{
					category: 'projected',
					value: 0,
          accumulated: 0
				},
				{
					category: 'measured',
					value: 0,
          accumulated: 0
				}
			]
		},
		{
			type: 'SCPs',
			utilityRate: [
				{
					category: 'baseline',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				},
				{
					category: 'projected',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				},
				{
					category: 'measured',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				}
			],
			kwh: [
				{
					category: 'baseline',
					value: 0,
          accumulated: 0
				},
				{
					category: 'projected',
					value: 0,
          accumulated: 0
				},
				{
					category: 'measured',
					value: 0,
          accumulated: 0
				}
			]
		},
		{
			type: 'CDPs',
			utilityRate: [
				{
					category: 'baseline',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				},
				{
					category: 'projected',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				},
				{
					category: 'measured',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				}
			],
			kwh: [
				{
					category: 'baseline',
					value: 0,
          accumulated: 0
				},
				{
					category: 'projected',
					value: 0,
          accumulated: 0
				},
				{
					category: 'measured',
					value: 0,
          accumulated: 0
				}
			]
		},
		{
			type: 'CTFs',
			utilityRate: [
				{
					category: 'baseline',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				},
				{
					category: 'projected',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				},
				{
					category: 'measured',
					rate: 0,
					cost: 0,
          accumulatedCost: 0
				}
			],
			kwh: [
				{
					category: 'baseline',
					value: 0,
          accumulated: 0
				},
				{
					category: 'projected',
					value: 0,
          accumulated: 0
				},
				{
					category: 'measured',
					value: 0,
          accumulated: 0
				}
			]
		}
	];
	categoriesData.forEach((categoryData, categoryIndex) => {
		categoryData.forEach(monthlyDatum => {
			// if (months set to all OR current month matches) && (category is baseline or projected OR year matches)
			if((month === 'All' || monthlyDatum.month === month) && (categoryIndex !== 2 || monthlyDatum.year == year)){
				equipmentDataForDate.forEach((equipmentGroup, egIndex) => {
					// set kwh vals
					equipmentGroup.kwh[categoryIndex].value = monthlyDatum.equipment[egIndex].value;
					// set utility rates for baseline and measured
					if (categoryIndex !== 1) equipmentGroup.utilityRate[categoryIndex].rate = monthlyDatum.rate;
				})
				// set system level trh vals for baseline and measured
				if (categoryIndex !== 1) categoryDataForDate[categoryIndex].trh = monthlyDatum;
			}
		})
  })
  equipmentDataForDate.forEach((equipmentGroup, egIndex) => {
		//set accum kwh vals
    equipmentGroup.kwh.forEach((category, catIndex) => {
      category.accumulated += category.value;
      if (egIndex > 0) {
        category.accumulated += equipmentDataForDate[egIndex - 1].kwh[catIndex].accumulated;
			}
			categoryDataForDate[catIndex].kwh = category.accumulated;
		})
		//set projected rates to be equal to the baseline rates
		equipmentGroup.utilityRate[1].rate = equipmentGroup.utilityRate[0].rate;
		//set costs and accum costs
		equipmentGroup.utilityRate.forEach((category, catIndex) => {
			category.cost = category.rate * equipmentGroup.kwh[catIndex].value;
			category.accumulatedCost = category.rate * equipmentGroup.kwh[catIndex].accumulated;
			categoryDataForDate[catIndex].cost = category.accumulatedCost;
		})
  })
	return {categoryDataForDate, equipmentDataForDate};
};


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
		name: 'systemName',
		value: 'My System'
	},
	{
		name: 'measuredColor',
		value: '#29ABE2',
		typeSpec: 'gx:Color'
	},
	{
		name: 'baselineColor',
		value: '#003366',
		typeSpec: 'gx:Color'
	},
	{
		name: 'projectedColor',
		value: '#FF6633',
		typeSpec: 'gx:Color'
  },
	{
		name: 'unitsColor',
		value: 'black',
		typeSpec: 'gx:Color'
  },
  {
		name: 'unitsFont',
		value: '9pt Nirmala UI',
		typeSpec: 'gx:Font'
  },
  {
		name: 'toolTitleColor',
		value: 'black',
		typeSpec: 'gx:Color'
  },
  {
		name: 'toolTitleFont',
		value: '8.5pt Nirmala UI',
		typeSpec: 'gx:Font'
  },
  {
		name: 'dropdownTextColor',
		value: 'black',
		typeSpec: 'gx:Color'
  },
  {
		name: 'dropdownFont',
		value: '10.5pt Nirmala UI',
		typeSpec: 'gx:Font'
	},
	{
		name: 'tickTextColor',
		value: 'black',
		typeSpec: 'gx:Color'
	},
	{
		name: 'tickFont',
		value: '8.5pt Nirmala UI',
		typeSpec: 'gx:Font'
	},
	{
		name: 'legendTextColor',
		value: 'black',
		typeSpec: 'gx:Color'
	},
	{
		name: 'legendFont',
		value: '8.5pt Nirmala UI',
		typeSpec: 'gx:Font'
	},
	{
		name: 'currencySymbolColor',
		value: 'black',
		typeSpec: 'gx:Color'
	},
	{
		name: 'currencySymbolFont',
		value: 'bold 10.5pt Nirmala UI',
		typeSpec: 'gx:Font'
	},
	{
		name: 'utilityRateColor',
		value: 'black',
		typeSpec: 'gx:Color'
	},
	{
		name: 'utilityRateFont',
		value: 'bold 15pt Nirmala UI',
		typeSpec: 'gx:Font'
	}
];


////////////////////////////////////////////////////////////////
	// /* SETUP DEFINITIONS AND DATA */
////////////////////////////////////////////////////////////////
const today = new Date();
const thisYear = today.getFullYear();

	// FROM USER // 
const data = {};
properties.forEach(prop => data[prop.name] = prop.value);

  // FROM JQ //
const jqHeight = 400;
const jqWidth = 900;

  // SIZING //
data.margin = {top: 5, left: 5, right: 5, bottom: (jqHeight * 0.02) + 5};
data.graphicHeight = jqHeight - (data.margin.top + data.margin.bottom);
data.graphicWidth = jqWidth - (data.margin.left + data.margin.right);

	// GLOBALS PER INSTANCE //
if (!widget.year) widget.year = thisYear;
if (!widget.month) widget.month = 'All';

// if (!widget.hovered) widget.hovered = { optimized: false, standard: false, current: 'neither' };
// if (!widget.activeModule) widget.activeModule = 'none';
// if (!widget.percentIsHovered) widget.percentIsHovered = false;
if (!widget.legendHovered) widget.legendHovered = 'none';
if (!widget.monthDropDownSelected) widget.monthDropDownSelected = 'All';
if (!widget.yearDropDownSelected) widget.yearDropDownSelected = thisYear;
if (!widget.activeChartType) widget.activeChartType = 'stacked';

	// FAKE DATA //
data.baselineData = baselineData;
data.projectedData = projectedData;
data.measuredData = measuredData;
data.utilityRate = data.measuredData[data.measuredData.length - 1].rate;
data.currency = 'USD';
data.currencySymbol = '$';
data.currencyPrecision = '2'

	// CALCULATED DEFS //
	//get dataForDate
data.dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected, [data.baselineData, data.projectedData, data.measuredData])
console.log(data.dataForDate)

// eg format: {2017: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 2018: ['Jan', 'Feb', 'Mar']}
data.availableDates = {};
data.measuredData.forEach(date => {
	if (!data.availableDates[date.year]) data.availableDates[date.year] = [];
	data.availableDates[date.year].push(date.month);
})
data.availableYears = Object.keys(data.availableDates).sort((a,b) => b - a);
data.availableYears.forEach(yr => data.availableDates[yr].unshift('All'));



////////////////////////////////////////////////////////////////
	// Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
////////////////////////////////////////////////////////////////

 // INITIALIZATION //
const outerDiv = d3.select('#outer')
	.style('height', jqHeight + 'px')
	.style('width', jqWidth + 'px');


const renderWidget = () => { 
	// delete leftover elements from versions previously rendered
	if (!outerDiv.empty()) outerDiv.selectAll('*').remove();

	// DROPDOWNS //
	const paddingLeftOfTools = 20;
	const dateDropdownWidth = 100;
	const paddingBetweenDropdowns = 20;
  const paddingUnderDropdownTitles = 10;
	const dropdownBorderRadius = '100px'
	const dropdownsWidth = paddingLeftOfTools + (dateDropdownWidth * 2) + paddingBetweenDropdowns;


	const dropdownDiv = outerDiv.append('div')
		.attr('class', 'dropdownDiv')

		//Year Dropdown
	dropdownDiv.append('h4')
		.attr('dominant-baseline', 'hanging')
		.style('left', data.margin.left + paddingLeftOfTools + 'px')
		.text('Year')
    .style('top', data.margin.top)
    .style('color', data.toolTitleColor)
    .style('font', data.toolTitleFont)

	const yearSelect = dropdownDiv.append('select')
		.style('width', dateDropdownWidth + 'px')
    .attr('class', 'yearSelect')
		.style('border-radius', dropdownBorderRadius)
		.style('left', data.margin.left + paddingLeftOfTools + 'px')
		.style('top', data.margin.top + getTextHeight(data.toolTitleFont) + paddingUnderDropdownTitles + 'px')
		.style('font', data.dropdownFont)
		.style('color', data.dropdownTextColor)
		.on('change', dropdownYearChanged)
		.selectAll('option')
			.data(data.availableYears).enter()
				.append('option')
					.property('selected', d => d === widget.yearDropDownSelected)
					.text(d => d);



	//Month Dropdown
	dropdownDiv.append('h4')
		.attr('dominant-baseline', 'hanging')
		.style('top', data.margin.top)
		.style('left', data.margin.left + paddingLeftOfTools + dateDropdownWidth + paddingBetweenDropdowns + 'px')
    .text('Month')
    .style('color', data.toolTitleColor)
    .style('font', data.toolTitleFont);

	const monthSelect = dropdownDiv.append('select')
    .style('width', dateDropdownWidth + 'px')
		.attr('class', 'monthSelect')
		.style('border-radius', dropdownBorderRadius)
		.style('left', data.margin.left + paddingLeftOfTools + dateDropdownWidth + paddingBetweenDropdowns + 'px')
		.style('top', data.margin.top + getTextHeight(data.toolTitleFont) + paddingUnderDropdownTitles + 'px')
		.style('font', data.dropdownFont)
		.style('color', data.dropdownTextColor)
		.on('change', dropdownMonthChanged)
		.selectAll('option')
			.data(d => data.availableDates[widget.yearDropDownSelected]).enter()
				.append('option')
					.property('selected', d => d === widget.monthDropDownSelected)
					.text(d => d);



	// SVG INITIALIZATION //

	widget.svg = outerDiv.append('svg')
		.attr('class', 'log')
		.attr('width', '100%')
		.attr('height', '98%');
	d3.select(widget.svg.node().parentNode).style('background-color', data.backgroundColor);
	d3.select(widget.svg.node().parentNode.parentNode).style('background-color', 'darkGray');	// TODO: delete for Niagara

	// GENERAL GROUPS //
	const graphicGroup = widget.svg.append('g')
		.attr('class', 'graphicGroup')
		.attr('transform', `translate(${data.margin.left}, ${data.margin.top})`);

	const toolsGroupHeight = data.graphicHeight / 4;
	const paddingBetweenToolsAndCharts = 30
	const paddingAboveUtilityRate = 15;
	const toolsGroup = graphicGroup.append('g')
		.attr('class', 'toolsGroup')

	// toolsGroup.append('rect')
	// 	.attr('height', toolsGroupHeight)
	// 	.attr('width', data.graphicWidth)
	// 	.attr('fill', 'none')
	// 	.attr('stroke', 'black')

	const utilityRateGroup = toolsGroup.append('g')
		.attr('class', 'utilityRateGroup')
		.attr('transform', `translate(${paddingLeftOfTools}, ${getTextHeight(data.toolTitleFont) + paddingUnderDropdownTitles + getTextHeight(data.dropdownFont) + paddingAboveUtilityRate})`)

	


	const paddingBetweenCharts = 20;

	const chartsGroup = graphicGroup.append('g')
		.attr('class', 'chartsGroup')
		.attr('transform', `translate(0, ${toolsGroupHeight + paddingBetweenToolsAndCharts})`);

	const chartWidth = (data.graphicWidth - (paddingBetweenCharts * 2)) / 2.5;
	const trhChartWidth = chartWidth / 2;

	const circleRadius = 6
	const hoveredCircleRadius = circleRadius * 1.1

	const legendWidths = [
		getTextWidth('Baseline', data.legendFont) + (circleRadius * 2.5),
		getTextWidth('Projected', data.legendFont) + (circleRadius * 2.5),
		getTextWidth('Measured', data.legendFont) + (circleRadius * 2.5)
	];
	const paddingBetweenLegendCategories = 15

	const legendWidth = legendWidths.reduce((accum, curr) => accum + curr) + (paddingBetweenLegendCategories * 2);
	const legendHeight = 20;

	const paddingAboveLegend = 25;
	const chartHeight = data.graphicHeight - (toolsGroupHeight + paddingBetweenToolsAndCharts + legendHeight + paddingAboveLegend);
	const yAxisWidth = 45;
	const xAxisHeight = 25;

	const barSectionWidth = chartWidth - yAxisWidth;
	const barSectionHeight = chartHeight - xAxisHeight;

	const trhBarSectionWidth = (chartWidth - yAxisWidth) / 2;

	const costChart = chartsGroup.append('g')
		.attr('class', 'costChart')
		.attr('transform', `translate(${chartWidth + paddingBetweenCharts}, 0)`);

	const trhChart = chartsGroup.append('g')
		.attr('class', 'trhChart')
		.attr('transform', `translate(${(chartWidth * 2) + (paddingBetweenCharts * 2)}, 0)`);

  //***************************************	SCALES, GENERATORS, AND TICKS FOR CHARTS ************************************************//
	//TICKS
	const getMaxYTick = (groupedOrStacked, chartName) => {
		let mapFuncForArrOfEquipVals = chartName === 'kwh' ?
			modObj => modObj.kwh.map(cat => cat.value) :
			modObj => modObj.utilityRate.map(cat => cat.cost); 

		let allVals;

		if (groupedOrStacked === 'grouped'){
			arraysOfVals = data.dataForDate.equipmentDataForDate.map(mapFuncForArrOfEquipVals);
			allVals = [].concat(...arraysOfVals)
		} else {
			allVals = data.dataForDate.categoryDataForDate.map(cat => cat[chartName]);
		}
		const maxActualVal = allVals.reduce((accum, curr) => curr > accum ? curr : accum);
		const maxValForPadding = maxActualVal + (0.1 * maxActualVal);
		return getNextNiceVal(maxValForPadding);
	}

	const getYTickValues = highestVal => {
		let numOfTicks = 4;	// numOfTicks over 0;
		const yTickInterval = highestVal / numOfTicks;
		let yTickValues = [];
		for (let i = 0; i <= numOfTicks; i++){
			yTickValues.push(yTickInterval * i)
		}
		return yTickValues;
	}

	// set initial y ticks
	let kwhMaxYTick = getMaxYTick(widget.activeChartType, 'kwh')
	let costMaxYTick = getMaxYTick(widget.activeChartType, 'cost')
	let trhMaxYTick = getMaxYTick(widget.activeChartType, 'trh')

	let kwhYTicks = getYTickValues(kwhMaxYTick);
	let costYTicks = getYTickValues(costMaxYTick);
	let trhYTicks = getYTickValues(trhMaxYTick);



	//SCALES AND GENERATORS

	const x0Scale = d3.scaleBand()
		.paddingOuter(widget.activeChartType === 'grouped' ? 0.1 : 0.8)
		.paddingInner(widget.activeChartType === 'grouped' ? 0.2 : 0.4)
		.domain(widget.activeChartType === 'grouped' ? types : categories.map(cat => cat.name))	//equipmentTypes or categories
		.rangeRound([0, barSectionWidth])
		
	const x1Scale = d3.scaleBand()
		.domain(categories.map(cat => cat.name))
		.rangeRound([0, x0Scale.bandwidth()]);



	const xAxisGenerator = d3.axisBottom()
		.scale(x0Scale)
		.tickSize(widget.activeChartType === 'grouped' ? 6 : 0)
		.tickFormat((d, i) => widget.activeChartType === 'grouped' ? d : null);
		


	// COST




//kwh
	const yScale = d3.scaleLinear()
		.range([barSectionHeight, 0])
		.domain([0, kwhMaxYTick])

	const yAxisGenerator = d3.axisLeft()
		.scale(yScale)
		.tickSizeOuter(0)
		.tickValues(kwhYTicks)
//cost
	const costYScale = d3.scaleLinear()
		.range([barSectionHeight, 0])
		.domain([0, costMaxYTick])

	const costYAxisGenerator = d3.axisLeft()
		.scale(costYScale)
		.tickSizeOuter(0)
		.tickValues(costYTicks)


  //********************************************* CHART TRANSITIONS ***********************************************************//
	//Kwh Chart Transition Func:
	const transitionKwhChart = stackedOrGrouped => {

		//x axis changes
		x0Scale
			.domain(stackedOrGrouped === 'grouped' ? types : categories.map(cat => cat.name))	//equipmentTypes or categories
			.paddingOuter(stackedOrGrouped === 'grouped' ? 0.1 : 0.8)
			.paddingInner(stackedOrGrouped === 'grouped' ? 0.2 : 0.4);
		x1Scale
			.rangeRound([0, x0Scale.bandwidth()]); // running to account for changes to x0Scale
		xAxisGenerator
			.tickSize(widget.activeChartType === 'grouped' ? 6 : 0)
			.tickFormat((d, i) => widget.activeChartType === 'grouped' ? d : null);

		//y axis changes
		kwhMaxYTick = getMaxYTick(stackedOrGrouped, 'kwh');
		kwhYTicks = getYTickValues(kwhMaxYTick);

		yScale.domain([0, kwhMaxYTick]);
		yAxisGenerator.tickValues(kwhYTicks);

		//transition axes
		kwhChart.select('.kwhXAxisTitle')
		.transition()
			.delay(stackedOrGrouped === 'grouped' ? 0 : duration / 2)
			.duration(duration / 2)
			.style('opacity', stackedOrGrouped === 'grouped' ? 0 : 1)

		kwhChart.select('.xAxis')
			.transition()
				.delay(stackedOrGrouped === 'grouped' ? duration / 2 : 0)
				.duration(duration / 2)
				.call(xAxisGenerator);

		kwhChart.select('.yAxis')
			.transition()
				.duration(duration)
				.call(yAxisGenerator);

		// transition bars
		kwhChart.selectAll('.equipmentGroups')
			.transition()
				.duration(duration)
				.attr('transform', d => `translate(${stackedOrGrouped === 'grouped' ? x0Scale(d.type) : 0},0)`)
		
		kwhChart.selectAll('.categoryRects')	// .data(d => d.kwh)
			.transition()
				.duration(duration - 500)
				.attr("x", d => stackedOrGrouped === 'grouped' ? x1Scale(d.category): x0Scale(d.category))
				.attr("y", d => yScale(stackedOrGrouped === 'grouped' ? d.value : d.accumulated))
				.attr("width", stackedOrGrouped === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
				.attr("height", d => barSectionHeight - yScale(d.value))   // run this to use changed yScale
				.attr('stroke', d => data[`${d.category}Color`])
				.transition()
					.attr('stroke', d => widget.activeChartType === 'grouped' ? 'none' : data[`${d.category}Color`])

		//tick styling
		kwhChart.selectAll('.tick text')
			.style('fill', data.tickTextColor)
			.style('font', data.tickFont)
	}




	//Cost Chart Transition Func:
	const transitionCostChart = stackedOrGrouped => {
		//x axis changes
		x0Scale
			.domain(stackedOrGrouped === 'grouped' ? types : categories.map(cat => cat.name))	//equipmentTypes or categories
			.paddingOuter(stackedOrGrouped === 'grouped' ? 0.1 : 0.8)
			.paddingInner(stackedOrGrouped === 'grouped' ? 0.2 : 0.4);
		x1Scale
			.rangeRound([0, x0Scale.bandwidth()]); // running to account for changes to x0Scale
		xAxisGenerator
			.tickSize(widget.activeChartType === 'grouped' ? 6 : 0)
			.tickFormat((d, i) => widget.activeChartType === 'grouped' ? d : null);

		//y axis changes
		costMaxYTick = getMaxYTick(stackedOrGrouped, 'cost');
		costYTicks = getYTickValues(costMaxYTick);

		costYScale.domain([0, costMaxYTick]);
		costYAxisGenerator.tickValues(costYTicks);

		//transition axes
		costChart.select('.costXAxisTitle')
		.transition()
			.delay(stackedOrGrouped === 'grouped' ? 0 : duration / 2)
			.duration(duration / 2)
			.style('opacity', stackedOrGrouped === 'grouped' ? 0 : 1)

		costChart.select('.xAxis')
			.transition()
				.delay(stackedOrGrouped === 'grouped' ? duration / 2 : 0)
				.duration(duration / 2)
				.call(xAxisGenerator);

		costChart.select('.yAxis')
			.transition()
				.duration(duration)
				.call(costYAxisGenerator);

		// transition bars
		costChart.selectAll('.equipmentGroups')
			.transition()
				.duration(duration)
				.attr('transform', d => `translate(${stackedOrGrouped === 'grouped' ? x0Scale(d.type) : 0},0)`)
		
		costChart.selectAll('.categoryRects')	// .data(d => d.utilityRate)
			.transition()
				.duration(duration - 500)
				.attr("x", d => stackedOrGrouped === 'grouped' ? x1Scale(d.category): x0Scale(d.category))
				.attr("y", d => costYScale(stackedOrGrouped === 'grouped' ? d.cost : d.accumulatedCost))
				.attr("width", stackedOrGrouped === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
				.attr("height", d => barSectionHeight - costYScale(d.cost))   // run this to use changed yScale
				.attr('stroke', d => data[`${d.category}Color`])
				.transition()
					.attr('stroke', d => widget.activeChartType === 'grouped' ? 'none' : data[`${d.category}Color`])

		//tick styling
		costChart.selectAll('.tick text')
			.style('fill', data.tickTextColor)
			.style('font', data.tickFont)
	}













  //click handler for KWH and cost chart transitions
  const transitionChartsClickFunction = () => {
    widget.activeChartType === 'stacked' ?	widget.activeChartType = 'grouped' :	widget.activeChartType = 'stacked';
		transitionKwhChart(widget.activeChartType)
		transitionCostChart(widget.activeChartType);
	};





  //********************************************* KWH CHART ***********************************************************//
  // initialization
  const kwhChart = chartsGroup.append('g')
    .attr('class', 'kwhChart')

  // chart group and background click handler
  kwhChart.append('rect')
    .attr('class', 'groupedClickHandlingRect')
    .attr('height', chartHeight)
    .attr('width', chartWidth)
    .attr('opacity', 0)
    .on('click', transitionChartsClickFunction)

  const kwhBarSection = kwhChart.append('g')
    .attr('class', 'kwhBarSection')
    .attr('transform', `translate(${yAxisWidth}, 0)`)


  // bars
  const equipmentGroups = kwhBarSection.selectAll('.equipmentGroups')
    .data(data.dataForDate.equipmentDataForDate)
    .enter().append("g")
      .attr('class', d => `equipmentGroups ${d.type}EquipmentGroup`)
      .attr('transform', d => `translate(${widget.activeChartType === 'grouped' ? x0Scale(d.type) : 0},0)`)
  
  equipmentGroups.selectAll('.categoryRects')
    .data(d => d.kwh)
    .enter().append("rect")
      .attr('class', d => `categoryRects ${d.category}CategoryRect ${d.category}Bar`)
      .attr("x", d => widget.activeChartType === 'grouped' ? x1Scale(d.category) : x0Scale(d.category))
      .attr("y", d => widget.activeChartType === 'grouped' ? yScale(d.value) : yScale(d.accumulated))
      .attr("width", widget.activeChartType === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
      .attr("height", d => barSectionHeight - yScale(d.value) )
			.attr("fill", d => data[`${d.category}Color`])
			.style('fill-opacity', d => widget.legendHovered === 'none' || widget.legendHovered === d.category ? 1 : unhoveredOpacity)
			.style('stroke-opacity', d => widget.legendHovered === 'none' || widget.legendHovered === d.category ? 1 : 0)
			.attr('stroke', d => widget.activeChartType === 'grouped' ? 'none' : data[`${d.category}Color`])
      .on('click', transitionChartsClickFunction);

			
  // x axis
  kwhBarSection.append('g')
		.attr("class", "axis xAxis")
		.attr("transform", `translate(0, ${barSectionHeight})`)
		.call(xAxisGenerator);

	// y axis
	kwhBarSection.append("g")
		.attr("class", "axis yAxis")
		.call(yAxisGenerator)


	//tick styling
	kwhChart.selectAll('.tick text')
		.style('fill', data.tickTextColor)
		.style('font', data.tickFont)


	// y axis units title
	kwhBarSection.append('text')
		.text('kWh')
		.attr('transform', 'rotate(-90)')
		.attr('y', 5)
		.attr("text-anchor", "middle")
		.attr('dominant-baseline', 'hanging')
		.attr('fill', data.unitsColor)
		.style('font', data.unitsFont)

	//stacked x axis title
	kwhBarSection.append('text')
		.attr('class', 'kwhXAxisTitle')
		.attr('dominant-baseline', 'hanging')
		.attr('x', (barSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2) )
		.style('font', data.tickFont)
		.attr('y', barSectionHeight + 6)
		.text(data.systemName)
		.style('opacity', widget.activeChartType === 'grouped' ? 0 : 1)








	//*********************************** COST CHART ************************************//
// initialization

// chart group and background click handler
costChart.append('rect')
	.attr('class', 'groupedClickHandlingRect')
	.attr('height', chartHeight)
	.attr('width', chartWidth)
	.attr('opacity', 0)
	.on('click', transitionChartsClickFunction)

const costBarSection = costChart.append('g')
	.attr('class', 'costBarSection')
	.attr('transform', `translate(${yAxisWidth}, 0)`)


// bars
const costEquipmentGroups = costBarSection.selectAll('.equipmentGroups')
	.data(data.dataForDate.equipmentDataForDate)
	.enter().append("g")
		.attr('class', d => `equipmentGroups ${d.type}EquipmentGroup`)
		.attr('transform', d => `translate(${widget.activeChartType === 'grouped' ? x0Scale(d.type) : 0},0)`)

costEquipmentGroups.selectAll('.categoryRects')
	.data(d => d.utilityRate)
	.enter().append("rect")
		.attr('class', d => `categoryRects ${d.category}CategoryRect ${d.category}Bar`)
		.attr("x", d => widget.activeChartType === 'grouped' ? x1Scale(d.category) : x0Scale(d.category))
		.attr("y", d => widget.activeChartType === 'grouped' ? costYScale(d.cost) : costYScale(d.accumulatedCost))
		.attr("width", widget.activeChartType === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
		.attr("height", d => barSectionHeight - costYScale(d.cost) )
		.attr("fill", d => data[`${d.category}Color`])
		.style('fill-opacity', d => widget.legendHovered === 'none' || widget.legendHovered === d.category ? 1 : unhoveredOpacity)
		.style('stroke-opacity', d => widget.legendHovered === 'none' || widget.legendHovered === d.category ? 1 : 0)
		.attr('stroke', d => widget.activeChartType === 'grouped' ? 'none' : data[`${d.category}Color`])
		.on('click', transitionChartsClickFunction);

		
// x axis
costBarSection.append('g')
	.attr("class", "axis xAxis")
	.attr("transform", `translate(0, ${barSectionHeight})`)
	.call(xAxisGenerator);

// y axis
costBarSection.append("g")
	.attr("class", "axis yAxis")
	.call(costYAxisGenerator)


//tick styling
costChart.selectAll('.tick text')
	.style('fill', data.tickTextColor)
	.style('font', data.tickFont)


// y axis units title
costBarSection.append('text')
	.text(data.currencySymbol + data.currency)
	.attr('transform', 'rotate(-90)')
	.attr('y', 5)
	.attr("text-anchor", "middle")
	.attr('dominant-baseline', 'hanging')
	.attr('fill', data.unitsColor)
	.style('font', data.unitsFont)

//stacked x axis title
costBarSection.append('text')
	.attr('class', 'costXAxisTitle')
	.attr('dominant-baseline', 'hanging')
	.attr('x', (barSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2) )
	.style('font', data.tickFont)
	.attr('y', barSectionHeight + 6)
	.text(data.systemName)
	.style('opacity', widget.activeChartType === 'grouped' ? 0 : 1)





	




	//********************************** TRH CHART *****************************************//
	trhChart.append('rect')	//TODO MAKE INVISIBLE CLICK HANDLING RECT OR DELETE
		.attr('height', chartHeight)
		.attr('width', trhChartWidth)
		.attr('fill', 'none')
		.attr('stroke', 'blue')



//************************************* LEGEND ******************************************//
	const getPrevLegendWidths = index => {
		let sum = 0;
		for (let i = index - 1; i >= 0; i--) { sum += legendWidths[i] }
		return sum;
	}




	const legendGroup = graphicGroup.append('g')
		.attr('class', 'legend')
		.attr('transform', `translate(${(data.graphicWidth / 2) - (legendWidth / 2)}, ${data.graphicHeight - legendHeight})`)
		
	const legendCategories = legendGroup.selectAll('.legendCategories')
		.data(categories)
		.enter().append('g')
			.attr('class', d => `legend${d.displayName}Group legendCategories`)
			.attr('transform', (d, i) => `translate(${circleRadius + (i * paddingBetweenLegendCategories) + getPrevLegendWidths(i)}, ${circleRadius})`)
			.on('mouseover', function (d) {
				widget.legendHovered = d.name;

				widget.svg.selectAll(`.${d.name}LegendText`)
					.style('font-weight', 'bold')

				widget.svg.selectAll(`.${d.name}LegendCircle`)
					.attr('r', hoveredCircleRadius)

				widget.svg.selectAll(`.categoryRects`)
					.filter(innerD => innerD.category !== d.name)
					.style('fill-opacity', unhoveredOpacity)
					.style('stroke-opacity', 0)
			})
			.on('mouseout', function (d) {
				widget.legendHovered = 'none';

				widget.svg.selectAll(`.${d.name}LegendText`)
					.style('font-weight', 'normal')
					
				widget.svg.selectAll(`.${d.name}LegendCircle`)
					.attr('r', circleRadius)

				widget.svg.selectAll(`.categoryRects`)
					.filter(innerD => innerD.category !== d.name)
					.style('fill-opacity', 1)
					.style('stroke-opacity', 1)
			})

	// legendGroup.append('rect')
	// 	.attr('width', legendWidth)
	// 	.attr('height', legendHeight)
	// 	.attr('fill', 'none')
	// 	.attr('stroke', 'black')

	// legendCategories.append('rect')
	// 	.attr('width', (d, i) => legendWidths[i])
	// 	.attr('height', legendHeight)
	// 	.attr('fill', 'none')
	// 	.attr('stroke', d => data[d.name + 'Color'])

	legendCategories.append('circle')
		.attr('class', d => `${d.name}LegendCircle`)
		.attr('r', d => widget.legendHovered === d.name ? hoveredCircleRadius : circleRadius)
		.attr('fill', d => data[d.name + 'Color'])
		
	legendCategories.append('text')
		.attr('class', d => `legendText ${d.name}LegendText`)
		.style('font', data.legendFont)
		.style('font-weight', d => widget.legendHovered === d.name ? 'bold' : 'normal')
		.attr('fill', data.legendTextColor)
		.attr('dominant-baseline', 'middle')
		.attr('x', circleRadius + (circleRadius / 2))
		.text(d => d.displayName)



	// TOOLS //
	
		// UTILITY RATE
	const paddingAboveCurrencySymbol = 2;
	const paddingRightOfCurrencySymbol = 5;
	utilityRateGroup.append('text')
		.text('Blended Utility Rate')
		.attr('dominant-baseline', 'hanging')
		.style('font', data.toolTitleFont)


	const currencySymbol = utilityRateGroup.append('text')
		.attr('y', getTextHeight(data.toolTitleFont) + paddingAboveCurrencySymbol)
		.attr('dominant-baseline', 'hanging')
		.style('font', data.currencySymbolFont)
		.text(data.currencySymbol)

	const utilityRate = utilityRateGroup.append('text')
		.attr('dominant-baseline', 'hanging')
		.attr('x', getTextWidth(data.currencySymbol, data.currencySymbolFont) + paddingRightOfCurrencySymbol)
		.attr('y', getTextHeight(data.toolTitleFont) + paddingAboveCurrencySymbol)
		.style('font', data.utilityRateFont)
		.text(d3.format(`,.${data.currencyPrecision}f`)(data.utilityRate))

		
}

renderWidget();