// Costa Vela's warm golden-hour and cool midnight color ramps.
export const COLORS={sand:'#d9c39a',coral:'#ef7d63',teal:'#2f8f8f',shadow:'#1d3340',cream:'#fff0cf',road:'#363c42',sea:'#39aeb0'};
export function lightAt(hour){
  const t=((hour%24)+24)%24;
  if(t<5||t>20)return{wash:'rgba(12,24,46,.30)',sky:'#1d3340',glow:.68,warm:'#ffb56e',cool:'#5a8dd4'};
  if(t<8||t>17)return{wash:'rgba(239,125,99,.17)',sky:'#edaa83',glow:.84,warm:'#ffd095',cool:'#74b9bd'};
  return{wash:'rgba(255,240,207,.045)',sky:'#9bc7bf',glow:.2,warm:'#fff0cf',cool:'#65aeb1'};
}
