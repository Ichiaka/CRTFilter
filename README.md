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

## Changelog - Latest Updates

### Added Features v1.1:
- **WebGL2 Support with Fallback to WebGL1**
  - The CRT filter now initializes **WebGL2** by default for improved performance and additional graphical capabilities.
  - If WebGL2 is not available, it automatically falls back to **WebGL1** to ensure maximum compatibility.
  
- **Signal Loss Effect (`signalLoss`)**
  - Simulates VHS or UHF signal loss artifacts, creating an authentic vintage video distortion effect.
  - Configurable intensity to enhance the effect depending on user preference.
  
- **Brightness and Contrast Adjustments (`brightness`, `contrast`)**
  - Allows users to fine-tune the display brightness and contrast for a more customized CRT experience.
  
- **Desaturation Effect (`desaturation`)**
  - Reduces color saturation to simulate faded or aged CRT screens.
  
- **Flicker Simulation (`flicker`)**
  - Introduces random flickering, mimicking CRT screen instabilities.
  
- **Scanline Intensity Control (`scanlineIntensity`)**
  - Adjusts the visibility of scanlines, making them more or less prominent.
  
- **Curvature Adjustment (`curvature`)**
  - Enables dynamic control over CRT screen curvature for a more or less exaggerated distortion effect.
  
### Updated Shader Code:
- Fragment shader now includes signal loss simulation, affecting brightness dynamically along the vertical axis.
- Enhanced chromatic aberration, noise, and jitter for a more immersive retro effect.
- Optimized performance for WebGL2 rendering while maintaining WebGL1 support for legacy browsers.
  
### How to Use the New Features:
Modify the configuration object when initializing the effect:
```js
const config = {
    signalLoss: 0.05,  // Adjusts intensity of VHS-like signal loss artifacts
    brightness: 1.2,   // Increase or decrease overall screen brightness
    contrast: 1.1,     // Controls contrast enhancement
    desaturation: 0.3, // Makes colors appear more washed out
    flicker: 0.05,     // Creates slight screen flickering
    scanlineIntensity: 0.7, // Makes scanlines more visible
    curvature: 0.004  // Enhances or reduces CRT curvature effect
};
const crtEffect = new CRTFilterWebGL(canvas, config);
crtEffect.start();
```

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
    barrelDistortion: 0.0002,
    chromaticAberration: 0.00005,
    staticNoise: 0.002,
    horizontalTearing: 0.00015,
    glowBloom: 0.0002,
    verticalJitter: 0.00015,
    retraceLines: true,
    dotMask: true,
    brightness: 1.2,
    contrast: 1.1,
    desaturation: 0.3,
    flicker: 0.05,
    scanlineIntensity: 0.7,
    curvature: 0.004,
    signalLoss: 0.05,
    horizontalRoll: 0.02,
    trackingJitter: 0.03
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

Live preview: [CRTFilter Examples](https://ichiaka.github.io/CRTFilter/Examples/)

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

