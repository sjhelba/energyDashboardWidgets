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
		for (let i = 0; i <= indexOfLastDigit; i++) {
			if (!isNaN(font[i]) || font[i] === '.') num += font[i];
		}
		num = +num;
		return num * 1.33333333333;
	};
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const dropdownYearChanged = (newYear, widget) => {
		widget.dropdownYearSelected = newYear;
		render();
	}
	const resetElements = (outerWidgetEl, elementsToReset) => {
		const selectionForCheck = outerWidgetEl.selectAll(elementsToReset)
		if (!selectionForCheck.empty()) selectionForCheck.remove();
	};
	const getIndexOfBinForTemp = (temp, binArr) => binArr.findIndex(bin => temp >= bin.min && temp <= bin.max);

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
			if (hourlyData[year][month]) {
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
				bin.opacity = bin.totalHoursInBin === 0 ? 0 : 1;
				bin.colorScaleVal = bin.avgEffInBin < effRange[0] ? effRange[0] : (bin.avgEffInBin > effRange[1] ? effRange[1] : bin.avgEffInBin);
			});
		});
		return hrsPerTempRangePerMonth;
	};

	/*
		* @param {array} arrOfOptions	DEFAULT: []
		* @param {function} funcToRunOnSelection, first param is val selected, rest are els in arr.	DEFAULT: valOfSelection => console.log('selected ' + valOfSelection)
		* @param {d3 element / obj} elementToAppendTo	DEFAULT: d3.select('svg')
		* @param {number} x	DEFAULT: 5
		* @param {number} y	DEFAULT: 50
		* @param {boolean} leftAligned	DEFAULT: true
		* @param {number} minDropdownWidth	DEFAULT: 125
		* @param {number} horizontalPadding	DEFAULT: 5
		* @param {number} verticalPadding	DEFAULT: 5
		* @param {string} strokeColor	DEFAULT: 'black'
		* @param {string} backgroundFill	DEFAULT: 'white'
		* @param {string} hoveredFill	DEFAULT: '#d5d6d4'
		* @param {string} font	DEFAULT: '10.0pt Nirmala UI'
		* @param {string} textColor	DEFAULT: 'black'
		* @param {string || number} defaultSelection	: set to value of default selection
		* @param {function} funcToRunOnOpen, params are els in arr.
		* @param {function} funcToRunOnClose, params are els in arr.
		* @param {array} arrOfArgsToPassInToFuncsAfterVal
		* @return {d3 element / obj} returns dropdownGroup appended to 'elementToAppendTo'
	*/
