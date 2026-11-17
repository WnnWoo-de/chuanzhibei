import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../user'

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('user store local cache', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('does not expose a hardcoded demo admin bypass', () => {
    const store = useUserStore()
    expect(store.loginAsDemoAdmin).toBeUndefined()
    expect(store.token).toBe('')
  })

  it('stores guest chat history in a guest-scoped key', () => {
    const store = useUserStore()
    store.saveChat([{ role: 'user', content: 'hello' }])

    expect(localStorage.getItem('green_chat')).toBeNull()
    expect(JSON.parse(localStorage.getItem('green_chat:guest'))).toHaveLength(1)
  })

  it('syncs points from the server response without client-side increments', () => {
    const store = useUserStore()
    store.user = { id: 'u1', points: 10 }

    store.syncPoints(42)

    expect(store.user.points).toBe(42)
  })
})
