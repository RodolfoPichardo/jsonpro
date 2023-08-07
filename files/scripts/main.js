window.onload = function(e) {
	let code_pre = document.getElementById("code");
	code_pre.addEventListener("input", function(event) {
		recomputeLines(event.target);
	});

	let lineHighlight = document.getElementById('line-highlight');
	code_pre.addEventListener('keyup', function(event) {
		const line_number = getCaretPosition(code_pre);
		console.log(line_number);
	});
};

function getCaretPosition(element) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const caretPosition = range.startOffset;
  return caretPosition;
}



/**
 ****************************************************** 
 *              HELPER FUNCTIONS 
 ******************************************************
 */
var recomputeLines = function(dom) {
	number_of_lines = calculateLines(dom);
	
	// FIXME is this actually better than just always recomputing all the lines
	if(dom.number_of_lines <= number_of_lines) {
		let i = dom.number_of_lines + 1 ?? 1;

		let text = '';
		for(; i <= number_of_lines; i++) {
			text += '\n' + i;
		}

		document.getElementById("lines").innerText += text;
	} else {
		let text = '1';
		for(let i = 2; i <= number_of_lines; i++) {
			text += '\n' + i;
		}

		document.getElementById("lines").innerText = text;
	}
	dom.number_of_lines = number_of_lines;
};

var calculateLines = function(dom) {
	if(dom.scrollHeight > dom.parentElement.clientHeight) {
		const style = (window.getComputedStyle)?  window.getComputedStyle(dom) : dom.currentStyle;
		
		const paddingTop = parseFloat(style.getPropertyValue("padding-top")),
		      paddingBottom = parseFloat(style.getPropertyValue("padding-bottom")),
		      effectiveHeight = dom.scrollHeight - paddingTop - paddingBottom;
    		    	const lines = effectiveHeight / parseFloat(style.lineHeight);
    		    	return Math.round(lines);
	} else {
		let lines = dom.innerText.split(/\r|\r\n|\n/).length;
		if(dom.innerText.endsWith('\n')) lines--;
		const count = Math.max(lines, 1);
		return count;
	}
};



/*var getCaretPosition = function(){
    const range = document.getSelection().getRangeAt(0);
    const node = range.startContainer;
    console.log(range.startContainer.getBoundingClientRect());
    const offset = range.startOffset;
    const scrollOffset = document.querySelector("main").scrollTop;


    //let bottomPosition,  fakeRange;
    if (offset > 0) {
    	// Create fake selection to get the actual size
        const fakeRange = document.createRange();
        fakeRange.setStart(node, (offset - 1));
        fakeRange.setEnd(node, range.startOffset);
        const position = fakeRange.getBoundingClientRect().bottom;
        return position + scrollOffset; //window.pageYOffset;;
    } else {
    	return -1000; // TODO return line one
    }
};*/