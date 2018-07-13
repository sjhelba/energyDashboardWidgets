define(['bajaux/Widget', 'bajaux/mixin/subscriberMixIn', 'nmodule/COREx/rc/d3/d3.min', 'baja!'], function (Widget, subscriberMixIn, d3, baja) {
	"use strict";

	////////// Hard Coded Defs //////////
	const getJSDateFromTimestamp = d3.timeParse('%d-%b-%y %I:%M:%S.%L %p UTC%Z');
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
				.attr('height', open ? dropdownHeight + 12: rowHeight + 12);
			dropdownRows.transition()
				.attr('transform', (d, i) => open ? `translate(0, ${rowHeight * (i + 1)})` : `translate(0,0)`);
		}
		return dropdownGroup;
	}
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
		for (let i = 0; i <= indexOfLastDigit; i++){
			if (!isNaN(font[i]) || font[i] === '.') num += font[i];
		}
		num = +num;
		return num * 1.33333333333;
	};
	const normalArcOpacity = 0.9;
	const theUnhoveredArcOpacity = 0.5;
	const formatIntoPercentage = d3.format('.0%');
	const percentageDescription = '% of System Run Hours Logged in Optimization Mode';
	const percentDescriptionRectOpacity = 0.8
	const moduleNamesForHistories = {CHs: 'Chillers', PCPs: 'Pcwps', SCPs: 'Scwps', TWPs: 'Twps', CTFs: 'Towers'};
	const arePrimitiveValsInObjsSame = (obj1, obj2) => !Object.keys(obj1).some(key => (obj1[key] === null || (typeof obj1[key] !== 'object' && typeof obj1[key] !== 'function')) && obj1[key] !== obj2[key])
	const needToRedrawWidget = (widget, newData) => {
		const lastData = widget.data;
		// check primitives for equivalence
		if (!arePrimitiveValsInObjsSame(lastData, newData)) return true;
		// check nested modulesData arr for equivalence
		if (lastData.modulesArray.length !== newData.modulesArray.length) return true;
		const isDiscrepency = lastData.modulesArray.some((obj, objIndex) => !arePrimitiveValsInObjsSame(obj, newData.modulesArray[objIndex]));
		if (isDiscrepency) return true;
		//return false if nothing prompted true
		return false;
	};


	////////////////////////////////////////////////////////////////
	// Define Widget Constructor & Exposed Properties
	////////////////////////////////////////////////////////////////

	var CxOptimizationHoursLog = function () {
		var that = this;
		Widget.apply(this, arguments);

		that.properties().addAll([
			{
				name: 'backgroundColor',
				value: 'rgb(245,245,245)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'standardColor',
				value: 'rgb(66,88,103)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'optimizedColor',
				value: 'rgb(105,202,210)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'includeChillers',
				value: true,
			},
			{
				name: 'IncludePcwps',
				value: true,
			},
			{
				name: 'IncludeScwps',
				value: true,
			},
			{
				name: 'IncludeTwps',
				value: true,
			},
			{
				name: 'IncludeTowers',
				value: false,
			},
			{
				name: 'color_CHs',
				value: 'rgb(9,105,130)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'color_PCPs',
				value: 'rgb(95,218,239)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'color_SCPs',
				value: 'rgb(69,178,157)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'color_TWPs',
				value: 'rgb(252,163,36)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'color_CTFs',
				value: 'rgb(213,61,59)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'overallArcThickness',
				value: 40
			},
			{
				name: 'percentageFont',
				value: '38.0pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'percentageColor',
				value: 'black',
				typeSpec: 'gx:Color'
			},
			{
				name: 'legendFont',
				value: '12.0pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'tooltipHeaderFont',
				value: '16pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'tooltipFont',
				value: '10pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'tooltipPadding',
				value: 20
			},
			{
				name: 'tooltipVerticalTextPadding',
				value: 20
			},
			{
				name: 'tooltipHorizontalTextPadding',
				value: 5
			},
			{
				name: 'extraPaddingUnderTooltipHeader',
				value: 3
			},
			{
				name: 'paddingBetweenOverallAndModuleArcs',
				value: 7
			},
			{
				name: 'paddingBetweenOverallArcs',
				value: 0.08
			},
			{
				name: 'moduleArcThickness',
				value: 10
			},
			{
				name: 'percentDescriptionFont',
				value: '9.0pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'paddingBetweenPercentAndMiddle',
				value: 0
			},
			{
				name: 'paddingBetweenPercentDescriptionAndMiddle',
				value: 40
			},
			{
				name: 'tooltipFillColor',
				value: 'rgb(255,255,255)',
				typeSpec: 'gx:Color'
			},
			{
				name: 'paddingAboveLegendBars',
				value: 25
			},
			{
				name: 'paddingUnderLegendText',
				value: 5
			},
			{
				name: 'modulePercentFont',
				value: '26.0pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'extraPaddingAboveModulePercent',
				value: 30
			},
			{
				name: 'percentDescriptionRectHeight',
				value: 35
			},
			//for dropdowns
			{
				name: 'dropdownFillColor',
				value: 'white',
				typeSpec: 'gx:Color'
			},
			{
				name: 'hoveredFillColor',
				value: '#d5d6d4',
				typeSpec: 'gx:Color'
			},
			{
				name: 'dropdownLabelColor',
				value: '#333333',
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
				name: 'dropdownLabelFont',
				value: 'bold 11pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'dropdownFont',
				value: '11pt Nirmala UI',
				typeSpec: 'gx:Font'
			},
			{
				name: 'paddingLeftOfDropdowns',
				value: 5
			},
			{
				name: 'paddingUnderDropdownLabels',
				value: 8
			},
			{
				name: 'dateDropdownWidth',
				value: 100
			},
			{
				name: 'dropdownBorderRadius',
				value: 5
			},
			{
				name: 'paddingBetweenDropdowns',
				value: 25
			},
			{
				name: 'paddingUnderDropdowns',
				value: 15
			}
		]);



		subscriberMixIn(that);
	};

	CxOptimizationHoursLog.prototype = Object.create(Widget.prototype);
	CxOptimizationHoursLog.prototype.constructor = CxOptimizationHoursLog;



	////////////////////////////////////////////////////////////////
	// /* SETUP DEFINITIONS AND DATA */
	////////////////////////////////////////////////////////////////


	const setupDefinitions = widget => {
		// FROM USER // 
		const data = widget.properties().toValueMap();	//obj with all exposed properties as key/value pairs

		// FROM JQ //
		const jq = widget.jq();
		data.jqWidth = jq.width() || 350;
		data.jqHeight = jq.height() || 400;


		//sizing
		data.margin = { top: 5, left: 5, right: 5, bottom: 5};
		data.dropdownGroupHeight = data.margin.top + getTextHeight(data.dropdownLabelFont) + data.paddingUnderDropdownLabels + getTextHeight(data.dropdownFont) + data.paddingUnderDropdowns;
		data.graphicHeight = data.jqHeight - (data.dropdownGroupHeight + data.margin.top);
		data.graphicWidth = data.jqWidth - (data.margin.left + data.margin.right);


		// GLOBALS PER INSTANCE
		if (!widget.hovered) widget.hovered = { optimized: false, standard: false, current: 'neither' };
		if (!widget.activeModule) widget.activeModule = 'none';
		if (!widget.percentIsHovered) widget.percentIsHovered = false;

		if (!widget.legendPinned) widget.legendPinned = 'none';
		if (!widget.overallPinned) widget.overallPinned = 'none';




		// Calculated data without histories
			// calculated without Histories
			data.percentDescriptionRectWidth = getTextWidth(percentageDescription, data.percentDescriptionFont) + 5;
			data.maxTooltipTextWidths = {
				type: getTextWidth('TWPs:', 'bold ' + data.tooltipFont),
				hours: getTextWidth('5,555.0 HRS', data.tooltipFont),
				percent: getTextWidth('55%', data.tooltipFont)
			};
			data.totalTooltipTextWidth = data.maxTooltipTextWidths.type + data.maxTooltipTextWidths.hours + data.maxTooltipTextWidths.percent + (data.tooltipHorizontalTextPadding * 2);

			const maxChartHeight = data.graphicHeight - (data.margin.top + data.margin.bottom + data.paddingAboveLegendBars + data.paddingUnderLegendText + data.moduleArcThickness)
			const maxChartWidth = data.graphicWidth - (data.margin.left + data.margin.right);
			data.hoveredOuterRadius = maxChartHeight < maxChartWidth ? maxChartHeight / 2 : maxChartWidth / 2;
			data.moduleOuterRadius = data.hoveredOuterRadius - data.moduleArcThickness;
			data.moduleInnerRadius = data.moduleOuterRadius - data.moduleArcThickness;
			data.overallOuterRadius = data.moduleInnerRadius - data.paddingBetweenOverallAndModuleArcs;
			data.overallInnerRadius = data.overallOuterRadius - data.overallArcThickness;
			data.tooltipDiameter = (data.overallInnerRadius * 2) - data.tooltipPadding || 180;







		/*** DATA TO POPULATE ***/
		const hrsDataTemplate = {
			optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined
		};
		data.availableDates = {}; /*
    e.g.: {
      2016: ['Oct', 'Nov', 'Dec'],
      2017: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      2018: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    }
    */
		data.annualModulesData = {};/*
		e.g.: {
		 	2016: {
				CHs: {optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined},
				PCPs: {optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined}
		 	},
		 	2017: {
				CHs: {optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined},
				PCPs: {optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined}
		 	}
	 	}
	 */
		data.monthlyModulesData = {};  /*
		 e.g.: {
			2016: {
				Nov: {
					CHs: {optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined},
					PCPs: {optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined}
				},
				Dec: {
					CHs: {optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined},
					PCPs: {optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined}
				}
			},
			2017: {
				Jan: {
					CHs: {optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined},
					PCPs: {optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined}
				}
			}
    }
    */

		data.modulesArray = [
			//Chillers
			{
				type: 'CHs',
			},
			//Primary Pumps
			{
				type: 'PCPs'
			},
			//Secondary Pumps
			{
				type: 'SCPs'
			},
			//Condenser Pumps
			{
				type: 'TWPs'
			},
			//Chiller Towers
			{
				type: 'CTFs'
			}
		];
		// filter out modulesArray eqGroups that are marked false in exposed properties
		data.modulesArray.filter(eqGroup => data[`include${eqGroup.type}`]);

		function getEqTypeFromHistoryIndex(index) {
			// if index is odd number, subtract one (because 2 historyOrds per eq type)
			if (index % 2) index--;
			return data.modulesArray[index].type;
		}

		const optHrsHistoriesToResolve = [];
		const stdHrsHistoriesToResolve = [];

		data.modulesArray.forEach(eqGroup => {
			const historyNameForEqType = moduleNamesForHistories[eqGroup.type];
			optHrsHistoriesToResolve.push(`history:^${historyNameForEqType}_OptHrsHm`);
			optHrsHistoriesToResolve.push(`history:^${historyNameForEqType}_OptHrsCm`);
			stdHrsHistoriesToResolve.push(`history:^${historyNameForEqType}_StdHrsHm`)
			stdHrsHistoriesToResolve.push(`history:^${historyNameForEqType}_StdHrsCm`)
		})

		function iterateThrough(table, type, optimized) {
			return table.cursor({
				limit: 70000,
				each: function(row, idx) {
					const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
					const rowMonthIndex = timestamp.getMonth();
					const rowMonth = months[rowMonthIndex];
					const rowYear = timestamp.getFullYear();
					const rowValue = +row.get('value');
					if (!data.availableDates[rowYear]) {
						data.availableDates[rowYear] = [];
						data.monthlyModulesData[rowYear] = {};
						data.annualModulesData[rowYear] = {};
					}
					if (!data.availableDates[rowYear].includes(rowMonth)) {
						data.availableDates[rowYear].push(rowMonth);
						data.monthlyModulesData[rowYear][rowMonth] = {};
					}
					if (!data.monthlyModulesData[rowYear][rowMonth].includes(type)) {
						data.monthlyModulesData[rowYear][rowMonth][type] = Object.assign({}, hrsDataTemplate);
					}
					if (!data.annualModulesData[rowYear].includes(type)) {
						data.annualModulesData[rowYear][type] = Object.assign({}, hrsDataTemplate);
					}
					data.monthlyModulesData[rowYear][rowMonth][type][optimized ? 'optimizedHours' : 'standardHours'] += rowValue;
					data.annualModulesData[rowYear][type][optimized ? 'optimizedHours' : 'standardHours'] += rowValue;
					data.monthlyModulesData[rowYear][rowMonth][type].totalHours += rowValue;
					data.annualModulesData[rowYear][type].totalHours += rowValue;
				}
			})
		}

		var optBatchResolve = new baja.BatchResolve(optHrsHistoriesToResolve);
		var stdBatchResolve = new baja.BatchResolve(stdHrsHistoriesToResolve);

		return Promise.all([optBatchResolve.resolve(), stdBatchResolve.resolve()])
		.then(() => {
			const cursorPromises = [];

			const optHistoryTables = optBatchResolve.getTargetObjects();
			const stdHistoryTables = stdBatchResolve.getTargetObjects();

			optHistoryTables.forEach((table, idx) => cursorPromises.push(iterateThrough(table, getEqTypeFromHistoryIndex(idx), true)));
			stdHistoryTables.forEach((table, idx) => cursorPromises.push(iterateThrough(table, getEqTypeFromHistoryIndex(idx), false)));

			Promise.all(cursorPromises);
		})
		.catch(err => console.error('OHL ERROR History resolves or cursors failed: ' + err))
		.then(() => {
			

			//set overallData
			data.annualOverallData = {}; /*
			e.g.: {
				 2016: {optimizedHours: 0, standardHours: 0, percent: undefined},
				 2017: {optimizedHours: 0, standardHours: 0, percent: undefined}
			 }
		 */
			data.monthlyOverallData = {}; /*
			e.g.: {
				2016: {
					Nov: {optimizedHours: 0, standardHours: 0, percent: undefined},
					Dec: {optimizedHours: 0, standardHours: 0, percent: undefined}
				},
				2017: {
					Jan: {optimizedHours: 0, standardHours: 0, percent: undefined},
				}
			}
			*/
			data.availableYears = Object.keys(data.availableDates).sort((a, b) => b - a);

		 	data.availableYears.forEach(year => {
				data.annualOverallData[year] = {optimizedHours: 0, standardHours: 0, percent: 0};
				data.monthlyOverallData[year] = {};
				const availableMonths = Object.keys(data.monthlyModulesData[year]);
				const annualEqTypes = Object.keys(data.annualModulesData[year]);
				const minTotalAnnualHours = annualEqTypes.reduce((accum, curr) => !accum || (accum && curr.totalHours < accum) ? curr.totalHours : accum, 0);

				annualEqTypes.forEach(eqType => {
					const annualModuleHours = data.annualModulesData[year][eqType];
					//set normalized hours for annual module data
					const normalizedTotal = annualModuleHours.totalHours / minTotalAnnualHours;
					annualModuleHours.normalizedOptimizedHours = annualModuleHours.optimizedHours / normalizedTotal;
					annualModuleHours.normalizedStandardHours = annualModuleHours.standardHours / normalizedTotal;
					//add to annual overall hours
					data.annualOverallData[year].optimizedHours += annualModuleHours.normalizedOptimizedHours;
					data.annualOverallData[year].standardHours += annualModuleHours.normalizedStandardHours;
					data.annualOverallData[year].percent += formatIntoPercentage(annualModuleHours.normalizedOptimizedHours / (annualModuleHours.normalizedOptimizedHours + annualModuleHours.normalizedStandardHours));
				});

				availableMonths.forEach(month => {
					data.monthlyOverallData[year][month] = {optimizedHours: 0, standardHours: 0, percent: 0};
					const availableEqTypes = Object.keys(data.monthlyModulesData[year][month]);
					const minTotalMonthlyHours = availableEqTypes.reduce((accum, curr) => !accum || (accum && curr.totalHours < accum) ? curr.totalHours : accum, 0);

					availableEqTypes.forEach(eqType => {
						const monthlyModuleHours = data.monthlyModulesData[year][month][eqType];
						//set normalized hours for monthly module data
						const normalizedTotal = monthlyModuleHours.totalHours / minTotalMonthlyHours;
						monthlyModuleHours.normalizedOptimizedHours = monthlyModuleHours.optimizedHours / normalizedTotal;
						monthlyModuleHours.normalizedStandardHours = monthlyModuleHours.standardHours / normalizedTotal;
						//add to monthly overall hours
						data.monthlyOverallData[year][month].optimizedHours += monthlyModuleHours.normalizedOptimizedHours;
						data.monthlyOverallData[year][month].standardHours += monthlyModuleHours.normalizedStandardHours;
						data.monthlyOverallData[year][month].percent += formatIntoPercentage(monthlyModuleHours.normalizedOptimizedHours / (monthlyModuleHours.normalizedOptimizedHours + monthlyModuleHours.normalizedStandardHours));
					});

				});
			});

			// add 'All' to available months for year, and calculate more sizing given new data
			data.availableYears.forEach(year => {
				data.availableDates[year].unshift('All');
			});
			data.legendWidth = data.jqWidth - ((data.margin.left * 4) + (data.margin.right * 4));
			data.legendColorRectsWidth = data.legendWidth / data.modulesArray.length;



			// CALCULATED GLOBAL VARS PER INSTANCE
			if (!widget.yearSelected) widget.yearSelected = data.availableYears[0];
			if (!widget.monthSelected) widget.monthSelected = 'All';

			if (!widget.createArrayOfModuleDataForSelectedDate) widget.createArrayOfModuleDataForSelectedDate = function () {
				const modulesDataArray = [];
				if (widget.monthSelected === 'All') {
					const availableModulesForYear = Object.keys(data.annualModulesData[widget.yearSelected]);
					availableModulesForYear.forEach(eqType => {
						const moduleObj = Object.assign({}, data.annualModulesData[widget.yearSelected][eqType]);
						moduleObj.type = eqType;
						moduleObj.color = data['color_' + eqType];
						modulesDataArray.push();
					});
				} else {
					const availableModulesForMonth = Object.keys(data.monthlyModulesData[widget.yearSelected][widget.monthSelected]);
					availableModulesForMonth.forEach(eqType => {
						const moduleObj = Object.assign({}, data.monthlyModulesData[widget.yearSelected][widget.monthSelected][eqType]);
						moduleObj.type = eqType;
						moduleObj.color = data['color_' + eqType];
						modulesDataArray.push();
					});
				}
				return modulesDataArray;
			}
			if (!widget.createArrayOfOverallDataForSelectedDate) widget.createArrayOfModuleDataForSelectedDate = function () {
				const overallDataArray = [{ category: 'standard', hours: 0 }, { category: 'optimized', hours: 0 }];
				if (widget.monthSelected === 'All') {
					overallDataArray[0].hours = data.annualOverallData[widget.yearSelected].standardHours;
					overallDataArray[1].hours = data.annualOverallData[widget.yearSelected].optimizedHours;
				} else {
					overallDataArray[0].hours = data.monthlyOverallData[widget.yearSelected][widget.monthSelected].standardHours;
					overallDataArray[1].hours = data.monthlyOverallData[widget.yearSelected][widget.monthSelected].optimizedHours;
				}
				return overallDataArray;
			}

			if (!widget.selectedDateModuleData) widget.selectedDateModuleData = widget.createArrayOfModuleDataForSelectedDate();
			if (!widget.selectedDateOverallData) widget.selectedDateOverallData = widget.createArrayOfOverallDataForSelectedDate();

			if (!widget.updateDateWidgetRendering) widget.updateDateWidgetRendering = () => {
				render(widget, true);
			}
			if (!widget.dropdownYearChanged) widget.dropdownYearChanged = val => {
				widget.yearSelected = val;
				widget.monthSelected = data.availableDates[widget.yearSelected].includes(widget.monthSelected) ? widget.monthSelected : 'All';
				widget.selectedDateModuleData = widget.createArrayOfModuleDataForSelectedDate();
				widget.selectedDateOverallData = widget.createArrayOfOverallDataForSelectedDate();
				widget.updateDateWidgetRendering();
			};
			if (!widget.dropdownMonthChanged) widget.dropdownMonthChanged = val => {
				widget.monthSelected = val;
				widget.selectedDateModuleData = widget.createArrayOfModuleDataForSelectedDate();
				widget.selectedDateOverallData = widget.createArrayOfOverallDataForSelectedDate();
				widget.updateDateWidgetRendering();
			};



			return data;

		})
		.catch(err => console.error('Error (history info promise rejected): ' + err));
	};




	////////////////////////////////////////////////////////////////
	// Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
	////////////////////////////////////////////////////////////////

	const renderWidget = (widget, data) => {
		/* RENDER INITIALIZATION */

		d3.select(widget.svg.node().parentNode)
			.style('background-color', data.backgroundColor)
			.on('mousedown', function(){
				resetLegendPins();
				resetOverallPins();
			})

		// delete leftover elements from versions previously rendered
		if (!widget.svg.empty()) widget.svg.selectAll('*').remove();

		const graphicGroup = widget.svg.append('g')
			.attr('class', 'graphicGroup')
			.attr('transform', `translate(0,${data.dropdownGroupHeight})`);


		/************************************************* ADD ALL SVG ELEMENTS HERE **********************************************************/

		/*** ARCS ***/

		const allDonutGroupsGroup = graphicGroup.append('g')
			.attr('class', 'allDonutGroupsGroup')
			.attr('transform', `translate(${(data.graphicWidth - (data.margin.left + data.margin.right)) / 2}, ${data.hoveredOuterRadius})`)


		//overall arcs
		//group
		const overallDonutGroup = allDonutGroupsGroup.append('g')
			.attr('class', 'overallDonutGroup');

		// generators
		const overallArcsDataGenerator = d3.pie()
			.value(d => d.hours)
			.sort(() => -1) // keep in order regardless of values
			.padAngle(data.paddingBetweenOverallArcs)
		const overallArcPathGenerator = d3.arc()
			.innerRadius(data.overallInnerRadius)
			.outerRadius(data.overallOuterRadius);


		//paths
		const overallArcPaths = overallDonutGroup.selectAll('.overallPath')
			.data(overallArcsDataGenerator(widget.selectedDateOverallData))
			.enter().append('path')
				.attr('d', overallArcPathGenerator)
				.attr('class', (d, i) => widget.selectedDateOverallData[i].category === 'standard' ? 'standardArcPath overallPath standardPath' : 'optimizedArcPath overallPath optimizedPath')
				.attr('fill', (d, i) => widget.selectedDateOverallData[i].category === 'optimized' ? data.optimizedColor : data.standardColor)
				.style('fill-opacity', (d, i) => widget.hovered[widget.selectedDateOverallData[i].category] ? 1 : normalArcOpacity);


		// get start and end angles of overall arc paths
		const angles = { optimized: { start: 0, end: 0 }, standard: { start: 0, end: 0 } };
		overallArcPaths.filter((d, i) => {
			angles[widget.selectedDateOverallData[i].category].start = d.startAngle;
			angles[widget.selectedDateOverallData[i].category].end = d.endAngle;
		})



		// module arcs
		const moduleArcPathGenerator = d3.arc()
			.innerRadius(data.moduleInnerRadius)
			.outerRadius(data.moduleOuterRadius);

		const hoveredModuleArcPathGenerator = d3.arc()
			.innerRadius(data.moduleInnerRadius)
			.outerRadius(data.hoveredOuterRadius);

			// func determines whether individual module is hovered and calls corresponding path generator for module arc paths accordingly 
		const determinePathGenerator = lineData => widget.activeModule === widget.selectedDateModuleData[lineData.index].type ? hoveredModuleArcPathGenerator(lineData) : moduleArcPathGenerator(lineData)


		//standard module arcs
		//group
		const standardDonutGroup = allDonutGroupsGroup.append('g')
			.attr('class', 'standardDonutGroup')

		// generator
		const standardArcsDataGenerator = d3.pie()
			.value(d => d.normalizedStandardHours)
			.sort(() => -1)	// keep in order regardless of values
			.startAngle(angles.standard.start + (data.paddingBetweenOverallArcs / 2))
			.endAngle(angles.standard.end - (data.paddingBetweenOverallArcs / 2));


		//standard module arc paths
		standardDonutGroup.selectAll('.standardPath')
			.data(standardArcsDataGenerator(widget.selectedDateModuleData))
			.enter().append('path')
			.attr('d', widget.hovered.standard ? hoveredModuleArcPathGenerator : determinePathGenerator)
			.attr('class', (d, i) => `${widget.selectedDateModuleData[i].type}ArcPath modulePath standardModulePath standardPath`)
			.attr('fill', (d, i) => widget.selectedDateModuleData[i].color)
			.style('fill-opacity', (d, i) => {
				if (widget.hovered.standard || widget.activeModule === widget.selectedDateModuleData[i].type) return 1;
				if (widget.activeModule === 'none' && widget.hovered.current === 'neither') return normalArcOpacity;
				return theUnhoveredArcOpacity;
			});




		//optimized module arcs
		//group
		const optimizedDonutGroup = allDonutGroupsGroup.append('g')
			.attr('class', 'optimizedDonutGroup')

		// generator
		const optimizedArcsDataGenerator = d3.pie()
			.value(d => d.normalizedOptimizedHours)
			.sort(() => -1) // keep in order regardless of values
			.startAngle(angles.optimized.start + (data.paddingBetweenOverallArcs / 2))
			.endAngle(angles.optimized.end - (data.paddingBetweenOverallArcs / 2));


		//optimized module arc paths
		optimizedDonutGroup.selectAll('.optimizedPath')
			.data(optimizedArcsDataGenerator(widget.selectedDateModuleData))
			.enter().append('path')
			.attr('d', widget.hovered.optimized ? hoveredModuleArcPathGenerator : determinePathGenerator)
			.attr('class', (d, i) => `${widget.selectedDateModuleData[i].type}ArcPath modulePath optimizedModulePath optimizedPath`)
			.attr('fill', (d, i) => widget.selectedDateModuleData[i].color)
			.style('fill-opacity', (d, i) => {
				if (widget.hovered.optimized || widget.activeModule === widget.selectedDateModuleData[i].type) return 1;
				if (widget.activeModule === 'none' && widget.hovered.current === 'neither') return normalArcOpacity;
				return theUnhoveredArcOpacity;
			});

		// hoverable invisible arcs
		//generators
		const hoverableStandardArcPathGenerator = d3.arc()
			.innerRadius(data.overallInnerRadius)
			.outerRadius(data.hoveredOuterRadius)
			.startAngle(angles.standard.start)
			.endAngle(angles.standard.end)

		const hoverableOptimizedArcPathGenerator = d3.arc()
			.innerRadius(data.overallInnerRadius)
			.outerRadius(data.hoveredOuterRadius)
			.startAngle(angles.optimized.start)
			.endAngle(angles.optimized.end)

		//paths
		const standardPathsHoverArc = allDonutGroupsGroup.append('path')
			.attr('d', hoverableStandardArcPathGenerator)
			.style('opacity', '0')
		const optimizedPathsHoverArc = allDonutGroupsGroup.append('path')
			.attr('d', hoverableOptimizedArcPathGenerator)
			.style('opacity', '0')








		/*** PERCENT ***/

		//percentage
		allDonutGroupsGroup.append('text')
			.attr('class', 'percentage')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('y', -data.paddingBetweenPercentAndMiddle)
			.style('font', data.percentageFont)
			.attr('fill', data.percentageColor)
			.style('opacity', widget.hovered.current === 'neither' && widget.activeModule === 'none' ? 1 : 0)
			.text(data.percent);

		//percentage description
		function renderPercentageDescription() {
			const selectionForCheck = widget.svg.selectAll('.percentageDescription')
			if (!selectionForCheck.empty()) selectionForCheck.remove();

			if (widget.percentIsHovered) {
				allDonutGroupsGroup.append('rect')
					.attr('class', 'percentageDescription')
					.attr('x', -(data.percentDescriptionRectWidth / 2))
					.attr('y', data.paddingBetweenPercentDescriptionAndMiddle - (data.percentDescriptionRectHeight / 2))
					.attr('height', data.percentDescriptionRectHeight)
					.attr('width', data.percentDescriptionRectWidth)
					.attr('fill', data.tooltipFillColor)
					.attr('rx', '10px')
					.attr('ry', '10px')
					.style('opacity', percentDescriptionRectOpacity)
					.attr('pointer-events', 'none')


				allDonutGroupsGroup.append('text')
					.attr('class', 'percentageDescription')
					.style('font', data.percentDescriptionFont)
					.attr('text-anchor', 'middle')
					.attr('dominant-baseline', 'middle')
					.attr('y', data.paddingBetweenPercentDescriptionAndMiddle)
					.style('opacity', 1)
					.style('cursor', 'default')
					.text(percentageDescription)
					.attr('pointer-events', 'none')

			}
		}
		renderPercentageDescription();








		/*** TOOLTIPS AND ARC HOVERS ***/

		function renderTooltip(moduleObj) {    // moduleObj passed in if an individual module is active

			const selectionForCheck = widget.svg.select('.tooltipGroup')
			if (!selectionForCheck.empty()) selectionForCheck.remove();

			const tooltipGroup = allDonutGroupsGroup.append('g')
				.attr('class', 'tooltipGroup')
				.style('opacity', widget.hovered.current !== 'neither' || widget.activeModule !== 'none' ? 1 : 0)

			//tooltip circle
			tooltipGroup.append('circle')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', data.tooltipDiameter / 2)
				.attr('fill', data.tooltipFillColor)


			const tooltipTextGroup = tooltipGroup.append('g')
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.attr('x', 0)
				.attr('y', 0)
				.style('font', data.tooltipFont)
				.attr('transform', `translate(0, -${data.tooltipDiameter / 4})`);


			//text
			//header
			tooltipTextGroup.append('text')
				.attr('class', 'category')
				.text(moduleObj ? `${moduleObj.type}:` : `${widget.hovered.current.toUpperCase()}:`)
				.attr('fill', () => {
					if (moduleObj) return moduleObj.color;
					return widget.hovered.optimized ? data.optimizedColor : data.standardColor;
				})
				.style('font', data.tooltipHeaderFont)
				.style('font-weight', 'bold')
				.style('text-decoration', 'underline');



			if (!moduleObj) {
				const tooltipModuleGroups = tooltipTextGroup.selectAll('g')
					.data(widget.selectedDateModuleData)
					.enter().append('g')
					.attr('text-anchor', 'start')
					.attr('class', d => `${d.type}TooltipTextGroup`)
					.attr('transform', `translate(-${data.totalTooltipTextWidth / 2}, 0)`);

				//typeTexts
				tooltipModuleGroups.append('text')
					.attr('class', '.data .type')
					.text(d => `${d.type}:`)
					.attr('y', (d, i) => data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * (i + 1)))
					.style('font-weight', 'bold')

				//hoursTexts
				tooltipModuleGroups.append('text')
					.attr('class', '.data .hours')
					.text(d => `${d3.format(`,.1f`)(d[`${widget.hovered.current}Hours`])} HRS`)
					.attr('x', data.tooltipHorizontalTextPadding + data.maxTooltipTextWidths.type)
					.attr('y', (d, i) => data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * (i + 1)))


				//percentageTexts
				tooltipModuleGroups.append('text')
					.attr('class', '.data .percents')
					.text(d => formatIntoPercentage(d[`${widget.hovered.current}Hours`] / (d.standardHours + d.optimizedHours)))
					.attr('x', (data.tooltipHorizontalTextPadding * 2) + data.maxTooltipTextWidths.type + data.maxTooltipTextWidths.hours)
					.attr('y', (d, i) => data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * (i + 1)))
			} else {
				//for individual modules' tooltips
				//
				tooltipTextGroup.append('text')
					.attr('text-anchor', 'middle')
					.attr('x', 0)
					.text(`${d3.format(`,.1f`)(moduleObj.optimizedHours)} OPTIMIZED HRS`)
					.attr('y', data.extraPaddingUnderTooltipHeader + data.tooltipVerticalTextPadding)

				tooltipTextGroup.append('text')
					.attr('text-anchor', 'middle')
					.attr('x', 0)
					.text(`${d3.format(`,.1f`)(moduleObj.standardHours)} STANDARD HRS`)
					.attr('y', data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * 2))

				tooltipTextGroup.append('text')
					.text(formatIntoPercentage(moduleObj.optimizedHours / (moduleObj.standardHours + moduleObj.optimizedHours)))
					.attr('x', 0)
					.attr('text-anchor', 'middle')
					.style('font', data.modulePercentFont)
					.attr('y', data.extraPaddingUnderTooltipHeader + (data.tooltipVerticalTextPadding * 3) + data.extraPaddingAboveModulePercent)

			}
			//overarching circle for percent description tooltip event listening 
			tooltipGroup.append('circle')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', data.tooltipDiameter / 2)
				.attr('opacity', 0)
				.on('mouseenter', function () {
					if (widget.legendPinned === 'none' && widget.overallPinned === 'none'){
						widget.percentIsHovered = true;
						renderPercentageDescription();
					}
				})
				.on('mouseleave', function () {
					widget.percentIsHovered = false;
					widget.svg.selectAll('.percentageDescription').remove();
				})


		}


		// events
		const optimizedPaths = widget.svg.selectAll('.optimizedPath')
		const standardPaths = widget.svg.selectAll('.standardPath')

		optimizedPathsHoverArc
			.on('mouseenter', function () {
				attemptOverallTooltipOpen('optimized');
			})
			.on('mouseleave', function () {
				attemptOverallTooltipClose('optimized');
			})
			.on('mousedown', function() {
				d3.event.stopPropagation();
			})
			.on('click', function() {
				toggleOverallTooltipPin('optimized');
			});
		standardPathsHoverArc
			.on('mouseenter', function () {
				attemptOverallTooltipOpen('standard');
			})
			.on('mouseleave', function () {
				attemptOverallTooltipClose('standard');
			})
			.on('mousedown', function() {
				d3.event.stopPropagation();
			})
			.on('click', function() {
				toggleOverallTooltipPin('standard');
			});









		/*** LEGEND ***/

		const legendGroup = widget.svg.append('g').attr('transform', `translate(${data.margin.left * 4}, ${data.margin.top + (data.hoveredOuterRadius * 2) + data.paddingAboveLegendBars + data.dropdownGroupHeight})`);

		const legendModuleGroups = legendGroup.selectAll('.legendModuleGroup')
			.data(widget.selectedDateModuleData)
			.enter().append('g')
			.attr('class', d => `legendModuleGroup .${d.type}LegendModuleGroup`)
			.attr('transform', (d, i) => `translate(${i * data.legendColorRectsWidth}, 0)`)
			.on('mouseenter', function (d) {
				attemptLegendTooltipOpen(d, d3.select(this));
			})
			.on('mouseleave', function (d) {
				attemptLegendTooltipClose(d);
			})
			.on('mousedown', function () {
				d3.event.stopPropagation();
			})
			.on('click', function (d) {
				toggleLegendTooltipPin(d, d3.select(this));
			})

		const legendRects = legendModuleGroups.append('rect')
			.attr('height', data.moduleArcThickness)
			.attr('width', data.legendColorRectsWidth)
			.attr('y', data.paddingUnderLegendText)
			.attr('fill', d => d.color)
			.attr('stroke', 'black')
			.style('stroke-opacity', d => widget.activeModule === d.type ? '1' : '0')

		const legendTexts = legendModuleGroups.append('text')
			.attr('text-anchor', 'middle')
			.attr('x', data.legendColorRectsWidth / 2)
			.text(d => d.type)
			.style('font', data.legendFont)
			.style('cursor', 'default')
			.style('font-weight', d => widget.activeModule === d.type ? 'bold' : 'normal');




		//CIRCLE FOR RENDERING PERCENTAGE DESCRIPTION
		//overarching circle for percent description tooltip event listening 
		allDonutGroupsGroup.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', data.tooltipDiameter / 2)
			.attr('opacity', 0)
			.on('mouseenter', function () {
				widget.percentIsHovered = true;
				renderPercentageDescription();
			})
			.on('mouseleave', function () {
				widget.percentIsHovered = false;
				widget.svg.selectAll('.percentageDescription').remove();
			});







