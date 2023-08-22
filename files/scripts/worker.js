onmessage = function(e) {
  const text = e.data;
  const parser = new JSONParser(text);
  parser.run();
  parser.sendBuffer();
}

class Buffer {
  constructor() {
    this.success = true;
    this.indent_level = 0;
    this.line_number = 0;
    this.position = 0;
    this.basic_size = 0;
    this.emptyResponse();
    this.last_modified = {
      punctuation: -1,
      attr: -1,
      string: -1,
      number: -1,
      literal: -1
    }
  }

  add(text, target) {
    if(this.last_modified[target] !== this.line_number) {
      this.response[target] += '\t'.repeat(this.indent_level) + ' '.repeat(this.position);
      this.last_modified[target] = this.line_number;
    }
    if(this.last_modified.code !== this.line_number) { // New line detected
      this.response.code += '\t'.repeat(this.indent_level);
      this.last_modified.code = this.line_number;
    }
    if(target !== 'punctuation' && this.last_modified.punctuation === this.line_number) {
      this.response.punctuation += ' '.repeat(text.length);
    }

    this.response[target] += text;
    this.response.code += text;
    this.position += text.length;
    this.basic_size += text.length;
  }

  addNewLine(text, target, indent=false) {
    this.add(text, target);
    if(indent) this.indent_level++;
    this._addNewLine();
  }

  addNewLineBefore(text, target) {
    this.indent_level--;
    this._addNewLine();
    this.add(text, target);
  }

  _addNewLine() {
    this.line_number++;
    for(const prop in this.response) {
      this.response[prop] += '\n';
    }
    this.position = 0;
  }

  flush() {
    this.sendBuffer();
    this.emptyResponse();
    this.basic_size = 0;
  }

  isFull() {
    return this.basic_size > 4096;
  }

  sendBuffer() {
    postMessage({
      lines: this.line_number + 1,
      data: this.response
    });
  }

  emptyResponse() {
    this.response = {
      punctuation: '',
      attr: '',
      string: '',
      number: '',
      literal: '',
      code: '',
    };
  }
}




class JSONParser {
  constructor(str) {
    this.jsonText = str;
    this.index = 0;
    this.buffer = new Buffer();
  }

  run() {
    this.handleWhitespaces();
    
    switch(this.jsonText.charAt(this.index)) {
      case '{':
        this.buffer.addNewLine('{', 'punctuation', true);
        this.index++;
        this.handleObject();
        break;
      case '[':
        this.buffer.add('[', 'punctuation'); // FIXME don't add new line
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
          this.buffer.addNewLine(',', 'punctuation');
          this.index++;
          this.handleWhitespaces();
          char = this.jsonText.charAt(this.index);
        }
      }
      
      switch(char) {
      case '"': // New key value
        this.index++;
        this.handleKey(); // FIXME return keylength
        this.handleWhitespaces();
        if(this.jsonText.charAt(this.index) !== ':') {
          this.error("Expecting sepator got " + this.jsonText.charAt(this.index) + " at position " + this.index);
        }
        
        this.buffer.add(':', 'punctuation');
        this.index++;
        this.handleWhitespaces();
        this.handleValue();
        expectValueSeparator = true;
        break;
      case "}": // End of object
        this.buffer.addNewLineBefore('}', 'punctuation');
        this.index++;
        this.sendBufferIfFull();
        return;
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
      this.buffer.add(']', 'punctuation');
      this.sendBufferIfFull();
      this.index++;
      return;
    }
    if(expectValueSeparator) {
      if(char === ',') {
        this.buffer.add(',', 'punctuation');
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
      this.buffer.addNewLine('{', 'punctuation', true);
      this.index++;
      this.handleObject();
      break;
    case '[':
      this.buffer.add('[', 'punctuation');
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

    this.buffer.add(word, 'literal');

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

    this.buffer.add(number, 'number');
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
        this.buffer.add('"' + str + '"', className);
        this.index++;
        return;
      }

      escaped = !escaped && char === '\\';
    }

    this.error("Reached end of file while expecting end of string");
  }


  /* Helper functions */
  sendBufferIfFull() {
    if(this.buffer.isFull()) {
      this.sendBuffer();
    }
  }

  sendBuffer() {
    this.buffer.flush();
  }

  error(str) {
    throw new Error(str);
  }

}
