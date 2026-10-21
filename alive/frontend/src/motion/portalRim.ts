// A small original shader: it remaps local artwork around a moving aperture.
// No reference site source, textures, or shaders are used.
export function createPortalRim(canvas: HTMLCanvasElement, imageUrl: string) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false })
  if (!gl) return { draw: () => undefined, dispose: () => undefined }
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source); gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('Portal shader could not compile') }
    return shader
  }
  const vertex = compile(gl.VERTEX_SHADER, 'attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}')
  const fragment = compile(gl.FRAGMENT_SHADER, `precision highp float;
    uniform vec2 u_size; uniform float u_ratio; uniform float u_progress; uniform sampler2D u_art;
    void main(){
      vec2 p=vec2(gl_FragCoord.x/u_ratio,u_size.y-gl_FragCoord.y/u_ratio)-u_size*.5;
      p.y/=.92; float angle=atan(p.y,p.x);float distance=length(p);
      float maxRadius=length(vec2(u_size.x*.5,u_size.y/1.84))*1.16;
      float wobble=sin(u_progress*3.14159265)*.08;
      float radius=maxRadius*u_progress*(1.+wobble*(sin(angle*3.+u_progress*3.)+.5*sin(angle*5.-u_progress*2.)));
      float thickness=max(1.5,min(u_size.x,u_size.y)*.1*pow(1.-u_progress,6.));
      float edge=distance-radius;float alpha=smoothstep(-1.5,0.,edge)*(1.-smoothstep(thickness,thickness+1.5,edge));
      alpha*=smoothstep(0.,.035,u_progress)*(1.-smoothstep(.82,1.,u_progress));
      float turn=(angle+3.14159265)/6.2831853;
      vec2 uv=vec2(fract(turn*2.+edge*.003+u_progress*.17),fract(edge*.025+turn*.6));
      vec3 color=texture2D(u_art,uv).rgb;
      float stripe=.72+.28*sin(edge*2.4+angle*4.);color=mix(color*stripe,vec3(.93,.92,.88),.24);
      float border=1.-smoothstep(0.,2.,abs(abs(edge)-thickness));color=mix(color,vec3(.17,.18,.16),border*.5);
      gl_FragColor=vec4(color,alpha);
    }`)
  const program = gl.createProgram()!
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program); gl.useProgram(program)
  const buffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
  const attribute = gl.getAttribLocation(program, 'a_position'); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0)
  const texture = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, texture); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([170,174,161,255]))
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
  const picture = new Image(); let disposed = false
  picture.onload = () => { if (!disposed) { gl.bindTexture(gl.TEXTURE_2D,texture); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,picture) } }
  picture.src = imageUrl
  const size = gl.getUniformLocation(program,'u_size'), ratio = gl.getUniformLocation(program,'u_ratio'), progress = gl.getUniformLocation(program,'u_progress')
  return {
    draw(value: number) {
      if (disposed || gl.isContextLost()) return
      const dpr = Math.min(window.devicePixelRatio,1.5), width=window.innerWidth,height=window.innerHeight
      if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height)}
      gl.uniform2f(size,width,height);gl.uniform1f(ratio,dpr);gl.uniform1f(progress,value);gl.drawArrays(gl.TRIANGLES,0,6)
    },
    dispose() { disposed=true;picture.onload=null;gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment) },
  }
}
