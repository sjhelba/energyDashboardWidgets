////ONLY FOR BROWSER /////

const widget = {};


////////// Hard Coded Defs //////////
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
	data.dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected, [data.kwH_baselineData, data.kwH_projectedData, data.kwH_measuredData])
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



const getDataForDate = (month, year, categoriesData = [kwH_baselineData, kwH_projectedData, kwH_measuredData]) => {
	let categoryDataForDate = [
		{
			category: 'baseline',
			kwh: 0
		},
		{
			category: 'projected',
			kwh: 0
		},
		{
			category: 'measured',
			kwh: 0
		}
	];
	let equipmentDataForDate = [
		{
			type: 'CHs',
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
				equipmentDataForDate[0].kwh[categoryIndex].value = monthlyDatum.equipment[0].value;
				equipmentDataForDate[1].kwh[categoryIndex].value = monthlyDatum.equipment[1].value;
				equipmentDataForDate[2].kwh[categoryIndex].value = monthlyDatum.equipment[2].value;
				equipmentDataForDate[3].kwh[categoryIndex].value = monthlyDatum.equipment[3].value;
				equipmentDataForDate[4].kwh[categoryIndex].value = monthlyDatum.equipment[4].value;
			}
		})
  })
  equipmentDataForDate.forEach((equipmentGroup, egIndex) => {
    equipmentGroup.kwh.forEach((category, catIndex) => {
      category.accumulated += category.value;
      if (egIndex > 0) {
        category.accumulated += equipmentDataForDate[egIndex - 1].kwh[catIndex].accumulated;
			}
			categoryDataForDate[catIndex].kwh = category.accumulated;
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
		name: 'dropdownLabelColor',
		value: '#444444',
		typeSpec: 'gx:Color'
  },
  {
		name: 'dropdownLabelFont',
		value: '9pt Nirmala UI',
		typeSpec: 'gx:Font'
  },
  {
		name: 'dropdownTextColor',
		value: 'black',
		typeSpec: 'gx:Color'
  },
  {
		name: 'dropdownFont',
		value: '10pt Nirmala UI',
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
if (!widget.monthDropDownSelected) widget.monthDropDownSelected = 'All';
if (!widget.yearDropDownSelected) widget.yearDropDownSelected = thisYear;
if (!widget.activeKwhChart) widget.activeKwhChart = 'stacked';

  // FAKE DATA //
data.kwH_baselineData = kwH_baselineData;
data.kwH_projectedData = kwH_projectedData;
data.kwH_measuredData = kwH_measuredData;
data.utilityRate = 0.05;



	// CALCULATED DEFS //
	//get dataForDate
data.dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected, [data.kwH_baselineData, data.kwH_projectedData, data.kwH_measuredData])
console.log(data.dataForDate)

// eg format: {2017: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 2018: ['Jan', 'Feb', 'Mar']}
data.availableDates = {};
data.kwH_measuredData.forEach(date => {
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
	const paddingLeftOfDropdown = 20;
	const dateDropdownWidth = 100;
	const paddingBetweenDropdowns = 20;
  const paddingAboveDropdowns = 30;
  const dropdownBorderRadius = '100px'

	const dropdownDiv = outerDiv.append('div')
		.attr('class', 'dropdownDiv')
    // .style('margin-top', data.margin.top + 'px')

		//Year Dropdown
	dropdownDiv.append('h4')
		.attr('dominant-baseline', 'hanging')
		.style('left', data.margin.left + paddingLeftOfDropdown + 'px')
		.text('Year')
    .style('position', 'absolute')
    .style('top', data.margin.top)
    .style('color', data.dropdownLabelColor)
    .style('font', data.dropdownLabelFont)

	const yearSelect = dropdownDiv.append('select')
    .style('width', dateDropdownWidth + 'px')
    .attr('class', 'yearSelect')
		.style('border-radius', dropdownBorderRadius)
		.style('margin', '0px')
		.style('border', '1px solid black')
		.style('position', 'absolute')
		.style('left', data.margin.left + paddingLeftOfDropdown + 'px')
		.style('top', data.margin.top + paddingAboveDropdowns + 'px')
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
		.style('position', 'absolute')
		.style('left', data.margin.left + paddingLeftOfDropdown + dateDropdownWidth + paddingBetweenDropdowns + 'px')
    .text('Month')
    .style('color', data.dropdownLabelColor)
    .style('font', data.dropdownLabelFont);

	const monthSelect = dropdownDiv.append('select')
    .style('width', dateDropdownWidth + 'px')
		.attr('class', 'monthSelect')
		.style('border-radius', dropdownBorderRadius)
		.style('margin', 0)
		.style('border', '1px solid black')
		.style('position', 'absolute')
		.style('left', data.margin.left + paddingLeftOfDropdown + dateDropdownWidth + paddingBetweenDropdowns + 'px')
		.style('top', data.margin.top + paddingAboveDropdowns + 'px')
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


	// GENERAL GROUPS //
	const graphicGroup = widget.svg.append('g')
		.attr('class', 'graphicGroup')
		.attr('transform', `translate(${data.margin.left}, ${data.margin.top})`);


  const dropdownGroupHeight = data.graphicHeight / 4;
  const paddingBetweenDropdownsAndCharts = 40
	const dropdownGroup = graphicGroup.append('g')
		.attr('class', 'dropdownGroup')

	const paddingBetweenCharts = 20;

	const chartsGroup = graphicGroup.append('g')
		.attr('class', 'chartsGroup')
		.attr('transform', `translate(0, ${dropdownGroupHeight + paddingBetweenDropdownsAndCharts})`);

	const chartWidth = (data.graphicWidth - (paddingBetweenCharts * 2)) / 2.5;
	const trhChartWidth = chartWidth / 2;

	const legendWidth = chartWidth;
	const legendHeight = 20;

	const paddingAboveLegend = 25;
	const chartHeight = data.graphicHeight - (dropdownGroupHeight + paddingBetweenDropdownsAndCharts + legendHeight + paddingAboveLegend);
	const yAxisWidth = 45;
	const xAxisHeight = 25;

	const barSectionWidth = chartWidth - yAxisWidth;
	const barSectionHeight = chartHeight - xAxisHeight;

	const trhBarSectionWidth = (chartWidth - yAxisWidth) / 2;

	const currencyChart = chartsGroup.append('g')
		.attr('class', 'currencyChart')
		.attr('transform', `translate(${chartWidth + paddingBetweenCharts}, 0)`);

	const trhChart = chartsGroup.append('g')
		.attr('class', 'trhChart')
		.attr('transform', `translate(${(chartWidth * 2) + (paddingBetweenCharts * 2)}, 0)`);




	// SCALES AND GENERATORS FOR KWH CHART
	let baselineKwhVals = [],
	projectedKwhVals = [],
	measuredKwhVals = [];

	// const getYTickValues = groupedOrStacked => {
  //   let allKwhVals;
	// 	if(groupedOrStacked === 'grouped'){
	// 		arraysOfKwhVals = data.dataForDate.equipmentDataForDate.map(modObj => modObj.kwh.map(cat => cat.value));
	// 		allKwhVals = [].concat(...arraysOfKwhVals)
	// 	} else {
	// 		allKwhVals = data.dataForDate.categoryDataForDate.map(cat => cat.kwh);
	// 	}
	// 	const maxKwhVal = allKwhVals.reduce((accum, curr) => curr > accum ? curr : accum);
	// 	const maxYTick = maxKwhVal  + (0.1 * maxKwhVal);
	// 	const yTickInterval = maxYTick / 4;
	// 	const yTickValues = [0, yTickInterval, yTickInterval * 2, yTickInterval * 3, maxYTick];

	// 	return yTickValues;
	// }

	// let yTicks = getYTickValues(widget.activeKwhChart);
  // let maxYtick = yTicks[yTicks.length - 1];
  

  const getMaxYTick = groupedOrStacked => {
    let allKwhVals;
		if(groupedOrStacked === 'grouped'){
			arraysOfKwhVals = data.dataForDate.equipmentDataForDate.map(modObj => modObj.kwh.map(cat => cat.value));
			allKwhVals = [].concat(...arraysOfKwhVals)
		} else {
			allKwhVals = data.dataForDate.categoryDataForDate.map(cat => cat.kwh);
		}
		const maxKwhVal = allKwhVals.reduce((accum, curr) => curr > accum ? curr : accum);
		return maxKwhVal  + (0.1 * maxKwhVal);
	}

  


	const x0Scale = d3.scaleBand()
		.paddingOuter(.1)
		.paddingInner(.2)
    .domain(widget.activeKwhChart === 'grouped' ? types : categories.map(cat => cat.name))	//equipmentTypes or categories
		.rangeRound([0, barSectionWidth])
		
	const x1Scale = d3.scaleBand()
		// .padding(0.1)	// padding btwn grouped bars within same group
		.domain(categories.map(cat => cat.name))
    .rangeRound([0, x0Scale.bandwidth()]);

	const yScale = d3.scaleLinear()
		.range([barSectionHeight, 0])
		.domain([0, getMaxYTick(widget.activeKwhChart)])
		.nice()

	const xAxisGenerator = d3.axisBottom()
		.scale(x0Scale)
		.tickSizeOuter(0);
		

	const yAxisGenerator = d3.axisLeft()
		.scale(yScale)
		// .tickValues(yTicks)
		// .ticks(4)




  // KWH CHART //
  //Kwh Chart Transition Func:
  const transitionKwhChart = stackedOrGrouped => {

    // change background click handler
    widget.svg.select('.groupedClickHandlingRect')
      .on('click', stackedOrGrouped === 'grouped' ? kwhClickFunction : null)

    //x axis changes
    x0Scale.domain(widget.activeKwhChart === 'grouped' ? types : categories.map(cat => cat.name));	//equipmentTypes or categories
    x1Scale.rangeRound([0, x0Scale.bandwidth()]); // running to account for changes to x0Scale

    //y axis changes
    // yTicks = getYTickValues(widget.activeKwhChart);
    // maxYtick = yTicks[yTicks.length - 1];
    yScale.domain([0, getMaxYTick(widget.activeKwhChart)]).nice();
    // yAxisGenerator.tickValues(yTicks);

    //transition axes
    widget.svg.select('.xAxis')
      .transition()
        .duration(duration)
        .call(xAxisGenerator);

    widget.svg.select('.yAxis')
      .transition()
        .duration(duration)
        .call(yAxisGenerator);

    // transition bars
    widget.svg.selectAll('.equipmentGroups')
      .transition()
        .duration(duration)
        .attr('transform', d => `translate(${stackedOrGrouped === 'grouped' ? x0Scale(d.type) : 0},0)`)
    
    widget.svg.selectAll('.categoryRects')	// .data(d => d.kwh)
      .on('click', stackedOrGrouped === 'grouped' ? null : kwhClickFunction)
      .transition()
				.duration(duration - 500)
        .attr("x", d => stackedOrGrouped === 'grouped' ? x1Scale(d.category): x0Scale(d.category))
        .attr("y", d => yScale(stackedOrGrouped === 'grouped' ? d.value : d.accumulated))
        .attr("width", stackedOrGrouped === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
				.attr("height", d => barSectionHeight - yScale(d.value))   // run this to use changed yScale
				.attr('stroke', d => data[`${d.category}Color`])
				.transition()
					.attr('stroke', d => widget.activeKwhChart === 'grouped' ? 'none' : data[`${d.category}Color`])

		//tick styling
		widget.svg.selectAll('.tick text')
			.style('fill', data.tickTextColor)
			.style('font', data.tickFont)
  }

  //click handler for kwh chart transition
  const kwhClickFunction = () => {
    widget.activeKwhChart === 'stacked' ?	widget.activeKwhChart = 'grouped' :	widget.activeKwhChart = 'stacked';
    transitionKwhChart(widget.activeKwhChart)
  };


  // KWH CHART INITIALIZATION
  const kwhChart = chartsGroup.append('g')
    .attr('class', 'kwhChart')

  // chart group and background click handler
  kwhChart.append('rect')
    .attr('class', 'groupedClickHandlingRect')
    .attr('height', chartHeight)
    .attr('width', chartWidth)
    .attr('opacity', 0)
    .on('click', widget.activeKwhChart === 'grouped' ? kwhClickFunction : null)

  const kwhBarSection = kwhChart.append('g')
    .attr('class', 'kwhBarSection')
    .attr('transform', `translate(${yAxisWidth}, 0)`)


  // bars
  const equipmentGroups = kwhBarSection.selectAll('.equipmentGroups')
    .data(data.dataForDate.equipmentDataForDate)
    .enter().append("g")
      .attr('class', d => `equipmentGroups ${d.type}EquipmentGroup`)
      .attr('transform', d => `translate(${widget.activeKwhChart === 'grouped' ? x0Scale(d.type) : 0},0)`)
  
  equipmentGroups.selectAll('.categoryRects')
    .data(d => d.kwh)
    .enter().append("rect")
      .attr('class', d => `categoryRects ${d.category}CategoryRect ${d.category}Bar`)
      .attr("x", d => widget.activeKwhChart === 'grouped' ? x1Scale(d.category) : x0Scale(d.category))
      .attr("y", d => widget.activeKwhChart === 'grouped' ? yScale(d.value) : yScale(d.accumulated))
      .attr("width", widget.activeKwhChart === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
      .attr("height", d => barSectionHeight - yScale(d.value) )
			.attr("fill", d => data[`${d.category}Color`])
			.attr('stroke', d => widget.activeKwhChart === 'grouped' ? 'none' : data[`${d.category}Color`])
      .on('click', widget.activeKwhChart === 'grouped' ? null : kwhClickFunction);

			
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
	widget.svg.selectAll('.tick text')
		.style('fill', data.tickTextColor)
		.style('font', data.tickFont)




	// y axis units title
	kwhBarSection.append('text')
		.text('kWh')
		.attr('transform', 'rotate(-90)')
		.attr("text-anchor", "middle")
		.attr('dominant-baseline', 'hanging')
		.attr('fill', data.unitsColor)
		.style('font', data.unitsFont)










	// CURRENCY CHART //
	currencyChart.append('rect')	//TODO MAKE INVISIBLE CLICK HANDLING RECT OR DELETE
		.attr('height', chartHeight)
		.attr('width', chartWidth)
		.attr('fill', 'none')
		.attr('stroke', 'blue')




	// TRH CHART //
	trhChart.append('rect')	//TODO MAKE INVISIBLE CLICK HANDLING RECT OR DELETE
		.attr('height', chartHeight)
		.attr('width', trhChartWidth)
		.attr('fill', 'none')
		.attr('stroke', 'blue')



// LEGEND //
	const legendCategoryWidth = legendWidth / 4
	const paddingBetweenLegendCategories = legendCategoryWidth / 2
	const circleRadius = 6

	const legendGroup = graphicGroup.append('g')
		.attr('class', 'legend')
		.attr('transform', `translate(${(data.graphicWidth / 2) - (legendWidth / 2)}, ${data.graphicHeight - legendHeight})`)
		
	const legendCategories = legendGroup.selectAll('.legendCategories')
		.data(categories)
		.enter().append('g')
			.attr('class', d => `legend${d.displayName}Group legendCategories`)
			.attr('transform', (d, i) => `translate(${circleRadius + (i * (legendCategoryWidth + paddingBetweenLegendCategories))}, ${circleRadius})`)
			.on('mouseover', function (d) {
				widget.svg.selectAll(`.${d.name}LegendText`)
					.style('font-weight', 'bold')
			})
			.on('mouseout', function (d) {
				widget.svg.selectAll(`.${d.name}LegendText`)
					.style('font-weight', 'normal')
			})

	// legendGroup.append('rect')
	// 	.attr('width', legendWidth)
	// 	.attr('height', legendHeight)
	// 	.attr('fill', 'none')
	// 	.attr('stroke', 'yellow')

	// legendCategories.append('rect')
	// 	.attr('width', legendCategoryWidth)
	// 	.attr('height', legendHeight)
	// 	.attr('fill', 'none')
	// 	.attr('stroke', d => data[d.name + 'Color'])

	legendCategories.append('circle')
		.attr('r', circleRadius)
		.attr('fill', d => data[d.name + 'Color'])
		
	legendCategories.append('text')
		.attr('class', d => `legendText ${d.name}LegendText`)
		.style('font', data.legendFont)
		.attr('fill', data.legendTextColor)
		.attr('dominant-baseline', 'middle')
		.attr('x', circleRadius + (circleRadius / 2))
		.text(d => d.displayName)



}

renderWidget();