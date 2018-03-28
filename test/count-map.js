const CountMap = require('../dist/index.js');
const expect = require('chai').expect;

describe('CountMap', function() {
  let mapStandard;
  let mapHalf;
  const testItems = [1, 1, 1, 2, 3, 4, 4, 4, 3, 3, 8, 1000, 2, 18];
  const hashHalf = (a) => Math.round(a / 2).toString();
  const countStandard = {
    '1': {
      count: 3,
      hash: '1',
      key: 1,
    },
    '2': {
      count: 2,
      hash: '2',
      key: 2,
    },
    '3': {
      count: 3,
      hash: '3',
      key: 3,
    },
    '4': {
      count: 3,
      hash: '4',
      key: 4,
    },
    '8': {
      count: 1,
      hash: '8',
      key: 8,
    },
    '1000': {
      count: 1,
      hash: '1000',
      key: 1000,
    },
    '18': {
      count: 1,
      hash: '18',
      key: 18,
    },
  };
  const countHalf = {
    '1': {
      count: 5,
      hash: '1',
      key: 1,
    },
    '2': {
      count: 6,
      hash: '2',
      key: 3,
    },
    '4': {
      count: 1,
      hash: '4',
      key: 8,
    },
    '500': {
      count: 1,
      hash: '500',
      key: 1000,
    },
    '9': {
      count: 1,
      hash: '9',
      key: 18,
    },
  };
  beforeEach(function() {
    mapStandard = new CountMap({ array: testItems });
    mapHalf = new CountMap({ array: testItems, hash: hashHalf });
    mapNegative = new CountMap({ array: testItems, allowNegativeCounts: true });
  });
  describe('#constructor', function() {
    it('should create consistent counts', function() {
      expect(mapStandard.counts).to.deep.equal(countStandard);
      expect(mapHalf.counts).to.deep.equal(countHalf);
    });
  });
  describe('#get', function() {
    it('should get count', function() {
      expect(mapStandard.get(1)).to.equal(countStandard['1'].count);
      expect(mapHalf.get(1)).to.equal(countHalf['1'].count);
      expect(mapHalf.get(1.25)).to.equal(countHalf['1'].count);
    });
    it('should return 0 when not found in map', function() {
      expect(mapStandard.get(12)).to.equal(0);
      expect(mapHalf.get(12)).to.equal(0);
    });
  });
  describe('#has', function() {
    it('should return false when key/hash doesn\'t exist', function() {
      expect(mapStandard.has(-1)).to.be.false;
    });
    it('should return false when key/hash exists', function() {
      expect(mapStandard.has(1)).to.be.true;
      expect(mapHalf.has(1)).to.be.true;
      expect(mapHalf.has(1.5)).to.be.true;
      expect(mapHalf.has(2)).to.be.true;
    });
  });
  describe('#add', function() {
    it('should add key to map when it doesn\'t exist', function() {
      mapStandard.add(22);
      expect(mapStandard.get(22)).to.equal(1);
      mapHalf.add(22);
      expect(mapHalf.get(22)).to.equal(1);
      expect(mapHalf.get(21)).to.equal(1);
    });
    it('should increment count when key exists', function() {
      mapStandard.add(8);
      expect(mapStandard.get(8)).to.equal(countStandard['8'].count + 1);
      mapHalf.add(8);
      expect(mapHalf.get(8)).to.equal(countHalf['4'].count + 1);
      expect(mapHalf.get(7)).to.equal(countHalf['4'].count + 1);
    });
    it('should increment by custom amount', function() {
      mapStandard.add(8, 3);
      expect(mapStandard.get(8)).to.equal(countStandard['8'].count + 3);
      mapHalf.add(8, 3);
      expect(mapHalf.get(8)).to.equal(countHalf['4'].count + 3);
      expect(mapHalf.get(7)).to.equal(countHalf['4'].count + 3);
    });
    it('should throw error when non-positive amount provided', function() {
      expect(() => mapStandard.add(8, -3)).to.throw(RangeError);
    });
  });
  describe('#set', function() {
    it('should set key and count when it doesn\'t exist', function() {
      mapStandard.set(22, 44);
      expect(mapStandard.get(22)).to.equal(44);
      mapHalf.set(22, 44);
      expect(mapHalf.get(22)).to.equal(44);
      expect(mapHalf.get(21)).to.equal(44);
    });
    it('should override count when key exists', function() {
      mapStandard.set(8, 44);
      expect(mapStandard.get(8)).to.equal(44);
      mapHalf.set(8, 44);
      expect(mapHalf.get(8)).to.equal(44);
      expect(mapHalf.get(7)).to.equal(44);
    });
    it('should throw error when non-positive amount provided and not in negative mode', function() {
      expect(() => mapStandard.set(8, -3)).to.throw(RangeError);
      expect(() => mapNegative.set(8, -3)).to.not.throw(RangeError);
    });
  });
  describe('#subtract', function() {
    it('should return 0 if key doesn\'t exist', function() {
      expect(mapStandard.subtract(22)).to.equal(0);
      expect(mapHalf.subtract(22)).to.equal(0);
    });
    it('should decrement count when key exists', function() {
      expect(mapStandard.subtract(2)).to.equal(countStandard['2'].count - 1);
      expect(mapHalf.subtract(2)).to.equal(countHalf['1'].count - 1);
      expect(mapHalf.subtract(1)).to.equal(countHalf['1'].count - 2);
    });
    it('should decrement count by custom value', function() {
      expect(mapStandard.subtract(3, 2)).to.equal(countStandard['3'].count - 2);
      expect(mapHalf.subtract(3, 2)).to.equal(countHalf['2'].count - 2);
      expect(mapHalf.subtract(4, 2)).to.equal(countHalf['2'].count - 4);
    });
    it('should respect negative mode', function() {
      expect(mapStandard.subtract(8, 200)).to.equal(0);
      expect(mapNegative.subtract(8, 200)).to.equal(countStandard['8'].count - 200);
    });
    it('should throw error when non-positive amount provided', function() {
      expect(() => mapStandard.subtract(8, -3)).to.throw(RangeError);
    });
  });
  describe('#delete', function() {
    it('should return false if key/hash doesn\'t exist', function() {
      expect(mapStandard.delete(-1)).to.be.false;
    });
    it('should remove key/hash', function() {
      expect(mapStandard.delete(1)).to.be.true;
      expect(mapStandard.has(1)).to.be.false;
      expect(mapHalf.delete(1)).to.be.true;
      expect(mapHalf.has(1)).to.be.false;
      expect(mapHalf.has(2)).to.be.false;
    });
  });
  describe('#clone', function() {
    it('should create duplicate CountMap', function() {
      const clone = mapStandard.clone();
      expect(clone.counts).to.deep.equal(mapStandard.counts);
    });
  });
  describe('#equals', function() {
    it('should compare two CountMaps', function() {
      const clone = mapStandard.clone();
      expect(mapStandard.equals(mapStandard)).to.be.true;
      clone.add(1);
      expect(clone.equals(mapStandard)).to.be.false;
      clone.delete(1);
      expect(clone.equals(mapStandard)).to.be.false;
      expect(mapStandard.equals(mapNegative)).to.be.false;
      expect(mapStandard.equals(mapHalf)).to.be.false;
    });
  });
  describe('#keys', function() {
    it('should return unique keys', function() {
      expect(mapStandard.keys()).to.have.members([1, 2, 3, 4, 8, 1000, 18]);
      expect(mapHalf.keys()).to.have.members([1, 3, 8, 1000, 18]);
    });
  });
  describe('#entries', function() {
    it('should return unique keys and counts', function() {
      expect(mapStandard.entries()).to.have.deep.members([
        [1, 3],
        [2, 2],
        [3, 3],
        [4, 3],
        [8, 1],
        [1000, 1],
        [18, 1],
      ]);
      expect(mapHalf.entries()).to.have.deep.members([
        [1, 5],
        [3, 6],
        [8, 1],
        [1000, 1],
        [18, 1],
      ]);
    });
  });
  describe('#toArray', function() {
    it('should output array duplicating keys', function() {
      expect(mapStandard.toArray()).to.have.members(testItems);
      expect(mapHalf.toArray()).to.have.members([1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 8, 1000, 18]);
    });
    it('should ignore empty or negative counts', function() {
      mapStandard.set(1, 0);
      expect(mapStandard.toArray()).to.have.members([2, 3, 4, 4, 4, 3, 3, 8, 1000, 2, 18]);
      mapNegative.set(1, -5);
      expect(mapNegative.toArray()).to.have.members([2, 3, 4, 4, 4, 3, 3, 8, 1000, 2, 18]);
    });
  });
  describe('#concat', function() {
    it('add to current counts', function() {
      const addMe = [1, 18, 2, 2, 2, 222];
      mapStandard.concat(addMe, true);
      expect(mapStandard.get(1)).to.equal(countStandard['1'].count + 1);
      expect(mapStandard.get(18)).to.equal(countStandard['18'].count + 1);
      expect(mapStandard.get(2)).to.equal(countStandard['2'].count + 3);
      expect(mapStandard.get(222)).to.equal(1);
    });
    it('should clone unless otherwise specified', function() {
      const addMe = [1, 18, 2, 2, 2, 222];
      const clone = mapStandard.concat(addMe);
      expect(mapStandard.counts).to.deep.equal(countStandard);
      expect(clone.get(1)).to.equal(countStandard['1'].count + 1);
      expect(clone.get(18)).to.equal(countStandard['18'].count + 1);
      expect(clone.get(2)).to.equal(countStandard['2'].count + 3);
      expect(clone.get(3)).to.equal(countStandard['3'].count);
      expect(clone.get(222)).to.equal(1);
    });
  });
});
