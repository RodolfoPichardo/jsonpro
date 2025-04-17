class JSONTokenizer {
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
      return true;
    }

    if(!this.#handleMember()) {
      return false;
    }

    for(; this.index < this.jsonText.length;) {
      this.handleWhitespaces();
      if(this.#isEndObject()) {
        this.#handleEndObject();
        return true;
      }

      if(!this.#handleValueSeparator()) {
        return false;
      }
      this.handleWhitespaces();
      if(!this.#handleMember()) {
        return false;
      }
    }
    return true;
  }

  #isEndObject() {
    return this.jsonText.charAt(this.index) === '}';
  }

  #handleEndObject() {
    this.output.endObject();
    this.index++;
  }

  #handleValueSeparator() {
    const char = this.jsonText.charAt(this.index);
    if(char !== ',') {

      this.output.addError(this.index,
          "Value separator (comma)",
          this.jsonText.substring(this.index, this.index + 16)
      );
      return false;
    }

    this.output.valueSeparator();
    this.index++;
    this.handleWhitespaces();
    return true;
  }

  #handleMember() {
    const char = this.jsonText.charAt(this.index);
    if(char !== '"') {
      this.output.addError(this.index, "New member or end of object", this.jsonText.substring(this.index, this.index + 16));
      return false;
    }

    this.index++;
    this.handleKey();
    this.handleWhitespaces();
    if(this.jsonText.charAt(this.index) !== ':') {
      this.output.addError(this.index,
          "Member separator (colon)",
          '<b>' + this.jsonText.charAt(this.index)  + '</b>' + this.jsonText.substring(this.index + 1, this.index + 16)
      );
      return false;
    }

    this.output.nameSeparator();
    this.index++;
    this.handleWhitespaces();
    return this.handleValue();
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
        this.index++;
        return true;
      }
      if(expectValueSeparator) {
        if(char === ',') {
          this.output.valueSeparator();
          this.index++;
          this.handleWhitespaces();
        } else {
          this.output.addError(this.index, "Value separator (comma)", this.jsonText.substring(this.index, this.index + 16));
          return false;
        }
      }
      if(!this.handleValue()) {
        return false;
      }
      this.handleWhitespaces();
      expectValueSeparator = true;
    }

    this.output.addError(this.index, "End of array", "End of file");
    return false;
  }

  handleWhitespaces() {
    for(; this.index < this.jsonText.length; this.index++) {
      const char = this.jsonText.charAt(this.index);
      if(char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        // continue;
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
        return this.handleKeyword();
      case '{':
        this.output.beginObject();
        this.index++;
        return this.handleObject();
      case '[':
        this.output.beginArray();
        this.index++;
        return this.handleArray();
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
        return this.handleNumber();
      case '"':
        this.index++;
        return this.handleString(this.output.string);
      default:
        this.output.addError(this.index, "Any Value", this.jsonText.substring(this.index, this.index + 16));
        return false;
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
        this.output.addError(this.index, "Keyword (true, false, or null)", this.jsonText.substring(this.index, this.index + 16));
        return false;
    }

    for(let i = 1; i < word.length; i++) {
      if(word.charAt(i) !== this.jsonText.charAt(i + this.index)) {
        this.output.addError(this.index, `Keyword ${word}`, this.jsonText.substring(this.index, this.index + 16))
        return false;
      }
    }


    this.output.literal(word);

    this.index += word.length;
    return true;
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
    let int = this.handleInteger();
    if(int === false) {
      return false;
    }
    number += int;

    // frac
    if(this.jsonText.charAt(this.index) === '.') {
      this.index++;
      let decimal = this.handleOneStarDigits();
      if(decimal === false) {
        return false;
      }
      number += '.' + decimal;
    }

    // exp
    const char = this.jsonText.charAt(this.index);
    if(char === 'e' || char === 'E') {
      number += char;
      const sign = this.jsonText.charAt(++this.index);
      if(sign === '+' || sign === '-') {
        number += sign;
        this.index++;
      }


      let exp = this.handleOneStarDigits();
      if(exp === false) {
        return false;
      }
      number += exp;

      //number += this.handleOneStarDigits();
    }

    this.output.number(number);
    return true;
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
            this.output.addError(this.index, "Digit (0-9)", `${digits}<b>${char}</b>` + this.jsonText.substring(this.index + 1, this.index + 16))
            return false;
          } else {
            return digits;
          }
      }
    }

  }


  handleKey() {
    return this.handleString(this.output.attr);
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

      if(escaped) {
        // validate the capture
        switch (char) {
          case '\\':
          case '"':
          case '/':
          case 'b':
          case 'f':
          case 'n':
          case 'r':
          case 't':
            str += char;
            break;
          case 'u':
            // FIXME danger of going out of bounds
            let unicode = this.jsonText.charAt(this.index + 1) + this.jsonText.charAt(this.index + 2) +
                this.jsonText.charAt(this.index + 3) + this.jsonText.charAt(this.index + 4);

            if(!this.isValidHexString(unicode)) {
              this.output.addError(this.index, `Invalid unicode character ${unicode}`, this.index);
              return false;
            }
            str += char;
            break;
          default:
            this.output.addError(this.index, `Invalid escaped character ${char}`, this.index);
            return false;
        }
      } else if(char !== '"'){
        str += char;
      }else {
        callback.call(this.output, '"' + str + '"');
        this.index++;
        return true;
      }

      escaped = !escaped && char === '\\';
    }

    callback.call(this.output, '"' + str);
    this.output.addError(this.index, "End of string", "End of file");
    return false;
  }

  // TODO move this out of the class
  isValidHexString(str) {
    // Regular expression to match valid hex characters (0-9, A-F, a-f)
    const hexRegex = /^[0-9A-Fa-f]+$/;

    // Test if the string matches the regex pattern
    return hexRegex.test(str);
  }


}

export default JSONTokenizer;
