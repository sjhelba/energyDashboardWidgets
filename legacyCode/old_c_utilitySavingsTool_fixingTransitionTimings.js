////ONLY FOR BROWSER /////

const widget = {};


////////// Hard Coded Defs //////////
const small = {width: 880, height: 440};
const medium = {width: 880, height: 440};	//TODO: change to actual dimensions
const large = {width: 880, height: 440};	//TODO: change to actual dimensions
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
	num = +num;
  return num * 1.33333333333;
};

const unhoveredOpacity = 0.25;
const duration = 2000;

const categories = [{name: 'baseline', displayName: 'Baseline'}, {name: 'projected', displayName: 'Projected'}, {name: 'measured', displayName: 'Measured'}];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const updateDateWidgetRendering = () => {
	widget.dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected, [data.baselineData, data.projectedData, data.measuredData])
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
	console.log('active equipment groups: ', data.activeEquipmentGroups)
	let categoryDataForDate = [
		{
			category: 'baseline',
			kwh: 0,
			cost: 0.05,
			trh: 0,
			rate: 0 //weighted avg of multiple rates if for yr rather than month
		},
		{
			category: 'projected',
			kwh: 0,
			cost: 0.05,
			rate: 0 //weighted avg of multiple rates if for yr rather than month
		},
		{
			category: 'measured',
			kwh: 0,
			cost: 0.05,
			trh: 0,
			rate: 0 //weighted avg of multiple rates if for yr rather than month
		}
	];
	let equipmentDataForDate = [];
	let equipmentRatesAndWeights = [];
	data.activeEquipmentGroups.forEach(equip => {
		equipmentDataForDate.push(
			{
				type: equip,
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
		);
		equipmentRatesAndWeights.push(
			{
				type: equip,
				utilityRate: [
					{
						category: 'baseline',
						ratesAndWeights: {},
						weightedRate: 0
					},
					{
						category: 'projected',
						ratesAndWeights: {},
						weightedRate: 0
					},
					{
						category: 'measured',
						ratesAndWeights: {},
						weightedRate: 0
					}
				]
			}
		);
	});

	categoriesData.forEach((categoryData, categoryIndex) => {
		categoryData.forEach(monthlyDatum => {
			// if (months set to all OR current month matches) && (category is baseline or projected OR year matches)
			if((month === 'All' || monthlyDatum.month === month) && (categoryIndex !== 2 || monthlyDatum.year == year)){
				equipmentDataForDate.forEach((equipmentGroup, egIndex) => {
					// set kwh vals
					equipmentGroup.kwh[categoryIndex].value = monthlyDatum.equipment[egIndex].value;
					// set utility rates for baseline and measured
					if (categoryIndex !== 1) {

						if (month === 'All') {
							let currentObj = equipmentRatesAndWeights[egIndex].utilityRate[categoryIndex].ratesAndWeights
							if (!currentObj[monthlyDatum.rate]) currentObj[monthlyDatum.rate] = 0;
							currentObj[monthlyDatum.rate]++
						} else {
							equipmentGroup.utilityRate[categoryIndex].rate = monthlyDatum.rate;
						}

					}
				})
				// set system level trh vals for baseline and measured
				if (categoryIndex !== 1) categoryDataForDate[categoryIndex].trh = monthlyDatum.trh;
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
		//CALCULATE WEIGHTED AVERAGE RATES IF MULTIPLE MONTHS
		if (month === 'All') {
			equipmentRatesAndWeights[egIndex].utilityRate.forEach((category, catIndex) => {
				if (catIndex !== 1){
					const rates = Object.keys(category.ratesAndWeights);
					if (rates.length === 1) {
						equipmentGroup.utilityRate[catIndex].rate = +rates[0];
					} else {
						let count = 0;
						let total = 0;
						rates.forEach(rate => {
							count += (+category.ratesAndWeights[rate]);
						});
						rates.forEach(rate => {
							let weight = (+category.ratesAndWeights[rate]) / count;
							total += weight * rate;
						});
						equipmentGroup.utilityRate[catIndex].rate = total;
					}
				}
			})
		};

		//set projected rates to be equal to the baseline rates
		equipmentGroup.utilityRate[1].rate = equipmentGroup.utilityRate[0].rate;
		//set costs, accum costs, and system level rates
		equipmentGroup.utilityRate.forEach((category, catIndex) => {
			category.cost = category.rate * equipmentGroup.kwh[catIndex].value;
			category.accumulatedCost = category.rate * equipmentGroup.kwh[catIndex].accumulated;
			categoryDataForDate[catIndex].cost = category.accumulatedCost;
			categoryDataForDate[catIndex].rate = category.rate;
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
	// if data not able to be pulled upon async try, will change values of these bools:
	{
		name: 'includePCPs',
		value: true
	},
	{
		name: 'includeSCPs',
		value: true
	},
	{
		name: 'includeCDPs',
		value: true
	},
	{
		name: 'includeCTFs',
		value: true
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
	},
	{
		name: 'changePercentColor',
		value: 'white',
		typeSpec: 'gx:Color'
	},
	{
		name: 'changePercentFont',
		value: 'bold 24pt Nirmala UI',
		typeSpec: 'gx:Font'
	},
	{
		name: 'changeValueColor',
		value: 'white',
		typeSpec: 'gx:Color'
	},
	{
		name: 'changeValueFont',
		value: '10.5pt Nirmala UI',
		typeSpec: 'gx:Font'
	},
	{
		name: 'tooltipColor',
		value: 'black',
		typeSpec: 'gx:Color'
	},
	{
		name: 'tooltipFont',
		value: '10pt Nirmala UI',
		typeSpec: 'gx:Font'
	},
	{
		name: 'changeToolRectColor',
		value: '#333333',
		typeSpec: 'gx:Color'
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
const jqHeight = 450;
const jqWidth = 890;


function chooseSize (jqH, jqW) {
	if(jqH < 700 || jqW < 1200) {
		return small;		//880, 440
	} else if (jqH < 1700 || jqW < 2200) {		//TODO: change to actual range
		return medium;		//880, 440
	} else {
		return large;		//880, 440
	}
}
const widgetDimensions = chooseSize(jqHeight, jqWidth);
data.activeEquipmentGroups = [
	'CHs',
	'PCPs',
	'SCPs',
	'CDPs',
	'CTFs',
];
if (!data.includeCTFs) {data.activeEquipmentGroups.splice(4, 1)}
if (!data.includeCDPs) {data.activeEquipmentGroups.splice(3, 1)}
if (!data.includeSCPs) {data.activeEquipmentGroups.splice(2, 1)}
if (!data.includePCPs) {data.activeEquipmentGroups.splice(1, 1)}






  // SIZING //
data.margin = {top: 5, left: 5, right: 5, bottom: 5};
data.graphicHeight = widgetDimensions.height - (data.margin.top + data.margin.bottom);
data.graphicWidth = widgetDimensions.width - (data.margin.left + data.margin.right);

	// GLOBALS PER INSTANCE //
data.paddingBetweenTooltipText = 3;
data.tooltipPadding = 2
data.paddingAfterLegendCat = 5;

if (!widget.year) widget.year = thisYear;
if (!widget.month) widget.month = 'All';


if (!widget.equipmentHovered) widget.equipmentHovered = 'none';	//alternative selections are equipment group names
if (!widget.systemIsHovered) widget.systemIsHovered = false; 	//alternative selection is true

if (!widget.trhIsHovered) widget.trhIsHovered = false;	//alternative selection is true
if (!widget.legendHovered) widget.legendHovered = 'none';	// alternative selections are category names

if (!widget.monthDropDownSelected) widget.monthDropDownSelected = 'All';
if (!widget.yearDropDownSelected) widget.yearDropDownSelected = thisYear;
if (!widget.activeChartType) widget.activeChartType = 'stacked';	//alternative selection 'grouped'

	// FAKE DATA //
data.baselineData = baselineData;
data.projectedData = projectedData;
data.measuredData = measuredData;
data.utilityRate = data.measuredData[data.measuredData.length - 1].rate;
data.currency = 'USD';
data.currencySymbol = '$';
data.currencyPrecision = '2'

	// CALCULATED DEFS //
data.formatCurrency = d3.format(`,.${data.currencyPrecision}f`)
data.formatAvgCurrency = d3.format(`,.${+data.currencyPrecision + 1}f`)

	//get dataForDate
widget.dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected, [data.baselineData, data.projectedData, data.measuredData])
console.log(widget.dataForDate)

// eg format: {2017: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 2018: ['Jan', 'Feb', 'Mar']}
data.availableDates = {};
data.measuredData.forEach(date => {
	if (!data.availableDates[date.year]) data.availableDates[date.year] = [];
	data.availableDates[date.year].push(date.month);
})
data.availableYears = Object.keys(data.availableDates).sort((a,b) => b - a);
// data.availableYears.forEach(yr => data.availableDates[yr].sort((a,b) => months.indexOf(a) - months.indexOf(b)))
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

	// graphicGroup.append('rect')	//TODO: comment out or delete
	// 	.attr('height', data.graphicHeight)
	// 	.attr('width', data.graphicWidth)
	// 	.attr('fill', 'none')
	// 	.attr('stroke', 'black')

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

	


	const paddingBetweenCharts = 40;

	const chartsGroup = graphicGroup.append('g')
		.attr('class', 'chartsGroup')
		.attr('transform', `translate(0, ${toolsGroupHeight + paddingBetweenToolsAndCharts})`);

	const yAxisWidth = 45;
	const xAxisHeight = 25;
	const chartWidth = (data.graphicWidth - ((paddingBetweenCharts * 2) + yAxisWidth)) / 2.5;
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

		if (groupedOrStacked === 'grouped' && chartName !== 'trh'){
			arraysOfVals = widget.dataForDate.equipmentDataForDate.map(mapFuncForArrOfEquipVals);
			allVals = [].concat(...arraysOfVals)
		} else {
			allVals = widget.dataForDate.categoryDataForDate.map(cat => cat[chartName]);
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

	// x axis
	const x0Scale = d3.scaleBand()
		.paddingOuter(widget.activeChartType === 'grouped' ? 0.1 : 0.8)
		.paddingInner(widget.activeChartType === 'grouped' ? 0.2 : 0.4)
		.domain(widget.activeChartType === 'grouped' ? data.activeEquipmentGroups : categories.map(cat => cat.name))	//equipmentTypes or categories
		.rangeRound([0, barSectionWidth])

	const x1Scale = d3.scaleBand()
		.domain(categories.map(cat => cat.name))
		.rangeRound([0, x0Scale.bandwidth()]);

	const trhXScale = d3.scaleBand()
		.paddingOuter(0.8)
		.paddingInner(0.4)
		.domain(categories.filter((cat, catIndex) => catIndex != 1).map(cat => cat.name))	//equipmentTypes or categories
		.rangeRound([0, trhBarSectionWidth])

	const xAxisGenerator = d3.axisBottom()
		.scale(x0Scale)
		.tickSize(widget.activeChartType === 'grouped' ? 6 : 0)
		.tickFormat((d, i) => widget.activeChartType === 'grouped' ? d : null);

	const trhXAxisGenerator = d3.axisBottom()
		.scale(trhXScale)
		.tickSize(0)
		.tickFormat((d, i) => null);
		
	// y axis
	const kwhYScale = d3.scaleLinear()
		.range([barSectionHeight, 0])
		.domain([0, kwhMaxYTick])
	
	const costYScale = d3.scaleLinear()
		.range([barSectionHeight, 0])
		.domain([0, costMaxYTick])

	const trhYScale = d3.scaleLinear()
		.range([barSectionHeight, 0])
		.domain([0, trhMaxYTick])

	const kwhYAxisGenerator = d3.axisLeft()
		.scale(kwhYScale)
		.tickSizeOuter(0)
		.tickValues(kwhYTicks)

	const costYAxisGenerator = d3.axisLeft()
		.scale(costYScale)
		.tickSizeOuter(0)
		.tickValues(costYTicks)

	const trhYAxisGenerator = d3.axisLeft()
		.scale(trhYScale)
		.tickSizeOuter(0)
		.tickValues(trhYTicks)


  //********************************************* CHART TRANSITIONS ***********************************************************//
	//Kwh Chart Transition Func:
	const transitionCharts = stackedOrGrouped => {

		//x axis changes
		x0Scale
			.domain(stackedOrGrouped === 'grouped' ? data.activeEquipmentGroups : categories.map(cat => cat.name))	//equipmentTypes or categories
			.paddingOuter(stackedOrGrouped === 'grouped' ? 0.1 : 0.8)
			.paddingInner(stackedOrGrouped === 'grouped' ? 0.2 : 0.4);
		x1Scale
			.rangeRound([0, x0Scale.bandwidth()]); // running to account for changes to x0Scale
		xAxisGenerator
			.tickSize(widget.activeChartType === 'grouped' ? 6 : 0)
			.tickFormat((d, i) => widget.activeChartType === 'grouped' ? d : null);

		//y axis changes
		kwhMaxYTick = getMaxYTick(stackedOrGrouped, 'kwh');
		costMaxYTick = getMaxYTick(stackedOrGrouped, 'cost');
		kwhYTicks = getYTickValues(kwhMaxYTick);
		costYTicks = getYTickValues(costMaxYTick);

		kwhYScale.domain([0, kwhMaxYTick]);
		costYScale.domain([0, costMaxYTick]);
		kwhYAxisGenerator.tickValues(kwhYTicks);
		costYAxisGenerator.tickValues(costYTicks);
		
		
		function kwhChartTransition() {
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
					.call(kwhYAxisGenerator);

			// transition bars
			kwhChart.selectAll('.equipmentGroups')
				.transition()
					.duration(duration)
					.attr('transform', d => `translate(${stackedOrGrouped === 'grouped' ? x0Scale(d.type) : 0},0)`)
			
			kwhChart.selectAll('.categoryRects')	// .data(d => d.kwh)
				.transition()
					.duration(duration - 500)
					.attr("x", d => stackedOrGrouped === 'grouped' ? x1Scale(d.category): x0Scale(d.category))
					.attr("y", d => kwhYScale(stackedOrGrouped === 'grouped' ? d.value : d.accumulated))
					.attr("width", stackedOrGrouped === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
					.attr("height", d => barSectionHeight - kwhYScale(d.value))   // run this to use changed kwhYScale
					.attr('stroke', d => data[`${d.category}Color`])
					.transition()
						.attr('stroke', d => widget.activeChartType === 'grouped' ? 'none' : data[`${d.category}Color`])

			//tick styling
			kwhChart.selectAll('.tick text')
				.style('fill', data.tickTextColor)
				.style('font', data.tickFont)
		};
		kwhChartTransition()

		function costChartTransition() {
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
					.attr("height", d => barSectionHeight - costYScale(d.cost))   // run this to use changed kwhYScale
					.attr('stroke', d => data[`${d.category}Color`])
					.transition()
						.attr('stroke', d => widget.activeChartType === 'grouped' ? 'none' : data[`${d.category}Color`])

			//tick styling
			costChart.selectAll('.tick text')
				.style('fill', data.tickTextColor)
				.style('font', data.tickFont)
		}
		costChartTransition()

	}

  //click handler for chart transitions
  const transitionChartsClickFunction = () => {
    widget.activeChartType === 'stacked' ?	widget.activeChartType = 'grouped' :	widget.activeChartType = 'stacked';
		transitionCharts(widget.activeChartType)
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
    .data(widget.dataForDate.equipmentDataForDate)
    .enter().append("g")
      .attr('class', d => `equipmentGroups ${d.type}EquipmentGroup`)
      .attr('transform', d => `translate(${widget.activeChartType === 'grouped' ? x0Scale(d.type) : 0},0)`)
  
  equipmentGroups.selectAll('.categoryRects')
    .data(d => d.kwh)
    .enter().append("rect")
      .attr('class', d => `categoryRects ${d.category}CategoryRect ${d.category}Bar`)
      .attr("x", d => widget.activeChartType === 'grouped' ? x1Scale(d.category) : x0Scale(d.category))
      .attr("y", d => widget.activeChartType === 'grouped' ? kwhYScale(d.value) : kwhYScale(d.accumulated))
      .attr("width", widget.activeChartType === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
      .attr("height", d => barSectionHeight - kwhYScale(d.value) )
			.attr("fill", d => data[`${d.category}Color`])
			.style('fill-opacity', d => widget.legendHovered === 'none' || widget.legendHovered === d.category ? 1 : unhoveredOpacity)
			.style('stroke-opacity', d => widget.legendHovered === 'none' || widget.legendHovered === d.category ? 1 : 0)
			.attr('stroke', d => widget.activeChartType === 'grouped' ? 'none' : data[`${d.category}Color`])
			.on('click', transitionChartsClickFunction)
			.on('mouseover', function (d) {
				if (widget.activeChartType === 'stacked'){
					widget.systemIsHovered = true;
				}
				if (widget.activeChartType === 'grouped'){
					widget.equipmentHovered = this.parentNode.__data__.type;
				}
				appendCostTooltip();
				appendKwhTooltip();
				renderChangeTools();
				kwhChart.selectAll('.kwhYAxisTitle')
					.style('opacity', 0);
				costChart.selectAll('.costYAxisTitle')
					.style('opacity', 0);
			})
			.on('mouseout', function (d) {
					widget.systemIsHovered = false;
					widget.equipmentHovered = 'none';
					resetElements('.costTooltip');
					resetElements('.kwhTooltip');
					renderChangeTools();
					kwhChart.selectAll('.kwhYAxisTitle')
						.style('opacity', 1);
					costChart.selectAll('.costYAxisTitle')
						.style('opacity', 1);
			});

			
  // x axis
  kwhBarSection.append('g')
		.attr("class", "axis xAxis")
		.attr("transform", `translate(0, ${barSectionHeight})`)
		.call(xAxisGenerator);

	// y axis
	kwhBarSection.append("g")
		.attr("class", "axis yAxis")
		.call(kwhYAxisGenerator)


	//tick styling
	kwhChart.selectAll('.tick text')
		.style('fill', data.tickTextColor)
		.style('font', data.tickFont)


	// y axis units title
	kwhBarSection.append('text')
		.attr('class', 'kwhYAxisTitle')
		.text('kWh')
		.attr('transform', 'rotate(-90)')
		.attr('y', 5)
		.attr("text-anchor", "middle")
		.attr('dominant-baseline', 'hanging')
		.attr('fill', data.unitsColor)
		.style('font', data.unitsFont)
		.style('opacity', widget.hoveredEquipmentDataForDate !== 'none' || widget.systemIsHovered ? 1 : 0)

	//stacked x axis title
	kwhBarSection.append('text')
		.attr('class', 'kwhXAxisTitle')
		.attr('dominant-baseline', 'hanging')
		.attr('x', (barSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2) )
		.style('font', data.tickFont)
		.attr('y', barSectionHeight + 6)
		.text(data.systemName)
		.style('opacity', widget.activeChartType === 'grouped' ? 0 : 1)


	// tooltip
	function appendKwhTooltip () {
		const isStacked = widget.activeChartType === 'stacked'
		const kwhDataForDate = widget.activeChartType === 'stacked' ? widget.dataForDate.categoryDataForDate : widget.dataForDate.equipmentDataForDate.filter(datum => datum.type === widget.equipmentHovered)[0].kwh;
		const maxWidthCat = kwhDataForDate.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0,1).toUpperCase()}:${isStacked ? curr.kwh : curr.value}`, 'bold ' + data.tooltipFont) > getTextWidth(`${accum.category.slice(0,1).toUpperCase()}:${isStacked ? curr.kwh : curr.value}`, 'bold ' + data.tooltipFont) ?
			curr :
			accum
		);

		const tooltipWidth = getTextWidth(`${maxWidthCat.category.slice(0,1).toUpperCase()}: ${isStacked ? maxWidthCat.kwh + ' kWh' : maxWidthCat.value + ' kWh'}`, 'bold ' + data.tooltipFont) + (data.tooltipPadding * 2) + data.paddingAfterLegendCat
		const tooltipHeight = (data.tooltipPadding * 2) + (kwhDataForDate.length * getTextHeight(data.tooltipFont)) + ((kwhDataForDate.length - 1) * data.paddingBetweenTooltipText);

		const tooltip = kwhBarSection.append('g')
			.attr('class', 'kwhTooltip')
			.attr('transform', `translate(${barSectionWidth - tooltipWidth},0)`)

		tooltip.append('rect')
			.attr('class', 'tooltip')
			.attr('height', tooltipHeight)
			.attr('width', tooltipWidth)
			.attr('fill', 'white')
			.attr('opacity', 0.75)
			.attr('rx', 5)
			.attr('ry', 5)

		const textGroups = tooltip.selectAll('.kwhTextGroup')
			.data(kwhDataForDate)
			.enter().append('g')
				.attr('class', d => `kwhTextGroup ${d.category}KwhTextGroup tooltip`)
				.attr('transform', (d, i) => `translate(${data.tooltipPadding},${data.tooltipPadding + (i * (getTextHeight(data.tooltipFont) + data.paddingBetweenTooltipText)) - (getTextHeight(data.tooltipFont) / 2)})`)
	
		textGroups.append('text')
			.text((d, i) => d.category.slice(0,1).toUpperCase() +': ')
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', d => data[d.category + 'Color']|| data.tooltipColor)
			.style('font-weight', 'bold')

		textGroups.append('text')
			.text((d, i) => isStacked ? d.kwh + ' kWh' : d.value + ' kWh')
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', data.tooltipColor)
			.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + data.paddingAfterLegendCat)
	}
	if (widget.systemIsHovered || widget.equipmentHovered !== 'none') appendKwhTooltip();








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
	.data(widget.dataForDate.equipmentDataForDate)
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
		.on('click', transitionChartsClickFunction)
		.on('mouseover', function (d) {
			if (widget.activeChartType === 'stacked'){
				widget.systemIsHovered = true;
			}
			if (widget.activeChartType === 'grouped'){
				widget.equipmentHovered = this.parentNode.__data__.type;
			}
			appendCostTooltip();
			appendKwhTooltip();
			renderChangeTools();
			kwhChart.selectAll('.kwhYAxisTitle')
				.style('opacity', 0);
			costChart.selectAll('.costYAxisTitle')
				.style('opacity', 0);
		})
		.on('mouseout', function (d) {
				widget.systemIsHovered = false;
				widget.equipmentHovered = 'none';
				resetElements('.costTooltip');
				resetElements('.kwhTooltip');
				renderChangeTools();
				kwhChart.selectAll('.kwhYAxisTitle')
					.style('opacity', 1);
				costChart.selectAll('.costYAxisTitle')
					.style('opacity', 1);
		});

		
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
	.attr('class', 'costYAxisTitle')
	.text(data.currency)
	.attr('transform', 'rotate(-90)')
	.attr('y', 5)
	.attr("text-anchor", "middle")
	.attr('dominant-baseline', 'hanging')
	.attr('fill', data.unitsColor)
	.style('font', data.unitsFont)
	.style('opacity', widget.hoveredEquipmentDataForDate !== 'none' || widget.systemIsHovered ? 1 : 0)


//stacked x axis title
costBarSection.append('text')
	.attr('class', 'costXAxisTitle')
	.attr('dominant-baseline', 'hanging')
	.attr('x', (barSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2) )
	.style('font', data.tickFont)
	.attr('y', barSectionHeight + 6)
	.text(data.systemName)
	.style('opacity', widget.activeChartType === 'grouped' ? 0 : 1)



	// tooltip
	function appendCostTooltip () {
		const costDataForDate = widget.activeChartType === 'stacked' ?
			widget.dataForDate.categoryDataForDate :
			widget.dataForDate.equipmentDataForDate.filter(datum => datum.type === widget.equipmentHovered)[0].utilityRate;

		const maxWidthCat = costDataForDate.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0,1).toUpperCase()}${data.formatCurrency(curr.cost)}${data.formatAvgCurrency(curr.rate)}`, 'bold ' + data.tooltipFont) > getTextWidth(`${accum.category.slice(0,1).toUpperCase()}${data.formatCurrency(accum.cost)}${data.formatAvgCurrency(accum.rate)}`, data.tooltipFont) ?
			curr :
			accum
		);

		const tooltipWidth = getTextWidth(`${maxWidthCat.category.slice(0,1).toUpperCase()}:${data.currencySymbol}${data.formatCurrency(maxWidthCat.cost)}@ ${data.currencySymbol}${data.formatAvgCurrency(maxWidthCat.rate)}`, 'bold ' + data.tooltipFont) + (data.tooltipPadding * 2) + (data.paddingAfterLegendCat * 2)
		const tooltipHeight = (data.tooltipPadding * 2) + (costDataForDate.length * getTextHeight(data.tooltipFont)) + ((costDataForDate.length - 1) * data.paddingBetweenTooltipText);

		const maxWidthCostCat = costDataForDate.reduce((accum, curr) => getTextWidth(data.formatCurrency(curr.cost), 'bold ' + data.tooltipFont) > getTextWidth(data.formatCurrency(accum.cost), 'bold ' + data.tooltipFont) ?
			curr :
			accum
		);
		const maxWidthOfCost = getTextWidth(data.currencySymbol + data.formatCurrency(maxWidthCostCat.cost), 'bold ' + data.tooltipFont);

		const tooltip = costBarSection.append('g')
			.attr('class', 'costTooltip')
			.attr('transform', `translate(${barSectionWidth - tooltipWidth},0)`)

		tooltip.append('rect')
			.attr('class', 'tooltip')
			.attr('height', tooltipHeight)
			.attr('width', tooltipWidth)
			.attr('fill', 'white')
			.attr('opacity', 0.75)
			.attr('rx', 5)
			.attr('ry', 5)

		const textGroups = tooltip.selectAll('.costTextGroup')
			.data(costDataForDate)
			.enter().append('g')
				.attr('class', d => `costTextGroup ${d.category}CostTextGroup tooltip`)
				.attr('transform', (d, i) => `translate(${data.tooltipPadding},${data.tooltipPadding + (i * (getTextHeight(data.tooltipFont) + data.paddingBetweenTooltipText)) - (getTextHeight(data.tooltipFont) / 2)})`)
	
		textGroups.append('text')
			.text((d, i) => d.category.slice(0,1).toUpperCase() +': ')
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', d => data[d.category + 'Color']|| data.tooltipColor)
			.style('font-weight', 'bold')

		// textGroups.append('text')
		// 	.text((d, i) => data.currencySymbol + data.formatCurrency(d.cost))
		// 	.attr('dominant-baseline', 'hanging')
		// 	.style('font', data.tooltipFont)
		// 	.attr('fill', data.tooltipColor)
		// 	.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + data.paddingAfterLegendCat)


		textGroups.append('text')
			.text((d, i) => data.currencySymbol + data.formatCurrency(d.cost))
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', data.tooltipColor)
			.attr('text-anchor', 'end')
			.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + maxWidthOfCost + data.paddingAfterLegendCat)

		textGroups.append('text')
			.text((d, i) => '@ ' + data.currencySymbol + data.formatAvgCurrency(d.rate))
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', data.tooltipColor)
			.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + maxWidthOfCost + (data.paddingAfterLegendCat * 2))

	}
	if (widget.systemIsHovered || widget.equipmentHovered !== 'none')	appendCostTooltip();

	




	//********************************** TRH CHART *****************************************//
	const trhCategoryDataForDate = widget.dataForDate.categoryDataForDate.filter(cat => cat.category !== 'projected')

	// initialization

	// chart group
	const trhBarSection = trhChart.append('g')
		.attr('class', 'trhBarSection')
		.attr('transform', `translate(${yAxisWidth}, 0)`)


	// bars

	trhBarSection.selectAll('.categoryRects')
		.data(trhCategoryDataForDate)
		.enter().append("rect")
			.attr('class', d => `categoryRects ${d.category}CategoryRect ${d.category}Bar`)
			.attr("x", d => trhXScale(d.category))
			.attr("y", d => trhYScale(d.trh))
			.attr("width", trhXScale.bandwidth())
			.attr("height", d => barSectionHeight - trhYScale(d.trh) )
			.attr("fill", d => data[`${d.category}Color`])
			.style('fill-opacity', d => widget.legendHovered === 'none' || widget.legendHovered === d.category ? 1 : unhoveredOpacity)
			.style('stroke-opacity', d => widget.legendHovered === 'none' || widget.legendHovered === d.category ? 1 : 0)
			.attr('stroke', d => data[`${d.category}Color`])
			.on('mouseover', function (){
				widget.trhIsHovered = true;
				appendTrhTooltip();
				trhChart.selectAll('.trhYAxisTitle')
					.style('opacity', 0)
			})
			.on('mouseout', function (){
				widget.trhIsHovered = false;
				resetElements('.trhTooltip');
				trhChart.selectAll('.trhYAxisTitle')
					.style('opacity', 1)
			})

			
	// x axis
	trhBarSection.append('g')
		.attr("class", "axis xAxis")
		.attr("transform", `translate(0, ${barSectionHeight})`)
		.call(trhXAxisGenerator);

	// y axis
	trhBarSection.append("g")
		.attr("class", "axis yAxis")
		.call(trhYAxisGenerator)


	//tick styling
	trhChart.selectAll('.tick text')
		.style('fill', data.tickTextColor)
		.style('font', data.tickFont)


	// y axis units title
	trhBarSection.append('text')
		.attr('class', 'trhYAxisTitle')
		.text('tRh')
		.attr('transform', 'rotate(-90)')
		.attr('y', 5)
		.attr("text-anchor", "middle")
		.attr('dominant-baseline', 'hanging')
		.attr('fill', data.unitsColor)
		.style('font', data.unitsFont)
		.style('opacity', widget.trhIsHovered ? 0 : 1)


	//stacked x axis title
	trhBarSection.append('text')
		.attr('class', 'trhXAxisTitle')
		.attr('dominant-baseline', 'hanging')
		.attr('x', (trhBarSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2) )
		.style('font', data.tickFont)
		.attr('y', barSectionHeight + 6)
		.text(data.systemName)


	// tooltip
	function appendTrhTooltip () {
		const maxWidthCat = trhCategoryDataForDate
			.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0,1).toUpperCase()}:${curr.trh}`, data.tooltipFont) > getTextWidth(`${accum.category.slice(0,1).toUpperCase()}:${accum.trh}`, 'bold ' + data.tooltipFont) ?
				curr :
				accum
			);
		const trhTooltipWidth = getTextWidth(`${maxWidthCat.category.slice(0,1).toUpperCase()}: ${maxWidthCat.trh + ' tRh'}`, 'bold ' + data.tooltipFont) + (data.tooltipPadding * 2)
		const trhTooltipHeight = 30;
		const trhTooltip = trhBarSection.append('g')
			.attr('class', 'trhTooltip')
			.attr('transform', `translate(${trhBarSectionWidth - trhTooltipWidth}, 0)`)

		trhTooltip.append('rect')
			.attr('class', 'tooltip')
			.attr('height', trhTooltipHeight)
			.attr('width', trhTooltipWidth)
			.attr('fill', 'white')
			.attr('opacity', 0.75)
			.attr('rx', 5)
			.attr('ry', 5)

		const trhTextGroups = trhTooltip.selectAll('.trhTextGroup')
			.data(trhCategoryDataForDate)
			.enter().append('g')
				.attr('class', d => `trhTextGroup ${d.category}TrhTextGroup tooltip`)
				.attr('transform', (d, i) => `translate(${(data.tooltipPadding)},${data.tooltipPadding + (i * (getTextHeight(data.tooltipFont) + data.paddingBetweenTooltipText)) - (getTextHeight(data.tooltipFont) / 2)})`)
	
		trhTextGroups.append('text')
			.text(d => `${d.category.slice(0,1).toUpperCase()}:`)
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', d => data[d.category + 'Color']|| data.tooltipColor)
			.style('font-weight', 'bold')

		trhTextGroups.append('text')
			.text(d => d.trh + ' tRh')
			.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + data.paddingAfterLegendCat)
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', data.tooltipColor)

	}
	if (widget.trhIsHovered) appendTrhTooltip();



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



//************************************* TOOLS ******************************************//

	
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
		.text(data.formatCurrency(data.utilityRate))


		// CHANGE TOOLS
	const changeToolsPaddingTop = 0;
	const getNiceChangePercent = (origVal, newVal) => {
		const diff = Math.abs(origVal - newVal);
		const change = diff / origVal;
		const percentVal = change * 100;
		return Math.round(percentVal);
	}
	const paddingBetweenPercentAndValue = 5;
	const paddingBetweenArrowAndPercent = 0;
	const getWidthOfPercentArrowAndText = text => getTextWidth(text + 'W%', data.changePercentFont) + paddingBetweenArrowAndPercent;
	const changeToolWidth = (4.5/8) * barSectionWidth;
	const changeToolHeight = 60;
	const getArrowPath = decrease => decrease ? './images/Down Arrow.svg' : './images/Up Arrow.svg';
	const imgCircleRadius = 22;
	const paddingBetweenChangeTools = imgCircleRadius + 5;


																																			// TODO: DELETE TESTING DATA:
																																		widget.lastKwhPercent = [0,2,8];
																																		widget.lastCostPercent = [0,5,2];
																																		widget.lastTrhPercent = [0,0,9];
																																			// TODO: DELETE TESTING DATA

	function getSystemOrHoveredData () {
		let kwh, cost, trh;
		let kwhPercent = {last: [], new: []};
		let costPercent = {last: [], new: []};
		let trhPercent = {last: [], new: []};
		if (widget.equipmentHovered !== 'none') {
			const hoveredEquipmentDataForDate = widget.dataForDate.equipmentDataForDate.filter(equip => equip.type === widget.equipmentHovered)[0];

			// set percentage arrays
				//kwh
			kwhPercent.new = getNiceChangePercent(hoveredEquipmentDataForDate.kwh[0].value, hoveredEquipmentDataForDate.kwh[2].value).toString().split('').map(digit => +digit);
			if (kwhPercent.new.length > 2) kwhPercent.new = [1, 9, 9];
			if (kwhPercent.new.length === 1) kwhPercent.new.unshift(0, 0);
			if (kwhPercent.new.length === 2) kwhPercent.new.unshift(0);
			kwhPercent.last = widget.lastKwhPercent ? widget.lastKwhPercent.slice() : kwhPercent.new.slice();
			widget.lastKwhPercent = kwhPercent.new.slice();

				//cost
			costPercent.new = getNiceChangePercent(hoveredEquipmentDataForDate.utilityRate[0].cost, hoveredEquipmentDataForDate.utilityRate[2].cost).toString().split('').map(digit => +digit);
			if (costPercent.new.length > 2) costPercent.new = [1, 9, 9];
			if (costPercent.new.length === 1) costPercent.new.unshift(0, 0);
			if (costPercent.new.length === 2) costPercent.new.unshift(0);
			costPercent.last = widget.lastCostPercent ? widget.lastCostPercent.slice() : costPercent.new.slice();
			widget.lastCostPercent = costPercent.new.slice();


			//create objects to iterate over
			kwh = {
				category: 'kwh',
				value: Math.abs(hoveredEquipmentDataForDate.kwh[2].value - hoveredEquipmentDataForDate.kwh[0].value),
				percent: kwhPercent.slice(),
				arrowPath: getArrowPath(hoveredEquipmentDataForDate.kwh[2].value <= hoveredEquipmentDataForDate.kwh[0].value),
				imgPath: './images/Electricity Badge.svg',
				label: ' kWh'
			};
			cost = {
				category: 'cost',
				value: data.formatCurrency(Math.abs(hoveredEquipmentDataForDate.utilityRate[2].cost - hoveredEquipmentDataForDate.utilityRate[0].cost)),
				percent: costPercent.slice(),
				arrowPath: getArrowPath(hoveredEquipmentDataForDate.utilityRate[2].cost <= hoveredEquipmentDataForDate.utilityRate[0].cost),
				imgPath: './images/Monetary Badge.svg',
				label: data.currencySymbol
			};
		} else {
			
			// set percentage arrays
				//kwh
				kwhPercent.new = getNiceChangePercent(widget.dataForDate.categoryDataForDate[0].kwh, widget.dataForDate.categoryDataForDate[2].kwh).toString().split('').map(digit => +digit);
				if (kwhPercent.new.length > 2) kwhPercent.new = [1, 9, 9];
				if (kwhPercent.new.length === 1) kwhPercent.new.unshift(0, 0);
				if (kwhPercent.new.length === 2) kwhPercent.new.unshift(0);
				kwhPercent.last = widget.lastKwhPercent ? widget.lastKwhPercent.slice() : kwhPercent.new.slice();
				widget.lastKwhPercent = kwhPercent.new.slice();
	
					//cost
				costPercent.new = getNiceChangePercent(widget.dataForDate.categoryDataForDate[0].cost, widget.dataForDate.categoryDataForDate[2].cost).toString().split('').map(digit => +digit);
				if (costPercent.new.length > 2) costPercent.new = [1, 9, 9];
				if (costPercent.new.length === 1) costPercent.new.unshift(0, 0);
				if (costPercent.new.length === 2) costPercent.new.unshift(0);
				costPercent.last = widget.lastCostPercent ? widget.lastCostPercent.slice() : costPercent.new.slice();
				widget.lastCostPercent = costPercent.new.slice();
	
	
	
				//create objects to iterate over
			kwh = {
				category: 'kwh',
				value: Math.abs(widget.dataForDate.categoryDataForDate[2].kwh - widget.dataForDate.categoryDataForDate[0].kwh),
				percent: JSON.parse(JSON.stringify(kwhPercent)),
				arrowPath: getArrowPath(widget.dataForDate.categoryDataForDate[2].kwh <= widget.dataForDate.categoryDataForDate[0].kwh),
				imgPath: './images/Electricity Badge.svg',
				label: ' kWh'
			};
			cost = {
				category: 'cost',
				value: data.formatCurrency(Math.abs(widget.dataForDate.categoryDataForDate[2].cost - widget.dataForDate.categoryDataForDate[0].cost)),
				percent: JSON.parse(JSON.stringify(costPercent)),
				arrowPath: getArrowPath(widget.dataForDate.categoryDataForDate[2].cost <= widget.dataForDate.categoryDataForDate[0].cost),
				imgPath: './images/Monetary Badge.svg',
				label: data.currencySymbol
			};
		}
	// set percentage arrays
		//trh
		trhPercent.new = getNiceChangePercent(widget.dataForDate.categoryDataForDate[0].trh, widget.dataForDate.categoryDataForDate[2].trh).toString().split('').map(digit => +digit);
		if (trhPercent.new.length > 2) trhPercent.new = [1, 9, 9];
		if (trhPercent.new.length === 1) trhPercent.new.unshift(0, 0);
		if (trhPercent.new.length === 2) trhPercent.new.unshift(0);
		trhPercent.last = widget.lastTrhPercent ? widget.lastTrhPercent.slice() : trhPercent.new.slice();
		widget.lastTrhPercent = trhPercent.new.slice();

	//create object to iterate over
		trh = {
			category: 'trh',
			value: Math.abs(widget.dataForDate.categoryDataForDate[2].trh - widget.dataForDate.categoryDataForDate[0].trh),
			percent: JSON.parse(JSON.stringify(trhPercent)),
			arrowPath: getArrowPath(widget.dataForDate.categoryDataForDate[2].trh <= widget.dataForDate.categoryDataForDate[0].trh),
			imgPath: './images/Production Badge.svg',
			label: ' tRh'
		};
		return [kwh, cost, trh]
	};

	function renderChangeTools () {
		resetElements('.changeTools')

		const changeTools = toolsGroup.append('g')
			.attr('class', 'changeTools')
			.attr('transform', 	`translate(${300}, ${32})`)

		const systemOrHoveredData = getSystemOrHoveredData()
		
		//append data to each changeToolGroup
		const changeToolGroups = changeTools.selectAll('.changeToolGroups')
			.data(systemOrHoveredData)
			.enter().append('g')
				.attr('class', d => `changeToolGroups ${d.category}ChangeToolGroup`)
				.attr('transform', (d, i) => `translate(${imgCircleRadius + (i * (changeToolWidth + paddingBetweenChangeTools))}, 0)`)
		
		//append rects to each changeToolGroup
		changeToolGroups.append('rect')
			.attr('height', changeToolHeight)
			.attr('width', changeToolWidth)
			.attr('fill', data.changeToolRectColor)
			.attr('rx', 5)
			.attr('ry', 5)

		//append graphic circles to each changeToolGroup
		changeToolGroups.append('svg:image')
			.attr('xlink:href', d => d.imgPath)
			.attr('x', -imgCircleRadius + 'px')
			.attr('y', -imgCircleRadius + 'px')
			.attr('height', imgCircleRadius * 2)
			.attr('width', imgCircleRadius * 2)

		const percentChangeGroups = changeToolGroups.append('g')
			.attr('class', 'percentChangeGroups')
			.attr('transform', d => `translate(${(changeToolWidth / 2) - (getWidthOfPercentArrowAndText('>88') / 2)},${changeToolsPaddingTop})`)
		
		//append arrows
		percentChangeGroups.append('svg:image')
			.attr('xlink:href', d => d.arrowPath)
			.attr('y', '7')
			.attr('height', getTextHeight(data.changePercentFont) - 7)
			.attr('width', getTextWidth('W', data.changePercentFont))





		//append percent change svg with hidden overflow
		const changeToolSvg = percentChangeGroups.append('svg')
			.attr('class', 'changeToolSvg')
			.attr('y', 5)
			.attr('x', (getTextWidth('W', data.changePercentFont) + paddingBetweenArrowAndPercent) - 5)
			.attr('height', (getTextHeight(data.changePercentFont)))
			.attr('width', changeToolWidth - (getTextWidth('W', data.changePercentFont) + paddingBetweenArrowAndPercent) - 5)

		// changeToolSvg.append('rect')
		// 	.attr('height', 800)
		// 	.attr('width', 500)
		// 	.attr('fill', 'blue')

		const displayForIndex = [
			[' ', '>'],
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
		]

		//append percent change
		const percentChangeTextGroup = changeToolSvg.append('g')
			.attr('transform', `translate(5,${(getTextHeight(data.changePercentFont) - 5)})`)
			.attr('class', (d, i) => `textGroupIndex${i}`)
					
		const percentChangeText1 = percentChangeTextGroup.selectAll('.digitBox1')
			.data(d => d.percent.last)
				.enter().append('text')
					.attr('class', (d, i, parentNode) => `digitBox1 g1DigitIndex${i}For${parentNode[i].parentNode.__data__.category}`)
					.text((d, i) => {
						return displayForIndex[i][d]
					})
					.attr('x', (d, i, parentNode) => {
						if(i === 1 && parentNode[0].__data__ === 0) {
							return getTextWidth('0', data.changePercentFont) / 2
						} else if (i === 2 && parentNode[0].__data__ === 0) {
							return getTextWidth('0', data.changePercentFont) * 1.5;
						} else {
							return i * getTextWidth('0', data.changePercentFont);
						}
					})
					.attr('y', 0)
					.attr('fill', data.changePercentColor)
					.style('font', data.changePercentFont)

		const percentChangeText2 = percentChangeTextGroup.selectAll('.digitBox2')
			.data(d => d.percent.last)
				.enter().append('text')
					.attr('class', (d, i, parentNode) => `digitBox1 g1DigitIndex${i}For${parentNode[i].parentNode.__data__.category}`)
					.text((d, i) => displayForIndex[i][d])
					.attr('x', (d, i, parentNode) => {
						if(i === 1 && parentNode[0].__data__ === 0) {
							return getTextWidth('0', data.changePercentFont) / 2
						} else if (i === 2 && parentNode[0].__data__ === 0) {
							return getTextWidth('0', data.changePercentFont) * 1.5;
						} else {
							return i * getTextWidth('0', data.changePercentFont);
						}
					})
					.attr('y', 30)
					.attr('fill', data.changePercentColor)
					.style('font', data.changePercentFont)
				

/*
					.text((d, i, parentNode) => {
						const percentArr = parentNode[i].parentNode.__data__.percent
						const lastDigit = percentArr[i];
						const newDigit = percentArr[i];
						if (newDigit > lastDigit)
						return displayForIndex[i][d]
					})
*/


	const changeDuration = 4000;

	// const digitObjToChange1 = widget.svg.selectAll(`.g1DigitIndex${1}Forkwh`)
	// digitObjToChange1.transition().delay(1000).duration(1000).attr('fill', 'blue')
	function switchObjPlaces (category, digitIndex, delayMultiplier, numbersToGetThrough, currentVal) {
		const digitObjToChange1 = widget.svg.selectAll(`.g1DigitIndex${digitIndex}For${category}`);
		const digitObjToChange2 = widget.svg.selectAll(`.g2DigitIndex${digitIndex}For${category}`);
		const thisDuration = changeDuration / numbersToGetThrough;
			console.log('switching places!')

			digitObjToChange1
				.transition()
					.duration(0)
					.delay(thisDuration * (delayMultiplier + 1))
					.text(() => displayForIndex[digitIndex][currentVal])
					.attr('y', 0);

			digitObjToChange2
				.transition()
					.duration(0)
					.delay(thisDuration * (delayMultiplier + 1))
					.attr('y', 30);
	}

	function increaseDigit (category, digitIndex, delayMultiplier, numbersToGetThrough, currentVal) {
		const digitObjToChange1 = widget.svg.selectAll(`.g1DigitIndex${digitIndex}For${category}`);
		const digitObjToChange2 = widget.svg.selectAll(`.g2DigitIndex${digitIndex}For${category}`);
		const thisDuration = changeDuration / numbersToGetThrough;

		digitObjToChange1
			.transition()
				.delay(thisDuration * delayMultiplier)
				.duration(thisDuration)
				.attr('y', -30)


		digitObjToChange2
			.transition()
					.delay(thisDuration * delayMultiplier)
					.duration(0)
					.text(() => displayForIndex[digitIndex][+currentVal + 1])
					.attr('y', 30)
			.transition()
				.delay(thisDuration * delayMultiplier)
				.duration(thisDuration)
				.attr('y', 0)

				
	}

	function decreaseDigit (category, digitIndex, delayMultiplier, numbersToGetThrough, currentVal) {
		const digitObjToChange1 = widget.svg.selectAll(`.g1DigitIndex${digitIndex}For${category}`);
		const digitObjToChange2 = widget.svg.selectAll(`.g2DigitIndex${digitIndex}For${category}`);
		const thisDuration = changeDuration / numbersToGetThrough;
		
		digitObjToChange1
			.transition()
				.delay(thisDuration * delayMultiplier)
				.duration(thisDuration)
				.attr('y', 30)

		digitObjToChange2
			.transition()
				.delay(thisDuration * delayMultiplier)
				.duration(0)
				.text(() => displayForIndex[digitIndex][+currentVal - 1])
				.attr('y', -30)
			.transition()
				.delay(thisDuration * delayMultiplier)
				.duration(thisDuration)
				.attr('y', 0)

	}



	let kwhPercentObj = JSON.parse(JSON.stringify(systemOrHoveredData[0].percent));
	kwhPercentObj.current = kwhPercentObj.last.slice();
	let costPercentObj = JSON.parse(JSON.stringify(systemOrHoveredData[1].percent));
	costPercentObj.current = costPercentObj.last.slice();
	let trhPercentObj = JSON.parse(JSON.stringify(systemOrHoveredData[2].percent));
	trhPercentObj.current = trhPercentObj.last.slice();

	console.log('data:\nkwh: old: ', kwhPercentObj.current.join(''), '. new: ', kwhPercentObj.new.join(''), '\ncost: old: ', costPercentObj.current.join(''), '. new: ', costPercentObj.new.join(''), '\ntrh: old: ', trhPercentObj.current.join(''), '. new: ', trhPercentObj.new.join(''));

	function loopFromTo(category, digitIndex, from, to) {
		// console.log('loopingFromTo: ', from, to)
		let differenceBtwOldAndNewVal = 0;
		from = +from;
		to = +to;
		if (from < to) {
			differenceBtwOldAndNewVal = to - from;
			let counter = 0;
			function increaseRecursively () {
				counter++;
				const delayMultiplier = counter + 1;
				const numbersToGetThrough = differenceBtwOldAndNewVal;
				const currentVal = from + counter;
				const digitObjToChange1 = widget.svg.selectAll(`.g1DigitIndex${digitIndex}For${category}`);
				const digitObjToChange2 = widget.svg.selectAll(`.g2DigitIndex${digitIndex}For${category}`);
				const thisDuration = changeDuration / numbersToGetThrough;
		
				digitObjToChange1
					.transition()
						.delay(thisDuration * delayMultiplier)
						.duration(thisDuration)
						// .attr('y', -30)
						.text(() => displayForIndex[digitIndex][+currentVal + 1])
						.on('end', () => {
							counter++;
							if (counter < differenceBtwOldAndNewVal) increaseRecursively()
						})
		
		
				// digitObjToChange2
				// 	.transition()
				// 			.delay(thisDuration * delayMultiplier)
				// 			.duration(0)
				// 			.text(() => displayForIndex[digitIndex][+currentVal + 1])
				// 			.attr('y', 30)
				// 	.transition()
				// 		.delay(thisDuration * delayMultiplier)
				// 		.duration(thisDuration)
				// 		.attr('y', 0)
				// 		.on('end', () => {
				// 			digitObjToChange1
				// 				.transition()
				// 					.duration(0)
				// 					.delay(thisDuration * (delayMultiplier + 0.5))
				// 					.text(() => displayForIndex[digitIndex][+currentVal + 1])
				// 					.attr('y', 0);

				// 			digitObjToChange2
				// 				.transition()
				// 					.duration(0)
				// 					.delay(thisDuration * (delayMultiplier + 0.5))
				// 					.attr('y', 30)
				// 					.on('end', () => {
											// counter++;
				// 						if (counter < differenceBtwOldAndNewVal) increaseRecursively()
				// 					})
				// 		})

			}
			increaseRecursively();
			// for (let i = 0; i < differenceBtwOldAndNewVal; i++) {
			// 	increaseDigit (category, digitIndex, i + 1, differenceBtwOldAndNewVal, from + i);
			// 	switchObjPlaces (category, digitIndex, i + 1, differenceBtwOldAndNewVal, (from + i) + 1);
			// }
		} else {
			differenceBtwOldAndNewVal = from - to;
			let counter = 0;
			function decreaseRecursively () {
				const delayMultiplier = counter + 1;
				const numbersToGetThrough = differenceBtwOldAndNewVal;
				const currentVal = from + counter;
				const digitObjToChange1 = widget.svg.selectAll(`.g1DigitIndex${digitIndex}For${category}`);
				const digitObjToChange2 = widget.svg.selectAll(`.g2DigitIndex${digitIndex}For${category}`);
				const thisDuration = changeDuration / numbersToGetThrough;
		
				digitObjToChange1
					.transition()
						.delay(thisDuration * delayMultiplier)
						.duration(thisDuration)
						// .attr('y', 30)
						.text(() => displayForIndex[digitIndex][+currentVal - 1])
						.on('end', () => {
							counter++;
							if (counter < differenceBtwOldAndNewVal) decreaseRecursively()
						})
		
		
				// digitObjToChange2
				// 	.transition()
				// 			.delay(thisDuration * delayMultiplier)
				// 			.duration(0)
				// 			.text(() => displayForIndex[digitIndex][+currentVal - 1])
				// 			.attr('y', -30)
				// 	.transition()
				// 		.delay(thisDuration * delayMultiplier)
				// 		.duration(thisDuration)
				// 		.attr('y', 0)
				// 		.on('end', () => {
				// 			digitObjToChange1
				// 				.transition()
				// 					.duration(0)
				// 					.delay(thisDuration * (delayMultiplier + 0.5))
				// 					.text(() => displayForIndex[digitIndex][+currentVal - 1])
				// 					.attr('y', 0);

				// 			digitObjToChange2
				// 				.transition()
				// 					.duration(0)
				// 					.delay(thisDuration * (delayMultiplier + 0.5))
				// 					.attr('y', 30)
				// 					.on('end', () => {
											// counter++;
				// 						if (counter < differenceBtwOldAndNewVal) decreaseRecursively()
				// 					})
				// 		})
			}
			decreaseRecursively();
		}
	}

	function changeDigits (currentArr, newArr, category) {
		currentArr = currentArr.slice();
		newArr = newArr.slice();
		// if (+currentArr.slice(1).join('') < +newArr.slice(1).join('')) {

			if(+newArr[2] !== +currentArr[2]) {
				loopFromTo(category, 2, +currentArr[2], +newArr[2])
			}
			if(+newArr[1] !== +currentArr[1]) {
				loopFromTo(category, 1, +currentArr[1], +newArr[1])
			}
			if(+newArr[0] !== +currentArr[0]) {
				loopFromTo(category, 0, +currentArr[0], +newArr[0])
			}

				// if (currentArr[2] == 9) {

				// 	if (currentArr[1] == 9) {
				// 		// increase 1st digit to 1
				// 		loopFromTo(category, 0, 0, 1)
				// 	} else {
				// 		// lower 3rd digit by 1 (to 0)
				// 		loopFromTo(category, 2, 9, 0)
				// 		// increase 2nd digit by 1
				// 		loopFromTo(category, 1, currentArr[1], +currentArr[1] + 1)
				// 		//change currentArr to reflect changes
				// 		currentArr[2] = 0;
				// 		currentArr[1] = +currentArr[1] + 1;
				// 		// recurse in case currentArr still not up to newArr
				// 		changeDigits (currentArr, newArr, category);
				// 	}

				// } else {
				// 	//increase 3rd digit by 1 (to new digit at index)
				// 	loopFromTo(category, 2, currentArr[2], +currentArr[2] + 1);
				// 	//change currentArr to reflect changes
				// 	currentArr[2] = +currentArr[2] + 1;
				// 	// recurse in case currentArr still not up to newArr
				// 	changeDigits (currentArr, newArr, category);
				// }

		// } else if (+currentArr.slice(1).join('') > +newArr.slice(1).join('')) {
		// 	console.log('smaller!')
	
		// }
	}
	
changeDigits(kwhPercentObj.last, kwhPercentObj.new, 'kwh');
changeDigits(costPercentObj.last, costPercentObj.new, 'cost');
changeDigits(trhPercentObj.last, trhPercentObj.new, 'trh');















// 		function callTransition (obj) {
// 			// let count = [0, 0, 0];
// const i = 1
// 			// function transition () {
// 				// percentChangeText1
// 				obj
// 					.transition()
// 						.delay(i * 1000)
// 						.duration(1000)
// 						// .text((d, i) => i)
// 						.attr('y', -30)

// 				// percentChangeText1
// 				obj
// 					.transition()
// 						.delay(i * 2000)
// 						.duration(1000)
// 						.attr('y', 0)

// 				// percentChangeText1
// 				obj
// 					.transition()
// 						.delay(i * 3000)
// 						.duration(1000)
// 						.attr('y', 30)

// 				// percentChangeText1
// 				obj
// 					.transition()
// 						.delay(i * 4000)
// 						.duration(1000)
// 						.attr('y', 0)
// 						// .on('end', (d, i) => {
// 						// 	if (count < 3) {
// 						// 		count++;
// 						// 		transition();
// 						// 	}
// 						// })
// 			// }
// 			// transition();

// 		}

// 		// for (let i = 1; i < 4; i++) {
// 			callTransition(percentChangeText1);
// 		// }



















		//append percent sign
		percentChangeTextGroup.append('text')
			.text('%')
			.attr('x', d => d.percent.last[0] === 1 ? getTextWidth('0', data.changePercentFont) * 3 : getTextWidth('0', data.changePercentFont) * 2.5)
			.attr('fill', data.changePercentColor)
			.style('font', data.changePercentFont)
			.style('font-size', (getTextHeight(data.changePercentFont) / 2) + 'pt')

		const valueChangeGroup = changeToolGroups.append('g')
			.attr('class', 'valueChangeGroup')
			.attr('transform', d => `translate(${(changeToolWidth / 2) - (getTextWidth(d.value + d.label, data.changeValueFont) / 2)},${changeToolsPaddingTop + getTextHeight(data.changePercentFont) + paddingBetweenPercentAndValue + getTextHeight(data.changeValueFont)})`)

		//append value change
		valueChangeGroup.append('text')
			.text((d, i) => i === 1 ? d.label + d.value : d.value + d.label)	
			.style('font', data.changeValueFont)
			.attr('fill', data.changeValueColor)
			
	}
	renderChangeTools()
}

renderWidget();