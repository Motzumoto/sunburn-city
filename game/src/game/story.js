// SUNBURN CITY — Stores the original Costa Vela cast, mission briefs and dialogue.
// Original Costa Vela cast, mission briefs and dialogue.
export const CHARACTERS = {
  rico: { name: 'RICO CALDER', color: '#e87057', hair: '#25232a', skin: '#bd805e', shirt: '#e87057', jacket: '#27394c', shape: 'square' },
  marisol: { name: 'MARISOL VEGA', color: '#43b9ae', hair: '#211d2b', skin: '#d99b76', shirt: '#43b9ae', jacket: '#234c50', shape: 'long' },
  dante: { name: 'DANTE SOSA', color: '#cb4e70', hair: '#171a25', skin: '#a76b53', shirt: '#cb4e70', jacket: '#40243d', shape: 'sharp' },
  voss: { name: 'LT. VOSS', color: '#6387b6', hair: '#c4b99e', skin: '#c79b78', shirt: '#5e7691', jacket: '#263347', shape: 'wide' },
};

export const INTRO_CARDS = [
  { speaker: 'rico', title: 'THE BAD DEAL', lines: ['Rico Calder came back to Costa Vela with one suitcase and a debt.', 'The people who made the deal are already looking for him.'] },
  { speaker: 'marisol', title: 'A WAY BACK IN', lines: ['Fixer Marisol Vega has work. The Coral Syndicate has a ledger.', 'Rival Dante Sosa wants it. Lt. Voss wants everybody quiet.'] },
  { speaker: 'rico', title: 'COSTA VELA', lines: ['One small pickup. One clean delivery. No more bad deals.', 'That is what Rico tells himself at first light.'] },
];

export const MISSIONS = [
  { id: 'first-light', name: 'First Light', district: 'Breezy Palms', reward: 450, speaker: 'marisol', lines: ['A package is waiting off Tamarind Street. Bring it to my contact across Breezy Palms.', 'Walk there, borrow a ride if you need one. Keep the package out of sight.'] },
  { id: 'marina-job', name: 'Marina Job', district: 'The Marina', reward: 900, speaker: 'marisol', lines: ['The Syndicate has a Viento SS at the marina. Take that exact car to the Yards.', 'No dents worth talking about. The buyer is waiting by Pier 9.'] },
  { id: 'the-tail', name: 'The Tail', district: 'Neon Row', reward: 1250, speaker: 'rico', lines: ['Dante Sosa is driving the blue Cadiz through Neon Row. He has the ledger.', 'Stay back. If he spots you up close, we lose our only lead.'] },
  { id: 'boardwalk-hold-out', name: 'Boardwalk Hold-Out', district: 'Vela Beach', reward: 1700, speaker: 'marisol', lines: ['Sosa sent a crew to the boardwalk. Hold them off until the last wave breaks.', 'There are health and armour pickups nearby. Keep your pistol loaded.'] },
  { id: 'cold-delivery', name: 'Cold Delivery', district: 'Costa Vela', reward: 2200, speaker: 'rico', lines: ['A sealed case has to cross the city before the clock runs out.', 'Voss put two stars on the job. Drive carefully; the cargo is fragile.'] },
  { id: 'the-yards-run', name: 'The Yards Run', district: 'The Yards', reward: 3000, speaker: 'marisol', lines: ['Dante is cutting through the freight roads in a blue Cadiz GT.', 'Stay on him and wreck the car. That ledger cannot leave the city.'] },
  { id: 'annex-break-in', name: 'Annex Break-In', district: 'Downtown', reward: 4200, speaker: 'voss', lines: ['The Costa Trust annex holds the Syndicate ledger and every name in it.', 'Get inside, take the book, and escape my three-star response.'] },
  { id: 'costa-trust-score', name: 'The Costa Trust Score', district: 'Downtown', reward: 12000, speaker: 'marisol', lines: ['Voss sold our route to Dante. The ledger proved it; now the tower vault is open.', 'Take the last score, get to the getaway, and do not look back.'] },
];

export const EPILOGUE_CARDS = [
  { speaker: 'rico', title: 'THE LAST SCORE', lines: ['The Costa Trust lights went dark. The city kept its secrets.', 'Rico got out with the ledger and enough to start over.'] },
  { speaker: 'marisol', title: 'A NEW MORNING', lines: ['Dante disappeared. Voss was left holding the names he tried to bury.', 'Costa Vela never sleeps. Rico finally gets to choose what comes next.'] },
];
