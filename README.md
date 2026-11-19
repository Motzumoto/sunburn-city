# sunburn-city

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/Motzumoto/sunburn-city/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/Motzumoto/sunburn-city/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

An original top-down open-world crime game set in Costa Vela: walk the boulevards and the boardwalk, steal any car, outrun a rising wanted level, and play six jobs from a fixer, all drawn on Canvas with locally generated art and sound.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Serving `game/` as the static web root and opening `index.html` in desktop Chrome works too: no build step, no external assets, no network requests.

### Controls

- **WASD / arrow keys:** walk or drive; **Shift:** sprint on foot.
- **E:** enter or leave a nearby vehicle; pay off wanted heat at a Sunspray shop.
- **Mouse:** aim and fire; **1–4:** select a weapon; **R:** reload.
- **Space:** melee; **Tab / M:** city map; **Esc:** pause.
- **Mouse wheel:** change radio station while driving.

### Screenshots

`shots.json` lists four deterministic scenes (`city`, `chase`, `mission`, `heist`), each selectable with `?shot=<name>&seed=1`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xb3xm9eh&utm_source=github&utm_medium=readme&utm_campaign=gta6-01) · AI agents build software for cash rewards</sub>
