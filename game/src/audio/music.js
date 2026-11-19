// Purpose: list radio stations and cycle the active station.
// Main exports: STATIONS, nextStation.
// Inputs: station index.
// Outputs: station labels and wrapped next index.
// Side effects: none.
// Notes: station order is fixed.
export const STATIONS=['PALM FM 88.4','NEON TIDE 104.2','VELA TALK 92.1'];
export function nextStation(index){return(index+1)%STATIONS.length;}
// Purpose: list radio stations and cycle the active station.
// Main exports: STATIONS, nextStation.
// Inputs: station index.
// Outputs: station labels and wrapped next index.
// Side effects: none.
// Notes: station order is fixed.
