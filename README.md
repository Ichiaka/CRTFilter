# CRTFilterWebGL

CRTFilterWebGL is a JavaScript library that applies a CRT effect to a `canvas` using WebGL. This effect is ideal for retro-style video games that aim to replicate old CRT screens.

## Features

- **Barrel Distortion**: Simulates the curvature of CRT screens.
- **Chromatic Aberration**: Slight separation of RGB colors.
- **Static Noise**: Adds visual interference.
- **Horizontal Tearing**: Distorts the image.
- **Glow Bloom**: Simulates phosphorescence in CRT screens.
- **Vertical Jitter**: Slight oscillation of the image.
- **Retrace Lines**: Typical CRT refresh lines.
- **Dot Mask**: Simulates the pixel structure of CRTs.
- **Event Support**: Forwards events from the new `canvas` to the original.

## Installation

You can include the library in your project by downloading the file or importing it into your JavaScript code.

```js
import { CRTFilterWebGL } from './CRTFilterWebGL.js';
```

## Usage

### Initialization

```js
const canvas = document.getElementById("myCanvas");
const crtEffect = new CRTFilterWebGL(canvas);
crtEffect.start();
```

### Configuration

You can customize the effects by adjusting the configuration parameters:

```js
const config = {
    barrelDistortion: 0.0002,
    chromaticAberration: 0.00005,
    staticNoise: 0.002,
    horizontalTearing: 0.00015,
    glowBloom: 0.0002,
    verticalJitter: 0.00015,
    retraceLines: true,
    dotMask: true,
};

const crtEffect = new CRTFilterWebGL(canvas, config);
crtEffect.start();
```

### Stop the Effect

```js
crtEffect.stop();
```

## API

### `new CRTFilterWebGL(canvas, config)`

- **`canvas`** *(HTMLCanvasElement)*: The original `canvas` where the effect will be applied.
- **`config`** *(Object, optional)*: Customization parameters.

### `start()`

Starts the CRT effect.

### `stop()`

Stops the CRT effect and restores the original `canvas`.

## Compatibility

Requires WebGL support in the browser. Works in most modern browsers.

## License

This project is licensed under the MIT License.

