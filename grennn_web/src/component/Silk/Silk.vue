<!-- ============================================================
     Silk.vue - WebGL 丝绸背景动效组件
     使用 OGL（轻量级 WebGL 库）渲染基于噪声的流动丝绸效果
     通过自定义 GLSL 着色器实现平滑的波纹和颜色变化
     ============================================================ -->
<template>
  <!-- 容器元素，作为 WebGL Canvas 的父节点 -->
  <div ref="containerRef" :class="className" :style="style" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, type CSSProperties, useTemplateRef } from 'vue';
import { Renderer, Program, Mesh, Plane, Camera } from 'ogl';

/**
 * Silk 组件 Props 类型定义
 */
interface SilkProps {
  /** 动画速度（值越大流动越快） */
  speed?: number;
  /** 纹理缩放比例 */
  scale?: number;
  /** 丝绸主色调（十六进制颜色字符串，如 "#ffffff"） */
  color?: string;
  /** 噪声强度（值越大纹理颗粒感越强） */
  noiseIntensity?: number;
  /** 纹理旋转角度（弧度） */
  rotation?: number;
  /** 附加 CSS 类名 */
  className?: string;
  /** 附加内联样式 */
  style?: CSSProperties;
}

// 设置 Props 默认值
const props = withDefaults(defineProps<SilkProps>(), {
  speed: 5,
  scale: 1,
  color: '#7B7481',
  noiseIntensity: 1.5,
  rotation: 0,
  className: '',
  style: () => ({})
});

// 容器 DOM 引用，WebGL Canvas 将被追加到此元素内
const containerRef = useTemplateRef<HTMLDivElement>('containerRef');

/**
 * 将十六进制颜色字符串转换为归一化 RGB 三元组
 * WebGL uniform 需要 [0, 1] 范围的浮点数
 * @param hex - 十六进制颜色，如 "#7B7481"
 * @returns [r, g, b] 各分量范围 0~1
 */
const hexToNormalizedRGB = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
};

// ---- GLSL 顶点着色器 ----
// 将顶点位置传递给片段着色器，同时传递 UV 坐标
const vertexShader = `
attribute vec2 uv;
attribute vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// ---- GLSL 片段着色器 ----
// 通过正弦函数叠加噪声实现丝绸波动效果
// uTime 每帧递增，驱动动画；uNoiseIntensity 控制颗粒感
const fragmentShader = `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2 r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2 rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd = noise(gl_FragCoord.xy);
  vec2 uv = rotateUvs(vUv * uScale, uRotation);
  vec2 tex = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

// ---- WebGL 运行时变量（模块级，防止重复创建） ----
let renderer: Renderer | null = null;  // OGL 渲染器
let mesh: Mesh | null = null;          // 全屏平面网格
let program: Program | null = null;    // 着色器程序
let camera: Camera | null = null;      // 正交相机
let animateId = 0;                     // requestAnimationFrame ID

/**
 * 初始化 WebGL 场景
 * 1. 创建 OGL Renderer，绑定透明 Canvas
 * 2. 创建全屏 Plane 网格
 * 3. 绑定着色器和 uniforms
 * 4. 启动渲染循环
 * @returns 清理函数（可选）
 */
const initSilk = () => {
  const container = containerRef.value;
  if (!container) return;

  renderer = new Renderer({
    alpha: true,
    antialias: true
  });

  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);
  gl.canvas.style.backgroundColor = 'transparent';

  camera = new Camera(gl, { fov: 75 });
  camera.position.z = 1;

  // 响应窗口尺寸变化：重置渲染器尺寸和相机比例，并同步网格缩放
  const resize = () => {
    if (!container || !camera) return;

    let width = container.offsetWidth;
    let height = container.offsetHeight;

    // 向上遍历父元素，直到找到有效尺寸（应对 display:none 场景）
    let parent = container.parentElement;
    while (parent && (!width || !height)) {
      if (parent.offsetWidth && parent.offsetHeight) {
        width = parent.offsetWidth;
        height = parent.offsetHeight;
        break;
      }
      parent = parent.parentElement;
    }

    if (!width || !height) {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    width = Math.max(width, 300);
    height = Math.max(height, 300);

    renderer!.setSize(width, height);
    camera.perspective({ aspect: width / height });

    if (mesh) {
      const distance = camera.position.z;
      const fov = camera.fov * (Math.PI / 180);
      const height2 = 2 * Math.tan(fov / 2) * distance;
      const width2 = height2 * (width / height);

      mesh.scale.set(width2, height2, 1);
    }
  };

  window.addEventListener('resize', resize);

  const geometry = new Plane(gl, {
    width: 1,
    height: 1
  });

  const colorRGB = hexToNormalizedRGB(props.color);

  program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uSpeed: { value: props.speed },
      uScale: { value: props.scale },
      uNoiseIntensity: { value: props.noiseIntensity },
      uColor: { value: colorRGB },
      uRotation: { value: props.rotation },
      uTime: { value: 0 }
    }
  });

  mesh = new Mesh(gl, { geometry, program });
  container.appendChild(gl.canvas);

  gl.canvas.style.width = '100%';
  gl.canvas.style.height = '100%';
  gl.canvas.style.display = 'block';
  gl.canvas.style.position = 'absolute';
  gl.canvas.style.top = '0';
  gl.canvas.style.left = '0';
  gl.canvas.style.zIndex = '1';

  // ---- 渲染循环 ----
  // 使用 deltaTime 驱动 uTime 增长，保证不同帧率下速度一致
  let lastTime = 0;
  const update = (t: number) => {
    animateId = requestAnimationFrame(update);
    const deltaTime = (t - lastTime) / 1000;
    lastTime = t;

    if (program && mesh && camera) {
      // 每帧更新时间 uniform，驱动着色器动画
      program.uniforms.uTime.value += 0.1 * deltaTime;
      program.uniforms.uSpeed.value = props.speed;
      program.uniforms.uScale.value = props.scale;
      program.uniforms.uNoiseIntensity.value = props.noiseIntensity;
      program.uniforms.uColor.value = hexToNormalizedRGB(props.color);
      program.uniforms.uRotation.value = props.rotation;
      renderer!.render({ scene: mesh, camera });
    }
  };
  animateId = requestAnimationFrame(update);

  resize();

  return () => {
    cancelAnimationFrame(animateId);
    window.removeEventListener('resize', resize);
    if (container && gl.canvas.parentNode === container) {
      container.removeChild(gl.canvas);
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
};

/**
 * 清理 WebGL 资源
 * 取消动画帧、移除 Canvas 元素、释放 WebGL 上下文（防止内存泄漏）
 */
const cleanup = () => {
  if (animateId) {
    cancelAnimationFrame(animateId);
  }
  if (renderer) {
    const gl = renderer.gl;
    const container = containerRef.value;
    if (container && gl.canvas.parentNode === container) {
      container.removeChild(gl.canvas);
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
  renderer = null;
  mesh = null;
  camera = null;
  program = null;
};

// 组件挂载时初始化 WebGL 场景
onMounted(() => {
  initSilk();
});

// 组件卸载时释放 WebGL 资源，避免内存泄漏
onUnmounted(() => {
  cleanup();
});

// 监听 props 变化：着色器 uniforms 在渲染循环中实时读取 props，
// 无需额外处理，此 watch 仅保留以便未来扩展（如需重新初始化时）
watch(
  () => [props.speed, props.scale, props.color, props.noiseIntensity, props.rotation],
  () => {}
);
</script>

<style scoped>
div {
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  display: block !important;
}

:deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  display: block !important;
  object-fit: cover !important;
}
</style>
