(function(root){
 const round=n=>Math.round((n+Number.EPSILON)*100)/100;
 const valid=(v,name)=>{const n=Number(v);if(v===''||v==null||!Number.isFinite(n)||n<0)throw new Error('Enter a valid '+name+'.');return n;};
 const taxTotal=n=>{const subtotal=round(n),tax=round(subtotal*.13);return {subtotal,tax,total:round(subtotal+tax)};};
 function guard({feet,length,cost,rate,extras=0}){
  feet=valid(feet,'footage');length=valid(length,'section length');cost=valid(cost,'section cost');rate=valid(rate,'return per linear foot');extras=valid(extras,'additional material cost');
  if(length<=0)throw new Error('Guard length must be greater than zero.');
  const sections=Math.ceil(feet/length),materials=taxTotal(sections*cost),allMaterials=taxTotal(round(sections*cost)+extras),target=round(feet*rate),quote=taxTotal(allMaterials.total+target);
  return {sections,materials,allMaterials,target,quote,returnPerFoot:feet?round((quote.subtotal-allMaterials.total)/feet):0};
 }
 root.GGMath={round,taxTotal,guard,valid};if(typeof module!=='undefined')module.exports=root.GGMath;
})(typeof window==='undefined'?globalThis:window);
