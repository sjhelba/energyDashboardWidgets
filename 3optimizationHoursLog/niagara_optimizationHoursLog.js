define(['bajaux/Widget', 'bajaux/mixin/subscriberMixIn', 'nmodule/COREx/rc/d3/d3.min'], function (Widget, subscriberMixIn, d3) {
	"use strict";

	////////// Hard Coded Defs //////////

	const getTextWidth = (text, font) => {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		context.font = font;
		const width = context.measureText(text).width;
		d3.select(canvas).remove()
		return width;
	};
	const normalArcOpacity = 0.9;
	const theUnhoveredArcOpacity = 0.5;
	const formatIntoPercentage = d3.format('.0%');
	const percentageDescription = '% of System Run Hours Logged in Optimization Mode';
	const percentDescriptionRectOpacity = 0.8
	const moduleNamesForOrds = ['Chillers', 'Pcwps', 'Scwps', 'Twps', 'Towers'];
	const arePrimitiveValsInObjsSame = (obj1, obj2) => !Object.keys(obj1).some(key => (obj1[key] === null || (typeof obj1[key] !== 'object' && typeof obj1[key] !== 'function')) && obj1[key] !== obj2[key])
	const needToRedrawWidget = (widget, newData) => {
		const lastData = widget.data;
		// check primitives for equivalence
		if (!arePrimitiveValsInObjsSame(lastData, newData)) return true;
		// check nested modulesData arr for equivalence
		if (lastData.modulesData.length !== newData.modulesData.length) return true;
		const isDiscrepency = lastData.modulesData.some((obj, objIndex) => !arePrimitiveValsInObjsSame(obj, newData.modulesData[objIndex]));
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
				name: 'ordForChillersStdHrs',
				value: 'station:|slot:/tekWorx/Dashboard/Chillers/OperatingHours/Standard',
				typeSpec: 'baja:Ord'
			},
			{
				name: 'ordForPcwpsStdHrs',
				value: 'station:|slot:/tekWorx/Dashboard/Pcwps/OperatingHours/Standard',
				typeSpec: 'baja:Ord'
			},
			{
				name: 'ordForScwpsStdHrs',
				value: 'station:|slot:/tekWorx/Dashboard/Scwps/OperatingHours/Standard',
				typeSpec: 'baja:Ord'
			},
			{
				name: 'ordForTwpsStdHrs',
				value: 'station:|slot:/tekWorx/Dashboard/Twps/OperatingHours/Standard',
				typeSpec: 'baja:Ord'
			},
			{
				name: 'ordForTowersStdHrs',
				value: 'null',
				typeSpec: 'baja:Ord'
			},
			{
				name: 'ordForChillersOptHrs',
				value: 'station:|slot:/tekWorx/Dashboard/Chillers/OperatingHours/Optimization',
				typeSpec: 'baja:Ord'
			},
			{
				name: 'ordForPcwpsOptHrs',
				value: 'station:|slot:/tekWorx/Dashboard/Pcwps/OperatingHours/Optimization',
				typeSpec: 'baja:Ord'
			},
			{
				name: 'ordForScwpsOptHrs',
				value: 'station:|slot:/tekWorx/Dashboard/Scwps/OperatingHours/Optimization',
				typeSpec: 'baja:Ord'
			},
			{
				name: 'ordForTwpsOptHrs',
				value: 'station:|slot:/tekWorx/Dashboard/Twps/OperatingHours/Optimization',
				typeSpec: 'baja:Ord'
			},
			{
				name: 'ordForTowersOptHrs',
				value: 'null',
				typeSpec: 'baja:Ord'
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
		data.graphicWidth = jq.width() || 350;
		data.graphicHeight = jq.height() || 400;



		// GLOBALS PER INSTANCE
		if (!widget.hovered) widget.hovered = { optimized: false, standard: false, current: 'neither' };
		if (!widget.activeModule) widget.activeModule = 'none';
		if (!widget.percentIsHovered) widget.percentIsHovered = false;


		// GET ORD DATA //
		data.modulesData = [
			//Chillers
			{ type: 'CHs', optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_CHs },
			//Primary Pumps
			{ type: 'PCPs', optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_PCPs },
			//Secondary Pumps
			{ type: 'SCPs', optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_SCPs },
			//Condenser Pumps
			{ type: 'TWPs', optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_TWPs },
			//Chiller Towers
			{ type: 'CTFs', optimizedHours: 0, standardHours: 0, totalHours: undefined, normalizedStandardHours: undefined, normalizedOptimizedHours: undefined, color: data.color_CTFs }
		];
	
		// get hours' ords, then add to data.modulesData
		function resolveOrdsAndAddDataToModulesData(moduleType, moduleTypeIndex){
			function resolveOrdDataUtil (isStd){
				return widget.resolve(isStd ? data[`ordFor${moduleType}StdHrs`] : data[`ordFor${moduleType}OptHrs`])
				.then(dataPoint => {
					// due to corresponding index being used here, important that ordering of modules is consistent btwn modulesData and moduleNamesForOrds being iterated below in forEach()
					data.modulesData[moduleTypeIndex][isStd ? 'standardHours' : 'optimizedHours'] += (+(dataPoint.get('out').get('value')));	// adds hrs from ords matching the data type
				})
				.catch(err => { console.error('Likely no properly named optimized/standard hrs Ord for ' + moduleType + ':\n' + err)});
			}
			return resolveOrdDataUtil(true)
				.then(() => resolveOrdDataUtil(false));
		}

		const promisesForEachModuleType = [];
		moduleNamesForOrds.forEach((moduleType, moduleTypeIndex) => {
			if (data[`ordFor${moduleType}OptHrs`] !== 'null' && data[`ordFor${moduleType}StdHrs`] !== 'null') promisesForEachModuleType.push(resolveOrdsAndAddDataToModulesData(moduleType, moduleTypeIndex));
		});

		return Promise.all(promisesForEachModuleType)
			.catch(() => {})
			.then(() => {
				// calculated without ords
				data.percentDescriptionRectWidth = getTextWidth(percentageDescription, data.percentDescriptionFont) + 5;
				data.margin = { top: 5, left: 5, right: 5, bottom: (data.graphicHeight * 0.02) + 5 };
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

				// calculated with ords
					//set totalHours
				data.modulesData.forEach(mod => mod.totalHours = mod.optimizedHours + mod.standardHours)
					// remove unwanted or unfilled modulesData
				data.modulesData = data.modulesData.filter(mod => mod.totalHours)
					//set normalized hours
				const minTotalHours = data.modulesData.reduce((accum, curr) => !accum || (accum && curr.totalHours < accum) ? curr.totalHours : accum, 0)
				data.modulesData.forEach(mod => {
					const normalizedTotal = mod.totalHours / minTotalHours;
					mod.normalizedOptimizedHours = mod.optimizedHours / normalizedTotal;
					mod.normalizedStandardHours = mod.standardHours / normalizedTotal;
				})


				const standardHours = data.modulesData.reduce((accum, curr) => accum + curr.normalizedStandardHours, 0);
				const optimizedHours = data.modulesData.reduce((accum, curr) => accum + curr.normalizedOptimizedHours, 0);

				data.overallData = [{ category: 'standard', hours: standardHours }, { category: 'optimized', hours: optimizedHours }];
				data.percent = formatIntoPercentage(data.overallData[1].hours / (data.overallData[0].hours + data.overallData[1].hours));


				data.legendWidth = data.moduleOuterRadius * 2;
				data.legendColorRectsWidth = data.legendWidth / data.modulesData.length;

				return data;
			})
			.catch(err => console.error('Error (ord info promise rejected): ' + err));
	};




	////////////////////////////////////////////////////////////////
	// Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
	////////////////////////////////////////////////////////////////

	const renderWidget = (widget, data) => {
		/* RENDER INITIALIZATION */

		d3.select(widget.svg.node().parentNode).style('background-color', data.backgroundColor)

		// delete leftover elements from versions previously rendered
		if (!widget.svg.empty()) widget.svg.selectAll('*').remove();

		const graphicGroup = widget.svg.append('g').attr('class', 'graphicGroup');


		/************************************************* ADD ALL SVG ELEMENTS HERE **********************************************************/

		/*** ARCS ***/

		const allDonutGroupsGroup = graphicGroup.append('g')
			.attr('class', 'allDonutGroupsGroup')
			.attr('transform', `translate(${(data.graphicWidth - (data.margin.left + data.margin.right)) / 2}, ${data.margin.top + data.hoveredOuterRadius})`)


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
			.data(overallArcsDataGenerator(data.overallData))
			.enter().append('path')
			.attr('d', overallArcPathGenerator)
			.attr('class', (d, i) => data.overallData[i].category === 'standard' ? 'standardArcPath overallPath standardPath' : 'optimizedArcPath overallPath optimizedPath')
			.attr('fill', (d, i) => data.overallData[i].category === 'optimized' ? data.optimizedColor : data.standardColor)
			.style('fill-opacity', (d, i) => widget.hovered[data.overallData[i].category] ? 1 : normalArcOpacity);


		// get start and end angles of overall arc paths
		const angles = { optimized: { start: 0, end: 0 }, standard: { start: 0, end: 0 } };
		overallArcPaths.filter((d, i) => {
			angles[data.overallData[i].category].start = d.startAngle;
			angles[data.overallData[i].category].end = d.endAngle;
		})



		// module arcs
		const moduleArcPathGenerator = d3.arc()
			.innerRadius(data.moduleInnerRadius)
			.outerRadius(data.moduleOuterRadius);

		const hoveredModuleArcPathGenerator = d3.arc()
			.innerRadius(data.moduleInnerRadius)
			.outerRadius(data.hoveredOuterRadius);

			// func determines whether individual module is hovered and calls corresponding path generator for module arc paths accordingly 
		const determinePathGenerator = lineData => widget.activeModule === data.modulesData[lineData.index].type ? hoveredModuleArcPathGenerator(lineData) : moduleArcPathGenerator(lineData)


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
			.data(standardArcsDataGenerator(data.modulesData))
			.enter().append('path')
			.attr('d', widget.hovered.standard ? hoveredModuleArcPathGenerator : determinePathGenerator)
			.attr('class', (d, i) => `${data.modulesData[i].type}ArcPath modulePath standardModulePath standardPath`)
			.attr('fill', (d, i) => data.modulesData[i].color)
			.style('fill-opacity', (d, i) => {
				if (widget.hovered.standard || widget.activeModule === data.modulesData[i].type) return 1;
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
			.data(optimizedArcsDataGenerator(data.modulesData))
			.enter().append('path')
			.attr('d', widget.hovered.optimized ? hoveredModuleArcPathGenerator : determinePathGenerator)
			.attr('class', (d, i) => `${data.modulesData[i].type}ArcPath modulePath optimizedModulePath optimizedPath`)
			.attr('fill', (d, i) => data.modulesData[i].color)
			.style('fill-opacity', (d, i) => {
				if (widget.hovered.optimized || widget.activeModule === data.modulesData[i].type) return 1;
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
					.data(data.modulesData)
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
					widget.percentIsHovered = true;
					renderPercentageDescription();
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
				widget.hovered.optimized = true;
				widget.hovered.current = 'optimized'

				widget.svg.selectAll('.percentage').style('opacity', 0)
				optimizedPaths.style('fill-opacity', 1);
				standardPaths.style('fill-opacity', theUnhoveredArcOpacity)
				widget.svg.selectAll('.optimizedModulePath')
					.transition()
					.attr('d', hoveredModuleArcPathGenerator)
				renderTooltip()
			})
			.on('mouseleave', function () {
				widget.hovered.optimized = false;
				widget.hovered.current = 'neither'

				widget.svg.selectAll('.percentage').style('opacity', 1)
				standardPaths.style('fill-opacity', normalArcOpacity)
				optimizedPaths.style('fill-opacity', normalArcOpacity);
				widget.svg.selectAll('.optimizedModulePath')
					.transition()
					.attr('d', moduleArcPathGenerator)
				renderTooltip()
			});
		standardPathsHoverArc
			.on('mouseenter', function () {
				widget.hovered.standard = true;
				widget.hovered.current = 'standard'

				widget.svg.selectAll('.percentage').style('opacity', 0)
				standardPaths.style('fill-opacity', 1);
				optimizedPaths.style('fill-opacity', theUnhoveredArcOpacity)
				widget.svg.selectAll('.standardModulePath')
					.transition()
					.attr('d', hoveredModuleArcPathGenerator)
				renderTooltip()
			})
			.on('mouseleave', function () {
				widget.hovered.standard = false;
				widget.hovered.current = 'neither'

				widget.svg.selectAll('.percentage').style('opacity', 1)
				standardPaths.style('fill-opacity', normalArcOpacity);
				optimizedPaths.style('fill-opacity', normalArcOpacity);
				widget.svg.selectAll('.standardModulePath')
					.transition()
					.attr('d', moduleArcPathGenerator)
				renderTooltip()
			});









		/*** LEGEND ***/

		const legendGroup = graphicGroup.append('g').attr('transform', `translate(${((data.graphicWidth - (data.margin.left + data.margin.right)) / 2) - (data.legendWidth / 2)}, ${data.margin.top + (data.hoveredOuterRadius * 2) + data.paddingAboveLegendBars})`);

		const legendModuleGroups = legendGroup.selectAll('.legendModuleGroup')
			.data(data.modulesData)
			.enter().append('g')
			.attr('class', d => `legendModuleGroup .${d.type}LegendModuleGroup`)
			.attr('transform', (d, i) => `translate(${i * data.legendColorRectsWidth}, 0)`)
			.on('mouseenter', function (d) {
				const that = d3.select(this);
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
			})
			.on('mouseleave', function (d) {
				const that = d3.select(this);
				that.selectAll('rect').style('stroke-opacity', '0')
				that.selectAll('text').style('font-weight', 'normal')

				widget.activeModule = 'none';
				widget.svg.selectAll('.percentage').style('opacity', 1)
				widget.svg.selectAll('.modulePath').style('fill-opacity', normalArcOpacity)
				widget.svg.selectAll('.arcPath').style('fill-opacity', normalArcOpacity)
				widget.svg.selectAll(`.${d.type}ArcPath`)
					.transition()
					.attr('d', moduleArcPathGenerator);
				renderTooltip();
			})

		legendModuleGroups.append('rect')
			.attr('height', data.moduleArcThickness)
			.attr('width', data.legendColorRectsWidth)
			.attr('y', data.paddingUnderLegendText)
			.attr('fill', d => d.color)
			.attr('stroke', 'black')
			.style('stroke-opacity', d => widget.activeModule === d.type ? '1' : '0')

		legendModuleGroups.append('text')
			.attr('text-anchor', 'middle')
			.attr('x', data.legendColorRectsWidth / 2)
			.text(d => d.type)
			.style('font', data.legendFont)
			.style('cursor', 'default')
			.style('font-weight', d => widget.activeModule === d.type ? 'bold' : 'normal')




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
			})


	};

	function render(widget) {
		// invoking setupDefinitions, then returning value from successful promise to renderWidget func
		return setupDefinitions(widget)
			.then(data => {
				if (!widget.data || needToRedrawWidget(widget, data)){
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
			.attr('height', "98%");

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

