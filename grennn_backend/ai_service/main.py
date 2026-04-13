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
            temperature=0.1  # 保持输出稳定性
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
    uvicorn.run(app, host="127.0.0.1", port=8002)
