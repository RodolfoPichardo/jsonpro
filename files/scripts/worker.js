onmessage = function(e) {
  const text = e.data;
  const parser = new JSONParser(text);
  parser.run();
  parser.sendBuffer();

  /*const responseBuffer = {
    punctuation: '{\n                  :\n}',
    attr: '\n    "instructions"',
    string: '\n                   "Paste your JSON here"',
    number: '',
    literal: ''
  };

  postMessage(responseBuffer);*/


}


class JSONParser {
  constructor(str) {
    this.jsonText = str;
    this.index = 0;
    //this.lineNumber = 0;
    this.responseBuffer = {
      punctuation: '',
      attr: '',
      string: '',
      number: '',
      literal: '',
      //code: '',
    }
  }

  run() {
    this.handleWhitespaces();
    
    switch(this.jsonText.charAt(this.index)) {
      case '{':
        this.addNewLine('{', 'punctuation');
        this.index++;
        this.handleObject();
        break;
      case '[':
        this.addNewLine('[', 'punctuation');
        this.index++;
        this.handleArray();
        break;
      default:
        this.error("Unexpected charater when expecting either { or [. " + this.jsonText.charAt(this.index) + " at position " + this.index);
    }

    this.handleWhitespaces();

    /*if(offset !== undefined && offset !== text.length) {
      error("Unexpected character when expecting end of file: " + text.charAt(offset) + " at position " + offset);
    }*/
  }

  handleObject() {
    this.handleWhitespaces();

    let expectValueSeparator = false;
    for(; this.index < this.jsonText.length;) {// i++) {
      this.handleWhitespaces();
      let char = this.jsonText.charAt(this.index);
      if(expectValueSeparator) {
        
        if(char === '}') {

        } else if(char !== ',') {
          this.error("Expected value separator, but got " + char.charCodeAt(0) + " at position " + this.index);
        } else {
          this.addNewLine(',', 'punctuation');
          this.index++;
          this.handleWhitespaces();
          char = this.jsonText.charAt(this.index);
        }
      }
      
      switch(char) {
      case '"': // New key value
        this.responseBuffer.attr += '"';
        this.index++;
        this.handleKey(); // FIXME return keylength
        this.handleWhitespaces();
        if(this.jsonText.charAt(this.index) !== ':') {
          this.error("Expecting sepator got " + this.jsonText.charAt(this.index) + " at position " + this.index);
        }
        
        this.responseBuffer.punctuation += ':';
        this.responseBuffer.number += ' ';
        this.responseBuffer.string += ' ';
        this.responseBuffer.literal += ' ';
        this.index++;
        
        this.handleWhitespaces();
        this.handleValue();
        expectValueSeparator = true;
        break;
      case "}": // End of object
        this.addNewLine('}', 'punctuation');
        this.index++;
        this.sendBufferIfFull();
        return;
        /*if(responseBuffer.length >= 1000) {
          //await sleep(2000);
          postMessage(responseBuffer);
          responseBuffer.length = 0;
        }*/
        //this.index++;
      default:
        this.error("Exception either a new member or the end of the object, but got " + char + " at postion " + this.index);
      }

    }
  }

  /**
 * Parse JSON Array
 * array = begin-array [ value *( value-separator value ) ] end-array
 */
handleArray() {
  this.handleWhitespaces();

  let expectValueSeparator = false;
  for(; this.index < this.jsonText.length;){// i++) {
    const char = this.jsonText.charAt(this.index);
    if(char === ']') {
      this.responseBuffer.punctuation += ']';
      this.sendBufferIfFull();
      this.index++;
      return;
    }
    if(expectValueSeparator) {
      if(char === ',') {
        this.responseBuffer.punctuation += ',';
        this.index++;
        this.handleWhitespaces();
      } else {
        error("Expecting value separator but found " + char + " at position " + this.index);
      } 
    }
    this.handleValue();
    this.handleWhitespaces();
    expectValueSeparator = true;
  }

  error("Unexpected end of file while waiting for the end of the array");
}

  handleWhitespaces() {
    for(; this.index < this.jsonText.length; this.index++) {
      const char = this.jsonText.charAt(this.index);
      if(char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        continue;
      } else {
        return;
      }
    }
  }

  /**
   * Parse value
   * 
   * value = false / null / true / object / array / number / string
   */
  handleValue() {
    this.handleWhitespaces();
    const char = this.jsonText.charAt(this.index);

    switch(char) {
    case 'n': // null
    case 'f': // false
    case 't': // true
      this.handleKeyword();
      break
    case '{':
      this.addNewLine('{', 'punctuation');
      this.index++;
      this.handleObject();
      break;
    case '[':
      this.addNewLine('[', 'punctuation');
      this.index++;
      this.handleArray();
      break;
    case '-':
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      this.handleNumber();
      break;
    case '"':
      this.responseBuffer.string += '"';
      this.index++;
      this.handleString();
      break;
    default:
      this.error("Unexpected character when expecting value. " + char + " at position " + this.index);
    }
  }

