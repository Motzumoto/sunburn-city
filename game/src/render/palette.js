// Time-of-day color ramps shared by the world and atmospheric lighting pass.
export function lightAt(hour){const t=((hour%24)+24)%24; if(t<6||t>20)return{wash:'rgba(8,21,49,.46)',sky:'#263c61',glow:.55};if(t<8)return{wash:'rgba(247,133,91,.18)',sky:'#eea37e',glow:.9};if(t>17)return{wash:'rgba(246,139,92,.2)',sky:'#e8a077',glow:.9};return{wash:'rgba(247,220,163,.04)',sky:'#8bc4c1',glow:.2};}
