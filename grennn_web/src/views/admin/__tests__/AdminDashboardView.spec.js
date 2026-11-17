import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AdminDashboardView from '../AdminDashboardView.vue'

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    info: vi.fn(),
  },
}))

const mountAdmin = () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(AdminDashboardView, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: {
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('AdminDashboardView', () => {
  it('renders the admin console title and all management tabs', () => {
    const wrapper = mountAdmin()

    expect(wrapper.text()).toContain('GreenSight 管理端')
    expect(wrapper.text()).toContain('运营总览')
    expect(wrapper.text()).toContain('用户管理')
    expect(wrapper.text()).toContain('内容审核')
    expect(wrapper.text()).toContain('活动管理')
    expect(wrapper.text()).toContain('商城管理')
    expect(wrapper.text()).toContain('系统监控')
  })

  it('updates review item status when approving content locally', async () => {
    const wrapper = mountAdmin()

    await wrapper.get('[data-testid="tab-content"]').trigger('click')
    expect(wrapper.text()).toContain('待审核')

    await wrapper.get('[data-testid="approve-content-c101"]').trigger('click')
    expect(wrapper.text()).toContain('已通过')
  })
})
