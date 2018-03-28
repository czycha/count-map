/**
 * Map implementation that only keeps track of duplicates.
 */
class CountMap {
  /**
   * Hash function. Transform some object to a comparable string.
   * @callback hashFn
   * @param {*} val
   * @return {String} hash
   */

  /**
   * @typedef {Object} countObject
   * @property {int} count
   * @property {String} hash
   * @property {Object} key
   */

  /**
   * @typedef {Array} countEntry
   * @property {Object} 0 - Key
   * @property {int} 1 - Count
   */

  /**
   * Create CountMap
   * @param {Object} options
   * @param {Array} [options.array=[]] - Initial values.
   * @param {hashFn} [options.hash=toString()] - Hash function to turn object into comparable string.
   * @param {boolean} [options.allowNegativeCounts=false] - Allow negative counts?
   */
  constructor({
    array = [],
    hash = (key) => key.toString(),
    allowNegativeCounts = false,
  }) {
    /**
     * Internal count object.
     * @member
     * @type {Object<countObject>}
     */
    this.counts = {};

    /**
     * Hash method.
     * @member
     * @type {hashFn}
     */
    this.hash = hash;

    /**
     * Allow negative counts.
     * @member
     * @type {boolean}
     */
    this.allowNegativeCounts = allowNegativeCounts;

    this.concat(array, true);
  }

  /**
   * Add key to map.
   * @param {*} key
   * @param {int} [amount=1] - Amount to add
   * @return {int} count
   * @throws {RangeError} When amount is not positive.
   */
  add(key, amount = 1) {
    if (amount < 0) {
      throw new RangeError('Amount should be positive. Try using subtract method.');
    }
    const hashed = this.hash(key);
    if (!this.counts[hashed]) {
      this.counts[hashed] = {
        hash: hashed,
        key,
        count: amount,
      };
    } else {
      this.counts[hashed].count += amount;
    }
    return this.counts[hashed].count;
  }

  /**
   * Remove key instances. Does not remove key altogether, just reduces count by `amount`.
   * If goes under zero, key will still exist.
   * @param {*} key
   * @param {int} [amount=1] - Decrease by how many
   * @return {int} count - Returns `-1` if key not found.
   */
  subtract(key, amount = 1) {
    if (amount < 0) {
      throw new RangeError('Amount to subtract by should be positive.');
    }
    const hashed = this.hash(key);
    const entry = this.counts[hashed];
    if (entry) {
      entry.count = entry.count - amount;
      if (!this.allowNegativeCounts && entry.count < 0) {
        entry.count = 0;
      }
      return this.counts[hashed].count;
    }
    return 0;
  }

  /**
   * Set key count
   * @param {*} key
   * @param {int} amount
   * @return {int} count
   */
  set(key, amount) {
    if (!this.allowNegativeCounts && amount < 0) {
      throw new RangeError('Negative mode disabled. Amount should be positive.');
    }
    const hashed = this.hash(key);
    if (!this.counts[hashed]) {
      this.add(key, amount);
    } else {
      this.counts[hashed].count = amount;
    }
    return this.counts[hashed].count;
  }

  /**
   * Concat array into map.
   * @param {Array<*>} arr
   * @param {boolean} [inPlace=false] - Operate on clone or instance.
   * @return {CountMap} This instance or clone.
   */
  concat(arr, inPlace = false) {
    const map = inPlace ? this : this.clone();
    for (let key of arr) {
      map.add(key);
    }
    return map;
  }

  /**
   * Removes all values of the key.
   * @param {*} key
   * @return {boolean} success
   */
  delete(key) {
    const hashed = this.hash(key);
    if (this.counts[hashed]) {
      delete this.counts[hashed];
      return true;
    }
    return false;
  }

  /**
   * Count key instances.
   * @param {*} key
   * @return {int} count
   */
  get(key) {
    const hashed = this.hash(key);
    return this.counts[hashed] ? this.counts[hashed].count : 0;
  }

  /**
   * Checks if key is in CountMap. Does not guarantee that count is non-zero.
   * @param {*} key
   * @return {boolean}
   */
  has(key) {
    const hashed = this.hash(key);
    return this.counts[hashed] !== undefined;
  }

  /**
   * Clones CountMap
   * @return {CountMap}
   */
  clone() {
    const cloned = new CountMap({
      hash: this.hash,
      allowNegativeCounts: this.allowNegativeCounts,
    });
    this.entries().forEach(([key, count]) => {
      cloned.set(key, count);
    });
    return cloned;
  }

  /**
   * Rehash count map. Do this after changing hash.
   * @return {CountMap} this
   */
  rehash() {
    const entries = this.entries();
    this.count = {};
    entries.forEach(([key, count]) => {
      this.add(key, count);
    });
    return this;
  }

  /**
   * Get keys.
   * @return {Array} keys
   */
  keys() {
    return Object.values(this.counts).map((val) => val.key);
  }

  /**
   * Get entries.
   * @return {Array<countEntry>} entries
   */
  entries() {
    return Object.values(this.counts).map((val) => [val.key, val.count]);
  }

  /**
   * Outputs as an array, duplicating values based on counts.
   * @note Will not be in any particular order.
   * @return {Array<*>}
   */
  toArray() {
    return this.entries().reduce((arr, [key, count]) => {
      for (let i = 0; i < count; i++) {
        arr.push(key);
      }
      return arr;
    }, []);
  }

  /**
   * Check if two `CountMap`s are equal.
   * Specifically, are the hash functions equal, negative modes equal, and does each hashed value have the same count.
   * @param {CountMap} other
   * @return {boolean}
   */
  equals(other) {
    if (
      other.hash.toString() !== this.hash.toString() ||
      other.allowNegativeCounts !== this.allowNegativeCounts
    ) {
      return false;
    }
    const otherKeys = other.keys();
    const thisKeys = this.keys();
    const testKey = (key) => this.get(key) === other.get(key);
    const allKeysEqual = otherKeys.every(testKey) && thisKeys.every(testKey);
    return allKeysEqual;
  }
}

module.exports = CountMap;
