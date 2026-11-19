// Three locally synthesized radio identities for Costa Vela's FM dial.
export const STATIONS=['PALM FM 88.4','NEON TIDE 104.2','VELA TALK 92.1'];
export function nextStation(index){return(index+1)%STATIONS.length;}
