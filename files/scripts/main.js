const isChrome = navigator.userAgent.includes("Chrome");

window.onload = function(e) {
	let editor = document.getElementById("code");
	if(!isChrome) {
		editor.innerHTML = '&#8203;';
	}

	editor.addEventListener("input", function(event) {
		recomputeLines(event.target);
	});

	editor.addEventListener('keydown', function(event) {
		// TODO SCROLL
	    if (event.keyCode == 13) { // Enter key
	    	/*const newLine = isChrome? '\n\n': '\n';
	    	document.execCommand('insertHTML', false, newLine);*/
	    	event.preventDefault();
	    	return false;
	    } else if(event.keyCode >= 33 && event.keyCode <= 40) {
	    	; // Do nothing
	    } else {
	    	event.preventDefault();
	    	return false;
	    }
	    
 	});
};

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