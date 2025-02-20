export class CRTFilterWebGL {
    constructor(canvas, config = {}) {
        if (!canvas) {
            console.error("Canvas no encontrado.");
            return;
        }

        this.sourceCanvas = canvas;
        this.glcanvas = document.createElement('canvas');
        this.glcanvas.width = canvas.width;
        this.glcanvas.height = canvas.height;
        this.glcanvas.className = canvas.className;

        this.gl = this.glcanvas.getContext('webgl');
        if (!this.gl) {
            console.error("WebGL no soportado.");
            return;
        }

        this.config = Object.assign({
            barrelDistortion: 0.01,
            chromaticAberration: 0.002,
            staticNoise: 0.1,
            horizontalTearing: 0.0012,
            glowBloom: 0.01,
            verticalJitter: 0.1,
            retraceLines: true,
            dotMask: false,
            motionBlur: 0,
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
            console.error("Error compilando shader:", this.gl.getShaderInfoLog(shader));
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
            console.error("Error enlazando programa:", this.gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }
    
    
    initShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_texCoord;
            void main() {
                v_texCoord = vec2(a_position.x, 1.0 - a_position.y);
                gl_Position = vec4(a_position * 2.0 - 1.0, 0, 1);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform sampler2D u_texture;
            uniform float u_time;
            uniform float u_barrel;
            uniform float u_aberration;
            uniform float u_noise;
            uniform float u_tearing;
            uniform float u_glow;
            uniform float u_jitter;
            uniform bool u_retrace;
            uniform bool u_dotMask;

            vec2 barrelDistortion(vec2 uv, float amount) {
                vec2 centered = uv - 0.5;
                float dist = dot(centered, centered);
                return uv + centered * dist * amount;
            }

            void main() {
                vec2 uv = v_texCoord;

                // Distorsión de barril
                uv = barrelDistortion(uv, u_barrel);

                // Aberración cromática
                vec3 col;
                col.r = texture2D(u_texture, uv + vec2(u_aberration, 0)).r;
                col.g = texture2D(u_texture, uv).g;
                col.b = texture2D(u_texture, uv - vec2(u_aberration, 0)).b;

                // Ruido estático
                col += (fract(sin(dot(uv.xy, vec2(12.9898,78.233))) * 43758.5453) - 0.5) * u_noise;

                // Distorsión horizontal
                uv.x += sin(uv.y * 10.0 + u_time * 2.0) * u_tearing;
                col *= texture2D(u_texture, uv).rgb;

                // Resplandor
                col += u_glow * smoothstep(0.5, 1.0, col);

                // Vibración vertical
                uv.y += sin(u_time * 5.0) * u_jitter;

                // Líneas de retrace
                if (u_retrace) {
                    col *= 0.9 + 0.1 * sin(uv.y * 800.0 + u_time * 10.0);
                }

                // Máscara de puntos
                if (u_dotMask) {
                    col *= vec3(1.0, 0.9 + 0.1 * mod(uv.x * 100.0, 2.0), 0.9 + 0.1 * mod(uv.y * 100.0, 2.0));
                }

                gl_FragColor = vec4(col, 1.0);
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
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
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_time"), performance.now() / 1000.0);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_barrel"), this.config.barrelDistortion);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_aberration"), this.config.chromaticAberration);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_noise"), this.config.staticNoise);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_tearing"), this.config.horizontalTearing);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_glow"), this.config.glowBloom);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_jitter"), this.config.verticalJitter);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "u_retrace"), this.config.retraceLines);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "u_dotMask"), this.config.dotMask);
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