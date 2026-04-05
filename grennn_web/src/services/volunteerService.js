import axios from 'axios'
import { requestAxios } from '@/utils/api'

export const fetchVolunteerActivities = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/volunteer/activities'), {
    fallbackMessage: '加载志愿活动失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }

  const rawItems = Array.isArray(result.data)
    ? result.data
    : Array.isArray(result.data?.items)
      ? result.data.items
      : []

  return { ok: true, items: rawItems, message: '' }
}

export const enrollVolunteerActivity = async (activityId, { phone, remark, agreedRules } = {}) => {
  const result = await requestAxios(
    () => axios.post(`/api/v1/volunteer/activities/${activityId}/enroll`, { phone, remark, agreedRules }),
    { fallbackMessage: '报名失败' },
  )
  if (!result.ok) return { ok: false, item: null, message: result.message }
  return { ok: true, item: result.data?.item || null, message: '' }
}

export const logVolunteerHours = async (activityId, { hours, reflection } = {}) => {
  const result = await requestAxios(
    () => axios.post(`/api/v1/volunteer/activities/${activityId}/log-hours`, { hours, reflection }),
    { fallbackMessage: '提交失败' },
  )
  if (!result.ok) return { ok: false, data: null, message: result.message }
  return { ok: true, data: result.data || null, message: '' }
}
