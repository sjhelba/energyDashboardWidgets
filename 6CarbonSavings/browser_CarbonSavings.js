function defineFuncForTabSpacing () {
	////ONLY FOR BROWSER /////
	const widget = {};
	


	////////// Hard Coded Defs //////////
	const getJSDateFromTimestamp = d3.timeParse('%d-%b-%y %I:%M:%S.%L %p UTC%Z');
	const formatNumber = d3.format(`,.${0}f`)
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
	const resetElements = (outerWidgetEl, elementsToReset) => {
		const selectionForCheck = outerWidgetEl.selectAll(elementsToReset)
		if (!selectionForCheck.empty()) selectionForCheck.remove();
  };
  const equipmentGroups = ['Chillers', 'Pcwps', 'Scwps', 'Twps', 'Towers']
  const img = {
    home: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOS42NCIgaGVpZ2h0PSIyMy4xNyIgdmlld0JveD0iMCAwIDI5LjY0IDIzLjE3Ij4NCiAgPHRpdGxlPkhvbWU8L3RpdGxlPg0KICA8cmVjdCB4PSI0LjU2IiB5PSIxNi43MSIgd2lkdGg9IjE3LjM4IiBoZWlnaHQ9IjIuNDEiIHJ4PSIwLjUiIHJ5PSIwLjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMi4yNyAtNC4xNikgcm90YXRlKC0yOSkiIHN0eWxlPSJmaWxsOiAjNGQ0ZDRkIi8+DQogIDxyZWN0IHg9IjE4LjE5IiB5PSIxNi43MSIgd2lkdGg9IjE3LjM4IiBoZWlnaHQ9IjIuNDEiIHJ4PSIwLjUiIHJ5PSIwLjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYuODEgLTIzLjYxKSByb3RhdGUoMjkpIiBzdHlsZT0iZmlsbDogIzRkNGQ0ZCIvPg0KICA8bGluZSB4MT0iMTQuOTMiIHkxPSIwLjE3IiB4Mj0iMTEuOTkiIHkyPSIwLjE3IiBzdHlsZT0iZmlsbDogI2YyZjJmMiIvPg0KICA8cGF0aCBkPSJNMTcsMTMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC01LjI1IC0xMi44MykiIHN0eWxlPSJmaWxsOiAjZjJmMmYyIi8+DQogIDxwb2x5Z29uIHBvaW50cz0iMjUuNzUgMjMuMTcgMy43NSAyMy4xNyAzLjc1IDkuMTcgMTQuNzUgMy4xNyAxNC43NSAzLjE3IDI1Ljc1IDkuMTcgMjUuNzUgMjMuMTciIHN0eWxlPSJmaWxsOiAjMzM0MTRlIi8+DQogIDxwYXRoIGQ9Ik0xNi43NSwxMmg0YTEsMSwwLDAsMSwxLDFWMjMuMTdhMCwwLDAsMCwxLDAsMGgtNmEwLDAsMCwwLDEsMCwwVjEzQTEsMSwwLDAsMSwxNi43NSwxMloiIHN0eWxlPSJmaWxsOiAjNjljYWQyIi8+DQogIDxwYXRoIGQ9Ik0xNiwzMC4zN0gxMi4zN2ExLDEsMCwwLDEtMS0xdi0zLjVhMSwxLDAsMCwxLDEtMWgwLjc2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNS4yNSAtMTIuODMpIiBzdHlsZT0iZmlsbDogI2YyZjJmMiIvPg0KICA8cGF0aCBkPSJNMTMuMTQsMjQuODhoMy4yNGExLDEsMCwwLDEsMSwxdjMuNWExLjQyLDEuNDIsMCwwLDEtMS4zNywxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNS4yNSAtMTIuODMpIiBzdHlsZT0iZmlsbDogI2NjYyIvPg0KICA8Y2lyY2xlIGN4PSIyMC43NyIgY3k9IjE4LjQ1IiByPSIwLjUiIHN0eWxlPSJmaWxsOiAjMzMzIi8+DQo8L3N2Zz4NCg==',
    car: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNCIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDM0IDI2Ij4NCiAgPHRpdGxlPkNhcjwvdGl0bGU+DQogIDxwYXRoIGQ9Ik0zNCwyMS41SDUuOTRMOCwxNmMyLTQuOTQsMS44OC01LDgtNWg4YzYuMDYsMCw2LC4wNiw4LDVaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMyAtMTEpIiBzdHlsZT0iZmlsbDogIzMzNDE0ZSIvPg0KICA8cmVjdCB4PSIzIiB5PSIxOCIgd2lkdGg9IjQiIGhlaWdodD0iOCIgcng9IjEiIHJ5PSIxIiBzdHlsZT0iZmlsbDogIzRkNGQ0ZCIvPg0KICA8cmVjdCB4PSIyNyIgeT0iMTgiIHdpZHRoPSI0IiBoZWlnaHQ9IjgiIHJ4PSIxIiByeT0iMSIgc3R5bGU9ImZpbGw6ICM0ZDRkNGQiLz4NCiAgPHBhdGggZD0iTTMxLDMzSDljLTEuNjUsMC00LDAtNC0zVjI0YzAtLjU1LjQ1LTMsMS0zSDM0YzAuNTUsMCwxLDIuNDUsMSwzdjZDMzUsMzMuMDUsMzIuNjUsMzMsMzEsMzNaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMyAtMTEpIiBzdHlsZT0iZmlsbDogIzMzNDE0ZSIvPg0KICA8cmVjdCB5PSI3LjUiIHdpZHRoPSI0IiBoZWlnaHQ9IjMiIHJ4PSIxIiByeT0iMSIgc3R5bGU9ImZpbGw6ICMzMzQxNGUiLz4NCiAgPHJlY3QgeD0iMzAiIHk9IjcuNSIgd2lkdGg9IjQiIGhlaWdodD0iMyIgcng9IjEiIHJ5PSIxIiBzdHlsZT0iZmlsbDogIzMzNDE0ZSIvPg0KICA8cmVjdCB4PSI1IiB5PSIxOC41IiB3aWR0aD0iMjQiIGhlaWdodD0iMSIgcng9IjAuNSIgcnk9IjAuNSIgc3R5bGU9ImZpbGw6ICM2OWNhZDIiLz4NCiAgPGNpcmNsZSBjeD0iNi41IiBjeT0iMTQiIHI9IjEuNSIgc3R5bGU9ImZpbGw6ICNmMmYyZjIiLz4NCiAgPGNpcmNsZSBjeD0iMjcuNSIgY3k9IjE0IiByPSIxLjUiIHN0eWxlPSJmaWxsOiAjZjJmMmYyIi8+DQogIDxwYXRoIGQ9Ik0yMiwyMWg3Ljg3YTEsMSwwLDAsMCwuNjMtMS4zNWwtMi4zLTYuMTNBMC43MSwwLjcxLDAsMCwwLDI3LjU3LDEzSDE3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMyAtMTEpIiBzdHlsZT0iZmlsbDogI2NjYyIvPg0KICA8cGF0aCBkPSJNMTcuMjMsMTNoLTQuOGEwLjcxLDAuNzEsMCwwLDAtLjYzLjUybC0yLjMsNi4xM0ExLDEsMCwwLDAsMTAuMTMsMjFIMjIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zIC0xMSkiIHN0eWxlPSJmaWxsOiAjZjJmMmYyIi8+DQogIDxsaW5lIHgxPSIxNy4xNyIgeTE9IjIiIHgyPSIxNC4yMyIgeTI9IjIiIHN0eWxlPSJmaWxsOiAjZjJmMmYyIi8+DQogIDxwYXRoIGQ9Ik0xNywxMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTMgLTExKSIgc3R5bGU9ImZpbGw6ICNmMmYyZjIiLz4NCjwvc3ZnPg0K',
    forest: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOS42IiBoZWlnaHQ9IjI2Ljk0IiB2aWV3Qm94PSIwIDAgMjkuNiAyNi45NCI+DQogIDx0aXRsZT5Gb3JyZXN0PC90aXRsZT4NCiAgPHJlY3QgeD0iMTkuMTMiIHk9IjI4Ljc2IiB3aWR0aD0iMTMuMzciIGhlaWdodD0iMy4xMyIgcng9IjAuNSIgcnk9IjAuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTguNjQgNDYuMDcpIHJvdGF0ZSgtOTApIiBzdHlsZT0iZmlsbDogIzRkNGQ0ZCIvPg0KICA8cGF0aCBkPSJNMzMuNjEsMzEuNDFMMjkuOTQsMjdoMS4xN2EwLjUsMC41LDAsMCwwLC4zOC0wLjgyTDI4LjQsMjIuNTRoMS4zN2EwLjUsMC41LDAsMCwwLC4zOC0wLjgybC0zLjc3LTQuNDlhMC41LDAuNSwwLDAsMC0uNzcsMGwtMy43Nyw0LjQ5YTAuNSwwLjUsMCwwLDAsLjM4LjgySDIzLjZsLTMuMDksMy42OGEwLjUsMC41LDAsMCwwLC4zOC44MmgxLjE3bC0zLjY3LDQuMzdhMC41LDAuNSwwLDAsMCwuMzguODJIMzMuMjNBMC41LDAuNSwwLDAsMCwzMy42MSwzMS40MVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00LjEzIC0xMC4wNykiIHN0eWxlPSJmaWxsOiAjNjljYWQyIi8+DQogIDxyZWN0IHg9IjUuMzEiIHk9IjI2LjQ5IiB3aWR0aD0iMTcuMzgiIGhlaWdodD0iMy41MyIgcng9IjAuNSIgcnk9IjAuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTE4LjM5IDMyLjE5KSByb3RhdGUoLTkwKSIgc3R5bGU9ImZpbGw6ICM0ZDRkNGQiLz4NCiAgPHBhdGggZD0iTTIzLjYyLDMwLjNsLTUuNTctNi42M0gyMC42QTAuNSwwLjUsMCwwLDAsMjEsMjIuODVsLTQuODUtNS43N2gyLjhhMC41LDAuNSwwLDAsMCwuMzgtMC44MmwtNC45NC01Ljg4YTAuNSwwLjUsMCwwLDAtLjc3LDBMOC42OCwxNi4yNWEwLjUsMC41LDAsMCwwLC4zOC44MmgyLjhMNywyMi44NWEwLjUsMC41LDAsMCwwLC4zOC44Mkg5Ljk1TDQuMzgsMzAuM2EwLjUsMC41LDAsMCwwLC4zOC44MkgyMy4yNEEwLjUsMC41LDAsMCwwLDIzLjYyLDMwLjNaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNC4xMyAtMTAuMDcpIiBzdHlsZT0iZmlsbDogIzMzNDE0ZTtzdHJva2U6ICM0ZDRkNGQ7c3Ryb2tlLW1pdGVybGltaXQ6IDEwO3N0cm9rZS13aWR0aDogMC4yNXB4Ii8+DQo8L3N2Zz4NCg=='
  }


	////////////////////////////////////////////////////////////////
		// Define Widget Constructor & Exposed Properties
	////////////////////////////////////////////////////////////////
	const properties = [
		/* COLORS */
		//fills
		{
			name: 'backgroundColor',
			value: '#F5F5f5',
			typeSpec: 'gx:Color'
		},
		//text
		{
			name: 'numbersTextColor',
			value: '#404040',
			typeSpec: 'gx:Color'
    },
    {
			name: 'descriptionsTextColor',
			value: '#606060',
			typeSpec: 'gx:Color'
		},
		/* FONT */
		{
			name: 'lastMonthFont',
			value: 'bold 13.0pt Nirmala UI',
			typeSpec: 'gx:Font'
    },
    {
			name: 'numbersFont',
			value: 'bold 35.0pt Nirmala UI',
			typeSpec: 'gx:Font'
    },
    {
			name: 'descriptionsFont',
			value: '13.0pt Nirmala UI',
			typeSpec: 'gx:Font'
    },
    {
			name: 'base2Font',
			value: '8.0pt Nirmala UI',
			typeSpec: 'gx:Font'
		},
	/* PADDING */
		{
			name: 'paddingBetweenRows',
			value: 30
    },
    {
      name: 'paddingWithinRows',
      value: 10
    },
    {
			name: 'margin',
			value: 10
    },
    {
      name: 'additionalNumbersSpacing',
      value: 0
    },
	/* OTHER */
    {
      name: 'includeChillers',
      value: true
    },
    {
      name: 'includePcwps',
      value: true
    },
    {
      name: 'includeScwps',
      value: true
    },
    {
      name: 'includeTwps',
      value: true
    },
    {
      name: 'includeTowers',
      value: false
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
		data.jqHeight = 460;
		data.jqWidth = 450;


    // SIZING //
    data.graphicHeight = data.jqHeight - (data.margin * 2);
    data.graphicWidth = data.jqWidth - (data.margin * 2);
    data.rowHeight = (data.graphicHeight - ((data.paddingBetweenRows * 3) + getTextHeight(data.lastMonthFont) + data.paddingWithinRows)) / 4;
    data.imgSize = data.rowHeight - (getTextHeight(data.descriptionsFont));
    data.halfImgWidth = data.imgSize / 2;
    data.centerOfRow = data.graphicWidth / 2;
    data.centerLeftOfImg = (data.centerOfRow - ( data.halfImgWidth + data.paddingWithinRows) ) / 2;
    data.rightOfImg = data.centerOfRow + data.halfImgWidth + data.paddingWithinRows;



		// DATA TO POPULATE //
    data.savings = {
      baselineKwh: 0,
      measuredKwh: 0,
      kwhSaved: 0,
      tonsCo2: 0,
      greenhouseGas: 0,
      co2Emissions: 0,
      carbonSequestered: 0
    };

		// FAKE DATA //
		const populateFakeData = () => {
      equipmentGroups.forEach(eq => {
        if (data[`include${eq}`]) {
          //get measured history for last month for that eq group and add to data.savings.measuredKwh
          data.savings.measuredKwh += 109610.75;
          //get baseline history for that eq group and add to data.savings.baselineKwh
          data.savings.baselineKwh += 200000;
        }
      })
		};



		// CALCULATED DEFS //
		const calculateDefs = () => {
      if ( (!data.savings.measuredKwh || !data.savings.baselineKwh) || data.savings.baselineKwh < data.savings.measuredKwh ){
        data.savings.kwhSaved = '-';
        data.savings.tonsCo2 = '-';
        data.savings.greenhouseGas = '-';
        data.savings.co2Emissions = '-';
        data.savings.carbonSequestered = '-';
      } else {
        data.savings.kwhSaved = Math.round(data.savings.baselineKwh - data.savings.measuredKwh);
        data.savings.tonsCo2 = Math.round(0.00082035 * data.savings.kwhSaved);
        data.savings.greenhouseGas = formatNumber(data.savings.tonsCo2 / 5.153);
        data.savings.co2Emissions = formatNumber(data.savings.tonsCo2 / 10.207);
        data.savings.carbonSequestered = formatNumber(data.savings.tonsCo2 / 0.936);

        data.savings.kwhSaved = formatNumber(data.savings.kwhSaved);
        data.savings.tonsCo2 = formatNumber(data.savings.tonsCo2);
      }






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

		// ********************************************* ROWS AND TITLE ******************************************************* //
    const graphicGroup = widget.svg.append('g')
      .attr('class', 'graphicGroup')
      .attr('transform', `translate(${data.margin},${data.margin})`);

    // graphicGroup.append('line')      //TODO: DELETE
    //   .attr('x1', data.graphicWidth / 2)
    //   .attr('x2', data.graphicWidth / 2)
    //   .attr('y1', 0)
    //   .attr('y2', data.graphicHeight)
    //   .attr('stroke', 'blue')

    graphicGroup.append('text')
      .text('Last Month')
      .style('font', data.lastMonthFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')

    const rowsGroup = graphicGroup.append('g')
      .attr('class', 'rowsGroup')
      .attr('transform', `translate(0,${getTextHeight(data.lastMonthFont)})`);

    const row1 = rowsGroup.append('g')
      .attr('class', 'row1')
    const row1Descriptions = row1.append('g')
      .attr('class', 'row1Descriptions')
      .attr('transform', `translate(0,${getTextHeight(data.numbersFont) + data.paddingWithinRows})`);

    const row2 = rowsGroup.append('g')
      .attr('class', 'row2')
      .attr('transform', `translate(0,${data.rowHeight + data.paddingBetweenRows})`);
    const row2Graphic = row2.append('g')
      .attr('class', 'row2Graphic')
      .attr('transform', `translate(0,${getTextHeight(data.descriptionsFont) + data.paddingWithinRows})`);

    const row3 = rowsGroup.append('g')
      .attr('class', 'row3')
      .attr('transform', `translate(0,${(data.rowHeight * 2) + (data.paddingBetweenRows * 2)})`);
    const row3Graphic = row3.append('g')
      .attr('class', 'row3Graphic')
      .attr('transform', `translate(0,${getTextHeight(data.descriptionsFont) + data.paddingWithinRows})`);

    const row4 = rowsGroup.append('g')
      .attr('class', 'row4')
      .attr('transform', `translate(0,${(data.rowHeight * 3) + (data.paddingBetweenRows * 3)})`);
    const row4Graphic = row4.append('g')
      .attr('class', 'row4Graphic')
      .attr('transform', `translate(0,${getTextHeight(data.descriptionsFont) + data.paddingWithinRows})`);

      

		// ********************************************* ROW1 ******************************************************* //
    row1.append('text')
      .text(data.savings.kwhSaved)
      .style('font', data.numbersFont)
      .attr('fill', data.numbersTextColor)
      .attr('dominant-baseline', 'hanging')

    
    const tonsCo2Width = getTextWidth(data.savings.tonsCo2, data.numbersFont);
    const centerOfTonsCo2 = data.centerOfRow + (data.graphicWidth / 4);
    const leftOfTonsCo2 = centerOfTonsCo2 - (tonsCo2Width / 2);
    const midwayBetweenCenterOfRowAndTonsCo2 = data.centerOfRow + ( (leftOfTonsCo2 - data.centerOfRow) / 2)

    row1.append('text')
      .text(data.savings.tonsCo2)
      .style('font', data.numbersFont)
      .attr('fill', data.numbersTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', centerOfTonsCo2)
      .attr('text-anchor', 'middle')

    row1.append('text')
      .text('=')
      .style('font', data.numbersFont)
      .attr('fill', data.numbersTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', midwayBetweenCenterOfRowAndTonsCo2)
      .attr('text-anchor', 'middle')

    row1Descriptions.append('text')
      .text('Kilowatt-Hours Saved')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')

    row1Descriptions.append('text')
      .text('Tons CO')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', leftOfTonsCo2)

    row1Descriptions.append('text')
      .text('2')
      .style('font', data.base2Font)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'middle')
      .attr('x', leftOfTonsCo2 + getTextWidth('Tons CO', data.descriptionsFont))
      .attr('y', getTextHeight(data.descriptionsFont))

		// ********************************************* ROW2 ******************************************************* //
    row2.append('text')
      .text('Greenhouse Gas Emissions From')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')

    row2Graphic.append('text')
      .text(data.savings.greenhouseGas)
      .style('font', data.numbersFont)
      .attr('fill', data.numbersTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', data.centerLeftOfImg)
      .attr('text-anchor', 'middle')
      .attr('y', ( -(getTextHeight(data.numbersFont) / 4)) + data.additionalNumbersSpacing)

    row2Graphic.append('text')
      .text('Passenger Cars Driven')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', data.rightOfImg)

    row2Graphic.append('text')
      .text('For One Year')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', data.rightOfImg)
      .attr('y', getTextHeight(data.descriptionsFont))

    row2Graphic.append('svg:image')
      .attr('xlink:href', img.car)
      .attr('height', data.imgSize)
      .attr('width', data.imgSize)
      .attr('x', data.centerOfRow - data.halfImgWidth)
      .attr('y', -data.paddingWithinRows / 2)
  

		// ********************************************* ROW3 ******************************************************* //
    row3.append('text')
      .text('CO')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')

    row3.append('text')
      .text('2')
      .style('font', data.base2Font)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'middle')
      .attr('x', getTextWidth('CO', data.descriptionsFont))
      .attr('y', getTextHeight(data.descriptionsFont))

    row3.append('text')
      .text('Emissions From')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', getTextWidth('CO ', data.descriptionsFont) + getTextWidth('2', data.base2Font))  //space added in x due to preceeding space not counting in d3 text

    row3Graphic.append('text')
      .text(data.savings.co2Emissions)
      .style('font', data.numbersFont)
      .attr('fill', data.numbersTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', data.centerLeftOfImg)
      .attr('text-anchor', 'middle')
      .attr('y', ( -(getTextHeight(data.numbersFont) / 4)) + data.additionalNumbersSpacing)


    row3Graphic.append('text')
      .text('Homes\' Energy Use')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', data.rightOfImg)

    row3Graphic.append('text')
      .text('For One Year')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', data.rightOfImg)
      .attr('y', getTextHeight(data.descriptionsFont))

    row3Graphic.append('svg:image')
      .attr('xlink:href', img.home)
      .attr('height', data.imgSize)
      .attr('width', data.imgSize)
      .attr('x', data.centerOfRow - data.halfImgWidth)
      .attr('y', -data.paddingWithinRows / 2)



		// ********************************************* ROW4 ******************************************************* //
    row4.append('text')
      .text('Carbon Sequestered By')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')


    row4Graphic.append('text')
      .text(data.savings.carbonSequestered)
      .style('font', data.numbersFont)
      .attr('fill', data.numbersTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', data.centerLeftOfImg)
      .attr('text-anchor', 'middle')
      .attr('y', ( -(getTextHeight(data.numbersFont) / 4)) + data.additionalNumbersSpacing)


    row4Graphic.append('text')
      .text('Acres of U.S. Forests')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', data.rightOfImg)

    row4Graphic.append('text')
      .text('In One Year')
      .style('font', data.descriptionsFont)
      .attr('fill', data.descriptionsTextColor)
      .attr('dominant-baseline', 'hanging')
      .attr('x', data.rightOfImg)
      .attr('y', getTextHeight(data.descriptionsFont))

    row4Graphic.append('svg:image')
      .attr('xlink:href', img.forest)
      .attr('height', data.imgSize)
      .attr('width', data.imgSize)
      .attr('x', data.centerOfRow - data.halfImgWidth)
      .attr('y', -data.paddingWithinRows / 2)

console.log(data)

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