import axios from 'axios'
import { requestAxios } from '@/utils/api'

// ============================================================
// services/quizService.js - 环保问答服务
// 负责题库查询、历史成绩查询和答题记录保存
// ============================================================

/** 获取环保问答题库 */
export const fetchQuizQuestions = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/quiz/questions'), {
    fallbackMessage: '加载问答题库失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }
  return { ok: true, items: Array.isArray(result.data?.items) ? result.data.items : [], message: '' }
}

/** 获取用户历史答题记录 */
export const fetchQuizRecords = async () => {
  const result = await requestAxios(() => axios.get('/api/v1/quiz/records'), {
    fallbackMessage: '加载问答记录失败',
  })
  if (!result.ok) return { ok: false, items: [], message: result.message }
  return { ok: true, items: Array.isArray(result.data?.items) ? result.data.items : [], message: '' }
}

/** 保存一次新的答题结果 */
export const saveQuizRecord = async (payload) => {
  const result = await requestAxios(() => axios.post('/api/v1/quiz/records', payload), {
    fallbackMessage: '保存问答记录失败',
  })
  if (!result.ok) return { ok: false, data: null, message: result.message, status: result.status }
  return { ok: true, data: result.data, message: '' }
}
