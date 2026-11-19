// Event-to-tone map for tactile weapon, vehicle and mission feedback.
export function playSfx(audio,event){const sounds={shot:[180,.07,'square'],reload:[580,.12,'sine'],horn:[260,.24,'sawtooth'],impact:[95,.16,'triangle'],mission:[780,.4,'sine'],click:[620,.045,'sine'],engine:[75,.1,'sawtooth'],siren:[920,.2,'square']};const s=sounds[event];if(s)audio.tone(...s);}
