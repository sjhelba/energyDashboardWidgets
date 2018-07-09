define(['bajaux/Widget', 'bajaux/mixin/subscriberMixIn', 'nmodule/COREx/rc/d3/d3.min'], function (Widget, subscriberMixIn, d3) {
	"use strict";

	////////////////////////////////////////////////////////////////
	// Define Widget Constructor & Add Exposed Properties
	////////////////////////////////////////////////////////////////
	const areScalarArrsSame = (arr1, arr2) => arr1.length === arr2.length && arr1.every((el, idx) => el === arr2[idx]);
	const arePrimitiveValsInObjsSame = (obj1, obj2) => !Object.keys(obj1).some(key => (obj1[key] === null || (typeof obj1[key] !== 'object' && typeof obj1[key] !== 'function')) && obj1[key] !== obj2[key])
	const needToRedrawWidget = (widget, newData) => {
		const lastData = widget.data;
		// check primitives for equivalence
		if (!arePrimitiveValsInObjsSame(lastData, newData)) return true;

		//check scalar arr for equivalence
		if (lastData.last12Dates.length !== newData.last12Dates.length || !areScalarArrsSame(lastData.last12Dates, newData.last12Dates)) return true;

		// check arrs of objs for equivalence
		if (lastData.baselineDataWMissingData.length !== newData.baselineDataWMissingData.length) return true;
		const isBaselineDiscrepency = lastData.baselineDataWMissingData.some((obj, objIndex) => !arePrimitiveValsInObjsSame(obj, newData.baselineDataWMissingData[objIndex]));
		if (isBaselineDiscrepency) return true;

		if (lastData.projectedDataWMissingData.length !== newData.projectedDataWMissingData.length) return true;
		const isProjectedDiscrepency = lastData.projectedDataWMissingData.some((obj, objIndex) => !arePrimitiveValsInObjsSame(obj, newData.projectedDataWMissingData[objIndex]));
		if (isProjectedDiscrepency) return true;

		if (lastData.measuredDataWMissingData.length !== newData.measuredDataWMissingData.length) return true;
		const isMeasuredDiscrepency = lastData.measuredDataWMissingData.some((obj, objIndex) => !arePrimitiveValsInObjsSame(obj, newData.measuredDataWMissingData[objIndex]));
		if (isMeasuredDiscrepency) return true;

		//return false if nothing prompted true
		return false;
	};

	// function that makes '3 digit month'-'4 digit year' into JS date
	const parseDate = d3.timeParse('%b-%Y');
	const getTextHeight = font => {
		let num = '';
		const indexOfLastDigit = font.indexOf('pt') - 1;
		for (let i = 0; i <= indexOfLastDigit; i++) {
			if (!isNaN(font[i]) || font[i] === '.') num += font[i];
		}
		num = +num;
		return num * 1.33333333333;
	};
	const getJSDateFromTimestamp = d3.timeParse('%d-%b-%y %I:%M:%S.%L %p UTC%Z');
	const getTextWidth = (text, font) => {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		context.font = font;
		const width = context.measureText(text).width;
		d3.select(canvas).remove()
		return width;
	};


	var CxYearlyEfficiencyProfile = function () {
		var that = this;
		Widget.apply(this, arguments);

		that.properties().addAll([
			{
				name: 'measuredColor',
				value: 'rgb(105,202,210)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'measuredStrokeColor',
				value: 'rgb(105,202,210)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'measuredDataPointStrokeColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'measuredDataPointFillColor',
				value: 'rgb(105,202,210)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'baselineColor',
				value: 'rgb(66,88,103)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'baselineStrokeColor',
				value: 'rgb(66,88,103)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'baselineDataPointStrokeColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'baselineDataPointFillColor',
				value: 'rgb(66,88,103)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'projectedColor',
				value: 'rgb(252, 181, 80)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'projectedStrokeColor',
				value: 'rgb(252, 181, 80)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'projectedDataPointStrokeColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'projectedDataPointFillColor',
				value: 'rgb(252, 181, 80)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'gridColor',
				value: 'rgb(128,128,128)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'backgroundColor',
				value: 'rgb(245,245,245)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'tooltipFill',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'dataPointRadius',
				value: 6
			},
			{
				name: 'dataPointStrokeWidth',
				value: 2
			},
			{
				name: 'pathStrokeWidth',
				value: 4
			},
			{
				name: 'unitsColor',
				value: 'rgb(64,64,64)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'unitsFont',
				value: 'bold 10pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'xAxisFontColor',
				value: 'black',
				typeSpec: 'gx:Color'
			},
			{
				name: 'yAxisFontColor',
				value: 'black',
				typeSpec: 'gx:Color'
			},
			{
				name: 'legendFontColor',
				value: 'rgb(64,64,64)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'xAxisFont',
				value: '8pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'yAxisFont',
				value: '10pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'axesStrokeColor',
				value: 'rgb(64,64,64)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'legendFont',
				value: '10pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'tooltipFont',
				value: '10pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'tooltipPadding',
				value: 15
			},
			{
				name: 'legendPadding',
				value: 5
			},
			{
				name: 'tooltipTextColor',
				value: 'black',
				typeSpec: 'gx:Color'
			},
			{
				name: 'legendCircleSize',
				value: 11
			},
			{
				name: 'yAxisTitlePadding',
				value: 5
			},
			{
				name: 'tooltipRectWidth',
				value: 113
			},
			{
				name: 'tooltipRectHeight',
				value: 71
			}
		]);



		subscriberMixIn(that);
	};

	CxYearlyEfficiencyProfile.prototype = Object.create(Widget.prototype);
	CxYearlyEfficiencyProfile.prototype.constructor = CxYearlyEfficiencyProfile;


	////////////////////////////////////////////////////////////////
	// /* SETUP DEFINITIONS */
	////////////////////////////////////////////////////////////////


	const setupDefinitions = widget => {
		// FROM USER // 
		const data = widget.properties().toValueMap();	//obj with all exposed properties as key/value pairs

		// FROM JQ //
		const jq = widget.jq();
		data.graphicWidth = jq.width() || 625;
		data.graphicHeight = jq.height() || 300;




		// GATHER AND FORMAT MONTHLY DATA //
		data.baselineData = [];
		data.projectedData = [];
		data.measuredData = [];

		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const today = new Date();
		const currentFullYear = today.getFullYear();
		const currentMonthIndex = today.getMonth();

		const getDatesOfLast12Months = (monthIndex, currentYear) => {
			const datesArray = [];
			const yrPerMonthObj = {};
			let pointer = monthIndex;
			for (let count = 12; count > 0; count--) {
				if (pointer >= 0) {
					data.baselineData.unshift({ month: months[pointer], value: 0, count: 0, total: 0 });
					data.projectedData.unshift({ month: months[pointer], value: 0, count: 0, total: 0 });
					data.measuredData.unshift({ month: months[pointer], year: currentYear, value: 0, count: 0, total: 0 });
					datesArray.unshift(months[pointer] + '-' + currentYear);
					yrPerMonthObj[months[pointer]] = currentYear;
				} else {
					data.baselineData.unshift({ month: months[months.length + pointer], value: 0, count: 0, total: 0 });
					data.projectedData.unshift({ month: months[months.length + pointer], value: 0, count: 0, total: 0 });
					data.measuredData.unshift({ month: months[months.length + pointer], year: currentYear - 1, value: 0, count: 0, total: 0 });
					datesArray.unshift(months[months.length + pointer] + '-' + (currentYear - 1));
					yrPerMonthObj[months[months.length + pointer]] = currentYear - 1;
				}
				pointer--;
			}
			return [datesArray, yrPerMonthObj];
		};


		const last12 = getDatesOfLast12Months(currentMonthIndex, currentFullYear);  // formatted [['Dec-2017', 'Jan-2018', ...etc], {Dec: 2017, Jan: 2018}]
		data.last12Dates = last12[0];
		data.yrPerMonth = last12[1];

		data.last12DatesSeperated = data.last12Dates.map(date => {  // formatted as [ {monthIndex: 11, year: 2017}, {monthIndex: 0, year: 2018}, ...etc ]
			const splitDate = date.split('-');
			return { monthIndex: months.indexOf(splitDate[0]), year: +splitDate[1] };
		});

		// DEFINITIONS CALCULATED FROM USER AND JQ PROPERTIES //
		data.legendHeight = 0.166 * data.graphicHeight || 50;
		data.legendWidth = 0.128 * data.graphicWidth || 80;

		data.margin = { left: 5, right: 0, top: 5 + data.legendHeight, bottom: 0 };  //will be used in terms of pixels (convention to call margin)
		data.tickPadding = 5;
		data.tickSize = 10;
		data.yAxisWidth = data.tickPadding + data.tickSize + getTextWidth(88.88, data.yAxisFont);
		data.chartHeight = 0.66 * data.graphicHeight || 200;
		data.chartWidth = data.graphicWidth - (data.yAxisWidth + (getTextWidth(data.last12Dates[11], data.xAxisFont) / 1.5));



		// GET HISTORY DATA //
		return widget.resolve(`history:^System_MsEffHm`)
			.then(measuredTable => {
				// get facets off of 'measured' table
				const facets = measuredTable.getCol('value').getFacets();
				data.unitsLabel = facets.get('units').toString() || 'Measured Data Units';
				data.precision = facets.get('precision');
				//get data off of table for all but this month
				return measuredTable.cursor({
					limit: 700000,  // default is 10
					each: function (row, idx) {
						const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
						const rowYear = timestamp.getFullYear();
						const rowMonthIndex = timestamp.getMonth();
						const rowValue = row.get('value');

						data.last12DatesSeperated.slice(0, 11).forEach((date, index) => {
							if (rowYear === date.year && rowMonthIndex === date.monthIndex) {
								data.measuredData[index].count++;
								data.measuredData[index].total += rowValue;
							}
						});
					}
				});
			})
			.then(() => widget.resolve(`history:^System_MsEffCm`))
			.then(measuredTable => {
				let lastRowValue = 0;
				//get data off of current month table
				return measuredTable.cursor({
					limit: 700000,  // default is 10
					each: function (row, idx) {
						lastRowValue = row.get('value');
					},
					after: function () {
						data.measuredData[11].count++;
						data.measuredData[11].total += lastRowValue;
					}
				});
			})
			.then(() => widget.resolve(`history:^System_BlEffHm`))
			.then(baselineTrendTable => {
				return baselineTrendTable.cursor({
					limit: 700000,  // default is 10
					each: function (row, idx) {
						const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
						const rowMonthIndex = timestamp.getMonth();
						const rowValue = row.get('value');

						data.last12DatesSeperated.forEach((date, index) => {
							if (rowMonthIndex === date.monthIndex) {
								data.baselineData[index].count++;
								data.baselineData[index].total += rowValue;
							}
						});
					}
				});
			})
			.then(() => widget.resolve(`history:^System_PrEffHm`))
			.then(projectedTrendTable => {
				return projectedTrendTable.cursor({
					limit: 700000,  // default is 10
					each: function (row, idx) {
						const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
						const rowMonthIndex = timestamp.getMonth();
						const rowValue = row.get('value');

						data.last12DatesSeperated.forEach((date, index) => {
							if (rowMonthIndex === date.monthIndex) {
								data.projectedData[index].count++;
								data.projectedData[index].total += rowValue;
							}
						});
					}
				});
			})
			.then(() => {   // UTILIZE ACCUMULATED DATA AND RETURN DATA OBJECT TO PASS TO RENDER FUNC //
				data.last12DatesSeperated.forEach((date, index) => {
					data.projectedData[index].value = data.projectedData[index].total / data.projectedData[index].count || null;
					data.baselineData[index].value = data.baselineData[index].total / data.baselineData[index].count || null;
					data.measuredData[index].value = data.measuredData[index].total / data.measuredData[index].count || (index > 0 ? data.measuredData[index - 1].value : null);
				});

				// used for determining hovering rect width and tooltip data
				data.measuredDataWMissingData = data.measuredData.slice(0);
				data.baselineDataWMissingData = data.baselineData.slice(0)
				data.projectedDataWMissingData = data.projectedData.slice(0)


				data.baselineIndicesRemoved = 0;
				data.projectedIndicesRemoved = 0;
				data.measuredIndicesRemoved = 0;

				//remove leading missing data from data
				while (data.baselineData[0] && data.baselineData[0].value === null) {
					data.baselineData = data.baselineData.slice(1);
					data.baselineIndicesRemoved++
				}

				while (data.projectedData[0] && data.projectedData[0].value === null) {
					data.projectedData = data.projectedData.slice(1);
					data.projectedIndicesRemoved++
				}

				while (data.measuredData[0] && data.measuredData[0].value === null) {
					data.measuredData = data.measuredData.slice(1);
					data.measuredIndicesRemoved++
				}
				const changeNullsToZeroes = datum => { if (datum.value === null) datum.value = 0 };
				data.baselineData.forEach(changeNullsToZeroes);
				data.projectedData.forEach(changeNullsToZeroes);
				data.measuredData.forEach(changeNullsToZeroes);

				data.measuredValues = data.measuredData.map(data => data.value);
				data.baselineValues = data.baselineData.map(data => data.value);
				data.projectedValues = data.projectedData.map(data => data.value);

				const allValues = data.baselineValues.concat(data.measuredValues, data.projectedValues);
				data.range = d3.extent(allValues);

				data.highestYtick = data.range[1] + 0.2;
				data.lowestYtick = data.range[0] - 0.2;
				data.yTickInterval = (data.highestYtick - data.lowestYtick) / 4;
				data.yTickValues = [data.lowestYtick, (data.yTickInterval) + data.lowestYtick, (data.yTickInterval * 2) + data.lowestYtick, (data.yTickInterval * 3) + data.lowestYtick, data.highestYtick];

				data.enterData = [
					{ category: 'baseline', displayName: 'Baseline', color: data.baselineColor, strokeColor: data.baselineStrokeColor, dataPointStrokeColor: data.baselineDataPointStrokeColor, dataPointFillColor: data.baselineDataPointFillColor, data: data.baselineData },
					{ category: 'projected', displayName: 'Projected', color: data.projectedColor, strokeColor: data.projectedStrokeColor, dataPointStrokeColor: data.projectedDataPointStrokeColor, dataPointFillColor: data.projectedDataPointFillColor, data: data.projectedData },
					{ category: 'measured', displayName: 'Measured', color: data.measuredColor, strokeColor: data.measuredStrokeColor, dataPointStrokeColor: data.measuredDataPointStrokeColor, dataPointFillColor: data.measuredDataPointFillColor, data: data.measuredData }
				];


				// Click To Stick Widget Data
				if (!widget.pinned) widget.pinned = 'none';



				// if '/' in unit's name, format xAxisUnitsLabel to have spaces around '/' and unitsLabel (for tooltip) not to
				let indexOfSlash = data.unitsLabel.indexOf('/');
				data.xAxisUnitsLabel = data.unitsLabel;

				if (indexOfSlash > 0) {
					if (data.unitsLabel[indexOfSlash + 1] === ' ') data.unitsLabel.splice(indexOfSlash + 1, 1);
					if (data.unitsLabel[indexOfSlash - 1] === ' ') data.unitsLabel.splice(indexOfSlash - 1, 1);
					indexOfSlash = data.unitsLabel.indexOf('/');
					data.xAxisUnitsLabel = data.unitsLabel;
					if (data.unitsLabel[indexOfSlash + 1] !== ' ') data.xAxisUnitsLabel = data.unitsLabel.slice(0, indexOfSlash + 1) + ' ' + data.unitsLabel.slice(indexOfSlash + 1);
					if (data.unitsLabel[indexOfSlash - 1] !== ' ') data.xAxisUnitsLabel = data.xAxisUnitsLabel.slice(0, indexOfSlash) + ' ' + data.xAxisUnitsLabel.slice(indexOfSlash);
				}


				return data;
			})
			.catch(err => console.error('Error (ord info promise rejected): ' + err));
	};




	////////////////////////////////////////////////////////////////
	// Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
	////////////////////////////////////////////////////////////////

	const renderWidget = (widget, data) => {
		/* RENDER INITIALIZATION */

		const svg = widget.svg
			.attr('width', data.graphicWidth)
			.attr('height', data.graphicHeight);

		d3.select(svg.node().parentNode)
			.style('background-color', data.backgroundColor)
			.on('click', resetPins);


		// delete leftover elements from versions previously rendered
		if (!svg.empty()) svg.selectAll('*').remove();



		const chartGroup = svg.append('g').attr('class', 'chartGroup').attr('transform', `translate(${data.margin.left + data.yAxisWidth}, ${data.margin.top})`);



		/************************************************* ADD ALL SVG ELEMENTS HERE **********************************************************/
		/* SCALES AND GENERATORS */
		const yScale = d3.scaleLinear()  // scaling function
			.domain([data.lowestYtick, data.highestYtick]) //can be whatever you want the axis to cover
			.range([data.chartHeight, 0]);

		const xScale = d3.scaleTime()  // scaling function
			.domain([parseDate(data.last12Dates[0]), parseDate(data.last12Dates[11])])  // [min, max] data Month-Year's as JS dates
			.range([0, data.chartWidth]);

		const yAxisGenerator = d3.axisLeft(yScale)  // axis generator (axis labels can be left, right, top, bottom in relation to line).
			.tickValues(data.yTickValues)  //Adding 'ticks' gives guidance to D3 for apprx number of ticks you want. It will generate a similar number of ticks that typically makes sense to humans (e.g. 5s or 10s). You can override this and tell it the exact number you want with a setting called tick values
			.tickPadding(data.tickPadding)  // on axisLeft, moves labels further from ticks
			.tickSize(data.tickSize) //plenty more tick settings out there
			.tickFormat(d => d3.format(`,.${data.precision}f`)(d));

		const xAxisGenerator = d3.axisBottom(xScale) //axis generator
			.tickFormat(d3.timeFormat('%b-%y'));

		const topBorderPathGenerator = d3.line()
			.x(d => xScale(parseDate(d.month + '-' + data.yrPerMonth[d.month])))
			.y(d => yScale(d.value))
			.curve(d3.curveCardinal);




		/* PATHS */
		// Groups for Category Paths
		const categoryGroups = chartGroup.selectAll('path')
			.data(data.enterData)
			.enter().append('g').attr('class', d => d.category);


		// Top Border For Paths
		categoryGroups.append('path')
			.attr('d', d => topBorderPathGenerator(d.data))
			.attr('class', d => d.category + ' path')
			.attr('stroke', d => d.strokeColor)
			.attr('stroke-width', data.pathStrokeWidth)
			.attr('opacity', d => widget.active && widget.active[d.category] || !widget.active ? 0.92 : 0)
			.attr('fill', 'none');


		// grid lines
		chartGroup.selectAll('.grid')
			.data(data.yTickValues)
			.enter().append('line')
			.attr('class', 'grid')
			.attr('x1', 0)
			.attr('x2', data.chartWidth)
			.attr('y1', d => yScale(d))
			.attr('y2', d => yScale(d))
			.attr('stroke', data.gridColor)
			.attr('stroke-width', 0.5)



		/* TOOLTIPS */
		// (note event listeners that define many tooltip properties are in datapoints section)
		// const leftPaddingOfTooltip = data.yAxisWidth + (data.chartWidth * 0.06);
		const tooltipGroup = svg.append('g')
			.attr('transform', `translate(${data.yAxisWidth + data.yAxisTitlePadding + getTextHeight(data.unitsFont) + 20},${(data.legendHeight / 2)})`)
			.attr('pointer-events', 'none');
		const tooltipRect = tooltipGroup.append('rect')
			.attr('display', 'none')
			.style('position', 'absolute')
			.attr('fill', data.tooltipFill)
			.attr('x', -10)
			.attr('y', -5)
			.attr('rx', 5)
			.attr('fill-opacity', '0.9')
			.attr('width', data.tooltipRectWidth)
			.attr('height', data.tooltipRectHeight);

		// tooltips text
		const monthText = tooltipGroup.append('text')
			.attr('id', 'monthText')
			.attr('y', -2)
			.attr('x', 0)
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.style('font-weight', 'bold');

		const categoryTextGroups = tooltipGroup.selectAll('.value')
			.data(data.enterData)
			.enter().append('g')
			.attr('class', 'value')
			.attr('id', d => `${d.category}TextGroup`)

		categoryTextGroups.append('text')
			.attr('class', 'typeText')
			.attr('fill', d => d.color)
			.attr('x', 0)
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.style('font-weight', 'bold');


		categoryTextGroups.append('text')
			.attr('class', 'valueText')
			.attr('fill', data.tooltipTextColor)
			.attr('x', getTextWidth('M:', data.tooltipFont) + 5)
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont);



		const baselineTextGroup = svg.select('#baselineTextGroup');
		const projectedTextGroup = svg.select('#projectedTextGroup');
		const measuredTextGroup = svg.select('#measuredTextGroup');



		/* AXES */
		const yAxis = chartGroup.append('g')
			.attr('class', 'axisY')
			.call(yAxisGenerator)

		yAxis.selectAll('text')
			.style('fill', data.yAxisFontColor)
			.style('font', data.yAxisFont);

		yAxis.selectAll('path')
			.attr('stroke', data.axesStrokeColor);
		yAxis.selectAll('line')
			.attr('stroke', data.axesStrokeColor);

		const xAxis = chartGroup.append('g')
			.attr('class', 'axisX')
			.attr('transform', `translate(0,${data.chartHeight})`)
			.call(xAxisGenerator)

		xAxis.selectAll('text')
			.attr('text-anchor', 'end')
			.attr('transform', 'rotate(-25)')
			.style('fill', data.yAxisFontColor)
			.style('font', data.yAxisFont);

		xAxis.selectAll('path')
			.attr('stroke', data.axesStrokeColor)

		xAxis.selectAll('line')
			.attr('stroke', data.axesStrokeColor)


		chartGroup.append('text')
			.attr("transform", "rotate(-90)")
			.attr('x', 0)
			.attr('y', data.yAxisTitlePadding)
			.attr("text-anchor", "middle")
			.attr('dominant-baseline', 'hanging')
			.style('font', data.unitsFont)
			.attr('fill', data.unitsColor)
			.text(data.xAxisUnitsLabel);







		/* DATAPOINTS */
		// groups of datapoints
		const dataPointsGroups = chartGroup.selectAll('circle')
			.data(data.enterData)
			.enter().append('g')
			.attr('class', d => `${d.category} dataPointGroup`)
			.attr('opacity', d => widget.active && widget.active[d.category] || !widget.active ? 1 : 0);

		// datapoints
		dataPointsGroups.selectAll('.circle')
			.data(d => d.data) //get data arrays within each 'enterData' array element
			.enter().append('circle')
			.attr('class', (d, i, nodes) => `${nodes[i].parentNode.__data__.category}Circle ${d.month} circle`)
			.attr('fill', (d, i, nodes) => nodes[i].parentNode.__data__.dataPointFillColor)
			.attr('stroke', (d, i, nodes) => nodes[i].parentNode.__data__.dataPointStrokeColor)
			.attr('stroke-width', data.dataPointStrokeWidth)
			.attr('cx', d => xScale(parseDate(d.month + '-' + data.yrPerMonth[d.month])))
			.attr('cy', d => yScale(d.value))
			.attr('r', data.dataPointRadius);

		// rectangles for each month with event listeners to toggle TOOLTIPS and to toggle datapoints' highlighting
		const monthRectWidth = xScale(parseDate(data.measuredDataWMissingData[1].month + '-' + data.measuredDataWMissingData[1].year)) - xScale(parseDate(data.measuredDataWMissingData[0].month + '-' + data.measuredDataWMissingData[0].year));
		chartGroup.selectAll('.monthRect')
			.data(data.measuredDataWMissingData)
			.enter().append('rect')
			.attr('class', d => `monthRect ${d.month}Rect`)
			.attr('height', data.chartHeight)
			.attr('width', monthRectWidth)
			.attr('x', d => xScale(parseDate(d.month + '-' + data.yrPerMonth[d.month])) - (monthRectWidth / 2))
			.attr('y', 20)      // 20 rather than 0 so as to include the x axis tick values
			.style('opacity', '0')
			.on('mouseover', attemptOpenTooltip)
			.on('mouseout', attemptCloseTooltip)
			.on('click', pinTooltip);









		/* LEGEND */
		const legend = chartGroup.append('g')
			.attr('class', 'legend')
			.attr('transform', `translate(${0, data.chartWidth - data.legendWidth})`);

		// create groups for each category with click listeners to toggle hide and hover listeners to toggle bold text
		const legendCategories = legend.selectAll('g')
			.data(data.enterData)
			.enter().append('g')
			.attr('class', d => `${d.category}Legend category`)
			.attr('transform', (d, i) => `translate(5, ${-data.legendHeight + (data.legendCircleSize * i) + (data.legendPadding * (i + 1))})`)
			.on('click', d => {
				if (!widget.active) widget.active = { baseline: true, projected: true, measured: true };
				const opacity = widget.active[d.category] ? { path: 0, dataPoint: 0 } : { path: 0.92, dataPoint: 1 };
				const legendLineDecoration = widget.active[d.category] ? 'line-through' : 'none';
				const elements = svg.selectAll(`.${d.category}`);
				elements.filter('.path').style('opacity', opacity.path);
				elements.filter('.dataPointGroup').style('opacity', opacity.dataPoint);
				svg.select(`#${d.category}Text`).style('text-decoration', legendLineDecoration);
				widget.active[d.category] = !widget.active[d.category];
			})
			.on('mouseover', function (d) {
				svg.select(`#${d.category}Text`).style('font-weight', 'bold');
				svg.select(`#${d.category}Circle`).style('stroke', 'darkGray');

			})
			.on('mouseout', function (d) {
				svg.select(`#${d.category}Text`).style('font-weight', 'normal');
				svg.select(`#${d.category}Circle`).style('stroke', 'none');
			});


		// append rect for each category group
		legendCategories.append('circle')
			.attr('id', d => `${d.category}Circle`)
			.attr('r', data.legendCircleSize / 2)
			.attr('cx', data.legendCircleSize / 2)
			.attr('cy', data.legendCircleSize / 2)
			.attr('fill', d => d.color);

		// append text for each category group
		legendCategories.append('text')
			.attr('id', d => `${d.category}Text`)
			.text(d => d.displayName)
			.attr('x', data.legendCircleSize + 10)
			.attr('y', data.legendCircleSize - 1)
			.attr('fill', data.legendFontColor)
			.style('font', data.legendFont)
			.style('cursor', 'default')
			.style('text-decoration', d => widget.active && widget.active[d.category] || !widget.active ? 'none' : 'line-through');






		/*** CLICK TO STICK FUNCTIONS ****/
		function openTooltip (d, i) {
			svg.selectAll('.' + d.month)
				.attr('r', data.dataPointRadius * 1.5)
				.attr('stroke-width', data.dataPointStrokeWidth * 1.5);
			tooltipRect
				.attr('display', 'block')
			monthText.text(`${d.month + ' ' + data.yrPerMonth[d.month]}:`)
			if (i >= data.baselineIndicesRemoved) {
				baselineTextGroup.attr('transform', `translate(0,${data.tooltipPadding})`);
				baselineTextGroup.select('.typeText').text(`B:`)
				baselineTextGroup.select('.valueText').text(`${d3.format(`,.${data.precision}f`)(data.baselineDataWMissingData[i].value)} ${data.unitsLabel}`)
			}
			if (i >= data.projectedIndicesRemoved) {
				projectedTextGroup.attr('transform', `translate(0,${data.tooltipPadding * (i >= data.baselineIndicesRemoved ? 2 : 1)})`);
				projectedTextGroup.select('.typeText').text(`P:`)
				projectedTextGroup.select('.valueText').text(`${d3.format(`,.${data.precision}f`)(data.projectedDataWMissingData[i].value)} ${data.unitsLabel}`)
			}
			if (i >= data.measuredIndicesRemoved) {
				measuredTextGroup.attr('transform', `translate(0,${data.tooltipPadding * (i >= data.baselineIndicesRemoved && i >= data.projectedIndicesRemoved ? 3 : (i >= data.projectedIndicesRemoved || i >= data.baselineIndicesRemoved ? 2 : 1))})`);
				measuredTextGroup.select('.typeText').text(`M:`)
				measuredTextGroup.select('.valueText').text(`${d3.format(`,.${data.precision}f`)(data.measuredDataWMissingData[i].value)} ${data.unitsLabel}`)
			}
		}
		
		function attemptOpenTooltip (d, i) {
			if (widget.pinned === 'none') openTooltip(d, i);
		}
		
		function resetPins () {
			closeTooltip(widget.pinned);
			widget.pinned = 'none';
		}
		
		function closeTooltip (d) {
			svg.selectAll('.' + d.month)
				.attr('r', data.dataPointRadius)
				.attr('stroke-width', data.dataPointStrokeWidth);
			tooltipRect.attr('display', 'none');
			monthText.text('');
			baselineTextGroup.selectAll('text').text('');
			projectedTextGroup.selectAll('text').text('');
			measuredTextGroup.selectAll('text').text('');
		}
		
		function attemptCloseTooltip (d) {
			if (widget.pinned === 'none') closeTooltip(d);
		}
		
		function pinTooltip (d, i) {
			if (widget.pinned !== 'none') resetPins();
			widget.pinned = d;
			openTooltip(d, i);
		}






	};

	function render(widget) {
		// invoking setupDefinitions, then returning value from successful promise to renderWidget func
		return setupDefinitions(widget)
			.then(data => {
				if (!widget.data || needToRedrawWidget(widget, data)) {
					renderWidget(widget, data);
				}
				widget.data = data;
			});

	}


	////////////////////////////////////////////////////////////////
	// Initialize Widget
	////////////////////////////////////////////////////////////////

	CxYearlyEfficiencyProfile.prototype.doInitialize = function (element) {
		var that = this;
		element.addClass("CxYearlyEfficiencyProfileOuter");

		const outerEl = d3.select(element[0])
			.style('overflow', 'hidden')

		that.svg = outerEl.append('svg')
			.attr('class', 'CxYearlyEfficiencyProfile')
			.style('overflow', 'hidden')
			.attr('top', 0)
			.attr('left', 0)

		that.active = undefined;
		that.getSubscriber().attach("changed", function (prop, cx) { render(that) });
	};


	////////////////////////////////////////////////////////////////
	// Extra Widget Methods
	////////////////////////////////////////////////////////////////

	CxYearlyEfficiencyProfile.prototype.doLayout = CxYearlyEfficiencyProfile.prototype.doChanged = CxYearlyEfficiencyProfile.prototype.doLoad = function () { render(this); };

	/* FOR FUTURE NOTE: 
	CxYearlyEfficiencyProfile.prototype.doChanged = function (name, value) {
				if(name === "value") valueChanged += 'prototypeMethod - ';
				render(this);
	};
	*/

	CxYearlyEfficiencyProfile.prototype.doDestroy = function () {
		this.jq().removeClass("CxYearlyEfficiencyProfileOuter");
	};

	return CxYearlyEfficiencyProfile;
});

