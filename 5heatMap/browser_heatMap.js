function defineFuncForTabSpacing () {
	////ONLY FOR BROWSER /////
	const widget = {};




	////////// Hard Coded Defs //////////
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
	const getMonthlyDataForYear = (hourlyData, year, tempRanges) => {
		console.log('hourlyData: ', hourlyData)
		let hrsPerTempRangePerMonth = [];
		months.forEach(month => {

		})

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
		{
			name: 'maxKwTrColor',
			value: 'rgb(21,67,96)',
			typeSpec: 'gx:Color'
		},
		{
			name: 'midKwTrColor',
			value: 'rgb(41,171,226)',
			typeSpec: 'gx:Color'
		},
		{
			name: 'minKwTrColor',
			value: 'rgb(34,181,115)',
			typeSpec: 'gx:Color'
		},
		{
			name: 'dropdownFillColor',
			value: 'grey',
			typeSpec: 'gx:Color'
		},
		{
			name: 'tooltipFillColor',
			value: 'grey',
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
			value: 5
		},
		{
			name: 'paddingRightOfYAxisTitle',
			value: 10
		},
		{
			name: 'paddingLeftOfChartGroup',
			value: 10
		},
		{
			name: 'paddingRightOfGrid',
			value: 5
		},
		{
			name: 'paddingRightOfLegendTitle',
			value: 2
		},
		{
			name: 'paddingRightOfLegendBar',
			value: 2
		},
		{
			name: 'paddingBelowGrid',
			value: 5
		},
		{
			name: 'paddingBetweenTHINGS',				// TODO: REPLACE THESE
			value: 5
		},
		{
			name: 'paddingBetweenTHINGS',				// TODO: REPLACE THESE
			value: 5
		},
		{
			name: 'paddingBetweenTHINGS',				// TODO: REPLACE THESE
			value: 5
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
		if (!widget.dropdownYearSelected) widget.dropdownYearSelected = thisYear; // TODO: change to most recent yr in 'available yrs' from data



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
				if (!data.hourlyData[hourlyDatum.year][hourlyDatum.month]) data.hourlyData[hourlyDatum.year][hourlyDatum.month] = {};
				data.hourlyData[hourlyDatum.year][hourlyDatum.month][hourlyDatum.hour] = {eff: hourlyDatum.value, temp: undefined};
			});
			tempHistory.forEach(hourlyDatum => {
				if (!data.hourlyData[hourlyDatum.year]) {
					addedTempHistoryYr = true;
					data.hourlyData[hourlyDatum.year] = {};
					data.availableYears.unshift(hourlyDatum.year)
				}
				if (!data.hourlyData[hourlyDatum.year][hourlyDatum.month]) data.hourlyData[hourlyDatum.year][hourlyDatum.month] = {};
				if (!data.hourlyData[hourlyDatum.year][hourlyDatum.month][hourlyDatum.hour]) {
					data.hourlyData[hourlyDatum.year][hourlyDatum.month][hourlyDatum.hour] = {eff: undefined, temp: hourlyDatum.value};
				} else {
					data.hourlyData[hourlyDatum.year][hourlyDatum.month][hourlyDatum.hour].temp = hourlyDatum.value;
				}
			});

		};
		if (addedTempHistoryYr) data.availableYears.sort((a,b) => a-b);


		// CALCULATED DEFS //
		const calculateDefs = () => {
			data.tempPrecision = !data.overrideDefaultTempPrecisionWFacets ? 0 : 'getFROMFACETS'			//TODO: actually get from facets
			data.kwTrPrecision = !data.overrideDefaultKwTrPrecisionWFacets ? 3 : 'getFROMFACETS'			//TODO: actually get from facets

			// functions
			data.formatTemp = d3.format(`,.${data.tempPrecision}f`);
			data.formatKwTr = d3.format(`,.${data.kwTrPrecision}f`);

			//widths
			data.legendBarWidth = 15 // TODO: replace w/ graphicWidth ratio
			data.yAxisTextAreaWidth = getTextHeight(data.yAxisTitleFont) + data.paddingRightOfYAxisTitle + getTextWidth(`-${data.formatTemp(-888.888)}-${data.formatTemp(-888.888)}`, data.yAxisTicksTextFont) + data.paddingRightOfYAxisTicks;
			data.legendWidth = getTextHeight(data.legendTitleFont) + data.paddingRightOfLegendTitle + data.legendBarWidth + data.paddingRightOfLegendBar + getTextWidth(`>${data.formatKwTr(8.8888)}`, data.legendTicksTextFont);
			data.gridWidth = data.graphicWidth - (data.yAxisTextAreaWidth + data.legendWidth + data.paddingRightOfGrid)

			//heights
			data.headerAreaHeight = data.dropdownGroupHeight + data.paddingBelowDropdown;
			data.gridHeight = data.graphicHeight - (data.headerAreaHeight + data.paddingBelowGrid + getTextHeight(data.xAxisTicksTextFont));

			const getSmallestNumOfPrecision = decimals => {
				if (!decimals) return 1;
				let decimalNums = '0'.repeat(decimals - 1);
				let num = '0.' + decimalNums + '1';
				return +num;
			}

			const smallestNumOfPrecision = getSmallestNumOfPrecision(data.tempPrecision)
			data.tempBins = [];
			data.tempBins.push({min: Number.NEGATIVE_INFINITY, max: data.minTempCategory - 0.0000001, display: '<' + data.formatTemp(data.minTempCategory)})
			data.tempIntervals = (data.maxTempCategory - data.minTempCategory) / 10;	// to get 12 bins
			for (let i = 0; i <= 9; i++) {
				let bin = {};
				bin.min = data.minTempCategory + (data.tempIntervals * i);
				bin.max = (bin.min + data.tempIntervals) - 0.0000001;
				bin.display = data.formatTemp(bin.min) + '-' + data.formatTemp(((bin.min + data.tempIntervals) - smallestNumOfPrecision));
				data.tempBins.push(bin)
			}
			data.tempBins.push({min: data.maxTempCategory, max: Number.POSITIVE_INFINITY, display: '≥' + data.formatTemp(data.maxTempCategory)})

			getMonthlyDataForYear(data.hourlyData, widget.dropdownYearSelected)
			console.log('tempBins: ', data.tempBins)
			
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
			.attr('transform', `translate(${data.margin.left + data.paddingLeftOfChartGroup}, ${data.headerAreaHeight})`)

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
			.on('change', () => dropdownYearChanged(widget, d3.event.target.value))
			.selectAll('option')
				.data(data.availableYears).enter()
					.append('option')
						.property('selected', d => d == widget.dropdownYearSelected)
						.text(d => d)

		// ********************************************* TOOLTIP ******************************************************* //
		







		// ********************************************* CHART ******************************************************* //
		const gridGroup = chartGroup.append('g')
			.attr('class', 'gridGroup')
			.attr('transform', `translate(${data.yAxisTextAreaWidth}, 0)`)
	
		gridGroup.append('rect')		// TODO: remove
			.attr('height', data.gridHeight)
			.attr('width', data.gridWidth)
			.attr('stroke', 'black')
			.attr('fill', 'none')
			

















		// ********************************************* NON-SVG STYLING ******************************************************* //
		widget.outerDiv.selectAll('*')
			.style('margin', '0px')
			.style('padding', '0px')

		widget.outerDiv.select('select')
			.style('padding-left', '5px')





	};
	









	////////////////////////////////////////////////////////////////
		// Render Func
	////////////////////////////////////////////////////////////////
	const render = function () {
		let theData = setupDefinitions();
		renderWidget(theData);
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



