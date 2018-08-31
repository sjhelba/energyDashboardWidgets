
////ONLY FOR BROWSER /////
/* global blendedRates, baselineData, projectedData, measuredData */
const widget = {};
// DASHED/DOTTED: .style('stroke-dasharray', ('3,3'))

////////// Hard Coded Defs //////////
const getTotalHoursInMonth = (year, month) => 730;		// change 730 to getting actual hours in month
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
		* @param {number} dropdownBorderRadius DEFAULT: 5
		* @return {d3 element / obj} returns dropdownGroup appended to 'elementToAppendTo'
	*/
  function makeDropdown(arrOfOptions = [], funcToRunOnSelection = valOfSelection => console.log('selected: ' + valOfSelection), elementToAppendTo = d3.select('svg'), x = 5, y = 50, leftAligned = true, minDropdownWidth = 125, horizontalPadding = 5, verticalPadding = 5, strokeColor = 'black', backgroundFill = 'white', hoveredFill = '#d5d6d4', font = '10.0pt Nirmala UI', textColor = 'black', defaultSelection, funcToRunOnOpen, funcToRunOnClose, arrOfArgsToPassInToFuncsAfterVal, dropdownBorderRadius = 5) {
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
    function generatePath() {
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
      .attr('transform', `translate(${x + 6},${y + 6})`)
    //outer container
    const outerContainer = dropdownGroup.append('rect')
      .attr('class', 'outerContainerRect')
      .attr('width', dropdownWidth + 12)
      .attr('height', rowHeight + 12)
      .attr('fill', backgroundFill)
      .attr('rx', dropdownBorderRadius)
      .attr('stroke', strokeColor)
      .attr('x', - 6)
      .attr('y', - 6)
      .attr('stroke-width', '0.5px')
      .on('click', function() {
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
        .on('click', function(d) {
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
      .on('click', function() {
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
    function changeClickedSelection(newSelectionValue) {
      selectedRect.attr('fill', backgroundFill);
      clickedSelection = newSelectionValue;
      selectedText.text(clickedSelection);
      funcToRunOnSelection(newSelectionValue, ...arrOfArgsToPassInToFuncsAfterVal);
    }
    function toggleDrop() {
      open = !open;
      if (open) {
        funcToRunOnOpen(...arrOfArgsToPassInToFuncsAfterVal)
      } else {
        funcToRunOnClose(...arrOfArgsToPassInToFuncsAfterVal)
      }
      rowRects.attr('fill', d => d === clickedSelection ? hoveredFill : backgroundFill);
      outerContainer.transition()
        .attr('height', open ? dropdownHeight + 12: rowHeight + 12);
      dropdownRows.transition()
        .attr('transform', (d, i) => open ? `translate(0, ${rowHeight * (i + 1)})` : `translate(0,0)`);
    }
    return dropdownGroup;
  }
const areScalarArrsSame = (arr1, arr2) => arr1.length === arr2.length && arr1.every((el, idx) => el === arr2[idx]);
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
const small = { width: 880, height: 440 };
const medium = { width: 1200, height: 700 };
const large = { width: 1600, height: 850 };
const getJSDateFromTimestamp = d3.timeParse('%d-%b-%y %I:%M:%S.%L %p UTC%Z');
const getTextWidth = (text, font) => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	context.font = font;
	const width = context.measureText(text).width;
	d3.select(canvas).remove();
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

const categories = [{ name: 'baseline', displayName: 'Baseline' }, { name: 'projected', displayName: 'Projected' }, { name: 'measured', displayName: 'Measured' }];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const indexOfMonth = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

const getNextNiceVal = uglyMaxNum => {
	const innerFunc = origVal => {
		origVal = Math.ceil(origVal);

		let arr = origVal.toString().split('').map(str => +str);
		const digits = arr.length;
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

		return arr.join('');
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
				if (catIndex !== 1) {
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
const properties = [
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
		value: true	
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
];


////////////////////////////////////////////////////////////////
// /* SETUP DEFINITIONS AND DATA */
////////////////////////////////////////////////////////////////
const today = new Date();
const thisYear = today.getFullYear();
const thisMonth = 'Apr' || months[today.getMonth()];	//TODO: Fix for real data version

// FROM USER //
const data = {};
properties.forEach(prop => data[prop.name] = prop.value);

// FROM JQ //	// TODO: change to actual JQ dimensions for Niagara
//small
const jqWidth = 881;
const jqHeight = 441;
// //med
// const jqWidth = 1201;	
// const jqHeight = 701;
// //lrg
// const jqWidth = 1601;
// const jqHeight = 851;

data.activeEquipmentGroups = [
	'CHs',
	'PCPs',
	'SCPs',
	'TWPs',
	'CTFs',
];
if (!data.includeCTFs) { data.activeEquipmentGroups.splice(4, 1) }
if (!data.includeTWPs) { data.activeEquipmentGroups.splice(3, 1) }
if (!data.includeSCPs) { data.activeEquipmentGroups.splice(2, 1) }
if (!data.includePCPs) { data.activeEquipmentGroups.splice(1, 1) }
data.equipmentHistoryNames = data.activeEquipmentGroups.map(type => {
	if (type === 'CHs') return 'Chillers';
	if (type === 'PCPs') return 'Pcwps';
	if (type === 'SCPs') return 'Scwps';
	if (type === 'TWPs') return 'Twps';
	if (type === 'CTFs') return 'Towers';
});





// SIZING //
function chooseSize(jqH, jqW) {
	if (jqW < 1200 || jqH < 700) {
		return [small, 'small'];		//880, 440
	} else if (jqW < 1600 || jqH < 850) {
		return [medium, 'medium'];		// 1200, 700
	} else {
		return [large, 'large'];		//1600, 850 
	}
}
const widgetDimensions = chooseSize(jqHeight, jqWidth)[0];
data.widgetSize = chooseSize(jqHeight, jqWidth)[1];

data.margin = { top: 5, left: 5, right: 0, bottom: 0 };
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

if (!widget.monthDropdownSelected) widget.monthDropdownSelected = 'All';
if (!widget.yearDropdownSelected) widget.yearDropdownSelected = thisYear;

if (!widget.activeChartType) widget.activeChartType = 'stacked';	//alternative selection 'grouped'
if (!widget.modalActive) widget.modalActive = false; // alternative selection is true
if (widget.showPredicted !== false) widget.showPredicted = true; //in Niagara version, get from config point


// FAKE DATA //					// TODO: gather real data for Niagara
data.blendedRates = blendedRates;
data.baselineData = baselineData;
data.projectedData = projectedData;
data.measuredData = measuredData;
data.currencySymbol = '$';
data.currencyPrecision = '2';
data.firstMonthMeasuredHrs = 400;
data.firstYearMeasuredHrs = 7700;
data.currentMonthMeasuredHrs = 390;
data.currentYearMeasuredHrs = 2580;

// CALCULATED DEFS //
data.formatCurrency = d3.format(`,.${data.currencyPrecision}f`);
data.formatRateCurrency = d3.format(`,.${+data.currencyPrecision + 1}f`);
data.arrowWidth = getTextWidth('W', data.changePercentFont);
data.utilityRate = data.blendedRates[data.blendedRates.length - 1].rate;
if (!widget.blendedUtilityRateSelection) widget.blendedUtilityRateSelection = data.formatRateCurrency(data.utilityRate);
if (!widget.blendedUtilityRate) widget.blendedUtilityRate = data.formatRateCurrency(widget.blendedUtilityRateSelection);
if (widget.showPredictedInputSelection !== true && widget.showPredictedInputSelection !== false) widget.showPredictedInputSelection = widget.showPredicted;


const arrayOfMeasuredOperatingHours = [data.firstMonthMeasuredHrs, data.firstYearMeasuredHrs, data.currentMonthMeasuredHrs, data.currentYearMeasuredHrs];

// eg format: {2017: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 2018: ['Jan', 'Feb', 'Mar']}
data.availableDates = {};
data.measuredData.forEach(date => {
	if (!data.availableDates[date.year]) data.availableDates[date.year] = [];
	data.availableDates[date.year].push(date.month);
});
data.availableYears = Object.keys(data.availableDates).sort((a, b) => b - a);
data.availableYears.forEach(yr => data.availableDates[yr].unshift('All'));


//get dataForDate
widget.dataForDate = getDataForDate(widget.monthDropdownSelected, widget.yearDropdownSelected, [data.baselineData, data.projectedData, data.measuredData], data.activeEquipmentGroups, data.blendedRates, data.equipmentHistoryNames, data.availableDates, arrayOfMeasuredOperatingHours);

//is current date: first month, first year, current month, and/or current year of data, and therefore should widget show 'predicted' data? AND MUST HAVE SHOWPREDICTED TRUE
if (!widget.predictedIsShownForDate) widget.predictedIsShownForDate = widget.dataForDate.categoryDataForDate[3] && widget.showPredicted ? true : false;


// Funcs utilizing widget
widget.updateDateWidgetRendering = () => {
	widget.dataForDate = getDataForDate(widget.monthDropdownSelected, widget.yearDropdownSelected, [data.baselineData, data.projectedData, data.measuredData], data.activeEquipmentGroups, data.blendedRates, data.equipmentHistoryNames, data.availableDates, arrayOfMeasuredOperatingHours);
	widget.predictedIsShownForDate = widget.dataForDate.categoryDataForDate[3] && widget.showPredicted ? true : false;
	renderWidget();
};


widget.dropdownYearChanged = val => {
	widget.yearDropdownSelected = val;
	widget.monthDropdownSelected = 'All';
	widget.updateDateWidgetRendering();
};

widget.dropdownMonthChanged = val => {
	widget.monthDropdownSelected = val;
	widget.updateDateWidgetRendering();
};

widget.resetElements = elementsToReset => {
	const selectionForCheck = widget.outerDiv.selectAll(elementsToReset);
	if (!selectionForCheck.empty()) selectionForCheck.remove();
};



////////////////////////////////////////////////////////////////
// Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
////////////////////////////////////////////////////////////////

// INITIALIZATION //
widget.outerDiv = d3.select('#outer')
	.attr('class', 'UtilitySavingsToolOuter')
	.style('height', jqHeight + 'px')
	.style('width', jqWidth + 'px')
	.style('cursor', 'default');

// RENDER //
const renderWidget = () => {
	
	// delete leftover elements from versions previously rendered
	if (!widget.outerDiv.empty()) widget.outerDiv.selectAll('*').remove();
	// SVG INITIALIZATION //

	widget.svg = widget.outerDiv.append('svg')
		.attr('class', 'log')
		.attr('width', '100%')
		.attr('height', '100%')
		.on('mousedown', unpin);
	d3.select(widget.svg.node().parentNode).style('background-color', data.backgroundColor);
	d3.select(widget.svg.node().parentNode.parentNode).style('background-color', 'darkGray');	// TODO: delete for Niagara


	//tools defs
	const paddingLeftOfTools = 15;
	const dateDropdownWidth = data.widgetSize === 'small' ? 100 : 140;
	const paddingBetweenDropdowns = data.widgetSize === 'large' ? 30 : 20;
	const paddingUnderDropdownTitles = 8;
	const dropdownBorderRadius = '20px';

	

	// GENERAL GROUPS //
	const graphicGroup = widget.svg.append('g')
		.attr('class', 'graphicGroup')
		.attr('transform', `translate(${data.margin.left}, ${data.margin.top})`);



	const toolsGroupHeight = data.widgetSize === 'small' ? 110 : (data.widgetSize === 'medium' ? 120 : 130);
	const paddingBetweenToolsAndCharts = data.widgetSize === 'large' ? 50 : 30;
	const paddingAboveUtilityRate = 15;
	const toolsGroup = graphicGroup.append('g')
		.attr('class', 'toolsGroup');

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
	const modalWidth = chartWidth * 0.6;

	const circleRadius = 6
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

	//***************************************	SCALES, GENERATORS, AND TICKS FOR CHARTS ************************************************//
	//TICKS
	const getMaxYTick = (groupedOrStacked, chartName) => {
		let mapFuncForArrOfEquipVals = chartName === 'kwh' ?
			modObj => modObj.kwh.map(cat => cat.value) :
			modObj => modObj.utilityRate.map(cat => cat.cost);

		let allVals;

		if (groupedOrStacked === 'grouped' && chartName !== 'trh') {
			let arraysOfVals = widget.dataForDate.equipmentDataForDate.map(mapFuncForArrOfEquipVals);
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
		for (let i = 0; i <= numOfTicks; i++) {
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
					.delay(stackedOrGrouped === 'grouped' ? 0 : barsTransitionDuration / 2)
					.duration(barsTransitionDuration / 2)
					.attr('y', widget.activeChartType === 'grouped' ? barSectionHeight + 22 : barSectionHeight + 6)
				// .style('opacity', widget.activeChartType === 'grouped' ? 0 : 1)

			kwhChart.select('.xAxis')
				.transition()
					.delay(stackedOrGrouped === 'grouped' ? barsTransitionDuration / 2 : 0)
					.duration(barsTransitionDuration / 2)
					.call(xAxisGenerator);

			kwhChart.select('.yAxis')
				.transition()
					.duration(barsTransitionDuration)
					.call(kwhYAxisGenerator);

			kwhChart.select('.kwhYAxisTitle')
				.style('opacity', (widget.activeChartType === 'grouped' && widget.equipmentHovered === 'none') || (widget.activeChartType === 'stacked' && !widget.systemIsHovered) ? 1 : 0)


			// transition bars
			kwhChart.selectAll('.equipmentGroups')
				.transition()
					.duration(barsTransitionDuration)
					.attr('transform', d => `translate(${stackedOrGrouped === 'grouped' ? x0Scale(d.type) : 0},0)`)

			if (widget.predictedIsShownForDate && stackedOrGrouped === 'grouped') {
				kwhChart.selectAll('.predictedOverallCategoryRect')
					.transition()
						.style('display', 'none');
				kwhChart.selectAll('.predictedCategoryRect')
					.transition()
						.style('visibility', 'visible');
			}

			kwhChart.selectAll('.categoryRects')	// .data(d => d.kwh)
				.transition()
					.duration(barsTransitionDuration - 500)
					.attr('x', d => widget.activeChartType === 'grouped' ? x1Scale(d.category === 'predicted' ? 'measured' : d.category) : x0Scale(d.category === 'predicted' ? 'measured' : d.category))
					.attr('y', d => kwhYScale(stackedOrGrouped === 'grouped' ? d.value : d.accumulated))
					.attr('width', stackedOrGrouped === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
					.attr('height', d => barSectionHeight - kwhYScale(d.value))   // run this to use changed kwhYScale
					.attr('stroke', d => d.category === 'predicted' ? data.measuredColor : data[`${d.category}Color`])
				.on('end', () => {
					kwhChart.selectAll('.categoryRects')
						.attr('stroke', d => {
							if (d.category === 'predicted') return data.measuredColor;
							if (widget.activeChartType === 'grouped') return 'none';
							return data[`${d.category}Color`];
						});
					if (widget.predictedIsShownForDate && stackedOrGrouped === 'stacked') {
						kwhChart.selectAll('.predictedOverallCategoryRect')
							.attr('x', x0Scale('measured'))
							.attr('y', kwhYScale(widget.dataForDate.categoryDataForDate[3].kwh))
							.attr('width', x0Scale.bandwidth())
							.attr('height', barSectionHeight - kwhYScale(widget.dataForDate.categoryDataForDate[3].kwh))
							.transition()
								.delay(500)
								.style('display', 'block');
						kwhChart.selectAll('.predictedCategoryRect')
							.transition()
								.delay(500)
								.style('visibility', 'hidden');
						//lower predicted overall category rect under measured
						kwhChart.selectAll('.predictedOverallCategoryRect').lower();
					}
				})



			if (stackedOrGrouped === 'grouped') {
				appendHoverableKwhRects();
			} else {
				widget.resetElements('.hoverableKwhRects');
			}

			//tick styling
			kwhChart.selectAll('.tick text')
				.style('fill', data.tickTextColor)
				.style('font', data.tickFont);
		}
		kwhChartTransition();

		function costChartTransition() {
			//transition axes
			costChart.select('.costXAxisTitle')
				.transition()
					.delay(stackedOrGrouped === 'grouped' ? 0 : barsTransitionDuration / 2)
					.duration(barsTransitionDuration / 2)
					.attr('y', widget.activeChartType === 'grouped' ? barSectionHeight + 22 : barSectionHeight + 6)
				// .style('opacity', widget.activeChartType === 'grouped' ? 0 : 1)

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

			if (widget.predictedIsShownForDate && stackedOrGrouped === 'grouped') {
				costChart.selectAll('.predictedOverallCategoryRect')
					.transition()
						.style('display', 'none');
				costChart.selectAll('.predictedCategoryRect')
					.transition()
						.style('visibility', 'visible');
			}

			costChart.selectAll('.categoryRects')	// .data(d => d.utilityRate)
				.transition()
					.duration(barsTransitionDuration - 500)
					.attr('x', d => widget.activeChartType === 'grouped' ? x1Scale(d.category === 'predicted' ? 'measured' : d.category) : x0Scale(d.category === 'predicted' ? 'measured' : d.category))
					.attr('y', d => widget.activeChartType === 'grouped' ? costYScale(d.cost) : costYScale(d.accumulatedCost))
					.attr('width', stackedOrGrouped === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
					.attr('height', d => barSectionHeight - costYScale(d.cost))   // run this to use changed kwhYScale
					.attr('stroke', d => d.category === 'predicted' ? data.measuredColor : data[`${d.category}Color`])
				.on('end', () => {
					costChart.selectAll('.categoryRects')
						.attr('stroke', d => {
							if (d.category === 'predicted') return data.measuredColor;
							if (widget.activeChartType === 'grouped') return 'none';
							return data[`${d.category}Color`];
						});
					if (widget.predictedIsShownForDate && stackedOrGrouped === 'stacked') {
						costChart.selectAll('.predictedOverallCategoryRect')
							.attr('x', x0Scale('measured'))
							.attr('y', costYScale(widget.dataForDate.categoryDataForDate[3].cost))
							.attr('width', x0Scale.bandwidth())
							.attr('height', barSectionHeight - costYScale(widget.dataForDate.categoryDataForDate[3].cost))
							.transition()
								.delay(500)
								.style('display', 'block');
						costChart.selectAll('.predictedCategoryRect')
							.transition()
								.delay(500)
								.style('visibility', 'hidden')
							//lower predicted overall category rect under measured
							costChart.selectAll('.predictedOverallCategoryRect').lower();		
					}
				})

			if (stackedOrGrouped === 'grouped') {
				appendHoverableCostRects()
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
		widget.activeChartType === 'stacked' ? widget.activeChartType = 'grouped' : widget.activeChartType = 'stacked';
		transitionCharts(widget.activeChartType)
		toggleButton();
	};












	//********************************************* KWH CHART ***********************************************************//
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
			.attr('width', widget.activeChartType === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
			.attr('height', d => barSectionHeight - kwhYScale(d.value) )
			.attr('fill', d => d.category === 'predicted' ? data.backgroundColor : data[`${d.category}Color`])
			.style('stroke-dasharray', d => d.category === 'predicted' ? '2,2' : '0,0')
			.style('fill-opacity', getBarFillOpacity)
			.style('display', d => d.category === 'predicted' && !widget.predictedIsShownForDate ? 'none' : 'block')
			.style('stroke-opacity', getBarStrokeOpacity)
			.attr('stroke', d => {
				if (d.category === 'predicted') return data.measuredColor;
				if (widget.activeChartType === 'grouped') return 'none';
				return data[`${d.category}Color`];
			})
			.on('mouseover', tryBarHoverFunc)
			.on('mousedown', () => d3.event.stopPropagation())
			.on('click', barPinFunc)
			.on('mouseout', tryUnhover);
	


	if (widget.predictedIsShownForDate) {
		//make rect that only shows category level predicted
		kwhBarSection.append('rect')
			.attr('class', `predictedOverallCategoryRect`)
			.attr('rx', 1)
			.attr('ry', 1)
			.attr('x', x0Scale('measured'))
			.attr('y', kwhYScale(widget.dataForDate.categoryDataForDate[3].kwh))
			.attr('width', x0Scale.bandwidth())
			.attr('height', barSectionHeight - kwhYScale(widget.dataForDate.categoryDataForDate[3].kwh))
			.attr('fill', data.backgroundColor)
			.style('stroke-dasharray', '2,2')
			.style('fill-opacity', () => getBarFillOpacity({category: 'predicted'}))
			.style('stroke-opacity', () => getBarStrokeOpacity({category: 'predicted'}))
			.attr('stroke', data.measuredColor)
			.style('display', widget.activeChartType === 'stacked' ? 'block' : 'none')
			.on('mouseover', () => tryBarHoverFunc({category: 'predicted'}))
			.on('mousedown', function() {d3.event.stopPropagation()})
			.on('click', () => barPinFunc({category: 'predicted'}))
			.on('mouseout', () => tryUnhover({category: 'predicted'}));
		if (widget.activeChartType === 'stacked') {
			//hide equipment level stacked predicted
			kwhBarSection.selectAll('.predictedCategoryRect').style('visibility', 'hidden');
			//lower overall predicted behind measured
			kwhBarSection.selectAll('.predictedOverallCategoryRect').lower();
		} else {
			//raise measured over predicted eq groups rects
			kwhBarSection.selectAll('.measuredCategoryRect').raise();
		} 
	}




	function appendHoverableKwhRects() {
		widget.resetElements('.hoverableKwhRects');
		equipmentGroups.selectAll('.hoverableKwhRects')
			.data(d => d.kwh)
			.enter().append('rect')
			.attr('class', `hoverableKwhRects`)
			.attr('rx', 1)
			.attr('ry', 1)
			.attr('x', d => x0Scale(d.category === 'predicted' ? 'measured' : d.category))
			.attr('y', (d, i, nodes) => {
				const maxHeightForGroup = nodes.reduce((accum, curr) => curr.__data__.value > accum.__data__.value ? curr : accum);
				return kwhYScale(maxHeightForGroup.__data__.value)
			})
			.attr('width', x0Scale.bandwidth())
			.attr('opacity', 0)
			.attr('height', (d, i, nodes) => {
				const maxHeightForGroup = nodes.reduce((accum, curr) => curr.__data__.value > accum.__data__.value ? curr : accum);
				return barSectionHeight - kwhYScale(maxHeightForGroup.__data__.value)
			})
			.on('mouseover', tryBarHoverFunc)
			.on('mousedown', function() {
				d3.event.stopPropagation()
			})
			.on('click', barPinFunc)
			.on('mouseout', tryUnhover)
	}

	if (widget.activeChartType === 'grouped') appendHoverableKwhRects();


	// x axis
	kwhBarSection.append('g')
		.attr('class', 'axis xAxis')
		.attr('transform', `translate(0, ${barSectionHeight})`)
		.call(xAxisGenerator);

	// y axis
	kwhBarSection.append('g')
		.attr('class', 'axis yAxis')
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
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'hanging')
		.attr('fill', data.unitsColor)
		.style('font', data.unitsFont)
		.style('opacity', (widget.activeChartType === 'grouped' && widget.equipmentHovered === 'none') || (widget.activeChartType === 'stacked' && !widget.systemIsHovered) ? 1 : 0)

	//x axis systemName
	kwhBarSection.append('text')
		.attr('class', 'kwhXAxisTitle')
		.attr('dominant-baseline', 'hanging')
		.attr('x', (barSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2))
		.style('font', data.systemNameFont)
		.attr('fill', data.tickTextColor)
		.attr('y', widget.activeChartType === 'grouped' ? barSectionHeight + 22 : barSectionHeight + 6)
		// .style('opacity', widget.activeChartType === 'grouped' ? 0 : 1)
		// .on('mouseover', unhover)
		.text(data.systemName)


	// tooltip
	function appendKwhTooltip() {
		widget.resetElements('.kwhTooltip')
		const isStacked = widget.activeChartType === 'stacked'
		const kwhDataForDate = isStacked ? widget.dataForDate.categoryDataForDate : widget.dataForDate.equipmentDataForDate.filter(datum => datum.type === widget.equipmentHovered)[0].kwh;
		//takes into account predicted if needed for date
		const getKwhDataArrayForTooltip = () => {
			let kwhDataArrayForTooltip = kwhDataForDate.map(obj => Object.assign({}, obj));	//deep copy array of objs
			if (widget.predictedIsShownForDate) {
				if (isStacked) {
					kwhDataArrayForTooltip[2].kwh = kwhDataArrayForTooltip[3].kwh;
					kwhDataArrayForTooltip[2].cost = kwhDataArrayForTooltip[3].cost;
					kwhDataArrayForTooltip[2].trh = kwhDataArrayForTooltip[3].trh;
				} else {
					kwhDataArrayForTooltip[2].value = kwhDataArrayForTooltip[3].value;
					kwhDataArrayForTooltip[2].accumulated = kwhDataArrayForTooltip[3].accumulated;
				}
			}
			kwhDataArrayForTooltip = kwhDataArrayForTooltip.slice(0,3);
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

		const maxWidthCat = kwhDataArrayForTooltip.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0, 1).toUpperCase()}:${isStacked ? curr.kwh : curr.value}`, 'bold ' + data.tooltipFont) > getTextWidth(`${accum.category.slice(0, 1).toUpperCase()}:${isStacked ? accum.kwh : accum.value}`, 'bold ' + data.tooltipFont) ?
			curr :
			accum
		);
		const tooltipWidth = getTextWidth(`${maxWidthCat.category.slice(0, 1).toUpperCase()}:`, 'bold ' + data.tooltipFont) + getTextWidth(`${isStacked ? maxWidthCat.kwh + ' kWh' : maxWidthCat.value + ' kWh'}`, data.tooltipFont) + (data.tooltipPadding * 2.5) + data.paddingAfterLegendCat
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
			.text((d, i) => d.category.slice(0, 1).toUpperCase() + ': ')
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', d => data[d.category + 'Color'] || data.tooltipFontColor)
			.style('font-weight', 'bold')

		textGroups.append('text')
			.text((d, i) => isStacked ? d.kwh + ' kWh' : d.value + ' kWh')
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', data.tooltipFontColor)
			.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + data.paddingAfterLegendCat)
	}
	if (widget.systemIsHovered || widget.equipmentHovered !== 'none') appendKwhTooltip();








	//*********************************** COST CHART ************************************//
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
			.attr('x', d => widget.activeChartType === 'grouped' ? x1Scale(d.category === 'predicted' ? 'measured' : d.category) : x0Scale(d.category === 'predicted' ? 'measured' : d.category))
			.attr('y', d => widget.activeChartType === 'grouped' ? costYScale(d.cost) : costYScale(d.accumulatedCost))
			.attr('width', widget.activeChartType === 'grouped' ? x1Scale.bandwidth() : x0Scale.bandwidth())
			.attr('height', d => barSectionHeight - costYScale(d.cost))
			.attr('fill', d => d.category === 'predicted' ? data.backgroundColor : data[`${d.category}Color`])
			.style('display', d => d.category === 'predicted' && !widget.predictedIsShownForDate ? 'none' : 'block')
			.style('fill-opacity', getBarFillOpacity)
			.style('stroke-opacity', getBarStrokeOpacity)
			.attr('stroke', d => {
				if (d.category === 'predicted') return data.measuredColor;
				if (widget.activeChartType === 'grouped') return 'none';
				return data[`${d.category}Color`];
			})
			.style('stroke-dasharray', d => d.category === 'predicted' ? '2,2' : '0,0')
			.on('mouseover', tryBarHoverFunc)
			.on('mousedown', () => d3.event.stopPropagation())
			.on('click', barPinFunc)
			.on('mouseout', tryUnhover)

		if (widget.predictedIsShownForDate) {
			//make rect that only shows category level predicted
			costBarSection.append('rect')
				.attr('class', `predictedOverallCategoryRect`)
				.attr('rx', 1)
				.attr('ry', 1)
				.attr('x', x0Scale('measured'))
				.attr('y', costYScale(widget.dataForDate.categoryDataForDate[3].cost))
				.attr('width', x0Scale.bandwidth())
				.attr('height', barSectionHeight - costYScale(widget.dataForDate.categoryDataForDate[3].cost))
				.attr('fill', data.backgroundColor)
				.style('stroke-dasharray', '2,2')
				.style('fill-opacity', () => getBarFillOpacity({category: 'predicted'}))
				.style('stroke-opacity', () => getBarStrokeOpacity({category: 'predicted'}))
				.style('display', widget.activeChartType === 'stacked' ? 'block' : 'none')
				.attr('stroke', data.measuredColor)
				.on('mouseover', () => tryBarHoverFunc({category: 'predicted'}))
				.on('mousedown', () => d3.event.stopPropagation())
				.on('click', () => barPinFunc({category: 'predicted'}))
				.on('mouseout', () => tryUnhover({category: 'predicted'}))
			if (widget.activeChartType === 'stacked') {
				//hide equipment level stacked predicted
				costBarSection.selectAll('.predictedCategoryRect').style('visibility', 'hidden');
				//lower overall predicted behind measured
				costBarSection.selectAll('.predictedOverallCategoryRect').lower();
			} else {
				//raise measured over predicted eq groups rects
				costBarSection.selectAll('.measuredCategoryRect').raise();
			} 
		}	


	function appendHoverableCostRects() {
		widget.resetElements('.hoverableCostRects');
		costEquipmentGroups.selectAll('.hoverableCostRects')
			.data(d => d.utilityRate)
			.enter().append('rect')
			.attr('class', `hoverableCostRects`)
			.attr('x', d => x0Scale(d.category === 'predicted' ? 'measured' : d.category))
			.attr('y', (d, i, nodes) => {
				const maxHeightForGroup = nodes.reduce((accum, curr) => curr.__data__.cost > accum.__data__.cost ? curr : accum);
				return costYScale(maxHeightForGroup.__data__.cost);
			})
			.attr('width', x0Scale.bandwidth())
			.attr('opacity', 0)
			.attr('height', (d, i, nodes) => {
				const maxHeightForGroup = nodes.reduce((accum, curr) => curr.__data__.cost > accum.__data__.cost ? curr : accum);
				return barSectionHeight - costYScale(maxHeightForGroup.__data__.cost)
			})
			.on('mouseover', tryBarHoverFunc)
			.on('mousedown', function() {
				d3.event.stopPropagation()
			})
			.on('click', barPinFunc)
			.on('mouseout', tryUnhover)
	}

	if (widget.activeChartType === 'grouped') appendHoverableCostRects();









	// x axis
	costBarSection.append('g')
		.attr('class', 'axis xAxis')
		.attr('transform', `translate(0, ${barSectionHeight})`)
		.call(xAxisGenerator);

	// y axis
	costBarSection.append('g')
		.attr('class', 'axis yAxis')
		.call(costYAxisGenerator)


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
		.attr('x', (barSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2))
		.style('font', data.systemNameFont)
		.attr('fill', data.tickTextColor)
		.text(data.systemName)
		.attr('y', widget.activeChartType === 'grouped' ? barSectionHeight + 22 : barSectionHeight + 6)
	// .style('opacity', widget.activeChartType === 'grouped' ? 0 : 1)
	// .on('mouseover', unhover)



	// tooltip
	function appendCostTooltip() {
		widget.resetElements('.costTooltip')
		const costDataForDate = widget.activeChartType === 'stacked' ?
			widget.dataForDate.categoryDataForDate :
			widget.dataForDate.equipmentDataForDate.filter(datum => datum.type === widget.equipmentHovered)[0].utilityRate;

		//takes into account predicted if needed for date
		const getCostDataArrayForTooltip = () => {
			let costDataArrayForTooltip = costDataForDate.map(obj => Object.assign({}, obj));	//deep copy array of objs
			if (widget.predictedIsShownForDate) costDataArrayForTooltip[2].cost = costDataArrayForTooltip[3].cost;
			costDataArrayForTooltip = costDataArrayForTooltip.slice(0,3);
			return costDataArrayForTooltip;
		}
		const costDataArrayForTooltip = getCostDataArrayForTooltip();

		const maxWidthCat = costDataArrayForTooltip.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0, 1).toUpperCase()}${data.formatCurrency(curr.cost)}${data.formatRateCurrency(curr.rate)}`, 'bold ' + data.tooltipFont) > getTextWidth(`${accum.category.slice(0, 1).toUpperCase()}${data.formatCurrency(accum.cost)}${data.formatRateCurrency(accum.rate)}`, data.tooltipFont) ?
			curr :
			accum
		);

		const tooltipWidth = getTextWidth(`${maxWidthCat.category.slice(0, 1).toUpperCase()}:${data.currencySymbol}${data.formatCurrency(maxWidthCat.cost)}@ ${data.currencySymbol}${data.formatRateCurrency(maxWidthCat.rate)}`, 'bold ' + data.tooltipFont) + (data.tooltipPadding * 2.5) + (data.paddingAfterLegendCat * 2)
		const tooltipHeight = (data.tooltipPadding * 2) + (costDataArrayForTooltip.length * getTextHeight(data.tooltipFont)) + ((costDataArrayForTooltip.length - 1) * data.paddingBetweenTooltipText);

		const maxWidthCostCat = costDataArrayForTooltip.reduce((accum, curr) => getTextWidth(data.formatCurrency(curr.cost), 'bold ' + data.tooltipFont) > getTextWidth(data.formatCurrency(accum.cost), 'bold ' + data.tooltipFont) ?
			curr :
			accum
		);
		const maxWidthOfCost = getTextWidth(data.currencySymbol + data.formatCurrency(maxWidthCostCat.cost), data.tooltipFont);

		const tooltip = costBarSection.append('g')
			.attr('class', 'costTooltip')
			.attr('transform', `translate(${barSectionWidth - tooltipWidth},0)`)

		tooltip.append('rect')
			.attr('class', 'tooltip')
			.attr('height', tooltipHeight)
			.attr('width', tooltipWidth)
			.attr('fill', data.tooltipBackgroundColor)
			.attr('opacity', data.tooltipOpacity)
			.attr('rx', 5)
			.attr('ry', 5)

		const textGroups = tooltip.selectAll('.costTextGroup')
			.data(costDataArrayForTooltip)
			.enter().append('g')
			.attr('class', d => `costTextGroup ${d.category}CostTextGroup tooltip`)
			.attr('transform', (d, i) => `translate(${data.tooltipPadding},${(data.tooltipPadding * 1.5) + (i * (getTextHeight(data.tooltipFont) + data.paddingBetweenTooltipText)) - (getTextHeight(data.tooltipFont) / 2)})`)

		textGroups.append('text')
			.text((d, i) => d.category.slice(0, 1).toUpperCase() + ': ')
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', d => data[d.category + 'Color'] || data.tooltipFontColor)
			.style('font-weight', 'bold')


		textGroups.append('text')
			.text((d, i) => data.currencySymbol + data.formatCurrency(d.cost))
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', data.tooltipFontColor)
			.attr('text-anchor', 'end')
			.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + maxWidthOfCost + data.paddingAfterLegendCat)

		textGroups.append('text')
			.text((d, i) => '@ ' + data.currencySymbol + data.formatRateCurrency(d.rate))
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', data.tooltipFontColor)
			.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + maxWidthOfCost + (data.paddingAfterLegendCat * 2))

	}
	if (widget.systemIsHovered || widget.equipmentHovered !== 'none') appendCostTooltip();






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
		.enter().append('rect')
			.attr('class', d => `trhCategoryRects categoryRects ${d.category}CategoryRect ${d.category}Bar`)
			.attr('x', d => trhXScale(d.category === 'predicted' ? 'measured' : d.category))
			.attr('y', d => trhYScale(d.trh))
			.attr('width', trhXScale.bandwidth())
			.attr('height', d => barSectionHeight - trhYScale(d.trh))
			.attr('fill', d => d.category === 'predicted' ? data.backgroundColor : data[`${d.category}Color`])
			.style('display', d => d.category === 'predicted' && !widget.predictedIsShownForDate ? 'none' : 'block')
			.style('opacity', d => widget.legendHovered === 'none' || widget.legendHovered === d.category || (d.category === 'predicted' && widget.legendHovered === 'measured') ? 1 : unhoveredOpacity)
			.attr('stroke', d => data[`${d.category === 'predicted' ? 'measured' : d.category}Color`])
			.style('stroke-dasharray', d => d.category === 'predicted' ? '2,2' : '0,0')
			.on('mouseover', function() {
				widget.trhIsHovered = true;
				appendTrhTooltip();
				trhChart.selectAll('.trhYAxisTitle').style('opacity', 0)
			})
			.on('mousedown', () => d3.event.stopPropagation())
			.on('click', function() {
				widget.trhIsHovered = true;
				widget.trhIsPinned = true;
				appendTrhTooltip();
				trhChart.selectAll('.trhYAxisTitle').style('opacity', 0)
			})
			.on('mouseout', function() {
				if (!widget.trhIsPinned) {
					widget.trhIsHovered = false;
					widget.svg.selectAll('.trhYAxisTitle').style('opacity', 1)
					widget.resetElements('.trhTooltip');
				}
			})

		if (widget.predictedIsShownForDate) widget.svg.selectAll('.measuredCategoryRect').raise();


	// x axis
	trhBarSection.append('g')
		.attr('class', 'axis xAxis')
		.attr('transform', `translate(0, ${barSectionHeight})`)
		.call(trhXAxisGenerator);

	// y axis
	trhBarSection.append('g')
		.attr('class', 'axis yAxis')
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
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'hanging')
		.attr('fill', data.unitsColor)
		.style('font', data.unitsFont)
		.style('opacity', widget.trhIsHovered ? 0 : 1)


	// x axis title
	trhBarSection.append('text')
		.attr('class', 'trhXAxisTitle')
		.attr('dominant-baseline', 'hanging')
		.attr('x', (trhBarSectionWidth / 2) - (getTextWidth(data.systemName, data.tickFont) / 2))
		.style('font', data.systemNameFont)
		.attr('fill', data.tickTextColor)
		.attr('y', barSectionHeight + 6)
		.text(data.systemName)


	// tooltip
	function appendTrhTooltip() {
		widget.resetElements('.trhTooltip')

		const getTrhDataArrayForTooltip = () => {
			let trhDataArrayForTooltip = trhCategoryDataForDate.map(obj => Object.assign({}, obj));	//deep copy array of objs
			if (widget.predictedIsShownForDate) {
				trhDataArrayForTooltip[1].trh = trhDataArrayForTooltip[2].trh;
			}
			trhDataArrayForTooltip = trhDataArrayForTooltip.slice(0,2);
			trhDataArrayForTooltip.forEach(obj => obj.trh = Math.round(obj.trh));
			return trhDataArrayForTooltip;
		}
		const trhDataArrayForTooltip =  getTrhDataArrayForTooltip();
		
		
		const maxWidthCat = trhDataArrayForTooltip
			.reduce((accum, curr) => getTextWidth(`${curr.category.slice(0, 1).toUpperCase()}:${curr.trh}`, data.tooltipFont) > getTextWidth(`${accum.category.slice(0, 1).toUpperCase()}:${accum.trh}`, 'bold ' + data.tooltipFont) ?
				curr :
				accum
			);
		const trhTooltipWidth = getTextWidth(`${maxWidthCat.category.slice(0, 1).toUpperCase()}: ${maxWidthCat.trh + ' tRh'}`, 'bold ' + data.tooltipFont) + (data.tooltipPadding * 2)
		const trhTooltipHeight = data.widgetSize === 'medium' ? 40 : (data.widgetSize === 'small' ? 35 : 50);
		const trhTooltip = trhBarSection.append('g')
			.attr('class', 'trhTooltip')
			.attr('transform', `translate(${trhBarSectionWidth - trhTooltipWidth}, 0)`)

		trhTooltip.append('rect')
			.attr('class', 'tooltip')
			.attr('height', trhTooltipHeight)
			.attr('width', trhTooltipWidth)
			.attr('fill', data.tooltipBackgroundColor)
			.attr('opacity', data.tooltipOpacity)
			.attr('rx', 5)
			.attr('ry', 5)

		const trhTextGroups = trhTooltip.selectAll('.trhTextGroup')
			.data(trhDataArrayForTooltip)
			.enter().append('g')
				.attr('class', d => `trhTextGroup ${d.category}TrhTextGroup tooltip`)
				.attr('transform', (d, i) => `translate(${(data.tooltipPadding)},${(data.tooltipPadding * 1.25) + (i * (getTextHeight(data.tooltipFont) + data.paddingBetweenTooltipText)) - (getTextHeight(data.tooltipFont) / 2)})`)

		trhTextGroups.append('text')
			.text(d => `${d.category.slice(0, 1).toUpperCase()}:`)
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', d => data[d.category + 'Color'] || data.tooltipFontColor)
			.style('font-weight', 'bold')

		trhTextGroups.append('text')
			.text(d => Math.round(d.trh) + ' tRh')
			.attr('x', getTextWidth('M:', 'bold ' + data.tooltipFont) + data.paddingAfterLegendCat)
			.attr('dominant-baseline', 'hanging')
			.style('font', data.tooltipFont)
			.attr('fill', data.tooltipFontColor)

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
				widget.svg.selectAll('.predictedOverallCategoryRect')
					.style('fill-opacity', () => getBarFillOpacity({category: 'predicted'}))
					.style('stroke-opacity', () => getBarStrokeOpacity({category: 'predicted'}));
				widget.svg.selectAll('.trhCategoryRects')
					.style('opacity', innerD => widget.legendHovered === 'none' || widget.legendHovered === innerD.category || (innerD.category === 'predicted' && widget.legendHovered === 'measured') ? 1 : unhoveredOpacity)
			})
			.on('mouseout', function(d) {
				widget.legendHovered = 'none';

				widget.svg.selectAll(`.${d.name}LegendText`)
					.style('font-weight', 'normal')

				widget.svg.selectAll(`.${d.name}LegendCircle`)
					.attr('r', circleRadius);

				widget.svg.selectAll(`.dynamicCategoryRects`)
					.style('fill-opacity', getBarFillOpacity)
					.style('stroke-opacity', getBarStrokeOpacity);

				widget.svg.selectAll('.predictedOverallCategoryRect')
					.style('fill-opacity', () => getBarFillOpacity({category: 'predicted'}))
					.style('stroke-opacity', () => getBarStrokeOpacity({category: 'predicted'}));

				widget.svg.selectAll('.trhCategoryRects')
					.style('opacity', innerD => widget.legendHovered === 'none' || widget.legendHovered === innerD.category  || (innerD.category === 'predicted' && widget.legendHovered === 'measured') ? 1 : unhoveredOpacity)
			});

	legendCategories.append('circle')
		.attr('class', d => `${d.name}LegendCircle`)
		.attr('r', d => widget.legendHovered === d.name ? hoveredCircleRadius : circleRadius)
		.attr('fill', d => data[d.name + 'Color']);

	legendCategories.append('text')
		.attr('class', d => `legendText ${d.name}LegendText`)
		.style('font', data.legendFont)
		.style('font-weight', d => widget.legendHovered === d.name ? 'bold' : 'normal')
		.attr('fill', data.legendTextColor)
		.attr('dominant-baseline', 'middle')
		.attr('x', circleRadius + (circleRadius / 2))
		.text(d => d.displayName);



	//************************************* TOOLS ******************************************//


	// UTILITY RATE
	const paddingAboveCurrencySymbol = 2;
	const paddingRightOfCurrencySymbol = 5;
	utilityRateGroup.append('text')
		.text('Blended Utility Rate')
		.attr('dominant-baseline', 'hanging')
		.style('font', data.toolTitleFont);

	//currencySymbol
	utilityRateGroup.append('text')
		.attr('y', getTextHeight(data.toolTitleFont) + paddingAboveCurrencySymbol)
		.attr('dominant-baseline', 'hanging')
		.style('font', data.currencySymbolFont)
		.attr('fill', data.currencySymbolColor)
		.text(data.currencySymbol);

	//blended utility rate
	utilityRateGroup.append('text')
		.attr('dominant-baseline', 'hanging')
		.attr('x', getTextWidth(data.currencySymbol, data.currencySymbolFont) + paddingRightOfCurrencySymbol)
		.attr('y', getTextHeight(data.toolTitleFont) + paddingAboveCurrencySymbol)
		.style('font', data.utilityRateFont)
		.attr('fill', data.utilityRateColor)
		.text(data.formatRateCurrency(widget.blendedUtilityRate));


	// CHANGE TOOLS
	const changeToolsPaddingTop = 0;
	const getNiceChangePercent = (origVal, newVal) => {
		const diff = Math.abs(origVal - newVal);
		const change = diff / origVal;
		const percentVal = change * 100;
		const roundedPercentVal = Math.round(percentVal);
		return roundedPercentVal === 0 && percentVal > 0 ? '<01' : roundedPercentVal;
	};
	const paddingBetweenPercentAndValue = data.widgetSize === 'large' ? 10 : 5;
	const paddingBetweenArrowAndPercent = 0;
	const getWidthOfPercentArrowAndText = text => getTextWidth(text + 'W%', data.changePercentFont) + paddingBetweenArrowAndPercent;
	const changeToolWidth = data.widgetSize === 'small' ? 0.56 * barSectionWidth : (data.widgetSize === 'medium' ? 0.53 * barSectionWidth : 0.5 * barSectionWidth);
	const changeToolHeight = data.widgetSize === 'small' ? 60 : (data.widgetSize === 'medium' ? 70 : 90);
	const getArrowPath = decrease => decrease ? './images/Down Arrow.svg' : './images/Up Arrow.svg';
	const imgCircleRadius = data.widgetSize === 'large' ? 28 : (data.widgetSize === 'medium' ? 25 : 22);
	const paddingBetweenChangeTools = data.widgetSize === 'large' ? imgCircleRadius + 15 : (data.widgetSize === 'medium' ? imgCircleRadius + 10 : imgCircleRadius + 5);


	function getSystemOrHoveredData() {
		let kwh, cost, trh;
		let kwhPercent = { last: [], new: [] };
		let costPercent = { last: [], new: [] };
		let trhPercent = { last: [], new: [] };
		if (widget.equipmentHovered !== 'none') {

			const getHoveredEquipmentDataForDate = () => {
				const equipmentDataObject = widget.dataForDate.equipmentDataForDate.filter(equip => equip.type === widget.equipmentHovered)[0]
				
				//change appropriate measured data to predicted if predicted shown for date
				if (widget.predictedIsShownForDate) {
					//deep copy obj & its arrays of objs
					let predictedInformedEquipmentDataObject = {type: widget.equipmentHovered, utilityRate: [], kwh: []};
					predictedInformedEquipmentDataObject.utilityRate = equipmentDataObject.utilityRate.map(obj => Object.assign({}, obj));
					predictedInformedEquipmentDataObject.kwh = equipmentDataObject.kwh.map(obj => Object.assign({}, obj));

					predictedInformedEquipmentDataObject.utilityRate[2].cost = predictedInformedEquipmentDataObject.utilityRate[3].cost;
					predictedInformedEquipmentDataObject.utilityRate[2].accumulatedCost = predictedInformedEquipmentDataObject.utilityRate[3].accumulatedCost;
					predictedInformedEquipmentDataObject.kwh[2].value = predictedInformedEquipmentDataObject.kwh[3].value;
					predictedInformedEquipmentDataObject.kwh[2].accumulated = predictedInformedEquipmentDataObject.kwh[3].accumulated;
					
					predictedInformedEquipmentDataObject.utilityRate = predictedInformedEquipmentDataObject.utilityRate.slice(0,3);
					predictedInformedEquipmentDataObject.kwh = predictedInformedEquipmentDataObject.kwh.slice(0,3);
					return predictedInformedEquipmentDataObject;
				}
				return equipmentDataObject;
			}
			const hoveredEquipmentDataForDate =  getHoveredEquipmentDataForDate();


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
				imgPath: './images/Electricity Badge.svg',
				label: ' kWh'
			};
			cost = {
				category: 'cost',
				value: data.formatCurrency(Math.abs(hoveredEquipmentDataForDate.utilityRate[2].cost - hoveredEquipmentDataForDate.utilityRate[0].cost)),
				percent: JSON.parse(JSON.stringify(costPercent)),
				arrowPath: getArrowPath(hoveredEquipmentDataForDate.utilityRate[2].cost <= hoveredEquipmentDataForDate.utilityRate[0].cost),
				imgPath: './images/Monetary Badge.svg',
				label: data.currencySymbol
			};
		} else {


			// set percentage arrays
			//kwh
			let kwhNiceChangePercent = getNiceChangePercent(widget.dataForDate.categoryDataForDate[0].kwh, widget.dataForDate.categoryDataForDate[widget.predictedIsShownForDate ? 3 : 2].kwh)
			kwhPercent.new = kwhNiceChangePercent.toString().split('').map(digit => digit !== '<' ? +digit : digit);
			if (kwhPercent.new.length > 2) kwhPercent.new = kwhPercent.new[0] === '<' ? [2, 0, 1] : [1, 9, 9];
			if (kwhPercent.new.length === 1) kwhPercent.new.unshift(0, 0);
			if (kwhPercent.new.length === 2) kwhPercent.new.unshift(0);
			kwhPercent.last = widget.lastKwhPercent ? widget.lastKwhPercent.slice() : kwhPercent.new.slice();
			widget.lastKwhPercent = kwhPercent.new.slice();

			//cost
			let costNiceChangePercent = getNiceChangePercent(widget.dataForDate.categoryDataForDate[0].cost, widget.dataForDate.categoryDataForDate[widget.predictedIsShownForDate ? 3 : 2].cost)
			costPercent.new = costNiceChangePercent.toString().split('').map(digit => digit !== '<' ? +digit : digit);
			if (costPercent.new.length > 2) costPercent.new = costPercent.new[0] === '<' ? [2, 0, 1] : [1, 9, 9];
			if (costPercent.new.length === 1) costPercent.new.unshift(0, 0);
			if (costPercent.new.length === 2) costPercent.new.unshift(0);
			costPercent.last = widget.lastCostPercent ? widget.lastCostPercent.slice() : costPercent.new.slice();
			widget.lastCostPercent = costPercent.new.slice();



			//create objects to iterate over
			kwh = {
				category: 'kwh',
				value: Math.round(Math.abs(widget.dataForDate.categoryDataForDate[widget.predictedIsShownForDate ? 3 : 2].kwh - widget.dataForDate.categoryDataForDate[0].kwh)),
				percent: JSON.parse(JSON.stringify(kwhPercent)),
				arrowPath: getArrowPath(widget.dataForDate.categoryDataForDate[widget.predictedIsShownForDate ? 3 : 2].kwh <= widget.dataForDate.categoryDataForDate[0].kwh),
				imgPath: './images/Electricity Badge.svg',
				label: ' kWh'
			};
			cost = {
				category: 'cost',
				value: data.formatCurrency(Math.abs(widget.dataForDate.categoryDataForDate[widget.predictedIsShownForDate ? 3 : 2].cost - widget.dataForDate.categoryDataForDate[0].cost)),
				percent: JSON.parse(JSON.stringify(costPercent)),
				arrowPath: getArrowPath(widget.dataForDate.categoryDataForDate[widget.predictedIsShownForDate ? 3 : 2].cost <= widget.dataForDate.categoryDataForDate[0].cost),
				imgPath: './images/Monetary Badge.svg',
				label: data.currencySymbol
			};
		}
		// set percentage arrays
		//trh
		let trhNiceChangePercent = getNiceChangePercent(widget.dataForDate.categoryDataForDate[0].trh, widget.dataForDate.categoryDataForDate[widget.predictedIsShownForDate ? 3 : 2].trh);
		trhPercent.new = trhNiceChangePercent.toString().split('').map(digit => digit !== '<' ? +digit : digit);
		if (trhPercent.new.length > 2) trhPercent.new = trhPercent.new[0] === '<' ? [2, 0, 1] : [1, 9, 9];
		if (trhPercent.new.length === 1) trhPercent.new.unshift(0, 0);
		if (trhPercent.new.length === 2) trhPercent.new.unshift(0);
		trhPercent.last = widget.lastTrhPercent ? widget.lastTrhPercent.slice() : trhPercent.new.slice();
		widget.lastTrhPercent = trhPercent.new.slice();

		//create object to iterate over
		trh = {
			category: 'trh',
			value: Math.round(Math.abs(widget.dataForDate.categoryDataForDate[widget.predictedIsShownForDate ? 3 : 2].trh - widget.dataForDate.categoryDataForDate[0].trh)),
			percent: JSON.parse(JSON.stringify(trhPercent)),
			arrowPath: getArrowPath(widget.dataForDate.categoryDataForDate[widget.predictedIsShownForDate ? 3 : 2].trh <= widget.dataForDate.categoryDataForDate[0].trh),
			imgPath: './images/Production Badge.svg',
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

		// percentChangeText1
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

		// percentChangeText2
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














	//************************************* BUTTON ******************************************//
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
			.attr('cx', widget.activeChartType === 'grouped' ? rectRightX : rectLeftX);
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
			.attr('opacity', 1)
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
	const modalHeight = chartHeight * 0.8;
	const modalLabelsHeight = getTextHeight(data.dropdownFont);
	const modalInputWidth = dateDropdownWidth / 2;
	const halfOfDifferenceInSizeForPosGrowth = (((settingsBtnSize * 1.2) - (settingsBtnSize)) / 2)
	//settingsButton
	widget.svg.append('svg:image')
		.attr('xlink:href', ' data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNzkuOCAxOTQuMzgiPjx0aXRsZT5nZWFyU2V0dGluZ3M8L3RpdGxlPjxwYXRoIGQ9Ik0xNDIuODIsNzAuNjhWOTQuOWE2Ny4xLDY3LjEsMCwwLDAtMzAuNTQsMTcuNjRsLTIxLTEyLjEzYTcuOTEsNy45MSwwLDAsMC0xMC43NiwyLjg4bC05LjMzLDE2LjE3YTcuOSw3LjksMCwwLDAsMi44OCwxMC43NmwyMSwxMi4xM2E2Ny42MSw2Ny42MSwwLDAsMCwwLDM1LjIzTDc0LDE4OS43M2E3Ljg4LDcuODgsMCwwLDAtMi44OCwxMC43NWw5LjMzLDE2LjE3YTcuOTEsNy45MSwwLDAsMCwxMC43NiwyLjg5bDIxLjA3LTEyLjE3QTY3LjMsNjcuMywwLDAsMCwxNDIuNzYsMjI1djI0LjM0YTcuODksNy44OSwwLDAsMCw3Ljg3LDcuODhIMTY5LjNhNy44OSw3Ljg5LDAsMCwwLDcuODgtNy44N1YyMjVhNjcuMTMsNjcuMTMsMCwwLDAsMzAuNDctMTcuNTdsMjEuMDgsMTIuMThhNy45MSw3LjkxLDAsMCwwLDEwLjc2LTIuODhsOS4zMy0xNi4xN2E3LjksNy45LDAsMCwwLTIuODgtMTAuNzZsLTIxLTEyLjE1YTY3LjU3LDY3LjU3LDAsMCwwLDAtMzUuMjJsMjEtMTIuMTRhNy44OCw3Ljg4LDAsMCwwLDIuODgtMTAuNzVsLTkuMzMtMTYuMTdhNy45MSw3LjkxLDAsMCwwLTEwLjc2LTIuODlsLTIxLDEyLjEyYTY3LjIzLDY3LjIzLDAsMCwwLTMwLjUyLTE3LjY3VjcwLjY5YTcuODksNy44OSwwLDAsMC03Ljg3LTcuODhIMTUwLjdBNy44OSw3Ljg5LDAsMCwwLDE0Mi44Miw3MC42OFpNMjAxLDE1OS44OEE0MC44Nyw0MC44NywwLDEsMSwxNjAuMTcsMTE5LDQwLjg3LDQwLjg3LDAsMCwxLDIwMSwxNTkuODhaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNzAuMSAtNjIuODEpIiBmaWxsPSJzaWx2ZXIiLz48L3N2Zz4=')
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
					if (rerenderAfter) renderWidget();	// TODO: FOR NIAGARA VERSION: if (rerenderAfter) render(widget, true);
				})
	}

	function renderModal() {
		// make box of background color with slight opacity to blur background and then add modal on top
		//overlay
		widget.outerDiv.append('div')
			.attr('class', 'overlayDiv')
			.style('position', 'absolute')
			.style('top', '0px')
			.style('height', jqHeight + 'px')		//TODO: FOR NIAGARA VERSION CHANGE TO .style('height', data.jqHeight + 'px')
			.style('width', jqWidth + 'px')			//TODO: FOR NIAGARA VERSION CHANGE TO .style('width', data.jqWidth + 'px')
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
			const paddingRightOfCheckbox = 5;
			const checkboxSize = 17;
			widget.showPredictedInputSelection = widget.showPredicted;
			const rowOneLength = getTextWidth('Show Predicted Data', data.dropdownFont) + checkboxSize + paddingRightOfCheckbox; 
			form.append('input')
				.attr('class', 'formElement showPredictedInput')
				.attr('type', 'checkbox')
				.attr('name', 'showPredictedInput')
				.attr('id', 'showPredictedInput')
				.property('checked', () => widget.showPredicted)
				.style('left', ( (modalWidth / 2) - (rowOneLength / 2) ) + 'px')
				.style('top', ((verticalModalPadding * 2) + (getTextHeight(data.dropdownFont) / 3) ) + 'px')
				.style('position', 'absolute')
				.on('change', function() {
					widget.showPredictedInputSelection = d3.select(this).property('checked');
				});
			form.append('label')
				.attr('class', 'formElement')
				.attr('for', 'showPredictedInput')
				.text('Show Predicted Data')
				.style('color', data.dropdownTextColor)
				.style('font', data.dropdownFont)
				.style('left', ( ((modalWidth / 2) - (rowOneLength / 2)) + checkboxSize + paddingRightOfCheckbox) + 'px')	
				.style('top', (verticalModalPadding * 2) + 'px')
				.style('position', 'absolute');

			// ROW TWO
			form.append('h4')
				.attr('class', 'formElement')
				.text('Blended Utility Rate')
				.style('color', data.dropdownTextColor)
				.style('font', data.dropdownFont)
				.style('left', ( (modalWidth / 2) - ( getTextWidth('Blended Utility Rate', data.dropdownFont) / 2 ) ) + 'px')
				.style('top', (verticalModalPadding * 4.5) + 'px')
				.style('position', 'absolute');

			// ROW THREE
			form.append('h4')
					.text(data.currencySymbol)
					.style('font', data.dropdownFont)
					.style('color', data.dropdownTextColor)
					.style('left', (((modalWidth / 2) - ((modalInputWidth / 2) + 1.5) )  - 15) + 'px')
					.style('top', (verticalModalPadding * 5.25) + 'px')
					.style('position', 'absolute')
					.style('text-align', 'center');
			form.append('input')
				.attr('class', 'formElement blendedUtilityRateInput')
				.attr('type', 'text')
				.attr('name', 'blendedUtilityRateInput')
				.property('value', data.formatRateCurrency(widget.blendedUtilityRateSelection))
				.style('width', modalInputWidth + 'px')
				.style('border-radius', ((modalInputWidth / 2) * 0.3) + 'px')
				.style('font', data.dropdownFont)
				.style('color', data.dropdownTextColor)
				.style('border', `1.5px solid ${data.dropdownStrokeColor}`)
				.style('padding', '2px')
				.style('background-color', data.dropdownFillColor)
				.style('left', ((modalWidth / 2) - ((modalInputWidth / 2) + 1.5) ) + 'px')
				.style('top', ((verticalModalPadding * 5.25) + modalLabelsHeight) + 'px')
				.style('position', 'absolute')
				.style('text-align', 'center')
				.on('mouseover', function() {
					d3.select(this).style('border', `2.5px solid ${data.dropdownStrokeColor}`)
					.style('left', ((modalWidth / 2) - ((modalInputWidth / 2) + 2.5) ) + 'px')
					.style('top', (((verticalModalPadding * 5.25) + modalLabelsHeight) - 1) + 'px')
				})
				.on('mouseout', function() {
					d3.select(this).style('border', `1.5px solid ${data.dropdownStrokeColor}`)
					.style('left', ((modalWidth / 2) - ((modalInputWidth / 2) + 1.5) ) + 'px')
					.style('top', ((verticalModalPadding * 5.25) + modalLabelsHeight) + 'px')
				})
				.on('change', function() {
					widget.blendedUtilityRateSelection = +d3.select(this).property('value');
				});

			// ROW FOUR
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
				.style('top', ((verticalModalPadding * 6) + modalLabelsHeight + getTextHeight(data.dropdownFont) + 30) + 'px')
				.on('mouseover', function() {
					d3.select(this)
						.style('border', `1.5px solid ${data.hoveredFillColor}`)
						.style('width', getTextWidth('OK', data.dropdownFont) + 31.5 + 'px')
						.style('left', (((modalWidth / 2) - ((getTextWidth('OK', data.dropdownFont) + 30) / 2)) - 0.75) + 'px')
						.style('top', (((verticalModalPadding * 6) + modalLabelsHeight + getTextHeight(data.dropdownFont) + 30) - 0.75) + 'px')
					})
				.on('mouseout', function() {
					d3.select(this)
						.style('border', 'none')
						.style('width', getTextWidth('OK', data.dropdownFont) + 30 + 'px')
						.style('left', ((modalWidth / 2) - ((getTextWidth('OK', data.dropdownFont) + 30) / 2)) + 'px')
						.style('top', ((verticalModalPadding * 6) + modalLabelsHeight + getTextHeight(data.dropdownFont) + 30) + 'px')
				})


			widget.outerDiv.selectAll('.formElement').style('margin', '0px');
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
		if (widget.blendedUtilityRate === widget.blendedUtilityRateSelection && widget.showPredicted === widget.showPredictedInputSelection) {				
			toggleModal();
		} else {
			widget.blendedUtilityRate = widget.blendedUtilityRateSelection;
			widget.showPredicted = widget.showPredictedInputSelection;
			widget.predictedIsShownForDate = widget.dataForDate.categoryDataForDate[3] && widget.showPredicted ? true : false;
			toggleModal(true);
		}
	}






	//************************ DROPDOWNS *************************//
	const dropdownsGroup = widget.svg.append('g').attr('class', 'dropdownsGroup').attr('transform', `translate(${data.margin.left + paddingLeftOfTools},${data.margin.top})`)

	//Year Dropdown
	dropdownsGroup.append('text')
		.attr('dominant-baseline', 'hanging')
		.text('Year')
		.attr('x', 5)
		.attr('fill', data.toolTitleColor)
		.style('font', data.toolTitleFont);

	makeDropdown(data.availableYears, widget.dropdownYearChanged, dropdownsGroup, 0, getTextHeight(data.toolTitleFont) + paddingUnderDropdownTitles, true, dateDropdownWidth, 5, 0, data.dropdownStrokeColor, data.dropdownFillColor, data.hoveredFillColor, data.dropdownFont, data.dropdownTextColor, widget.yearDropdownSelected, () => {}, () => {}, [], dropdownBorderRadius)

	//Month Dropdown
	dropdownsGroup.append('text')
		.attr('dominant-baseline', 'hanging')
		.attr('x', dateDropdownWidth + paddingBetweenDropdowns + 10)
		.text('Month')
		.attr('fill', data.toolTitleColor)
		.style('font', data.toolTitleFont);

	makeDropdown(data.availableDates[widget.yearDropdownSelected], widget.dropdownMonthChanged, dropdownsGroup, dateDropdownWidth + paddingBetweenDropdowns, getTextHeight(data.toolTitleFont) + paddingUnderDropdownTitles, true, dateDropdownWidth, 5, 0, data.dropdownStrokeColor, data.dropdownFillColor, data.hoveredFillColor, data.dropdownFont, data.dropdownTextColor, widget.monthDropdownSelected, () => {}, () => {}, [], dropdownBorderRadius)






	//************************ UNHOVER & UNPIN FUNCTIONS *************************//
	function tryUnhover(d, i, nodes) {
		if ((widget.activeChartType === 'stacked' && !widget.systemIsPinned) || (widget.activeChartType === 'grouped' && widget.equipmentPinned === 'none')) {
			unhoverDynamic();
		}
		if (!widget.trhIsPinned) {
			unhoverTrh();
		}
	}
	function unhoverDynamic() {
		d3.event.stopPropagation()
		widget.equipmentHovered = 'none';
		widget.systemIsHovered = false;
		widget.svg.selectAll('.dynamicCategoryRects')
			.style('fill-opacity', 1)
			.style('stroke-opacity', 1);
		widget.svg.selectAll('.predictedOverallCategoryRect')
			.style('fill-opacity', 1)
			.style('stroke-opacity', 1);
		widget.svg.selectAll('.kwhYAxisTitle')
			.style('opacity', 1);
		widget.svg.selectAll('.costYAxisTitle')
			.style('opacity', 1);
		widget.resetElements('.costTooltip');
		widget.resetElements('.kwhTooltip');
		renderChangeTools();
	}
	function unhoverTrh() {
		widget.trhIsHovered = false;
		widget.svg.selectAll('.trhYAxisTitle')
			.style('opacity', 1);
		widget.resetElements('.trhTooltip');
	}
	function unhoverAll() {
		unhoverDynamic();
		unhoverTrh();
	}
	function unpin() {
		widget.equipmentPinned = 'none';
		widget.systemIsPinned = false;
		widget.trhIsPinned = false;
		unhoverAll();
	}

	//************************ DYNAMIC BAR HOVER/PIN FUNCTIONS *************************//
	function tryBarHoverFunc(d, i, nodes) {
		if (widget.activeChartType === 'stacked' || (widget.activeChartType === 'grouped' && widget.equipmentPinned === 'none')) {
			barHoverFunc(d, i, nodes);
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
				.style('fill-opacity', getBarFillOpacity)
				.style('stroke-opacity', getBarStrokeOpacity);
		}
		appendCostTooltip();
		appendKwhTooltip();
		kwhChart.selectAll('.kwhYAxisTitle')
			.style('opacity', 0);
		costChart.selectAll('.costYAxisTitle')
			.style('opacity', 0);
	}

	function barPinFunc(d, i, nodes) {
		if (widget.activeChartType === 'stacked') {
			widget.systemIsPinned = true;
		}
		if (widget.activeChartType === 'grouped') {
			widget.equipmentPinned = nodes[i].parentNode.__data__.type;
		}
		barHoverFunc(d, i, nodes);
	}
	/******************** LEGEND HOVERS/UNHOVERS ******************/
	function getBarStrokeOpacity(innerD, innerI, innerNodes) {
		const myCat = innerD.category;
		const myEq = innerNodes ? innerNodes[innerI].parentNode.__data__.type : 'stackedPredicted';
		if ( (widget.equipmentHovered === 'none' || widget.equipmentHovered === myEq) && (widget.legendHovered === 'none' || widget.legendHovered === myCat || (myCat === 'predicted' && widget.legendHovered === 'measured') ) ) {
			return 1;
		} else if (myCat === 'predicted') {
			return unhoveredOpacity;
		} else {
			return 0;
		}
	}

	function getBarFillOpacity(innerD, innerI, innerNodes) {
		const myCat = innerD.category
		const myEq = innerNodes ? innerNodes[innerI].parentNode.__data__.type : 'stackedPredicted';
		if ( ((widget.equipmentHovered === 'none' || widget.equipmentHovered === myEq) && (widget.legendHovered === 'none' || widget.legendHovered === myCat)) || myCat === 'predicted' ) {
			return 1;
		} else {
			return unhoveredOpacity;
		}
	}




	console.log('data: ', data);
	console.log('widget: ', widget);
};

renderWidget();