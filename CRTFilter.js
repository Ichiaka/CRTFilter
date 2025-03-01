/*!
 * CRTFilterWebGL - A WebGL-based CRT effect for HTML5 Canvas
 * 
 * @version 1.1.0
 * @license MIT
 * @author Aka
 * @repository https://github.com/Ichiaka/CRTFilterWebGL
 * 
 * Copyright (c) 2025 Aka
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export class CRTFilterWebGL {
    constructor(canvas, config = {}) {
        if (!canvas) {
            console.error("Canvas not found.");
            return;
        }

        this.sourceCanvas = canvas;
        this.glcanvas = document.createElement('canvas');
        this.glcanvas.width = canvas.width;
        this.glcanvas.height = canvas.height;
        this.glcanvas.className = canvas.className;

        this.gl = this.glcanvas.getContext('webgl2') || this.glcanvas.getContext('webgl')
        if (!this.gl) {
            console.error("WebGL is not supported.");
            return;
        }

        this.config = Object.assign({
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
        }, config);

        this.initShaders();
        this.initBuffers();
        this.initTexture();
        this.animationFrameId = null;
        this.forwardEvents();
    }
    initBuffers() {
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    
        // Cuadrado de pantalla completa en coordenadas normalizadas (-1 a 1)
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1
        ]);
    
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
        const positionLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    
    initTexture() {
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("Error compiling shader:", this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    
    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error("Error linking program:", this.gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }
    
    
    initShaders() {
        const fragmentShaderSource = `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform sampler2D u_texture;
            uniform float u_time;
            uniform float u_barrel; // CRT screen curvature
            uniform float u_aberration; // Chromatic aberration effect
            uniform float u_noise; // Static noise level
            uniform float u_tearing; // Horizontal tearing effect
            uniform float u_glow; // Bloom effect to simulate pixel glow
            uniform float u_jitter; // Vertical jitter for instability
            uniform bool u_retrace; // Enables retrace scan lines
            uniform bool u_dotMask; // Enables dot mask effect
            uniform float u_brightness; // Adjusts overall brightness
            uniform float u_contrast; // Adjusts contrast level
            uniform float u_desaturation; // Desaturates colors for a faded look
            uniform float u_flicker; // Simulates flickering effect
            uniform float u_scanlineIntensity; // Controls scanline visibility
            uniform float u_curvature; // Adjusts CRT curvature intensity
            uniform float u_signalLoss; // Simulates signal loss effect (VHS, UHF interference)

            vec2 barrelDistortion(vec2 uv, float amount) {
                vec2 centered = uv - 0.5;
                float dist = dot(centered, centered);
                return uv + centered * dist * amount;
            }

            void main() {
                vec2 uv = v_texCoord;
                uv = barrelDistortion(uv, u_barrel + u_curvature);

                vec3 col;
                // Apply chromatic aberration by shifting red and blue channels
                col.r = texture2D(u_texture, uv + vec2(u_aberration, 0)).r;
                col.g = texture2D(u_texture, uv).g;
                col.b = texture2D(u_texture, uv - vec2(u_aberration, 0)).b;

                // Add static noise
                col += (fract(sin(dot(uv.xy, vec2(12.9898,78.233))) * 43758.5453) - 0.5) * u_noise;

                // Apply horizontal tearing distortion
                uv.x += sin(uv.y * 10.0 + u_time * 2.0) * u_tearing;
                col *= texture2D(u_texture, uv).rgb;

                // Add glow bloom effect
                col += u_glow * smoothstep(0.5, 1.0, col);

                // Apply vertical jitter
                uv.y += sin(u_time * 5.0) * u_jitter;

                // Simulate signal loss effect
                col *= 1.0 - (u_signalLoss * abs(sin(uv.y * 50.0 + u_time * 10.0)));

                // Apply retrace scan lines
                if (u_retrace) {
                    col *= 1.9 + u_scanlineIntensity * sin(uv.y * 800.0 + u_time * 10.0);
                }

                // Apply dot mask effect
                if (u_dotMask) {
                    col *= vec3(1.0, 0.9 + 0.1 * mod(uv.x * 100.0, 2.0), 0.9 + 0.1 * mod(uv.y * 100.0, 2.0));
                }

                // Apply desaturation effect
                col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, 1.0 - u_desaturation);

                // Adjust contrast
                col = (col - 0.5) * u_contrast + 0.5;

                // Adjust brightness
                col *= u_brightness;

                // Simulate flickering effect
                col *= 1.0 + u_flicker * sin(u_time * 60.0);

                gl_FragColor = vec4(col, 1.0);
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, `
            attribute vec2 a_position;
            varying vec2 v_texCoord;
            void main() {
                v_texCoord = vec2(a_position.x, 1.0 - a_position.y);
                gl_Position = vec4(a_position * 2.0 - 1.0, 0, 1);
            }
        `);

        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = this.createProgram(vertexShader, fragmentShader);
        this.gl.useProgram(this.program);
    }

    renderCRT() {
        if (!this.sourceCanvas) return;
        const ctx = this.sourceCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, this.sourceCanvas.width, this.sourceCanvas.height);
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageData);
        this.gl.useProgram(this.program);
    
        // Pass updated uniform values to the shader
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_time"), performance.now() / 1000.0);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_barrel"), this.config.barrelDistortion);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_aberration"), this.config.chromaticAberration);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_noise"), this.config.staticNoise);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_tearing"), this.config.horizontalTearing);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_glow"), this.config.glowBloom);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_jitter"), this.config.verticalJitter);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "u_retrace"), this.config.retraceLines);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "u_dotMask"), this.config.dotMask);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_brightness"), this.config.brightness);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_contrast"), this.config.contrast);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_desaturation"), this.config.desaturation);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_flicker"), this.config.flicker);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_scanlineIntensity"), this.config.scanlineIntensity);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_curvature"), this.config.curvature);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_signalLoss"), this.config.signalLoss);
    
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.animationFrameId = requestAnimationFrame(() => this.renderCRT());
    }

    start() {
        if (!this.animationFrameId) {
            this.sourceCanvas.parentNode.insertBefore(this.glcanvas, this.sourceCanvas);
            this.sourceCanvas.remove();
            this.renderCRT();
        }
    }


    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            this.glcanvas.parentNode.replaceChild(this.sourceCanvas, this.glcanvas);
            this.sourceCanvas.style.display = '';
        }
    }

    forwardEvents() {
        this.glcanvas.addEventListener('click', (e) => this.redirectEvent(e));
        this.glcanvas.addEventListener('mousemove', (e) => this.redirectEvent(e));
        this.glcanvas.addEventListener('mousedown', (e) => this.redirectEvent(e));
        this.glcanvas.addEventListener('mouseup', (e) => this.redirectEvent(e));
        this.glcanvas.addEventListener('keydown', (e) => this.redirectEvent(e));
        this.glcanvas.addEventListener('keyup', (e) => this.redirectEvent(e));
    }

    redirectEvent(event) {
        let newEvent = new event.constructor(event.type, event);
        this.sourceCanvas.dispatchEvent(newEvent);
    }
}