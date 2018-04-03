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
const categories = ['baseline', 'projected', 'measured'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const dropdownYearChanged = () => {
	widget.yearDropDownSelected = d3.event.target.value;
	widget.monthDropDownSelected = 'All';
	renderWidget();
};
const dropdownMonthChanged = () => {
	widget.monthDropDownSelected = d3.event.target.value;
	renderWidget();
};

const resetElements = elementsToReset => {
	const selectionForCheck = widget.svg.selectAll(elementsToReset)
			if (!selectionForCheck.empty()) selectionForCheck.remove();
};



// TODO FINISH FUNCTION: IS THIS AVERAGE OF ALL DATA FROM YR OR LAST VAL (accumulated val)?
	//if avg:
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
					value: 0
				},
				{
					category: 'projected',
					value: 0
				},
				{
					category: 'measured',
					value: 0
				}
			]
		},
		{
			type: 'PCPs',
			kwh: [
				{
					category: 'baseline',
					value: 0
				},
				{
					category: 'projected',
					value: 0
				},
				{
					category: 'measured',
					value: 0
				}
			]
		},
		{
			type: 'SCPs',
			kwh: [
				{
					category: 'baseline',
					value: 0
				},
				{
					category: 'projected',
					value: 0
				},
				{
					category: 'measured',
					value: 0
				}
			]
		},
		{
			type: 'CDPs',
			kwh: [
				{
					category: 'baseline',
					value: 0
				},
				{
					category: 'projected',
					value: 0
				},
				{
					category: 'measured',
					value: 0
				}
			]
		},
		{
			type: 'CTFs',
			kwh: [
				{
					category: 'baseline',
					value: 0
				},
				{
					category: 'projected',
					value: 0
				},
				{
					category: 'measured',
					value: 0
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
				categoryDataForDate[categoryIndex].kwh = monthlyDatum.total;
			}
		})
	})
	return {categoryDataForDate, equipmentDataForDate};
};
console.log(getDataForDate('All', 2018))

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
		value: 'rgb(39, 176, 71)',
		typeSpec: 'gx:Color'
	},
	{
		name: 'baselineColor',
		value: 'rgb(44, 139, 246)',
		typeSpec: 'gx:Color'
	},
	{
		name: 'projectedColor',
		value: 'rgb(246, 159, 44)',
		typeSpec: 'gx:Color'
	},
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
if (!widget.activeKwhChart) widget.activeKwhChart = 'grouped' || 'stacked';
if (!widget.kwhClicked) widget.kwhClicked = false;

  // FAKE DATA //
data.kwH_baselineData = kwH_baselineData;
data.kwH_projectedData = kwH_projectedData;
data.kwH_measuredData = kwH_measuredData;
data.utilityRate = 0.05;



	// CALCULATED DEFS //
	
		// calculate totals