function makeDropdown(arrOfOptions = [], funcToRunOnSelection = valOfSelection => console.log('selected: ' + valOfSelection), elementToAppendTo = d3.select('svg'), x = 5, y = 50, leftAligned = true, minDropdownWidth = 125, horizontalPadding = 5, verticalPadding = 5, strokeColor = 'black', backgroundFill = 'white', hoveredFill = '#d5d6d4', font = '10.0pt Nirmala UI', textColor = 'black', defaultSelection, funcToRunOnOpen, funcToRunOnClose, arrOfArgsToPassInToFuncsAfterVal) {
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
    .attr('transform', `translate(${x + 3},${y + 3})`)
  //outer container
  const outerContainer = dropdownGroup.append('rect')
    .attr('class', 'outerContainerRect')
    .attr('width', dropdownWidth + 6)
    .attr('height', rowHeight + 6)
    .attr('fill', backgroundFill)
    .attr('rx', 5)
    .attr('stroke', strokeColor)
    .attr('x', - 3)
    .attr('y', - 3)
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
      .attr('height', open ? dropdownHeight + 6: rowHeight + 6);
    dropdownRows.transition()
      .attr('transform', (d, i) => open ? `translate(0, ${rowHeight * (i + 1)})` : `translate(0,0)`);
  }
  return dropdownGroup;
}



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
		// {
		// 	name: 'minKwTrColor',
		// 	value: '#1F77B9',
		// 	typeSpec: 'gx:Color'
		// },
		// {
		// 	name: 'maxKwTrColor',
		// 	value: 'rgb(21,67,96)',
		// 	typeSpec: 'gx:Color'
		// },
		{
			name: 'minKwTrColor',
			value: '#FFA500',
			typeSpec: 'gx:Color'
		},
		{
			name: 'dropdownFillColor',
			value: 'white',
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
		{
			name: 'hoveredInputStrokeColor',
			value: '#04B3D8',
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
			name: 'legendTitleColor',
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
		{
			name: 'modalLabelsFont',
			value: '10.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'modalInputFont',
			value: '10.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
	/* PADDING */
		{
			name: 'paddingAboveDropdown',
			value: 5
		},
		{
			name: 'paddingLeftOfDivs',				
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
			name: 'minKwTrCategory',
			value: 0.250
		},
		{
			name: 'maxKwTrCategory',
			value: 1.250
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
			name: 'numOfTempBins',
			value: 12
		},
		{
			name: 'yearDropdownWidth',
			value: 100
		},
		{
			name: 'modalInputWidth',
			value: 50
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
		if (!widget.hoveredRectIndex) widget.hoveredRectIndex = 'none';
		if (!widget.pinnedRectIndex) widget.pinnedRectIndex = 'none';
		if (!widget.numOfTempBins) widget.numOfTempBins = data.numOfTempBins;
		if (!widget.yearDropdownHovered) widget.yearDropdownHovered = false;
		if (!widget.modalDropdownHovered) widget.modalDropdownHovered = false;
		if (!widget.modalActive) widget.modalActive = false;
		if (!widget.minTempCategory) widget.minTempCategory = data.minTempCategory;
		if (!widget.maxTempCategory) widget.maxTempCategory = data.maxTempCategory;
		if (!widget.tempMaxSelection) widget.tempMaxSelection = widget.maxTempCategory;
		if (!widget.tempMinSelection) widget.tempMinSelection = widget.minTempCategory;
		if (!widget.tempNumOfBins) widget.tempNumOfBins = widget.numOfTempBins;
		if (!widget.minInputHovered) widget.minInputHovered = false;
		if (!widget.maxInputHovered) widget.maxInputHovered = false;
		if (!widget.modalSubmitHovered) widget.modalSubmitHovered = false;
		if (!widget.settingsBtnHovered) widget.settingsBtnHovered = false;
		if (!widget.minKwTrCategory) widget.minKwTrCategory = data.minKwTrCategory;
		if (!widget.maxKwTrCategory) widget.maxKwTrCategory = data.maxKwTrCategory;
		if (!widget.kwTrMaxSelection) widget.kwTrMaxSelection = widget.maxKwTrCategory;
		if (!widget.kwTrMinSelection) widget.kwTrMinSelection = widget.minKwTrCategory;


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
			data.hoveredCellWidth = data.cellWidth * 1.25;
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
			data.settingsBtnSize = data.cellWidth * 0.6;
			data.modalWidth = data.gridWidth * 1.2; // was 0.6	**CHANGED**
			data.modalLabelsHeight = getTextHeight(data.modalLabelsFont);
			data.minTempLabelWidth = getTextWidth('Min Temperature', data.modalLabelsFont);
			data.maxTempLabelWidth = getTextWidth('Max Temperature', data.modalLabelsFont);
			data.numTempBinsLabelWidth = getTextWidth('# of Temperature Bins', data.modalLabelsFont);
			const modalTempInputTitlesWidth = data.minTempLabelWidth + data.maxTempLabelWidth + data.numTempBinsLabelWidth;
			data.paddingBetweenTempInputs = (data.modalWidth - modalTempInputTitlesWidth) / 4;

			data.minKwTrLabelWidth = getTextWidth('Min kW/tR', data.modalLabelsFont);
			data.maxKwTrLabelWidth = getTextWidth('Max kW/tR', data.modalLabelsFont);
			const modalKwTrInputTitlesWidth = data.minKwTrLabelWidth + data.maxKwTrLabelWidth;
			data.paddingBetweenKwTrInputs = (data.modalWidth - modalKwTrInputTitlesWidth) / 3;



			//heights
			data.headerAreaHeight = data.dropdownGroupHeight + data.paddingBelowDropdown;
			data.gridHeight = data.graphicHeight - (data.headerAreaHeight + getTextHeight(data.xAxisTicksTextFont) + data.paddingAboveXAxisTicks);
			data.cellHeight = data.gridHeight / widget.numOfTempBins;
			data.hoveredCellHeight = data.cellHeight * 1.25;
			data.tooltipHeight = getTextHeight(data.tooltipMonthFont) + 10 //5 padding top and bottom
			data.paddingBetweenLegendTicks = (data.gridHeight - (getTextHeight(data.legendTicksTextFont) * 5)) / 4;
			data.legendTickSpaceHeight = getTextHeight(data.legendTicksTextFont) + data.paddingBetweenLegendTicks;
			data.modalHeight = data.gridHeight * 0.75;

			// yAxis Bins
			data.tempBins = [];
			data.tempBins.push({min: Number.NEGATIVE_INFINITY, max: widget.minTempCategory - 0.00000000000000000000000000000001, display: '<' + data.formatTemp(widget.minTempCategory)})
			data.tempBinsInterval = (widget.maxTempCategory - widget.minTempCategory) / (widget.numOfTempBins - 2);	// 10 if 12 bins
			console.log('data.tempBinsInterval', data.tempBinsInterval)
			for (let i = 0; i <= (widget.numOfTempBins - 3); i++) { // 9 if 12 bins
				let bin = {};
				bin.min = widget.minTempCategory + (data.tempBinsInterval * i);
				bin.max = (bin.min + data.tempBinsInterval) - 0.00000000000000000000000000000000000001;
				bin.display = data.formatTemp(bin.min) + '-' + data.formatTemp(((bin.min + data.tempBinsInterval)));

				data.tempBins.push(bin);
			}
			data.tempBins.push({min: widget.maxTempCategory, max: Number.POSITIVE_INFINITY, display: '≥' + data.formatTemp(widget.maxTempCategory)})
			console.log('tempBins: ', data.tempBins)

			// legend range and ticks
			data.legendRange = [widget.minKwTrCategory, widget.maxKwTrCategory];
			const legendInterval = (widget.maxKwTrCategory - widget.minKwTrCategory) / 4; // to get 5 ticks
			data.legendTicks = [widget.maxKwTrCategory, widget.minKwTrCategory + (legendInterval * 3), widget.minKwTrCategory + (legendInterval * 2), widget.minKwTrCategory + (legendInterval), widget.minKwTrCategory]
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
			.attr('height', data.jqHeight)
			.on('mousedown', unpinAll);

		const chartGroup = widget.svg.append('g')
			.attr('class', 'chartGroup')
			.attr('transform', `translate(${data.margin.left}, ${data.headerAreaHeight})`)
		

		// ********************************************* YEAR DROPDOWN ******************************************************* //
		const yearDropdownSection = widget.svg.append('g')
			.attr('class', 'yearDropdownSection')
			.attr('transform', `translate(${data.margin.left}, 0)`)
		yearDropdownSection.append('text')
			.text('Year')
			.style('font', data.dropdownTitleFont)
			.attr('fill', data.dropdownTitleColor)
			.attr('dominant-baseline', 'hanging')
		makeDropdown(data.availableYears.map(yr => +yr), dropdownYearChanged, yearDropdownSection, 0, 6.5 + getTextHeight(data.dropdownTitleFont), true, data.dropdownWidth, 5, 0, data.dropdownStrokeColor, data.dropdownFillColor, '#d5d6d4', data.dropdownTextFont, data.dropdownTextColor, +widget.dropdownYearSelected, () => {}, () => {}, [widget]);
	
		
		// ********************************************* TOOLTIP ******************************************************* //
		const tooltipGroup = chartGroup.append('g')
			.attr('class', 'tooltipGroup')
			.attr('transform', `translate(${(data.yAxisTextAreaWidth + data.gridWidth) - data.tooltipWidth}, ${-(data.tooltipHeight + data.paddingBelowDropdown)})`)

		const ttRect = tooltipGroup.append('rect')
			.attr('height', data.tooltipHeight)
			.attr('width', data.tooltipWidth)
			.attr('fill', data.tooltipFillColor)
			.attr('rx', data.tooltipHeight * 0.1)
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
			.domain([widget.minKwTrCategory, widget.maxKwTrCategory])
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
			.attr('stroke-width', '0.5pt')
			
		
		const monthlyGroups = gridGroup.selectAll('.monthlyGroup')
			.data(data.dataForYear)
			.enter().append('g')
				.attr('class', d => `monthlyGroup ${d.thisMonth}MonthlyGroup`)
				.attr('transform', d => `translate(${xScale(d.thisMonth)}, 0)`)

		const rects = monthlyGroups.selectAll('.cell')
			.data(d => d.tempBinsForMonth)
			.enter().append('rect')
				.attr('class', 'cell')
				.attr('width', data.cellWidth)
				.attr('height', data.cellHeight)
				.attr('x', 0)
				.attr('y', d => yScale(d.thisTempBin.display))
				.attr('fill', d => d.opacity === 0 ? data.gridFillColor : colorScale(d.colorScaleVal))
				.attr('stroke', data.gridStrokeColor)
				.attr('stroke-width', (d, i) => widget.hoveredRectIndex === i ? '2pt' : '0.5pt')
				.on('mousedown', function(){
					d3.event.stopPropagation()
				})
				.on('click', function (d, i, nodes) {
					if (widget.pinnedRectIndex === i) {
						unpinAll();
					} else {
						pinRect(d, i, nodes, this);
					}
				})
				.on('mouseover', function (d, i, nodes) {
					attemptHoverRect(d, i, nodes, this)
				})
				.on('mouseout', function (d, i, nodes) {
					attemptUnhoverRects(d, i, nodes, this)
				})




		// x axis
		const xAxis = gridGroup.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(0, ${data.gridHeight})`)
			.call(xAxisGenerator)
		xAxis.selectAll('text')
			.style('font', data.xAxisTicksTextFont)
			.style('fill', data.xAxisTicksTextColor)
		xAxis.selectAll('path')
			.attr('stroke', 'none')

		
		// y axis
		const yAxis = gridGroup.append('g')
			.attr('class', 'y axis')
			.call(yAxisGenerator)
		yAxis.selectAll('text')
			.style('text-anchor', 'end')
			.style('font', data.yAxisTicksTextFont)
			.style('fill', data.yAxisTicksTextColor)
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

		const halfOfDifferenceInSizeForPosGrowth = (((data.settingsBtnSize * 1.2) - (data.settingsBtnSize)) / 2)
		const settingsButton = widget.svg.append('svg:image')
			.attr('xlink:href', ' data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNzkuOCAxOTQuMzgiPjx0aXRsZT5nZWFyU2V0dGluZ3M8L3RpdGxlPjxwYXRoIGQ9Ik0xNDIuODIsNzAuNjhWOTQuOWE2Ny4xLDY3LjEsMCwwLDAtMzAuNTQsMTcuNjRsLTIxLTEyLjEzYTcuOTEsNy45MSwwLDAsMC0xMC43NiwyLjg4bC05LjMzLDE2LjE3YTcuOSw3LjksMCwwLDAsMi44OCwxMC43NmwyMSwxMi4xM2E2Ny42MSw2Ny42MSwwLDAsMCwwLDM1LjIzTDc0LDE4OS43M2E3Ljg4LDcuODgsMCwwLDAtMi44OCwxMC43NWw5LjMzLDE2LjE3YTcuOTEsNy45MSwwLDAsMCwxMC43NiwyLjg5bDIxLjA3LTEyLjE3QTY3LjMsNjcuMywwLDAsMCwxNDIuNzYsMjI1djI0LjM0YTcuODksNy44OSwwLDAsMCw3Ljg3LDcuODhIMTY5LjNhNy44OSw3Ljg5LDAsMCwwLDcuODgtNy44N1YyMjVhNjcuMTMsNjcuMTMsMCwwLDAsMzAuNDctMTcuNTdsMjEuMDgsMTIuMThhNy45MSw3LjkxLDAsMCwwLDEwLjc2LTIuODhsOS4zMy0xNi4xN2E3LjksNy45LDAsMCwwLTIuODgtMTAuNzZsLTIxLTEyLjE1YTY3LjU3LDY3LjU3LDAsMCwwLDAtMzUuMjJsMjEtMTIuMTRhNy44OCw3Ljg4LDAsMCwwLDIuODgtMTAuNzVsLTkuMzMtMTYuMTdhNy45MSw3LjkxLDAsMCwwLTEwLjc2LTIuODlsLTIxLDEyLjEyYTY3LjIzLDY3LjIzLDAsMCwwLTMwLjUyLTE3LjY3VjcwLjY5YTcuODksNy44OSwwLDAsMC03Ljg3LTcuODhIMTUwLjdBNy44OSw3Ljg5LDAsMCwwLDE0Mi44Miw3MC42OFpNMjAxLDE1OS44OEE0MC44Nyw0MC44NywwLDEsMSwxNjAuMTcsMTE5LDQwLjg3LDQwLjg3LDAsMCwxLDIwMSwxNTkuODhaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNzAuMSAtNjIuODEpIiBmaWxsPSJzaWx2ZXIiLz48L3N2Zz4=')
			.attr('x', widget.settingsBtnHovered ? (data.graphicWidth - (data.settingsBtnSize * 1.2)) - halfOfDifferenceInSizeForPosGrowth : data.graphicWidth - (data.settingsBtnSize * 1.2))
			.attr('y', widget.settingsBtnHovered ? data.margin.top * 2 : (data.margin.top * 2) + halfOfDifferenceInSizeForPosGrowth)
			.attr('height', widget.settingsBtnHovered ? data.settingsBtnSize * 1.2 : data.settingsBtnSize)
			.attr('width', widget.settingsBtnHovered ? data.settingsBtnSize * 1.2 : data.settingsBtnSize)
			.style('cursor', 'pointer')
			.on('click', () => {toggleModal()})
			.on('mouseenter', function () {
				d3.select(this)
					.attr('height', data.settingsBtnSize * 1.2)
					.attr('width', data.settingsBtnSize * 1.2)
					.attr('x', (data.graphicWidth - (data.settingsBtnSize * 1.2)) - halfOfDifferenceInSizeForPosGrowth)
					.attr('y', data.margin.top * 2)
			})
			.on('mouseout', function () {
				d3.select(this)
				.attr('height', data.settingsBtnSize)
				.attr('width', data.settingsBtnSize)
				.attr('x', data.graphicWidth - (data.settingsBtnSize * 1.2))
				.attr('y', (data.margin.top * 2) + halfOfDifferenceInSizeForPosGrowth)
			})
		
		const modalGroup = widget.svg.append('g')
			.attr('class', 'modalGroup')
			.attr('transform', 	`translate(${(data.graphicWidth / 2) - (data.modalWidth / 2)},${(data.margin.top)})`)

		function removeModal (rerenderAfter) {
			resetElements(widget.outerDiv, '.modalDiv')
			resetElements(widget.outerDiv, '.overlayDiv')
			widget.svg.select('.modalBackgroundRect')
				.transition()
					.attr('height', 0)
					.attr('width', 0)
					.attr('x', data.modalWidth / 2)
					.attr('y', data.modalHeight / 2)
					.remove()
					.on('end', () => {
						if (rerenderAfter) render(true);
					})
		}

		function renderModal () {

			// make box of background color with slight opacity to blur background and then add modal on top
			const overlay = widget.outerDiv.append('div')
				.attr('class', 'overlayDiv')
				.style('position', 'absolute')
				.style('top', '0px')
				.style('height', data.jqHeight + 'px')
				.style('width', data.jqWidth + 'px')
				.style('background-color', widget.modalActive ? data.backgroundColor : 'none')
				.style('opacity', 0)
				.on('mousedown', function(){
					d3.event.stopPropagation()
					toggleModal()
				})
				.transition()
					.style('opacity', 0.7)

			// modal background rect
			modalGroup.append('rect')
				.attr('class', 'modalBackgroundRect')
				.attr('fill', data.backgroundColor)
				.attr('stroke', 'black')
				.attr('stroke-width', '2pt')
				.attr('rx', data.modalWidth * 0.05)
				.on('mousedown', function(){d3.event.stopPropagation()})
				.on('click', function(){d3.event.stopPropagation()})
				.attr('height', 0)
				.attr('width', 0)
				.attr('x', data.modalWidth / 2)
				.attr('y', data.modalHeight / 2)
				.transition()
					.attr('x', 0)
					.attr('y', 0)
					.attr('height', data.modalHeight)
					.attr('width', data.modalWidth)
					.on('end', function () {
						renderModalDiv()
					})

			function renderModalDiv() {
				const verticalModalPadding = (data.modalHeight - ( (data.paddingAboveDropdown * 4) + (getTextHeight(data.modalInputFont) * 3) + (25) + (data.modalLabelsHeight * 2) )) / 4

				//modal div
				const modalDiv = widget.outerDiv.append('div')
					.attr('class', 'modalDiv')
					.style('position', 'absolute')
					.style('width', data.modalWidth)
					.style('left', (data.paddingLeftOfDivs + (data.graphicWidth / 2) - (data.modalWidth / 2)) + 'px')
					.style('top', (data.margin.top * 2) + 'px')
			
				const form = modalDiv.append('form')
					.attr('class', 'modalForm')
					.style('position', 'relative')
					.style('width', data.modalWidth + 'px')
					.style('height', data.modalHeight + 'px')
					.on('submit', function () {
						d3.event.preventDefault()
						if (widget.tempMaxSelection - widget.tempMinSelection < 20) {
							alert('Temperature range between minimum and maximum must be at least 20°. Please input a lower minimum or higher maximum temperature.')
						} else if (widget.kwTrMinSelection < 0) {
							alert('Minimum kW/tR selection may not be a negative number. Please input a higher minimum kW/tR.')
						} else if (widget.kwTrMinSelection >= widget.kwTrMaxSelection) {
							alert('Minimum kW/tR selection must be less than maximum kW/tR selection. Please input a lower minimum kW/tR or higher maximum kW/tR.')
						} else {
							handleSubmit()
						}
					})
					.on('reset', function () {
						d3.select(this).select('.maxTempBinInput')
							.attr('value', data.maxTempCategory)
						d3.select(this).select('.minTempBinInput')
							.attr('value', data.minTempCategory)
						d3.select(this).select('.maxKwTrBinInput')
							.attr('value', data.maxKwTrCategory)
						d3.select(this).select('.minKwTrBinInput')
							.attr('value', data.minKwTrCategory)
						widget.tempMinSelection = data.minTempCategory;
						widget.tempMaxSelection = data.maxTempCategory;
						widget.tempNumOfBins = data.numOfTempBins;
						widget.kwTrMinSelection = data.minKwTrCategory;
						widget.kwTrMaxSelection = data.maxKwTrCategory;
						resetElements(svgForDropdown, '.dropdownGroup')
						renderBinsDropbox();
					})
				
				// ROW ONE
				form.append('h4')
					.attr('class', 'formElement')
					.text('Min Temperature')
					.style('color', data.dropdownTitleColor)
					.style('font', data.modalLabelsFont)
					.style('left', (data.paddingBetweenTempInputs) + 'px')
					.style('top', verticalModalPadding + 'px')
					.style('position', 'absolute')

				form.append('h4')
					.attr('class', 'formElement')
					.text('Max Temperature')
					.style('color', data.dropdownTitleColor)
					.style('font', data.modalLabelsFont)
					.style('left', (data.paddingBetweenTempInputs * 2) + data.minTempLabelWidth + 'px')
					.style('top', verticalModalPadding + 'px')
					.style('position', 'absolute')

				form.append('h4')
					.attr('class', 'formElement')
					.text('# of Temperature Bins')
					.style('color', data.dropdownTitleColor)
					.style('font', data.modalLabelsFont)
					.style('position', 'absolute')
					.style('right', (data.paddingBetweenTempInputs) + 'px')
					.style('top', verticalModalPadding + 'px');


				// ROW TWO
				form.append('input')
					.attr('class', 'formElement minTempBinInput')
					.attr('type', 'text')
					.attr('name', 'minTempBinInput')
					.attr('value', widget.tempMinSelection)
					.style('width', data.modalInputWidth + 'px')
					.style('border-radius', '5px')
					.style('font', data.modalInputFont)
					.style('color', data.dropdownTextColor)
					.style('border', widget.minInputHovered ? `1.5px solid ${data.hoveredInputStrokeColor}` : `1.5px solid ${data.dropdownStrokeColor}`)
					.style('padding', '2px')
					.style('background-color', data.dropdownFillColor)
					.style('left', ((data.paddingBetweenTempInputs + (data.minTempLabelWidth / 2)) - (data.modalInputWidth / 2)) + 'px')
					.style('top', (verticalModalPadding + data.modalLabelsHeight + (data.paddingAboveDropdown * 2)) + 'px')
					.style('position', 'absolute')
					.style('text-align', 'center')
					.on('mouseover', function () {
						widget.minInputHovered = true;
						d3.select(this).style('border', `1.5px solid ${data.hoveredInputStrokeColor}`)
					})
					.on('mouseout', function () {
						widget.minInputHovered = false;
						d3.select(this).style('border', `1.5px solid ${data.dropdownStrokeColor}`)
					})
					.on('change', function () {
						widget.tempMinSelection = +d3.select(this).property("value");
					});

				form.append('input')
					.attr('class', 'formElement maxTempBinInput')
					.attr('type', 'text')
					.attr('name', 'maxTempBinInput')
					.attr('value', widget.tempMaxSelection)
					.style('width', data.modalInputWidth + 'px')
					.style('border-radius', '5px')
					.style('font', data.modalInputFont)
					.style('color', data.dropdownTextColor)
					.style('border', widget.maxInputHovered ? `1.5px solid ${data.hoveredInputStrokeColor}` : `1.5px solid ${data.dropdownStrokeColor}`)
					.style('padding', '2px')
					.style('background-color', data.dropdownFillColor)
					.style('left', (((data.paddingBetweenTempInputs * 2) + data.minTempLabelWidth + (data.maxTempLabelWidth / 2)) - (data.modalInputWidth / 2)) + 'px')
					.style('top', (verticalModalPadding + data.modalLabelsHeight + (data.paddingAboveDropdown * 2)) + 'px')
					.style('position', 'absolute')
					.style('text-align', 'center')
					.on('mouseover', function () {
						widget.maxInputHovered = true;
						d3.select(this).style('border', `1.5px solid ${data.hoveredInputStrokeColor}`)
					})
					.on('mouseout', function () {
						widget.maxInputHovered = false;
						d3.select(this).style('border', `1.5px solid ${data.dropdownStrokeColor}`)
					})
					.on('change', function () {
						widget.tempMaxSelection = +d3.select(this).property("value");
					});

				
				const svgForDropdown = form.append('svg')
					.attr('width', (data.modalInputWidth) + 15)
					.style('position', 'absolute')
					.attr('height', getTextHeight(data.dropdownTextFont) + 20 )
					.style('z-index', 2)
					.attr('fill', 'none')
					.style('left', (((data.paddingBetweenTempInputs * 3) + data.minTempLabelWidth + data.maxTempLabelWidth + (data.numTempBinsLabelWidth / 2)) - (data.modalInputWidth / 2)) + 'px')
					.style('top', (verticalModalPadding + data.modalLabelsHeight + (data.paddingAboveDropdown * 2)) + 'px')

				function funcOnOpen() {
					svgForDropdown.transition().attr('height', data.graphicHeight)
				}
				function funcOnClose() {
					svgForDropdown.transition().attr('height', getTextHeight(data.dropdownTextFont) + 20)
				}
				function renderBinsDropbox (){
					makeDropdown([12, 11, 10, 9, 8, 7, 6, 5, 4], val => {widget.tempNumOfBins = +val}, svgForDropdown, 2.5, 2.5, false, data.modalInputWidth, 2, 2, data.dropdownStrokeColor, data.dropdownFillColor, '#d5d6d4', data.dropdownTextFont, data.dropdownTextColor, +widget.tempNumOfBins, funcOnOpen, funcOnClose, []);
				}
				renderBinsDropbox();

				// // ROW THREE

			form.append('h4')
				.attr('class', 'formElement')
				.text('Min kW/tR')
				.style('color', data.dropdownTitleColor)
				.style('font', data.modalLabelsFont)
				.style('left', (data.paddingBetweenKwTrInputs) + 'px')
				.style('top', ( (verticalModalPadding * 2) + (data.modalLabelsHeight) + 10 + (getTextHeight(data.modalInputFont)) + (data.paddingAboveDropdown * 2) ) + 'px')
				.style('position', 'absolute')

			form.append('h4')
				.attr('class', 'formElement')
				.text('Max kW/tR')
				.style('color', data.dropdownTitleColor)
				.style('font', data.modalLabelsFont)
				.style('right', (data.paddingBetweenKwTrInputs) + 'px')
				.style('top', ( (verticalModalPadding * 2) + (data.modalLabelsHeight) + 10 + (getTextHeight(data.modalInputFont)) + (data.paddingAboveDropdown * 2) ) + 'px')
				.style('position', 'absolute')


				// // ROW FOUR
				form.append('input')
					.attr('class', 'formElement minKwTrBinInput')
					.attr('type', 'text')
					.attr('name', 'minKwTrBinInput')
					.attr('value', widget.kwTrMinSelection)
					.style('width', data.modalInputWidth + 'px')
					.style('border-radius', '5px')
					.style('font', data.modalInputFont)
					.style('color', data.dropdownTextColor)
					.style('border', `1.5px solid ${data.dropdownStrokeColor}`)
					.style('padding', '2px')
					.style('background-color', data.dropdownFillColor)
					.style('left', ((data.paddingBetweenKwTrInputs + (data.minKwTrLabelWidth / 2)) - (data.modalInputWidth / 2)) + 'px')
					.style('top', (((verticalModalPadding * 2) + (data.modalLabelsHeight * 2) + 10 + (getTextHeight(data.modalInputFont)) + (data.paddingAboveDropdown * 4) - 2.5)) + 'px')
					.style('position', 'absolute')
					.style('text-align', 'center')
					.on('mouseover', function () {
						d3.select(this).style('border', `1.5px solid ${data.hoveredInputStrokeColor}`)
					})
					.on('mouseout', function () {
						d3.select(this).style('border', `1.5px solid ${data.dropdownStrokeColor}`)
					})
					.on('change', function () {
						widget.kwTrMinSelection = +d3.select(this).property("value");
					});

				form.append('input')
					.attr('class', 'formElement maxKwTrBinInput')
					.attr('type', 'text')
					.attr('name', 'maxKwTrBinInput')
					.attr('value', widget.kwTrMaxSelection)
					.style('width', data.modalInputWidth + 'px')
					.style('border-radius', '5px')
					.style('font', data.modalInputFont)
					.style('color', data.dropdownTextColor)
					.style('border', `1.5px solid ${data.dropdownStrokeColor}`)
					.style('padding', '2px')
					.style('background-color', data.dropdownFillColor)
					.style('left', (((data.paddingBetweenKwTrInputs * 2) + data.minKwTrLabelWidth + (data.maxKwTrLabelWidth / 2)) - (data.modalInputWidth / 2)) + 'px')
					.style('top', (((verticalModalPadding * 2) + (data.modalLabelsHeight * 2) + 10 + (getTextHeight(data.modalInputFont)) + (data.paddingAboveDropdown * 4) - 2.5)) + 'px')
					.style('position', 'absolute')
					.style('text-align', 'center')
					.on('mouseover', function () {
						d3.select(this).style('border', `1.5px solid ${data.hoveredInputStrokeColor}`)
					})
					.on('mouseout', function () {
						d3.select(this).style('border', `1.5px solid ${data.dropdownStrokeColor}`)
					})
					.on('change', function () {
						widget.kwTrMaxSelection = +d3.select(this).property("value");
					});



				// ROW FIVE
				form.append('button')
					.attr('class', 'formElement')
					.attr('type', 'submit')
					.style('cursor', 'pointer')
					.text('OK')
					.style('width', getTextWidth('OK', data.modalInputFont) + 30 + 'px')
					.style('border-radius', '5px')
					.style('font', data.modalInputFont)
					.style('font-weight', 'bold')
					.style('border', widget.modalSubmitHovered ? `1.5px solid ${data.hoveredInputStrokeColor}` : 'none')
					.style('padding-top', '2.5px')
					.style('padding-bottom', '2.5px')
					.style('background-color', data.hoveredInputStrokeColor)
					.style('position', 'absolute')
					.style('text-align', 'center')
					.style('left', widget.modalSubmitHovered ? (((data.modalWidth / 2) - ((getTextWidth('OK', data.modalLabelsFont) + 30) / 2)) - 0.75) + 'px' : ((data.modalWidth / 2) - ((getTextWidth('OK', data.modalLabelsFont) + 30) / 2)) + 'px')
					.style('top', widget.modalSubmitHovered ? (( (verticalModalPadding * 3) + (data.modalLabelsHeight * 2) + 20 + (getTextHeight(data.modalInputFont) * 2) + (data.paddingAboveDropdown * 4) ) - 0.75) + 'px' : ( (verticalModalPadding * 3) + (data.modalLabelsHeight * 2) + 20 + (getTextHeight(data.modalInputFont) * 2) + (data.paddingAboveDropdown * 4) ) + 'px')
					.on('mouseover', function () {
						widget.modalSubmitHovered = true;
						d3.select(this)
							.style('border', `1.5px solid ${data.hoveredInputStrokeColor}`)
							.style('width', getTextWidth('OK', data.modalInputFont) + 31.5 + 'px')
							.style('left', (((data.modalWidth / 2) - ((getTextWidth('OK', data.modalLabelsFont) + 30) / 2)) - 0.75) + 'px')
							.style('top', (( (verticalModalPadding * 3) + (data.modalLabelsHeight * 2) + 20 + (getTextHeight(data.modalInputFont) * 2) + (data.paddingAboveDropdown * 4) ) - 0.75) + 'px')
						})
					.on('mouseout', function () {
						widget.modalSubmitHovered = false;
						d3.select(this)
							.style('border', 'none')
							.style('left', ((data.modalWidth / 2) - ((getTextWidth('OK', data.modalLabelsFont) + 30) / 2)) + 'px')
							.style('width', getTextWidth('OK', data.modalInputFont) + 30 + 'px')
							.style('top', ( (verticalModalPadding * 3) + (data.modalLabelsHeight * 2) + 20 + (getTextHeight(data.modalInputFont) * 2) + (data.paddingAboveDropdown * 4) ) + 'px')
						})

				form.append('button')
					.attr('class', 'formElement')
					.attr('type', 'reset')
					.text('reset')
					.style('width', getTextWidth('reset', data.modalInputFont) + 20 + 'px')
					.style('border', 'none')
					.style('border-radius', '5px')
					.style('font', data.modalInputFont)
					.style('padding-top', '2px')
					.style('padding-bottom', '2px')
					.style('background-color', data.tooltipFillColor)
					.style('position', 'absolute')
					.style('cursor', 'pointer')
					.style('text-align', 'center')
					.style('z-index', 1)
					.style('left', (data.margin.left + 0.75) + 'px')
					.style('bottom', (data.margin.bottom) + 'px')
					.on('mouseover', function () {
						d3.select(this)
							.style('border', `1.5px solid ${data.tooltipFillColor}`)
							.style('left', (data.margin.left) + 'px')
							.style('bottom', (data.margin.bottom - 0.75) + 'px')	
						})
					.on('mouseout', function () {
						d3.select(this)
							.style('border', 'none')
							.style('left', (data.margin.left + 0.75) + 'px')
							.style('bottom', (data.margin.bottom) + 'px')
						})



				widget.outerDiv.selectAll('.formElement')
					.style('margin', '0px')
			}
		}

		function toggleModal (rerenderAfter) {
			widget.modalActive = !widget.modalActive;
			if (widget.modalActive) {
				renderModal()
			} else {
				removeModal(rerenderAfter)
			}
		}

		function handleSubmit () {
			if (widget.minTempCategory === widget.tempMinSelection
					&& widget.maxTempCategory === widget.tempMaxSelection
					&& widget.numOfTempBins === widget.tempNumOfBins
					&& widget.minKwTrCategory === widget.kwTrMinSelection
					&& widget.maxKwTrCategory === widget.kwTrMaxSelection
				){
				toggleModal();
			} else {
				widget.minTempCategory = widget.tempMinSelection;
				widget.maxTempCategory = widget.tempMaxSelection;
				widget.numOfTempBins = widget.tempNumOfBins;
				widget.minKwTrCategory = widget.kwTrMinSelection;
				widget.maxKwTrCategory = widget.kwTrMaxSelection;
				toggleModal(true);
			}
		}


		// ********************************************* NON-SVG STYLING ******************************************************* //
		widget.outerDiv.selectAll('*')
			.style('margin', '0px')
			.style('padding', '0px')

		widget.outerDiv.select('.yearSelect')
			.style('padding-left', '5px')





			
		// ********************************************* FUNCS ******************************************************* //
				function attemptHoverRect (d, i, nodes, that) {
					if (widget.pinnedRectIndex === 'none') hoverRect(d, i, nodes, that);
				}
				function hoverRect (d, i, nodes, that) {
					unhoverRects();
					widget.hoveredRectIndex = i;
					d3.select('.' + nodes[i].parentNode.__data__.thisMonth + 'MonthlyGroup').raise();
					const hoveredRect = d3.select(that);
					hoveredRect.raise();
					hoveredRect
						.attr('stroke-width', '2pt')
						.transition()
							.duration(100)
							.attr('width', data.hoveredCellWidth)
							.attr('height', data.hoveredCellHeight)
							.attr('x', (data.cellWidth - data.hoveredCellWidth) / 2)
							.attr('y', d => yScale(d.thisTempBin.display) + ((data.cellHeight - data.hoveredCellHeight) / 2))
						.transition()
							.duration(100)
							.attr('width', data.cellWidth)
							.attr('height', data.cellHeight)
							.attr('x', 0)
							.attr('y', d => yScale(d.thisTempBin.display))

					widget.tooltipActive = true;
					widget.ttMonth = nodes[i].parentNode.__data__.thisMonth +':';
					widget.ttTemp = d.thisTempBin.display + data.tempUnits;
					widget.ttHours = d.totalHoursInBin + ' Hours';
					widget.ttEff = d.avgEffInBin + ' kW/tR';

					ttRect.style('opacity', widget.tooltipActive ? 1 : 0);
					ttMonthText.text(widget.ttMonth);
					ttTempText.text(widget.ttTemp);
					ttHrsText.text(widget.ttHours);
					ttEffText.text(widget.ttEff);
				}
			function attemptUnhoverRects (d, i, nodes, that) {
				if (widget.pinnedRectIndex === 'none') unhoverRects(d, i, nodes, that)
			}
			function unhoverRects () {
				widget.hoveredRectIndex = 'none';
				widget.svg.selectAll('.cell')
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
			}
			function unpinAll (d, i, nodes, that) {
				widget.pinnedRectIndex = 'none';
				unhoverRects(d, i, nodes, that);
			}
			function pinRect (d, i, nodes, that) {
				unhoverRects(d, i, nodes, that)
				widget.pinnedRectIndex = i;
				hoverRect(d, i, nodes, that);
			}
			console.log(data);
	};
	









	////////////////////////////////////////////////////////////////
		// Render Func
	////////////////////////////////////////////////////////////////
	const render = function(settingsChanged) {
		let theData = setupDefinitions();
		if (settingsChanged || !widget.data || needToRedrawWidget(widget, theData)) {
			widget.data = theData;
			renderWidget(theData);
		} else {
			console.log('data not changed enough to redraw widget');
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



