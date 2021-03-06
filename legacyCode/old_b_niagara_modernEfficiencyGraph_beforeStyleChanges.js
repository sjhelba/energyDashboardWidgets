define(['bajaux/Widget', 'bajaux/mixin/subscriberMixIn', 'nmodule/tekScratch/rc/d3/d3.min', 'css!nmodule/tekScratch/rc/web/ModernEfficiencyGraph/style'], function (Widget, subscriberMixIn, d3) {
  "use strict";

  ////////////////////////////////////////////////////////////////
  // Define Widget Constructor & Add Exposed Properties
  ////////////////////////////////////////////////////////////////

  
  // function that makes '3 digit month'-'4 digit year' into JS date
  const parseDate = d3.timeParse('%b-%Y');
  
  const getJSDateFromTimestamp = d3.timeParse('%d-%b-%y %I:%M:%S.%L %p UTC%Z');



  var ModernEfficiencyGraph = function () {        
      var that = this;
      Widget.apply(this, arguments);

      that.properties().addAll([
          {
              name: 'measuredColor',
              value: 'rgb(39, 176, 71)',
              typeSpec: 'gx:Color'
          },
          {
              name: 'baselineColor',
              value: 'rgb(44, 139, 246)',
              typeSpec: 'gx:Color'
          },
          {
              name: 'projectedColor',
              value: 'rgb(246, 159, 44)',
              typeSpec: 'gx:Color'
          },
          {
              name: 'measuredFillOpacity',
              value: 0.42
          },
          {
              name: 'baselineFillOpacity',
              value: 0.42
          },
          {
              name: 'projectedFillOpacity',
              value: 0.42
          },
          {
              name: 'backgroundColor',
              value: 'white',
              typeSpec: 'gx:Color'
          },
          {
              name: 'tooltipFill',
              value: 'white',
              typeSpec: 'gx:Color'
          },
          {
              name: 'dataPointRadius',
              value: 5
          },
          {
              name: 'dataPointStrokeWidth',
              value: 2.5
          },
          {
              name: 'areaPathStrokeWidth',
              value: 3
          },
          {
              name: 'unitsColor',
              value: 'black',
              typeSpec: 'gx:Color'
          },
          {
              name: 'unitsFont',
              value: 'bold 10pt Nirmala UI',
              typeSpec: 'gx:Font'
          },
          {
              name: 'xAxisFontColor',
              value: 'black',
              typeSpec: 'gx:Color'
          },
          {
              name: 'yAxisFontColor',
              value: 'black',
              typeSpec: 'gx:Color'
          },
          {
              name: 'legendFontColor',
              value: 'black',
              typeSpec: 'gx:Color'
          },
          {
              name: 'xAxisFont',
              value: '8pt Nirmala UI',
              typeSpec: 'gx:Font'
          },
          {
              name: 'yAxisFont',
              value: '10pt Nirmala UI',
              typeSpec: 'gx:Font'
          },
          {
              name: 'legendFont',
              value: '10pt Nirmala UI',
              typeSpec: 'gx:Font'
          },
          {
              name: 'tooltipFont',
              value: 'bold 10pt Nirmala UI',
              typeSpec: 'gx:Font'
          },
          {
              name: 'tooltipPadding',
              value: 15
          },
          {
              name: 'legendPadding',
              value: 5
          },
          {
              name: 'legendSquareSize',
              value: 11
          },
          {
              name: 'yAxisTitlePadding',
              value: 2
          },
          {
              name: 'tooltipRectWidth',
              value: 113
          },
          {
              name: 'tooltipRectHeight',
              value: 66
          }
      ]);



      subscriberMixIn(that);
  };

  ModernEfficiencyGraph.prototype = Object.create(Widget.prototype);
  ModernEfficiencyGraph.prototype.constructor = ModernEfficiencyGraph;


  ////////////////////////////////////////////////////////////////
  // /* SETUP DEFINITIONS */
  ////////////////////////////////////////////////////////////////

  const widgetProperties = [
      'measuredColor','baselineColor','projectedColor','measuredFillOpacity','baselineFillOpacity','projectedFillOpacity','backgroundColor',
      'dataPointRadius','dataPointStrokeWidth','areaPathStrokeWidth','unitsColor','unitsFont','xAxisFontColor','yAxisFontColor','legendFontColor',
      'xAxisFont','yAxisFont','legendFont','tooltipFont','tooltipPadding','legendPadding','legendSquareSize', 'tooltipFill', 'yAxisTitlePadding', 'tooltipRectWidth', 'tooltipRectHeight'
  ];

  const setupDefinitions = widget => {
      const data = {};
      // FROM USER // 
      widgetProperties.forEach(prop => { data[prop] = widget.properties().getValue(prop); });

      // FROM JQ //
      const jq = widget.jq();
      data.graphicWidth = jq.width() || 625;
      data.graphicHeight = jq.height() || 300;

      // DEFINITIONS CALCULATED FROM USER AND JQ PROPERTIES //
      data.legendHeight = 0.166 * data.graphicHeight || 50;
      data.legendWidth = 0.128 * data.graphicWidth || 80;

      data.margin = {left: data.graphicWidth * 0.12 || 75, right: data.graphicWidth * 0.12 || 75, top: 5 + data.legendHeight, bottom: 0};  //will be used in terms of pixels (convention to call margin)
      
      data.chartHeight = 0.66 * data.graphicHeight || 200;
      data.chartWidth = 0.88 * data.graphicWidth - data.margin.left || 550;



      // GATHER AND FORMAT MONTHLY DATA //
      data.baselineData = [];
      data.projectedData = [];
      data.measuredData = [];

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const today = new Date();
      const currentFullYear = today.getFullYear();
      const currentMonthIndex = today.getMonth();

      const getDatesOfLast12Months = (monthIndex, currentYear) => {
          const datesArray = [];
          let pointer = monthIndex;
          for (let count = 12; count > 0; count--) {
              if (pointer >= 0) {
                  data.baselineData.unshift({month: months[pointer], value: 0, count: 0, total: 0});
                  data.projectedData.unshift({month: months[pointer], value: 0, count: 0, total: 0});
                  data.measuredData.unshift({month: months[pointer], year: currentYear, value: 0, count: 0, total: 0});
                  datesArray.unshift(months[pointer] + '-' + currentYear);
              } else {
                  data.baselineData.unshift({month: months[months.length + pointer], value: 0, count: 0, total: 0});
                  data.projectedData.unshift({month: months[months.length + pointer], value: 0, count: 0, total: 0});
                  data.measuredData.unshift({month: months[months.length + pointer], year: currentYear - 1, value: 0, count: 0, total: 0});
                  datesArray.unshift(months[months.length + pointer] + '-' + (currentYear - 1));
              }
              pointer--;
          }
          return datesArray;
      };


      data.last12Dates = getDatesOfLast12Months(currentMonthIndex, currentFullYear);  // formatted ['Dec-2017', 'Jan-2018', ...etc]
      data.last12DatesSeperated = data.last12Dates.map(date => {  // formatted as [ {monthIndex: 11, year: 2017}, {monthIndex: 0, year: 2018}, ...etc ]
          const splitDate = date.split('-');
          return {monthIndex: months.indexOf(splitDate[0]), year: +splitDate[1]};
      }); 
      

      // GET HISTORY DATA //
      return widget.resolve(`history:^System_MsEffMr`)
          .then(measuredTable => {
              // get facets off of 'measured' table
              const facets = measuredTable.getCol('value').getFacets();
              data.unitsLabel = facets.get('units').toString() || 'Measured Data Units';                
              data.precision = facets.get('precision') ;

              //get data off of table
              return measuredTable.cursor({
                  limit: 700000,  // default is 10
                  each: function (row, idx) {
                    const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
                    const rowYear = timestamp.getFullYear();
                    const rowMonthIndex = timestamp.getMonth();
                    const rowValue = row.get('value');

                    data.last12DatesSeperated.forEach((date, index) => {
                      if (rowYear === date.year && rowMonthIndex === date.monthIndex) {
                          data.measuredData[index].count++;
                          data.measuredData[index].total += rowValue;
                      }
                    });
                  }
                });
          })
          .then(() => widget.resolve(`history:^System_BlEffMr`)) 
          .then(baselineTrendTable => {
              return baselineTrendTable.cursor({
                  limit: 700000,  // default is 10
                  each: function (row, idx) {
                    const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
                    const rowMonthIndex = timestamp.getMonth();
                    const rowValue = row.get('value');

                    data.last12DatesSeperated.forEach((date, index) => {
                      if (rowMonthIndex === date.monthIndex) {
                          data.baselineData[index].count++;
                          data.baselineData[index].total += rowValue;
                      }
                  });
                  }
              });
          })
          .then(() => widget.resolve(`history:^System_PrEffMr`)) 
          .then(projectedTrendTable => {
              return projectedTrendTable.cursor({
                  limit: 700000,  // default is 10
                  each: function (row, idx) {
                    const timestamp = getJSDateFromTimestamp(row.get('timestamp'));
                    const rowMonthIndex = timestamp.getMonth();
                    const rowValue = row.get('value');

                  data.last12DatesSeperated.forEach((date, index) => {
                      if (rowMonthIndex === date.monthIndex) {
                          data.projectedData[index].count++;
                          data.projectedData[index].total += rowValue;
                      }
                  });
                  }
              });
          })
          .then(() => {   // UTILIZE ACCUMULATED DATA AND RETURN DATA OBJECT TO PASS TO RENDER FUNC //
              data.last12DatesSeperated.forEach((date, index) => {
                  data.projectedData[index].value = data.projectedData[index].total / data.projectedData[index].count || 0;
                  data.baselineData[index].value = data.baselineData[index].total / data.baselineData[index].count || 0;
                  data.measuredData[index].value = data.measuredData[index].total / data.measuredData[index].count || (index > 0 ? data.measuredData[index - 1].value : 0);
              });

              data.measuredValues = data.measuredData.map(data => data.value);
              data.baselineValues = data.baselineData.map(data => data.value);
              data.projectedValues = data.projectedData.map(data => data.value);

              const allValues = data.baselineValues.concat(data.measuredValues, data.projectedValues);
              data.range = d3.extent(allValues);

              const highestYtick = data.range[1] + 0.2;
              data.yTickInterval = highestYtick / 4;
              data.yTickValues = [0, data.yTickInterval, data.yTickInterval * 2, data.yTickInterval * 3, highestYtick];

              data.enterData = [
                  {category: 'baseline', displayName: 'Baseline', color: data.baselineColor, opacity: data.baselineFillOpacity, data: data.baselineData},
                  {category: 'projected', displayName: 'Projected', color: data.projectedColor, opacity: data.projectedFillOpacity, data: data.projectedData},
                  {category: 'measured', displayName: 'Measured', color: data.measuredColor, opacity: data.measuredFillOpacity, data: data.measuredData}
              ];
          
          
          // if '/' in unit's name, format xAxisUnitsLabel to have spaces around '/' and unitsLabel (for tooltip) not to
          let indexOfSlash = data.unitsLabel.indexOf('/');
        data.xAxisUnitsLabel = data.unitsLabel;

        if (indexOfSlash > 0) {
            if (data.unitsLabel[indexOfSlash + 1] === ' ') data.unitsLabel.splice(indexOfSlash + 1, 1);
            if (data.unitsLabel[indexOfSlash - 1] === ' ') data.unitsLabel.splice(indexOfSlash - 1, 1);
            indexOfSlash = data.unitsLabel.indexOf('/');
            data.xAxisUnitsLabel = data.unitsLabel;
            if (data.unitsLabel[indexOfSlash + 1] !== ' ') data.xAxisUnitsLabel = data.unitsLabel.slice(0,indexOfSlash + 1) + ' ' + data.unitsLabel.slice(indexOfSlash + 1);
            if (data.unitsLabel[indexOfSlash - 1] !== ' ') data.xAxisUnitsLabel = data.xAxisUnitsLabel.slice(0,indexOfSlash) + ' ' + data.xAxisUnitsLabel.slice(indexOfSlash);
        }
          
  
          return data;
      })
      .catch(err => console.error('Error (ord info promise rejected): ' + err));
  };




  ////////////////////////////////////////////////////////////////
  // Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
  ////////////////////////////////////////////////////////////////

  const renderWidget = (widget, data) => {
      /* RENDER INITIALIZATION */

      const svg = widget.svg;
      
      d3.select(svg.node().parentNode).style('background-color', data.backgroundColor)

      
      // delete leftover elements from versions previously rendered
      if (!svg.empty()) svg.selectAll('*').remove();
      

                      
      const chartGroup = svg.append('g').attr('class', 'chartGroup').attr('transform', `translate(${data.margin.left}, ${data.margin.top})`);  



/************************************************* ADD ALL SVG ELEMENTS HERE **********************************************************/
      /* SCALES AND GENERATORS */
      const yScale = d3.scaleLinear()  // scaling function
          .domain([0, 0.2 + data.range[1]]) //can be whatever you want the axis to cover
          .range([data.chartHeight, 0]);

      const xScale = d3.scaleTime()  // scaling function
          .domain([parseDate(data.last12Dates[0]), parseDate(data.last12Dates[11])])  // [min, max] data Month-Year's as JS dates
          .range([0, data.chartWidth]);

      const yAxisGenerator = d3.axisLeft(yScale)  // axis generator (axis labels can be left, right, top, bottom in relation to line).
          .tickValues(data.yTickValues)  //Adding 'ticks' gives guidance to D3 for apprx number of ticks you want. It will generate a similar number of ticks that typically makes sense to humans (e.g. 5s or 10s). You can override this and tell it the exact number you want with a setting called tick values
          .tickPadding(10)  // on axisLeft, moves labels further from ticks
          .tickSize(10) //plenty more tick settings out there
          .tickFormat(d => d3.format(`,.${data.precision}f`)(d));

      const xAxisGenerator = d3.axisBottom(xScale) //axis generator
          .tickFormat(d3.timeFormat('%b-%y'));

      const areaPathGenerator = d3.area()  // area generator (generates path element)
          .x((d, i) => xScale(parseDate(d.month + '-' + data.measuredData[i].year)))  //data points on chart will be determined by scaling func, passing in date-parsed data element (i of dataYears) -- so that it matches up with x-axis scale
          .y0(data.chartHeight) //bottom line of area ( where x axis would go for most area charts)
          .y1(d => yScale(d.value)) //top line of area (we'd take d off of the height because y works upside down by default if we did this w/o scale). y(d) is outputting the literal y position the datapoint should be in
          .curve(d3.curveCardinal);

      const topBorderPathGenerator = d3.line()
          .x((d, i) => xScale(parseDate(d.month + '-' + data.measuredData[i].year)))
          .y(d => yScale(d.value))
          .curve(d3.curveCardinal);




      /* PATHS */
      // Groups for Category Paths
      const categoryGroups = chartGroup.selectAll('path')
          .data(data.enterData)
          .enter().append('g').attr('class', d => d.category);

      // Area Paths
      categoryGroups.append('path')
          .attr('d', d => areaPathGenerator(d.data))
          .attr('class', d => d.category + ' area')
          .attr('fill', d => d.color)
          .attr('opacity', d => widget.active && widget.active[d.category] || !widget.active ? d.opacity : 0);
          
      // Top Border For Area Paths
      categoryGroups.append('path')   
          .attr('d', d => topBorderPathGenerator(d.data))
          .attr('class', d => d.category + ' path')
          .attr('stroke', d => d.color)
          .attr('stroke-width', data.areaPathStrokeWidth)
          .attr('opacity', d => widget.active && widget.active[d.category] || !widget.active ? 0.92 : 0)
          .attr('fill', 'none');





      /* TOOLTIPS */
      // (note event listeners that define many tooltip properties are in datapoints section)
      const tooltipGroup = svg.append('g');
      const tooltipRect = tooltipGroup.append('rect')
          .attr('display', 'none')
          .style('position', 'absolute')
          .attr('fill', data.tooltipFill)
          .attr('fill-opacity', '0.9')
          .attr('width', data.tooltipRectWidth)
          .attr('height', data.tooltipRectHeight);

      // tooltips text
      const tooltipText = tooltipGroup.append('text').attr('dominant-baseline', 'hanging').style('font', data.tooltipFont);
      const monthTspan = tooltipText.append('tspan').attr('id', 'monthTspan');
      tooltipText.selectAll('.value')
          .data(data.enterData)
          .enter().append('tspan')
            .attr('class', 'value')
             .attr('id', d => `${d.category}Tspan`)
            .attr('fill', d => d.color);
      const baselineTspan = svg.select('#baselineTspan');
      const projectedTspan = svg.select('#projectedTspan');
      const measuredTspan = svg.select('#measuredTspan');






      /* AXES */
      chartGroup.append('g')
          .attr('class', 'axisY')
          .call(yAxisGenerator);

      chartGroup.append('g')
          .attr('class', 'axisX')
          .attr('transform', `translate(0,${data.chartHeight})`)
          .call(xAxisGenerator);

      svg.selectAll('.axisY text').style('fill', data.yAxisFontColor).style('font', data.yAxisFont);
      svg.selectAll('.axisX text').style('fill', data.xAxisFontColor).style('font', data.xAxisFont);

      chartGroup.append('text')
          .attr("transform", "rotate(-90)")
          .attr('x', 0)
          .attr('y', data.yAxisTitlePadding)
          .attr("text-anchor", "middle")
          .attr('dominant-baseline', 'hanging')
          .style('font', data.unitsFont)
          .attr('fill', data.unitsColor)
          .text(data.xAxisUnitsLabel);







      /* DATAPOINTS */
      // groups of datapoints
      const dataPointsGroups = chartGroup.selectAll('circle')
          .data(data.enterData)
          .enter().append('g')
            .attr('class', d => `${d.category} dataPointGroup`)
            .attr('opacity', d => widget.active && widget.active[d.category] || !widget.active ? 1 : 0);

      // datapoints
      dataPointsGroups.selectAll('.circle')
          .data(d => d.data) //get data arrays within each 'enterData' array element
          .enter().append('circle')
              .attr('class', (d, i, node) => `${node[i].parentNode.__data__.category}Circle ${d.month} circle`)
              .attr('fill', (d, i, node) => node[i].parentNode.__data__.color)
              .attr('stroke', 'white')
              .attr('stroke-width', data.dataPointStrokeWidth)
              .attr('cx', (d, i) => xScale(parseDate(d.month + '-' + data.measuredData[i].year)))
              .attr('cy', d => yScale(d.value))
              .attr('r', data.dataPointRadius);

      // rectangles for each month with event listeners to toggle TOOLTIPS and to toggle datapoints' highlighting
      const monthRectWidth = xScale(parseDate(data.measuredData[1].month + '-' + data.measuredData[1].year)) - xScale(parseDate(data.measuredData[0].month + '-' + data.measuredData[0].year));
      chartGroup.selectAll('.monthRect')
          .data(data.measuredData)
          .enter().append('rect')
              .attr('class', d => `monthRect ${d.month}Rect`)
              .attr('height', data.chartHeight)
              .attr('width', monthRectWidth)
              .attr('x', d => xScale(parseDate(d.month + '-' + d.year)) - (monthRectWidth / 2))
              .attr('y', 20)      // 20 rather than 0 so as to include the x axis tick values
              .style('opacity', '0')
              .on('mouseover', function (d, i) {
                  let xPos = Number(d3.select(this).attr('x')) + (data.tooltipRectWidth / 2.5);
                  xPos = xPos < data.margin.left ? data.margin.left + 5: xPos;
                  xPos = xPos + data.tooltipRectWidth > data.margin.left + data.chartWidth ? data.margin.left + data.chartWidth - data.tooltipRectWidth : xPos;
                  const yPos = data.chartHeight + data.margin.top - (data.tooltipRectHeight + 5);
                  svg.selectAll('.' + d.month)
                      .attr('r', data.dataPointRadius * 1.5)
                      .attr('stroke-width', data.dataPointStrokeWidth * 1.5);
                  tooltipRect
                      .attr('display', 'block')
                      .attr('x', xPos - 5) 
                      .attr('y', yPos - 2);
                  monthTspan.text(`${d.month}:`)
                      .attr('x', xPos)
                      .attr('y', yPos - 2);
                  baselineTspan.text(`B: ${d3.format(`,.${data.precision}f`)(data.baselineData[i].value)} ${data.unitsLabel}`)
                      .attr('x', xPos)
                      .attr('y', yPos + data.tooltipPadding);
                  projectedTspan.text(`P: ${d3.format(`,.${data.precision}f`)(data.projectedData[i].value)} ${data.unitsLabel}`)
                      .attr('x', xPos)
                      .attr('y', yPos + (data.tooltipPadding * 2));
                  measuredTspan.text(`M: ${d3.format(`,.${data.precision}f`)(data.measuredData[i].value)} ${data.unitsLabel}`)
                      .attr('x', xPos)
                      .attr('y', yPos + (data.tooltipPadding * 3));
              })
              .on('mouseout', function(d) {
                  svg.selectAll('.' + d.month)
                      .attr('r', data.dataPointRadius)
                      .attr('stroke-width', data.dataPointStrokeWidth);
                  tooltipRect.attr('display', 'none');
                  monthTspan.text('');
                  baselineTspan.text('');
                  projectedTspan.text('');
                  measuredTspan.text('');
              });









      /* LEGEND */
      const legend = chartGroup.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${0, data.chartWidth - data.legendWidth})`);

      // create groups for each category with click listeners to toggle hide and hover listeners to toggle bold text
      const legendCategories = legend.selectAll('g')
          .data(data.enterData)
          .enter().append('g')
              .attr('class', d => `${d.category}Legend category`)
              .attr('transform', (d, i) => `translate(5, ${-data.legendHeight + (data.legendSquareSize * i) + (data.legendPadding * (i + 1)) })`)
              .on('click', d => {
                  if (!widget.active) widget.active = {baseline: true, projected: true, measured: true};
                  const opacity = widget.active[d.category] ? {area: 0, path: 0, dataPoint: 0} : {area: d.opacity, path: 0.92, dataPoint: 1};
                  const legendLineDecoration = widget.active[d.category] ? 'line-through' : 'none';
                  const elements = svg.selectAll(`.${d.category}`);
                  elements.filter('.area').style('opacity', opacity.area);
                  elements.filter('.path').style('opacity', opacity.path);
                  elements.filter('.dataPointGroup').style('opacity', opacity.dataPoint);
                  svg.select(`#${d.category}Text`).style('text-decoration', legendLineDecoration);
                  widget.active[d.category] = !widget.active[d.category];
              })
              .on('mouseover', function(d){
                  svg.select(`#${d.category}Text`).style('font-weight', 'bold');
              })
              .on('mouseout', function(d){
                  svg.select(`#${d.category}Text`).style('font-weight', 'normal');
              });


      // append rect for each category group
      legendCategories.append('rect')
          .attr('height', data.legendSquareSize)
          .attr('width', data.legendSquareSize)
          .attr('fill', d => d.color);

      // append text for each category group
      legendCategories.append('text')
          .attr('id', d => `${d.category}Text`)
          .text(d => d.displayName)
          .attr('x', data.legendSquareSize + 10)
          .attr('y', data.legendSquareSize - 1)
          .attr('fill', data.legendFontColor)
          .style('font', data.legendFont)
          .style('text-decoration', d => widget.active && widget.active[d.category] || !widget.active ? 'none' : 'line-through');

  };

  function render(widget) {
      // invoking setupDefinitions, then returning value from successful promise to renderWidget func
      return setupDefinitions(widget)
          .then(data => {
              renderWidget(widget, data);
          });
  }


  ////////////////////////////////////////////////////////////////
  // Initialize Widget
  ////////////////////////////////////////////////////////////////

  ModernEfficiencyGraph.prototype.doInitialize = function (element) {
      var that = this;
      element.addClass("ModernEfficiencyGraphOuter");

      that.svg = d3.select(element[0]).append('svg')
          .attr('class', 'ModernEfficiencyGraph')
          .attr('top', 0)
          .attr('left', 0)
          .attr('width', "95%")
          .attr('height', "95%");

      that.active = undefined;
      that.getSubscriber().attach("changed", function (prop, cx) { render(that) });
  };


  ////////////////////////////////////////////////////////////////
  // Extra Widget Methods
  ////////////////////////////////////////////////////////////////

  ModernEfficiencyGraph.prototype.doLayout = ModernEfficiencyGraph.prototype.doChanged = ModernEfficiencyGraph.prototype.doLoad = function () { render(this); };

  /* FOR FUTURE NOTE: 
  ModernEfficiencyGraph.prototype.doChanged = function (name, value) {
        if(name === "value") valueChanged += 'prototypeMethod - ';
        render(this);
  };
  */

  ModernEfficiencyGraph.prototype.doDestroy = function () {
      this.jq().removeClass("ModernEfficiencyGraphOuter");
  };

  return ModernEfficiencyGraph;
});

