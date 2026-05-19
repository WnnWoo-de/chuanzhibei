import axios from 'axios'
import { requestAxios } from '@/utils/api'

export const fetchQuizQuestions = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/quiz/questions'), {
    fallbackMessage: '加载问答题库失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }
  return { ok: true, items: Array.isArray(result.data?.items) ? result.data.items : [], message: '' }
}

export const fetchQuizRecords = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/quiz/records'), {
    fallbackMessage: '加载问答记录失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }
  return { ok: true, items: Array.isArray(result.data?.items) ? result.data.items : [], message: '' }
}

export const saveQuizRecord = async (payload) => {
  const result = await requestAxios(() => axios.post('/api/v1/quiz/records', payload), {
    fallbackMessage: '保存问答记录失败',
  })
  if (!result.ok) return { ok: false, data: null, message: result.message, status: result.status }
  return { ok: true, data: result.data, message: '' }
}
