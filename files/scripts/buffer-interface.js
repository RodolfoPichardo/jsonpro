/**
 * BufferInterface - A formal interface definition for buffer implementations
 *
 * This abstract class defines a contract that all buffer implementations must follow.
 * It appears to be designed for serializing structured data (like JSON) with explicit
 * control over formatting and error handling.
 *
 * @abstract
 */
class BufferInterface {
    /**
     * Creates a new instance and verifies required methods are implemented
     * @throws {Error} If instantiated directly or missing required method implementations
     */
    constructor() {
        // Prevent direct instantiation of the interface
        if (this.constructor === BufferInterface) {
            throw new Error("Cannot instantiate BufferInterface directly. You must extend this class.");
        }

        // Define all required methods that implementing classes must provide
        const requiredMethods = [
            // Structure control methods
            'beginObject',  // Start a new object (e.g., '{' in JSON)
            'endObject',    // End current object (e.g., '}' in JSON)
            'beginArray',   // Start a new array (e.g., '[' in JSON)
            'endArray',     // End current array (e.g., ']' in JSON)

            // Separator methods
            'valueSeparator', // Add separator between values (e.g., ',' in JSON)
            'nameSeparator',  // Add separator between name and value (e.g., ':' in JSON)

            // Value type methods
            'string',       // Handle string values (with proper escaping)
            'literal',      // Handle literal values (true, false, null)
            'number',       // Handle numeric values
            'attr',         // Handle attribute/property names

            // Buffer management and error handling
            'sendBuffer',   // Process or output the current buffer content
            'addError'      // Record parsing/formatting errors
        ];

        // Helper function that validates each required method
        const validateMethod = (methodName) => {
            if (this[methodName] === undefined || typeof this[methodName] !== 'function') {
                throw new Error(
                    `Implementation error: Class ${this.constructor.name} must implement the ${methodName}() method`
                );
            }
        };

        // Validate all required methods are properly implemented
        requiredMethods.forEach(validateMethod);
    }

    /**
     * Marks the beginning of an object structure
     * @abstract
     * @returns {BufferInterface} The current instance for method chaining
     */
    beginObject() {
        throw new Error("Method 'beginObject()' must be implemented.");
    }

    /**
     * Marks the end of an object structure
     * @abstract
     * @returns {BufferInterface} The current instance for method chaining
     */
    endObject() {
        throw new Error("Method 'endObject()' must be implemented.");
    }

    /**
     * Marks the beginning of an array structure
     * @abstract
     * @returns {BufferInterface} The current instance for method chaining
     */
    beginArray() {
        throw new Error("Method 'beginArray()' must be implemented.");
    }

    /**
     * Marks the end of an array structure
     * @abstract
     * @returns {BufferInterface} The current instance for method chaining
     */
    endArray() {
        throw new Error("Method 'endArray()' must be implemented.");
    }

    /**
     * Adds a separator between values in a collection
     * @abstract
     * @returns {BufferInterface} The current instance for method chaining
     */
    valueSeparator() {
        throw new Error("Method 'valueSeparator()' must be implemented.");
    }

    /**
     * Adds a separator between a name and its value
     * @abstract
     * @returns {BufferInterface} The current instance for method chaining
     */
    nameSeparator() {
        throw new Error("Method 'nameSeparator()' must be implemented.");
    }

    /**
     * Appends a string value to the buffer
     * @abstract
     * @param {string} str - The string value to append
     * @returns {BufferInterface} The current instance for method chaining
     */
    string(str) {
        throw new Error("Method 'string(str)' must be implemented.");
    }

    /**
     * Appends a literal value (null, true, false) to the buffer
     * @abstract
     * @param {string} str - The literal value to append
     * @returns {BufferInterface} The current instance for method chaining
     */
    literal(str) {
        throw new Error("Method 'literal(str)' must be implemented.");
    }

    /**
     * Appends a numeric value to the buffer
     * @abstract
     * @param {number|string} value - The numeric value to append
     * @returns {BufferInterface} The current instance for method chaining
     */
    number(value) {
        throw new Error("Method 'number(value)' must be implemented.");
    }

    /**
     * Appends an attribute/property name to the buffer
     * @abstract
     * @param {string} str - The attribute name to append
     * @returns {BufferInterface} The current instance for method chaining
     */
    attr(str) {
        throw new Error("Method 'attr(str)' must be implemented.");
    }

    /**
     * Records an error that occurred during processing
     * @abstract
     * @param {number} position - The position where the error occurred
     * @param {string} expecting - What was expected at this position
     * @param {string} actual - What was actually found
     * @returns {BufferInterface} The current instance for method chaining
     */
    addError(position, expecting, actual) {
        throw new Error("Method 'addError(position, expecting, actual)' must be implemented.");
    }

    /**
     * Processes or outputs the current buffer content
     * @abstract
     * @returns {*} The processed buffer content (implementation specific)
     */
    sendBuffer() {
        throw new Error("Method 'sendBuffer()' must be implemented.");
    }

    /**
     * Static method to check if an object implements this interface
     * @param {Object} obj - Object to check
     * @returns {boolean} True if the object implements all required methods
     */
    static isImplementedBy(obj) {
        if (!obj) return false;

        const requiredMethods = [
            'beginObject', 'endObject', 'beginArray', 'endArray',
            'valueSeparator', 'nameSeparator', 'string', 'literal',
            'number', 'attr', 'sendBuffer', 'addError'
        ];

        return requiredMethods.every(method =>
            typeof obj[method] === 'function'
        );
    }
}

export default BufferInterface;