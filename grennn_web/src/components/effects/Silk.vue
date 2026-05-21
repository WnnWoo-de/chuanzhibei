<!-- ============================================================
     Silk.vue - WebGL 丝绸背景动效组件
     使用 OGL（轻量级 WebGL 库）渲染基于噪声的流动丝绸效果
     通过自定义 GLSL 着色器实现平滑的波纹和颜色变化
     ============================================================ -->
<template>
  <div ref="containerRef" :class="className" :style="style" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, type CSSProperties, useTemplateRef } from 'vue'

type OglModule = typeof import('ogl')
type OglRenderer = InstanceType<OglModule['Renderer']>
type OglProgram = InstanceType<OglModule['Program']>
type OglMesh = InstanceType<OglModule['Mesh']>
type OglCamera = InstanceType<OglModule['Camera']>

/** Silk 组件属性接口 */
interface SilkProps {
  /** 动画速度 */
  speed?: number
  /** 噪声缩放比例 */
  scale?: number
  /** 丝绸主色调（十六进制颜色） */
  color?: string
  /** 噪声强度 */
  noiseIntensity?: number
  /** 旋转角度（弧度） */
  rotation?: number
  /** 自定义 CSS 类名 */
  className?: string
  /** 自定义内联样式 */
  style?: CSSProperties
}

const props = withDefaults(defineProps<SilkProps>(), {
  speed: 5,
  scale: 1,
  color: '#7B7481',
  noiseIntensity: 1.5,
  rotation: 0,
  className: '',
  style: () => ({}),
})

/** 容器 DOM 引用 */
const containerRef = useTemplateRef<HTMLDivElement>('containerRef')

/** 将十六进制颜色转换为归一化 RGB 值（0-1 范围，供 WebGL 着色器使用） */
const hexToNormalizedRGB = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return [r, g, b]
}

/** 顶点着色器：传递 UV 坐标和位置到片元着色器 */
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
`

/** 片元着色器：基于正弦函数和噪声生成流动丝绸效果 */
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
`

/* WebGL 相关实例 */
let renderer: OglRenderer | null = null   // OGL 渲染器
let mesh: OglMesh | null = null           // 网格对象（平面）
let program: OglProgram | null = null     // 着色器程序
let camera: OglCamera | null = null       // 摄像机
let animateId = 0                          // 动画帧 ID
let destroySilk: (() => void) | null = null // 销毁函数引用

/** 初始化 WebGL 场景：创建渲染器、摄像机、着色器程序和网格，并启动动画循环 */
const initSilk = async () => {
  const container = containerRef.value
  if (!container) return

  const { Renderer, Program, Mesh, Plane, Camera } = await import('ogl')
  if (!containerRef.value || containerRef.value !== container) return

  renderer = new Renderer({
    alpha: true,
    antialias: true,
  })

  const gl = renderer.gl
  gl.clearColor(0, 0, 0, 0)
  gl.canvas.style.backgroundColor = 'transparent'

  camera = new Camera(gl, { fov: 75 })
  camera.position.z = 1

  const resize = () => {
    if (!container || !camera || !renderer) return

    let width = container.offsetWidth
    let height = container.offsetHeight

    let parent = container.parentElement
    while (parent && (!width || !height)) {
      if (parent.offsetWidth && parent.offsetHeight) {
        width = parent.offsetWidth
        height = parent.offsetHeight
        break
      }
      parent = parent.parentElement
    }

    if (!width || !height) {
      width = window.innerWidth
      height = window.innerHeight
    }

    width = Math.max(width, 300)
    height = Math.max(height, 300)

    renderer.setSize(width, height)
    camera.perspective({ aspect: width / height })

    if (mesh) {
      const distance = camera.position.z
      const fov = camera.fov * (Math.PI / 180)
      const height2 = 2 * Math.tan(fov / 2) * distance
      const width2 = height2 * (width / height)
      mesh.scale.set(width2, height2, 1)
    }
  }

  window.addEventListener('resize', resize)

  const geometry = new Plane(gl, {
    width: 1,
    height: 1,
  })

  const colorRGB = hexToNormalizedRGB(props.color)

  program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uSpeed: { value: props.speed },
      uScale: { value: props.scale },
      uNoiseIntensity: { value: props.noiseIntensity },
      uColor: { value: colorRGB },
      uRotation: { value: props.rotation },
      uTime: { value: 0 },
    },
  })

  mesh = new Mesh(gl, { geometry, program })
  container.appendChild(gl.canvas)

  gl.canvas.style.width = '100%'
  gl.canvas.style.height = '100%'
  gl.canvas.style.display = 'block'
  gl.canvas.style.position = 'absolute'
  gl.canvas.style.top = '0'
  gl.canvas.style.left = '0'
  gl.canvas.style.zIndex = '1'

  let lastTime = 0
  const update = (t: number) => {
    animateId = requestAnimationFrame(update)
    const deltaTime = (t - lastTime) / 1000
    lastTime = t

    if (program && mesh && camera && renderer) {
      program.uniforms.uTime.value += 0.1 * deltaTime
      program.uniforms.uSpeed.value = props.speed
      program.uniforms.uScale.value = props.scale
      program.uniforms.uNoiseIntensity.value = props.noiseIntensity
      program.uniforms.uColor.value = hexToNormalizedRGB(props.color)
      program.uniforms.uRotation.value = props.rotation
      renderer.render({ scene: mesh, camera })
    }
  }

  animateId = requestAnimationFrame(update)
  resize()

  destroySilk = () => {
    cancelAnimationFrame(animateId)
    window.removeEventListener('resize', resize)
    if (container && gl.canvas.parentNode === container) {
      container.removeChild(gl.canvas)
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}

/** 清理所有 WebGL 资源，释放内存 */
const cleanup = () => {
  if (destroySilk) {
    destroySilk()
    destroySilk = null
  }
  if (animateId) {
    cancelAnimationFrame(animateId)
  }
  renderer = null
  mesh = null
  camera = null
  program = null
}

onMounted(async () => {
  await initSilk()
})

onUnmounted(() => {
  cleanup()
})

watch(
  () => [props.speed, props.scale, props.color, props.noiseIntensity, props.rotation],
  () => {}
)
</script>

<style scoped>
/* 容器强制铺满父元素 */
div {
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  display: block !important;
}

/* Canvas 画布强制铺满容器 */
:deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  display: block !important;
  object-fit: cover !important;
}
</style>
