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
		let keyCode = e.keyCode || e.which;

		// TODO SCROLL
	    if (event.keyCode == 13) { // Enter key
	    	/*const newLine = isChrome? '\n\n': '\n';
	    	document.execCommand('insertHTML', false, newLine);*/
	    	event.preventDefault();
	    	return false;
	    } else if(event.ctrlKey || keyCode >= 33 && keyCode <= 40 || event.key === 'F11') {
	    	 // Allow things to happen
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

 	parseJson('{"success":true,"instructions":"Paste your JSON here","version":1.3}');

	 /*
 	let searchButton = document.getElementsByClassName("search")[0];
 	let searchNook = document.getElementById("search-nook");
 	let queryInput = document.getElementById("query");
 	let queryButton = document.getElementById("query-button");
 	searchButton.addEventListener("click", function(){
 		searchNook.style.display = 'block';
 		queryInput.focus();
 	});

 	queryButton.addEventListener("click", function(){
 		let query = QSONparse(queryInput.value);
 		console.log(query);
 	});*/
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
	const error = document.getElementById("error-notification");
	error.innerHTML = "";

    if (window.Worker) {
        const jsonParserWorker = new Worker("src/workers/worker.js", { type: 'module' });
		jsonParserWorker.onmessage = (e) => {
			for(const prop in e.data.data) {
            	doms[prop].append(e.data.data[prop]);
            }
            displayLines(lines, e.data.lines);

            if(!e.data.success) {
            	const position = e.data.error.position;
            	const center_offset_for_error = Math.max(0, position - ((e.data.error.expected.length + 9) / 2))

            	const str = '\n'.repeat(e.data.lines -1) + ' '.repeat(position) + '<s>' + e.data.error.actual + '</s>\n' +
            				' '.repeat(position) + '<span>^</span>\n' +
            				' '.repeat(center_offset_for_error) + '<span>Expected ' + e.data.error.expected + '</span>\n';

        		error.innerHTML = str;

        		doms.code.append('\n\n\n\n');

        		error.scrollIntoView(false);
        		console.log(error.parentElement.scrollHeight)
        	}

        };

        jsonParserWorker.postMessage(json);
    } 
};