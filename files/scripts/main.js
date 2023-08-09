const isChrome = navigator.userAgent.includes("Chrome");

window.onload = function(e) {
	let editor = document.getElementById("code");
	if(!isChrome && editor.innerText.length === 0) {
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
	    } else if(event.ctrlKey || event.keyCode >= 33 && event.keyCode <= 40) {
	    	; // Allow things to happen
	    } else {
	    	event.preventDefault();
	    	return false;
	    }
	    
 	});

 	editor.addEventListener('paste', function(e) {
 		
		document.getElementById("punctuation").innerText = '';
		document.getElementById("attr").innerText = '';
		document.getElementById("string").innerText = '';
		document.getElementById("number").innerText = '';
		document.getElementById("literal").innerText = '';
		document.getElementById("code").innerText = '';
		
        var text = e.clipboardData.getData('text/plain');
                   
        // Do whatever you want with the text
        console.log("Received:", typeof text, " ", text.length);
        
        parseJson(text, this);
        
        //If you don't want the text pasted in the textarea
        e.preventDefault();
    });

 	parseJson('{"success":true,"instructions":"Paste your JSON here","warning":"This code is on the *very* early development stages"}');
};

/**
 ****************************************************** 
 *              HELPER FUNCTIONS 
 ******************************************************
 */
var recomputeLines = function(dom) {
	number_of_lines = calculateLines(dom);
	
	displayLines(dom, number_of_lines);
};

var displayLines = function(dom, number_of_lines) {
	
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


var parseJson = function(json) {
	const doms = {
		punctuation: document.getElementById("punctuation"),
		attr: document.getElementById("attr"),
		string: document.getElementById("string"),
		number: document.getElementById("number"),
		literal: document.getElementById("literal"),
		code: document.getElementById("code"),
	};

	const lines = document.getElementById("lines");

    if (window.Worker) {
        const jsonParserWorker = new Worker("files/scripts/worker.js");
        jsonParserWorker.onmessage = function(e) {
            for(const prop in e.data.data) {
            	doms[prop].append(e.data.data[prop]);
            }
            displayLines(lines, e.data.lines);
        };
        
        jsonParserWorker.postMessage(json);
    } 
};