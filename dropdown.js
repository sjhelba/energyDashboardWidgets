// FOR SAMPLE
const dropdownSvg = d3.select('#outer').append('svg')
  .attr('class', 'dropdownSvg')
  .attr('height', '500')
  .attr('width', '500')
  .style('background-color', 'white');

let options = ['option1', 'option2', 'option3', 'option4'];
let selection = options[2];
const text = dropdownSvg.append('text')
  .attr('dominant-baseline', 'hanging')
  .text('You have selected ' + selection + '!')

function newSelectionFunc (selectedVal) {
  selection = selectedVal;
  text.text('You have selected ' + selection + '!');
}

// NEEDED
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



// ACTUAL FUNC












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
        .attr('height', open ? dropdownHeight + 6: rowHeight + 6);
      dropdownRows.transition()
        .attr('transform', (d, i) => open ? `translate(0, ${rowHeight * (i + 1)})` : `translate(0,0)`);
    }
    return dropdownGroup;
  }



//INVOKING FUNC SAMPLE
// (arrOfOptions, funcToRunOnSelection, elementToAppendTo, x, y, leftAligned, minDropdownWidth, horizontalPadding, verticalPadding, strokeColor, backgroundFill, hoveredFill, font, textColor, defaultSelection, arrOfArgsToPassInToFuncAfterVal)
makeDropdown(options, newSelectionFunc, dropdownSvg, 5, 50, false, 125, 5, 5, 'black', 'white', '#d5d6d4', '10.0pt Nirmala UI', 'black', selection);  //center aligned
// makeDropdown(options, newSelectionFunc, dropdownSvg, 5, 50, true, 125, 5, 5, 'black', 'white', '#d5d6d4', '10.0pt Nirmala UI', 'black', selection); //left aligned

