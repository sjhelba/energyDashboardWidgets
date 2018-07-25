'use strict';
define(['bajaux/Widget', 'bajaux/mixin/subscriberMixIn', 'nmodule/COREx/rc/d3/d3.min', 'moment', 'baja!'], function(Widget, subscriberMixIn, d3, moment, baja) {


////////// Hard Coded Defs //////////
const today = new Date();
const thisYear = today.getFullYear();
const thisMonthIndex = today.getMonth();
const thisMonth = months[thisMonthIndex];
const getTotalHoursInMonth = (year, month) => moment(year + '-' + month, 'YYYY-MMM').daysInMonth() * 24;
const getPredictedForMonth = (year, month, amountMeasured, hrsWithData) => {
	const amountPerHr = amountMeasured / hrsWithData;
	const predictedForMonth = amountPerHr * getTotalHoursInMonth(year, month);
	return predictedForMonth;
}
const getTotalHoursInYear = (year, availableDates) => {
  let measuredHours = 0;
  availableDates[year].filter(month => month !== 'All').forEach(month => {
    measuredHours += getTotalHoursInMonth(year, month);
	})
	return measuredHours;
};
const getPredictedForYear = (year, amountMeasured, hrsWithData, availableDates) => {
  const amountPerHr = amountMeasured / hrsWithData;
  const predictedForYear = amountPerHr * getTotalHoursInYear(year, availableDates);
  return predictedForYear;
}
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
const arePrimitiveValsInObjsSame = (obj1, obj2) => !Object.keys(obj1).some(key => (obj1[key] === null || (typeof obj1[key] !== 'object' && typeof obj1[key] !== 'function')) && obj1[key] !== obj2[key])
const needToRedrawWidget = (widget, newData) => {
	const lastData = widget.data;
	// check primitives for equivalence
	if (!arePrimitiveValsInObjsSame(lastData, newData)) return true;
	
	// check objs for equivalence
		//blendedRates
	if (lastData.blendedRates.length !== newData.blendedRates.length) return true;
	const isDiscrepencyInBlendedRateObjs = lastData.blendedRates.some((monthObj, idx) => {
		const newMonthObj = newData.blendedRates[idx];
		if (!arePrimitiveValsInObjsSame(monthObj, newMonthObj)) return true;
		return false; // for some func
	});
	if (isDiscrepencyInBlendedRateObjs) return true;
	
		//baselineData
	if (lastData.baselineData.length !== newData.baselineData.length) return true;
	const isDiscrepencyInBaselineObjs = lastData.baselineData.some((monthObj, idx) => {
		const newMonthObj = newData.baselineData[idx];
		if (!arePrimitiveValsInObjsSame(monthObj, newMonthObj)) return true;
		if (!arePrimitiveValsInObjsSame(monthObj.equipmentKwhs, newMonthObj.equipmentKwhs)) return true;
		return false; // for some func
	});
	if (isDiscrepencyInBaselineObjs) return true;
	
		//projectedData
	if (lastData.projectedData.length !== newData.projectedData.length) return true;
	const isDiscrepencyInProjectedObjs = lastData.projectedData.some((monthObj, idx) => {
		const newMonthObj = newData.projectedData[idx];
		if (!arePrimitiveValsInObjsSame(monthObj, newMonthObj)) return true;
		if (!arePrimitiveValsInObjsSame(monthObj.equipmentKwhs, newMonthObj.equipmentKwhs)) return true;
		return false; // for some func
	});
	if (isDiscrepencyInProjectedObjs) return true;
	
		//measuredData
	if (lastData.measuredData.length !== newData.measuredData.length) return true;
	const isDiscrepencyInMeasuredObjs = lastData.measuredData.some((monthObj, idx) => {
		const newMonthObj = newData.measuredData[idx];
		if (!arePrimitiveValsInObjsSame(monthObj, newMonthObj)) return true;
		if (!arePrimitiveValsInObjsSame(monthObj.equipmentKwhs, newMonthObj.equipmentKwhs)) return true;
		return false; // for some func
	});
	if (isDiscrepencyInMeasuredObjs) return true;
	
	//return false if nothing prompted true
	return false;
};
	const small = {width: 880, height: 440};
	const medium = {width: 1200, height: 700};
	const large = {width: 1600, height: 850};	
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

	const unhoveredOpacity = 0.25;
	const barsTransitionDuration = 1500;

	const categories = [{name: 'baseline', displayName: 'Baseline'}, {name: 'projected', displayName: 'Projected'}, {name: 'measured', displayName: 'Measured'}, {name: 'predicted', displayName: 'Predicted'}];
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const indexOfMonth = {Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11}
	const base64Images = {
		downArrow: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMC40NyIgaGVpZ2h0PSIyOC40MSIgdmlld0JveD0iMCAwIDIwLjQ3IDI4LjQxIj4NCiAgPHRpdGxlPkRvd24gQXJyb3c8L3RpdGxlPg0KICA8Zz4NCiAgICA8cGF0aCBkPSJNMTcuNzUsOFYzMS4zMmMwLDIuOSw0LjUsMi45LDQuNSwwVjhjMC0yLjktNC41LTIuOS00LjUsMGgwWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTkuNzcgLTUuODMpIiBmaWxsPSIjMzliNTRhIi8+DQogICAgPHBhdGggZD0iTTEwLjQ0LDI1LjgzbDgsNy43N2MyLjA4LDIsNS4yNi0xLjE2LDMuMTgtMy4xOGwtOC03Ljc3Yy0yLjA4LTItNS4yNiwxLjE2LTMuMTgsMy4xOGgwWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTkuNzcgLTUuODMpIiBmaWxsPSIjMzliNTRhIi8+DQogICAgPHBhdGggZD0iTTI2LjM4LDIyLjY0bC04LDcuNzdjLTIuMDgsMiwxLjExLDUuMjEsMy4xOCwzLjE4bDgtNy43N2MyLjA4LTItMS4xMS01LjIxLTMuMTgtMy4xOGgwWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTkuNzcgLTUuODMpIiBmaWxsPSIjMzliNTRhIi8+DQogIDwvZz4NCjwvc3ZnPg0K',
		upArrow: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMC40NyIgaGVpZ2h0PSIyOC40MSIgdmlld0JveD0iMCAwIDIwLjQ3IDI4LjQxIj4NCiAgPHRpdGxlPlVwIEFycm93PC90aXRsZT4NCiAgPGc+DQogICAgPHBhdGggZD0iTTIyLjI1LDMyVjhjMC0yLjktNC41LTIuOS00LjUsMFYzMmMwLDIuOSw0LjUsMi45LDQuNSwwaDBaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtOS43NyAtNS43NikiIGZpbGw9IiNlZDFjMjQiLz4NCiAgICA8cGF0aCBkPSJNMjkuNTYsMTQuMTdsLTgtNy43N2MtMi4wOC0yLTUuMjYsMS4xNi0zLjE4LDMuMThsOCw3Ljc3YzIuMDgsMiw1LjI2LTEuMTYsMy4xOC0zLjE4aDBaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtOS43NyAtNS43NikiIGZpbGw9IiNlZDFjMjQiLz4NCiAgICA8cGF0aCBkPSJNMTMuNjIsMTcuMzZsOC03Ljc3YzIuMDgtMi0xLjExLTUuMjEtMy4xOC0zLjE4bC04LDcuNzdjLTIuMDgsMiwxLjExLDUuMjEsMy4xOCwzLjE4aDBaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtOS43NyAtNS43NikiIGZpbGw9IiNlZDFjMjQiLz4NCiAgPC9nPg0KPC9zdmc+DQo=',
		electricityBadge: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MyIgaGVpZ2h0PSI0MyIgdmlld0JveD0iMCAwIDQzIDQzIj4NCiAgPHRpdGxlPkVsZWN0cmljaXR5IEJhZGdlPC90aXRsZT4NCiAgPGNpcmNsZSBjeD0iMjEuNSIgY3k9IjIxLjUiIHI9IjIwIiBmaWxsPSIjZmZmIiBzdHJva2U9IiM0ZDRkNGQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIzIi8+DQogIDxwYXRoIGQ9Ik0yOC42OSw1LjM4bC02LjQ2LS4wNmExLDEsMCwwLDAtLjgzLjQ2TDEzLjUyLDE4LjY1YTAuOTQsMC45NCwwLDAsMCwuODEsMS40M0wxNywyMCwxMC44MywzNC43OSwyNi42NiwxOS4zMmMwLjQzLS42OC0wLjA2LTAuODUtMC44Ni0wLjg1aC0zTDI5LjQ5LDcuNTlDMjkuOTEsNywzMC41OSw1LjM4LDI4LjY5LDUuMzhaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLjUgMS41KSIgZmlsbD0iIzRkNGQ0ZCIvPg0KPC9zdmc+DQo=',
		monetaryBadge: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MyIgaGVpZ2h0PSI0MyIgdmlld0JveD0iMCAwIDQzIDQzIj4NCiAgPHRpdGxlPk1vbmV0YXJ5IEJhZGdlPC90aXRsZT4NCiAgPGNpcmNsZSBjeD0iMjEuNSIgY3k9IjIxLjUiIHI9IjIwIiBmaWxsPSIjZmZmIiBzdHJva2U9IiM0ZDRkNGQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIzIi8+DQogIDx0ZXh0IHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyLjQ1IDMyLjI1KSIgZm9udC1zaXplPSIzMS40NiIgZmlsbD0iIzRkNGQ0ZCIgZm9udC1mYW1pbHk9Ik5pcm1hbGEgVUkiIGZvbnQtd2VpZ2h0PSI3MDAiPiQ8L3RleHQ+DQo8L3N2Zz4NCg==',
		productionBadge: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MyIgaGVpZ2h0PSI0MyIgdmlld0JveD0iMCAwIDQzIDQzIj4NCiAgPHRpdGxlPlByb2R1Y3Rpb24gQmFkZ2U8L3RpdGxlPg0KICA8Y2lyY2xlIGN4PSIyMS41IiBjeT0iMjEuNSIgcj0iMjAiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzRkNGQ0ZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjMiLz4NCiAgPHBhdGggZD0iTTI0LDIwLjg3VjVhMiwyLDAsMCwwLTItMkgxOWEyLDIsMCwwLDAtMiwyVjZoM1Y3SDE3VjloM3YxSDE3djJoM3YxSDE3djJoM3YxSDE3djQuODdBNy41LDcuNSwwLDEsMCwyNCwyMC44N1oiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEuNSAxLjUpIiBmaWxsPSIjNGQ0ZDRkIi8+DQo8L3N2Zz4NCg=='
	}

	const getNextNiceVal = uglyMaxNum => {
		const innerFunc = origVal => {
			origVal = Math.ceil(origVal);

			let arr = origVal.toString().split('').map(str => +str);
			const digits = arr.length
			if (digits === 1) return origVal >= 5 ? 10 : 5;
			for (let i = 2; i < digits; i++) {
				arr[i] = 0;
			}
			if (arr[1] < 5) {
				arr[1] = '5';
			} else {
				arr[0] = arr[0] + 1;
				arr[1] = '0';
			}

			return arr.join('')
		};
		return innerFunc(uglyMaxNum - 1) === uglyMaxNum ? uglyMaxNum : innerFunc(uglyMaxNum);
	};

	const getRateForDate = (selectedMonth, selectedYear, rates) => {
		for (let i = rates.length - 1; i >= 0; i--) {
			let pointedRate = rates[i]
			if ( pointedRate.year < selectedYear || (pointedRate.year === selectedYear && indexOfMonth[pointedRate.month] <= indexOfMonth[selectedMonth]) ) return pointedRate.rate;
		}
		return rates[0].rate || 0;
	};

	const getDataForDate = (month, year, categoriesData, activeEquipmentGroups, rates, equipmentHistoryNames, availableDates, arrayOfMeasuredOperatingHours) => {
		const [firstMonthMeasuredHrs, firstYearMeasuredHrs, currentMonthMeasuredHrs, currentYearMeasuredHrs] = arrayOfMeasuredOperatingHours;

		const firstYear = +Object.keys(availableDates).sort()[0];
		const dataIsForFirstMonth = month === availableDates[firstYear][1] && +year === firstYear ? true : false;
		const dataIsForFirstYear = month === 'All' && +year === firstYear ? true : false;
		const dataIsForCurrentMonth = month === thisMonth && +year === +thisYear ? true : false;
		const dataIsForCurrentYear = month === 'All' && +year === +thisYear ? true : false;
		const predictedShown = dataIsForFirstMonth || dataIsForFirstYear || dataIsForCurrentMonth || dataIsForCurrentYear ? true : false;

		let categoryDataForDate = predictedShown ? [
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
			},
			{
				category: 'predicted',
				kwh: 0,
				cost: 0.05,
				trh: 0,
				rate: 0 //weighted avg of multiple rates if for yr rather than month
			}
		] : [
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
		activeEquipmentGroups.forEach(equip => {
			equipmentDataForDate.push(
				{
					type: equip,
					utilityRate: predictedShown ? [
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
						},
						{
							category: 'predicted',
							rate: 0,
							cost: 0,
							accumulatedCost: 0
						}
					] : [
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
					kwh: predictedShown ? [
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
						},
						{
							category: 'predicted',
							value: 0,
							accumulated: 0
						}
					] : [
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


		//categories data does not include predicted
		categoriesData.forEach((categoryData, categoryIndex) => {
			categoryData.forEach(monthlyDatum => {
				// if (months set to all OR current month matches) && (category is baseline or projected OR year matches)
				if (((month === 'All' && availableDates[year] && availableDates[year].includes(monthlyDatum.month)) || monthlyDatum.month === month) && (categoryIndex !== 2 || monthlyDatum.year == year)) {
					equipmentDataForDate.forEach((equipmentGroup, egIndex) => {
						// set kwh vals
						if (monthlyDatum.equipmentKwhs[equipmentHistoryNames[egIndex]]) equipmentGroup.kwh[categoryIndex].value += monthlyDatum.equipmentKwhs[equipmentHistoryNames[egIndex]];	//default to 0 if missing data for date
						// set utility rates for baseline and measured
						if (categoryIndex !== 1) {
							const monthlyDatumRate = getRateForDate(monthlyDatum.month, monthlyDatum.year, rates)
							if (month === 'All') {
								let currentObj = equipmentRatesAndWeights[egIndex].utilityRate[categoryIndex].ratesAndWeights
								if (!currentObj[monthlyDatum.rate]) currentObj[monthlyDatumRate] = 0;
								currentObj[monthlyDatumRate]++
							} else {
								equipmentGroup.utilityRate[categoryIndex].rate = monthlyDatumRate;
							}
						}
					});
					// set system level trh vals for baseline and measured
					if (categoryIndex !== 1 && monthlyDatum.trh) categoryDataForDate[categoryIndex].trh += monthlyDatum.trh;	//default to 0 if missing data for date
				}
			});
		});


		equipmentDataForDate.forEach((equipmentGroup, egIndex) => {
			//set accum kwh vals for all categories except predicted
			equipmentGroup.kwh.slice(0, 3).forEach((category, catIndex) => {
				category.accumulated += category.value;
				if (egIndex > 0) {
					category.accumulated += equipmentDataForDate[egIndex - 1].kwh[catIndex].accumulated;
				}
				categoryDataForDate[catIndex].kwh = category.accumulated;
			});
			
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
				});
			}
			//set projected rates to be equal to the baseline rates
			equipmentGroup.utilityRate[1].rate = equipmentGroup.utilityRate[0].rate;
			//set costs, accum costs, and system level rates for non predicted categories
			equipmentGroup.utilityRate.filter((theCat, idx) => idx < 3).forEach((category, catIndex) => {
				category.cost = category.rate * equipmentGroup.kwh[catIndex].value;
				category.accumulatedCost = category.rate * equipmentGroup.kwh[catIndex].accumulated;
				categoryDataForDate[catIndex].cost = category.accumulatedCost;
				categoryDataForDate[catIndex].rate = category.rate;
			});


			//if predictedShown for date, fill in predicted ***equipmentDataForDate*** kwh's value and accum & utility rate's rate, cost, and accum cost
			if (predictedShown) {
				equipmentGroup.utilityRate[3].rate = equipmentGroup.utilityRate[2].rate;
				if (dataIsForCurrentMonth) {
					equipmentGroup.kwh[3].value = getPredictedForMonth(year, month, equipmentGroup.kwh[2].value, currentMonthMeasuredHrs);
				} else if (dataIsForCurrentYear) {
					equipmentGroup.kwh[3].value = getPredictedForYear(year, equipmentGroup.kwh[2].value, currentYearMeasuredHrs, availableDates);
				} else if (dataIsForFirstMonth) {
					equipmentGroup.kwh[3].value = getPredictedForMonth(year, month, equipmentGroup.kwh[2].value, firstMonthMeasuredHrs);
				} else {	//dataIsForFirstYear
					equipmentGroup.kwh[3].value = getPredictedForYear(year, equipmentGroup.kwh[2].value, firstYearMeasuredHrs, availableDates);
				}
				equipmentGroup.kwh[3].accumulated += equipmentGroup.kwh[3].value;
				if (egIndex > 0) equipmentGroup.kwh[3].accumulated += equipmentDataForDate[egIndex - 1].kwh[3].accumulated;
				equipmentGroup.utilityRate[3].cost = equipmentGroup.utilityRate[3].rate * equipmentGroup.kwh[3].value;
				equipmentGroup.utilityRate[3].accumulatedCost = equipmentGroup.utilityRate[3].rate * equipmentGroup.kwh[3].accumulated;
			}
		});

		//if predicted shown for date, set ***categoryDataForDate*** predicted rate & trh for this date
		if (predictedShown) {
			categoryDataForDate[3].rate = categoryDataForDate[2].rate;
			if (dataIsForCurrentMonth) {
				categoryDataForDate[3].trh = getPredictedForMonth(year, month, categoryDataForDate[2].trh, currentMonthMeasuredHrs);
				categoryDataForDate[3].kwh = getPredictedForMonth(year, month, categoryDataForDate[2].kwh, currentMonthMeasuredHrs);
			} else if (dataIsForCurrentYear) {
				categoryDataForDate[3].trh = getPredictedForYear(year, categoryDataForDate[2].trh, currentYearMeasuredHrs, availableDates);
				categoryDataForDate[3].kwh = getPredictedForYear(year, categoryDataForDate[2].kwh, currentYearMeasuredHrs, availableDates);
			} else if (dataIsForFirstMonth) {
				categoryDataForDate[3].trh = getPredictedForMonth(year, month, categoryDataForDate[2].trh, firstMonthMeasuredHrs);
				categoryDataForDate[3].kwh = getPredictedForMonth(year, month, categoryDataForDate[2].kwh, firstMonthMeasuredHrs);
			} else {	//dataIsForFirstYear
				categoryDataForDate[3].trh = getPredictedForYear(year, categoryDataForDate[2].trh, firstYearMeasuredHrs, availableDates);
				categoryDataForDate[3].kwh = getPredictedForYear(year, categoryDataForDate[2].kwh, firstYearMeasuredHrs, availableDates);
			}
			categoryDataForDate[3].cost = categoryDataForDate[3].kwh * categoryDataForDate[3].rate;
		}

		return {categoryDataForDate, equipmentDataForDate};
	};



////////////////////////////////////////////////////////////////
	// Define Widget Constructor & Exposed Properties
////////////////////////////////////////////////////////////////

	var CxUtilitySavingsTool = function() {
		var that = this;
		Widget.apply(this, arguments);
		that.properties().addAll([
			{
				name: 'backgroundColor',
				value: 'rgb(245,245,245)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'systemName',
				value: 'System'
			},
			{
				name: 'currencyName',
				value: 'USD'
			},
			// if this value is changed from the string null, this value will be used to populate currency symbol rather than that from facets or default of $
			{
				name: 'facetsCurrencySymbolOverride',
				value: 'null'
			},
			// if this value is changed from the string null, this value will be used to populate currency precision rather than that from facets or default of 2
			{
				name: 'facetsCurrencyPrecisionOverride',
				value: 'null'
			},
			{
				name: 'includePCPs',
				value: true
			},
			{
				name: 'includeSCPs',
				value: true
			},
			{
				name: 'includeTWPs',
				value: true
			},
			{
				name: 'includeCTFs',
				value: false
			},
			{
				name: 'measuredColor',
				value: 'rgb(105,202,210)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'baselineColor',
				value: 'rgb(66,88,103)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'projectedColor',
				value: 'rgb(252,181,80)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'unitsColor',
				value: 'black',
				typeSpec: 'gx:Color'
			},
			{
				name: 'toolTitleColor',
				value: 'rgb(51,51,51)',
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
				name: 'dropdownFillColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'hoveredFillColor',
				value: '#d5d6d4',
				typeSpec: 'gx:Color'
			},
			{
				name: 'tickTextColor',
				value: 'black',
				typeSpec: 'gx:Color'
			},
			{
				name: 'axesColor',
				value: 'black',
				typeSpec: 'gx:Color'
			},
			{
				name: 'legendTextColor',
				value: 'black',
				typeSpec: 'gx:Color'
			},
			{
				name: 'currencySymbolColor',
				value: 'rgb(51,65,78)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'utilityRateColor',
				value: 'rgb(64,64,64)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'changePercentColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'changeValueColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'tooltipFontColor',
				value: 'black',
				typeSpec: 'gx:Color'
			},
			{
				name: 'tooltipBackgroundColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'changeToolRectColor',
				value: 'rgb(51,65,78)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'sysBtnBackgroundColor',
				value: 'rgb(68,108,179)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'eqBtnTextColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'eqBtnBackgroundColor',
				value: 'rgb(34,181,115)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'sysBtnTextColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'tooltipOpacity',
				value: 0.8,
			},
			{
				name: 'btnKnobColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			}
		]);

		subscriberMixIn(that);
	};

	CxUtilitySavingsTool.prototype = Object.create(Widget.prototype);
	CxUtilitySavingsTool.prototype.constructor = CxUtilitySavingsTool;



////////////////////////////////////////////////////////////////
	// / * SETUP DEFINITIONS AND DATA * /
////////////////////////////////////////////////////////////////


	const setupDefinitions = widget => {


		// FROM USER // 
		const data = widget.properties().toValueMap();	//obj with all exposed properties as key/value pairs
		// FROM JQ //
		const jq = widget.jq();
		data.jqWidth = jq.width() || 880;
		data.jqHeight = jq.height() || 440;

		// ACTIVE EQUIPMENT GROUPS PRE- HISTORY DATA //
		data.activeEquipmentGroups = [
			'CHs',
			'PCPs',
			'SCPs',
			'TWPs',
			'CTFs',
		];
		if (!data.includeCTFs) data.activeEquipmentGroups.splice(4, 1)
		if (!data.includeTWPs) data.activeEquipmentGroups.splice(3, 1)
		if (!data.includeSCPs) data.activeEquipmentGroups.splice(2, 1)
		if (!data.includePCPs) data.activeEquipmentGroups.splice(1, 1)
		data.equipmentHistoryNames = data.activeEquipmentGroups.map(type => {
			if (type === 'CHs') return 'Chillers';
			if (type === 'PCPs') return 'Pcwps';
			if (type === 'SCPs') return 'Scwps';
			if (type === 'TWPs') return 'Twps';
			if (type === 'CTFs') return 'Towers';
		});

		// SIZING //
		function chooseSize (jqH, jqW) {
			if (jqW < 1200 || jqH < 700) {
				return [small, 'small'];		//880, 440
			} else if (jqW < 1600 || jqH < 850) {
				return [medium, 'medium'];		// 1200, 700
			} else {
				return [large, 'large'];		//1600, 850 
			}
		}
		const widgetDimensions = chooseSize(data.jqHeight, data.jqWidth)[0];
		data.widgetSize = chooseSize(data.jqHeight, data.jqWidth)[1];
		
		data.margin = {top: 5, left: 5, right: 0, bottom: 0};
		data.graphicHeight = widgetDimensions.height - (data.margin.top + data.margin.bottom);
		data.graphicWidth = widgetDimensions.width - (data.margin.left + data.margin.right);

		// FONTS //
		if (data.widgetSize === 'small') {
			data.unitsFont = 'bold 9pt Nirmala UI';
			data.buttonFont = 'bold 12pt Nirmala UI';
			data.tooltipFont = '10pt Nirmala UI';
			data.changeValueFont = '12pt Nirmala UI';
			data.changePercentFont = 'bold 24pt Nirmala UI';
			data.toolTitleFont = 'bold 12pt Nirmala UI';
			data.dropdownFont = '10.5pt Nirmala UI';
			data.tickFont = '8.5pt Nirmala UI';
			data.systemNameFont = '9.5pt Nirmala UI';
			data.legendFont = '10pt Nirmala UI';
			data.currencySymbolFont = 'bold 10.5pt Nirmala UI';
			data.utilityRateFont = 'bold 15pt Nirmala UI';
		} else if (data.widgetSize === 'medium') {
			data.unitsFont = 'bold 11pt Nirmala UI';
			data.buttonFont = 'bold 13.5pt Nirmala UI';
			data.tooltipFont = '11pt Nirmala UI';
			data.changeValueFont = '14.5pt Nirmala UI';
			data.changePercentFont = 'bold 28pt Nirmala UI';
			data.toolTitleFont = 'bold 14pt Nirmala UI';
			data.dropdownFont = '12pt Nirmala UI';
			data.tickFont = '12pt Nirmala UI';
			data.systemNameFont = '12pt Nirmala UI';
			data.legendFont = '12pt Nirmala UI';
			data.currencySymbolFont = 'bold 13pt Nirmala UI';
			data.utilityRateFont = 'bold 20pt Nirmala UI';
		} else {
			data.unitsFont = 'bold 13pt Nirmala UI';
			data.buttonFont = 'bold 15pt Nirmala UI';
			data.tooltipFont = '12.5pt Nirmala UI';
			data.changeValueFont = '17pt Nirmala UI';
			data.changePercentFont = 'bold 32pt Nirmala UI';
			data.toolTitleFont = 'bold 16pt Nirmala UI';
			data.dropdownFont = '13.5pt Nirmala UI';
			data.tickFont = '15pt Nirmala UI';
			data.systemNameFont = '15pt Nirmala UI';
			data.legendFont = '15pt Nirmala UI';
			data.currencySymbolFont = 'bold 15.5pt Nirmala UI';
			data.utilityRateFont = 'bold 25pt Nirmala UI';
		}
	

		// GLOBALS PER INSTANCE //
		data.paddingBetweenTooltipText = data.widgetSize === 'large' ? 5 : (data.widgetSize === 'medium' ? 4 : 3);
		data.tooltipPadding = data.widgetSize === 'large' ? 12 : (data.widgetSize === 'medium' ? 7 : 5);
		data.paddingAfterLegendCat = 5;
		
		if (!widget.year) widget.year = thisYear;
		if (!widget.month) widget.month = 'All';
		
		if (!widget.equipmentHovered) widget.equipmentHovered = 'none';	//alternative selections are equipment group names
		if (!widget.equipmentPinned) widget.equipmentPinned = 'none';	//alternative selections are equipment group names
		
		if (!widget.systemIsHovered) widget.systemIsHovered = false; 	//alternative selection is true
		if (!widget.systemIsPinned) widget.systemIsPinned = false; 	//alternative selection is true
		
		if (!widget.trhIsHovered) widget.trhIsHovered = false;	//alternative selection is true
		if (!widget.trhIsPinned) widget.trhIsPinned = false;	//alternative selection is true
		
		if (!widget.legendHovered) widget.legendHovered = 'none';	// alternative selections are category names
		
		if (!widget.monthDropDownSelected) widget.monthDropDownSelected = 'All';
		if (!widget.yearDropDownSelected) widget.yearDropDownSelected = thisYear;
		if (!widget.activeChartType) widget.activeChartType = 'stacked';	//alternative selection 'grouped'
		if (!widget.modalActive) widget.modalActive = false; // alternative selection is true

		


		// GET HISTORY DATA //
			//data to populate
		// SEE CALCULATED: data.firstMonthMeasuredHrs = 0;
		// SEE CALCULATED: data.firstYearMeasuredHrs = 0;
		data.currentMonthMeasuredHrs = 0;
		data.currentYearMeasuredHrs = 0;

		const blendedRateDates = {};
		const baselineDates = {};
		const projectedDates = {};
		const measuredDates = {};
		
		data.blendedRates = [];
		data.baselineData = [];
		data.projectedData = [];
		data.measuredData = [];
		data.currencySymbol = data.facetsCurrencySymbolOverride === 'null' ? '$' : data.facetsCurrencySymbolOverride;
		data.currencyPrecision = data.facetsCurrencyPrecisionOverride === 'null' ? 2 : data.facetsCurrencyPrecisionOverride;
		
		const sysHrsBatchResolve = new baja.BatchResolve(['history:^System_StdHrHm', 'history:^System_OptHrHm', 'history:^System_StdHrCm', 'history:^System_OptHrCm']);

		//temp vars for calculating first month and year operating hours
		let hm = {
			std: {
				firstMonth: {
					month: undefined,
					measuredHrs: 0
				},
				firstYear: {
					year: undefined,
					measuredHrs: 0
				}
			},
			opt: {
				firstMonth: {
					month: undefined,
					measuredHrs: 0
				},
				firstYear: {
					year: undefined,
					measuredHrs: 0
				}
			}
		}
		let cm = {
			std: {
				firstMonth: {
					month: undefined,
					measuredHrs: 0
				},
				firstYear: {
					year: undefined,
					measuredHrs: 0
				}
			},
			opt: {
				firstMonth: {
					month: undefined,
					measuredHrs: 0
				},
				firstYear: {
					year: undefined,
					measuredHrs: 0
				}
			}
		}
		// let hm.std.firstMonth.month, hm.std.firstYear.year, hm.opt.firstMonth.month, hm.opt.firstYear.year, cm.std.firstMonth.month, cm.std.firstYear.year, cm.opt.firstMonth.month, cm.opt.firstYear.year;
		// let hm.opt.firstYear.measuredHrs = 0;
		// let hm.opt.firstMonth.measuredHrs = 0;
		// let hm.std.firstYear.measuredHrs = 0;
		// let hm.std.firstMonth.measuredHrs = 0;
		// let cm.opt.firstYear.measuredHrs = 0;
		// let cm.opt.firstMonth.measuredHrs = 0;
		// let cm.std.firstYear.measuredHrs = 0;
		// let cm.std.firstMonth.measuredHrs = 0;
	
    return sysHrsBatchResolve.resolve()
      .then(() => {
        const [stdHrsHmTable, optHrsHmTable, stdHrsCmTable, optHrsCmTable] = sysHrsBatchResolve.getTargetObjects();
        return Promise.all([
          stdHrsHmTable.cursor({limit: 1200, each: (row, index) => {
						const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
						const rowValue = +row.get('value');
						const rowYear = timestamp.getFullYear();
						const rowMonth = timestamp.getMonth();
						if (index === 0) {
							hm.std.firstMonth.month = rowMonth;
							hm.std.firstYear.year = rowYear;
							hm.std.firstMonth.measuredHrs = rowValue;
						}
						if (hm.std.firstYear.year === rowYear) hm.std.firstYear.measuredHrs += rowValue;
						if (thisYear === rowYear) data.currentYearMeasuredHrs += rowValue;
					}}),
          optHrsHmTable.cursor({limit: 1200, each: (row, index) => {
						const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
						const rowValue = +row.get('value');
						const rowYear = timestamp.getFullYear();
						const rowMonth = timestamp.getMonth();
						if (index === 0) {
							hm.opt.firstMonth.month = rowMonth;
							hm.opt.firstYear.year = rowYear;
							hm.opt.firstMonth.measuredHrs = rowValue;
						}
						if (hm.opt.firstYear.year === rowYear) hm.opt.firstYear.measuredHrs += rowValue;
						if (thisYear === rowYear) data.currentYearMeasuredHrs += rowValue;
					}}),
          stdHrsCmTable.cursor({limit: 1, each: row => {
						const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
						const rowValue = +row.get('value');
						cm.std.firstMonth.month = timestamp.getMonth();
						cm.std.firstYear.year = timestamp.getFullYear();
						cm.std.firstMonth.measuredHrs = rowValue;
						cm.std.firstYear.measuredHrs = rowValue;

						data.currentYearMeasuredHrs += rowValue;
						data.currentMonthMeasuredHrs += rowValue;
					}}),
          optHrsCmTable.cursor({limit: 1, each: row => {
						const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
						const rowValue = +row.get('value');
						cm.opt.firstMonth.month = timestamp.getMonth();
						cm.opt.firstYear.year = timestamp.getFullYear();
						cm.opt.firstMonth.measuredHrs = rowValue;
						cm.opt.firstYear.measuredHrs = rowValue;

						data.currentYearMeasuredHrs += rowValue;
						data.currentMonthMeasuredHrs += rowValue;
					}})
        ]);
      })
      .catch(err => console.error('UST ERROR sysHrs batchResolve failed: ' + err))
			//return blended utility rate history trend
			.then(() => widget.resolve(`history:^System_Bur`))
			.then(historyTable => {
				if (data.facetsCurrencySymbolOverride === 'null') data.currencySymbol = historyTable.getCol('value').getFacets().get('units') || '$';
				if (data.facetsCurrencyPrecisionOverride === 'null') data.currencyPrecision = historyTable.getCol('value').getFacets().get('precision') || 2;
				return historyTable.cursor({
					limit: 5000000,
					each: function(row, index) {
						const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
						const rowValue = +row.get('value');
						const rowMonth = timestamp.getMonth();
						const rowYear = timestamp.getFullYear();
						if (rowValue > 0){
							if (!blendedRateDates[rowYear]) blendedRateDates[rowYear] = {};
							if (!blendedRateDates[rowYear][rowMonth]) blendedRateDates[rowYear][rowMonth] = {total: 0, count: 0};
							blendedRateDates[rowYear][rowMonth].total += rowValue;
							blendedRateDates[rowYear][rowMonth].count ++;
						}
					}
				});
			})
			.catch(err => console.error('Could not iterate over blended utility rate history trend: ' + err))
			.then(() => {
				// push into ordered arr format with avg rates for months with more than one rate
				const rateYears = Object.keys(blendedRateDates).sort((a, b) => a - b);
				rateYears.forEach(year => {
					const rateMonths = Object.keys(blendedRateDates[year]).sort((a, b) => a - b);
					rateMonths.forEach(month => {
						const thisMonthData = blendedRateDates[year][month]
						data.blendedRates.push({
							rate: thisMonthData.total / thisMonthData.count,
							month: months[+month],
							year: +year
						});
					});
				});

				//return trh history trends
				return Promise.all([widget.resolve(`history:^System_BlTrHm`), widget.resolve(`history:^System_MsTrHm`), widget.resolve(`history:^System_MsTrCm`)])
				
			})
			.then(historyTrendTables => {

				const [baselineTable, measuredTable, measuredTableCurrentMonth] = historyTrendTables;
				const iterativePromises = [
					baselineTable.cursor({
						limit: 5000000,
						each: function(row, index) {
							const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
							const rowValue = +row.get('value');
							const rowMonth = timestamp.getMonth();
							const rowYear = timestamp.getFullYear();

							if (!baselineDates[rowYear]) baselineDates[rowYear] = {};
							if (!baselineDates[rowYear][rowMonth]) baselineDates[rowYear][rowMonth] = {trh: 0, kwh: {}};
							baselineDates[rowYear][rowMonth].trh = rowValue;
						}
					}),
					measuredTable.cursor({
						limit: 5000000,
						each: function(row, index) {
							const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
							const rowValue = +row.get('value');
							const rowMonth = timestamp.getMonth();
							const rowYear = timestamp.getFullYear();

							if (!measuredDates[rowYear]) measuredDates[rowYear] = {};
							if (!measuredDates[rowYear][rowMonth]) measuredDates[rowYear][rowMonth] = {trh: 0, kwh: {}};
							measuredDates[rowYear][rowMonth].trh = rowValue;
						}
					}),
					measuredTableCurrentMonth.cursor({
						limit: 5000000,
						each: function(row, index) {
							const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
							const rowValue = +row.get('value');
							const rowMonth = timestamp.getMonth();
							const rowYear = timestamp.getFullYear();
							if (!measuredDates[rowYear]) measuredDates[rowYear] = {};
							if (!measuredDates[rowYear][rowMonth]) measuredDates[rowYear][rowMonth] = {trh: 0, kwh: {}};
							measuredDates[rowYear][rowMonth].trh = rowValue;
						}
					})
				];
					
				return Promise.all(iterativePromises);
				
			})
			.catch(err => 'error iterating through trh trends: ' + err)
			.then(() => {
			
				const populateEquipmentTrendData = (eqType, eqTypeIndex) => {
					return Promise.all([widget.resolve(`history:^${eqType}_BlKwHm`), widget.resolve(`history:^${eqType}_PrKwHm`), widget.resolve(`history:^${eqType}_MsKwHm`), widget.resolve(`history:^${eqType}_MsKwCm`)])
					.then(histories => {
						const [baselineKwh, projectedKwh, measuredKwh, currentMonthMeasuredKwh] = histories;
						const iterativeKwhPromises = [
							baselineKwh.cursor({
								limit: 5000000,
								each: function(row, index) {
									const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
									const rowValue = +row.get('value');
									const rowMonth = timestamp.getMonth();
									const rowYear = timestamp.getFullYear();
									if (!baselineDates[rowYear]) baselineDates[rowYear] = {};
									if (!baselineDates[rowYear][rowMonth]) baselineDates[rowYear][rowMonth] = {trh: 0, kwh: {}};
									baselineDates[rowYear][rowMonth].kwh[data.equipmentHistoryNames[eqTypeIndex]] = rowValue;
								}
							}),
							projectedKwh.cursor({
								limit: 5000000,
								each: function(row, index) {
									const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
									const rowValue = +row.get('value');
									const rowMonth = timestamp.getMonth();
									const rowYear = timestamp.getFullYear();
									if (!projectedDates[rowYear]) projectedDates[rowYear] = {};
									if (!projectedDates[rowYear][rowMonth]) projectedDates[rowYear][rowMonth] = {kwh: {}};
									projectedDates[rowYear][rowMonth].kwh[data.equipmentHistoryNames[eqTypeIndex]] = rowValue;
								}
							}),
							measuredKwh.cursor({
								limit: 5000000,
								each: function(row, index) {
									const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
									const rowValue = +row.get('value');
									const rowMonth = timestamp.getMonth();
									const rowYear = timestamp.getFullYear();
									if (rowMonth !== thisMonthIndex || rowYear !== thisYear) {
										if (!measuredDates[rowYear]) measuredDates[rowYear] = {};
										if (!measuredDates[rowYear][rowMonth]) measuredDates[rowYear][rowMonth] = {trh: 0, kwh: {}};
										measuredDates[rowYear][rowMonth].kwh[data.equipmentHistoryNames[eqTypeIndex]] = rowValue;
									}
								}
							}),
							currentMonthMeasuredKwh.cursor({
								limit: 5000000,
								each: function(row, index) {
									const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
									const rowValue = +row.get('value');
									const rowMonth = timestamp.getMonth();
									const rowYear = timestamp.getFullYear();
									if (!measuredDates[rowYear]) measuredDates[rowYear] = {};
									if (!measuredDates[rowYear][rowMonth]) measuredDates[rowYear][rowMonth] = {trh: 0, kwh: {}};
									measuredDates[rowYear][rowMonth].kwh[data.equipmentHistoryNames[eqTypeIndex]] = rowValue;
								}
							})
						]

						return Promise.all(iterativeKwhPromises);
						
					})
					.catch(err => console.error('error finding or iterating through ' + eqType + 'historyTrends: ' + err))
				};
				// return kwh trends for each eqType
				return Promise.all(data.equipmentHistoryNames.map((eqType, eqIndex) => populateEquipmentTrendData(eqType, eqIndex)));
				
			})
			.catch(err => {console.error('error promising all active eqs: ' + err)})
			.then(() => {
				//// pick out true first data for operating hours ////
				let haveCorrectFirstMonthAndYear = [];
				let haveCorrectFirstYear = [];
				let trueFirstMonth = 12;	//starting at higher than greatest month index can be
				let trueFirstYear = Number.POSITIVE_INFINITY;	//starting at higher than greatest year can be
				//which history objs haveCorrectFirstYear?
				[hm.std, hm.opt, cm.std, cm.opt].forEach(historyObj => {
					if (historyObj.firstYear.year === trueFirstYear) {
						haveCorrectFirstYear.push(historyObj);
					} else if (historyObj.firstYear.year < trueFirstYear) {
						haveCorrectFirstYear = [historyObj];
						trueFirstYear = historyObj.firstYear.year;
					}
				});
				//out of those with the haveCorrectFirstYear, which haveCorrectFirstMonthAndYear?
				haveCorrectFirstYear.forEach(historyObj => {
					if (historyObj.firstMonth.month === trueFirstMonth) {
						haveCorrectFirstMonthAndYear.push(historyObj);
					} else if (historyObj.firstMonth.month < trueFirstMonth) {
						haveCorrectFirstMonthAndYear = [historyObj];
						trueFirstMonth = historyObj.firstMonth.month;
					}
				});
				// given the historyObjs that haveCorrectFirstMonthAndYear, determine firstMonth measured operating hours
				data.firstMonthMeasuredHrs = haveCorrectFirstMonthAndYear.reduce((accum, curr) => accum + curr.firstMonth.measuredHrs, 0);
				// given the historyObjs that haveCorrectFirstYear, determine firstYear measured operating hours
				data.firstYearMeasuredHrs = haveCorrectFirstYear.reduce((accum, curr) => accum + curr.firstYear.measuredHrs, 0);



				///// push kwhs and trhs into ordered arr formats ////
				const baselineYears = Object.keys(baselineDates).sort((a, b) => a - b);
				baselineYears.forEach(year => {
					const baselineMonths = Object.keys(baselineDates[year]).sort((a, b) => a - b);
					baselineMonths.forEach(month => {
						const thisMonthData = baselineDates[year][month]
						data.baselineData.push({
							month: months[+month],
							year: +year,
							trh: thisMonthData.trh,
							equipmentKwhs: thisMonthData.kwh
						});
					});
				});
				const projectedYears = Object.keys(projectedDates).sort((a, b) => a - b);
				projectedYears.forEach(year => {
					const projectedMonths = Object.keys(projectedDates[year]).sort((a, b) => a - b);
					projectedMonths.forEach(month => {
						const thisMonthData = projectedDates[year][month]
						data.projectedData.push({
							month: months[+month],
							year: +year,
							equipmentKwhs: thisMonthData.kwh
						});
					});
				});
				const measuredYears = Object.keys(measuredDates).sort((a, b) => a - b);
				measuredYears.forEach(year => {
					const measuredMonths = Object.keys(measuredDates[year]).sort((a, b) => a - b);
					measuredMonths.forEach(month => {
						const thisMonthData = measuredDates[year][month]
						data.measuredData.push({
							month: months[+month],
							year: +year,
							trh: thisMonthData.trh,
							equipmentKwhs: thisMonthData.kwh
						});
					});
				});

				// CALCULATED DEFS //
				data.utilityRate = data.blendedRates[data.blendedRates.length - 1].rate;
				if (!widget.blendedUtilityRateSelection) widget.blendedUtilityRateSelection = +data.utilityRate;
				if (!widget.blendedUtilityRate) widget.blendedUtilityRate = widget.blendedUtilityRateSelection;
				data.formatCurrency = d3.format(`,.${data.currencyPrecision}f`);
				data.formatAvgCurrency = d3.format(`,.${+data.currencyPrecision + 1}f`);
				data.arrowWidth = getTextWidth('W', data.changePercentFont);

					//get dataForDate
				data.availableDates = {};
				data.measuredData.forEach(date => {
					if (!data.availableDates[date.year]) {
						data.availableDates[date.year] = [];
					}
					data.availableDates[date.year].push(date.month);
				})

				data.availableYears = Object.keys(data.availableDates).sort((a,b) => b - a);
				data.availableYears.forEach(yr => data.availableDates[yr].unshift('All'));
				if (!data.availableDates[widget.yearDropDownSelected]) widget.yearDropDownSelected = data.availableYears[data.availableYears.length - 1];
				
				const arrayOfMeasuredOperatingHours = [data.firstMonthMeasuredHrs, data.firstYearMeasuredHrs, data.currentMonthMeasuredHrs, data.currentYearMeasuredHrs];

				widget.dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected, [data.baselineData, data.projectedData, data.measuredData], data.activeEquipmentGroups, data.blendedRates, data.equipmentHistoryNames, data.availableDates, arrayOfMeasuredOperatingHours)
				// eg format: {2017: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 2018: ['Jan', 'Feb', 'Mar']}

					// Funcs utilizing widget
				widget.updateDateWidgetRendering = () => {
					widget.dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected, [data.baselineData, data.projectedData, data.measuredData], data.activeEquipmentGroups, data.blendedRates, data.equipmentHistoryNames, data.availableDates, arrayOfMeasuredOperatingHours)
					render(widget, true);
				}
				widget.dropdownYearChanged = val => {
					widget.yearDropDownSelected = val;
					widget.monthDropDownSelected = 'All';
					widget.updateDateWidgetRendering()

				};
				widget.dropdownMonthChanged = val => {
					widget.monthDropDownSelected = val;
					widget.updateDateWidgetRendering()
				};
				widget.resetElements = elementsToReset => {
					const selectionForCheck = widget.outerDiv.selectAll(elementsToReset)
					if (!selectionForCheck.empty()) selectionForCheck.remove();
				};



				return data;
			})
			.catch(err => console.error('error resolving histories: ' + err));
	};




////////////////////////////////////////////////////////////////
	// Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
////////////////////////////////////////////////////////////////

	const renderWidget = (widget, data) => {
    d3.select(widget.outerDiv.node().parentNode).style('background-color', data.backgroundColor);
		// delete leftover elements from versions previously rendered
		if (!widget.outerDiv.empty()) widget.outerDiv.selectAll('*').remove();


		// SVG INITIALIZATION //
		widget.svg = widget.outerDiv.append('svg')
			.attr('class', 'log')
			.attr('width', data.graphicWidth)
			.attr('height', data.graphicHeight)
			.on('mousedown', unpin);

		// TOOL DEFS //
		const paddingLeftOfTools = 20;
		const dateDropdownWidth = data.widgetSize === 'small' ? 100 : 140;
		const paddingBetweenDropdowns = data.widgetSize === 'large' ? 30 : 20;
		const paddingUnderDropdownTitles = 8;


		// GENERAL GROUPS //
		const graphicGroup = widget.svg.append('g')
			.attr('class', 'graphicGroup')
			.attr('transform', `translate(${data.margin.left}, ${data.margin.top})`);

		const toolsGroupHeight = data.widgetSize === 'small' ? 110 : (data.widgetSize === 'medium' ? 120 : 130);
		const paddingBetweenToolsAndCharts = data.widgetSize === 'large' ? 50 : 30;
		const paddingAboveUtilityRate = 15;
		const toolsGroup = graphicGroup.append('g')
			.attr('class', 'toolsGroup')

		const paddingLeftOfButton = data.widgetSize === 'small' ? 20 : (data.widgetSize === 'medium' ? 30 : 60);
		const utilityRateGroup = toolsGroup.append('g')
			.attr('class', 'utilityRateGroup')
			.attr('transform', `translate(${paddingLeftOfTools}, ${getTextHeight(data.toolTitleFont) + paddingUnderDropdownTitles + getTextHeight(data.dropdownFont) + paddingAboveUtilityRate})`)

		const buttonGroup = toolsGroup.append('g')
			.attr('class', 'buttonGroup')
			.attr('transform', `translate(${paddingLeftOfTools + (dateDropdownWidth * 1.35) + paddingBetweenDropdowns + paddingLeftOfButton}, ${getTextHeight(data.toolTitleFont) + paddingUnderDropdownTitles + getTextHeight(data.dropdownFont) + paddingAboveUtilityRate})`)
			.style('cursor', 'pointer')

		const paddingBetweenCharts = 0;

		const chartsGroup = graphicGroup.append('g')
				.attr('class', 'chartsGroup')
				.attr('transform', `translate(0, ${toolsGroupHeight + paddingBetweenToolsAndCharts})`);

		const yAxisWidth = getTextWidth('8,888,888,888', data.tickFont);
		const xAxisHeight = 25;
		const chartWidth = (data.graphicWidth - ((paddingBetweenCharts * 2) + yAxisWidth)) / 2.5;
		const modalWidth = chartWidth / 2;

		const circleRadius = data.widgetSize === 'small' ? 5.5 : (data.widgetSize === 'medium' ? 6.5 : 7.5);
		const hoveredCircleRadius = circleRadius * 1.1

		const legendWidths = [
			getTextWidth('Baseline', data.legendFont) + (circleRadius * 2.5),
			getTextWidth('Projected', data.legendFont) + (circleRadius * 2.5),
			getTextWidth('Measured', data.legendFont) + (circleRadius * 2.5)
		];
		const paddingBetweenLegendCategories = data.widgetSize === 'large' ? 25 : (data.widgetSize === 'medium' ? 20 : 15)

		const legendWidth = legendWidths.reduce((accum, curr) => accum + curr) + (paddingBetweenLegendCategories * 2);
		const legendHeight = data.widgetSize === 'large' ? 40 : (data.widgetSize === 'medium' ? 35 : 30);

		const paddingAboveLegend = data.widgetSize === 'large' ? 60 : (data.widgetSize === 'medium' ? 50 : 40);
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



		// ***************************************	SCALES, GENERATORS, AND TICKS FOR CHARTS ************************************************ //
		//TICKS
		const getMaxYTick = (groupedOrStacked, chartName) => {
			let mapFuncForArrOfEquipVals = chartName === 'kwh' ?
				modObj => modObj.kwh.map(cat => cat.value) :
				modObj => modObj.utilityRate.map(cat => cat.cost); 

			let allVals;

			if (groupedOrStacked === 'grouped' && chartName !== 'trh'){
				const arraysOfVals = widget.dataForDate.equipmentDataForDate.map(mapFuncForArrOfEquipVals);
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
			.paddingInner(0.15)
			.rangeRound([0, x0Scale.bandwidth()]);

		const trhXScale = d3.scaleBand()
			.paddingOuter(0.8)
			.paddingInner(0.4)
			.domain(categories.filter((cat, catIndex) => catIndex != 1).map(cat => cat.name))	//equipmentTypes or categories
			.rangeRound([0, trhBarSectionWidth])

		const xAxisGenerator = d3.axisBottom()
			.scale(x0Scale)
			.tickSize(widget.activeChartType === 'grouped' ? 6 : 0)
			.tickSizeOuter(0)
			.tickFormat(d => widget.activeChartType === 'grouped' ? d : null);

		const trhXAxisGenerator = d3.axisBottom()
			.scale(trhXScale)
			.tickSize(0)
			.tickFormat(() => null);
			
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


		// ********************************************* CHART TRANSITIONS *********************************************************** //
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
				.tickFormat(d => widget.activeChartType === 'grouped' ? d : null);

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
					.delay(stackedOrGrouped === 'grouped' ? 0 : barsTransitionDuration / 2)
					.duration(barsTransitionDuration / 2)
					.attr('y', widget.activeChartType === 'grouped' ? barSectionHeight + 22 : barSectionHeight + 6)

				kwhChart.select('.xAxis')
					.transition()
						.delay(stackedOrGrouped === 'grouped' ? barsTransitionDuration / 2 : 0)
						.duration(barsTransitionDuration / 2)
						.call(xAxisGenerator)

				kwhChart.select('.yAxis')
					.transition()
						.duration(barsTransitionDuration)
						.call(kwhYAxisGenerator)


				kwhChart.select('.kwhYAxisTitle')
					.style('opacity', (widget.activeChartType === 'grouped' && widget.equipmentHovered === 'none') || (widget.activeChartType === 'stacked' && !widget.systemIsHovered) ? 1 : 0)
		

				// transition bars
				kwhChart.selectAll('.equipmentGroups')
					.transition()
						.duration(barsTransitionDuration)
						.attr('transform', d => `translate(${stackedOrGrouped === 'grouped' ? x0Scale(d.type) : 0},0)`)
				
				kwhChart.selectAll('.categoryRects')	// .data(d => d.kwh)
					.transition()
						.duration(barsTransitionDuration - 500)
						.attr('x', d => stackedOrGrouped === 'grouped' ? x1Scale(d.category): x0Scale(d.category))
						.attr('y', d => kwhYScale(stackedOrGrouped === 'grouped' ? d.value : d.accumulated))
						.attr('width', stackedOrGrouped === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
						.attr('height', d => barSectionHeight - kwhYScale(d.value))   // run this to use changed kwhYScale
						.attr('stroke', d => data[`${d.category}Color`])
						.transition()
							.attr('stroke', d => widget.activeChartType === 'grouped' ? 'none' : data[`${d.category}Color`])


				if (stackedOrGrouped === 'grouped') {
					appendHoverableKwhRects ()
				} else {
					widget.resetElements('.hoverableKwhRects')
				}
							
				//tick styling
				kwhChart.selectAll('.tick text')
					.style('fill', data.tickTextColor)
					.style('font', data.tickFont)
			}
			kwhChartTransition()

			function costChartTransition() {
				//transition axes
				costChart.select('.costXAxisTitle')
					.transition()
						.delay(stackedOrGrouped === 'grouped' ? 0 : barsTransitionDuration / 2)
						.duration(barsTransitionDuration / 2)
						.attr('y', widget.activeChartType === 'grouped' ? barSectionHeight + 22 : barSectionHeight + 6)

				costChart.select('.xAxis')
					.transition()
						.delay(stackedOrGrouped === 'grouped' ? barsTransitionDuration / 2 : 0)
						.duration(barsTransitionDuration / 2)
						.call(xAxisGenerator);

				costChart.select('.yAxis')
					.transition()
						.duration(barsTransitionDuration)
						.call(costYAxisGenerator);

				costChart.select('.costYAxisTitle')
					.style('opacity', (widget.activeChartType === 'grouped' && widget.equipmentHovered === 'none') || (widget.activeChartType === 'stacked' && !widget.systemIsHovered) ? 1 : 0)


				// transition bars
				costChart.selectAll('.equipmentGroups')
					.transition()
						.duration(barsTransitionDuration)
						.attr('transform', d => `translate(${stackedOrGrouped === 'grouped' ? x0Scale(d.type) : 0},0)`)
				
				costChart.selectAll('.categoryRects')	// .data(d => d.utilityRate)
					.transition()
						.duration(barsTransitionDuration - 500)
						.attr('x', d => stackedOrGrouped === 'grouped' ? x1Scale(d.category): x0Scale(d.category))
						.attr('y', d => costYScale(stackedOrGrouped === 'grouped' ? d.cost : d.accumulatedCost))
						.attr('width', stackedOrGrouped === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
						.attr('height', d => barSectionHeight - costYScale(d.cost))   // run this to use changed kwhYScale
						.attr('stroke', d => data[`${d.category}Color`])
						.transition()
							.attr('stroke', d => widget.activeChartType === 'grouped' ? 'none' : data[`${d.category}Color`])

					if (stackedOrGrouped === 'grouped') {
						appendHoverableCostRects ()
					} else {
						widget.resetElements('.hoverableCostRects')
					}

					
				//tick styling
				costChart.selectAll('.tick text')
					.style('fill', data.tickTextColor)
					.style('font', data.tickFont)
			}
			costChartTransition()

		}

		//click handler for chart transitions
		const transitionChartsClickFunction = () => {
			unhoverAll();
			widget.activeChartType = widget.activeChartType === 'stacked' ? 'grouped' : 'stacked';
			transitionCharts(widget.activeChartType)
			toggleButton();
		};





		// ********************************************* KWH CHART *********************************************************** //
		// initialization
		const kwhChart = chartsGroup.append('g')
			.attr('class', 'kwhChart')

		// chart group 
		const kwhBarSection = kwhChart.append('g')
			.attr('class', 'kwhBarSection')
			.attr('transform', `translate(${yAxisWidth}, 0)`)


		// bars
		const equipmentGroups = kwhBarSection.selectAll('.equipmentGroups')
			.data(widget.dataForDate.equipmentDataForDate)
			.enter().append('g')
				.attr('class', d => `equipmentGroups ${d.type}EquipmentGroup`)
				.attr('transform', d => `translate(${widget.activeChartType === 'grouped' ? x0Scale(d.type) : 0},0)`)
		
		equipmentGroups.selectAll('.categoryRects')
			.data(d => d.kwh)
			.enter().append('rect')
				.attr('class', d => `dynamicCategoryRects categoryRects ${d.category}CategoryRect ${d.category}Bar`)
				.attr('rx', 1)
				.attr('ry', 1)
				.attr('x', d => widget.activeChartType === 'grouped' ? x1Scale(d.category === 'predicted' ? 'measured' : d.category) : x0Scale(d.category === 'predicted' ? 'measured' : d.category))
				.attr('y', d => widget.activeChartType === 'grouped' ? kwhYScale(d.value) : kwhYScale(d.accumulated))
				// .attr('y', (d, i, nodes) => widget.activeChartType === 'grouped' ? kwhYScale(d.category === 'predicted' ? nodes[i].previousSibling.__data__.value + d.value : d.value) : kwhYScale(d.category === 'predicted' ? nodes[i].previousSibling.__data__.accumulated + d.accumulated : d.accumulated)) //TODO: switch out with height if opposite
				.attr('width', widget.activeChartType === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
				// .attr('height', (d, i, nodes) => ( barSectionHeight + ( d.category === 'predicted' ? kwhYScale(nodes[i].previousSibling.__data__.value) : 0) ) - (kwhYScale(d.value) ) )
				.attr('height', d => barSectionHeight - kwhYScale(d.value) ) // TODO: switch out with y if opposite
				.attr('fill', d => d.category === 'predicted' ? data.backgroundColor : data[`${d.category}Color`])
				.style('stroke-dasharray', d => d.category === 'predicted' ? '2,2' : '0,0')
				.style('fill-opacity', getBarFillOpacity)
				.style('stroke-opacity', getBarStrokeOpacity)
				.attr('stroke', d => {
					if (d.category === 'predicted') return data.measuredColor;
					// if (widget.activeChartType === 'grouped') return 'none';
					return data[`${d.category}Color`];
				})
				.on('mouseover', tryBarHoverFunc)
				.on('mousedown', function(){
					d3.event.stopPropagation()
				})
				.on('click', barPinFunc)
				.on('mouseout', tryUnhover)

		//raise measured over predicted
		widget.svg.selectAll('.measuredCategoryRect').raise();


		function appendHoverableKwhRects () {
			widget.resetElements('.hoverableKwhRects');
			equipmentGroups.selectAll('.hoverableKwhRects')
				.data(d => d.kwh)
				.enter().append('rect')
					.attr('class', `hoverableKwhRects`)
					.attr('x', d => x0Scale(d.category))
					.attr('y', (d, i, nodes) => {
						const maxHeightForGroup = nodes.reduce((accum, curr) => curr.__data__.value > accum.__data__.value ? curr : accum);
						return kwhYScale(maxHeightForGroup.__data__.value)
						})
					.attr('width',  x0Scale.bandwidth())
					.attr('opacity', 0)
					.attr('height', (d, i, nodes) => {
						const maxHeightForGroup = nodes.reduce((accum, curr) => curr.__data__.value > accum.__data__.value ? curr : accum);
						return barSectionHeight - kwhYScale(maxHeightForGroup.__data__.value)
					})
					.on('mouseover', tryBarHoverFunc)
					.on('mousedown', function(){
						d3.event.stopPropagation()
					})
					.on('click', barPinFunc)
					.on('mouseout', tryUnhover)
		}

		if (widget.activeChartType === 'grouped') appendHoverableKwhRects();

				
		// x axis
		const kwhXAxis = kwhBarSection.append('g')
			.attr('class', 'axis xAxis')
			.attr('transform', `translate(0, ${barSectionHeight})`)
			.call(xAxisGenerator);

		kwhXAxis.selectAll('line').attr('stroke', data.axesColor);
		kwhXAxis.selectAll('path').attr('stroke', data.axesColor);

		// y axis
		const kwhYAxis = kwhBarSection.append('g')
			.attr('class', 'axis yAxis')
			.call(kwhYAxisGenerator)

		kwhYAxis.selectAll('line').attr('stroke', data.axesColor);
		kwhYAxis.selectAll('path').attr('stroke', data.axesColor);

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
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'hanging')
			.attr('fill', data.unitsColor)
			.style('font', data.unitsFont)
			.style('opacity', (widget.activeChartType === 'grouped' && widget.equipmentHovered === 'none') || (widget.activeChartType === 'stacked' && !widget.systemIsHovered) ? 1 : 0)

		//x axis systemName
		kwhBarSection.append('text')
			.attr('class', 'kwhXAxisTitle')
			.attr('dominant-baseline', 'hanging')
			.attr('x', (barSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2) )
			.style('font', data.systemNameFont)
			.attr('fill', data.tickTextColor)
			.attr('y', widget.activeChartType === 'grouped' ? barSectionHeight + 22 : barSectionHeight + 6)
			.text(data.systemName)


		// tooltip
		function appendKwhTooltip () {
			widget.resetElements('.kwhTooltip')
			const isStacked = widget.activeChartType === 'stacked'
			const kwhDataForDate = widget.activeChartType === 'stacked' ? widget.dataForDate.categoryDataForDate : widget.dataForDate.equipmentDataForDate.filter(datum => datum.type === widget.equipmentHovered)[0].kwh;
			//takes into account predicted if needed for date
			const getKwhDataArrayForTooltip = () => {
				let kwhDataArrayForTooltip = kwhDataForDate.map(obj => Object.assign({}, obj));	//deep copy array of objs
				if (kwhDataArrayForTooltip[3]) {
					if (isStacked) {
						kwhDataArrayForTooltip[2].kwh = kwhDataArrayForTooltip[3].kwh;
						kwhDataArrayForTooltip[2].cost = kwhDataArrayForTooltip[3].cost;
						kwhDataArrayForTooltip[2].trh = kwhDataArrayForTooltip[3].trh;
					} else {
						kwhDataArrayForTooltip[2].value = kwhDataArrayForTooltip[3].value;
						kwhDataArrayForTooltip[2].accumulated = kwhDataArrayForTooltip[3].accumulated;
					}
					kwhDataArrayForTooltip = kwhDataArrayForTooltip.slice(0,3);
				}
				if (isStacked) {
					kwhDataArrayForTooltip.forEach(obj => {
						obj.kwh = Math.round(obj.kwh);
						obj.trh = Math.round(obj.trh)
					})
				} else {
					kwhDataArrayForTooltip.forEach(obj => {
						obj.value = Math.round(obj.value);
						obj.accumulated = Math.round(obj.accumulated)
					})
				}
				return kwhDataArrayForTooltip;
			}
			const kwhDataArrayForTooltip =  getKwhDataArrayForTooltip();

			const maxWidthCat = kwhDataArrayForTooltip.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0,1).toUpperCase()}:${isStacked ? curr.kwh : curr.value}`, 'bold ' + data.tooltipFont) > getTextWidth(`${accum.category.slice(0,1).toUpperCase()}:${isStacked ? accum.kwh : accum.value}`, 'bold ' + data.tooltipFont) ?
				curr :
				accum
			);

			const tooltipWidth = getTextWidth(`${maxWidthCat.category.slice(0,1).toUpperCase()}:`, 'bold ' + data.tooltipFont) + getTextWidth(`${isStacked ? maxWidthCat.kwh + ' kWh' : maxWidthCat.value + ' kWh'}`, data.tooltipFont) + (data.tooltipPadding * 2.5) + data.paddingAfterLegendCat
			const tooltipHeight = (data.tooltipPadding * 2) + (3 * getTextHeight(data.tooltipFont)) + (2 * data.paddingBetweenTooltipText);

			const tooltip = kwhBarSection.append('g')
				.attr('class', 'kwhTooltip')
				.attr('transform', `translate(${barSectionWidth - tooltipWidth},0)`)
				.attr('pointer-events', 'none')


			tooltip.append('rect')
				.attr('class', 'tooltip')
				.attr('height', tooltipHeight)
				.attr('width', tooltipWidth)
				.attr('fill', data.tooltipBackgroundColor)
				.attr('opacity', data.tooltipOpacity)
				.attr('rx', 5)
				.attr('ry', 5)

			const textGroups = tooltip.selectAll('.kwhTextGroup')
				.data(kwhDataArrayForTooltip)
				.enter().append('g')
					.attr('class', d => `kwhTextGroup ${d.category}KwhTextGroup tooltip`)
					.attr('transform', (d, i) => `translate(${data.tooltipPadding},${(data.tooltipPadding * 1.5) + (i * (getTextHeight(data.tooltipFont) + data.paddingBetweenTooltipText)) - (getTextHeight(data.tooltipFont) / 2)})`)
		
			textGroups.append('text')
				.text(d => d.category.slice(0,1).toUpperCase() +': ')
				.attr('dominant-baseline', 'hanging')
				.style('font', data.tooltipFont)
				.attr('fill', d => data[d.category + 'Color']|| data.tooltipFontColor)
				.style('font-weight', 'bold')

			textGroups.append('text')
				.text(d => isStacked ? d.kwh + ' kWh' : d.value + ' kWh')
				.attr('dominant-baseline', 'hanging')
				.style('font', data.tooltipFont)
				.attr('fill', data.tooltipFontColor)
				.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + data.paddingAfterLegendCat)
		}
		if (widget.systemIsHovered || widget.equipmentHovered !== 'none') appendKwhTooltip();




		// *********************************** COST CHART ************************************ //
	// initialization

	// chart group
	const costBarSection = costChart.append('g')
		.attr('class', 'costBarSection')
		.attr('transform', `translate(${yAxisWidth}, 0)`)


	// bars
	const costEquipmentGroups = costBarSection.selectAll('.equipmentGroups')
		.data(widget.dataForDate.equipmentDataForDate)
		.enter().append('g')
			.attr('class', d => `equipmentGroups ${d.type}EquipmentGroup`)
			.attr('transform', d => `translate(${widget.activeChartType === 'grouped' ? x0Scale(d.type) : 0},0)`)

	costEquipmentGroups.selectAll('.categoryRects')
		.data(d => d.utilityRate)
		.enter().append('rect')
			.attr('class', d => `dynamicCategoryRects categoryRects ${d.category}CategoryRect ${d.category}Bar`)
			.attr('rx', 1)
			.attr('ry', 1)
			.attr('x', d => widget.activeChartType === 'grouped' ? x1Scale(d.category) : x0Scale(d.category))
			.attr('y', d => widget.activeChartType === 'grouped' ? costYScale(d.cost) : costYScale(d.accumulatedCost))
			.attr('width', widget.activeChartType === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
			.attr('height', d => barSectionHeight - costYScale(d.cost) )
			.attr('fill', d => data[`${d.category}Color`])
			.style('fill-opacity', (innerD, innerI, innerNodes) => {
				const myCat = innerD.category
				const myEq = innerNodes[innerI].parentNode.__data__.type
				if ((widget.equipmentHovered === 'none' || widget.equipmentHovered === myEq) && (widget.legendHovered === 'none' || widget.legendHovered === myCat) ) {
					return 1;
				} else {
					return unhoveredOpacity;
				}
			})
			.style('stroke-opacity', (innerD, innerI, innerNodes) => {
				const myCat = innerD.category
				const myEq = innerNodes[innerI].parentNode.__data__.type
				if ((widget.equipmentHovered === 'none' || widget.equipmentHovered === myEq) && (widget.legendHovered === 'none' || widget.legendHovered === myCat) ) {
					return 1;
				} else {
					return 0;
				}
			})
			.attr('stroke', d => widget.activeChartType === 'grouped' ? 'none' : data[`${d.category}Color`])
			.on('mouseover', tryBarHoverFunc)
			.on('mousedown', function(){
				d3.event.stopPropagation()
			})
			.on('click', barPinFunc)
			.on('mouseout', tryUnhover)


			function appendHoverableCostRects () {
				widget.resetElements('.hoverableCostRects');
				costEquipmentGroups.selectAll('.hoverableCostRects')
					.data(d => d.utilityRate)
					.enter().append('rect')
						.attr('class', `hoverableCostRects`)
						.attr('x', d => x0Scale(d.category))
						.attr('y', (d, i, nodes) => {
							const maxHeightForGroup = nodes.reduce((accum, curr) => curr.__data__.cost > accum.__data__.cost ? curr : accum);
							return costYScale(maxHeightForGroup.__data__.cost);
							})
						.attr('width',  x0Scale.bandwidth())
						.attr('opacity', 0)
						.attr('height', (d, i, nodes) => {
							const maxHeightForGroup = nodes.reduce((accum, curr) => curr.__data__.cost > accum.__data__.cost ? curr : accum);
							return barSectionHeight - costYScale(maxHeightForGroup.__data__.cost)
						})
						.on('mouseover', tryBarHoverFunc)
						.on('mousedown', function(){
							d3.event.stopPropagation()
						})
						.on('click', barPinFunc)
						.on('mouseout', tryUnhover)
			}

			if (widget.activeChartType === 'grouped') appendHoverableCostRects();



	// x axis
	const costXAxis = costBarSection.append('g')
		.attr('class', 'axis xAxis')
		.attr('transform', `translate(0, ${barSectionHeight})`)
		.call(xAxisGenerator);

	costXAxis.selectAll('line').attr('stroke', data.axesColor);
	costXAxis.selectAll('path').attr('stroke', data.axesColor);

	// y axis
	const costYAxis = costBarSection.append('g')
		.attr('class', 'axis yAxis')
		.call(costYAxisGenerator)

	costYAxis.selectAll('line').attr('stroke', data.axesColor);
	costYAxis.selectAll('path').attr('stroke', data.axesColor);

	//tick styling
	costChart.selectAll('.tick text')
		.style('fill', data.tickTextColor)
		.style('font', data.tickFont)


	// y axis units title
	costBarSection.append('text')
		.attr('class', 'costYAxisTitle')
		.text(data.currencyName)
		.attr('transform', 'rotate(-90)')
		.attr('y', 5)
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'hanging')
		.attr('fill', data.unitsColor)
		.style('font', data.unitsFont)
		.style('opacity', (widget.activeChartType === 'grouped' && widget.equipmentHovered === 'none') || (widget.activeChartType === 'stacked' && !widget.systemIsHovered) ? 1 : 0)



	// x axis systemName
	costBarSection.append('text')
		.attr('class', 'costXAxisTitle')
		.attr('dominant-baseline', 'hanging')
		.attr('x', (barSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2) )
		.style('font', data.systemNameFont)
		.attr('fill', data.tickTextColor)
		.text(data.systemName)
		.attr('y', widget.activeChartType === 'grouped' ? barSectionHeight + 22 : barSectionHeight + 6)
		// .style('opacity', widget.activeChartType === 'grouped' ? 0 : 1)
		// .on('mouseover', unhover)



		// tooltip
		function appendCostTooltip () {
			widget.resetElements('.costTooltip')
			const costDataForDate = widget.activeChartType === 'stacked' ?
				widget.dataForDate.categoryDataForDate :
				widget.dataForDate.equipmentDataForDate.filter(datum => datum.type === widget.equipmentHovered)[0].utilityRate;

			const maxWidthCat = costDataForDate.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0,1).toUpperCase()}${data.formatCurrency(curr.cost)}${data.formatAvgCurrency(curr.rate)}`, 'bold ' + data.tooltipFont) > getTextWidth(`${accum.category.slice(0,1).toUpperCase()}${data.formatCurrency(accum.cost)}${data.formatAvgCurrency(accum.rate)}`, data.tooltipFont) ?
				curr :
				accum
			);

			const tooltipWidth = getTextWidth(`${maxWidthCat.category.slice(0,1).toUpperCase()}:${data.currencySymbol}${data.formatCurrency(maxWidthCat.cost)}@ ${data.currencySymbol}${data.formatAvgCurrency(maxWidthCat.rate)}`, 'bold ' + data.tooltipFont) + (data.tooltipPadding * 2.5) + (data.paddingAfterLegendCat * 2)
			const tooltipHeight = (data.tooltipPadding * 2) + (costDataForDate.length * getTextHeight(data.tooltipFont)) + ((costDataForDate.length - 1) * data.paddingBetweenTooltipText);

			const maxWidthCostCat = costDataForDate.reduce((accum, curr) => getTextWidth(data.formatCurrency(curr.cost), 'bold ' + data.tooltipFont) > getTextWidth(data.formatCurrency(accum.cost), 'bold ' + data.tooltipFont) ?
				curr :
				accum
			);
			const maxWidthOfCost = getTextWidth(data.currencySymbol + data.formatCurrency(maxWidthCostCat.cost), data.tooltipFont);

			const tooltip = costBarSection.append('g')
				.attr('class', 'costTooltip')
				.attr('transform', `translate(${barSectionWidth - tooltipWidth},0)`)
				.attr('pointer-events', 'none')

			tooltip.append('rect')
				.attr('class', 'tooltip')
				.attr('height', tooltipHeight)
				.attr('width', tooltipWidth)
				.attr('fill', data.tooltipBackgroundColor)
				.attr('opacity', data.tooltipOpacity)
				.attr('rx', 5)
				.attr('ry', 5)

			const textGroups = tooltip.selectAll('.costTextGroup')
				.data(costDataForDate)
				.enter().append('g')
					.attr('class', d => `costTextGroup ${d.category}CostTextGroup tooltip`)
					.attr('transform', (d, i) => `translate(${data.tooltipPadding},${(data.tooltipPadding * 1.5) + (i * (getTextHeight(data.tooltipFont) + data.paddingBetweenTooltipText)) - (getTextHeight(data.tooltipFont) / 2)})`)
		
			textGroups.append('text')
				.text(d => d.category.slice(0,1).toUpperCase() +': ')
				.attr('dominant-baseline', 'hanging')
				.style('font', data.tooltipFont)
				.attr('fill', d => data[d.category + 'Color']|| data.tooltipFontColor)
				.style('font-weight', 'bold')


			textGroups.append('text')
				.text(d => data.currencySymbol + data.formatCurrency(d.cost))
				.attr('dominant-baseline', 'hanging')
				.style('font', data.tooltipFont)
				.attr('fill', data.tooltipFontColor)
				.attr('text-anchor', 'end')
				.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + maxWidthOfCost + data.paddingAfterLegendCat)

			textGroups.append('text')
				.text(d => '@ ' + data.currencySymbol + data.formatAvgCurrency(d.rate))
				.attr('dominant-baseline', 'hanging')
				.style('font', data.tooltipFont)
				.attr('fill', data.tooltipFontColor)
				.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + maxWidthOfCost + (data.paddingAfterLegendCat * 2))

		}
		if (widget.systemIsHovered || widget.equipmentHovered !== 'none')	appendCostTooltip();

		




		// ********************************** TRH CHART ***************************************** //
		const trhCategoryDataForDate = widget.dataForDate.categoryDataForDate.filter(cat => cat.category !== 'projected')

		// initialization

		// chart group
		const trhBarSection = trhChart.append('g')
			.attr('class', 'trhBarSection')
			.attr('transform', `translate(${yAxisWidth}, 0)`)


		// bars

		trhBarSection.selectAll('.categoryRects')
			.data(trhCategoryDataForDate)
			.enter().append('rect')
				.attr('class', d => `trhCategoryRects categoryRects ${d.category}CategoryRect ${d.category}Bar`)
				.attr('rx', 1)
				.attr('ry', 1)
				.attr('x', d => trhXScale(d.category))
				.attr('y', d => trhYScale(d.trh))
				.attr('width', trhXScale.bandwidth())
				.attr('height', d => barSectionHeight - trhYScale(d.trh) )
				.attr('fill', d => data[`${d.category}Color`])
				.style('opacity', d => widget.legendHovered === 'none' || widget.legendHovered === d.category ? 1 : unhoveredOpacity)
				.attr('stroke', d => data[`${d.category}Color`])
				.on('mouseover', function(){
					widget.trhIsHovered = true;
					appendTrhTooltip();
					trhChart.selectAll('.trhYAxisTitle')
						.style('opacity', 0)
				})
				.on('mousedown', function(){
					d3.event.stopPropagation()
				})
				.on('click', function(){
					widget.trhIsHovered = true;
					widget.trhIsPinned = true;
					appendTrhTooltip();
					trhChart.selectAll('.trhYAxisTitle')
						.style('opacity', 0)
				})
				.on('mouseout', function() {
					if (!widget.trhIsPinned){
						widget.trhIsHovered = false;
						widget.svg.selectAll('.trhYAxisTitle')
							.style('opacity', 1)
						widget.resetElements('.trhTooltip');
					}
				})

				
		// x axis
		const trhXAxis = trhBarSection.append('g')
			.attr('class', 'axis xAxis')
			.attr('transform', `translate(0, ${barSectionHeight})`)
			.call(trhXAxisGenerator);

		trhXAxis.selectAll('line').attr('stroke', data.axesColor);
		trhXAxis.selectAll('path').attr('stroke', data.axesColor);

		// y axis
		const trhYAxis = trhBarSection.append('g')
			.attr('class', 'axis yAxis')
			.call(trhYAxisGenerator)

		trhYAxis.selectAll('line').attr('stroke', data.axesColor);
		trhYAxis.selectAll('path').attr('stroke', data.axesColor);

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
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'hanging')
			.attr('fill', data.unitsColor)
			.style('font', data.unitsFont)
			.style('opacity', widget.trhIsHovered ? 0 : 1)


		// x axis title
		trhBarSection.append('text')
			.attr('class', 'trhXAxisTitle')
			.attr('dominant-baseline', 'hanging')
			.attr('x', (trhBarSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2) )
			.style('font', data.systemNameFont)
			.attr('fill', data.tickTextColor)
			.attr('y', barSectionHeight + 6)
			.text(data.systemName)


		// tooltip
		function appendTrhTooltip () {
			widget.resetElements('.trhTooltip')
			const maxWidthCat = trhCategoryDataForDate
				.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0,1).toUpperCase()}:${Math.round(curr.trh)}`, data.tooltipFont) > getTextWidth(`${accum.category.slice(0,1).toUpperCase()}:${Math.round(accum.trh)}`, 'bold ' + data.tooltipFont) ?
					curr :
					accum
				);
			const trhTooltipWidth = getTextWidth(`${maxWidthCat.category.slice(0,1).toUpperCase()}: ${Math.round(maxWidthCat.trh) + ' tRh'}`, 'bold ' + data.tooltipFont) + (data.tooltipPadding * 2)
			const trhTooltipHeight = data.widgetSize === 'medium' ? 40 : (data.widgetSize === 'small' ? 35 : 50);
			const trhTooltip = trhBarSection.append('g')
				.attr('class', 'trhTooltip')
				.attr('transform', `translate(${trhBarSectionWidth - trhTooltipWidth}, 0)`)
				.attr('pointer-events', 'none')

			trhTooltip.append('rect')
				.attr('class', 'tooltip')
				.attr('height', trhTooltipHeight)
				.attr('width', trhTooltipWidth)
				.attr('fill', data.tooltipBackgroundColor)
				.attr('opacity', data.tooltipOpacity)
				.attr('rx', 5)
				.attr('ry', 5)

			const trhTextGroups = trhTooltip.selectAll('.trhTextGroup')
				.data(trhCategoryDataForDate)
				.enter().append('g')
					.attr('class', d => `trhTextGroup ${d.category}TrhTextGroup tooltip`)
					.attr('transform', (d, i) => `translate(${(data.tooltipPadding)},${(data.tooltipPadding * 1.25) + (i * (getTextHeight(data.tooltipFont) + data.paddingBetweenTooltipText)) - (getTextHeight(data.tooltipFont) / 2)})`)
		
			trhTextGroups.append('text')
				.text(d => `${d.category.slice(0,1).toUpperCase()}:`)
				.attr('dominant-baseline', 'hanging')
				.style('font', data.tooltipFont)
				.attr('fill', d => data[d.category + 'Color']|| data.tooltipFontColor)
				.style('font-weight', 'bold')

			trhTextGroups.append('text')
				.text(d => Math.round(d.trh) + ' tRh')
				.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + data.paddingAfterLegendCat)
				.attr('dominant-baseline', 'hanging')
				.style('font', data.tooltipFont)
				.attr('fill', data.tooltipFontColor)

		}
		if (widget.trhIsHovered) appendTrhTooltip();



	// ************************************* LEGEND ****************************************** //
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
				.on('mousedown', function() {
					d3.event.stopPropagation()
				})
				.on('mouseover', function(d) {
					widget.legendHovered = d.name;
					widget.svg.selectAll(`.${d.name}LegendText`)
						.style('font-weight', 'bold')
					widget.svg.selectAll(`.${d.name}LegendCircle`)
						.attr('r', hoveredCircleRadius)
					widget.svg.selectAll(`.dynamicCategoryRects`)
						.style('fill-opacity', getBarFillOpacity)
						.style('stroke-opacity', getBarStrokeOpacity)
					widget.svg.selectAll('.trhCategoryRects')
						.style('opacity', innerD => widget.legendHovered === 'none' || widget.legendHovered === innerD.category ? 1 : unhoveredOpacity)
				})
				.on('mouseout', function(d) {
					widget.legendHovered = 'none';

					widget.svg.selectAll(`.${d.name}LegendText`)
						.style('font-weight', 'normal')
						
					widget.svg.selectAll(`.${d.name}LegendCircle`)
						.attr('r', circleRadius)

					widget.svg.selectAll(`.dynamicCategoryRects`)
						.style('fill-opacity', getBarFillOpacity)
						.style('stroke-opacity', getBarStrokeOpacity)

					widget.svg.selectAll('.trhCategoryRects')
						.style('opacity', innerD => widget.legendHovered === 'none' || widget.legendHovered === innerD.category ? 1 : unhoveredOpacity)
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



	// ************************************* TOOLS ****************************************** //

		
		// UTILITY RATE
		const paddingAboveCurrencySymbol = 2;
		const paddingRightOfCurrencySymbol = 5;
		utilityRateGroup.append('text')
			.text('Blended Utility Rate')
			.attr('dominant-baseline', 'hanging')
			.style('font', data.toolTitleFont)
			.attr('fill', data.toolTitleColor)

		//currencySymbol
		utilityRateGroup.append('text')
			.attr('y', getTextHeight(data.toolTitleFont) + paddingAboveCurrencySymbol)
			.attr('dominant-baseline', 'hanging')
			.style('font', data.currencySymbolFont)
			.attr('fill', data.currencySymbolColor)
			.text(data.currencySymbol)

		//blended utility rate
		utilityRateGroup.append('text')
			.attr('dominant-baseline', 'hanging')
			.attr('x', getTextWidth(data.currencySymbol, data.currencySymbolFont) + paddingRightOfCurrencySymbol)
			.attr('y', getTextHeight(data.toolTitleFont) + paddingAboveCurrencySymbol)
			.style('font', data.utilityRateFont)
			.attr('fill', data.utilityRateColor)
			.text(data.formatCurrency(widget.blendedUtilityRate))


			// CHANGE TOOLS
		const changeToolsPaddingTop = 0;
		const getNiceChangePercent = (origVal, newVal) => {
			const diff = Math.abs(origVal - newVal);
			const change = diff / origVal;
			const percentVal = change * 100;
			const roundedPercentVal = Math.round(percentVal);
			return roundedPercentVal === 0 && percentVal > 0 ? '<01' : roundedPercentVal;
		}
		const paddingBetweenPercentAndValue = data.widgetSize === 'large' ? 10 : 5;
		const paddingBetweenArrowAndPercent = 0;
		const getWidthOfPercentArrowAndText = text => getTextWidth(text + 'W%', data.changePercentFont) + paddingBetweenArrowAndPercent;
		const changeToolWidth = data.widgetSize === 'small' ? 0.56 * barSectionWidth : (data.widgetSize === 'medium' ? 0.53 * barSectionWidth : 0.5 * barSectionWidth);
		const changeToolHeight = data.widgetSize === 'small' ? 60 : (data.widgetSize === 'medium' ? 70 : 90);
		const getArrowPath = decrease => decrease ? base64Images.downArrow : base64Images.upArrow;
		const imgCircleRadius = data.widgetSize === 'large' ? 28 : (data.widgetSize === 'medium' ? 25 : 22);
		const paddingBetweenChangeTools = data.widgetSize === 'large' ? imgCircleRadius + 15 : (data.widgetSize === 'medium' ? imgCircleRadius + 10 : imgCircleRadius + 5);


		function getSystemOrHoveredData() {
			let kwh, cost, trh;
			let kwhPercent = {last: [], new: []};
			let costPercent = {last: [], new: []};
			let trhPercent = {last: [], new: []};
			if (widget.equipmentHovered !== 'none') {
				const hoveredEquipmentDataForDate = widget.dataForDate.equipmentDataForDate.filter(equip => equip.type === widget.equipmentHovered)[0];

			// set percentage arrays
			//kwh
			let kwhNiceChangePercent = getNiceChangePercent(hoveredEquipmentDataForDate.kwh[0].value, hoveredEquipmentDataForDate.kwh[2].value)
			kwhPercent.new = kwhNiceChangePercent.toString().split('').map(digit => digit !== '<' ? +digit : digit);
			if (kwhPercent.new.length > 2) kwhPercent.new = kwhPercent.new[0] === '<' ? [2, 0, 1] : [1, 9, 9];
			if (kwhPercent.new.length === 1) kwhPercent.new.unshift(0, 0);
			if (kwhPercent.new.length === 2) kwhPercent.new.unshift(0);
			kwhPercent.last = widget.lastKwhPercent ? widget.lastKwhPercent.slice() : kwhPercent.new.slice();
			widget.lastKwhPercent = kwhPercent.new.slice();

			//cost
			let costNiceChangePercent = getNiceChangePercent(hoveredEquipmentDataForDate.utilityRate[0].cost, hoveredEquipmentDataForDate.utilityRate[2].cost)
			costPercent.new = costNiceChangePercent.toString().split('').map(digit => digit !== '<' ? +digit : digit);
			if (costPercent.new.length > 2) costPercent.new = costPercent.new[0] === '<' ? [2, 0, 1] : [1, 9, 9];
			if (costPercent.new.length === 1) costPercent.new.unshift(0, 0);
			if (costPercent.new.length === 2) costPercent.new.unshift(0);
			costPercent.last = widget.lastCostPercent ? widget.lastCostPercent.slice() : costPercent.new.slice();
			widget.lastCostPercent = costPercent.new.slice();


			//create objects to iterate over
			kwh = {
				category: 'kwh',
				value: Math.round(Math.abs(hoveredEquipmentDataForDate.kwh[2].value - hoveredEquipmentDataForDate.kwh[0].value)),
				percent: JSON.parse(JSON.stringify(kwhPercent)),
				arrowPath: getArrowPath(hoveredEquipmentDataForDate.kwh[2].value <= hoveredEquipmentDataForDate.kwh[0].value),
				imgPath: base64Images.electricityBadge,
				label: ' kWh'
			};
			cost = {
				category: 'cost',
				value: data.formatCurrency(Math.abs(hoveredEquipmentDataForDate.utilityRate[2].cost - hoveredEquipmentDataForDate.utilityRate[0].cost)),
				percent: JSON.parse(JSON.stringify(costPercent)),
				arrowPath: getArrowPath(hoveredEquipmentDataForDate.utilityRate[2].cost <= hoveredEquipmentDataForDate.utilityRate[0].cost),
				imgPath: base64Images.monetaryBadge,
				label: data.currencySymbol
			};
		} else {
			// set percentage arrays
			//kwh
			let kwhNiceChangePercent = getNiceChangePercent(widget.dataForDate.categoryDataForDate[0].kwh, widget.dataForDate.categoryDataForDate[2].kwh)
			kwhPercent.new = kwhNiceChangePercent.toString().split('').map(digit => digit !== '<' ? +digit : digit);
			if (kwhPercent.new.length > 2) kwhPercent.new = kwhPercent.new[0] === '<' ? [2, 0, 1] : [1, 9, 9];
			if (kwhPercent.new.length === 1) kwhPercent.new.unshift(0, 0);
			if (kwhPercent.new.length === 2) kwhPercent.new.unshift(0);
			kwhPercent.last = widget.lastKwhPercent ? widget.lastKwhPercent.slice() : kwhPercent.new.slice();
			widget.lastKwhPercent = kwhPercent.new.slice();

			//cost
			let costNiceChangePercent = getNiceChangePercent(widget.dataForDate.categoryDataForDate[0].cost, widget.dataForDate.categoryDataForDate[2].cost)
			costPercent.new = costNiceChangePercent.toString().split('').map(digit => digit !== '<' ? +digit : digit);
			if (costPercent.new.length > 2) costPercent.new = costPercent.new[0] === '<' ? [2, 0, 1] : [1, 9, 9];
			if (costPercent.new.length === 1) costPercent.new.unshift(0, 0);
			if (costPercent.new.length === 2) costPercent.new.unshift(0);
			costPercent.last = widget.lastCostPercent ? widget.lastCostPercent.slice() : costPercent.new.slice();
			widget.lastCostPercent = costPercent.new.slice();



			//create objects to iterate over
			kwh = {
				category: 'kwh',
				value: Math.round(Math.abs(widget.dataForDate.categoryDataForDate[2].kwh - widget.dataForDate.categoryDataForDate[0].kwh)),
				percent: JSON.parse(JSON.stringify(kwhPercent)),
				arrowPath: getArrowPath(widget.dataForDate.categoryDataForDate[2].kwh <= widget.dataForDate.categoryDataForDate[0].kwh),
				imgPath: base64Images.electricityBadge,
				label: ' kWh'
			};
			cost = {
				category: 'cost',
				value: data.formatCurrency(Math.abs(widget.dataForDate.categoryDataForDate[2].cost - widget.dataForDate.categoryDataForDate[0].cost)),
				percent: JSON.parse(JSON.stringify(costPercent)),
				arrowPath: getArrowPath(widget.dataForDate.categoryDataForDate[2].cost <= widget.dataForDate.categoryDataForDate[0].cost),
				imgPath: base64Images.monetaryBadge,
				label: data.currencySymbol
			};
		}
		// set percentage arrays
		//trh
		let trhNiceChangePercent = getNiceChangePercent(widget.dataForDate.categoryDataForDate[0].trh, widget.dataForDate.categoryDataForDate[2].trh);
		trhPercent.new = trhNiceChangePercent.toString().split('').map(digit => digit !== '<' ? +digit : digit);
		if (trhPercent.new.length > 2) trhPercent.new = trhPercent.new[0] === '<' ? [2, 0, 1] : [1, 9, 9];
		if (trhPercent.new.length === 1) trhPercent.new.unshift(0, 0);
		if (trhPercent.new.length === 2) trhPercent.new.unshift(0);
		trhPercent.last = widget.lastTrhPercent ? widget.lastTrhPercent.slice() : trhPercent.new.slice();
		widget.lastTrhPercent = trhPercent.new.slice();

		//create object to iterate over
		trh = {
			category: 'trh',
			value: Math.round(Math.abs(widget.dataForDate.categoryDataForDate[2].trh - widget.dataForDate.categoryDataForDate[0].trh)),
			percent: JSON.parse(JSON.stringify(trhPercent)),
			arrowPath: getArrowPath(widget.dataForDate.categoryDataForDate[2].trh <= widget.dataForDate.categoryDataForDate[0].trh),
			imgPath: base64Images.productionBadge,
			label: ' tRh'
		};
		return [kwh, cost, trh];
	}

	function renderChangeTools() {
		widget.resetElements('.changeTools');

		const changeToolsLeft = data.widgetSize === 'small' ? 300 : (data.widgetSize === 'medium' ? 400 : 475);
		const changeTools = toolsGroup.append('g')
			.attr('class', 'changeTools')
			.attr('transform', `translate(${changeToolsLeft}, ${32})`);

		const systemOrHoveredData = getSystemOrHoveredData()
		const leftOfChangeTools = data.widgetSize === 'large' ? 90 : (data.widgetSize === 'medium' ? 40 : 0);

		//append data to each changeToolGroup
		const changeToolGroups = changeTools.selectAll('.changeToolGroups')
			.data(systemOrHoveredData)
			.enter().append('g')
			.attr('class', d => `changeToolGroups ${d.category}ChangeToolGroup`)
			.attr('transform', (d, i) => `translate(${leftOfChangeTools + imgCircleRadius + (i * (changeToolWidth + paddingBetweenChangeTools))}, 0)`);

		//append rects to each changeToolGroup
		changeToolGroups.append('rect')
			.attr('height', changeToolHeight)
			.attr('width', changeToolWidth)
			.attr('fill', data.changeToolRectColor)
			.attr('rx', 5)
			.attr('ry', 5);

		//append graphic circles to each changeToolGroup
		changeToolGroups.append('svg:image')
			.attr('xlink:href', d => d.imgPath)
			.attr('x', -imgCircleRadius + 'px')
			.attr('y', -imgCircleRadius + 'px')
			.attr('height', imgCircleRadius * 2)
			.attr('width', imgCircleRadius * 2);

		const percentChangeGroups = changeToolGroups.append('g')
			.attr('class', 'percentChangeGroups')
			.attr('transform', d => `translate(${(changeToolWidth / 2) - (getWidthOfPercentArrowAndText('>88') / 2)},${changeToolsPaddingTop})`);

		//append arrows
		percentChangeGroups.append('svg:image')
			.attr('xlink:href', d => d.arrowPath)
			.attr('y', '7')
			.attr('height', getTextHeight(data.changePercentFont) - 7)
			.attr('width', data.arrowWidth);





		//append percent change svg with hidden overflow
		const changeToolSvg = percentChangeGroups.append('svg')
			.attr('class', 'changeToolSvg')
			.attr('y', 5)
			.attr('x', (data.arrowWidth + paddingBetweenArrowAndPercent) - 5)
			.attr('height', (getTextHeight(data.changePercentFont)))
			.attr('width', changeToolWidth - (data.arrowWidth + paddingBetweenArrowAndPercent) - 5)


		const displayForIndex = [
			[' ', '>', '<'],
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
		]

		//append percent change
		const percentChangeTextGroup = changeToolSvg.append('g')
			.attr('transform', `translate(5,${(getTextHeight(data.changePercentFont) - 5)})`)
			.attr('class', (d, i) => `textGroupIndex${i}`)

		//percentChangeText1
		percentChangeTextGroup.selectAll('.digitBox1')
			.data(d => d.percent.last)
			.enter().append('text')
			.attr('class', (d, i, nodes) => `digitBox1 g1DigitIndex${i}For${nodes[i].parentNode.__data__.category} digitIndex${i}For${nodes[i].parentNode.__data__.category}`)
			.text((d, i) => {
				return displayForIndex[i][d]
			})
			.attr('x', (d, i, nodes) => {
				if (i === 1 && nodes[0].__data__ === 0) {
					return getTextWidth('0', data.changePercentFont) / 2
				} else if (i === 2 && nodes[0].__data__ === 0) {
					return getTextWidth('0', data.changePercentFont) * 1.5;
				} else {
					return i * getTextWidth('0', data.changePercentFont);
				}
			})
			.attr('y', 0)
			.attr('fill', data.changePercentColor)
			.style('font', data.changePercentFont)

		const paddingHidingText = data.widgetSize === 'small' ? 30 : 40;

		//percentChangeText2
		percentChangeTextGroup.selectAll('.digitBox2')
			.data(d => d.percent.last)
			.enter().append('text')
			.attr('class', (d, i, nodes) => `digitBox2 g2DigitIndex${i}For${nodes[i].parentNode.__data__.category} digitIndex${i}For${nodes[i].parentNode.__data__.category}`)
			.text((d, i) => displayForIndex[i][d])
			.attr('x', (d, i, nodes) => {
				if (i === 1 && nodes[0].__data__ === 0) {
					return getTextWidth('0', data.changePercentFont) / 2
				} else if (i === 2 && nodes[0].__data__ === 0) {
					return getTextWidth('0', data.changePercentFont) * 1.5;
				} else {
					return i * getTextWidth('0', data.changePercentFont);
				}
			})
			.attr('y', paddingHidingText)
			.attr('fill', data.changePercentColor)
			.style('font', data.changePercentFont);

		//append percent sign
		percentChangeTextGroup.append('text')
			.text('%')
			.attr('class', d => `${d.category}PercentSign`)
			.attr('x', d => d.percent.last[0] > 0 ? getTextWidth('0', data.changePercentFont) * 3 : getTextWidth('0', data.changePercentFont) * 2.5)
			.attr('fill', data.changePercentColor)
			.style('font', data.changePercentFont)
			.style('font-size', (getTextHeight(data.changePercentFont) / 2) + 'pt');

		const rollingPercentsChangeDuration = 275;


		function increaseDigit(category, digitIndex, delayMultiplier, numbersToGetThrough, currentVal, lastWasOver99, newIsFractionOrOver99) {
			const digitObjToChange1 = widget.svg.select(`.g1DigitIndex${digitIndex}For${category}`);
			const digitObjToChange2 = widget.svg.select(`.g2DigitIndex${digitIndex}For${category}`);
			const thisDuration = rollingPercentsChangeDuration / numbersToGetThrough;

			digitObjToChange1
				.transition()
				.delay(thisDuration * delayMultiplier)
				.duration(0)
				.attr('y', 0)
				.attr('x', () => {
					if (digitIndex === 1 && !newIsFractionOrOver99) {
						return getTextWidth('0', data.changePercentFont) / 2
					} else if (digitIndex === 2 && !newIsFractionOrOver99) {
						return getTextWidth('0', data.changePercentFont) * 1.5;
					} else {
						return digitIndex * getTextWidth('0', data.changePercentFont);
					}
				})
				.transition()
				.duration(thisDuration)
				.attr('y', -paddingHidingText)
				.transition()
				.duration(0)
				.text(() => displayForIndex[digitIndex][digitIndex === 0 && +currentVal === 2 ? 1 : +currentVal + 1])
				.attr('y', 0);


			digitObjToChange2
				.transition()
				.delay(thisDuration * delayMultiplier)
				.duration(0)
				.text(() => displayForIndex[digitIndex][digitIndex === 0 && +currentVal === 2 ? 1 : currentVal + 1])
				.attr('y', paddingHidingText)
				.attr('x', () => {
					if (digitIndex === 1 && !newIsFractionOrOver99) {
						return getTextWidth('0', data.changePercentFont) / 2;
					} else if (digitIndex === 2 && !newIsFractionOrOver99) {
						return getTextWidth('0', data.changePercentFont) * 1.5;
					} else {
						return digitIndex * getTextWidth('0', data.changePercentFont);
					}
				})
				.transition()
					.duration(thisDuration)
					.attr('y', 0)
				.transition()
					.duration(0)
					.attr('y', paddingHidingText);
		}

		function decreaseDigit(category, digitIndex, delayMultiplier, numbersToGetThrough, currentVal, lastWasOver99, newIsFractionOrOver99) {
			const digitObjToChange1 = widget.svg.select(`.g1DigitIndex${digitIndex}For${category}`);
			const digitObjToChange2 = widget.svg.select(`.g2DigitIndex${digitIndex}For${category}`);
			const thisDuration = rollingPercentsChangeDuration / numbersToGetThrough;

			digitObjToChange1
				.transition()
				.delay(thisDuration * delayMultiplier)
				.duration(0)
				.attr('y', 0)
				.attr('x', () => {
					if (digitIndex === 1 && !newIsFractionOrOver99) {
						return getTextWidth('0', data.changePercentFont) / 2;
					} else if (digitIndex === 2 && !newIsFractionOrOver99) {
						return getTextWidth('0', data.changePercentFont) * 1.5;
					} else {
						return digitIndex * getTextWidth('0', data.changePercentFont);
					}
				})
				.transition()
				.duration(thisDuration)
				.attr('y', paddingHidingText)
				.transition()
				.duration(0)
				.text(() => displayForIndex[digitIndex][+currentVal - 1])
				.attr('y', 0);


			digitObjToChange2
				.transition()
				.delay(thisDuration * delayMultiplier)
				.duration(0)
				.text(() => displayForIndex[digitIndex][currentVal - 1])
				.attr('y', -paddingHidingText)
				.attr('x', () => {
					if (digitIndex === 1 && !newIsFractionOrOver99) {
						return getTextWidth('0', data.changePercentFont) / 2
					} else if (digitIndex === 2 && !newIsFractionOrOver99) {
						return getTextWidth('0', data.changePercentFont) * 1.5;
					} else {
						return digitIndex * getTextWidth('0', data.changePercentFont);
					}
				})
				.transition()
				.duration(thisDuration)
				.attr('y', 0)
				.transition()
				.duration(0)
				.attr('y', paddingHidingText);
		}


		let kwhPercentObj = JSON.parse(JSON.stringify(systemOrHoveredData[0].percent));
		kwhPercentObj.current = kwhPercentObj.last.slice();
		let costPercentObj = JSON.parse(JSON.stringify(systemOrHoveredData[1].percent));
		costPercentObj.current = costPercentObj.last.slice();
		let trhPercentObj = JSON.parse(JSON.stringify(systemOrHoveredData[2].percent));
		trhPercentObj.current = trhPercentObj.last.slice();


		function loopFromTo(category, digitIndex, from, to, lastWasOver99, newIsFractionOrOver99) {
			let differenceBtwOldAndNewVal = 0;
			if (from < to) {
				differenceBtwOldAndNewVal = to - from;
				for (let i = 0; i < differenceBtwOldAndNewVal; i++) {
					increaseDigit(category, digitIndex, i, differenceBtwOldAndNewVal, from + i, lastWasOver99, newIsFractionOrOver99);
				}
			} else {
				differenceBtwOldAndNewVal = from - to;
				for (let i = 0; i < differenceBtwOldAndNewVal; i++) {
					decreaseDigit(category, digitIndex, i, differenceBtwOldAndNewVal, from - i, lastWasOver99, newIsFractionOrOver99);
				}
			}
		}

		function changeDigits(currentArr, newArr, category) {
			currentArr = currentArr.slice();
			newArr = newArr.slice();
			const currentFirstDigit = +currentArr[0];
			const newFirstDigit = +newArr[0];

			currentArr.forEach((currentDigit, digitIndex) => {
				if (+newArr[digitIndex] !== +currentDigit) {
					loopFromTo(category, digitIndex, +currentDigit, +newArr[digitIndex], currentFirstDigit > 0, newFirstDigit > 0)
				} else if (currentFirstDigit !== newFirstDigit) {	//change placement of any otherwise unchanging digits if need be
					widget.svg.selectAll(`.digitIndex${digitIndex}For${category}`)
						.attr('x', () => {
							if (digitIndex === 1 && newFirstDigit === 0) {
								return getTextWidth('0', data.changePercentFont) / 2
							} else if (digitIndex === 2 && newFirstDigit === 0) {
								return getTextWidth('0', data.changePercentFont) * 1.5;
							} else {
								return digitIndex * getTextWidth('0', data.changePercentFont);
							}
						});
				}
			})

			// change percent sign placement if necessary
			if (currentFirstDigit !== newFirstDigit) {
				widget.svg.select(`.${category}PercentSign`).attr('x', newFirstDigit > 0 ? getTextWidth('0', data.changePercentFont) * 3 : getTextWidth('0', data.changePercentFont) * 2.5)
			}
		}

		changeDigits(kwhPercentObj.last, kwhPercentObj.new, 'kwh');
		changeDigits(costPercentObj.last, costPercentObj.new, 'cost');
		changeDigits(trhPercentObj.last, trhPercentObj.new, 'trh');






		// value change group
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





	// ************************************* BUTTON ****************************************** //
	const buttonMargin = 5;
	const buttonWidth = data.widgetSize === 'small' ? 80 - (buttonMargin * 2) : (data.widgetSize === 'medium' ? 110 - (buttonMargin * 2) : 120 - (buttonMargin * 2))
	const endCircleRadius = buttonWidth / 6
	const rectHeight = endCircleRadius * 2
	const rectWidth = endCircleRadius * 3.5
	const buttonBackgroundFill = () => widget.activeChartType === 'stacked' ? data.sysBtnBackgroundColor : data.eqBtnBackgroundColor;
	const cy = getTextHeight(data.toolTitleFont) + paddingAboveCurrencySymbol + rectHeight / 2 + buttonMargin
	const rectLeftX = buttonMargin + endCircleRadius;
	const rectRightX = rectLeftX + rectWidth
	const buttonTransitionDuration = 666 // (just 2/3 of sec --nothing satanical intended)


		const toggleButton = () => {
			buttonGroup.select('.knob')
				.transition()
					.duration(buttonTransitionDuration)	// (2/3 of sec --nothing satanical intended)
					.attr('cx', widget.activeChartType === 'grouped' ? rectRightX: rectLeftX);
			buttonGroup.selectAll('.buttonBackground')
				.transition()
					.duration(buttonTransitionDuration)	// (2/3 of sec --nothing satanical intended)
					.attr('fill', buttonBackgroundFill());
			renderButtonText(true);
		}

		// BUTTON TITLE //
		buttonGroup.append('text')
			.text('View')
			.attr('dominant-baseline', 'hanging')
			.style('font', data.toolTitleFont)
			.attr('fill', data.toolTitleColor)
			.attr('x', ((buttonWidth) - getTextWidth('View', data.toolTitleFont)) / 2)


			// BUTTON BACKGROUND //
		buttonGroup.append('rect')
			.attr('class', 'buttonBackground')
			.attr('x', rectLeftX)
			.attr('y', cy - (rectHeight / 2))
			.attr('width', rectWidth)
			.attr('height', rectHeight)
			.attr('fill', buttonBackgroundFill())

		buttonGroup.append('circle')
			.attr('class', 'buttonBackground')
			.attr('cx', rectLeftX)
			.attr('cy', cy)
			.attr('r', endCircleRadius)
			.attr('fill', buttonBackgroundFill())

		buttonGroup.append('circle')
			.attr('class', 'buttonBackground')
			.attr('cx', rectRightX)
			.attr('cy', cy)
			.attr('r', endCircleRadius)
			.attr('fill', buttonBackgroundFill())


		// BUTTON KNOB //
		const knobRadius = endCircleRadius - (endCircleRadius * 0.13)

		buttonGroup.append('circle')
			.attr('class', 'knob')
			.attr('fill', data.btnKnobColor)
			.attr('r', knobRadius)
			.attr('cy', cy)
			.attr('cx', widget.activeChartType === 'grouped' ? rectRightX : rectLeftX)


		// STATUS TEXT //
		const stackedX = buttonMargin + (endCircleRadius * 2) + ((buttonWidth - (endCircleRadius * 3)) / 2);
		const groupedX = buttonMargin + ((buttonWidth - (endCircleRadius * 2)) / 2);

		const renderButtonText = changed => {
			widget.resetElements('.statusText');

			buttonGroup.append('text')
				.attr('class', 'statusText')
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.attr('y', cy + 1.4)
				.attr('x', widget.activeChartType === 'grouped' ? groupedX : stackedX)
				.style('font', data.buttonFont)
				.text(changed ? (widget.activeChartType === 'stacked' ? 'EQ' : 'SYS') : (widget.activeChartType === 'stacked' ? 'SYS' : 'EQ'))
				.attr('fill', changed ? (widget.activeChartType === 'stacked' ? data.eqBtnTextColor : data.sysBtnTextColor) : (widget.activeChartType === 'stacked' ? data.sysBtnTextColor : data.eqBtnTextColor))
				.attr('opacity', changed ? 0 : 1)
				.on('click', transitionChartsClickFunction)
				.transition()
					.duration(buttonTransitionDuration)
					.text(widget.activeChartType === 'stacked' ? 'SYS' : 'EQ')
					.attr('fill', widget.activeChartType === 'stacked' ? data.sysBtnTextColor : data.eqBtnTextColor)
					.attr('opacity', 1);
		}
		renderButtonText()

		// CLICKABLE SPACE //
		buttonGroup.append('rect')
			.attr('x', buttonMargin)
			.attr('y', cy - (rectHeight / 2))
			.attr('width', rectWidth + (endCircleRadius * 2))
			.attr('height', rectHeight)
			.attr('opacity', 0)
			.on('click', transitionChartsClickFunction)






		// ********************************************* MODAL ******************************************************* //
		const settingsBtnSize = data.arrowWidth / 1.75
		const modalHeight = chartHeight * 0.6;
		const modalLabelsHeight = getTextHeight(data.dropdownFont);
		const modalInputWidth = dateDropdownWidth / 2;
		const halfOfDifferenceInSizeForPosGrowth = (((settingsBtnSize * 1.2) - (settingsBtnSize)) / 2)
		//settingsButton
		widget.svg.append('svg:image')
			.attr('xlink:href', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAHWmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTA0LTA4VDIyOjAxOjE5LTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wNS0wMVQxNDo0NjoyNy0wNDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wNS0wMVQxNDo0NjoyNy0wNDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1ZWI0NjExNC1mNWQwLWFlNDgtYmIyYS01MjdiZjA1MTdkMTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OWMwNzgzZTAtNjMwZC01YTQ5LTllMTUtZjAyNmI2OGFhZGM2IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OWMwNzgzZTAtNjMwZC01YTQ5LTllMTUtZjAyNmI2OGFhZGM2Ij4gPHBob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPHJkZjpCYWc+IDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjFmOThiNTlhLWE5NjctMWU0Yi05MzhmLTAzMTE0YTA3MjhlZDwvcmRmOmxpPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjljMDc4M2UwLTYzMGQtNWE0OS05ZTE1LWYwMjZiNjhhYWRjNiIgc3RFdnQ6d2hlbj0iMjAxOC0wNC0wOFQyMjowMToxOS0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiYzgyYTUzMS1iMTYwLTA2NGEtOWQ4OS04YjFlOGRiYTFjYTgiIHN0RXZ0OndoZW49IjIwMTgtMDUtMDFUMTQ6MTA6MDEtMDQ6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NWViNDYxMTQtZjVkMC1hZTQ4LWJiMmEtNTI3YmYwNTE3ZDE1IiBzdEV2dDp3aGVuPSIyMDE4LTA1LTAxVDE0OjQ2OjI3LTA0OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJB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AEopmyUZJ3VojceGNddcMxtssEHWX3/9jB49OqNGjcpqq63W0t/Xo48+mttuuy233nprbrvtttx+++254447Mn36dD90aA1/rLW+WwEACgCg+QXAJUneInVonoUWWigbb7xxxo4dm7Fjx+ZNb3pTllxyyY743l944YVcd911ueqqqzJu3Lhcc801efbZZx0U0Fxb1FqvUgCAAgBoaAFQStkmycUSh2YYNmxYttxyy7ztbW/LFltskQ033DBDhgwRTPeC//bbb8+4cePy5z//OX/5y18UAtAsl9Zat1YAgAIAaG4BcHWSN0kcBs4aa6yR7bffPu94xzvylre8JQsttJBQ5sKMGTNy9dVX5/zzz8/555+fW265xVAAA2/7Wuv5CgBQAAANKwBKKe9Kco60oX8tsMAC2XzzzbPLLrtkhx12yOqrry6UXvDEE0/kwgsvzBlnnJELL7ww06ZNEwr0vxuSjKm19ukwYNYABQAoAOZt+B+U5MYkG0ob+uecHjNmTHbdddfsueeeed3rXieUPvT000/nD3/4Q04//fT85S9/UQZA/9qh1nqeAgAUAEBzCoD3JjlT0tC33vCGN2SfffbJrrvumhVXXFEgA1QGnHnmmTnllFNyxRVXGByg711Ta91MAQAKAKABBYBn/6FvLbrootljjz1ywAEHZOONNxZIg/ztb3/Lcccdl5NOOilPPPGEQKDv9OkuALMGKABAATD3BcD2Sc6VMvSuTTfdNAceeGB22223LLLIIgJpsOnTp+ecc87JCSeckAsuuCAzZ84UCvSuPt0FYNYABQAoAOa+AHDnf+glQ4cOzV577ZVPfvKTGTVqlEBa0MMPP5yf/OQnOfbYY72sIPSuPtsFYNYABQAoAOZu+PfsP/SCESNG5EMf+lA+9rGPZbnllhNIG5gyZUqOO+64HH300Xn44YcFAj03rtY6VgEACgBg4AqAy5JsKWGYP6uttlo++clPZv/997fNv03NmDEjv/vd7/LDH/4wN9xwg0CgZ7autV6qAAAFANDPBUApZWySK6UL827kyJE55JBDsuuuu2aBBRYQSIe48MIL841vfCNXX321MGD+nF9r3V4BAAoAoP8LgD8k2VG6MPfWWWedHHroodltt936/OU5aa7LL788hx9+eK666iphwLx7Y631rwoAUAAA/VQAlFLWS3K7ZGHurLTSSjnssMOy7777ZvDgwQIhSXLuuefmK1/5Sm6++WZhwNz7ba11TwUAKACA/isAfplkf8nCa1tiiSXyxS9+MR/96EczdOhQgfCKg8epp56aww8/PA899JBAYC5OmyRr11rvUwCAAgDo4wKglLJSkvuTDJEsvLIhQ4bkwx/+cA455JCMGDFCIMzR1KlTc/TRR+eII47I5MmTBQKv7Ue11v9UAIACAOj7AuCIJJ+TKryyt7/97fne976XtddeWxjMs6eeeipf/OIX8+tf/9pQAq/uhSQr1VonKQCg/bg9MjREKWV4kg9JAv7dyiuvnN/85jc555xzDP/Mt2WWWSbHHHNMLr300rzxjW8UCLyyhZN8VAygAAD61geSLCEG+P8WXHDB/Nd//Vduuumm7LTTTgKhV2y66aa54oor8t3vfjeLLrqoQODffbyU4uYq0IZcAgA9PYl64RKAUsoCSe5JsoZEocvGG2+cn/zkJxk9erQw6DN///vf86lPfSpnn322MOBffbDWekJPP4hZA5rFDgBohvcY/qHLsGHD8s1vfjOXXXaZ4Z8+t8IKK+S0007LCSec4KaS8K8+KQJoP3YAQE9Pot7ZAXBxkm2kSacbM2ZMjj32WNf5MyAmTpyYj3/84znrrLOEAV22qLVe1ZMPYNaAZrEDAAZYKWU9wz+dbsiQIfnyl7+cSy65xPDPgFlqqaVy6qmn5thjj81iiy0mELALANqOHQDQ05OohzsASilHJ/m4JOlUa665Zn75y19m4403FgaN8fDDD+f9739/rrrqKmHQyaYlWaXW+tj8fgCzBjSLHQAwgEopiyZ5vyToVPvss0+uueYawz+Ns9JKK+Wiiy7KIYccksGDBwuETjUkyUfEAO3DDgDo6UnUgx0ApZSPJzlainSaRRZZJEcddVT22WcfYdB4l19+efbbb788/vjjwqATPZFkpVrrtPl5Z7MGNIsdADCwbP2n46yzzjq54oorDP+0jC233DLXXnttttpqK2HQiZZL16sVAQoAYH6VUrZMMlISdJJddtklV155ZUaOdOjTWpZddtmcd955+cxnPtMrr/4CLebDIgAFANAzB4qATjF48OB87Wtfy8knn5zhw4cLhNZcNC2wQL7xjW/kpJNOyiKLLCIQOsnbSymriwFan3sAQE9Povl4JqiUskSSR5MsJEHa3eKLL54TTzwx2223nTBo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ergDIElKKUsmeSTJwhKFZJ111skxxxxjNwD94v77789HP/rRXHbZZcKA/+9btdZDevpBzBrQLHYAQAPUWp9O8ktJQJe77747W2+9dT796U9nypQpAqFPTJ8+Pd/97nczZswYwz/8qxlJfiwGaD92AEBPT6Je2AGQJKWUdZLcJVH4V8svv3y+973vZeeddxYGveaaa67Jxz/+8dx2223CgH93cq113974QGYNaBY7AKAhaq13J/mjJOBfPfbYY9l7772z44475p577hEIPfLUU0/loIMOytZbb234h1f3XRGAAgDoe0eIAF7ZhRdemE022SSHHHJIJk+eLBDmybRp03LUUUdl1KhROfHEEz0rCa/uz7XWv4oB2pNLAKCnJ1EvXQLwD6WUa5JsKll4dcsss0wOO+ywHHjggRk8eLBAeE1/+MMfcsghh+S+++4TBszZDrXW83rrg5k1QAEACoDXLgB2TfI7ycKcrbPOOvn617+eHXfcURj8m2uuuSaHHHJIrrzySmHA3Lktyehaa68NCGYNaBaXAEDznJnkXjHAnN19993Zfffds+WWW+aSSy4RCEmSW2+9Nbvuumve8pa3GP5h3hzZm8M/0Dx2AEBPT6Je3gGQJKWUDyf5qXRh3my11VY57LDDsuWWWwqjA91+++35zne+k9/97neZOXOmQGDejE+ydq11em9+ULMGKABAATDnAmBokr8lWUHCMH9FwGc/+9lsu+22wugAN9xwQ77zne/k7LPPNmzA/PtorbXXn3xwToICABQAc1cCfCrJ9yUM82/99dfPwQcfnL333jtDhgwRSBuZNWtWzj333Hzve9/LFVdcIRDomceTrFprrQoAUAAAA1MALJTkgSTLShl65nWve10++tGP5qCDDsqSSy4pkBY2derUnHzyyfnBD36Qe+65RyDQOz5ba/3fvvjAZg1QAIACYO5LgC8k+ZaUoXcMHz48++67bw488MCMHj1aIC3kwQcfzC9/+cv8/Oc/z4QJEwQCvWdiup79f04BAAoAYGALgOHp2gWwlKShd2288cY58MADs8cee2T48OECaaBp06bl7LPPznHHHZeLL77Yjf2gb3yx1vrtvvrgZg1QAIACYN5KALsAoA8tssgi2X333XPggQdmzJgxAmmAe++9N8cee2x+/etf56mnnhII9J0+ffZfAQAKAFAAzHsBYBcA9JPVV189u+22W/bcc8+sv/76AulH48ePz+mnn54zzjgjN954o0Cgf/Tps/8KAFAAgAJg/koAuwCgn62zzjrZdddds+uuuyoD+sgjjzyS008/Paeffnquu+46gwL0rz5/9l8BAAoAUADMXwGwcJL7k7xO4tD/Ro4cme233z7bbbddxo4dm6FDhwplPgeB66+/Pueff37OP//8XH/99YYDGDhfqLV+pz/Oe0ABAAqAeS8BPpXk+xKHgbXIIotkm222yXbbbZdtt902q6yyilBew4QJE3LBBRfkggsuyIUXXpiJEycKBQbe40lWr7W+qAAABQDQzAJgoST3JFlR6tAca6yxRrbYYotsttlmGTt2bNZdd92OzuOhhx7KuHHjctVVV2XcuHG57bbb3L0fmudjtdaf9McnMmuAAgAUAPNfAhyY5BipQ3ONGDEib3rTmzJ27Nhsuumm2WCDDTJixIi2/F6fe+653H777bn++uszbty4XHnllXnsscccBNBs9ycZWWudpgAABQDQ7AJgwSS3JllX8tA6ll9++YwaNSobbLBBNthgg6y//voZOXJkhgwZ0hJf/4wZM3L//ffn1ltvze23357bbrstt9xySx588EGLe2g9+9ZaT+6vT+YxAhQAoADoWQmwc5IzJA+tbYEFFsjyyy+fVVZZJausskpWX331f/7vFVdcMcsss0wWW2yxfvlaXnjhhUyYMCF///vf88ADD2T8+PF58MEH8+CDD+aBBx7II488kunTp/uhQeu7Ockba639dl2OWQMUAKAA6FkBMCjJVUk2kz60tyFDhmTEiBFZaqmlMmLEiCyzzDIZMWJEFl544QwaNOifBcFCCy2UUkoWWGCBLLDAApk+fXqmT5+e557renWv559/PtOnT0+tNZMmTcrEiRPz1FNPZdKkSZk0aVKmTp0qbOgM76q1/qk/P6FZAxQAoADoeQmwVZJLpQ8AzKU/11rf3t+f1KwBzbKACKD11FovS3KWJACAuZnDk3xGDIACAFrX55NMEwMAMAe/rLXeLAZAAQAtqtZ6b5IfSwIAeA0vJjlUDIACAFrf15I8LQYA4FV8t9b6dzEACgBocbXWSd0lAADA7P6e5NtiAP7BqwBAT0+iAXgVgJcrpSyY5JYkI/00AKBXTElyd5LxSR7oHqSfTDKh++3FJFNf9jYoyeJJFkwyPMmIJEsl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AAAAgAIAAAAAUAAAAAAACgAAAABAAQAAAAAoAAAAAAAFAAAAAKAAAAAAABQAAAAAoAAAAAAAFAAAAACAAgAAAABQAAAAAAAKAAAAAEABAAAAACgAAAAAAAUAAAAAKAAAAAAABQAAAACgAAAAAAAUAAAAAIACAAAAAFAAAAAAAAoAAAAAQAEAAAAACgAAAABAAQAAAAAoAAAAAAAFAAAAAKAAAAAAABQAAAAAgAIAAAAAUAAAAAAACgAAAABQAAAAAAAKAAAAAEABAAAAACgAAAAAAAUAAAAAoAAAAAAAFAAAAACAAgAAAAAUAAAAAIACAAAAAFAAAAAAAAoAAAAAQAEAAAAAKAAAAAAABQAAAACgAAAAAAAFAAAAAKAAAAAAABQAAAAAgAIAAAAAUAAAAAAACgAAAABAAQAAAAAoAAAAAAAFAAAAACgAAAAAAAUAAAAAoAAAAAAAFAAAAACAAgAAAABQAAAAAAAKAAAAAEABAAAAAAoAAAAAQAEAAAAAKAAAAAAABQAAAACgAAAAAAAUAAAAAIACAAAAAFAAAAAAgAIAAAAAUAAAAAAACgAAAABAAQAAAAAoAAAAAAAFAAAAAKAAAAAAABQAAAAAgAIAAAAAFAAAAACAAgAAAABQAAAAAAAKAAAAAEABAAAAACgAAAAAAAUAAAAAoAAAAAAABQAAAACgAAAAAAAUAAAAAIACAAAAAFAAAAAAAAoAAAAAQAEAAAAAKAAAAABAAQAAAAAoAAAAAAAFAAAAAKAAAAAAABQAAAAAgAIAAAAAUAAAAAAACgAAAABAAQAAAAAKAAAAAEABAAAAACgAAAAAAAUAAAAAoAAAAAAAFAAAAACAAgAAAABQAAAAAIACAAAAAFAAAAAAAAoAAAAAQAEAAAAAKAAAAAAABQAAAACgAAAAAAAUAAAAAKAAAAAAABQAAAAAgAIAAAAAUAAAAAAACgAAAABAAQAAAAAoAAAAAAAFAAAAAKAAAAAAAAUAAAAAoAAAAAAAFAAAAACAAgAAAABQAAAAAAAKAAAAAEABAAAAACgAAAAAQAEAAAAAKAAAAACAVvP/BgB4TV2beQp30gAAAABJRU5ErkJggg==')
			.attr('x', data.graphicWidth - (settingsBtnSize * 1.2))
			.attr('y', (data.margin.top * 2) + halfOfDifferenceInSizeForPosGrowth)
			.attr('height', settingsBtnSize)
			.attr('width', settingsBtnSize)
			.style('cursor', 'pointer')
			.on('click', () => {toggleModal()})
			.on('mouseenter', function() {
				d3.select(this)
					.attr('height', settingsBtnSize * 1.2)
					.attr('width', settingsBtnSize * 1.2)
					.attr('x', (data.graphicWidth - (settingsBtnSize * 1.2)) - halfOfDifferenceInSizeForPosGrowth)
					.attr('y', data.margin.top * 2)
			})
			.on('mouseout', function() {
				d3.select(this)
				.attr('height', settingsBtnSize)
				.attr('width', settingsBtnSize)
				.attr('x', data.graphicWidth - (settingsBtnSize * 1.2))
				.attr('y', (data.margin.top * 2) + halfOfDifferenceInSizeForPosGrowth)
			})
	
		const modalGroup = widget.svg.append('g')
			.attr('class', 'modalGroup')
			.attr('transform', 	`translate(${(data.graphicWidth / 2) - (modalWidth / 2)},${(data.margin.top * 2.5) + (data.graphicHeight / 8)})`)
	
		function removeModal(rerenderAfter) {
			widget.resetElements('.modalDiv')
			widget.resetElements('.overlayDiv')
			widget.svg.select('.modalBackgroundRect')
				.transition()
					.attr('height', 0)
					.attr('width', 0)
					.attr('x', modalWidth / 2)
					.attr('y', modalHeight / 2)
					.remove()
					.on('end', () => {
						if (rerenderAfter) render(widget, true);
					})
		}
	
		function renderModal() {
			// make box of background color with slight opacity to blur background and then add modal on top

			//overlay
			widget.outerDiv.append('div')
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
				.attr('rx', modalWidth * 0.05)
				.on('mousedown', function() {d3.event.stopPropagation()})
				.on('click', function() {d3.event.stopPropagation()})
				.attr('height', 0)
				.attr('width', 0)
				.attr('x', modalWidth / 2)
				.attr('y', modalHeight / 2)
				.transition()
					.attr('x', 0)
					.attr('y', 0)
					.attr('height', modalHeight)
					.attr('width', modalWidth)
					.on('end', function() {
						renderModalDiv()
					})
	
			function renderModalDiv() {
				const verticalModalPadding = (modalHeight - ( (getTextHeight(data.dropdownFont) * 2) + 13 + modalLabelsHeight )) / 8;
	
				//modal div
				const modalDiv = widget.outerDiv.append('div')
					.attr('class', 'modalDiv')
					.style('position', 'absolute')
					.style('width', modalWidth)
					.style('left', (data.margin.left + 2 + (data.graphicWidth / 2) - (modalWidth / 2)) + 'px')
					.style('top',  (data.margin.top + (data.graphicHeight / 8)) + 'px')
	
				const form = modalDiv.append('form')
					.attr('class', 'modalForm')
					.style('position', 'relative')
					.style('width', modalWidth + 'px')
					.style('height', modalHeight + 'px')
					.on('submit', function() {
						d3.event.preventDefault()
						if (isNaN(widget.blendedUtilityRate) || widget.blendedUtilityRate <= 0) {
							alert('Blended Utility Rate must be a number greater than 0.')
						} else {
							handleSubmit()
						}
					})
				
				// ROW ONE
				form.append('h4')
					.attr('class', 'formElement')
					.text('Blended Utility Rate')
					.style('color', data.dropdownTextColor)
					.style('font', data.dropdownFont)
					.style('left', ( (modalWidth / 2) - ( getTextWidth('Blended Utility Rate', data.dropdownFont) / 2 ) ) + 'px')
					.style('top', (verticalModalPadding * 3) + 'px')
					.style('position', 'absolute')
	
				// ROW TWO
				form.append('input')
					.attr('class', 'formElement blendedUtilityRateInput')
					.attr('type', 'text')
					.attr('name', 'blendedUtilityRateInput')
					.attr('value', widget.blendedUtilityRateSelection)
					.style('width', modalInputWidth + 'px')
					.style('border-radius', ((modalInputWidth / 2) * 0.3) + 'px')
					.style('font', data.dropdownFont)
					.style('color', data.dropdownTextColor)
					.style('border', `1.5px solid ${data.dropdownStrokeColor}`)
					.style('padding', '2px')
					.style('background-color', data.dropdownFillColor)
					.style('left', ((modalWidth / 2) - ((modalInputWidth / 2) + 1.5) ) + 'px')
					.style('top', ((verticalModalPadding * 4) + modalLabelsHeight) + 'px')
					.style('position', 'absolute')
					.style('text-align', 'center')
					.on('mouseover', function() {
						d3.select(this).style('border', `2.5px solid ${data.dropdownStrokeColor}`)
						.style('left', ((modalWidth / 2) - ((modalInputWidth / 2) + 2.5) ) + 'px')
						.style('top', (((verticalModalPadding * 4) + modalLabelsHeight) - 1) + 'px')
					})
					.on('mouseout', function() {
						d3.select(this).style('border', `1.5px solid ${data.dropdownStrokeColor}`)
						.style('left', ((modalWidth / 2) - ((modalInputWidth / 2) + 1.5) ) + 'px')
						.style('top', ((verticalModalPadding * 4) + modalLabelsHeight) + 'px')
					})
					.on('change', function() {
						widget.blendedUtilityRateSelection = +d3.select(this).property('value');
					});
	
				// ROW THREE
				form.append('button')
					.attr('class', 'formElement')
					.attr('type', 'submit')
					.text('OK')
					.style('width', getTextWidth('OK', data.dropdownFont) + 30 + 'px')
					.style('border-radius', ((getTextWidth('OK', data.dropdownFont) + 20) * 0.1) + 'px')
					.style('font', data.dropdownFont)
					.style('font-weight', 'bold')
					.style('border', 'none')
					.style('padding-top', '2.5px')
					.style('padding-bottom', '2.5px')
					.style('background-color', data.hoveredFillColor)
					.style('position', 'absolute')
					.style('text-align', 'center')
					.style('cursor', 'pointer')
					.style('left', ((modalWidth / 2) - ((getTextWidth('OK', data.dropdownFont) + 30) / 2)) + 'px')
					.style('top', ((verticalModalPadding * 5) + modalLabelsHeight + getTextHeight(data.dropdownFont) + 30) + 'px')
					.on('mouseover', function() {
						d3.select(this)
							.style('border', `1.5px solid ${data.hoveredFillColor}`)
							.style('width', getTextWidth('OK', data.dropdownFont) + 31.5 + 'px')
							.style('left', (((modalWidth / 2) - ((getTextWidth('OK', data.dropdownFont) + 30) / 2)) - 0.75) + 'px')
							.style('top', (((verticalModalPadding * 5) + modalLabelsHeight + getTextHeight(data.dropdownFont) + 30) - 0.75) + 'px')
						})
					.on('mouseout', function() {
						d3.select(this)
							.style('border', 'none')
							.style('width', getTextWidth('OK', data.dropdownFont) + 30 + 'px')
							.style('left', ((modalWidth / 2) - ((getTextWidth('OK', data.dropdownFont) + 30) / 2)) + 'px')
							.style('top', ((verticalModalPadding * 5) + modalLabelsHeight + getTextHeight(data.dropdownFont) + 30) + 'px')
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
			if (widget.blendedUtilityRate === widget.blendedUtilityRateSelection){				
				toggleModal();
			} else {
				widget.blendedUtilityRate = widget.blendedUtilityRateSelection;
				widget.resolve('station:|slot:/tekWorx/Dashboards/Energy$20Dashboard/Configuration/UtilitySavingsTool/BlendedRate')
				.then(point => {
					return point.invoke({
						slot: 'set',
						value: +widget.blendedUtilityRate
					})
					.catch(err => console.error('Error upon attempted blended utility rate change: ' + err))
				})
				toggleModal(true);
			}
		}
	



			// ************************  DROPDOWNS  ************************* //
		const dropdownsGroup = widget.svg.append('g').attr('class', 'dropdownsGroup').attr('transform', `translate(${data.margin.left + paddingLeftOfTools},${data.margin.top})`)

		//Year Dropdown
		dropdownsGroup.append('text')
			.attr('dominant-baseline', 'hanging')
			.text('Year')
			.attr('x', 5)
			.attr('fill', data.toolTitleColor)
			.style('font', data.toolTitleFont);

		makeDropdown(data.availableYears, widget.dropdownYearChanged, dropdownsGroup, 0, getTextHeight(data.toolTitleFont) + paddingUnderDropdownTitles, true, dateDropdownWidth, 5, 3, data.dropdownStrokeColor, data.dropdownFillColor, data.hoveredFillColor, data.dropdownFont, data.dropdownTextColor, widget.yearDropDownSelected, () => {}, () => {}, [])

		//Month Dropdown
		dropdownsGroup.append('text')
			.attr('dominant-baseline', 'hanging')
			.attr('x', dateDropdownWidth + paddingBetweenDropdowns + 10)
			.text('Month')
			.attr('fill', data.toolTitleColor)
			.style('font', data.toolTitleFont);

		makeDropdown(data.availableDates[widget.yearDropDownSelected], widget.dropdownMonthChanged, dropdownsGroup, dateDropdownWidth + paddingBetweenDropdowns, getTextHeight(data.toolTitleFont) + paddingUnderDropdownTitles, true, dateDropdownWidth, 5, 3, data.dropdownStrokeColor, data.dropdownFillColor, data.hoveredFillColor, data.dropdownFont, data.dropdownTextColor, widget.monthDropDownSelected, () => {}, () => {}, [])



			// ************************ UNHOVER & UNPIN FUNCTIONS ************************* //
			function tryUnhover () {
				if ((widget.activeChartType === 'stacked' && !widget.systemIsPinned) || (widget.activeChartType === 'grouped' && widget.equipmentPinned === 'none')){
					unhoverDynamic();
				}
				if (!widget.trhIsPinned) unhoverTrh();
			}
			function unhoverDynamic () {
				d3.event.stopPropagation()
				widget.equipmentHovered = 'none';
				widget.systemIsHovered = false;
				widget.svg.selectAll('.dynamicCategoryRects')
					.style('fill-opacity', 1)
					.style('stroke-opacity', 1)
				widget.svg.selectAll('.kwhYAxisTitle')
					.style('opacity', 1);
				widget.svg.selectAll('.costYAxisTitle')
					.style('opacity', 1);
				widget.resetElements('.costTooltip');
				widget.resetElements('.kwhTooltip');
				renderChangeTools();
			}
			function unhoverTrh () {
				widget.trhIsHovered = false;
				widget.svg.selectAll('.trhYAxisTitle')
					.style('opacity', 1)
				widget.resetElements('.trhTooltip');
			}
			function unhoverAll () {
				unhoverDynamic();
				unhoverTrh();
			}
			function unpin () {
				widget.equipmentPinned = 'none';
				widget.systemIsPinned = false;
				widget.trhIsPinned = false;
				unhoverAll();
			}

			// ************************ DYNAMIC BAR HOVER/PIN FUNCTIONS ************************* //
			function tryBarHoverFunc(d, i, nodes) {
				if (widget.activeChartType === 'stacked' || (widget.activeChartType === 'grouped' && widget.equipmentPinned === 'none')) {
					barHoverFunc (d, i, nodes)
				}
			}

			function barHoverFunc(d, i, nodes) {
				if (widget.activeChartType === 'stacked') {
					widget.systemIsHovered = true;
				}
				if (widget.activeChartType === 'grouped') {
					//reset last hover
					widget.resetElements('.costTooltip');
					widget.resetElements('.kwhTooltip');
					//change for this hover
					widget.equipmentHovered = nodes[i].parentNode.__data__.type;
					renderChangeTools();
					widget.svg.selectAll('.dynamicCategoryRects')
						.style('fill-opacity', (innerD, innerI, innerNodes) => {
							const myCat = innerD.category
							const myEq = innerNodes[innerI].parentNode.__data__.type
							if ((widget.equipmentHovered === 'none' || widget.equipmentHovered === myEq) && (widget.legendHovered === 'none' || widget.legendHovered === myCat) ) {
								return 1;
							} else {
								return unhoveredOpacity;
							}
						})
						.style('stroke-opacity', (innerD, innerI, innerNodes) => {
							const myCat = innerD.category
							const myEq = innerNodes[innerI].parentNode.__data__.type
							if ((widget.equipmentHovered === 'none' || widget.equipmentHovered === myEq) && (widget.legendHovered === 'none' || widget.legendHovered === myCat) ) {
								return 1;
							} else {
								return 0;
							}
						})
					}
				appendCostTooltip();
				appendKwhTooltip();
				kwhChart.selectAll('.kwhYAxisTitle')
					.style('opacity', 0);
				costChart.selectAll('.costYAxisTitle')
					.style('opacity', 0);
			}

			function barPinFunc  (d, i, nodes) {
				if (widget.activeChartType === 'stacked'){
					widget.systemIsPinned = true;
				}
				if (widget.activeChartType === 'grouped'){
					widget.equipmentPinned = nodes[i].parentNode.__data__.type;
				}
				barHoverFunc(d, i, nodes);
			}


				/******************** LEGEND HOVERS/UNHOVERS ******************/
	function getBarStrokeOpacity (innerD, innerI, innerNodes) {
		const myCat = innerD.category;
		const myEq = innerNodes[innerI].parentNode.__data__.type;
		if ( (widget.equipmentHovered === 'none' || widget.equipmentHovered === myEq) && (widget.legendHovered === 'none' || widget.legendHovered === myCat || (myCat === 'predicted' && widget.legendHovered === 'measured') ) ) {
			return 1;
		} else {
			return 0;
		}
	}
	function getBarFillOpacity (innerD, innerI, innerNodes) {
		const myCat = innerD.category
		const myEq = innerNodes[innerI].parentNode.__data__.type
		if ((widget.equipmentHovered === 'none' || widget.equipmentHovered === myEq) && (widget.legendHovered === 'none' || widget.legendHovered === myCat) ) {
			return 1;
		} else if (myCat === 'predicted') {
			return 0;
		} else {
			return unhoveredOpacity;
		}
	}



			// ************************ STYLING ************************* //
		widget.outerDiv.selectAll('*')
			.style('margin', 0)
			.style('padding', 0)

		widget.outerDiv.selectAll('.changeToolSvg')
			.style('overflow', 'hidden')

	};


	function render(widget, settingsChanged) {
		// invoking setupDefinitions, then returning value from successful promise to renderWidget func
		return setupDefinitions(widget)
			.then(data => {
				if (settingsChanged || !widget.data || needToRedrawWidget(widget, data)) {
					widget.data = data;
					renderWidget(widget, data);
				}
			})
			.catch(err => console.error('render did not complete: ' + err));
	}
	



////////////////////////////////////////////////////////////////
	// Initialize Widget
////////////////////////////////////////////////////////////////

	CxUtilitySavingsTool.prototype.doInitialize = function(element) {
		var that = this;
		element.addClass('CxUtilitySavingsToolOuter');
		that.outerDiv = d3.select(element[0]).append('div')
			.attr('class', 'CxUtilitySavingsTool')
			.style('cursor', 'default')

		that.getSubscriber().attach('changed', function(prop, cx) { render(that, false) });
	};


////////////////////////////////////////////////////////////////
	// Extra Widget Methods
////////////////////////////////////////////////////////////////

	CxUtilitySavingsTool.prototype.doLayout = CxUtilitySavingsTool.prototype.doChanged = CxUtilitySavingsTool.prototype.doLoad = function() { render(this, false); };

	/* FOR FUTURE NOTE: 
	CxUtilitySavingsTool.prototype.doChanged = function(name, value) {
		  if(name === 'value') valueChanged += 'prototypeMethod - ';
		  render(this);
	};
	*/

	CxUtilitySavingsTool.prototype.doDestroy = function() {
		this.jq().removeClass('CxUtilitySavingsToolOuter');
	};

	return CxUtilitySavingsTool;
});

