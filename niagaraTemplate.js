define(['bajaux/Widget', 'bajaux/mixin/subscriberMixIn', 'nmodule/tekScratch/rc/d3/d3.min'], function (Widget, subscriberMixIn, d3) {
	"use strict";

	////////// Hard Coded Defs //////////

	const getTextWidth = (text, font) => {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		context.font = font;
		const width = context.measureText(text).width;
		d3.select(canvas).remove();
		return width;
	};
	const formatIntoPercentage = d3.format('.0%');
	const getJSDateFromTimestamp = d3.timeParse('%d-%b-%y %I:%M:%S.%L %p UTC%Z');



	////////////////////////////////////////////////////////////////
	// Define Widget Constructor & Exposed Properties
	////////////////////////////////////////////////////////////////

	var MyWidget = function () {
		var that = this;
		Widget.apply(this, arguments);

		that.properties().addAll([
			{
        name: 'backgroundColor',
        value: 'white',
        typeSpec: 'gx:Color'
      },
      {
        name: 'includeCTFs',
        value: true
      },
      {
        name: 'paddingUnderLegendText',
        value: 5
      },
      {
        name: 'systemName',
        value: 'systemName'
      },
      {
        name: 'tooltipFillColor',
        value: '#f2f2f2',
        typeSpec: 'gx:Color'
      },
      {
        name: 'modulePercentFont',
        value: 'bold 26.0pt Nirmala UI',
        typeSpec: 'gx:Font'
      }
		]);



		subscriberMixIn(that);
	};

	MyWidget.prototype = Object.create(Widget.prototype);
	MyWidget.prototype.constructor = MyWidget;



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


		// GET DATA
		return widget.resolve(`station:|slot:/tekWorxCEO/${data.systemName}`)	
			.then(system => system.getNavChildren())	// get children folders of system folder
			.then(folders => {

				// calculated without ords
        
        



				// calculated with ords
        
        



				return data;
			})
			.catch(err => console.error('Error (ord info promise rejected): ' + err));
	};




	////////////////////////////////////////////////////////////////
	// Render Widget (invoke setupDefinitions() and, using returned data, append D3 elements into SVG)
	////////////////////////////////////////////////////////////////

	const renderWidget = (widget, data) => {
    d3.select(widget.svg.node().parentNode).style('background-color', data.backgroundColor);
		// delete leftover elements from versions previously rendered
		if (!widget.svg.empty()) widget.svg.selectAll('*').remove();
		const graphicGroup = widget.svg.append('g').attr('class', 'graphicGroup');




    
    





	};


	function render(widget) {
		// invoking setupDefinitions, then returning value from successful promise to renderWidget func
		return setupDefinitions(widget)
			.then(data => {
				renderWidget(widget, data);
			})
			.catch(err => console.error('render did not complete: ' + err));
	}


	////////////////////////////////////////////////////////////////
	// Initialize Widget
	////////////////////////////////////////////////////////////////

	MyWidget.prototype.doInitialize = function (element) {
		var that = this;
		element.addClass("MyWidgetOuter");

		that.svg = d3.select(element[0]).append('svg')
			.attr('class', 'MyWidget')
			.attr('top', 0)
			.attr('left', 0)
			.attr('width', "100%")
			.attr('height', "98%");

		that.getSubscriber().attach("changed", function (prop, cx) { render(that) });
	};


	////////////////////////////////////////////////////////////////
	// Extra Widget Methods
	////////////////////////////////////////////////////////////////

	MyWidget.prototype.doLayout = MyWidget.prototype.doChanged = MyWidget.prototype.doLoad = function () { render(this); };

	/* FOR FUTURE NOTE: 
	MyWidget.prototype.doChanged = function (name, value) {
		  if(name === "value") valueChanged += 'prototypeMethod - ';
		  render(this);
	};
	*/

	MyWidget.prototype.doDestroy = function () {
		this.jq().removeClass("MyWidgetOuter");
	};

	return MyWidget;
});

