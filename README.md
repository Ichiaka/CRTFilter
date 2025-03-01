# CRTFilter

CRTFilter is a JavaScript library that applies a CRT effect to a `canvas` using WebGL. This effect is ideal for retro-style video games that aim to replicate old CRT screens.

## Features

- **WebGL2 Support with Fallback to WebGL1**
  - The CRT filter now initializes **WebGL2** by default for improved performance and additional graphical capabilities.
  - If WebGL2 is not available, it automatically falls back to **WebGL1** to ensure maximum compatibility.

- **CRT Visual Effects:**
  - **Barrel Distortion (`barrelDistortion`)**: Simulates the curvature of CRT screens.
  - **Chromatic Aberration (`chromaticAberration`)**: Slight separation of RGB colors.
  - **Static Noise (`staticNoise`)**: Adds visual interference.
  - **Horizontal Tearing (`horizontalTearing`)**: Distorts the image.
  - **Glow Bloom (`glowBloom`)**: Simulates phosphorescence in CRT screens.
  - **Vertical Jitter (`verticalJitter`)**: Slight oscillation of the image.
  - **Retrace Lines (`retraceLines`)**: Typical CRT refresh lines.
  - **Dot Mask (`dotMask`)**: Simulates the pixel structure of CRTs.
  - **Brightness and Contrast Adjustments (`brightness`, `contrast`)**: Fine-tune the display brightness and contrast for a customized CRT experience.
  - **Desaturation Effect (`desaturation`)**: Reduces color saturation to simulate faded or aged CRT screens.
  - **Flicker Simulation (`flicker`)**: Introduces random flickering, mimicking CRT screen instabilities.
  - **Scanline Intensity Control (`scanlineIntensity`)**: Adjusts the visibility of scanlines, making them more or less prominent.
  - **Curvature Adjustment (`curvature`)**: Enables dynamic control over CRT screen curvature for a more or less exaggerated distortion effect.

- **Advanced Visual Distortions:**
  - **Signal Loss Effect (`signalLoss`)**: Simulates VHS or UHF signal loss artifacts, creating an authentic vintage video distortion effect.
  - **Motion Blur Effect (`motionBlur`)** *(Upcoming)*: Adds a motion blur effect to simulate fast movement on CRT screens.
  - **Horizontal Rolling Effect (`horizontalRoll`)** *(New Feature)*: Simulates the rolling screen effect seen in old CRTs losing signal sync.
  - **VHS Tracking Artifacts (`trackingJitter`)** *(New Feature)*: Mimics the horizontal tracking distortions found in VHS tapes.

- **Event Support:**
  - Forwards events from the new `canvas` to the original.

### Future Plans:
- Additional VHS tracking errors and rolling effects.
- More customizable distortion patterns for different CRT types.
- Audio-based interference effects (if applicable in future updates).

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
    barrelDistortion: 0.001, // Simulates CRT screen curvature
    curvature: 0.002, // Adjusts the amount of CRT screen curvature
    chromaticAberration: 0.0005, // Slightly separates RGB colors for a realistic effect
    staticNoise: 0.001, // Adds static noise to the image
    horizontalTearing: 0.00012, // Simulates horizontal distortion in a faulty screen
    glowBloom: 0.001, // Simulates the glow of CRT pixels
    verticalJitter: 0.001, // Makes the image slightly oscillate vertically
    retraceLines: true, // Adds CRT refresh lines
    scanlineIntensity: 0.6, // Adjusts scanline intensity
    dotMask: false, // Simulates the pixel structure of a CRT screen
    motionBlur: 0, // Simulates motion blur (currently not implemented)
    brightness: 0.9, // Adjusts screen brightness
    contrast: 1.0, // Adjusts image contrast
    desaturation: 0.2, // Reduces color saturation for a faded effect
    flicker: 0.01, // Simulates occasional flicker on a CRT screen
    signalLoss: 0.05 // Simulates VHS or UHF signal loss artifacts
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

## Examples

Live preview: [CRTFilter Examples](https://ichiaka.github.io/CRTFilter/)

### Before and After Comparison (WARNING)

The effect is dynamic, so these static images do not accurately represent the results. For better undestanding check Live preview.

| Before | After |
|--------|-------|
| <img src="/images/imagen1.jpg" alt="Description" width="350" height="350"> | <img src="/images/after1.png" alt="Description" width="350" height="350"> |
| <img src="/images/imagen5.jpg" alt="Description" width="350" height="350"> | <img src="/images/after5.png" alt="Description" width="350" height="350"> |
|<img src="/images/imagen11.jpg" alt="Description" width="350" height="350"> | <img src="/images/after11.png" alt="Description" width="350" height="350"> |

## Compatibility

Requires WebGL support in the browser. Works in most modern browsers.

## License

This project is licensed under the MIT License.

