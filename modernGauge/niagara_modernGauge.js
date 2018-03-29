define(['bajaux/Widget', 'bajaux/mixin/subscriberMixIn', 'nmodule/tekScratch/rc/d3/d3.min'], function(Widget, subscriberMixIn, d3) {
    "use strict";
  
  ////////////////////////////////////////////////////////////////
  // Define Widget Constructor & Add Exposed Properties
  ////////////////////////////////////////////////////////////////
    let modernGaugeCounter = 0;


    var ModernGauge = function() {
      var that = this;
      Widget.apply(this, arguments);
  
      that.properties().addAll([
          {
              name: 'gaugeTitle',
              value: 'Gauge Title'
          },
          {
              name: 'efficiencyGauge',
              value: true
          },
          {
              name: 'baselineEfficiencyThreshold',
              value: 1.20
          },
          {
              name: 'targetEfficiencyThreshold',
              value: 0.80
          },
          {
              name: 'minVal',
              value: 0
          },
          {
              name: 'maxVal',
              value: 2
          },
          {
              name: 'borderCircleWidth',
              value: 7
          },
          {
              name: 'borderPadding',
              value: 2
          },
          {
              name: 'additionalGaugeArcThickness',
              value: 1
          },
          {
              name: 'titleFont',
              value: '11.0pt Nirmala UI',
              typeSpec: 'gx:Font'
          },
          {
              name: 'unitsFont',
              value: '11.0pt Nirmala UI',
              typeSpec: 'gx:Font'
          },
          {
              name: 'valueFont',
              value: 'bold 18.0pt Nirmala UI',
              typeSpec: 'gx:Font'
          },
          {
              name: 'borderCircleColor',
              value: '#ff474747',
              typeSpec: 'gx:Color'
          },
          {
              name: 'backgroundColor',
              value: '#ffffff',
              typeSpec: 'gx:Color'
          },
          {
              name: 'borderCircleFillColor',
              value: '#ffffff',
              typeSpec: 'gx:Color'
          },
          // if efficiencyGauge is true, will utilize efficiencyColorScale for arc fill (all 3 gaugeArcColors), else only nominalGaugeArcColor
          {
              name: 'nominalGaugeArcColor',
              value: '#21A75D',
              typeSpec: 'gx:Color'
          },
          {
              name: 'subTargetGaugeArcColor',
              value: '#ffd829',
              typeSpec: 'gx:Color'
          },
          {
              name: 'subBaselineGaugeArcColor',
              value: '#c01616',
              typeSpec: 'gx:Color'
          },
          {
              name: 'titleColor',
              value: '#ff404040',
              typeSpec: 'gx:Color'
          },
          {
              name: 'unitsColor',
              value: '#ff404040',
              typeSpec: 'gx:Color'
          },
          {
              name: 'valueColor',
              value: '#ff000000',
              typeSpec: 'gx:Color'
          }
      ]);
  
      subscriberMixIn(that);
    };
  
    ModernGauge.prototype = Object.create(Widget.prototype);
    ModernGauge.prototype.constructor = ModernGauge;
  
  
  ////////////////////////////////////////////////////////////////
  // /* SETUP DEFINITIONS */
  ////////////////////////////////////////////////////////////////
  
      const props = [
              'gaugeTitle', 'efficiencyGauge', 'baselineEfficiencyThreshold',
              'targetEfficiencyThreshold', 'minVal', 'maxVal',
              'borderCircleWidth', 'borderPadding', 'additionalGaugeArcThickness', 'titleFont',
              'unitsFont', 'valueFont', 'borderCircleColor', 'backgroundColor', 'borderCircleFillColor',
              'nominalGaugeArcColor', 'subTargetGaugeArcColor', 'subBaselineGaugeArcColor', 'titleColor',
              'unitsColor', 'valueColor'
      ];
      

      const setupDefinitions = widget => {
        let cx, cy, width, height, borderCircleRadius,startAngle,endAngle,gaugeArcOuterRadius,
        gaugeArcInnerRadius, minValForArc, maxValForArc, valForGaugeArc, minVal, maxVal,
        efficiencyColorScale, angleScale, gaugeArcGenerator, titleArcGenerator,
        unitsArcGenerator, arcTween;

        const data = {};
        
          // FROM USER // 
          props.forEach(prop => {data[prop] = widget.properties().getValue(prop);});
      
          const jq = widget.jq();
          width = jq.width() - 2 || 300;
          height = jq.height() - 2 || 300;
      
           // CALCULATED OR HARD-CODED DEFINITIONS //
          data.lastValue = widget.valToStartArcTransition;
          cx = width / 2;
          cy = height / 2;
          borderCircleRadius = height < width ? (height / 2.5) - data.borderCircleWidth : (width / 2.5) - data.borderCircleWidth;
          // angles are measured in radians (pi * 2 radians === full circle, so in radians, 0 === 2 * pi)
          startAngle =  - Math.PI;
          endAngle = Math.PI;
          gaugeArcOuterRadius = borderCircleRadius - (0.1 * borderCircleRadius) - data.borderPadding;
          gaugeArcInnerRadius = gaugeArcOuterRadius - (0.17 * borderCircleRadius) - data.additionalGaugeArcThickness;
          
          // sets value data
          let widgetValue = widget.value();
          data.units = '';
          data.precision = 2;
          data.value = 0;
          
          if (widgetValue) {
              // Handle any Component that has an 'out' Property.
              if (widgetValue.getType().isComponent() && widgetValue.has('out')) {
                data.value = widgetValue.get('out').get('value');
              }
              
              // Parse out the necessary facets.
              if (widgetValue.getType().isComponent() && widgetValue.has('facets')) {
                  let facets = widgetValue.get('facets');
                  data.units = facets.get('units', '');
                  data.precision = facets.get('precision', 2);
              }
          }

          // implements value limit for gauge arc display so that never completely empty
          valForGaugeArc = data.value;
          minValForArc = data.minVal + ((data.maxVal - data.minVal) * (data.efficiencyGauge ? 0.95 : 0.05));
          maxValForArc = data.maxVal - ((data.maxVal - data.minVal) * (data.efficiencyGauge ? 0.97 : 0.03));
          if (data.efficiencyGauge) {
              if (data.value > minValForArc) {
                  valForGaugeArc = minValForArc;
              }
              if (data.value < maxValForArc) {
                  valForGaugeArc = maxValForArc;
              }
          } else {
              if (data.value < minValForArc) {
                  valForGaugeArc = minValForArc;
              }
              if (data.value > maxValForArc) {
                  valForGaugeArc = maxValForArc;
              }
          }
          
          // to provide start point for next transition to use
          widget.valToStartArcTransition = valForGaugeArc;
          
          // if efficiencyGauge marked true, inverts min and max vals
          [minVal,maxVal] = data.efficiencyGauge ? [data.maxVal,data.minVal] : [data.minVal,data.maxVal];
          
          // func returns which color arc fill should be based on curr val, efficiency thresholds, and selected arc colors for up to baseline, up to target, & nominal vals
          efficiencyColorScale = currentValue => {
              if (currentValue >= data.baselineEfficiencyThreshold) return data.subBaselineGaugeArcColor;
              if (currentValue >= data.targetEfficiencyThreshold) return data.subTargetGaugeArcColor;
              return data.nominalGaugeArcColor;
          };
          // returns scaling func that returns angle in radians for a value
          angleScale = d3.scaleLinear()
              .domain([minVal, maxVal])
              .range([startAngle, endAngle]);
          
          // Arc Generators return d values for paths
          gaugeArcGenerator = d3.arc()
              .startAngle(startAngle)  
              .innerRadius(gaugeArcInnerRadius)
              .outerRadius(gaugeArcOuterRadius)
              .cornerRadius('10'); // round edges of path
          
          titleArcGenerator = d3.arc()
              .startAngle(startAngle)
              .endAngle(endAngle)
              .innerRadius(borderCircleRadius)
              .outerRadius(borderCircleRadius + data.borderCircleWidth);
          
          unitsArcGenerator = d3.arc()
              .startAngle(endAngle)
              .endAngle(startAngle)
              .innerRadius(gaugeArcInnerRadius - (gaugeArcInnerRadius * 0.05))
              .outerRadius(gaugeArcInnerRadius - (gaugeArcInnerRadius * 0.05));
          
          /* func that returns func that returns return val of gaugeArcGenerator invoked on data with
              'end angle' property of interpolated start & end end angles for drawing arc transition */
          arcTween = newAngle => datum => t => {
              datum.endAngle = d3.interpolate(datum.endAngle, newAngle)(t);
              return gaugeArcGenerator(datum);
          };
          const tempObj = {
            cx, cy, width, height, borderCircleRadius,startAngle,endAngle,gaugeArcOuterRadius,
            gaugeArcInnerRadius, minValForArc, maxValForArc, valForGaugeArc, minVal, maxVal,
            efficiencyColorScale, angleScale, gaugeArcGenerator, titleArcGenerator,
            unitsArcGenerator, arcTween
          }
          Object.keys(tempObj).forEach(prop => {data[prop] = tempObj[prop]});
          return data;
      };
  
  
  
  
  ////////////////////////////////////////////////////////////////
  // Render Widget (invoke setupDefinitions() and append D3 elements into SVG)
  ////////////////////////////////////////////////////////////////
  
      function render(widget) {
        
        function renderWidget (widget, data) {
            let {
                cx, cy, width, height, borderCircleRadius,startAngle,endAngle,gaugeArcOuterRadius,
                gaugeArcInnerRadius, minValForArc, maxValForArc, valForGaugeArc, minVal, maxVal,
                efficiencyColorScale, angleScale, gaugeArcGenerator, titleArcGenerator,
                unitsArcGenerator, arcTween
            } = data;
            
            data.lastValue = data.lastValue || data.lastValue === 0 ? data.lastValue : minValForArc;
            
            const svg = widget.svg;

            d3.select(svg.node().parentNode).style('background-color', data.backgroundColor)


            // delete leftover elements from versions previously rendered
            if (!svg.empty()) svg.selectAll("*").remove();
            

            const borderCircle = svg.append('circle')
                .attr('id', 'borderCircle')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', borderCircleRadius)
                .attr('fill', data.borderCircleFillColor)
                .attr('stroke', data.borderCircleColor)
                .attr('stroke-width', data.borderCircleWidth);
                
            const valueOutput = svg.append('text')
                .attr('class', 'valueOutput')
                .attr('x', cx)
                .attr('y', cy)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('fill', data.valueColor)
                .style('font', data.valueFont)
                // formats output num using precision from value facets
                .text(d3.format(`,.${data.precision}f`)(data.value));
            
            const chartGroup = svg.append('g')
                .attr('class', 'chartGroup')
                .attr('transform', `translate(${cx}, ${cy})`);
            


            const gaugeArc = chartGroup.append('path')
                .attr('id', 'gaugeArc')
                .datum({endAngle: angleScale(data.lastValue)})
                // fill nominal color for non-efficiency gauge or 3 color scale for efficiency gauge. Starts with min val color prior to transition
                .attr('fill', data.efficiencyGauge ? efficiencyColorScale(data.lastValue) : data.nominalGaugeArcColor)
                .attr('d', gaugeArcGenerator(angleScale(data.lastValue)))
                .transition()
                    .duration(1000)
                    // if efficiency graph, transition from min val scale color to actual val's scale color
                    .attr('fill', data.efficiencyGauge ? efficiencyColorScale(data.value) : data.nominalGaugeArcColor)
                    // gradually transition end angle from minValForArc to true val angle
                    .attrTween('d', arcTween(angleScale(valForGaugeArc)));
            
            const titlePath = chartGroup.append('path')
                .attr('id', widget.uniqueId + '_titlePath')
                .attr('d', titleArcGenerator())
                .attr('fill', 'none');
            
            const unitsPath = chartGroup.append('path')
                .attr('id', widget.uniqueId + '_unitsPath')
                .attr('d', unitsArcGenerator())
                .attr('fill', 'none');
            
            const titleOutput = chartGroup.append("text").append("textPath")
                .attr("xlink:href", '#' + widget.uniqueId + '_titlePath') // ID of path text follows
                .style("text-anchor","middle")
                .attr("startOffset", "20%")
                .style('font', data.titleFont)
                .attr('fill', data.titleColor)
                .text(data.gaugeTitle);
            
            const unitsOutput = chartGroup.append("text").append("textPath")
                .attr("xlink:href", '#' + widget.uniqueId + '_unitsPath') // ID of path text follows
                .style("text-anchor","end")
                .attr("startOffset", "50%")
                .style('font', data.unitsFont)
                .attr('fill', data.unitsColor)
                .text(data.units);
        }
        
        const theData = setupDefinitions(widget);
        renderWidget(widget, theData);
        
      }
    
    
  ////////////////////////////////////////////////////////////////
  // Initialize Widget
  ////////////////////////////////////////////////////////////////
  
      ModernGauge.prototype.doInitialize = function(element) {
          var that = this;

          element.addClass("ModernGaugeOuter");
      
          that.svg = d3.select(element[0]).append('svg')
              .attr('class', 'ModernGauge')
              .attr('top', 0)
              .attr('left', 0)
              .attr('width', "95%")
              .attr('height', "95%");
      
          that.uniqueId = 'ModernGauge_' + modernGaugeCounter;
          modernGaugeCounter++;
          
		  that.getSubscriber().attach("changed", function(prop, cx) {render(that);});
          
          render(that);
      };
  
  
  ////////////////////////////////////////////////////////////////
  // Extra Widget Methods
  ////////////////////////////////////////////////////////////////
  
      ModernGauge.prototype.doLayout = ModernGauge.prototype.doChanged = ModernGauge.prototype.doLoad = function() {render(this);};
      
      /* FOR FUTURE NOTE: 
      ModernGauge.prototype.doChanged = function (name, value) {
      	if(name === "value") valueChanged += 'prototypeMethod - ';
      	render(this);
      };
      */ 
      
      ModernGauge.prototype.doDestroy = function() {this.jq().removeClass("ModernGaugeOuter");};
  
      return ModernGauge;
  });
  
  