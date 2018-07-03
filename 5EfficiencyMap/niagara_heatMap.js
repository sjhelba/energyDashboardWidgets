define(['bajaux/Widget', 'bajaux/mixin/subscriberMixIn', 'nmodule/COREx/rc/d3/d3.min'], function(Widget, subscriberMixIn, d3) {
	"use strict";

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
	render(widget, true);
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
		// add month's monthObj with data to hrsPerTempRangePerMonth
		hrsPerTempRangePerMonth.push(monthObj);
	});
	// calculate avg eff, opacity, and colorScaleVal for each bin in each month
	hrsPerTempRangePerMonth.forEach(month => {
		month.tempBinsForMonth.forEach(bin => {
			bin.avgEffInBin = bin.totalEffInBin / bin.totalHoursInBin ? +formatKwTrFunc(bin.totalEffInBin / bin.totalHoursInBin) : 0;
			bin.opacity = bin.totalHoursInBin ? 1 : 0;
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
	function makeDropdown(arrOfOptions, funcToRunOnSelection, elementToAppendTo, x, y, leftAligned, minDropdownWidth, horizontalPadding, verticalPadding, strokeColor, backgroundFill, hoveredFill, font, textColor, defaultSelection, funcToRunOnOpen, funcToRunOnClose, arrOfArgsToPassInToFuncsAfterVal) {
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

	var CxEfficiencyMap = function() {
		var that = this;
		Widget.apply(this, arguments);

		that.properties().addAll([
		/* COLORS */
			//fills
			{
				name: 'backgroundColor',
				value: 'rgb(245,245,245)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'gridFillColor',
				value: 'rgb(245,245,245)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'minKwTrColor',
				value: 'rgb(105,202,210)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'maxKwTrColor',
				value: 'rgb(54,64,78)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'dropdownFillColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'hoveredDropdownFill',
				value: '#d5d6d4',
				typeSpec: 'gx:Color'
			},
			{
				name: 'tooltipFillColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			//strokes
			{
				name: 'gridStrokeColor',
				value: 'rgb(192,192,192)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'dropdownStrokeColor',
				value: 'black',
				typeSpec: 'gx:Color'
			},
			{
				name: 'hoveredInputStrokeColor',
				value: 'rgb(4,179,216)',
				typeSpec: 'gx:Color'
			},
			//text
			{
				name: 'xAxisTicksTextColor',
				value: 'rgb(64,64,64)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'yAxisTicksTextColor',
				value: 'rgb(64,64,64)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'yAxisTitleColor',
				value: 'rgb(64,64,64)',
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
				value: 'rgb(64,64,64)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'tooltiptempColor',
				value: 'rgb(64,64,64)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'tooltipHrsColor',
				value: 'rgb(64,64,64)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'tooltipKwTrColor',
				value: 'rgb(64,64,64)',
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
				name: 'paddingLeftOfDropdown',				
				value: 10
			},
			{
				name: 'paddingBelowDropdown',				
				value: 10
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
			}
		]);



		subscriberMixIn(that);
	};

	CxEfficiencyMap.prototype = Object.create(Widget.prototype);
	CxEfficiencyMap.prototype.constructor = CxEfficiencyMap;



////////////////////////////////////////////////////////////////
	// /* SETUP DEFINITIONS AND DATA */
////////////////////////////////////////////////////////////////


	const setupDefinitions = widget => {

		// FROM USER // 
		const data = widget.properties().toValueMap();	//obj with all exposed properties as key/value pairs

		// FROM JQ //
		const jq = widget.jq();
		data.jqWidth = jq.width() || 565;
		data.jqHeight = jq.height() || 315;


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

		// GET HISTORY DATA
		return Promise.all([widget.resolve(`history:^System_WbtHh`), widget.resolve(`history:^System_MsEffHh`)])
			.then(histories => {
				const [tempHistoryTable, effHistoryTable] = histories;
				data.tempPrecision = !data.overrideDefaultTempPrecisionWFacets ? 0 : tempHistoryTable.getCol('value').getFacets().get('precision') || 0;
				data.kwTrPrecision = !data.overrideDefaultKwTrPrecisionWFacets ? 3 : effHistoryTable.getCol('value').getFacets().get('precision') || 3;
				data.tempUnits = tempHistoryTable.getCol('value').getFacets().get('units') || '°F';
				const cursorPromises = [

					effHistoryTable.cursor({
						limit: 5000000,
						each: function(row, index) {
							const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
							const rowValue = +row.get('value');
							const rowYear = timestamp.getFullYear();
							const rowMonth = months[timestamp.getMonth()];
							const rowDate = timestamp.getDate();
							const rowHour = timestamp.getHours();
							const rowDateHr = [rowDate, rowHour];

							if (!data.hourlyData[rowYear]) {
								data.hourlyData[rowYear] = {};
								data.availableYears.unshift(rowYear)
							}
							if (!data.hourlyData[rowYear][rowMonth]) {
								data.hourlyData[rowYear][rowMonth] = {monthObj: {}, hoursArr: []};
							}
							data.hourlyData[rowYear][rowMonth].monthObj[rowDateHr] = {eff: rowValue, temp: undefined};
						}
					}),

					tempHistoryTable.cursor({
						limit: 5000000,
						each: function(row, index) {
							const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
							const rowValue = +row.get('value');
							const rowYear = timestamp.getFullYear();
							const rowMonth = months[timestamp.getMonth()];
							const rowDate = timestamp.getDate();
							const rowHour = timestamp.getHours();
							const rowDateHr = [rowDate, rowHour];

							// if there is already eff data for that hour, add temp data for that hour
							if (data.hourlyData[rowYear] && data.hourlyData[rowYear][rowMonth] && data.hourlyData[rowYear][rowMonth].monthObj[rowDateHr]) {
								data.hourlyData[rowYear][rowMonth].monthObj[rowDateHr].temp = rowValue;
							}
						}
					})
				];
				return Promise.all(cursorPromises);
			})
			.catch(err => console.error('error finding or iterating through CxEfficiencyMap histories: ' + err))
			.then(() => {
				// format data for better d3 consumption
				data.availableYears.forEach(yearKey => {
					const monthKeys = Object.keys(data.hourlyData[yearKey]);
					monthKeys.forEach(monthKey => {
						//filter out any hours that are missing temp data
						const hoursInMonth = Object.keys(data.hourlyData[yearKey][monthKey].monthObj);
						hoursInMonth.forEach(hr => {
							if (!data.hourlyData[yearKey][monthKey].monthObj[hr].temp) delete data.hourlyData[yearKey][monthKey].monthObj[hr];
						})
						//convert collected hours to array format within overall data obj
						data.hourlyData[yearKey][monthKey].hoursArr = d3.values(data.hourlyData[yearKey][monthKey].monthObj);
					})
				});

				// CALCULATED DEFS //
				if (!widget.dropdownYearSelected) widget.dropdownYearSelected = data.availableYears[0];

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
				for (let i = 0; i <= (widget.numOfTempBins - 3); i++) { // 9 if 12 bins
					let bin = {};
					bin.min = widget.minTempCategory + (data.tempBinsInterval * i);
					bin.max = (bin.min + data.tempBinsInterval) - 0.00000000000000000000000000000000000001;
					bin.display = data.formatTemp(bin.min) + '-' + data.formatTemp(((bin.min + data.tempBinsInterval)));
					data.tempBins.push(bin);
				}
				data.tempBins.push({min: widget.maxTempCategory, max: Number.POSITIVE_INFINITY, display: '≥' + data.formatTemp(widget.maxTempCategory)})
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

				// return data
				return data;
			})
			.catch(err => console.error('Error for CxEfficiencyMap (history calculations promise rejected): ' + err));
	};




////////////////////////////////////////////////////////////////
	// Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
////////////////////////////////////////////////////////////////

	const renderWidget = (widget, data) => {
		// ********************************************* DRAW ******************************************************* //
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
		makeDropdown(data.availableYears.map(yr => +yr), dropdownYearChanged, widget.svg, data.margin.left, data.margin.top, true, data.dropdownWidth, 5, 3, data.dropdownStrokeColor, data.dropdownFillColor, data.hoveredDropdownFill, data.dropdownTextFont, data.dropdownTextColor, +widget.dropdownYearSelected, () => {}, () => {}, [widget]);


		// ********************************************* TOOLTIP ******************************************************* //
		const tooltipGroup = chartGroup.append('g')
			.attr('class', 'tooltipGroup')
			.attr('transform', `translate(${(data.yAxisTextAreaWidth + data.gridWidth) - data.tooltipWidth}, ${-(data.tooltipHeight + data.paddingBelowDropdown)})`)

		const ttRect = tooltipGroup.append('rect')
			.attr('height', data.tooltipHeight)
			.attr('width', data.tooltipWidth)
			.attr('fill', data.tooltipFillColor)
			.attr('rx', data.tooltipHeight * 0.1)
			.style('opacity', widget.tooltipActive ? 0.9 : 0)

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
				.attr('class', 'monthlyGroup')
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
				.on('mousedown', function() {
					d3.event.stopPropagation()
				})
				.on('click', function(d, i, nodes) {
					if (widget.pinnedRectIndex === i) {
						unpinAll();
					} else {
						pinRect(d, i, nodes, this);
					}
				})
				.on('mouseover', function(d, i, nodes) {
					attemptHoverRect(d, i, nodes, this)
				})
				.on('mouseout', function(d, i, nodes) {
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
			.attr('xlink:href', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAHWmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTA0LTA4VDIyOjAxOjE5LTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wNS0wMVQxNDo0NjoyNy0wNDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNS0wMVQxNDo0NjoyNy0wNDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1ZWI0NjExNC1mNWQwLWFlNDgtYmIyYS01MjdiZjA1MTdkMTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OWMwNzgzZTAtNjMwZC01YTQ5LTllMTUtZjAyNmI2OGFhZGM2IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OWMwNzgzZTAtNjMwZC01YTQ5LTllMTUtZjAyNmI2OGFhZGM2Ij4gPHBob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPHJkZjpCYWc+IDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjFmOThiNTlhLWE5NjctMWU0Yi05MzhmLTAzMTE0YTA3MjhlZDwvcmRmOmxpPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjljMDc4M2UwLTYzMGQtNWE0OS05ZTE1LWYwMjZiNjhhYWRjNiIgc3RFdnQ6d2hlbj0iMjAxOC0wNC0wOFQyMjowMToxOS0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiYzgyYTUzMS1iMTYwLTA2NGEtOWQ4OS04YjFlOGRiYTFjYTgiIHN0RXZ0OndoZW49IjIwMTgtMDUtMDFUMTQ6MTA6MDEtMDQ6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NWViNDYxMTQtZjVkMC1hZTQ4LWJiMmEtNTI3YmYwNTE3ZDE1IiBzdEV2dDp3aGVuPSIyMDE4LTA1LTAxVDE0OjQ2OjI3LTA0OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJB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AEopmyUZJ3VojceGNddcMxtssEHWX3/9jB49OqNGjcpqq63W0t/Xo48+mttuuy233nprbrvtttx+++254447Mn36dD90aA1/rLW+WwEACgCg+QXAJUneInVonoUWWigbb7xxxo4dm7Fjx+ZNb3pTllxyyY743l944YVcd911ueqqqzJu3Lhcc801efbZZx0U0Fxb1FqvUgCAAgBoaAFQStkmycUSh2YYNmxYttxyy7ztbW/LFltskQ033DBDhgwRTPeC//bbb8+4cePy5z//OX/5y18UAtAsl9Zat1YAgAIAaG4BcHWSN0kcBs4aa6yR7bffPu94xzvylre8JQsttJBQ5sKMGTNy9dVX5/zzz8/555+fW265xVAAA2/7Wuv5CgBQAAANKwBKKe9Kco60oX8tsMAC2XzzzbPLLrtkhx12yOqrry6UXvDEE0/kwgsvzBlnnJELL7ww06ZNEwr0vxuSjKm19ukwYNYABQAoAOZt+B+U5MYkG0ob+uecHjNmTHbdddfsueeeed3rXieUPvT000/nD3/4Q04//fT85S9/UQZA/9qh1nqeAgAUAEBzCoD3JjlT0tC33vCGN2SfffbJrrvumhVXXFEgA1QGnHnmmTnllFNyxRVXGByg711Ta91MAQAKAKABBYBn/6FvLbrootljjz1ywAEHZOONNxZIg/ztb3/Lcccdl5NOOilPPPGEQKDv9OkuALMGKABAATD3BcD2Sc6VMvSuTTfdNAceeGB22223LLLIIgJpsOnTp+ecc87JCSeckAsuuCAzZ84UCvSuPt0FYNYABQAoAOa+AHDnf+glQ4cOzV577ZVPfvKTGTVqlEBa0MMPP5yf/OQnOfbYY72sIPSuPtsFYNYABQAoAOZu+PfsP/SCESNG5EMf+lA+9rGPZbnllhNIG5gyZUqOO+64HH300Xn44YcFAj03rtY6VgEACgBg4AqAy5JsKWGYP6uttlo++clPZv/997fNv03NmDEjv/vd7/LDH/4wN9xwg0CgZ7autV6qAAAFANDPBUApZWySK6UL827kyJE55JBDsuuuu2aBBRYQSIe48MIL841vfCNXX321MGD+nF9r3V4BAAoAoP8LgD8k2VG6MPfWWWedHHroodltt936/OU5aa7LL788hx9+eK666iphwLx7Y631rwoAUAAA/VQAlFLWS3K7ZGHurLTSSjnssMOy7777ZvDgwQIhSXLuuefmK1/5Sm6++WZhwNz7ba11TwUAKACA/isAfplkf8nCa1tiiSXyxS9+MR/96EczdOhQgfCKg8epp56aww8/PA899JBAYC5OmyRr11rvUwCAAgDo4wKglLJSkvuTDJEsvLIhQ4bkwx/+cA455JCMGDFCIMzR1KlTc/TRR+eII47I5MmTBQKv7Ue11v9UAIACAOj7AuCIJJ+TKryyt7/97fne976XtddeWxjMs6eeeipf/OIX8+tf/9pQAq/uhSQr1VonKQCg/bg9MjREKWV4kg9JAv7dyiuvnN/85jc555xzDP/Mt2WWWSbHHHNMLr300rzxjW8UCLyyhZN8VAygAAD61geSLCEG+P8WXHDB/Nd//Vduuumm7LTTTgKhV2y66aa54oor8t3vfjeLLrqoQODffbyU4uYq0IZcAgA9PYl64RKAUsoCSe5JsoZEocvGG2+cn/zkJxk9erQw6DN///vf86lPfSpnn322MOBffbDWekJPP4hZA5rFDgBohvcY/qHLsGHD8s1vfjOXXXaZ4Z8+t8IKK+S0007LCSec4KaS8K8+KQJoP3YAQE9Pot7ZAXBxkm2kSacbM2ZMjj32WNf5MyAmTpyYj3/84znrrLOEAV22qLVe1ZMPYNaAZrEDAAZYKWU9wz+dbsiQIfnyl7+cSy65xPDPgFlqqaVy6qmn5thjj81iiy0mELALANqOHQDQ05OohzsASilHJ/m4JOlUa665Zn75y19m4403FgaN8fDDD+f9739/rrrqKmHQyaYlWaXW+tj8fgCzBjSLHQAwgEopiyZ5vyToVPvss0+uueYawz+Ns9JKK+Wiiy7KIYccksGDBwuETjUkyUfEAO3DDgDo6UnUgx0ApZSPJzlainSaRRZZJEcddVT22WcfYdB4l19+efbbb788/vjjwqATPZFkpVrrtPl5Z7MGNIsdADCwbP2n46yzzjq54oorDP+0jC233DLXXnttttpqK2HQiZZL16sVAQoAYH6VUrZMMlISdJJddtklV155ZUaOdOjTWpZddtmcd955+cxnPtMrr/4CLebDIgAFANAzB4qATjF48OB87Wtfy8knn5zhw4cLhNZcNC2wQL7xjW/kpJNOyiKLLCIQOsnbSymriwFan3sAQE9Povl4JqiUskSSR5MsJEHa3eKLL54TTzwx2223nTBoG7fddlt23XXXPPjgg8KgU3yr1nrIvL6TWQOaxQ4AGBj7Gf7pBKuuumouvfRSwz9tZ9SoUbnyyiuz2WabCYNOcUApZYgYQAEAzDvb/2l7Y8eOzZVXXpl1111XGLSlpZdeOueff3722msvYdAJlkvyLjGAAgCYB6WUTZK8QRK0s1122SXnnntullpqKWHQ7o/pOeGEE/L5z39eGHSCD4gAFADAvHm/CGhnn/jEJ/KrX/0qpRRh0DG+9rWv5Yc//GEGDx4sDNrZu0opy4kBFADAXCilDE2ytyRoR4MGDcrXv/71HHnkkVlgAb9e6DwHHXRQTj755AwdOlQYtKsFk+wrBlAAAHPn3UnsiabtDB48OEcffXQ++9nPCoOOttNOO+X3v/+9lwmknX1QBKAAAObOB0RAuxk6dGiOPfbYHHige1tCkmyzzTY577zzsvjiiwuDdjSqlPJGMYACAHgNpZRlkuwgCdpt+D/llFPcBR1mM2bMmJx33nlZeumlhUE7ep8IQAEAvLY90nXtHLTV8P+ud3lVKHglG220Uc4//3wlAO1or1KKO16CAgB4DfuIAMM/dJb1119fCUA7Wj7JNmIABQDwCkopqyQZKwkM/9CZJcC5557rngC0G68GAAoA4FV46T/awuDBg3Psscca/mEebbDBBjnnnHOy2GKLCYN2sUspZZgYQAEA/Dvb/2l5gwYNylFHHZXdd99dGDAfxowZk9NOOy3DhpmZaAuLJdEGgwIAeLlSysgkG0iCVvc///M/OeCAAwQBPfCWt7wlv/rVrzJ4sPun0RY0wqAAAGazmwhodZ/4xCfy2c9+VhDQC9797nfn6KOPFgRtcTiXUhYSAygAgP9vDxHQynbdddccccQRgoBe9MEPfjCHHnqoIGh1iyR5pxigdQyaNWuWFKAnJ9GgQa/6d6WUdZPcKSVa1dixY3Peeedl6NChwoA+8KEPfSgnnXSSIGhlv6m17vVqf2nWgGaxAwD61s4ioFWtuuqqOe200wz/0Id+/OMfZ8sttxQErcxlAKAAALq5/p+WtPjii+f3v/99llpqKWFAHxoyZEh+85vfZM011xQGrWqRJG8TAygAoKOVUlZN8kZJ0GoGDx6ck046Keuss44woB+MGDEiZ5xxRhZbbDFh0KreKwJQAECne48IaEVf/epXs+222woC+tHaa6+d448//jXvKwMNtmMpxVwBCgBQAEAr2W233bzcHwyQd73rXTnssMMEQStaNsnmYoDm8yoA0NOT6BWerSmlLJ5kQpIFJUSrWHfddXPllVdmkUUWEQYMoPe+970577zzBEGr+W6t9XOz/6FZA5rFDgDoG+80/NNKFllkkZxyyimGf2iA448/PiuvvLIgaDU7iQAUANCpdhQBreToo4/OyJEjBQENsOSSS+bkk0/OkCFDhEErWauU4uUsQAEAnaWUMjjJDpKgVey7777Ze++9BQENsskmm+RrX/uaIGg17xQBNJt7AEBPT6LZ7gFQStk8yVWSoRWstdZaufrqq239h4bacccdc+GFFwqCVnFerfVfngQxa0Cz2AEAvc+z/7SEIUOG5MQTTzT8Q4Mde+yxWXrppQVBq9imlLKwGEABAJ3E9jdawiGHHJKNNtpIENBgyy67bH784x8LglZRkrxVDKAAgM74rVfKskneKAmabtNNN83nP/95QUALeM973pP9999fELSK7UQAzeUeANDTk+hl9wAopbwvyUlSocmGDRuWa6+9NmuvvbYwoEVMmTIlG220UR555BFh0HT31FrX+cf/MWtAs9gBAL3r7SKg6Q4//HDDP7SYRRddNEcffbQgaAVrl1JWEgMoAEABAANszJgxOfjggwUBLWj77bfPfvvtJwish4D55hIA6OlJ1H0JQCllnSR3SYSmWnDBBXP11Vdn1KhRwoAWNWnSpIwePToTJkwQBk12cq1138QlANA0dgBA73mbCGiygw8+2PAPLW7EiBE54ogjBEHTvb2UMkgM0Dx2AEBPT6L/vwPgd0l2lQhNtMoqq+Smm27KQgstJAxoAzvssEP+8pe/CIIm26DWeptZA5rFDgDoBaWUBeJ1b2mwI4880vAPbeT73/9+hgwZIgiabGsRgAIA2tWoJEuKgSbadttt8573vEcQ0EbWXXfd/Od//qcgaLItRQDN4xIA6OlJNGhQSin/meQoadA0Q4cOzfXXX+9l/6ANTZkyJaNGjcoTTzwhDJroiVrr68wa0Cx2AEDveLMIaKKDDjrI8A9tatFFF81Xv/pVQdBUy5VS1hUDNIsdANDTk6hrB8BjSV4nDZpkySWXzB133JEll3R1CrSrWbNmZdNNN82tt94qDJrow1OnTv25GKA57ACAHiqlrGn4p4m+8IUvGP6hzQ0aNCjf+c53BEHTjE/ygyRXiQIa9nvDDgDomWHDhm2R5NQkK0qDplhppZVy++23Z+jQocKADuBlAWmAR5OckuTkWuuN//hDswYoAKC9TqKuSwAGJdkwyS5J9kyylmQYSL/4xS+y3377CQI6xPXXX58tt9zSsEV/m5HknCQ/T3JerXXm7P/AMQkKAGi7AmB2pZQxSfZP8r4kS0iJ/jRy5Mhcf/31GTx4sDCgg+y1114566yzBEF/eCbJz5IcVWv9+2v9Q7MGKACg7QuAlxUBw5LsnuSTSTaRFv3hpJNOyu677y4I6DA333xzNttsMwMXfenxJEck+UWt9bm5eQfHIygAoGMKgNnKgDcn+VyS90iNvjJy5MjceOONc31cAu1ljz32yB/+8AdB0NueSvLNJD+rtb44L+9o1oBm8SoA0E9qrVfUWndK8oYkv0niNyK97pBDDjH8Qwf70pe+5DGA3jQ1yTeSrFlr/cG8Dv9A89gBAD09ieZzoVVK2TDJd5JsK0V6w6qrrpo77rgjCyyg24VOtvPOO+fcc88VBD11ZpKDa60P9+SDmDWgWawSYYDUWm+qtW7XXQDcKRF66uCDDzb8A/nUpz4lBHrigSQ71Fp36enwDzSPHQDQ05OoF7ZallKGJPlUksOTLCJV5tWIESNy7733ZpFFHD5AMnbs2Nx4442CYF7MSvKTJP89tzf4m6sPataARvFUETRArXVarfXIJOsluVAizKuDDjrI8A/808EHHywE5sXfk7yt1vrx3hz+geaxAwB6ehL1wc2WSikHJPm/JMMlzJwMHTo09957b5ZbbjlhAEmSGTNmZOTIkXnooYeEwZz8PsmBtdaJffHBzRrQLHYAQAPVWo9LsmGSa6TBnOyzzz6Gf+BfDB48OB//+McFwWuZka6XJ965r4Z/oHnsAICenkR9+HJLpZQFk3w7yWckzau59tprM3r0aEEA/2LKlClZddVV8/zzzwuD2U1Mslut9ZK+/kRmDWgWOwCgwWqt02utn02ya5IpEmF2Y8aMMfwDr2jRRRfN7rvvLghmd1eSMf0x/AMKAGD+ioAzkmyerpfmgX868MADhQB4jGBuXZJks1rreFFAZ3IJAPT0JOrDSwBmV0pZOslZSbaQPIsuumjGjx+f4cPdKxJ4dZtsskluu+02QXBGkr1rrS/15yc1a0Cz2AEALaTWOiHJtum6Yy8dbo899jD8A3NkFwBJTkiyR38P/0Dz2AEAPT2J+nEHwD+UUgYn+XmSA/wEOteVV16ZjTfeWBDAa3r66aez2mqrZerUqcLoTD9N8rFa64As+s0a0Cx2AEALqrXOSPIf3b/U6UCjR482/ANzZckll8zOO+8siM50/EAO/4ACAOi9EmBWko8pATrTHnvsIQRgru29995C6DxnJPmQ4R94OZcAQE9PogG4BODlSimD0tXwv99Po3OOubvuuiurrLKKMIC5Mn369Ky88sqZNGmSMDrDxUl2aMI1/2YNaBY7AKDFdTf7B6ar6acDjBkzxvAPzJMFF1ww73nPewTRGe5Msosb/gEKAGjfEmBGkvcluUoa7W/XXXcVAuCxg1fyZJJ31lqfFQXwSlwCAD09iQb4EoCXK6UsneTqJGv4ybTv8XbvvfdmxRVXFAYwT2bMmJFVV101Tz31lDDa9Eec5O211kua9EWZNaBZ7ACANlJrnZDkPUmek0Z72nzzzQ3/wHwZPHhw3vve9wqifX22acM/oAAA+r4EuCPJ/pJoT7vssosQgPnm5QDb1pm11h+IAZgTlwBAT0+iBl0C8HKllG8n+W8/ofZyyy23ZO211xYEMF9eeumlLL/88nn++eeF0T4eTrJhrbWRL/Fg1oBmsQMA2teh6bofAG1ilVVWMfwDPTJ06NBss802gmgfs5Ls19ThH1AAAP2k1jo9yV5JpkijPWy33XZCADyW8HI/rLVeKgZAAQCk1vpgkoMlYdEO8A/veMc7hNAe7k9yiBiAeeEeANDTk6ih9wB4uVLKH5O800+rdZVS8thjj2XhhRcWBtBjo0ePzj333COI1rZdrfWCpn+RZg1oFjsAoDN8JF4asKVtscUWhn+g9yZHO4pa3W9bYfgHFADAAKi1Ppzky5JoXW7aBXhModuLST4jBkABALyWo5LcJobWNHbsWCEAvWbzzTdviUvYeEXfrbU+IgZAAQC8qu5XBfi0JFrP0KFDs8kmmwgC6DVLLrlk1l13XUG0nseTHCEGQAEAzE0JcGGScyTRWjbaaKOUUgQB9Co7i1rSd2qt7ukDKACAuXZoErfkbSFbbLGFEAAFAH9P8jMxAAoAYK7VWm9O8ltJtI7NNttMCIDHFo6stb4oBqAnBnltTujhSdSCN1EqpayXrhsCugNUC3jkkUey9NJLCwLodSuvvHKefPJJQTTf00lWbsXt/2YNaBY7AKAD1VrvSPJ7SbTG4tzwD/SVjTfeWAit4ceu/QcUAEBPuItwC9hggw2EAHiM6WwzkvxUDIACAJhvtdZxSa6RRLONGjVKCIDHmM72h1rrI2IAFABAT/1YBBbngMcYGs2d/wEFANArfpNkohiay/ZcoC+ts846GTp0qCCa67EkF4kBUAAAPVZrrUlOkUQzlVKy1lprCQLoM4MHD87IkSMF0Vy/qrXOEAOgAAB6yy9F0EwjR47M4MGDBQH0KZcBNNpvRAAoAIBeU2u9PsndkmieddZZRwiAx5rO9WCt9QYxAAoAoLedJoLmWXXVVYUA9LlVVllFCM10hggABQDQF84UgUU50JmUjY31RxEACgCg19Vab0zysCQUAIACgEZ4McmVYgAUAEBfuUAEzbLaaqsJAehzyy23XIYNGyaIZrm01jpVDIACAOgr54qgQQ/OCyyQlVZaSRBAv7DjqHEuEwGgAAD60qUiaI7ll18+Q4YMEQTQL1wG0Di2/wMKAKDv1FonJLlLEs2w4oorCgHwmNOZpie5TgyAAgDoa7YcNsSIESOEAPSbpZZaSgjNcWet9UUxAAoAoK9dLwKLcaDzLLnkkkJojptEACgAAIuODrLMMssIAeg3Sy+9tBCa42YRAAoAoD/ckmSGGAaeSwAABUDHukcEgAIA6HO11prkAUkMPJcAAB5zOta9IgAUAEB/8UoADWAHAOAxp2P9TQSAAgDoL555aADPxgEKgI70ZK31JTEACgCgvzwkgoE3ZMgQIQD9ZvDgwUJohr+LAFAAAP3pUREMvIUXXlgIQL8ZPny4EJrhcREACgCgP9kBANBh7ABojKdFACgAgP70jAgG3qKLLioEoF8tuOCCQhh4z4oAUAAA/cmzDw3g2Tigv7kMQAEAKAAABQADYOjQoUIA6DxVBIACAOi/lUetFh8NsNBCCwkB6Fd2AAAoAIDONFMEA2vWrFlCAPrVSy95+XkABQDQiaaIYGBNnjxZCIACAAAFANDn3AoaoMPMnGnzF4ACAOhEi4hgYL344otCAPqVnUeNsLgIAAUAQIdxL0aAjuROjIACAOg/pZTFpDDwbMUF+pNdR42xhAgABQDQn2w/bIApU9yHEeg/bgDYGCNEACgAgP60hAgGnksAgP5kB0BjvF4EgAIA6E/Li2DgTZw4UQiAx5zOs6IIAAUA0J9eJ4KBN2nSJCEA/WbChAlCaIbhpRSX4gEKAKDf2H7YAJ6NAzzmdKw1RQAoAID+spYIBp5n44D+ZNdRo6wjAkABAPQXzzxYjAMdxg4ABQCgAAA6kx0AFuOAxxwGzkYiABQAQJ8rpSwdrwLQCE8++aQQAI85nWlDEQAKAKA/vEEEzfDwww8LAeg3Dz30kBCaY6VSyrJiABQAQF97owia4ZlnnskzzzwjCKBfPPjgg0Joli1EACgAgL62uQia44EHHhAC0OdeeumlPProo4JoljeLAFAAAH1trAiawzNyQH946KGHMmvWLEE0y9YiABQAQJ8ppayVZDlJKAAAjzUMuI1KKcuIAVAAAH1lWxE0y/jx44UA9DmXGzXSIL+XAQUAoACwKAfoVX/729+E0Ew7igBQAAC9rpRSkmwjiWa5/fbbhQD0uTvvvFMIzfTO7t/PAAoAoFe9PcmiYmiWhx56KJMnTxYE0KduvfVWITTTorE7D1AAAH1gFxE002233SYEoM88++yzefjhhwXRXPuIAFAAAL2me3vhzpJQAAAeY2ic95ZSFhcDoAAAess7kywphmayNRfwGNPRhiXZQwyAAgDoLfuLwOIc8BhDY31MBIACAOixUsrySd4tiea64447MmvWLEEACoDOtWEpZTMxAAoAoKf+I8mCYmiuyZMn54477hAE0Otqrbn55psF0RoOFgGgAADmWyllSJIPS6L5xo0bJwSg1/31r39NrVUQrWH3UspqYgAUAMD82jPJCmJoviuvvFIIQK+74oorhNA6Bif5jBgABQAwz0opg5J8XhKtwQ4AwGMLSQ4spSjuAQUAMM92SrKBGFrDAw88kMcff1wQgAKgsw1LcpgYAAUAMNe6n/0/XBKtxWUAQG+6++67M2nSJEG0ngNKKauLAVAAAHNr5yQbiqG1XHXVVUIAeo1SsWUNSXKkGAAFADBHpZShSb4tidZz4YUXCgHoNRdccIEQWtcupZStxAAoAIA5+WiStcTQeu6555488MADggB6bMaMGfnLX/4iiNZ2dCllQTEACgDgFZVSlk3yFUm0rvPOO08IQI9dffXVefbZZwXR2jZI8l9iABQAwKs5MskSYmhdtuwCveH8888XQnv4SillNTEACgDgX5RStkmyvyRa26WXXpqXXnpJEIACgCRZOMkvSynW84ACAPjn8D88yXGSaH3PP/+8O3cDPfL444/nlltuEUT72DLJwWIAFADAP3wnyapiaA9nn322EID5dt5552XWrFmCaC/fLqVsKAZAAQAdrpTyziQfk0T7OPPMMy3egfn2m9/8RgjtZ2iS33Tv+ANQAECHDv/LJzlBEu3lsccey7hx4wQBzLMJEybksssuE0R7WjvJsaWUQaIAFADQecP/4CQnJ1lGGu3HM3jA/DjrrLMyY8YMQbSvPZJ8TgyAAgA6zxFJthZDezrjjDMyc+ZMQQDz5LTTThNC+/tW9+V/AAoA6ASllL2TfFoS7eupp56yjReYJ48//nguv/xyQXTG2v63pZSNRAEoAKD9h/8tkhwvifZ3+umnCwGYa2eeeaadQ51jkSTnlFJWFQUwu0HuJg09PIkGNeN+O6WUNZOMS7K0n0r7W2KJJTJ+/PgstNBCwgDmaOzYsbnxxhsF0VnuT7JFrfWJgfwizBrQLHYAQBsopayY5ALDf+d45plnctZZZwkCmKObb77Z8N+Z1khyUSnFDYEBBQC00fC/TJJzk6wmjc5yzDHHCAGYo+OOO04InWtUkouVAMA/uAQAenoSDeAlAN2/0C/u/gVPB7rllluy9tprCwJ4RS+88EJWXXXVTJ48WRid7bYk29VaH+3vT2zWgGaxAwBalOGfxDN7wGs744wzDP+ke61wRff9goAOZgcA9PQkGoAdAN3X/F+UZB0/gc621FJLZfz48Rk6dKgwgH+z9dZb5+qrrxYE//BUknfXWq/tr09o1oBmsQMAWkwpZWSSqw3/JMnEiRPdDBB4Rbfddpvhn9ktk+SSUsoeogAFAND84f8d3cP/CtLgH/7v//5PCMC/+cEPfiAEXslCSX5TSvmfUspgcUBncQkA9PQk6qdLAEopH0vyf0kWlDqzu+CCC7LVVlsJAkiSPP7441l77bXz0ksvCYPX/PWRZO9a66S++gRmDWgWOwCg4Uopw0opxyf5keGfV/P9739fCMA//ehHPzL8Mze2TXJLKWUbUUBnsAMAenoS9eEOgFLK2klOTbKRpJnTcXjTTTdlnXXcGgI63fPPP5811lgjzzzzjDCYWzOTHJHkK7XW2psf2KwBzWIHADRUKeUDSW40/DO3CyzX+wJJcvzxxxv+mZ+Z4AtJbiilbCIOaF92AEBPT6Je3gFQSnldkp8m2Um6zOOxk3vuuSfLLbecMKBDzZgxI+utt14efPBBYTDfh1GSH6ZrN8Dknn4wswY0ix0A0JzhbVAp5f1Jbjf8Mz9qrfnud78rCOhgp5xyiuGfnhqc5L+S3FVK2aeUMkgk0D7sAICenkS9sAOglLJekp8kcRt3emShhRbKXXfdZRcAdKAZM2Zk9OjRuf/++4VBb7o+yadrrZfPzzubNaBZ7ACAAVRKWbqUcnSSWwz/9IYXX3zRKwJAhzrllFMM//SFTZJcVko5r5SymTigtdkBAD09ieZjB0ApZXiSTyT57ySLS5HeZBcAdJ5p06Zl9OjRGT9+vDDoa+cnObLW+ue5+cdmDWgWOwCgH5VSFi2lfCHJA0m+afinL7z44ov5+te/LgjoIMcee6zhn/6yXZKLSik3lFL2L6UMEwm0DjsAoKcn0VzsACilrJDkk0k+bOinPyy44IK55ZZbsvrqqwsD2tzzzz+f9ddfP48//rgwGAhPJzkhyS9rrTfP/pdmDWgWOwCgj3Tf1f+tpZTfpesZ/88b/ukv06dPz6GHHioI6AA/+MEPDP8MpCXT9aoBN5VSbimlfKGUspZYoJnsAICenkSz7QDo/qX3viT7J1lVQgzksXnxxRdn8803Fwa0qccffzzrr79+nn/+eWHQNLcn2Wnq1KnuTAkKAGivIauUsnKS9yfZNckbpEJTjBkzJpdffrkgoE19+MMfzi9/+UtB0ETTkiwxderUF0QBzeESAOgdo5J8zfBP01x33XU5+eSTBQFt6MYbb8xJJ50kCJrq2lqr4R8UANCWLksyQww00Re/+MVMmTJFENBmDj744MycOVMQNNUlIgAFALSlWutzSa6XBE30xBNPeFlAaDMnnnhirrvuOkHQZJeJAJrHPQCgpydR900ASynfTPJFidBECy64YK6++uqMGjVKGNDiJk2alNGjR2fChAnCoKlmJFmi1vqcWQOaxQ4A6D0Xi4Cmmj59ej72sY95PWZoA1/84hcN/zTdNd27IwEFALStq9J1x1topGuvvTa/+MUvBAEt7IorrsiJJ54oCJruQhFAM7kEAHp6EnVfApAkpZSLk2wjFZpqscUWy4033pgVV1xRGNBiXnzxxYwZMyb33XefMGi6N9dar0xi5xk0jB0A0LsuEAFNNnny5HzkIx8RBLSgww8/3PBPS/yqSXKNGEABAJ3gfBHQdBdddFGOP/54QUALufbaa/OjH/1IELSCi2ut08UAzeQSAOjpSfSvlwAMSvJ4kmUlQ5Mttthiue6667LKKqsIAxru+eefz5ve9CbP/tMq/rPW+s+2yqwBzWIHAPSiWuusuAyAFjB58uQceOCBmTlzpjCg4b7whS8Y/mkl54kAFADQSVwGQEu44oor8r3vfU8Q0GDnnntujjnmGEHQKu6utd4vBmgulwBAT0+il10CkCSllKWSPBkFGy1gyJAhufjiizNmzBhhQMM8/vjj2XjjjTNx4kRh0Cq+X2v99Mv/wKwBzWJAgV5Wa52Y5GpJ0AqmTZuW/fffP5MnTxYGNMjMmTPzgQ98wPBPqzlHBKAAgE50tghoFePHj8/HPvYxQUCDfPvb384ll1wiCFrJlCSXiwEUAKAAgIb73e9+5yXGoCEuvvjifOMb3xAEreaCWus0MUCzuQcA9PQkmu0eAP9QShmfZFUJ0SqGDh2aiy66KJtuuqkwYIA8+uij2XTTTTNhwgRh0GreX2s9cfY/NGtAs9gBAH3HLgBayksvvZS99torTz75pDBggM7BPffc0/BPK5oe1/+DAgA63BkioNU8+uij2WOPPTJtml2c0N8+/vGP57rrrhMEreiyWuskMYACADrZ5UmeEgOt5uqrr87BBx8sCOhHP/7xj3PSSScJglZ1pghAAQAdrdY6Iy4DoEUdd9xx+eEPfygI6AcXXHBBPve5zwmCVnaWCKA1uAkg9PQkepWbACZJKWWHJH+SEq1o8ODBOe200/LOd75TGNBH7rjjjmy99daZPHmyMGhV19dax7zaX5o1oFnsAIC+dXESqzpa0owZM7L//vvnpptuEgb0gSeeeCI777yz4Z9Wd7oIQAEAJKm11iR/kASt6rnnnstOO+2UBx98UBjQi6ZMmeLcol2cLAJQAAD/329EQCt74oknsuOOO2bixInCgF4wbdq07L333nbX0A6uqbU+JAZQAAD/3/lJnhYDreyee+7Je9/73kyZMkUY0AMzZ87MAQcckIsuukgYtIPTRAAKAOBlaq3T4uVxaAPXXXdddt9993Rd2QLMj0984hM57TQzEwoAQAEA7cz1cbSFSy65JPvuu2+mTZsmDJhHX/rSl3LssccKgnYxzvZ/UAAArzI3JXlKDLSDc845J/vss09mzpwpDJhLhx12WP73f/9XELSTk0QACgDgFdRaZ8QuANrI2WefnQMPPFAJAHPhG9/4Ro488khB0E6mxU2OQQEAvCZNOW3llFNOyQc+8AGXA8Br+PKXv5z/+Z//EQTt5k+11kliAAUA8CpqrTckuUMStJPf/va32XvvvZUA8AoOO+ywHHHEEYKgHf1aBKAAAObsRBHQbs4555zsvvvuefHFF4UB3T7zmc/Y9k+7mpzkD2IABQAwZ79OMksMtJvzzjsv73rXuzJ58mRh0NFmzJiRAw44ID/60Y+EQbs6tXo9WFAAAHNWa30kyZ8lQTu66qqr8va3vz1PPPGEMOhIL774YnbfffecfLJ7vtLWjhMBKACAuedFoGlbt9xyS7baaqvcc889wqCjTJw4Mdtvv33+9Kc/CYN2dket9RoxgAIAmHtnJnHnXNrWgw8+mK233jrjxo0TBh1h/Pjx2XrrrXPNNeYi2p5n/0EBAMyL7uvmfiUJ2tmkSZOy/fbb59RTTxUGbW3cuHF585vfnHvvvVcYtLvp8ZLGoAAA5ssxIqDd1VrzwQ9+MF/96leFQVs65ZRTst1222XixInCoBOcXWt9UgygAADmfTC6Ncl1kqDdzZo1K9/61rey55575vnnnxcIbWHmzJn54he/mA9+8IN56aWXBEKn+LkIoPUNmjXLK5JBj06iQYPm6/1KKf+R5BcSpFOsv/76Oe2007L66qsLg5b19NNPZ7/99stFF10kDDrJ+CRr1lpnzus7mjWgWewAgIFzcpJnxUCnuP3227PFFlvkj3/8ozBoSX/9618zduxYwz+d6OfzM/wDCgCgW631hSQnSIJO8vTTT2e33XbLoYcempkzrSVpHccee2y22WabjB8/Xhh0mmlx939oGy4BgJ6eRPN5CUCSlFLWTXKnFOlEb37zm3PiiSfm9a9/vTBorOeeey6f+MQncsoppwiDTnVqrXXv+X1nswY0ix0AMIBqrXcl+Ysk6ERXXHFFNtlkk5x99tnCoJFuuOGGbLrppoZ/Ot1PRQAKAKD3/EgEdKpJkyZl9913zyc/+cm88MILAqERZs6cmSOPPDJbb711/va3vwmETnZTrfVSMUD7cAkA9PQk6sElAElSSlkwyf1JVpYmnWzNNdfM8ccfnzFjxgiDATN+/PgccMABGTdunDAgOaDWenxPPoBZA5rFDgAYYLXW6UmOlgSd7r777ss222yTww8/PLVWgdDvfvazn2XMmDGGf+gyIYnrX6DN2AEAPT2JergDIElKKUsmeSTJwhKFZJ111skxxxxjNwD94v77789HP/rRXHbZZcKA/+9btdZDevpBzBrQLHYAQAPUWp9O8ktJQJe77747W2+9dT796U9nypQpAqFPTJ8+Pd/97nczZswYwz/8qxlJfiwGaD92AEBPT6Je2AGQJKWUdZLcJVH4V8svv3y+973vZeeddxYGveaaa67Jxz/+8dx2223CgH93cq113974QGYNaBY7AKAhaq13J/mjJOBfPfbYY9l7772z44475p577hEIPfLUU0/loIMOytZbb234h1f3XRGAAgDoe0eIAF7ZhRdemE022SSHHHJIJk+eLBDmybRp03LUUUdl1KhROfHEEz0rCa/uz7XWv4oB2pNLAKCnJ1EvXQLwD6WUa5JsKll4dcsss0wOO+ywHHjggRk8eLBAeE1/+MMfcsghh+S+++4TBszZDrXW83rrg5k1QAEACoDXLgB2TfI7ycKcrbPOOvn617+eHXfcURj8m2uuuSaHHHJIrrzySmHA3Lktyehaa68NCGYNaBaXAEDznJnkXjHAnN19993Zfffds+WWW+aSSy4RCEmSW2+9Nbvuumve8pa3GP5h3hzZm8M/0Dx2AEBPT6Je3gGQJKWUDyf5qXRh3my11VY57LDDsuWWWwqjA91+++35zne+k9/97neZOXOmQGDejE+ydq11em9+ULMGKABAATDnAmBokr8lWUHCMH9FwGc/+9lsu+22wugAN9xwQ77zne/k7LPPNmzA/PtorbXXn3xwToICABQAc1cCfCrJ9yUM82/99dfPwQcfnL333jtDhgwRSBuZNWtWzj333Hzve9/LFVdcIRDomceTrFprrQoAUAAAA1MALJTkgSTLShl65nWve10++tGP5qCDDsqSSy4pkBY2derUnHzyyfnBD36Qe+65RyDQOz5ba/3fvvjAZg1QAIACYO5LgC8k+ZaUoXcMHz48++67bw488MCMHj1aIC3kwQcfzC9/+cv8/Oc/z4QJEwQCvWdiup79f04BAAoAYGALgOHp2gWwlKShd2288cY58MADs8cee2T48OECaaBp06bl7LPPznHHHZeLL77Yjf2gb3yx1vrtvvrgZg1QAIACYN5KALsAoA8tssgi2X333XPggQdmzJgxAmmAe++9N8cee2x+/etf56mnnhII9J0+ffZfAQAKAFAAzHsBYBcA9JPVV189u+22W/bcc8+sv/76AulH48ePz+mnn54zzjgjN954o0Cgf/Tps/8KAFAAgAJg/koAuwCgn62zzjrZdddds+uuuyoD+sgjjzyS008/Paeffnquu+46gwL0rz5/9l8BAAoAUADMXwGwcJL7k7xO4tD/Ro4cme233z7bbbddxo4dm6FDhwplPgeB66+/Pueff37OP//8XH/99YYDGDhfqLV+pz/Oe0ABAAqAeS8BPpXk+xKHgbXIIotkm222yXbbbZdtt902q6yyilBew4QJE3LBBRfkggsuyIUXXpiJEycKBQbe40lWr7W+qAAABQDQzAJgoST3JFlR6tAca6yxRrbYYotsttlmGTt2bNZdd92OzuOhhx7KuHHjctVVV2XcuHG57bbb3L0fmudjtdaf9McnMmuAAgAUAPNfAhyY5BipQ3ONGDEib3rTmzJ27Nhsuumm2WCDDTJixIi2/F6fe+653H777bn++uszbty4XHnllXnsscccBNBs9ycZWWudpgAABQDQ7AJgwSS3JllX8tA6ll9++YwaNSobbLBBNthgg6y//voZOXJkhgwZ0hJf/4wZM3L//ffn1ltvze23357bbrstt9xySx588EGLe2g9+9ZaT+6vT+YxAhQAoADoWQmwc5IzJA+tbYEFFsjyyy+fVVZZJausskpWX331f/7vFVdcMcsss0wWW2yxfvlaXnjhhUyYMCF///vf88ADD2T8+PF58MEH8+CDD+aBBx7II488kunTp/uhQeu7Ockba639dl2OWQMUAKAA6FkBMCjJVUk2kz60tyFDhmTEiBFZaqmlMmLEiCyzzDIZMWJEFl544QwaNOifBcFCCy2UUkoWWGCBLLDAApk+fXqmT5+e557renWv559/PtOnT0+tNZMmTcrEiRPz1FNPZdKkSZk0aVKmTp0qbOgM76q1/qk/P6FZAxQAoADoeQmwVZJLpQ8AzKU/11rf3t+f1KwBzbKACKD11FovS3KWJACAuZnDk3xGDIACAFrX55NMEwMAMAe/rLXeLAZAAQAtqtZ6b5IfSwIAeA0vJjlUDIACAFrf15I8LQYA4FV8t9b6dzEACgBocbXWSd0lAADA7P6e5NtiAP7BqwBAT0+iAXgVgJcrpSyY5JYkI/00AKBXTElyd5LxSR7oHqSfTDKh++3FJFNf9jYoyeJJFkwyPMmIJEsl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AAAAgAIAAAAAUAAAAAAACgAAAABAAQAAAAAoAAAAAAAFAAAAAKAAAAAAABQAAAAAoAAAAAAAFAAAAACAAgAAAABQAAAAAAAKAAAAAEABAAAAACgAAAAAAAUAAAAAKAAAAAAABQAAAACgAAAAAAAUAAAAAIACAAAAAFAAAAAAAAoAAAAAQAEAAAAACgAAAABAAQAAAAAoAAAAAAAFAAAAAKAAAAAAABQAAAAAgAIAAAAAUAAAAAAACgAAAABQAAAAAAAKAAAAAEABAAAAACgAAAAAAAUAAAAAoAAAAAAAFAAAAACAAgAAAAAUAAAAAIACAAAAAFAAAAAAAAoAAAAAQAEAAAAAKAAAAAAABQAAAACgAAAAAAAFAAAAAKAAAAAAABQAAAAAgAIAAAAAUAAAAAAACgAAAABAAQAAAAAoAAAAAAAFAAAAACgAAAAAAAUAAAAAoAAAAAAAFAAAAACAAgAAAABQAAAAAAAKAAAAAEABAAAAAAoAAAAAQAEAAAAAKAAAAAAABQAAAACgAAAAAAAUAAAAAIACAAAAAFAAAAAAgAIAAAAAUAAAAAAACgAAAABAAQAAAAAoAAAAAAAFAAAAAKAAAAAAABQAAAAAgAIAAAAAFAAAAACAAgAAAABQAAAAAAAKAAAAAEABAAAAACgAAAAAAAUAAAAAoAAAAAAABQAAAACgAAAAAAAUAAAAAIACAAAAAFAAAAAAAAoAAAAAQAEAAAAAKAAAAABAAQAAAAAoAAAAAAAFAAAAAKAAAAAAABQAAAAAgAIAAAAAUAAAAAAACgAAAABAAQAAAAAKAAAAAEABAAAAACgAAAAAAAUAAAAAoAAAAAAAFAAAAACAAgAAAABQAAAAAIACAAAAAFAAAAAAAAoAAAAAQAEAAAAAKAAAAAAABQAAAACgAAAAAAAUAAAAAKAAAAAAABQAAAAAgAIAAAAAUAAAAAAACgAAAABAAQAAAAAoAAAAAAAFAAAAAKAAAAAAAAUAAAAAoAAAAAAAFAAAAACAAgAAAABQAAAAAAAKAAAAAEABAAAAACgAAAAAQAEAAAAAKAAAAACAVvP/BgB4TV2beQp30gAAAABJRU5ErkJggg==')
			.attr('x', widget.settingsBtnHovered ? (data.graphicWidth - (data.settingsBtnSize * 1.2)) - halfOfDifferenceInSizeForPosGrowth : data.graphicWidth - (data.settingsBtnSize * 1.2))
			.attr('y', widget.settingsBtnHovered ? data.margin.top * 2 : (data.margin.top * 2) + halfOfDifferenceInSizeForPosGrowth)
			.attr('height', widget.settingsBtnHovered ? data.settingsBtnSize * 1.2 : data.settingsBtnSize)
			.attr('width', widget.settingsBtnHovered ? data.settingsBtnSize * 1.2 : data.settingsBtnSize)
			.style('cursor', 'pointer')
			.on('click', () => {toggleModal()})
			.on('mouseenter', function() {
				d3.select(this)
					.attr('height', data.settingsBtnSize * 1.2)
					.attr('width', data.settingsBtnSize * 1.2)
					.attr('x', (data.graphicWidth - (data.settingsBtnSize * 1.2)) - halfOfDifferenceInSizeForPosGrowth)
					.attr('y', data.margin.top * 2)

			})
			.on('mouseout', function() {
				d3.select(this)
				.attr('height', data.settingsBtnSize)
				.attr('width', data.settingsBtnSize)
				.attr('x', data.graphicWidth - (data.settingsBtnSize * 1.2))
				.attr('y', (data.margin.top * 2) + halfOfDifferenceInSizeForPosGrowth)
			})

		const modalGroup = widget.svg.append('g')
			.attr('class', 'modalGroup')
			.attr('transform', 	`translate(${(data.graphicWidth / 2) - (data.modalWidth / 2)},${data.margin.top * 1.25})`)

		function removeModal(rerenderAfter) {
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
						if (rerenderAfter) render(widget, true);
					})
		}

		function renderModal() {
			// make box of background color with slight opacity to blur background and then add modal on top
			const overlay = widget.outerDiv.append('div')
				.attr('class', 'overlayDiv')
				.style('position', 'absolute')
				.style('top', '0px')
				.style('height', data.jqHeight + 'px')
				.style('width', data.jqWidth + 'px')
				.style('background-color', widget.modalActive ? data.backgroundColor : 'none')
				.style('opacity', 0)
				.on('mousedown', function() {
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
				.on('mousedown', function() {d3.event.stopPropagation()})
				.on('click', function() {d3.event.stopPropagation()})
				.attr('height', 0)
				.attr('width', 0)
				.attr('x', data.modalWidth / 2)
				.attr('y', data.modalHeight / 2)
				.transition()
					.attr('x', 0)
					.attr('y', 0)
					.attr('height', data.modalHeight)
					.attr('width', data.modalWidth)
					.on('end', function() {
						renderModalDiv()
					})

			function renderModalDiv() {
				const verticalModalPadding = (data.modalHeight - ( (data.paddingAboveDropdown * 4) + (getTextHeight(data.modalInputFont) * 3) + (25) + (data.modalLabelsHeight * 2) )) / 4;

				//modal div
				const modalDiv = widget.outerDiv.append('div')
					.attr('class', 'modalDiv')
					.style('position', 'absolute')
					.style('width', data.modalWidth)
					.style('left', ((data.graphicWidth / 2) - (data.modalWidth / 2)) + 'px')
					.style('top', (data.margin.top * 1.5) + 'px')

				const form = modalDiv.append('form')
					.attr('class', 'modalForm')
					.style('position', 'relative')
					.style('width', data.modalWidth + 'px')
					.style('height', data.modalHeight + 'px')
					.on('submit', function() {
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
					.on('reset', function() {
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
					.style('border-radius', ((data.dropdownWidth / 2) * 0.1) + 'px')
					.style('font', data.modalInputFont)
					.style('color', data.dropdownTextColor)
					.style('border', widget.minInputHovered ? `1.5px solid ${data.hoveredInputStrokeColor}` : `1.5px solid ${data.dropdownStrokeColor}`)
					.style('padding', '2px')
					.style('background-color', data.dropdownFillColor)
					.style('left', ((data.paddingBetweenTempInputs + (data.minTempLabelWidth / 2)) - (data.modalInputWidth / 2)) + 'px')
					.style('top', (verticalModalPadding + data.modalLabelsHeight + (data.paddingAboveDropdown * 2)) + 'px')
					.style('position', 'absolute')
					.style('text-align', 'center')
					.on('mouseover', function() {
						widget.minInputHovered = true;
						d3.select(this).style('border', `1.5px solid ${data.hoveredInputStrokeColor}`)
					})
					.on('mouseout', function() {
						widget.minInputHovered = false;
						d3.select(this).style('border', `1.5px solid ${data.dropdownStrokeColor}`)
					})
					.on('change', function() {
						widget.tempMinSelection = +d3.select(this).property("value");
					});

				form.append('input')
					.attr('class', 'formElement maxTempBinInput')
					.attr('type', 'text')
					.attr('name', 'maxTempBinInput')
					.attr('value', widget.tempMaxSelection)
					.style('width', data.modalInputWidth + 'px')
					.style('border-radius', ((data.dropdownWidth / 2) * 0.1) + 'px')
					.style('font', data.modalInputFont)
					.style('color', data.dropdownTextColor)
					.style('border', widget.maxInputHovered ? `1.5px solid ${data.hoveredInputStrokeColor}` : `1.5px solid ${data.dropdownStrokeColor}`)
					.style('padding', '2px')
					.style('background-color', data.dropdownFillColor)
					.style('left', (((data.paddingBetweenTempInputs * 2) + data.minTempLabelWidth + (data.maxTempLabelWidth / 2)) - (data.modalInputWidth / 2)) + 'px')
					.style('top', (verticalModalPadding + data.modalLabelsHeight + (data.paddingAboveDropdown * 2)) + 'px')
					.style('position', 'absolute')
					.style('text-align', 'center')
					.on('mouseover', function() {
						widget.maxInputHovered = true;
						d3.select(this).style('border', `1.5px solid ${data.hoveredInputStrokeColor}`)
					})
					.on('mouseout', function() {
						widget.maxInputHovered = false;
						d3.select(this).style('border', `1.5px solid ${data.dropdownStrokeColor}`)
					})
					.on('change', function() {
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
					.text('OK')
					.style('width', getTextWidth('OK', data.modalInputFont) + 30 + 'px')
					.style('border-radius', ((getTextWidth('OK', data.modalInputFont) + 20) * 0.1) + 'px')
					.style('font', data.modalInputFont)
					.style('font-weight', 'bold')
					.style('border', widget.modalSubmitHovered ? `1.5px solid ${data.hoveredInputStrokeColor}` : 'none')
					.style('padding-top', '2.5px')
					.style('padding-bottom', '2.5px')
					.style('background-color', data.hoveredInputStrokeColor)
					.style('position', 'absolute')
					.style('text-align', 'center')
					.style('cursor', 'pointer')
					.style('left', widget.modalSubmitHovered ? (((data.modalWidth / 2) - ((getTextWidth('OK', data.modalLabelsFont) + 30) / 2)) - 0.75) + 'px' : ((data.modalWidth / 2) - ((getTextWidth('OK', data.modalLabelsFont) + 30) / 2)) + 'px')
					.style('top', widget.modalSubmitHovered ? (( (verticalModalPadding * 3) + (data.modalLabelsHeight * 2) + 20 + (getTextHeight(data.modalInputFont) * 2) + (data.paddingAboveDropdown * 4) ) - 0.75) + 'px' : ( (verticalModalPadding * 3) + (data.modalLabelsHeight * 2) + 20 + (getTextHeight(data.modalInputFont) * 2) + (data.paddingAboveDropdown * 4) ) + 'px')					.on('mouseover', function() {
						widget.modalSubmitHovered = true;
						d3.select(this)
							.style('border', `1.5px solid ${data.hoveredInputStrokeColor}`)
							.style('left', (((data.modalWidth / 2) - ((getTextWidth('OK', data.modalLabelsFont) + 30) / 2)) - 0.75) + 'px')
							.style('top', (( (verticalModalPadding * 3) + (data.modalLabelsHeight * 2) + 20 + (getTextHeight(data.modalInputFont) * 2) + (data.paddingAboveDropdown * 4) ) - 0.75) + 'px')
						})
					.on('mouseout', function() {
						widget.modalSubmitHovered = false;
						d3.select(this)
							.style('border', 'none')
							.style('left', ((data.modalWidth / 2) - ((getTextWidth('OK', data.modalLabelsFont) + 30) / 2)) + 'px')
							.style('top', ( (verticalModalPadding * 3) + (data.modalLabelsHeight * 2) + 20 + (getTextHeight(data.modalInputFont) * 2) + (data.paddingAboveDropdown * 4) ) + 'px')
					})

				form.append('button')
					.attr('class', 'formElement')
					.attr('type', 'reset')
					.text('Reset')
					.style('width', getTextWidth('reset', data.modalInputFont) + 20 + 'px')
					.style('border', 'none')
					.style('border-radius', ((getTextWidth('reset', data.modalInputFont) + 10) * 0.1) + 'px')
					.style('font', data.modalInputFont)
					.style('padding-top', '2px')
					.style('padding-bottom', '2px')
					.style('background-color', data.tooltipFillColor)
					.style('position', 'absolute')
					.style('text-align', 'center')
					.style('cursor', 'pointer')
					.style('left', (data.margin.left + 0.75) + 'px')
					.style('bottom', (data.margin.bottom) + 'px')
					.on('mouseover', function() {
						d3.select(this)
							.style('border', `1.5px solid ${data.tooltipFillColor}`)
							.style('left', (data.margin.left) + 'px')
							.style('bottom', (data.margin.bottom - 0.75) + 'px')	
						})
					.on('mouseout', function() {
						d3.select(this)
							.style('border', 'none')
							.style('left', (data.margin.left + 0.75) + 'px')
							.style('bottom', (data.margin.bottom) + 'px')
						})

				widget.outerDiv.selectAll('.formElement')
					.style('margin', '0px')
			}
		}

		function toggleModal(rerenderAfter) {
			widget.modalActive = !widget.modalActive;
			if (widget.modalActive) {
				renderModal()
			} else {
				removeModal(rerenderAfter)
			}
		}

		function handleSubmit() {
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
			function attemptHoverRect(d, i, nodes, that) {
				if (widget.pinnedRectIndex === 'none') hoverRect(d, i, nodes, that)
			}
			function hoverRect(d, i, nodes, that) {
				unhoverRects();
				widget.hoveredRectIndex = i;
				d3.select(that)
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

				ttRect.style('opacity', widget.tooltipActive ? 0.9 : 0);
				ttMonthText.text(widget.ttMonth);
				ttTempText.text(widget.ttTemp);
				ttHrsText.text(widget.ttHours);
				ttEffText.text(widget.ttEff);
			}
		function attemptUnhoverRects(d, i, nodes, that) {
			if (widget.pinnedRectIndex === 'none') unhoverRects(d, i, nodes, that)
		}
		function unhoverRects() {
			widget.hoveredRectIndex = 'none';
			widget.svg.selectAll('.cell')
				.attr('stroke-width', '0.5pt')


			widget.tooltipActive = false;
			widget.ttMonth = '';
			widget.ttTemp = '';
			widget.ttHours = '';
			widget.ttEff = '';

			ttRect.style('opacity', widget.tooltipActive ? 0.9 : 0);
			ttMonthText.text(widget.ttMonth);
			ttTempText.text(widget.ttTemp);
			ttHrsText.text(widget.ttHours);
			ttEffText.text(widget.ttEff);
		}
		function unpinAll(d, i, nodes, that) {
			widget.pinnedRectIndex = 'none';
			unhoverRects(d, i, nodes, that);
		}
		function pinRect(d, i, nodes, that) {
			unhoverRects(d, i, nodes, that)
			widget.pinnedRectIndex = i;
			hoverRect(d, i, nodes, that);
		}

    

	};





	////////////////////////////////////////////////////////////////
		// Render Func
	////////////////////////////////////////////////////////////////
	function render(widget, inWidgetSettingsChanged) {
		// invoking setupDefinitions, then returning value from successful promise to renderWidget func
		return setupDefinitions(widget)
			.then(data => {
				if (inWidgetSettingsChanged || !widget.data || needToRedrawWidget(widget, data)) {
					widget.data = data;
					renderWidget(widget, data);
				}
			})
			.catch(err => console.error('render did not complete: ' + err));
	}






////////////////////////////////////////////////////////////////
	// Initialize Widget
////////////////////////////////////////////////////////////////

	CxEfficiencyMap.prototype.doInitialize = function(element) {
		var that = this;
		element.addClass("CxEfficiencyMapOuter");
		that.outerDiv = d3.select(element[0])
			.attr('class', 'heatMapDiv')
			.style('overflow', 'hidden');

		that.getSubscriber().attach("changed", function(prop, cx) { render(that) });
	};


////////////////////////////////////////////////////////////////
	// Extra Widget Methods
////////////////////////////////////////////////////////////////

	CxEfficiencyMap.prototype.doLayout = CxEfficiencyMap.prototype.doChanged = CxEfficiencyMap.prototype.doLoad = function() {
		render(this);
	};

	/* FOR FUTURE NOTE: 
	CxEfficiencyMap.prototype.doChanged = function (name, value) {
		  if(name === "value") valueChanged += 'prototypeMethod - ';
		  render(this);
	};
	*/

	CxEfficiencyMap.prototype.doDestroy = function() {
		this.jq().removeClass("CxEfficiencyMapOuter");
	};

	return CxEfficiencyMap;
});

