# @indhu_hehhehe/wave-background

Animated SVG wave background for React. GPU-accelerated, simplex-noise driven, zero dependencies beyond React.

## Install

```bash
npm install @indhu_hehhehe/wave-background
```

## Usage

```tsx
import { Waves } from '@indhu_hehhehe/wave-background'

export default function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh' }}>
      <Waves backgroundColor="#FAFAF8" />
      <div style={{ position: 'relative', zIndex: 2 }}>
        Your content here
      </div>
    </section>
  )
}
```

## Props

| Prop            | Type                          | Default     | Description                                      |
|-----------------|-------------------------------|-------------|--------------------------------------------------|
| `backgroundColor` | `string`                    | `transparent` | Background fill of the container               |
| `className`     | `string`                      | `""`        | Extra CSS class on the container div             |
| `xGap`          | `number`                      | `8`         | Horizontal gap between lines (px) — smaller = more lines |
| `yGap`          | `number`                      | `8`         | Vertical gap between points on each line (px)   |
| `waveX`         | `number`                      | `20`        | Max horizontal displacement per point (px)       |
| `waveY`         | `number`                      | `10`        | Max vertical displacement per point (px)         |
| `palette`       | `[number,number,number][]`    | orange→yellow→blue→black | RGB colour palette to cycle through |
| `colorCycle`    | `number`                      | `5000`      | Duration of one full colour cycle (ms)           |
| `frameInterval` | `number`                      | `42`        | Min ms between frames (~24fps). Raise to reduce CPU |
| `maskImage`     | `string`                      | radial bottom fade | CSS `mask-image` for gradient fade effects  |

## Build (for contributors)

```bash
npm install
npm run build   # outputs to dist/
```

## Publish

```bash
npm login
npm publish --access public
```
