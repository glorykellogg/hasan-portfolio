/* Neon water — dependency-free, procedural WebGL homepage background.
   Add <div data-neon-water aria-hidden="true"></div> and load this script.
   Give the container a width/height; position content above it with z-index.
   Optional: data-speed="0.7" data-scale="1.0". */
(() => {
  'use strict';
  const vertex = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0., 1.); }
  `;
  const fragment = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform float scale;
    uniform vec2 pointer;
    uniform float pointerStrength;
    vec2 hash(vec2 p) {
      return fract(sin(vec2(dot(p, vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))))*43758.5453);
    }
    // Distance to a gently moving cellular boundary: the network of pool light.
    float caustic(vec2 p, float t) {
      vec2 cell = floor(p), local = fract(p);
      float first = 20.;
      vec2 nearest = vec2(0.);
      vec2 nearestCell = vec2(0.);
      for(int y=-1; y<=1; y++) {
        for(int x=-1; x<=1; x++) {
          vec2 offset = vec2(float(x),float(y));
          vec2 seed = hash(cell + offset);
          vec2 point = offset + .5 + .32*sin(t*.63 + 6.2831*seed) - local;
          float d = dot(point,point);
          if(d < first) { first=d; nearest=point; nearestCell=offset; }
        }
      }
      float edge = 20.;
      for(int y=-2; y<=2; y++) {
        for(int x=-2; x<=2; x++) {
          vec2 offset = nearestCell + vec2(float(x),float(y));
          vec2 seed = hash(cell + offset);
          vec2 point = offset + .5 + .32*sin(t*.63 + 6.2831*seed) - local;
          vec2 delta = point-nearest;
          if(dot(delta,delta)>.0001)
            edge=min(edge,dot(.5*(nearest+point),normalize(delta)));
        }
      }
      return max(edge,0.);
    }
    // Crossed swells and smaller capillary waves define a continuous surface.
    float surface(vec2 p, float t) {
      float h = .36*sin(dot(p,vec2(1.15,.72))-t*.85);
      h += .23*sin(dot(p,vec2(-.83,1.42))-t*.67+1.8);
      h += .105*sin(dot(p,vec2(2.7,1.9))+t*1.12+.8*sin(p.y-t*.2));
      h += .055*sin(dot(p,vec2(-4.1,3.3))-t*1.45);
      h += .022*sin(dot(p,vec2(7.3,5.8))+t*1.8);
      return h;
    }
    void main() {
      vec2 uv = gl_FragCoord.xy/resolution;
      vec2 p = (gl_FragCoord.xy-.5*resolution)/min(resolution.x,resolution.y);
      float t = time;
      p *= 5.4*scale;
      vec2 cursor = (pointer-.5)*resolution/min(resolution.x,resolution.y)*5.4*scale;
      vec2 fromCursor = p-cursor;
      float radius = length(fromCursor);
      float wake = sin(radius*9.-t*4.)*exp(-radius*radius*1.4)*pointerStrength;
      p += fromCursor/max(radius,.08)*wake*.065;
      // Several wave fields bend the light into irregular liquid loops.
      float height=surface(p,t);
      vec2 slope=vec2(surface(p+vec2(.015,0.),t)-surface(p-vec2(.015,0.),t),
                      surface(p+vec2(0.,.015),t)-surface(p-vec2(0.,.015),t))/.03;
      vec3 normal=normalize(vec3(-slope*.85,1.));
      vec2 q=p+slope*.35;
      q += .43*vec2(sin(p.y*2.1+t*.35)+sin(p.x*1.4+p.y*.7-t*.24),
                     cos(p.x*1.8-t*.28)+sin(p.y*1.3+p.x*.8+t*.31));
      q += .14*vec2(sin(p.y*7.+p.x*2.+t*.7),cos(p.x*6.-p.y*2.-t*.6));
      q += .12*vec2(sin(q.y*3.7-q.x*2.1-t*.42),cos(q.x*4.3+q.y*1.6+t*.38));
      float edge = caustic(q+vec2(t*.045,-t*.025),t);
      float secondary = caustic(q*1.37+vec2(2.8,-1.7)-t*.018,t*.8+2.);
      float glow = exp(-edge*8.5);
      float core = exp(-edge*32.);
      float scattered = exp(-secondary*16.);
      float haze = .5+.5*sin(q.x*1.3+sin(q.y*1.7-t*.2)+t*.17);
      float pool = .5+.5*sin(p.y*.7-p.x*.8+t*.12);
      vec3 purple = vec3(.25,.018,.60);
      vec3 pink = vec3(.83,.025,.49);
      vec3 color=mix(purple,pink,.25+.58*pool);
      color += vec3(.12,.015,.16)*haze;
      // Light moves across wave faces rather than lighting every edge equally.
      vec3 light=normalize(vec3(-.45,.65,1.1));
      float diffuse=max(dot(normal,light),0.);
      vec3 reflection=reflect(vec3(0.,0.,-1.),normal);
      float sheen=pow(max(dot(reflection,light),0.),12.);
      float glint=pow(max(dot(reflection,normalize(vec3(.5,-.2,1.))),0.),38.);
      float reflectedBands=.5+.5*sin(reflection.x*4.+reflection.y*3.+height*2.);
      color *= .66+.38*diffuse+.12*height;
      color += reflectedBands*vec3(.075,.025,.13);
      color += scattered*vec3(.075,.025,.11);
      color += glow*vec3(.19,.05,.24);
      color = mix(color,vec3(1.,.50,.92),core*(.32+.3*diffuse));
      color += sheen*vec3(.32,.18,.32)+glint*vec3(.35,.26,.32);
      color += pow(glow,3.)*vec3(.12,.08,.12);
      float vignette = 1.-.14*dot(uv-.5,uv-.5);
      // Charcoal water with neutral silver reflections.
      float silver=dot(color,vec3(.299,.587,.114));
      silver=clamp((silver-.10)*1.42,0.,1.);
      gl_FragColor=vec4(vec3(silver)*vignette,1.);
    }
  `;
  document.querySelectorAll('[data-neon-water]').forEach(host => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { alpha:false, antialias:false, powerPreference:'low-power' });
    if (!gl) return; // The container's CSS gradient remains as a fallback.
    const shaders = [];
    const compile = (type, source) => {
      const shader=gl.createShader(type);
      gl.shaderSource(shader,source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      shaders.push(shader); return shader;
    };
    try {
      const program=gl.createProgram();
      gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));
      gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'position');
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      const res=gl.getUniformLocation(program,'resolution');
      const clock=gl.getUniformLocation(program,'time');
      const pointerUniform=gl.getUniformLocation(program,'pointer');
      const strengthUniform=gl.getUniformLocation(program,'pointerStrength');
      gl.uniform1f(gl.getUniformLocation(program,'scale'),Math.max(.2,Number(host.dataset.scale)||1));
      host.appendChild(canvas);
      canvas.style.filter='blur(5px)';
      canvas.style.transform='scale(1.025)';
      const motion=matchMedia('(prefers-reduced-motion: reduce)');
      const speed=Math.max(0,Number(host.dataset.speed ?? .7)||0);
      let frame=0, elapsed=0, last=0, visible=true;
      const pointer={x:.5,y:.5,targetX:.5,targetY:.5,strength:0,targetStrength:0};
      // Window listeners keep the background interactive beneath homepage text.
      window.addEventListener('pointermove',event=>{
        const bounds=host.getBoundingClientRect();
        const x=(event.clientX-bounds.left)/Math.max(bounds.width,1);
        const y=1-(event.clientY-bounds.top)/Math.max(bounds.height,1);
        pointer.targetX=x; pointer.targetY=y;
        pointer.targetStrength=x>=0&&x<=1&&y>=0&&y<=1 ? 1 : 0;
      },{passive:true});
      document.documentElement.addEventListener('pointerleave',()=>{pointer.targetStrength=0;});
      window.addEventListener('blur',()=>{pointer.targetStrength=0;});
      const draw=() => {
        const ratio=Math.min(devicePixelRatio||1,1.5);
        // Cap the render size to keep the shader light on laptops and phones.
        const factor=Math.min(ratio,1400/Math.max(host.clientWidth,host.clientHeight,1));
        const w=Math.max(1,Math.round(host.clientWidth*factor));
        const h=Math.max(1,Math.round(host.clientHeight*factor));
        if(canvas.width!==w||canvas.height!==h) { canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h); }
        gl.uniform2f(res,w,h); gl.uniform1f(clock,elapsed);
        gl.uniform2f(pointerUniform,pointer.x,pointer.y);
        gl.uniform1f(strengthUniform,motion.matches?0:pointer.strength);
        gl.drawArrays(gl.TRIANGLES,0,6);
      };
      const tick=now => {
        frame=0;
        if(last) elapsed+=Math.min((now-last)/1000,.05)*speed;
        last=now; draw();
        pointer.x+=(pointer.targetX-pointer.x)*.09;
        pointer.y+=(pointer.targetY-pointer.y)*.09;
        pointer.strength+=(pointer.targetStrength-pointer.strength)*.065;
        if(!motion.matches&&visible&&!document.hidden) frame=requestAnimationFrame(tick);
      };
      const sync=() => {
        cancelAnimationFrame(frame);frame=0;last=0;draw();
        if(!motion.matches&&visible&&!document.hidden) frame=requestAnimationFrame(tick);
      };
      new ResizeObserver(draw).observe(host);
      new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(host);
      motion.addEventListener('change',sync);
      document.addEventListener('visibilitychange',sync);
      canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);});
      canvas.addEventListener('webglcontextrestored',()=>location.reload());
      sync();
    } catch(error) {
      console.warn('Neon water could not start:',error);
      canvas.remove();
    }
  });
})();
