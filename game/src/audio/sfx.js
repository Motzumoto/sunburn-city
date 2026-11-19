// Purpose: map game events to synthesized sound parameters.
// Main exports: playSfx.
// Inputs: AudioEngine instance and event name.
// Outputs: invokes tone synthesis for known events.
// Side effects: emits WebAudio tones.
// Notes: unknown event names are ignored.
export function playSfx(audio,event){const sounds={shot:[180,.07,'square'],reload:[580,.12,'sine'],horn:[260,.24,'sawtooth'],impact:[95,.16,'triangle'],mission:[780,.4,'sine'],click:[620,.045,'sine'],engine:[75,.1,'sawtooth'],siren:[920,.2,'square']};const s=sounds[event];if(s)audio.tone(...s);}
// Purpose: map game events to synthesized sound parameters.
// Main exports: playSfx.
// Inputs: AudioEngine instance and event name.
// Outputs: invokes tone synthesis for known events.
// Side effects: emits WebAudio tones.
// Notes: unknown event names are ignored.