const calculateTotals = data => data.forEach(datum => datum.total = datum.equipment.reduce((accum, curr) => accum + curr.value, 0));
calculateTotals(data.kwH_baselineData);
calculateTotals(data.kwH_projectedData);
calculateTotals(data.kwH_measuredData);


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
	const paddingLeftOfDropdown = 50;
	const dateDropdownWidth = 100;
	const dateDropdownStartHeight = 50;
	const paddingBetweenDropdowns = 20;
	const paddingAboveDropdowns = 25;

	const dropdownDiv = outerDiv.append('div')
		.attr('class', 'dropdownDiv')
		.style('margin', 0)

		//Year Dropdown
	dropdownDiv.append('h4')
		.attr('dominant-baseline', 'hanging')
		.style('left', paddingLeftOfDropdown + 'px')
		.text('YEAR')
		.style('position', 'absolute')
		.style('margin', 0)

	const yearSelect = dropdownDiv.append('select')
		.attr('height', dateDropdownStartHeight)
		.attr('width', dateDropdownWidth)
		.attr('class', 'yearSelect')
		.style('border-radius', '5px')
		.style('margin', 0)
		.style('border', '1px solid black')
		.style('position', 'absolute')
		.style('left', paddingLeftOfDropdown + 'px')
		.style('top', data.margin.top + paddingAboveDropdowns + 'px')
		.on('change', dropdownYearChanged)
		.selectAll('option')
			.data(data.availableYears).enter()
				.append('option')
					.property('selected', d => d === widget.yearDropDownSelected)
					.text(d => d);



	//Month Dropdown
	dropdownDiv.append('h4')
		.attr('dominant-baseline', 'hanging')
		.style('margin', 0)
		.style('position', 'absolute')
		.style('left', paddingLeftOfDropdown + dateDropdownWidth + paddingBetweenDropdowns + 'px')
		.text('MONTH');

	const monthSelect = dropdownDiv.append('select')
		.attr('height', dateDropdownStartHeight)
		.attr('width', dateDropdownWidth)
		.attr('class', 'monthSelect')
		.style('border-radius', '5px')
		.style('margin', 0)
		.style('border', '1px solid black')
		.style('position', 'absolute')
		.style('left', paddingLeftOfDropdown + dateDropdownWidth + paddingBetweenDropdowns + 'px')
		.style('top', data.margin.top + paddingAboveDropdowns + 'px')
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
	const dropdownGroup = graphicGroup.append('g')
		.attr('class', 'dropdownGroup')

	const paddingBetweenCharts = 20;

	const chartsGroup = graphicGroup.append('g')
		.attr('class', 'chartsGroup')
		.attr('transform', `translate(0, ${dropdownGroupHeight})`);

	const chartWidth = (data.graphicWidth - (paddingBetweenCharts * 2)) / 3;
	const chartHeight = data.graphicHeight - (dropdownGroupHeight);
	const yAxisWidth = 45;
	const xAxisHeight = 25;

	const barSectionWidth = chartWidth - yAxisWidth;
	const barSectionHeight = chartHeight - xAxisHeight;

	const kwhChart = chartsGroup.append('g')
		.attr('class', 'kwhChart')


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

	const getYTickValues = groupedOrStacked => {
		let allKwhVals;
		if(groupedOrStacked === 'grouped'){
			const dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected).equipmentDataForDate;
			arraysOfKwhVals = dataForDate.map(modObj => modObj.kwh.map(cat => cat.value));
			allKwhVals = [].concat(...arraysOfKwhVals)
		} else {
			const dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected).categoryDataForDate;
			allKwhVals = dataForDate.map(cat => cat.kwh);
		}
		const maxKwhVal = allKwhVals.reduce((accum, curr) => curr > accum ? curr : accum);
		const maxGroupedYTick = maxKwhVal  + (0.1 * maxKwhVal);
		const yTickInterval = maxGroupedYTick / 4;
		const yTickValues = [0, yTickInterval, yTickInterval * 2, yTickInterval * 3, maxGroupedYTick];

		return yTickValues;
	}

	let yTicks = getYTickValues(widget.activeKwhChart);
	let maxYtick = yTicks[yTicks.length - 1];

	var x0Scale = d3.scaleBand()
		.paddingInner(.4)
		.domain(widget.activeKwhChart === 'grouped' ? types : categories)	//equipmentTypes or categories
		.rangeRound([0, barSectionWidth])
		

	var x1Scale = d3.scaleBand()
		.padding(0.1)
		.domain(categories)
		.rangeRound([0, x0Scale.bandwidth()]);

	var yScale = d3.scaleLinear()
		.range([barSectionHeight, 0])
		.domain([0, maxYtick]);
		// .nice()

	var xAxisGenerator = d3.axisBottom()
		.scale(x0Scale)
		.tickSizeOuter(0);
		

	var yAxisGenerator = d3.axisLeft()
		.scale(yScale)
		.tickValues(yTicks)
		// .ticks(5)

	var stackGenerator = d3.stack()
		.keys(categories)




	// KWH CHART //