  handleKeyword() {
    let word;
    switch(this.jsonText.charAt(this.index)) {
    case 't':
      word = 'true';
      break;
    case 'f':
      word = 'false';
      break;
    case 'n':
      word = 'null';
      break;
    default:
      this.error("Unknown keyword at position " + this.index);
    }

    for(let i = 1; i < word.length; i++) {
      if(word.charAt(i) !== this.jsonText.charAt(i + this.index)) {
        this.error("Unknown keyword at position " + this.index);
        break;
      }
    }

    this.responseBuffer.literal += word;
    this.responseBuffer.punctuation += ' '.repeat(word.length);

    this.index += word.length;
  }


  /**
   * Parse number
   * number = [ minus ] int [ frac ] [ exp ]
   * decimal-point = %x2E       ; .
   * digit1-9 = %x31-39         ; 1-9
   * e = %x65 / %x45            ; e E
   * exp = e [ minus / plus ] 1*DIGIT
   * frac = decimal-point 1*DIGIT
   * int = zero / ( digit1-9 *DIGIT )
   * minus = %x2D               ; -
   * plus = %x2B                ; +
   * zero = %x30                ; 0
   */
  handleNumber() {
    let number = '';
    if(this.jsonText.charAt(this.index) === '-') {
      number = '-'
      this.index++;
    }

    // int
    number += this.handleInteger();

    // frac
    if(this.jsonText.charAt(this.index) === '.') {
      this.index++;
      number += '.' + this.handleOneStarDigits();
    }

    // exp
    // TODO separate it into helper function
    const char = this.jsonText.charAt(this.index);
    if(char === 'e' || char === 'E') {
      const sign = this.jsonText.charAt(++this.index);
      if(sign === '+' || sign === '-') {
        number += char + sign;
        this.index++;
      } else {
        this.error("Expected sign to come after the exp on the number, got " + sign + "instead at position " + this.index);
      }

      number += this.handleOneStarDigits();
    }

    this.responseBuffer.number += number;
    this.responseBuffer.punctuation += ' '.repeat(number.length);
  }

  /**
   * Helper function to handle Integers
   * int = zero / ( digit1-9 *DIGIT )
   * 
   */
  handleInteger() {
    if(this.jsonText.charAt(this.index) === '0') {
      this.index++;
      return '0';
    }

    return this.handleOneStarDigits();
  }

  /**
   * Helper function to get 1*DIGIT
   */
  handleOneStarDigits() {
    let digits = '';

    for(; this.index < this.jsonText.length; this.index++) {
      const char = this.jsonText.charAt(this.index);
      switch(char) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          digits += char;
          break;
        default:
          if(digits === '') {
            this.error("Unable to parse number near position " + i);
          } else {
            return digits;
          }
      } 
    }

  }


  handleKey() {
    this.handleString('attr');
  }

  /**
   * Parse string as defined by json
   * string = quotation-mark *char quotation-mark
   * 
   */
  handleString(className="string") {
    let escaped = false;
    let str = '';
    for(; this.index < this.jsonText.length; this.index++) {
      let char = this.jsonText.charAt(this.index);
      
      if(escaped || char != '"') {
        str += char !== '\\'? char: char+char;
      } else {
        this.responseBuffer[className] += str + '"';
        const offset = ' '.repeat(str.length + 2)
        this.responseBuffer.punctuation += offset;
        this.responseBuffer.number += offset;
        this.responseBuffer.string += offset;
        this.responseBuffer.literal += offset;
        this.index++;
        return;
      }

      escaped = !escaped && char === '\\';
    }

    this.error("Reached end of file while expecting end of string");
  }


  /* Helper functions */

  addNewLine(text, target) {
    this.responseBuffer[target] += text;
    for(const prop in this.responseBuffer) {
      this.responseBuffer[prop] += '\n';
    }
  }

  sendBufferIfFull() {
    if(this.responseBuffer.punctuation.length > 512) {
      this.sendBuffer();
    }
  }

  sendBuffer() {
    postMessage(this.responseBuffer);
    this.responseBuffer.punctuation = '';
    this.responseBuffer.number = '';
    this.responseBuffer.string = '';
    this.responseBuffer.literal = '';
    this.responseBuffer.attr = '';
  }

  error(str) {
    throw new Error(str);
  }

}
