'use strict';
var _ = require('lodash');
/*jslint bitwise: true */

// ===================================
// modified http://stackoverflow.com/a/26610870
// creates an n-length array with all possible combinations of true/false
function combinations(n) {
  var r = [];
  for (var i = 0; i < (1 << n); i++) {
    var c = [];
    for (var j = 0; j < n; j++) {
      c.push(i & (1 << j) ? 'true' : 'false');
    }
    r.push(c);
  }
  return r;
}
// ===================================

function isObject(item) {
  return (typeof item === 'object' && !Array.isArray(item) && item !== null);
}

function mixer(incomingObject, overrideObject) {
  // console.log(Object.keys(incomingObject));
  // * mixer accepts: 1) a reference object and 2) optional array of objects (when you want particular key to be true/false across the whole combination array).
  // * mixer spits out an objects array with the same keys as incoming one, but with all possible boolean value combinations.
  // * mixer is required to test Detergent library, where any of the boolean settings (each representing a step in the processing chain) might break the Detergent's functionality.

  var outcomingObjectsArray = [];

  if (incomingObject === void 0) {
    throw 'missing input object';
  }
  if (!isObject(incomingObject)) {
    throw 'input must be a true object';
  }

  var propertiesToMix = _.keys(incomingObject);

  // ===================================
  // if there's override, prepare an alternative (a subset) array propertiesToMix

  if ((overrideObject !== void 0) && !isObject(overrideObject)) {
    throw 'override object must be a true object and nothing else';
  }
  var override = false;
  if ((overrideObject !== void 0) && (Object.keys(overrideObject).length !== 0)) {
    override = true;
  }

  if (override) {
    // find legitimate properties from the overrideObject:
    // TODO: dedupe overrideObject?
    // enforce that override object had just a subset of incomingObject properties, nothing else
    var propertiesToBeOverridden = _.intersection(Object.keys(overrideObject), Object.keys(incomingObject));
    // propertiesToMix = all incoming object's properties MINUS properties to override
    propertiesToBeOverridden.forEach(function (elem) {
      _.pull(propertiesToMix, elem);
    });

  }

  // ===================================
  // mix up whatever propertiesToMix has came to this point

  var boolCombinations = combinations(Object.keys(propertiesToMix).length);
  var tempObject = {};
  boolCombinations.forEach(function (elem1, index1) {
    tempObject = {};
    propertiesToMix.forEach(function (elem2, index2) {
      tempObject[elem2] = ( boolCombinations[index1][index2] === 'true' );
    });
    //console.log('tempObject='+tempObject);
    outcomingObjectsArray.push(tempObject);
  });

  // ===================================
  // if there's override, append the static override values on each property of the propertiesToMix array:
  if (override) {
    outcomingObjectsArray.forEach(function (elem3) {
      propertiesToBeOverridden.forEach(function (elem4) {
        elem3[elem4] = overrideObject[elem4];
      });
    });
  }

  return outcomingObjectsArray;
}

module.exports = mixer;
