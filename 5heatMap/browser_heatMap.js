function defineFuncForTabSpacing () {
	////ONLY FOR BROWSER /////
	const widget = {};




	////////// Hard Coded Defs //////////
	const areScalarArrsSame = (arr1, arr2) => arr1.length === arr2.length && arr1.every((el, idx) => el === arr2[idx]);
	const arePrimitiveValsInObjsSame = (obj1, obj2) => !Object.keys(obj1).some(key => (obj1[key] === null || (typeof obj1[key] !== 'object' && typeof obj1[key] !== 'function')) && obj1[key] !== obj2[key])
	const needToRedrawWidget = (widget, newData) => {
		const lastData = widget.data;
		// check primitives for equivalence
		if (!arePrimitiveValsInObjsSame(lastData, newData)) return true;
		// check availableYears for equivalence
		if (!areScalarArrsSame(lastData.availableYears, newData.availableYears))	return true;
		// check dataForYear data for equivalence
		if (lastData.dataForYear.length !== newData.dataForYear.length) return true;
		const isDiscrepencyInMonthlyObjs = lastData.dataForYear.some((monthObj, idx) => {
			const newMonthObj = newData.dataForYear[idx];
			if (!arePrimitiveValsInObjsSame(monthObj, newMonthObj) || monthObj.tempBinsForMonth.length !== newMonthObj.tempBinsForMonth.length) return true;
			const isDiscrepencyInTempBins = monthObj.tempBinsForMonth.some((lastTempBin, tempBinIndex) => {
				const newTempBin = newMonthObj.tempBinsForMonth[tempBinIndex];
				if (!arePrimitiveValsInObjsSame(lastTempBin, newTempBin) || lastTempBin.thisTempBin.display !== newTempBin.thisTempBin.display) return true;
			})
		  if (isDiscrepencyInTempBins) return true;
			return false;
		})
		if (isDiscrepencyInMonthlyObjs) return true;
		return false;
	}
	let widgetCount = 0;	// for generating unique ids
	const getJSDateFromTimestamp = d3.timeParse('%d-%b-%y %I:%M:%S.%L %p UTC%Z');
	const formatIntoPercentage = d3.format('.0%');
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
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const dropdownYearChanged = (widget, newYear) => {
		widget.dropdownYearSelected = newYear;
		render();
	}
	const resetElements = (outerWidgetEl, elementsToReset) => {
		const selectionForCheck = outerWidgetEl.selectAll(elementsToReset)
		if (!selectionForCheck.empty()) selectionForCheck.remove();
	};
	const getIndexOfBinForTemp = (temp, binArr) => binArr.findIndex(bin => temp >= bin.min && temp <= bin.max);
	const getBinOpacity = (hrsInBin, hrsInMonth) => {
		let contOpacity = hrsInBin / hrsInMonth || 0;
		if (contOpacity === 0) return 0;
		return contOpacity + 0.5
		// if (contOpacity < 0.25) return 0.4;
		// if (contOpacity < 0.4) return 0.6;
		// if (contOpacity < 0.6) return 0.8;
		// if (contOpacity < 0.8) return 1;
		// return 1; 
	}

	const getMonthlyDataForYear = (hourlyData, year, tempRanges, effRange, formatKwTrFunc) => {
		const makeAMonthObj = month => {
			const obj = {
				thisMonth: month,
				totalHoursForMonth: 0,
				// create arr of {} (one for each tempBin) for each month's monthObj.tempBinsForMonth
				tempBinsForMonth: tempRanges.map(range => {
					return {
							totalHoursInBin: 0,
							totalEffInBin: 0,
							avgEffInBin: 0,
							opacity: 0,
							colorScaleVal: 0,
							thisTempBin: range
					};
				})
			};
			return obj;
		}
		const hrsPerTempRangePerMonth = [];
		months.forEach(month => {
			let monthObj = makeAMonthObj(month);
			// if there is data for that month in hourlyData, add it to monthObj
			if (hourlyData[year][month]){
				hourlyData[year][month].hoursArr.forEach(hour => {
					monthObj.totalHoursForMonth++;
					monthObj.tempBinsForMonth[getIndexOfBinForTemp(hour.temp, tempRanges)].totalHoursInBin++;
					monthObj.tempBinsForMonth[getIndexOfBinForTemp(hour.temp, tempRanges)].totalEffInBin += hour.eff;
				});
			}

			// monthObj.totalHoursForMonth = monthObj.tempBinsForMonth.reduce(((accum, curr) => accum + curr.totalHoursInBin), 0)
			
			// add month's monthObj with data to hrsPerTempRangePerMonth
			hrsPerTempRangePerMonth.push(monthObj);
		});

		// calculate avg eff, opacity, and colorScaleVal for each bin in each month
		hrsPerTempRangePerMonth.forEach(month => {
			month.tempBinsForMonth.forEach(bin => {
				bin.avgEffInBin = bin.totalEffInBin / bin.totalHoursInBin ? +formatKwTrFunc(bin.totalEffInBin / bin.totalHoursInBin) : 0;
				bin.opacity = getBinOpacity(bin.totalHoursInBin, month.totalHoursForMonth);
				bin.colorScaleVal = bin.avgEffInBin < effRange[0] ? effRange[0] : (bin.avgEffInBin > effRange[1] ? effRange[1] : bin.avgEffInBin);
			});
		});
		return hrsPerTempRangePerMonth;
	};




	////////////////////////////////////////////////////////////////
		// Define Widget Constructor & Exposed Properties
	////////////////////////////////////////////////////////////////
	const properties = [
		/* COLORS */
		//fills
		{
			name: 'backgroundColor',
			value: 'white',
			typeSpec: 'gx:Color'
		},
		{
			name: 'gridFillColor',
			value: 'white',
			typeSpec: 'gx:Color'
		},
		// {
		// 	name: 'maxKwTrColor',
		// 	value: 'rgb(41,171,226)',
		// 	typeSpec: 'gx:Color'
		// },
		// {
		// 	name: 'minKwTrColor',
		// 	value: 'rgb(34,181,115)',
		// 	typeSpec: 'gx:Color'
		// },
		{
			name: 'maxKwTrColor',
			value: '#D33227',
			typeSpec: 'gx:Color'
		},
		{
			name: 'minKwTrColor',
			value: '#1F77B9',
			typeSpec: 'gx:Color'
		},
		// {
		// 	name: 'maxKwTrColor',
		// 	value: 'rgb(21,67,96)',
		// 	typeSpec: 'gx:Color'
		// },
		// {
		// 	name: 'minKwTrColor',
		// 	value: '#FFA500',
		// 	typeSpec: 'gx:Color'
		// },
		{
			name: 'dropdownFillColor',
			value: '#D1D1D1',
			typeSpec: 'gx:Color'
		},
		{
			name: 'tooltipFillColor',
			value: '#D1D1D1',
			typeSpec: 'gx:Color'
		},
		//strokes
		{
			name: 'gridStrokeColor',
			value: 'grey',
			typeSpec: 'gx:Color'
		},
		{
			name: 'dropdownStrokeColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		//text
		{
			name: 'xAxisTicksTextColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		{
			name: 'yAxisTicksTextColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		{
			name: 'yAxisTitleColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		{
			name: 'legendUnitsTitleColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		{
			name: 'legendTicksTextColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		{
			name: 'dropdownTitleColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		{
			name: 'dropdownTextColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		{
			name: 'tooltipMonthColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		{
			name: 'tooltiptempColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		{
			name: 'tooltipHrsColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		{
			name: 'tooltipKwTrColor',
			value: 'black',
			typeSpec: 'gx:Color'
		},
		/* FONT */
		{
			name: 'xAxisTicksTextFont',
			value: '8.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'yAxisTicksTextFont',
			value: '10.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'yAxisTitleFont',
			value: 'bold 10.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'legendTitleFont',
			value: 'bold 10.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'legendTicksTextFont',
			value: '10.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'dropdownTitleFont',
			value: 'bold 12.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'dropdownTextFont',
			value: '10.5pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'tooltipMonthFont',
			value: 'bold 12.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'tooltipTempFont',
			value: 'bold 12.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'tooltipHrsFont',
			value: '12.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'tooltipKwTrFont',
			value: '12.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
	/* PADDING */
		{
			name: 'paddingAboveDropdown',
			value: 5
		},
		{
			name: 'paddingLeftOfDropdown',				
			value: 10
		},
		{
			name: 'paddingBelowDropdown',				
			value: 5
		},
		{
			name: 'paddingRightOfYAxisTicks',
			value: 3
		},
		{
			name: 'paddingAboveXAxisTicks',
			value: 3
		},
		{
			name: 'paddingRightOfYAxisTitle',
			value: 7
		},
		{
			name: 'paddingRightOfGrid',
			value: 5
		},
		{
			name: 'paddingRightOfLegendTitle',
			value: 5
		},
		{
			name: 'paddingRightOfLegendBar',
			value: 2
		},
		{
			name: 'paddingRightOfTooltipMonth',				
			value: 5
		},
		{
			name: 'paddingRightOfTooltipTemp',				
			value: 15
		},
		{
			name: 'paddingRightOfTooltipHrs',				
			value: 15
		},
	/* OTHER */
		{
			name: 'overrideDefaultTempPrecisionWFacets',
			value: false
		},
		{
			name: 'overrideDefaultKwTrPrecisionWFacets',
			value: false
		},
		{
			name: 'minTempCategory',
			value: 30
		},
		{
			name: 'maxTempCategory',
			value: 80
		},
		{
			name: 'minKwTrCategory',
			value: 0.250
		},
		{
			name: 'maxKwTrCategory',
			value: 1.250
		},
		{
			name: 'dropdownWidth',
			value: 100
		},
		{
			name: 'dropdownBorderRadius',
			value: 15
		},
		{
			name: 'tooltipRoundedness',
			value: 5
		}
	];


	////////////////////////////////////////////////////////////////
		// /* SETUP DEFINITIONS AND DATA */
	////////////////////////////////////////////////////////////////
	const setupDefinitions = () => {
		const today = new Date();
		const thisYear = today.getFullYear();

		// FROM USER // 
		const data = {};
		properties.forEach(prop => data[prop.name] = prop.value);

		// FROM JQ //
		data.jqHeight = 315;
		data.jqWidth = 565;

		// SIZING //
		data.margin = {top: 5, left: 5, right: 5, bottom: 5};
		data.graphicHeight = data.jqHeight - (data.margin.top + data.margin.bottom);
		data.graphicWidth = data.jqWidth - (data.margin.left + data.margin.right);
		data.dropdownGroupHeight = getTextHeight(data.dropdownTitleFont) + getTextHeight(data.dropdownTextFont) + data.paddingAboveDropdown + 10;

		// GLOBALS PER INSTANCE //
		if (!widget.ttMonth) widget.ttMonth = '';
		if (!widget.ttTemp) widget.ttTemp = '';
		if (!widget.ttHours) widget.ttHours = '';
		if (!widget.ttEff) widget.ttEff = '';
		if (!widget.tooltipActive) widget.tooltipActive = false;
		if (!widget.uniqueId) {
			widgetCount++;
			widget.uniqueId = 'heatMapWidget' + widgetCount;
		}




		if (!widget.hovered) widget.hovered = { optimized: false, standard: false, current: 'neither' };
		if (!widget.activeModule) widget.activeModule = 'none';
		if (!widget.percentIsHovered) widget.percentIsHovered = false;

		// DATA TO POPULATE //
		data.availableYears = [];
		data.hourlyData = {};
		let addedTempHistoryYr = false;

		// FAKE DATA //
		const populateFakeData = () => {

			effHistory.forEach(hourlyDatum => {
				if (!data.hourlyData[hourlyDatum.year]) {
					data.hourlyData[hourlyDatum.year] = {};
					data.availableYears.unshift(hourlyDatum.year)
				}
				if (!data.hourlyData[hourlyDatum.year][hourlyDatum.month]) {
					data.hourlyData[hourlyDatum.year][hourlyDatum.month] = {monthObj: {}, hoursArr: []};
				}
				data.hourlyData[hourlyDatum.year][hourlyDatum.month].monthObj[hourlyDatum.dateHr] = {eff: hourlyDatum.value, temp: undefined};
			});
			tempHistory.forEach(hourlyDatum => {
				if (!data.hourlyData[hourlyDatum.year]) {
					addedTempHistoryYr = true;
					data.hourlyData[hourlyDatum.year] = {};
					data.availableYears.unshift(hourlyDatum.year)
				}
				if (!data.hourlyData[hourlyDatum.year][hourlyDatum.month]) {
					data.hourlyData[hourlyDatum.year][hourlyDatum.month] = {monthObj: {}, hoursArr: []};
				}
				if (!data.hourlyData[hourlyDatum.year][hourlyDatum.month].monthObj[hourlyDatum.dateHr]) {
					data.hourlyData[hourlyDatum.year][hourlyDatum.month].monthObj[hourlyDatum.dateHr] = {eff: undefined, temp: hourlyDatum.value};
				} else {
					data.hourlyData[hourlyDatum.year][hourlyDatum.month].monthObj[hourlyDatum.dateHr].temp = hourlyDatum.value;
				}
			});


		if (addedTempHistoryYr) data.availableYears.sort((a,b) => a-b);

		//convert collected hours to array format within overall data obj
		data.availableYears.forEach(yearKey => {
			const monthKeys = Object.keys(data.hourlyData[yearKey]);
			monthKeys.forEach(monthKey => {
				data.hourlyData[yearKey][monthKey].hoursArr = d3.values(data.hourlyData[yearKey][monthKey].monthObj);
			})
		})
	};

		// CALCULATED DEFS //
		const calculateDefs = () => {
			if (!widget.dropdownYearSelected) widget.dropdownYearSelected = data.availableYears[0];
			data.tempPrecision = !data.overrideDefaultTempPrecisionWFacets ? 0 : 'getFROMFACETS'			//TODO: actually get from facets
			data.kwTrPrecision = !data.overrideDefaultKwTrPrecisionWFacets ? 3 : 'getFROMFACETS'			//TODO: actually get from facets
			data.tempUnits = '°F' || '°F'	//TODO: get from facets on left of ||
			// functions
			data.formatTemp = d3.format(`,.${data.tempPrecision}f`);
			data.formatKwTr = d3.format(`,.${data.kwTrPrecision}f`);

			//widths
			data.legendBarWidth = data.graphicWidth / 37 || 15;
			data.yAxisTicksWidth = getTextWidth(`${data.formatTemp(-888.888)}-${data.formatTemp(-888.888)}`, data.yAxisTicksTextFont) + data.paddingRightOfYAxisTicks;
			data.yAxisTextAreaWidth = getTextHeight(data.yAxisTitleFont) + data.paddingRightOfYAxisTitle + data.yAxisTicksWidth;
			data.legendWidth = + data.paddingRightOfGrid + getTextHeight(data.legendTitleFont) + data.paddingRightOfLegendTitle + data.legendBarWidth + data.paddingRightOfLegendBar + getTextWidth(`>${data.formatKwTr(8.8888)}`, data.legendTicksTextFont);
			data.gridWidth = data.graphicWidth - (data.yAxisTextAreaWidth + data.legendWidth)
			data.cellWidth = data.gridWidth / 12;
			data.ttMonthWidth = getTextWidth('May:', data.tooltipMonthFont);
			data.ttTempWidth = getTextWidth(`${data.formatTemp(-888.888)}-${data.formatTemp(88.888)}${data.tempUnits}`, data.tooltipTempFont);
			data.ttHoursWidth = getTextWidth('888 Hours', data.tooltipHrsFont);
			data.ttEffWidth = getTextWidth(data.formatKwTr(8.88888) + ' kW/tR', data.tooltipKwTrFont);
			data.tooltipWidth = 10 +	// 5 padding on right and left
				data.ttMonthWidth +
				data.paddingRightOfTooltipMonth +
				data.ttTempWidth +
				data.paddingRightOfTooltipTemp +
				data.ttHoursWidth +
				data.paddingRightOfTooltipHrs +
				data.ttEffWidth;

			//heights
			data.headerAreaHeight = data.dropdownGroupHeight + data.paddingBelowDropdown;
			data.gridHeight = data.graphicHeight - (data.headerAreaHeight + getTextHeight(data.xAxisTicksTextFont) + data.paddingAboveXAxisTicks);
			data.cellHeight = data.gridHeight / 12;
			data.tooltipHeight = getTextHeight(data.tooltipMonthFont) + 10 //5 padding top and bottom
			data.paddingBetweenLegendTicks = (data.gridHeight - (getTextHeight(data.legendTicksTextFont) * 5)) / 4;
			data.legendTickSpaceHeight = getTextHeight(data.legendTicksTextFont) + data.paddingBetweenLegendTicks;

			// yAxis Bins
			const getSmallestNumOfPrecision = decimals => {
				if (!decimals) return 1;
				let decimalNums = '0'.repeat(decimals - 1);
				let num = '0.' + decimalNums + '1';
				return +num;
			}

			const smallestNumOfPrecision = getSmallestNumOfPrecision(data.tempPrecision)
			data.tempBins = [];
			data.tempBins.push({min: Number.NEGATIVE_INFINITY, max: data.minTempCategory - 0.00000000000000000000000000000001, display: '<' + data.formatTemp(data.minTempCategory)})
			data.tempBinsInterval = (data.maxTempCategory - data.minTempCategory) / 10;	// to get 12 bins
			for (let i = 0; i <= 9; i++) {
				let bin = {};
				bin.min = data.minTempCategory + (data.tempBinsInterval * i);
				bin.max = (bin.min + data.tempBinsInterval) - 0.00000000000000000000000000000000000001;
				bin.display = data.formatTemp(bin.min) + '-' + data.formatTemp(((bin.min + data.tempBinsInterval) - smallestNumOfPrecision));
				data.tempBins.push(bin)
			}
			data.tempBins.push({min: data.maxTempCategory, max: Number.POSITIVE_INFINITY, display: '≥' + data.formatTemp(data.maxTempCategory)})
			console.log('tempBins: ', data.tempBins)

			// legend range and ticks
			data.legendRange = [data.minKwTrCategory, data.maxKwTrCategory]
			const legendInterval = (data.maxKwTrCategory - data.minKwTrCategory) / 4 // to get 5 ticks
			data.legendTicks = [data.maxKwTrCategory, data.minKwTrCategory + (legendInterval * 3), data.minKwTrCategory + (legendInterval * 2), data.minKwTrCategory + (legendInterval), data.minKwTrCategory]
				.map((el, i) => {
					el = data.formatKwTr(el);
					if (i === 4) el = '<' + el;
					if (i === 0) el = '>' + el;
					return el;
				});
			
			// get dataForYear
			data.dataForYear = getMonthlyDataForYear(data.hourlyData, widget.dropdownYearSelected, data.tempBins, data.legendRange, data.formatKwTr);
			console.log('dataForYear: ', data.dataForYear)

			// return data
			return data;
		};


		populateFakeData();
		return calculateDefs();
	};
		




	////////////////////////////////////////////////////////////////
		// RenderWidget Func
	////////////////////////////////////////////////////////////////

	const renderWidget = data => {
		// ********************************************* DRAW ******************************************************* //
		widget.outer
			.style('width', data.jqWidth + 'px')	//only for browser
			.style('height', data.jqHeight + 'px')	//only for browser

		widget.outerDiv
			.style('width', data.jqWidth + 'px')
			.style('height', data.jqHeight + 'px')


		d3.select(widget.outerDiv.node().parentNode).style('background-color', data.backgroundColor);

		// delete leftover elements from versions previously rendered
		if (!widget.outerDiv.empty()) resetElements(widget.outerDiv, '*');

		// draw svg
		widget.svg = widget.outerDiv.append('svg')
			.attr('class', 'heatMapSvg')
			.attr('width', data.jqWidth)
			.attr('height', data.jqHeight);

		const chartGroup = widget.svg.append('g')
			.attr('class', 'chartGroup')
			.attr('transform', `translate(${data.margin.left}, ${data.headerAreaHeight})`)
		

		// ********************************************* DROPDOWN ******************************************************* //
		const dropdownDiv = widget.outerDiv.append('div')
			.attr('class', 'dropdownDiv')

		// dropdown title
		dropdownDiv.append('h4')
			.text('Year')
			.attr('dominant-baseline', 'hanging')
			.style('color', data.dropdownTitleColor)
			.style('font', data.dropdownTitleFont)
			.style('position', 'absolute')
			.style('top', data.margin.top + 'px')
			.style('left', data.paddingLeftOfDropdown + 5 + data.margin.left + 'px')

			// dropdown select
		dropdownDiv.append('select')		// assume 5px above and 5 px below textHeight for dropdownHeight
			.style('width', data.dropdownWidth + 'px')
			.style('border-radius', data.dropdownBorderRadius + 'px')
			.style('position', 'absolute')
			.style('top', (data.margin.top + getTextHeight(data.dropdownTitleFont) + data.paddingAboveDropdown) + 'px')
			.style('left', data.paddingLeftOfDropdown + data.margin.left + 'px')
			.style('font', data.dropdownTextFont)
			.style('color', data.dropdownTextColor)
			.style('border', `1.5px solid ${data.dropdownStrokeColor}`)
			.style('padding', '5px')
			.style('background-color', data.dropdownFillColor)
			.on('change', () => dropdownYearChanged(widget, d3.event.target.value))
			.selectAll('option')
				.data(data.availableYears).enter()
					.append('option')
						.property('selected', d => d == widget.dropdownYearSelected)
						.text(d => d)

		// ********************************************* TOOLTIP ******************************************************* //
		const tooltipGroup = chartGroup.append('g')
			.attr('class', 'tooltipGroup')
			.attr('transform', `translate(${(data.yAxisTextAreaWidth + data.gridWidth) - data.tooltipWidth}, ${-(data.tooltipHeight + data.paddingBelowDropdown)})`)

		const ttRect = tooltipGroup.append('rect')
			.attr('height', data.tooltipHeight)
			.attr('width', data.tooltipWidth)
			.attr('fill', data.tooltipFillColor)
			.attr('rx', data.tooltipRoundedness)
			.attr('ry', data.tooltipRoundedness)
			.style('opacity', widget.tooltipActive ? 1 : 0)
		
		const ttTextGroup = tooltipGroup.append('g')
			.attr('class', 'ttTextGroup')
			.attr('transform', `translate(5, ${data.tooltipHeight / 2})`)

		const ttMonthText = ttTextGroup.append('text')
			.attr('dominant-baseline', 'middle')
			.attr('text-anchor', 'middle')
			.attr('x', data.ttMonthWidth / 2)
			.style('font', data.tooltipMonthFont)
			.attr('fill', data.tooltipMonthColor)
			.text(widget.ttMonth)
			// .text('Apr:')
		const ttTempText = ttTextGroup.append('text')
			.attr('dominant-baseline', 'middle')
			.attr('text-anchor', 'middle')
			.attr('x', (data.ttMonthWidth + data.paddingRightOfTooltipMonth) + (data.ttTempWidth / 2))
			.style('font', data.tooltipTempFont)
			.attr('fill', data.tooltipTempColor)
			.text(widget.ttTemp)
			// .text('55-59°F')
		const ttHrsText = ttTextGroup.append('text')
			.attr('dominant-baseline', 'middle')
			.attr('text-anchor', 'middle')
			.attr('x', (data.ttMonthWidth + data.paddingRightOfTooltipMonth + data.ttTempWidth + data.paddingRightOfTooltipTemp) + (data.ttHoursWidth / 2))
			.style('font', data.tooltipHrsFont)
			.attr('fill', data.tooltipHrsColor)
			.text(widget.ttHours)
			// .text('350 Hours')
		const ttEffText = ttTextGroup.append('text')
			.attr('dominant-baseline', 'middle')
			.attr('text-anchor', 'middle')
			.attr('x', (data.ttMonthWidth + data.paddingRightOfTooltipMonth + data.ttTempWidth + data.paddingRightOfTooltipTemp + data.ttHoursWidth + data.paddingRightOfTooltipHrs) + (data.ttEffWidth / 2))
			.style('font', data.tooltipKwTrFont)
			.attr('fill', data.tooltipKwTrColor)
			.text(widget.ttEff)
			// .text('0.62 kW/tR')




		// ********************************************* GENERATORS AND SCALES ******************************************************* //
		const xScale = d3.scaleBand()
			.domain(months)
			.range([0, data.gridWidth]);

		const xAxisGenerator = d3.axisBottom()
			.scale(xScale)
			.tickFormat(d => d)
			.tickPadding(data.paddingAboveXAxisTicks)
			.tickSize(0)

		const yScale = d3.scaleBand()
			.domain(data.tempBins.map(bin => bin.display))
			.range([data.gridHeight, 0])
		
		const yAxisGenerator = d3.axisLeft()
			.scale(yScale)
			.tickFormat(d => d)
			.tickPadding(data.paddingRightOfYAxisTicks)
			.tickSize(0)

		const colorScale = d3.scaleLinear()
			.domain([data.minKwTrCategory, data.maxKwTrCategory])
			.range([data.minKwTrColor, data.maxKwTrColor])

		// ********************************************* CHART ******************************************************* //
		const gridGroup = chartGroup.append('g')
			.attr('class', 'gridGroup')
			.attr('transform', `translate(${data.yAxisTextAreaWidth}, 0)`)
	
		// chart background rect
		gridGroup.append('rect')
			.attr('height', data.gridHeight)
			.attr('width', data.gridWidth)
			.attr('stroke', data.gridStrokeColor)
			.attr('fill', data.gridFillColor)
			.style('stroke-weight', '0.5pt')
			
		
		const monthlyGroups = gridGroup.selectAll('.monthlyGroup')
			.data(data.dataForYear)
			.enter().append('g')
				.attr('class', 'monthlyGroup')
				.attr('transform', d => `translate(${xScale(d.thisMonth)}, 0)`)

		const rects = monthlyGroups.selectAll('.cell')
			.data(d => d.tempBinsForMonth)
			.enter().append('rect')
				.attr('class', 'cell')
				.attr('width', data.cellWidth)
				.attr('height', data.cellHeight)
				.attr('y', d => yScale(d.thisTempBin.display))
				.attr('fill', d => colorScale(d.colorScaleVal))
				.attr('stroke', data.gridStrokeColor)
				.attr('stroke-width', '0.5pt')
				.style('fill-opacity', d => d.opacity)
				.on('mouseover', function (d, i, nodes) {
					d3.select(this)
						.attr('stroke-width', '1.5pt')
					widget.tooltipActive = true;
					widget.ttMonth = nodes[i].parentNode.__data__.thisMonth +':';
					widget.ttTemp = d.thisTempBin.display + data.tempUnits;
					widget.ttHours = d.totalHoursInBin + ' Hours';
					widget.ttEff = d.avgEffInBin + ' kW/tR';

					ttRect.style('opacity', widget.tooltipActive ? 1 : 0);
					ttMonthText.text(widget.ttMonth);
					ttTempText.text(widget.ttTemp);
					ttHrsText.text(widget.ttHours);
					ttEffText.text(d.opacity);	//widget.ttEff
				})
				.on('mouseout', function () {
					d3.select(this)
						.attr('stroke-width', '0.5pt')
					widget.tooltipActive = false;
					widget.ttMonth = '';
					widget.ttTemp = '';
					widget.ttHours = '';
					widget.ttEff = '';

					ttRect.style('opacity', widget.tooltipActive ? 1 : 0);
					ttMonthText.text(widget.ttMonth);
					ttTempText.text(widget.ttTemp);
					ttHrsText.text(widget.ttHours);
					ttEffText.text(widget.ttEff);
				})




		// x axis
		const xAxis = gridGroup.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(0, ${data.gridHeight})`)
			.call(xAxisGenerator)
		xAxis.selectAll('text')
			.style('font', data.xAxisTicksTextFont)
			.attr('fill', data.xAxisTicksTextColor)
		xAxis.selectAll('path')
			.attr('stroke', 'none')

		
		// y axis
		const yAxis = gridGroup.append('g')
			.attr('class', 'y axis')
			.call(yAxisGenerator)
		yAxis.selectAll('text')
			.style('text-anchor', 'end')
			.style('font', data.yAxisTicksTextFont)
			.attr('fill', data.yAxisTicksTextColor)
		yAxis.selectAll('path')
			.attr('stroke', 'none')

		// y axis title
		chartGroup.append('text')
			.text('Wetbulb ' + data.tempUnits)
			.attr('fill', data.yAxisTitleColor)
			.style('font', data.yAxisTitleFont)
			.attr('transform', 'rotate(-90)')
			.attr('x', -(data.gridHeight / 2))
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'hanging')
			


		// ********************************************* LEGEND ******************************************************* //

		const legendGroup = gridGroup.append('g')
			.attr('class', 'legendGroup')
			.attr('transform', `translate(${data.gridWidth + data.paddingRightOfGrid},0)`)
		
		// gradients
		const colorGradient = legendGroup.append('defs').append('linearGradient')
			.attr('id', widget.uniqueId + 'ColorGradient')
			.attr('x1', '0%')
			.attr('x2', '0%')
			.attr('y1', '100%')
			.attr('y2', '0%');

		colorGradient.append("stop")
			.attr('class', 'start-bottom')
			.attr("offset", "0%")
			.attr("stop-color", data.minKwTrColor)
			.attr("stop-opacity", 1);
	 
	 	colorGradient.append("stop")
			.attr('class', 'end-top')
			.attr("offset", "100%")
			.attr("stop-color", data.maxKwTrColor)
			.attr("stop-opacity", 1);

		// title
		legendGroup.append('text')
			.text('kW/tR')
			.attr('fill', data.legendTitleColor)
			.style('font', data.legendTitleFont)
			.attr('transform', 'rotate(-90)')
			.attr('dominant-baseline', 'hanging')
			.attr('text-anchor', 'end')

		// legend bar
		legendGroup.append('rect')
			.attr('height', data.gridHeight)
			.attr('width', data.legendBarWidth)
			.attr('x', getTextHeight(data.legendTitleFont) + data.paddingRightOfLegendTitle)
			.attr('fill', `url(#${widget.uniqueId}ColorGradient)`)

		
		//legend ticks
		const legendTicks = legendGroup.append('g')
			.attr('class', 'legendTicks')
			.attr('transform', `translate(${getTextHeight(data.legendTitleFont) + data.paddingRightOfLegendTitle + data.legendBarWidth + data.paddingRightOfLegendBar},0)`)
		
		legendTicks.selectAll('text')
			.data(data.legendTicks)
			.enter().append('text')
				.text(d => d)
				.attr('dominant-baseline', 'hanging')
				.style('font', data.legendTicksTextFont)
				.attr('fill', data.legendTicksTextColor)
				.attr('y', (d, i) => i * data.legendTickSpaceHeight)



		// ********************************************* MODAL ******************************************************* //
// make box of background color with slight opacity to blur background and then add modal on top











		// ********************************************* NON-SVG STYLING ******************************************************* //
		widget.outerDiv.selectAll('*')
			.style('margin', '0px')
			.style('padding', '0px')

		widget.outerDiv.select('select')
			.style('padding-left', '5px')



console.log('needToRedraw?: ', needToRedrawWidget(widget, data))
	};
	









	////////////////////////////////////////////////////////////////
		// Render Func
	////////////////////////////////////////////////////////////////
	const render = function () {
		let theData = setupDefinitions();
		if(!widget.data || needToRedrawWidget(widget, theData)){
			widget.data = theData
			renderWidget(theData);
		}
	}







	////////////////////////////////////////////////////////////////
		// Initialize Widget
	////////////////////////////////////////////////////////////////
	widget.outer = d3.select('#outer')
		.attr('class', 'heatMapOuter')
		.style('overflow', 'hidden');

	widget.outerDiv = widget.outer.append('div')
		.attr('class', 'heatMapDiv')
		.style('overflow', 'hidden');

	render();








}

defineFuncForTabSpacing();



