/**
 * controllers/chatController.js - AI 聊天控制器
 *
 * 核心功能：
 *   sendMessage  - 接收用户消息，调用 AI 接口，以 SSE 流式或普通 JSON 返回回复
 *   getHistory   - 获取当前用户的历史聊天记录
 *   clearHistory - 清空当前用户的历史聊天记录
 *
 * AI 服务优先级（由 AI_SERVICE 环境变量控制）：
 *   'glm'       → 优先 GLM（智谱 AI），失败降级到 SiliconFlow
 *   其他 / 未设置 → 优先 SiliconFlow，失败降级到 GLM
 *   两者均不可用  → 本地模拟回复（mockStreamResponse）
 *
 * 流式响应格式：Server-Sent Events（SSE）
 *   数据帧：data: {JSON}\n\n
 *   结束帧：data: [DONE]\n\n
 *
 * 聊天记录持久化：
 *   仅在 req.user 存在时（登录用户）写入数据库，游客消息不落库。
 */

const ChatHistory = require('../models/ChatHistory');
const axios       = require('axios');

// ── AI API 调用封装 ────────────────────────────────────────────────────────────

/**
 * 调用智谱 AI（GLM）聊天接口
 *
 * @param {Array}   messages - OpenAI 格式消息数组 [{role, content}, ...]
 * @param {boolean} stream   - 是否启用流式输出
 * @returns {object|null} axios 响应对象，失败返回 null
 */
const callGLMAPI = async (messages, stream = true) => {
    const apiKey = process.env.GLM_API_KEY;
    const model  = process.env.GLM_MODEL || 'glm-4-flash'; // 默认使用 glm-4-flash 模型

    // 未配置 API Key 或仍为占位符时跳过，避免无效请求
    if (!apiKey || apiKey === 'your_glm_api_key_here') {
        return null;
    }

    try {
        const response = await axios.post(
            'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            {
                model,
                messages,
                stream,
                temperature: 0.7,  // 生成多样性（0=确定性，1=高随机）
                max_tokens: 4096   // 单次最大输出 token 数
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                // 流式响应需要设置 responseType 为 'stream'，否则设为 'json'
                responseType: stream ? 'stream' : 'json',
                timeout: 60000 // 请求超时 60 秒
            }
        );
        return response;
    } catch (err) {
        console.error('GLM API Error:', err.response?.data || err.message);
        return null;
    }
};

/**
 * 调用 SiliconFlow 聊天接口（Qwen2.5-72B-Instruct 模型）
 *
 * @param {Array}   messages - OpenAI 格式消息数组
 * @param {boolean} stream   - 是否启用流式输出
 * @returns {object|null} axios 响应对象，失败返回 null
 */
const callSiliconFlowAPI = async (messages, stream = true) => {
    const apiKey = process.env.SILICONFLOW_API_KEY;
    const model  = 'Qwen/Qwen2.5-72B-Instruct'; // 固定使用通义千问 72B 模型

    // 未配置 API Key 时跳过
    if (!apiKey || apiKey === 'your_api_key') {
        return null;
    }

    try {
        const response = await axios.post(
            'https://api.siliconflow.cn/v1/chat/completions',
            {
                model,
                messages,
                stream,
                max_tokens: 4096,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: stream ? 'stream' : 'json',
                timeout: 60000
            }
        );
        return response;
    } catch (err) {
        console.error('SiliconFlow API Error:', err.response?.data || err.message);
        return null;
    }
};

// ── 主要控制器方法 ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/chat/completions
 * 发送消息并获取 AI 回复
 *
 * 请求体：
 *   messages - 消息数组（OpenAI 格式），最后一条必须为用户消息
 *   stream   - 是否启用 SSE 流式输出（boolean）
 *
 * 流程：
 *   1. 校验请求参数
 *   2. 若登录用户：将用户消息持久化到数据库
 *   3. 根据 AI_SERVICE 配置选择主/备 AI 服务
 *   4. 两者均失败时降级到本地模拟回复
 *   5. 流式模式：通过 SSE 逐 chunk 转发响应
 *   6. 非流式模式：直接返回完整 JSON
 */
