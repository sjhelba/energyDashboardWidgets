"use strict";
define(['bajaux/Widget', 'bajaux/mixin/subscriberMixIn', 'nmodule/ceoWeb/rc/d3/d3.min'], function(Widget, subscriberMixIn, d3) {


////////// Hard Coded Defs //////////
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

	const categories = [{name: 'baseline', displayName: 'Baseline'}, {name: 'projected', displayName: 'Projected'}, {name: 'measured', displayName: 'Measured'}];
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
		return 0;
	};

	const getDataForDate = (month, year, categoriesData, activeEquipmentGroups, rates, equipmentHistoryNames, availableDates) => {
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
		activeEquipmentGroups.forEach(equip => {
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
				if (((month === 'All' && availableDates[year] && availableDates[year][monthlyDatum.month]) || monthlyDatum.month === month) && (categoryIndex !== 2 || monthlyDatum.year == year)) {
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
					})
					// set system level trh vals for baseline and measured
					if (categoryIndex !== 1 && monthlyDatum.trh) categoryDataForDate[categoryIndex].trh += monthlyDatum.trh;	//default to 0 if missing data for date
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
				});
			}
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

	var UtilitySavingsTool = function() {
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

	UtilitySavingsTool.prototype = Object.create(Widget.prototype);
	UtilitySavingsTool.prototype.constructor = UtilitySavingsTool;



////////////////////////////////////////////////////////////////
	// / * SETUP DEFINITIONS AND DATA * /
////////////////////////////////////////////////////////////////


	const setupDefinitions = widget => {
		const today = new Date();
		const thisYear = today.getFullYear();
		const thisMonth = today.getMonth();

		// FROM USER // 
		const data = widget.properties().toValueMap();	//obj with all exposed properties as key/value pairs
		// FROM JQ //
		const jq = widget.jq();
		const jqWidth = jq.width() || 880;
		const jqHeight = jq.height() || 440;

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
			if(jqW < 1200 || jqH < 700) {
				return [small, 'small'];		//880, 440
			} else if (jqW < 1600 || jqH < 850) {
				return [medium, 'medium'];		// 1200, 700
			} else {
				return [large, 'large'];		//1600, 850 
			}
		}
		const widgetDimensions = chooseSize(jqHeight, jqWidth)[0];
		data.widgetSize = chooseSize(jqHeight, jqWidth)[1];
		
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
		


		// GET HISTORY DATA //
			//data to populate
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
		
		//return blended utility rate history trend
		return widget.resolve(`history:^System_Bur`)
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

							if (!blendedRateDates[rowYear]) blendedRateDates[rowYear] = {};
							if (!blendedRateDates[rowYear][rowMonth]) blendedRateDates[rowYear][rowMonth] = {total: 0, count: 0};
							blendedRateDates[rowYear][rowMonth].total += rowValue;
							blendedRateDates[rowYear][rowMonth].count ++;
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
					return Promise.all([widget.resolve(`history:^System_BlTrhMr`), widget.resolve(`history:^System_MsTrhMr`), widget.resolve(`history:^System_MsTrhCurrentMonth`)])
					
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
						return Promise.all([widget.resolve(`history:^${eqType}_BlKwhMr`), widget.resolve(`history:^${eqType}_PrKwh`), widget.resolve(`history:^${eqType}_MsKwhMr`), widget.resolve(`history:^${eqType}_MsKwhCurrentMonth`)])
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
										if (rowMonth !== thisMonth || rowYear !== thisYear) {
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
					// push kwhs and trhs into ordered arr formats
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
					data.formatCurrency = d3.format(`,.${data.currencyPrecision}f`)
					data.formatAvgCurrency = d3.format(`,.${+data.currencyPrecision + 1}f`)

						//get dataForDate
					data.availableDates = {};
					data.availableDatesWithMonthObjs = {};
					data.measuredData.forEach(date => {
						if (!data.availableDates[date.year]) {
							data.availableDates[date.year] = [];
							data.availableDatesWithMonthObjs[date.year] = {};
						}
						data.availableDates[date.year].push(date.month);
						data.availableDatesWithMonthObjs[date.year][date.month] = true; 
					})

					data.availableYears = Object.keys(data.availableDates).sort((a,b) => b - a);
					data.availableYears.forEach(yr => data.availableDates[yr].unshift('All'));
					if (!data.availableDates[widget.yearDropDownSelected]) widget.yearDropDownSelected = data.availableYears[data.availableYears.length - 1];
					
					widget.dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected, [data.baselineData, data.projectedData, data.measuredData], data.activeEquipmentGroups, data.blendedRates, data.equipmentHistoryNames, data.availableDatesWithMonthObjs)
					// eg format: {2017: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 2018: ['Jan', 'Feb', 'Mar']}

						// Funcs utilizing widget
					widget.updateDateWidgetRendering = () => {
						widget.dataForDate = getDataForDate(widget.monthDropDownSelected, widget.yearDropDownSelected, [data.baselineData, data.projectedData, data.measuredData], data.activeEquipmentGroups, data.blendedRates, data.equipmentHistoryNames, data.availableDatesWithMonthObjs)
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
						const selectionForCheck = widget.svg.selectAll(elementsToReset)
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
						.attr("x", d => stackedOrGrouped === 'grouped' ? x1Scale(d.category): x0Scale(d.category))
						.attr("y", d => kwhYScale(stackedOrGrouped === 'grouped' ? d.value : d.accumulated))
						.attr("width", stackedOrGrouped === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
						.attr("height", d => barSectionHeight - kwhYScale(d.value))   // run this to use changed kwhYScale
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
						.attr("x", d => stackedOrGrouped === 'grouped' ? x1Scale(d.category): x0Scale(d.category))
						.attr("y", d => costYScale(stackedOrGrouped === 'grouped' ? d.cost : d.accumulatedCost))
						.attr("width", stackedOrGrouped === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
						.attr("height", d => barSectionHeight - costYScale(d.cost))   // run this to use changed kwhYScale
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
			.enter().append("g")
				.attr('class', d => `equipmentGroups ${d.type}EquipmentGroup`)
				.attr('transform', d => `translate(${widget.activeChartType === 'grouped' ? x0Scale(d.type) : 0},0)`)
		
		equipmentGroups.selectAll('.categoryRects')
			.data(d => d.kwh)
			.enter().append("rect")
				.attr('class', d => `dynamicCategoryRects categoryRects ${d.category}CategoryRect ${d.category}Bar`)
				.attr('rx', 1)
				.attr('ry', 1)
				.attr("x", d => widget.activeChartType === 'grouped' ? x1Scale(d.category) : x0Scale(d.category))
				.attr("y", d => widget.activeChartType === 'grouped' ? kwhYScale(d.value) : kwhYScale(d.accumulated))
				.attr("width", widget.activeChartType === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
				.attr("height", d => barSectionHeight - kwhYScale(d.value) )
				.attr("fill", d => data[`${d.category}Color`])
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

				function appendHoverableKwhRects () {
					widget.resetElements('.hoverableKwhRects');
					equipmentGroups.selectAll('.hoverableKwhRects')
						.data(d => d.kwh)
						.enter().append("rect")
							.attr('class', `hoverableKwhRects`)
							.attr("x", d => x0Scale(d.category))
							.attr("y", (d, i, nodes) => {
								const maxHeightForGroup = nodes.reduce((accum, curr) => curr.__data__.value > accum.__data__.value ? curr : accum);
								return kwhYScale(maxHeightForGroup.__data__.value)
								})
							.attr("width",  x0Scale.bandwidth())
							.attr('opacity', 0)
							.attr("height", (d, i, nodes) => {
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
			.attr("class", "axis xAxis")
			.attr("transform", `translate(0, ${barSectionHeight})`)
			.call(xAxisGenerator);

		kwhXAxis.selectAll('line').attr('stroke', data.axesColor);
		kwhXAxis.selectAll('path').attr('stroke', data.axesColor);

		// y axis
		const kwhYAxis = kwhBarSection.append("g")
			.attr("class", "axis yAxis")
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
			.attr("text-anchor", "middle")
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
			const maxWidthCat = kwhDataForDate.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0,1).toUpperCase()}:${isStacked ? curr.kwh : curr.value}`, 'bold ' + data.tooltipFont) > getTextWidth(`${accum.category.slice(0,1).toUpperCase()}:${isStacked ? accum.kwh : accum.value}`, 'bold ' + data.tooltipFont) ?
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
				.data(kwhDataForDate)
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
		.enter().append("g")
			.attr('class', d => `equipmentGroups ${d.type}EquipmentGroup`)
			.attr('transform', d => `translate(${widget.activeChartType === 'grouped' ? x0Scale(d.type) : 0},0)`)

	costEquipmentGroups.selectAll('.categoryRects')
		.data(d => d.utilityRate)
		.enter().append("rect")
			.attr('class', d => `dynamicCategoryRects categoryRects ${d.category}CategoryRect ${d.category}Bar`)
			.attr('rx', 1)
			.attr('ry', 1)
			.attr("x", d => widget.activeChartType === 'grouped' ? x1Scale(d.category) : x0Scale(d.category))
			.attr("y", d => widget.activeChartType === 'grouped' ? costYScale(d.cost) : costYScale(d.accumulatedCost))
			.attr("width", widget.activeChartType === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
			.attr("height", d => barSectionHeight - costYScale(d.cost) )
			.attr("fill", d => data[`${d.category}Color`])
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
					.enter().append("rect")
						.attr('class', `hoverableCostRects`)
						.attr("x", d => x0Scale(d.category))
						.attr("y", (d, i, nodes) => {
							const maxHeightForGroup = nodes.reduce((accum, curr) => curr.__data__.cost > accum.__data__.cost ? curr : accum);
							return costYScale(maxHeightForGroup.__data__.cost);
							})
						.attr("width",  x0Scale.bandwidth())
						.attr('opacity', 0)
						.attr("height", (d, i, nodes) => {
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
		.attr("class", "axis xAxis")
		.attr("transform", `translate(0, ${barSectionHeight})`)
		.call(xAxisGenerator);

	costXAxis.selectAll('line').attr('stroke', data.axesColor);
	costXAxis.selectAll('path').attr('stroke', data.axesColor);

	// y axis
	const costYAxis = costBarSection.append("g")
		.attr("class", "axis yAxis")
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
		.attr("text-anchor", "middle")
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
			.enter().append("rect")
				.attr('class', d => `trhCategoryRects categoryRects ${d.category}CategoryRect ${d.category}Bar`)
				.attr('rx', 1)
				.attr('ry', 1)
				.attr("x", d => trhXScale(d.category))
				.attr("y", d => trhYScale(d.trh))
				.attr("width", trhXScale.bandwidth())
				.attr("height", d => barSectionHeight - trhYScale(d.trh) )
				.attr("fill", d => data[`${d.category}Color`])
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
					if(!widget.trhIsPinned){
						widget.trhIsHovered = false;
						widget.svg.selectAll('.trhYAxisTitle')
							.style('opacity', 1)
						widget.resetElements('.trhTooltip');
					}
				})

				
		// x axis
		const trhXAxis = trhBarSection.append('g')
			.attr("class", "axis xAxis")
			.attr("transform", `translate(0, ${barSectionHeight})`)
			.call(trhXAxisGenerator);

		trhXAxis.selectAll('line').attr('stroke', data.axesColor);
		trhXAxis.selectAll('path').attr('stroke', data.axesColor);

		// y axis
		const trhYAxis = trhBarSection.append("g")
			.attr("class", "axis yAxis")
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
			.attr("text-anchor", "middle")
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
				.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0,1).toUpperCase()}:${curr.trh}`, data.tooltipFont) > getTextWidth(`${accum.category.slice(0,1).toUpperCase()}:${accum.trh}`, 'bold ' + data.tooltipFont) ?
					curr :
					accum
				);
			const trhTooltipWidth = getTextWidth(`${maxWidthCat.category.slice(0,1).toUpperCase()}: ${maxWidthCat.trh + ' tRh'}`, 'bold ' + data.tooltipFont) + (data.tooltipPadding * 2)
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
				.text(d => d.trh + ' tRh')
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
						.style('fill-opacity', (innerD, innerI, innerNodes) => {
							const myCat = innerD.category;
							const myEq = innerNodes[innerI].parentNode.__data__.type;
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
			.text(data.formatCurrency(data.utilityRate))


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
				value: Math.abs(hoveredEquipmentDataForDate.kwh[2].value - hoveredEquipmentDataForDate.kwh[0].value),
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
				value: Math.abs(widget.dataForDate.categoryDataForDate[2].kwh - widget.dataForDate.categoryDataForDate[0].kwh),
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
			value: Math.abs(widget.dataForDate.categoryDataForDate[2].trh - widget.dataForDate.categoryDataForDate[0].trh),
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
			.attr('width', getTextWidth('W', data.changePercentFont));





		//append percent change svg with hidden overflow
		const changeToolSvg = percentChangeGroups.append('svg')
			.attr('class', 'changeToolSvg')
			.attr('y', 5)
			.attr('x', (getTextWidth('W', data.changePercentFont) + paddingBetweenArrowAndPercent) - 5)
			.attr('height', (getTextHeight(data.changePercentFont)))
			.attr('width', changeToolWidth - (getTextWidth('W', data.changePercentFont) + paddingBetweenArrowAndPercent) - 5)


		const displayForIndex = [
			[' ', '>', '<'],
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

		const percentChangeText2 = percentChangeTextGroup.selectAll('.digitBox2')
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

		// DROPDOWNS //
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



			// ************************ STYLING ************************* //
		widget.outerDiv.selectAll('*')
			.style('margin', 0)
			.style('padding', 0)

		widget.outerDiv.selectAll('.changeToolSvg')
			.style('overflow', 'hidden')

		console.log('TODO: ', data);
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

	UtilitySavingsTool.prototype.doInitialize = function(element) {
		var that = this;
		element.addClass("UtilitySavingsToolOuter");
		that.outerDiv = d3.select(element[0]).append('div')
			.attr('class', 'UtilitySavingsTool')
			.style('cursor', 'default')

		that.getSubscriber().attach("changed", function(prop, cx) { render(that, false) });
	};


////////////////////////////////////////////////////////////////
	// Extra Widget Methods
////////////////////////////////////////////////////////////////

	UtilitySavingsTool.prototype.doLayout = UtilitySavingsTool.prototype.doChanged = UtilitySavingsTool.prototype.doLoad = function() { render(this, false); };

	/* FOR FUTURE NOTE: 
	UtilitySavingsTool.prototype.doChanged = function(name, value) {
		  if(name === "value") valueChanged += 'prototypeMethod - ';
		  render(this);
	};
	*/

	UtilitySavingsTool.prototype.doDestroy = function() {
		this.jq().removeClass("UtilitySavingsToolOuter");
	};

	return UtilitySavingsTool;
});