const changeKwhChart = stackedOrGrouped => {

	const kwhClickFunction = () => {
		widget.activeKwhChart === 'stacked' ?	widget.activeKwhChart = 'grouped' :	widget.activeKwhChart = 'stacked';
		widget.kwhClicked = true;
		changeKwhChart(widget.activeKwhChart)// TODO: REMOVE AFTER TESTING
		// renderKwhChart(widget.activeKwhChart); //TODO: PUT BACK AFTER TESTING
	};

	const dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected);

	// overall
	widget.svg.select('.groupedClickHandlingRect')
		.on('click', stackedOrGrouped === 'grouped' ? kwhClickFunction : null)


	//x axis changes
	x0Scale.domain(widget.activeKwhChart === 'grouped' ? types : categories);	//equipmentTypes or categories
	x1Scale.rangeRound([0, x0Scale.bandwidth()]);

	//y axis changes
	yTicks = getYTickValues(widget.activeKwhChart);
	maxYtick = yTicks[yTicks.length - 1];
	yScale.domain([0, maxYtick]);
	yAxisGenerator.tickValues(yTicks);

	//transition axes
	widget.svg.select('.xAxis')
		.transition()
		.duration(duration)
		.call(xAxisGenerator);

	widget.svg.select('.yAxis')
		.transition()
		.duration(duration)
		.call(yAxisGenerator);



	// bars
	let categoryRects;
	if (stackedOrGrouped === 'grouped') {
		renderKwhChart(stackedOrGrouped)
		//TODO: CHANGED STACKED TO GROUPED

	} else {
		//TODO: CHANGED GROUPED TO STACKED
		const arrayForStackGenerator = dataForDate.equipmentDataForDate.map(mod => {return {module: mod.type, baseline: mod.kwh[0].value, projected: mod.kwh[1].value, measured: mod.kwh[2].value} })
		const stackedSeries = stackGenerator(arrayForStackGenerator);
		console.log(stackedSeries)

		widget.svg.selectAll('.equipmentGroups')
		.transition()
			.duration(duration)
			.attr('transform', d => `translate(0,0)`)
		
		widget.svg.selectAll('.categoryRects')	// .data(d => d.kwh)
			.transition()
			.duration(duration)
			  .attr("x", d => x0Scale(d.category))
        .attr("y", function (d, i) {
          if (this.parentNode.previousElementSibling) {
            if (d.category === 'baseline'){
              console.log('myVal: ', d.value, 'last val: ', 0, 'myCategory: ', d.category)
              return barSectionHeight - yScale(d.value);
            }
            if (d.category === 'projected') {
              console.log('myVal: ', d.value, 'last val: ', this.parentNode.__data__.kwh[0].value, 'myCategory: ', d.category)
              return barSectionHeight - yScale(d.value - this.parentNode.__data__.kwh[0].value)
            }
            if (d.category === 'measured') {
              console.log('myVal: ', d.value, 'last val: ', this.parentNode.__data__.kwh[1].value, 'myCategory: ', d.category)
              return barSectionHeight - yScale(d.value - this.parentNode.__data__.kwh[1].value)
            };
          } else {
            return barSectionHeight - yScale(d.value);
          }
        })
				.attr("width", x0Scale.bandwidth())
				.attr("height", function (d, i) {
          console.log('Am I higher than highest y tick value? ', d.value > maxYtick, 'my value is: ', d.value, 'highest ytick: ', maxYtick)
          if (d.category === 'baseline') return yScale(d.value);
          if (d.category === 'projected') return yScale(d.value - this.parentNode.__data__.kwh[0].value);
          if (d.category === 'measured') return yScale(d.value - this.parentNode.__data__.kwh[1].value);
        })
        .attr('fill', function (d, i) {
          return {CHs: 'yellow', PCPs: 'black', SCPs: 'purple', CDPs: 'gray', CTFs: 'red'}[this.parentNode.__data__.type]
        })
        .style('opacity', 0.4)
	}



	//reset
	widget.kwhClicked = false;
}











	const renderKwhChart = stackedOrGrouped => {
		resetElements('.kwhBarSection');
		resetElements('.groupedClickHandlingRect');


		const kwhClickFunction = () => {
			widget.activeKwhChart === 'stacked' ? 	widget.activeKwhChart = 'grouped' : 	widget.activeKwhChart = 'stacked';
			widget.kwhClicked = true;
			changeKwhChart(widget.activeKwhChart)// TODO: REMOVE AFTER TESTING
			// renderKwhChart(widget.activeKwhChart); //TODO: PUT BACK AFTER TESTING
		};

		const dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected);

		// overall appends
		kwhChart.append('rect')
			.attr('class', 'groupedClickHandlingRect')
			.attr('height', chartHeight)
			.attr('width', chartWidth)
			.attr('opacity', 0)
			.on('click', stackedOrGrouped === 'grouped' ? kwhClickFunction : null)

		const kwhBarSection = kwhChart.append('g')
			.attr('class', 'kwhBarSection')
			.attr('transform', `translate(${yAxisWidth}, 0)`)

	
		//x axis
		const appendedXAxis = kwhBarSection.append('g')
			.attr("class", "axis xAxis")
			.attr("transform", `translate(0, ${barSectionHeight})`)
			.call(xAxisGenerator);

		x0Scale.domain(widget.activeKwhChart === 'grouped' ? types : categories);	//equipmentTypes or categories
		x1Scale.rangeRound([0, x0Scale.bandwidth()]);

		//y axis
		yTicks = getYTickValues(widget.activeKwhChart);
		maxYtick = yTicks[yTicks.length - 1];
		const appendedYAxis = kwhBarSection.append("g")
			.attr("class", "axis yAxis")
			.call(yAxisGenerator)

		yScale.domain([0, maxYtick]);
		yAxisGenerator.tickValues(yTicks);

		//transition axes
		appendedXAxis.transition()
			.duration(duration)
			.call(xAxisGenerator);

		appendedYAxis.transition()
			.duration(duration)
			.call(yAxisGenerator);



		// bars
		let categoryRects;
		if (stackedOrGrouped === 'grouped') {


			const equipmentGroups = kwhBarSection.selectAll('.equipmentGroups')
				.data(dataForDate.equipmentDataForDate)
				.enter().append("g")
					.attr('class', d => `equipmentGroups ${d.type}EquipmentGroup`)
					.attr('transform', d => `translate(${x0Scale(d.type)},0)`)
				
			categoryRects = equipmentGroups.selectAll('categoryRects')
				.data(d => d.kwh)
				.enter().append("rect")
					.attr('class', d => `categoryRects ${d.category}CategoryRect`)
					.attr("x", d => x1Scale(d.category) )
					.attr("y", d => yScale(d.value) )
					.attr("width", x1Scale.bandwidth())
					.attr("height", d => barSectionHeight - yScale(d.value) )
					.attr("fill", d => data[`${d.category}Color`]);

		} else {

			if (widget.kwhClicked){
				kwhBarSection.selectAll('.categoryRects')
					.data(dataForDate.categoryDataForDate)
					.enter().append("rect")
						.attr('class', d => `categoryRects ${d.category}CategoryRect`)
						.attr("x", d => x0Scale(d.category) )
						.attr("y", d => yScale(d.kwh) )
						.attr("width", x0Scale.bandwidth())
						.attr("height", d => barSectionHeight - yScale(d.kwh) )
						.attr("fill", d => data[`${d.category}Color`])
						.on('click', kwhClickFunction)
						.transition()

			}

			if (!widget.kwhClicked) {
				kwhBarSection.selectAll('.categoryRects')
					.data(dataForDate.categoryDataForDate)
					.enter().append("rect")
						.attr('class', d => `categoryRects ${d.category}CategoryRect`)
						.attr("x", d => x0Scale(d.category) )
						.attr("y", d => yScale(d.kwh) )
						.attr("width", x0Scale.bandwidth())
						.attr("height", d => barSectionHeight - yScale(d.kwh) )
						.attr("fill", d => data[`${d.category}Color`])
						.on('click', kwhClickFunction)
			}
		}


		//reset
		widget.kwhClicked = false;
	}

	renderKwhChart(widget.activeKwhChart)



	// CURRENCY CHART //
	currencyChart.append('rect')	//TODO MAKE INVISIBLE CLICK HANDLING RECT OR DELETE
		.attr('height', chartHeight)
		.attr('width', chartWidth)
		.attr('fill', 'none')
		.attr('stroke', 'blue')




	// TRH CHART //
	trhChart.append('rect')	//TODO MAKE INVISIBLE CLICK HANDLING RECT OR DELETE
		.attr('height', chartHeight)
		.attr('width', chartWidth)
		.attr('fill', 'none')
		.attr('stroke', 'blue')



}

renderWidget();