exports.sendMessage = async (req, res) => {
    try {
        const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
        const stream   = Boolean(req.body?.stream);

        // 参数校验：消息数组不能为空
        if (!messages.length) {
            return res.status(400).json({ error: 'messages 不能为空' });
        }

        // 取最后一条消息内容作为本次用户输入
        const lastMessage = messages[messages.length - 1] || {};
        const userMessage = String(lastMessage.content || '').trim();
        if (!userMessage) {
            return res.status(400).json({ error: '最后一条消息不能为空' });
        }

        // 仅在用户登录时将用户消息写入聊天历史表
        if (req.user) {
            await ChatHistory.create({
                userId:  req.user.id,
                role:    'user',
                content: userMessage
            });
        }

        // 根据环境变量决定主 AI 服务与备用 AI 服务
        const aiService = process.env.AI_SERVICE || 'glm';
        let response = null;

        if (aiService === 'glm') {
            response = await callGLMAPI(messages, stream);          // 优先 GLM
            if (!response) response = await callSiliconFlowAPI(messages, stream); // 降级到 SiliconFlow
        } else {
            response = await callSiliconFlowAPI(messages, stream);  // 优先 SiliconFlow
            if (!response) response = await callGLMAPI(messages, stream);         // 降级到 GLM
        }

        // 两个 AI 服务均不可用 → 本地模拟回复
        if (!response) {
            return mockStreamResponse(res, req.user?.id, stream);
        }

        // ── 流式响应处理（SSE）──────────────────────────────────────────────
        if (stream) {
            // 设置 SSE 所需的响应头
            res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            if (typeof res.flushHeaders === 'function') res.flushHeaders();

            let fullContent = ''; // 累积完整 AI 回复，用于最终持久化
            let buffer      = ''; // 处理 TCP 粘包：缓存不完整的数据行

            // 逐 chunk 读取 AI 上游的 SSE 数据流
            response.data.on('data', (chunk) => {
                // 将新数据追加到缓冲区
                buffer += chunk.toString('utf8');

                // 按换行符切割；最后一段（可能不完整）保留在缓冲区
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) continue; // 跳过空行

                    // SSE 终止信号 → 原样转发给前端
                    if (trimmedLine === 'data: [DONE]') {
                        res.write('data: [DONE]\n\n');
                        continue;
                    }

                    if (!trimmedLine.startsWith('data: ')) continue; // 非数据行跳过

                    try {
                        // 解析 SSE 数据载荷（去掉 'data: ' 前缀后解析 JSON）
                        const json    = JSON.parse(trimmedLine.slice(6));
                        const content = json?.choices?.[0]?.delta?.content || '';
                        if (content) fullContent += content; // 累积回复内容
                        res.write(`data: ${JSON.stringify(json)}\n\n`); // 转发给前端
                    } catch (e) {
                        console.error('Error parsing stream chunk:', e.message, 'Line:', trimmedLine);
                    }
                }
            });

            // 流结束：处理缓冲区剩余数据并持久化完整回复
            response.data.on('end', async () => {
                // 处理缓冲区中可能残留的最后一行数据
                if (buffer.trim().startsWith('data: ')) {
                    try {
                        const trimmedLine = buffer.trim();
                        const json    = JSON.parse(trimmedLine.slice(6));
                        const content = json?.choices?.[0]?.delta?.content || '';
                        if (content) fullContent += content;
                        res.write(`data: ${JSON.stringify(json)}\n\n`);
                    } catch (e) {
                        // 残留数据格式不合法，忽略
                    }
                }

                // 将完整 AI 回复写入聊天历史（仅登录用户）
                try {
                    if (fullContent && req.user) {
                        await ChatHistory.create({
                            userId:  req.user.id,
                            role:    'assistant',
                            content: fullContent
                        });
                    }
                } catch (saveErr) {
                    console.error('Save chat history failed:', saveErr.message);
                }

                res.end(); // 关闭 SSE 连接
            });

            // 流出错：记录日志并结束响应
            response.data.on('error', (err) => {
                console.error('Stream error:', err.message);
                res.end();
            });

            return; // 流式模式下不再执行后续代码
        }

        // ── 非流式响应处理 ────────────────────────────────────────────────────
        const reply = response?.data?.choices?.[0]?.message?.content || '';
        if (reply && req.user) {
            await ChatHistory.create({
                userId:  req.user.id,
                role:    'assistant',
                content: reply
            });
        }
        res.json(response.data);

    } catch (err) {
        console.error('Chat Controller Error:', err);
        res.status(500).json({ error: err.message || '聊天请求失败' });
    }
};

