import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import BaseButton from '../BaseButton.vue'
import {
  consumeChatCompletionsStream,
  consumeSseStream,
  getApiErrorMessage,
  normalizeAuthField,
  normalizeAuthFieldErrors,
  requestAxios,
} from '@/utils/api'
import { buildPostFromApi, extractPostItems } from '@/utils/community'
import { mapAnalyzeResult } from '@/services/reconstructionService'

describe('BaseButton', () => {
  it('renders properly', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})

describe('api utils', () => {
  it('normalizes auth field names', () => {
    expect(normalizeAuthField('name')).toBe('username')
    expect(normalizeAuthField(' email ')).toBe('email')
    expect(normalizeAuthField('')).toBe('')
  })

  it('normalizes field errors from object structure', () => {
    const result = normalizeAuthFieldErrors({
      errors: {
        email: ['邮箱格式错误', 'ignored'],
        name: '用户名不合法',
      },
    })
    expect(result).toEqual({ email: '邮箱格式错误', username: '用户名不合法' })
  })

  it('normalizes field errors from array structure', () => {
    const result = normalizeAuthFieldErrors({
      errors: [
        { field: 'password', message: '太弱了' },
        { name: 'name', message: '用户名已存在' },
      ],
    })
    expect(result).toEqual({ password: '太弱了', username: '用户名已存在' })
  })

  it('extracts api error message', () => {
    expect(getApiErrorMessage({ response: { data: { error: 'nope' } } }, 'fallback')).toBe('nope')
    expect(getApiErrorMessage({}, 'fallback')).toBe('fallback')
  })

  it('wraps axios requests into a stable result', async () => {
    const ok = await requestAxios(
      async () => ({ status: 200, data: { hello: 'world' } }),
      { fallbackMessage: '请求失败' },
    )
    expect(ok.ok).toBe(true)
    expect(ok.data).toEqual({ hello: 'world' })

    const bad = await requestAxios(
      async () => {
        const err = new Error('boom')
        err.response = { status: 422, data: { error: 'Bad Request', errors: { email: '无效邮箱' } } }
        throw err
      },
      { fallbackMessage: '请求失败' },
    )
    expect(bad.ok).toBe(false)
    expect(bad.status).toBe(422)
    expect(bad.message).toBe('Bad Request')
    expect(bad.fieldErrors).toEqual({ email: '无效邮箱' })
  })

  it('consumes SSE stream data payloads', async () => {
    if (typeof ReadableStream !== 'function') return
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"a":1}\n\n'))
        controller.enqueue(encoder.encode('data: {"b":2}\n\n'))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    const payloads = []
    await consumeSseStream(stream, {
      onData: (p) => payloads.push(p),
    })
    expect(payloads).toEqual(['{"a":1}', '{"b":2}'])
  })

  it('stops consuming SSE stream when shouldStop returns true', async () => {
    if (typeof ReadableStream !== 'function') return
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"a":1}\n\n'))
        controller.enqueue(encoder.encode('data: {"b":2}\n\n'))
        controller.close()
      },
    })

    const payloads = []
    let stop = false
    await consumeSseStream(stream, {
      shouldStop: () => stop,
      onData: (p) => {
        payloads.push(p)
        stop = true
      },
    })
    expect(payloads).toEqual(['{"a":1}'])
  })

  it('consumes chat completions stream deltas', async () => {
    if (typeof ReadableStream !== 'function') return
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode('data: {"choices":[{"delta":{"content":"你好"}}]}\n\ndata: {"choices":[{"delta":{"content":"！"}}]}\n\n'),
        )
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    let out = ''
    await consumeChatCompletionsStream(stream, {
      onDeltaContent: (c) => {
        out += c
      },
    })
    expect(out).toBe('你好！')
  })

  it('treats aborted SSE streams as AbortError', async () => {
    if (typeof ReadableStream !== 'function') return
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"a":1}\n\n'))
        controller.close()
      },
    })
    const ac = new AbortController()
    ac.abort()

    await expect(
      consumeSseStream(stream, {
        signal: ac.signal,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('community utils', () => {
  it('extracts items from different response shapes', () => {
    expect(extractPostItems(null)).toEqual([])
    expect(extractPostItems([{ id: 1 }])).toEqual([{ id: 1 }])
    expect(extractPostItems({ items: [{ id: 2 }] })).toEqual([{ id: 2 }])
    expect(extractPostItems({ data: [{ id: 3 }] })).toEqual([{ id: 3 }])
  })

  it('builds a stable post view model from api payload', () => {
    const post = buildPostFromApi({
      id: 'p1',
      author: { username: 'Tom' },
      content: 'Hello',
      images: ['x.png'],
      likes_count: 2,
      comments_count: 3,
      is_liked: true,
      created_at: '2026-01-01T00:00:00.000Z',
    })

    expect(post.id).toBe('p1')
    expect(post.user).toBe('Tom')
    expect(post.content).toBe('Hello')
    expect(post.fullContent).toBe('Hello')
    expect(post.image).toBe('x.png')
    expect(post.likes).toBe(2)
    expect(post.comments).toBe(3)
    expect(post.liked).toBe(true)
    expect(typeof post.avatarColor1).toBe('string')
    expect(typeof post.avatarColor2).toBe('string')
    expect(post.remote).toBe(true)
  })
})

describe('reconstruction utils', () => {
  it('maps analyze result meta and suggestions', () => {
    const result = mapAnalyzeResult({
      material: '金属',
      carbon_reduction: '3.2 kg CO₂e',
      suggestions: [
        { title: '花盆', steps: ['打磨', '喷漆'], difficulty: '简单' },
        { title: '  ', steps: ['x'] },
      ],
    })
    expect(result.meta).toEqual({
      material: '金属',
      integrity: '良好 (B+)',
      carbonReduction: '3.2 kg CO₂e',
    })
    expect(result.suggestions).toEqual([
      { title: '花盆', description: '打磨；喷漆', difficulty: '简单' },
    ])
  })
})
