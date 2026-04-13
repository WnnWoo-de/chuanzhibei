import axios from 'axios'
import { requestAxios } from '@/utils/api'

const MOCK_STATE_KEY = 'green_volunteer_mock_state_v1'

const shouldUseVolunteerMock = () =>
  import.meta.env.VITE_USE_MOCK_VOLUNTEER === 'true' || import.meta.env.PROD

const volunteerMockActivities = [
  {
    id: 101,
    title: '河道清洁行动 · 城南段',
    description: '与社区志愿者一起清理河岸垃圾，完成分类回收并记录污染点。',
    date: '2026-04-12 08:30',
    location: '城南滨河步道 A 段',
    hours: 3,
    points: 120,
    pointsPerHour: 40,
    capacity: 28,
    enrolled: 21,
    category: '环境保护',
    urgent: true,
    status: 'pending',
    notes: '请穿防滑运动鞋，现场提供手套与垃圾夹。',
  },
  {
    id: 102,
    title: '社区旧衣回收与分拣',
    description: '协助登记、回收与分拣可再利用旧衣，打包后统一转运至公益仓。',
    date: '2026-04-13 14:00',
    location: '青禾社区服务中心',
    hours: 4,
    points: 140,
    pointsPerHour: 35,
    capacity: 24,
    enrolled: 16,
    category: '社区清洁',
    urgent: false,
    status: 'pending',
    notes: '建议携带口罩，现场温度较高。',
  },
  {
    id: 103,
    title: '绿色课堂 · 小学生环保科普',
    description: '协助老师组织环保互动课程，带领小朋友完成垃圾分类小游戏。',
    date: '2026-04-16 09:30',
    location: '实验小学多功能教室',
    hours: 2,
    points: 80,
    pointsPerHour: 40,
    capacity: 18,
    enrolled: 10,
    category: '教育支持',
    urgent: false,
    status: 'pending',
    notes: '提前 20 分钟到场布置教具。',
  },
  {
    id: 104,
    title: '敬老院陪伴与数字助老',
    description: '陪伴老人聊天散步，帮助使用手机完成基础操作与防诈提醒。',
    date: '2026-04-18 15:00',
    location: '和宁敬老服务中心',
    hours: 3,
    points: 105,
    pointsPerHour: 35,
    capacity: 20,
    enrolled: 13,
    category: '关爱老人',
    urgent: false,
    status: 'pending',
    notes: '请保持耐心沟通，着装整洁。',
  },
]

const normalizeVolunteerItem = (item = {}) => ({
  ...item,
  pointsPerHour: Number(item.pointsPerHour || 30),
  points: Number(item.points || 0),
  hours: Number(item.hours || 0),
  capacity: Number(item.capacity || 0),
  enrolled: Number(item.enrolled || 0),
})

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const loadMockState = () => {
  if (!canUseStorage()) return volunteerMockActivities.map((item) => ({ ...item }))

  try {
    const raw = window.localStorage.getItem(MOCK_STATE_KEY)
    if (!raw) return volunteerMockActivities.map((item) => ({ ...item }))

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return volunteerMockActivities.map((item) => ({ ...item }))
    return parsed.map(normalizeVolunteerItem)
  } catch (error) {
    void error
    return volunteerMockActivities.map((item) => ({ ...item }))
  }
}

const saveMockState = (list = []) => {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(list))
  } catch (error) {
    void error
  }
}

const fetchMockActivities = () => {
  const list = loadMockState().map(normalizeVolunteerItem)
  saveMockState(list)
  return list
}

const updateMockActivity = (activityId, updater) => {
  const list = loadMockState().map(normalizeVolunteerItem)
  const idx = list.findIndex((item) => Number(item.id) === Number(activityId))
  if (idx < 0) return { ok: false, item: null, message: '活动不存在' }

  const next = updater({ ...list[idx] })
  if (!next) return { ok: false, item: null, message: '更新失败' }

  list[idx] = normalizeVolunteerItem(next)
  saveMockState(list)
  return { ok: true, item: list[idx], message: '' }
}

export const fetchVolunteerActivities = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/volunteer/activities'), {
    fallbackMessage: '加载志愿活动失败',
  })

  if (result.ok) {
    const rawItems = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result.data?.items)
        ? result.data.items
        : []

    return {
      ok: true,
      items: rawItems.map(normalizeVolunteerItem),
      message: '',
      source: 'api',
    }
  }

  if (shouldUseVolunteerMock()) {
    return {
      ok: true,
      items: fetchMockActivities(),
      message: result.message,
      source: 'mock',
    }
  }

  return { ok: false, items: [], message: result.message, source: 'api' }
}

export const enrollVolunteerActivity = async (activityId, { phone, remark, agreedRules } = {}) => {
  const result = await requestAxios(
    () => axios.post(`/api/v1/volunteer/activities/${activityId}/enroll`, { phone, remark, agreedRules }),
    { fallbackMessage: '报名失败' },
  )

  if (result.ok) {
    return { ok: true, item: result.data?.item || null, message: '', source: 'api' }
  }

  if (!shouldUseVolunteerMock()) {
    return { ok: false, item: null, message: result.message, source: 'api' }
  }

  return {
    ...updateMockActivity(activityId, (activity) => {
      if ((activity.enrolled || 0) >= (activity.capacity || 0)) return null
      if (activity.enrollment) return activity

      return {
        ...activity,
        enrolled: Number(activity.enrolled || 0) + 1,
        status: 'registered',
        enrollment: {
          status: 'registered',
          phone: phone || '',
          note: remark || '',
          agreedRules: Boolean(agreedRules),
          loggedHours: Number(activity.enrollment?.loggedHours || 0),
          pointsAwarded: Number(activity.enrollment?.pointsAwarded || 0),
          createdAt: new Date().toISOString(),
        },
      }
    }),
    source: 'mock',
  }
}

export const logVolunteerHours = async (activityId, { hours, reflection } = {}) => {
  const result = await requestAxios(
    () => axios.post(`/api/v1/volunteer/activities/${activityId}/log-hours`, { hours, reflection }),
    { fallbackMessage: '提交失败' },
  )

  if (result.ok) {
    return { ok: true, data: result.data || null, message: '', source: 'api' }
  }

  if (!shouldUseVolunteerMock()) {
    return { ok: false, data: null, message: result.message, source: 'api' }
  }

  const updated = updateMockActivity(activityId, (activity) => {
    if (!activity.enrollment) return null

    const numericHours = Number(hours || 0)
    const pointsPerHour = Number(activity.pointsPerHour || 0)
    const pointsAwarded = Math.max(0, Math.round(numericHours * pointsPerHour))
    const completedAt = new Date().toISOString()

    return {
      ...activity,
      status: 'completed',
      enrollment: {
        ...activity.enrollment,
        status: 'completed',
        loggedHours: numericHours,
        reflection: reflection || '',
        pointsAwarded,
        completedAt,
      },
    }
  })

  if (!updated.ok || !updated.item) {
    return { ok: false, data: null, message: '提交失败', source: 'mock' }
  }

  return {
    ok: true,
    data: {
      hours: Number(hours || 0),
      pointsAwarded: Number(updated.item.enrollment?.pointsAwarded || 0),
      completedAt: updated.item.enrollment?.completedAt || new Date().toISOString(),
    },
    message: '',
    source: 'mock',
  }
}
