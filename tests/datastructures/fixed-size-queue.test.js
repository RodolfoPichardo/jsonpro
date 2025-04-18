import FixedSizeQueue from '../../src/datastructures/fixed-size-queue';

describe('FixedSizeQueue', () => {
    let queue;

    beforeEach(() => {
        queue = new FixedSizeQueue(5);
    });

    describe('constructor', () => {
        test('should create a queue with the specified capacity', () => {
            expect(queue.getCapacity()).toBe(5);
            expect(queue.getSize()).toBe(0);
            expect(queue.isEmpty()).toBe(true);
            expect(queue.isFull()).toBe(false);
        });

        test('should throw an error if capacity is not a positive integer', () => {
            expect(() => new FixedSizeQueue(0)).toThrow();
            expect(() => new FixedSizeQueue(-1)).toThrow();
            expect(() => new FixedSizeQueue('5')).toThrow();
            expect(() => new FixedSizeQueue(null)).toThrow();
        });
    });

    describe('enqueue', () => {
        test('should add elements to the queue', () => {
            expect(queue.enqueue('A')).toBe(true);
            expect(queue.getSize()).toBe(1);
            expect(queue.peek()).toBe('A');

            expect(queue.enqueue('B')).toBe(true);
            expect(queue.getSize()).toBe(2);
        });

        test('should return false when trying to enqueue to a full queue', () => {
            queue.enqueue('A');
            queue.enqueue('B');
            queue.enqueue('C');
            queue.enqueue('D');
            queue.enqueue('E');
            expect(queue.isFull()).toBe(true);

            expect(queue.enqueue('F')).toBe(false);
            expect(queue.getSize()).toBe(5);
        });

        test('should handle different data types', () => {
            expect(queue.enqueue(1)).toBe(true);
            expect(queue.enqueue('string')).toBe(true);
            expect(queue.enqueue(null)).toBe(true);
            expect(queue.enqueue(undefined)).toBe(true);
            expect(queue.enqueue({ key: 'value' })).toBe(true);

            expect(queue.getSize()).toBe(5);
        });
    });

    describe('dequeue', () => {
        test('should remove and return elements in FIFO order', () => {
            queue.enqueue('A');
            queue.enqueue('B');
            queue.enqueue('C');

            expect(queue.dequeue()).toBe('A');
            expect(queue.getSize()).toBe(2);

            expect(queue.dequeue()).toBe('B');
            expect(queue.getSize()).toBe(1);

            expect(queue.dequeue()).toBe('C');
            expect(queue.getSize()).toBe(0);
            expect(queue.isEmpty()).toBe(true);
        });

        test('should return undefined when dequeueing from an empty queue', () => {
            expect(queue.dequeue()).toBeUndefined();
            expect(queue.getSize()).toBe(0);
        });
    });

    describe('peek', () => {
        test('should return the front element without removing it', () => {
            queue.enqueue('A');
            queue.enqueue('B');

            expect(queue.peek()).toBe('A');
            expect(queue.getSize()).toBe(2);
        });

        test('should return undefined for an empty queue', () => {
            expect(queue.peek()).toBeUndefined();
        });
    });

    describe('isEmpty', () => {
        test('should return true for a new queue', () => {
            expect(queue.isEmpty()).toBe(true);
        });

        test('should return false after enqueueing', () => {
            queue.enqueue('A');
            expect(queue.isEmpty()).toBe(false);
        });

        test('should return true after dequeueing all elements', () => {
            queue.enqueue('A');
            queue.dequeue();
            expect(queue.isEmpty()).toBe(true);
        });
    });

    describe('isFull', () => {
        test('should return false for a new queue', () => {
            expect(queue.isFull()).toBe(false);
        });

        test('should return true when queue is at capacity', () => {
            queue.enqueue('A');
            queue.enqueue('B');
            queue.enqueue('C');
            queue.enqueue('D');
            queue.enqueue('E');

            expect(queue.isFull()).toBe(true);
        });

        test('should return false after dequeueing from a full queue', () => {
            queue.enqueue('A');
            queue.enqueue('B');
            queue.enqueue('C');
            queue.enqueue('D');
            queue.enqueue('E');

            queue.dequeue();
            expect(queue.isFull()).toBe(false);
        });
    });

    describe('clear', () => {
        test('should remove all elements from the queue', () => {
            queue.enqueue('A');
            queue.enqueue('B');
            queue.enqueue('C');

            queue.clear();

            expect(queue.getSize()).toBe(0);
            expect(queue.isEmpty()).toBe(true);
            expect(queue.peek()).toBeUndefined();
        });
    });

    describe('toArray', () => {
        test('should return an empty array for an empty queue', () => {
            expect(queue.toArray()).toEqual([]);
        });

        test('should return elements in queue order', () => {
            queue.enqueue('A');
            queue.enqueue('B');
            queue.enqueue('C');

            expect(queue.toArray()).toEqual(['A', 'B', 'C']);
        });

        test('should handle circular buffer behavior correctly', () => {
            // Fill the queue
            queue.enqueue('A');
            queue.enqueue('B');
            queue.enqueue('C');
            queue.enqueue('D');
            queue.enqueue('E');

            // Remove two elements
            queue.dequeue(); // A
            queue.dequeue(); // B

            // Add two new elements (should wrap around in the internal array)
            queue.enqueue('F');
            queue.enqueue('G');

            // The queue should now be [C, D, E, F, G]
            expect(queue.toArray()).toEqual(['C', 'D', 'E', 'F', 'G']);
        });
    });

    describe('circular buffer behavior', () => {
        test('should handle multiple enqueue/dequeue operations correctly', () => {
            // First fill the queue
            for (let i = 0; i < 5; i++) {
                queue.enqueue(`item-${i}`);
            }

            // Now perform a series of dequeue/enqueue operations
            // to ensure the circular buffer behavior works correctly
            for (let i = 0; i < 20; i++) {
                queue.dequeue();
                queue.enqueue(`new-item-${i}`);
                expect(queue.getSize()).toBe(5);
            }

            // Check if the final state is correct
            const expected = [
                'new-item-15',
                'new-item-16',
                'new-item-17',
                'new-item-18',
                'new-item-19'
            ];

            expect(queue.toArray()).toEqual(expected);
        });

        test('should handle edge case of filling, emptying, and refilling', () => {
            // Fill queue
            for (let i = 0; i < 5; i++) {
                queue.enqueue(`A${i}`);
            }

            // Empty queue
            for (let i = 0; i < 5; i++) {
                queue.dequeue();
            }

            // Refill queue
            for (let i = 0; i < 5; i++) {
                queue.enqueue(`B${i}`);
            }

            expect(queue.toArray()).toEqual(['B0', 'B1', 'B2', 'B3', 'B4']);
        });
    });
});