//************************ DROPDOWNS *************************//
const dropdownsGroup = widget.svg.append('g')
	.attr('class', 'dropdownsGroup')
	.attr('transform', `translate(${data.margin.left + data.paddingLeftOfDropdowns},${data.margin.top})`)

//Year Dropdown
dropdownsGroup.append('text')
	.attr('dominant-baseline', 'hanging')
	.text('Year')
	.attr('x', 5)
	.attr('fill', data.dropdownLabelColor)
	.style('font', data.dropdownLabelFont);

makeDropdown(data.availableYears, widget.dropdownYearChanged, dropdownsGroup, 0, getTextHeight(data.dropdownLabelFont) + data.paddingUnderDropdownLabels, true, data.dateDropdownWidth, 5, 0, data.dropdownStrokeColor, data.dropdownFillColor, data.hoveredFillColor, data.dropdownFont, data.dropdownTextColor, widget.yearSelected, () => {}, () => {}, [], data.dropdownBorderRadius)

//Month Dropdown
dropdownsGroup.append('text')
	.attr('dominant-baseline', 'hanging')
	.attr('x', data.dateDropdownWidth + data.paddingBetweenDropdowns + 10)
	.text('Month')
	.attr('fill', data.dropdownLabelColor)
	.style('font', data.dropdownLabelFont);

