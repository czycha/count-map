# CountMap

Data structure for keeping a count of items.

```
npm install count-map
```
```
yarn add count-map
```

## API

### init
```js
import CountMap from 'count-map';

const map = new CountMap({ array, hash, allowNegativeCounts });
```

| var | type | default | use |
|-----|------|---------|-----|
| `array` | `Array` | `[]` | Populate map right away with this array. |
| `hash` | `Function(key) => string` | `(key) => key.toString()` | Hashing function. Used to group similar keys together, or to distinguish objects. |
| `allowNegativeCounts` | `boolean` | `false` | Allow negative counts. Otherwise, the minimum is `0`. |

### Key management

- **`map.set(key, amount)`** – Sets ket count to amount. Creates entry if doesn't exist.
- **`map.delete(key) => boolean`** – Removes key from map if it exists. Returns `false` if key didn't exist.
- **`map.add(key, amount = 1) => count`** – Adds to key count. By default, increments by 1. Can provide `amount` to increment by that. Returns the new count for `key`.
- **`map.subtract(key, amount = 1) => count`** – Subtracts from key count. By default, decrements by 1. Can provide `amount` to decrement by that. Returns the new count for `key`.
- **`map.has(key) => boolean`** – Check if map has key.
- **`map.get(key) => count`** – Get count for key. If key doesn't exist, returns `0`.
- **`map.concat(array, inPlace = false) => CountMap`** – Add contents of array to map. Operates on and returns clone unless `inPlace` is `true`.

### Other

- **`map.keys() => Array`** – Returns array of unique keys. **NOTE:** If the hash sets two keys to be equal of each other, there will only be one instance of that saved as a representaive of the hash.
- **`map.entries() => Array[key, count]`** – Returns unique entries within the map.
- **`map.toArray() => Array`** – Creates an array, duplicating keys as many times as the count indicates. Leaves out keys with negative or empty counts.
- **`map.equals(otherMap) => boolean`** – Test if two `CountMaps` are equal. Specifically:
  - Are the hash functions the same?
  - Are the two negative modes equal?
  - Does each have the same keys and counts? **NOTE:** Keys may differ, but still return `true` depending on the hash function.
- **`map.clone() => CountMap`** – Duplicate `CountMap`.
- **`map.rehash() => this`** – Rehashes map. Use this if the hash function changes.