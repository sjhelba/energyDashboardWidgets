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
	const resetElements = (outerWidgetEl, elementsToReset) => {
		const selectionForCheck = outerWidgetEl.selectAll(elementsToReset)
		if (!selectionForCheck.empty()) selectionForCheck.remove();
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
			name: 'yearDropdownTitleColor',
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
			name: 'legendUnitsTitleFont',
			value: 'bold 10.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'legendTicksTextFont',
			value: '10.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
		{
			name: 'yearDropdownTitleFont',
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
			name: 'overrideDefaultPrecisionWFacets',
			value: false
		},
		{
			name: 'minDegreesCategory',
			value: 30
		},
		{
			name: 'maxDegreesCategory',
			value: 80
		},
		{
			name: 'minKwTrCategory',
			value: 0.250
		},
		{
			name: 'maxKwTrCategory',
			value: 1.250
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
		data.jqHeight = 150;
		data.jqWidth = 150;

		// SIZING //
		data.margin = {top: 5, left: 5, right: 5, bottom: 5};
		data.graphicHeight = data.jqHeight - (data.margin.top + data.margin.bottom);
		data.graphicWidth = data.jqWidth - (data.margin.left + data.margin.right);

		// GLOBALS PER INSTANCE //
		if (!widget.hovered) widget.hovered = { optimized: false, standard: false, current: 'neither' };
		if (!widget.activeModule) widget.activeModule = 'none';
		if (!widget.percentIsHovered) widget.percentIsHovered = false;

		// DATA TO POPULATE //
		data.fakeData = [];

		// FAKE DATA //
		const populateFakeData = () => {
			fakeData.unshift('datum1');




		};



		// CALCULATED DEFS //
		const calculateDefs = () => {







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
		widget.outerDiv 
			.style('height', data.jqHeight + 'px')	//only for browser
			.style('width', data.jqWidth + 'px')		//only for browser

		widget.svg 
			.attr('height', data.jqHeight + 'px')
			.attr('width', data.jqWidth + 'px')
			
		d3.select(widget.svg.node().parentNode).style('background-color', data.backgroundColor);
		
		// delete leftover elements from versions previously rendered
		if (!widget.svg.empty()) resetElements(widget.svg, '*');

		// ********************************************* GRAPHIC GROUP ******************************************************* //

	

		const graphicGroup = widget.svg.append('g').attr('class', 'graphicGroup');
		const graphicRectForTestingOnly = graphicGroup.append('rect')	//TODO: Remove
			.attr('fill', 'none')
			.attr('stroke', 'black')
			.attr('height', data.graphicHeight)
			.attr('width', data.graphicWidth);

		const centeredGroup = graphicGroup.append('g')
			.attr('class', 'centeredGroup')
			.attr('transform', `translate(${data.graphicWidth / 2}, ${data.graphicHeight / 2})`);

		// ********************************************* OUTER ELLIPSE ******************************************************* //
		centeredGroup.append('ellipse')
			.attr('rx', 40)
			.attr('ry', 20)

	};
	






	////////////////////////////////////////////////////////////////
		// Render Func
	////////////////////////////////////////////////////////////////
	function render () {
		let theData = setupDefinitions();
		renderWidget(theData);
	}








	////////////////////////////////////////////////////////////////
		// Initialize Widget
	////////////////////////////////////////////////////////////////
	widget.outerDiv = d3.select('#outer')
		.style('overflow', 'hidden');

	widget.svg = widget.outerDiv.append('svg')
		.attr('class', 'log')
		.style('overflow', 'hidden');
		
	render();







}

defineFuncForTabSpacing();