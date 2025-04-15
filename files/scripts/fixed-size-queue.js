class FixedSizeQueue {
    constructor(capacity) {
        if (!Number.isInteger(capacity) || capacity <= 0) {
            throw new Error('Capacity must be a positive integer');
        }

        this.capacity = capacity;
        this.array = new Array(capacity);
        this.head = 0;     // Index of the first element
        this.tail = 0;     // Index where the next element will be inserted
        this.size = 0;     // Current number of elements in the queue
    }

    /**
     * Add an element to the end of the queue
     * @param {*} element - The element to enqueue
     * @returns {boolean} - Whether the operation was successful
     */
    enqueue(element) {
        // Check if queue is full
        if (this.size === this.capacity) {
            return false;
        }

        // Add element at the tail position
        this.array[this.tail] = element;

        // Move tail pointer forward (with wraparound)
        this.tail = (this.tail + 1) % this.capacity;

        // Increment size
        this.size++;

        return true;
    }

    /**
     * Remove and return the element at the front of the queue
     * @returns {*} - The dequeued element or undefined if empty
     */
    dequeue() {
        // Check if queue is empty
        if (this.size === 0) {
            return undefined;
        }

        // Get the element at the head position
        const element = this.array[this.head];

        // Clear the reference to help with garbage collection
        this.array[this.head] = undefined;

        // Move head pointer forward (with wraparound)
        this.head = (this.head + 1) % this.capacity;

        // Decrement size
        this.size--;

        return element;
    }

    /**
     * Look at the element at the front of the queue without removing it
     * @returns {*} - The element at the front or undefined if empty
     */
    peek() {
        if (this.size === 0) {
            return undefined;
        }
        return this.array[this.head];
    }

    /**
     * Check if the queue is empty
     * @returns {boolean} - True if queue is empty, false otherwise
     */
    isEmpty() {
        return this.size === 0;
    }

    /**
     * Check if the queue is full
     * @returns {boolean} - True if queue is full, false otherwise
     */
    isFull() {
        return this.size === this.capacity;
    }

    /**
     * Get the current size of the queue
     * @returns {number} - The number of elements in the queue
     */
    getSize() {
        return this.size;
    }

    /**
     * Get the maximum capacity of the queue
     * @returns {number} - The maximum number of elements the queue can hold
     */
    getCapacity() {
        return this.capacity;
    }

    /**
     * Clear all elements from the queue
     */
    clear() {
        this.array = new Array(this.capacity);
        this.head = 0;
        this.tail = 0;
        this.size = 0;
    }

    /**
     * Get all elements in queue order (for debugging/display purposes)
     * @returns {Array} - All elements in queue order
     */
    toArray() {
        const result = [];

        if (this.size === 0) {
            return result;
        }

        let current = this.head;
        for (let i = 0; i < this.size; i++) {
            result.push(this.array[current]);
            current = (current + 1) % this.capacity;
        }

        return result;
    }
}

export default FixedSizeQueue;