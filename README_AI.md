这是一份为你这套“Vue3 + Express (MVC) + FastAPI (硅基流动大模型)”量身定制的完整项目接入与运行说明文档。你可以直接将其复制保存为项目中的 README_AI.md，方便随时查阅。
# 🌟 智能垃圾分类系统 (AI 大模型版) 接入与部署文档
## 1. 系统架构与技术栈
本项目采用微服务与 MVC 相结合的架构，利用视觉大模型实现零训练的高精度垃圾分类。
 * **前端界面**: Vue 3 (目录: grennn_web)
 * **核心业务层**: Node.js + Express (目录: grennn_backend，标准 MVC 架构)
 * **AI 识别服务**: Python + FastAPI (目录: grennn_backend/ai_service)
 * **底层大模型**: 硅基流动 API (Qwen2-VL-72B-Instruct 视觉模型)
## 2. 最终目录结构
实施本篇文档的接入后，你的项目结构应如下所示：
```text
chuanzhibei/ 
  ├── grennn_web/                  <-- 前端项目
  └── grennn_backend/              <-- 后端主项目
       ├── config/
       ├── controllers/
       │    └── garbageController.js <-- [新增] 垃圾分类控制器
       ├── routes/
       │    └── garbageRoutes.js     <-- [新增] 垃圾分类路由
       ├── models/
       ├── ...
       ├── ai_service/               <-- [新增] Python 微服务
       │    └── main.py              <-- [新增] FastAPI 核心代码
       ├── package.json              <-- [修改] 配置一键启动脚本
       └── server.js                 <-- [修改] 挂载路由

```
## 3. 第一步：部署 Python AI 服务端
### 3.1 安装依赖
在终端中进入后端目录，创建 AI 文件夹并安装依赖：
```bash
cd grennn_backend
mkdir ai_service
cd ai_service
pip install fastapi uvicorn python-multipart openai

```
### 3.2 编写 FastAPI 代码
在 ai_service 目录下新建 main.py，填入以下代码，并替换你的 **硅基流动 API_KEY**：
```python
# 文件路径: grennn_backend/ai_service/main.py
import base64
from fastapi import FastAPI, UploadFile, File
from openai import OpenAI
import uvicorn
import json

app = FastAPI()

# 初始化硅基流动客户端
client = OpenAI(
    api_key="sk-qdxkefntzaiahyvyjvbwyxzscigsmonainooyfgruynlmcdc", 
    base_url="https://api.siliconflow.cn/v1"
)

@app.post("/api/ai/predict")
async def predict_garbage(file: UploadFile = File(...)):
    try:
        # 1. 转换图片格式
        image_bytes = await file.read()
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        image_url = f"data:image/jpeg;base64,{base64_image}"
        
        # 2. 设定严格提示词
        prompt = """
        你是一个图像识别系统。请分析图片中的主要物体，判断其属于哪种生活垃圾。
        必须且只能从以下四个类别中选择：['可回收物', '有害垃圾', '湿垃圾', '干垃圾']。
        严格以JSON格式输出，不要包含任何Markdown标记和额外解释。
        输出示例：{"name": "易拉罐", "category": "可回收物", "reason": "主要材质为铝"}
        """
        
        # 3. 调用硅基流动视觉模型
        response = client.chat.completions.create(
            model="Qwen/Qwen2-VL-72B-Instruct", 
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            temperature=0.1 # 保持输出稳定性
        )
        
        # 4. 解析结果并去除可能存在的 Markdown 标记
        result_text = response.choices[0].message.content
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        result_json = json.loads(result_text) 
        
        return {"status": "success", "data": result_json}
        
    except json.JSONDecodeError:
        return {"status": "error", "message": "AI 返回格式异常"}
    except Exception as e:
        return {"status": "error", "message": f"模型调用失败: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

```
## 4. 第二步：配置 Node.js 业务层 (Express MVC)
### 4.1 安装必要插件
退回到后端根目录，安装用于文件上传、请求转发以及一键启动的工具：
```bash
cd ..  # 退回 grennn_backend 目录
npm install multer axios form-data
npm install concurrently nodemon -D

```
### 4.2 编写控制器 (Controller)
新建 grennn_backend/controllers/garbageController.js：
```javascript
// 文件路径: grennn_backend/controllers/garbageController.js
const axios = require('axios');
const FormData = require('form-data');

exports.classifyGarbage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: '请上传图片文件' });
  }

  try {
    const form = new FormData();
    form.append('file', req.file.buffer, { filename: req.file.originalname });

    // 转发图片给本地 8000 端口的 Python AI 服务
    const aiResponse = await axios.post('http://127.0.0.1:8000/api/ai/predict', form, {
      headers: form.getHeaders(),
      timeout: 15000 // 15秒超时保护
    });

    if (aiResponse.data.status === 'success') {
      const aiData = aiResponse.data.data;
      
      // 可以在此处添加 Sequelize 代码，将 aiData 保存到 MySQL

      return res.status(200).json({
        code: 200,
        message: '识别成功',
        data: aiData
      });
    } else {
      throw new Error(aiResponse.data.message || 'AI 识别异常');
    }
  } catch (error) {
    console.error('垃圾分类失败:', error.message);
    res.status(500).json({ code: 500, message: '服务器繁忙或 AI 请求超时' });
  }
};

```
### 4.3 编写路由 (Route)
新建 grennn_backend/routes/garbageRoutes.js：
```javascript
// 文件路径: grennn_backend/routes/garbageRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const garbageController = require('../controllers/garbageController');

// 使用内存存储接收上传图片，加快转发速度
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('image'), garbageController.classifyGarbage);

module.exports = router;

```
### 4.4 挂载路由到入口文件
修改你的 grennn_backend/server.js，在中间件配置后加入这行代码：
```javascript
// 文件路径: grennn_backend/server.js
// ... 其他代码 ...

const garbageRoutes = require('./routes/garbageRoutes');
app.use('/api/garbage', garbageRoutes); 

// ... app.listen() 等其他代码 ...

```
## 5. 第三步：配置一键全栈启动
打开 grennn_backend/package.json，找到 "scripts" 字段，将其完全替换为以下配置：
```json
  "scripts": {
    "start:server": "nodemon server.js",
    "start:web": "cd ../grennn_web && npm run dev",
    "start:ai": "cd ai_service && python main.py",
    "dev": "concurrently -k -n \"Node,Vue,AI\" -c \"cyan.bold,green.bold,yellow.bold\" \"npm run start:server\" \"npm run start:web\" \"npm run start:ai\""
  }

```
</script>

```
## 7. 运行与验证指南
 1. **一键启动**：打开终端，进入 grennn_backend 目录。
 2. 输入终极指令：
   ```bash
   npm run dev
   
   ```


