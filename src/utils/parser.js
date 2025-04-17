class JSONParser {
  constructor(str, output) {
    this.jsonText = str;
    this.index = 0;
    this.output = output;
  }

  run() {
    this.handleWhitespaces();
    
    switch(this.jsonText.charAt(this.index)) {
      case '{':
        this.output.beginObject();
        this.index++;
        this.handleObject();
        break;
      case '[':
        this.output.beginArray();
        this.index++;
        this.handleArray();
        break;
      default:
        this.output.addError(this.index, 
            "Start of array (square bracket) or start of object (curly bracket)",
            this.jsonText.substring(this.index, this.index + 16)
        );
    }

    this.handleWhitespaces();
  }

  /**
   * object = begin-object [ member *( value-separator member ) ]
   *      end-object
   */
  handleObject() {
    this.handleWhitespaces();

    if(this.#isEndObject()) {
      this.#handleEndObject();
      return;
    }

    this.handleMember();

    for(; this.index < this.jsonText.length;) {
      this.handleWhitespaces();
      if(this.#isEndObject()) {
        this.#handleEndObject();
        return;
      }

      this.#handleValueSeparator();
      this.handleWhitespaces();
      this.#handleMember();
    }
  }

  #isEndObject() {
    return this.jsonText.charAt(this.index) === '}';
  }

  #handleEndObject() {
    this.output.endObject();
    this.index++;
    this.sendBufferIfFull();
  }

  #handleValueSeparator() {
    const char = this.jsonText.charAt(this.index);
    if(char !== ',') {
      this.output.addError(this.index, 
        "Value separator (comma)",
        this.jsonText.substring(this.index, this.index + 16)
      );
      return;
    }

    this.output.valueSeparator();
    this.index++;
    this.handleWhitespaces();
  }

  #handleMember() {
    const char = this.jsonText.charAt(this.index);
    if(char != '"') {
      this.output.addError(this.index, "New member or end of object", this.jsonText.substring(this.index, this.index + 16));
      return;
    }

    this.index++;
    this.handleKey();
    this.handleWhitespaces();
    if(this.jsonText.charAt(this.index) !== ':') {
      this.output.addError(this.index, 
        "Member separator (colon)",
        '<b>' + this.jsonText.charAt(this.index)  + '</b>' + this.jsonText.substring(this.index + 1, this.index + 16)
      );
    }
    
    this.output.nameSeparator();
    this.index++;
    this.handleWhitespaces();
    this.handleValue();
  }



  /**
 * Parse JSON Array
 * array = begin-array [ value *( value-separator value ) ] end-array
 */
handleArray() {
  this.handleWhitespaces();

  let expectValueSeparator = false;
  for(; this.index < this.jsonText.length;){
    const char = this.jsonText.charAt(this.index);
    if(char === ']') {
      this.output.endArray();
      this.sendBufferIfFull();
      this.index++;
      return;
    }
    if(expectValueSeparator) {
      if(char === ',') {
        this.output.valueSeparator();
        this.index++;
        this.handleWhitespaces();
      } else {
        this.output.addError(this.index, "Value separator (comma)", this.jsonText.substring(this.index, this.index + 16));
      } 
    }
    this.handleValue();
    this.handleWhitespaces();
    expectValueSeparator = true;
  }

  this.output.addError(this.index, "End of array", "End of file")
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
      this.output.beginObject();
      this.index++;
      this.handleObject();
      break;
    case '[':
      this.output.beginArray();
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
      this.handleString(this.output.string);
      break;
    default:
      this.output.addError(this.index, "Any Value", this.jsonText.substring(this.index, this.index + 16));
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
      this.output.addError(this.index, "Keyword (true, false, or null)", this.jsonText.substring(this.index, this.index + 16))
    }

    for(let i = 1; i < word.length; i++) {
      if(word.charAt(i) !== this.jsonText.charAt(i + this.index)) {
        this.output.addError(this.index, `Keyword ${word}`, this.jsonText.substring(this.index, this.index + 16))
        break;
      }
    }

    this.output.literal(word);

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
    const char = this.jsonText.charAt(this.index);
    if(char === 'e' || char === 'E') {
      const sign = this.jsonText.charAt(++this.index);
      if(sign === '+' || sign === '-') {
        number += char + sign;
        this.index++;
      } else {
        this.output.addError(this.index, 
            "Sign (negative or positive)",
            '<b>' + number  + '</b>' + this.jsonText.substring(this.index, this.index + 16)
          );
      }

      number += this.handleOneStarDigits();
    }

    this.output.number(number);
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
            this.output.addError(this.index, "Digit (0-9)", `${digit}<b>${char}</b>` + this.jsonText.substring(this.index + 1, this.index + 16))
          } else {
            return digits;
          }
      } 
    }

  }


  handleKey() {
    this.handleString(this.output.attr);
  }

  /**
   * Parse string as defined by json
   * string = quotation-mark *char quotation-mark
   * 
   */
  handleString(callback) {
    let escaped = false;
    let str = '';
    for(; this.index < this.jsonText.length; this.index++) {
      let char = this.jsonText.charAt(this.index);
      
      if(escaped || char != '"') {
        str += char !== '\\'? char: char+char;
      } else {
        callback('"' + str + '"');
        this.index++;
        return;
      }

      escaped = !escaped && char === '\\';
    }

    callback('"' + str, className);
    this.output.addError(this.index, "End of string", "End of file");
  }

  error(str) {
    throw new Error(str);
  }

}