// ── 本地模拟回复（API 全部不可用时的兜底）────────────────────────────────────

/**
 * 当所有 AI 服务均不可用时，返回本地模拟回复
 * 流式模式：每 30ms 发送一个字符，模拟打字机效果
 * 非流式模式：直接返回完整 JSON
 *
 * @param {object}      res    - Express Response 对象
 * @param {string|null} userId - 当前用户 ID（登录用户），用于持久化模拟回复
 * @param {boolean}     stream - 是否流式模式
 */
function mockStreamResponse(res, userId, stream = true) {
    const reply = '（模拟回复）AI 聊天服务已联通，但当前使用的是模拟模式。若需真实大模型回答，请在后端 .env 中配置有效的 GLM_API_KEY 或 SILICONFLOW_API_KEY。';

    // 非流式：直接返回 JSON
    if (!stream) {
        return res.json({
            choices: [{ message: { content: reply } }]
        });
    }

    // 流式：设置 SSE 响应头
    if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        if (typeof res.flushHeaders === 'function') res.flushHeaders();
    }

    // 将回复文本拆成单个字符数组，逐字发送
    const chunks = reply.split('');
    let i = 0;

    const interval = setInterval(async () => {
        if (i < chunks.length) {
            // 构造与真实 AI 响应相同格式的 SSE 数据帧
            const chunkData = {
                choices: [{ delta: { content: chunks[i] } }]
            };
            res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
            i += 1;
            return;
        }

        // 所有字符发送完毕 → 发送结束信号并关闭连接
        clearInterval(interval);
        res.write('data: [DONE]\n\n');
        res.end();

        // 将模拟回复持久化到数据库（仅登录用户）
        try {
            if (userId) {
                await ChatHistory.create({
                    userId,
                    role:    'assistant',
                    content: reply
                });
            }
        } catch (err) {
            console.error('Save mock chat history failed:', err.message);
        }
    }, 30); // 每 30ms 发送一个字符
}

// ── 历史记录查询 ───────────────────────────────────────────────────────────────

/**
 * GET /api/v1/chat/history
 * 获取当前登录用户的聊天历史记录
 *
 * 游客（req.user 为 null）直接返回空数组，不查询数据库。
 * 记录按 createdAt 升序排列，符合对话时间顺序。
 */
exports.getHistory = async (req, res) => {
    try {
        // 游客模式：无需查询数据库，直接返回空历史
        if (!req.user) {
            return res.json([]);
        }

        const history = await ChatHistory.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'ASC']] // 按时间升序，最早的消息在最前
        });

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 历史记录清空 ───────────────────────────────────────────────────────────────

/**
 * DELETE /api/v1/chat/history
 * 清空当前登录用户的全部聊天历史记录
 *
 * 游客（req.user 为 null）直接返回成功，无需操作数据库。
 */
exports.clearHistory = async (req, res) => {
    try {
        // 游客模式：无历史记录需要清空
        if (!req.user) {
            return res.json({ message: 'No history to clear' });
        }

        await ChatHistory.destroy({
            where: { userId: req.user.id } // 只删除当前用户的记录，不影响其他用户
        });

        res.json({ message: 'Chat history cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
