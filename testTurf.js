const turf = require("@turf/turf")
var poly1 = turf.polygon([[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]);
var poly2 = turf.polygon([[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]);
var o = turf.booleanOverlap(poly1, poly2)
console.log("poly", o)
var c = turf.booleanContains(poly1, poly2)
console.log("poly", c)
var c = turf.booleanEqual(poly1, poly2)
console.log("poly", c)