makeDropdown(data.availableDates[widget.yearSelected], widget.dropdownMonthChanged, dropdownsGroup, data.dateDropdownWidth + data.paddingBetweenDropdowns, getTextHeight(data.dropdownLabelFont) + data.paddingUnderDropdownLabels, true, data.dateDropdownWidth, 5, 0, data.dropdownStrokeColor, data.dropdownFillColor, data.hoveredFillColor, data.dropdownFont, data.dropdownTextColor, widget.monthSelected, () => {}, () => {}, [], data.dropdownBorderRadius)










	/**** CLICK TO STICK FUNCTIONS ****/

	//OVERALL FUNCS
	function openOverallTooltip(optimizedOrStandard) {
		widget.svg.selectAll('.percentage').style('opacity', 0)
		if (optimizedOrStandard === 'optimized') {
			widget.hovered.optimized = true;
			widget.hovered.current = 'optimized'
			standardPaths.style('fill-opacity', theUnhoveredArcOpacity);
			optimizedPaths.style('fill-opacity', 1)
			widget.svg.selectAll('.optimizedModulePath')
				.transition()
				.attr('d', hoveredModuleArcPathGenerator)
			renderTooltip()
		} else {
			widget.hovered.standard = true;
			widget.hovered.current = 'standard'
			standardPaths.style('fill-opacity', 1);
			optimizedPaths.style('fill-opacity', theUnhoveredArcOpacity)
			widget.svg.selectAll('.standardModulePath')
				.transition()
				.attr('d', hoveredModuleArcPathGenerator)
			renderTooltip()
		}
	}

	function attemptOverallTooltipOpen(optimizedOrStandard) {
		if (widget.overallPinned === 'none' && widget.legendPinned === 'none') openOverallTooltip(optimizedOrStandard);
	}

	function resetOverallPins() {
		if (widget.overallPinned !== 'none') {
			closeOverallTooltip(widget.overallPinned);
			widget.overallPinned = 'none';
		}
	}

	function closeOverallTooltip(optimizedOrStandard) {
		widget.hovered.optimized = false;
		widget.hovered.current = 'neither'
		widget.svg.selectAll('.percentage').style('opacity', 1)
		standardPaths.style('fill-opacity', normalArcOpacity)
		optimizedPaths.style('fill-opacity', normalArcOpacity);
		if (optimizedOrStandard === 'optimized') {
			widget.svg.selectAll('.optimizedModulePath')
				.transition()
				.attr('d', moduleArcPathGenerator)
		} else {
			widget.svg.selectAll('.standardModulePath')
				.transition()
				.attr('d', moduleArcPathGenerator)
		}
		renderTooltip()
	}

	function attemptOverallTooltipClose(optimizedOrStandard) {
		if (widget.overallPinned === 'none' && widget.legendPinned === 'none') closeOverallTooltip(optimizedOrStandard);
	}

	function pinOverallTooltip(optimizedOrStandard) {
		if (widget.legendPinned !== 'none' || widget.overallPinned !== 'none') {
			resetLegendPins();
			resetOverallPins();
		}
		openOverallTooltip(optimizedOrStandard);
		widget.overallPinned = optimizedOrStandard;
	}

	function toggleOverallTooltipPin(optimizedOrStandard) {
		if (widget.overallPinned === optimizedOrStandard) {
			resetOverallPins();
		} else {
			pinOverallTooltip(optimizedOrStandard);
		}
	}


	// LEGEND FUNCS
	function openLegendTooltip(d, that) {
		that.selectAll('rect').style('stroke-opacity', '1')
		that.selectAll('text').style('font-weight', 'bold')

		widget.activeModule = d.type;
		widget.svg.selectAll('.percentage').style('opacity', 0)
		widget.svg.selectAll('.modulePath').style('fill-opacity', theUnhoveredArcOpacity)
		widget.svg.selectAll('.arcPath').style('fill-opacity', theUnhoveredArcOpacity)
		widget.svg.selectAll(`.${d.type}ArcPath`)
			.style('fill-opacity', 1)
			.transition()
			.attr('d', hoveredModuleArcPathGenerator);
		renderTooltip(d);
	}

	function attemptLegendTooltipOpen(d, that) {
		if (widget.legendPinned === 'none' && widget.overallPinned === 'none') openLegendTooltip(d, that);
	}

	function resetLegendPins() {
		if (widget.legendPinned !== 'none') {
			closeLegendTooltip(widget.legendPinned);
			widget.legendPinned = 'none';
		}
	}

	function closeLegendTooltip(d) {
		legendRects.style('stroke-opacity', '0')
		legendTexts.style('font-weight', 'normal')

		widget.activeModule = 'none';
		widget.svg.selectAll('.percentage').style('opacity', 1)
		widget.svg.selectAll('.modulePath').style('fill-opacity', normalArcOpacity)
		widget.svg.selectAll('.arcPath').style('fill-opacity', normalArcOpacity)
		widget.svg.selectAll(`.${d.type}ArcPath`)
			.transition()
			.attr('d', moduleArcPathGenerator);
		renderTooltip();
	}

	function attemptLegendTooltipClose(d) {
		if (widget.legendPinned === 'none' && widget.overallPinned === 'none') closeLegendTooltip(d);
	}

	function pinLegendTooltip(d, that) {
		if (widget.legendPinned !== 'none' || widget.overallPinned !== 'none') {
			resetLegendPins();
			resetOverallPins();
		}
		openLegendTooltip(d, that);
		widget.legendPinned = d;
	}

	function toggleLegendTooltipPin(d, that) {
		if (widget.legendPinned === d) {
			resetLegendPins();
		} else {
			pinLegendTooltip(d, that);
		}
	}

};






	function render(widget, force) {
		// invoking setupDefinitions, then returning value from successful promise to renderWidget func
		return setupDefinitions(widget)
			.then(data => {
				if (force || !widget.data || needToRedrawWidget(widget, data)){
					renderWidget(widget, data);	
				}
				widget.data = data;
			})
			.catch(err => console.error('render did not run properly: ' + err));
	}






	////////////////////////////////////////////////////////////////
	// Initialize Widget
	////////////////////////////////////////////////////////////////

	CxOptimizationHoursLog.prototype.doInitialize = function (element) {
		var that = this;
		element.addClass("CxOptimizationHoursLogOuter");

		that.svg = d3.select(element[0]).append('svg')
			.attr('class', 'CxOptimizationHoursLog')
			.attr('top', 0)
			.attr('left', 0)
			.attr('width', "100%")
			.attr('height', "100%")
			.style('overflow', 'hidden');

		that.getSubscriber().attach("changed", function (prop, cx) { render(that) });
	};


	////////////////////////////////////////////////////////////////
	// Extra Widget Methods
	////////////////////////////////////////////////////////////////

	CxOptimizationHoursLog.prototype.doLayout = CxOptimizationHoursLog.prototype.doChanged = CxOptimizationHoursLog.prototype.doLoad = function () { render(this); };

	/* FOR FUTURE NOTE: 
	CxOptimizationHoursLog.prototype.doChanged = function (name, value) {
		  if(name === "value") valueChanged += 'prototypeMethod - ';
		  render(this);
	};
	*/

	CxOptimizationHoursLog.prototype.doDestroy = function () {
		this.jq().removeClass("CxOptimizationHoursLogOuter");
	};

	return CxOptimizationHoursLog;
});

