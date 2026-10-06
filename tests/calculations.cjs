const assert=require('node:assert/strict');const {guard,taxTotal}=require('../assets/calculations.js');
const r=guard({feet:180,length:7.4,cost:20,rate:10});
assert.equal(r.sections,25);assert.equal(r.materials.total,565);assert.equal(r.quote.subtotal,2365);assert.equal(r.quote.tax,307.45);assert.equal(r.quote.total,2672.45);assert.equal(r.returnPerFoot,10);
const alternate=guard({feet:180,length:7.4,cost:31.79,rate:13,extras:80.09});assert.equal(alternate.target,2340);assert.equal(alternate.quote.subtotal-alternate.allMaterials.total,2340);
assert.equal(guard({feet:14.8,length:7.4,cost:1.99,rate:0}).sections,2);
assert.deepEqual(taxTotal(16.09),{subtotal:16.09,tax:2.09,total:18.18});
for(const bad of ['',-1,NaN,Infinity])assert.throws(()=>guard({feet:180,length:7.4,cost:bad,rate:10}));
assert.throws(()=>guard({feet:180,length:0,cost:20,rate:10}));
console.log('Calculator checks passed: tax, rounding, whole sections, adjustable target, additional materials, invalid inputs.');
