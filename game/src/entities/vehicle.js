// Vehicle templates, paint and per-car handling state for the Costa Vela streets.
export const VEHICLES=[
 {name:'Solana GT',color:'#f06e58',maxSpeed:470,accel:1.04},
 {name:'Marina Classic',color:'#6db9ad',maxSpeed:360,accel:.87},
 {name:'Vista Coupe',color:'#e4c187',maxSpeed:410,accel:.94},
 {name:'Cobre Utility',color:'#77909a',maxSpeed:300,accel:.78},
];
export function createCar(x,y,angle=0,index=0,police=false){const type=VEHICLES[index%VEHICLES.length];return{x,y,angle,speed:0,maxSpeed:police?440:type.maxSpeed,accel:type.accel,color:police?'#e7e8d9':type.color,name:police?'CVPD Cruiser':type.name,occupied:false,police,seed:index};}
