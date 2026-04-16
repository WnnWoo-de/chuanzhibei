import base64
import json
import os
from uuid import uuid4

import uvicorn
from fastapi import FastAPI, File, UploadFile
from openai import OpenAI

app = FastAPI()

client = OpenAI(
    api_key=os.getenv("SILICONFLOW_API_KEY", "sk-qdxkefntzaiahyvyjvbwyxzscigsmonainooyfgruynlmcdc"),
    base_url=os.getenv("SILICONFLOW_BASE_URL", "https://api.siliconflow.cn/v1"),
)


def clean_json_text(content: str):
    text = (content or "").replace("```json", "").replace("```", "").strip()
    return json.loads(text)


@app.post("/api/ai/predict")
async def predict_garbage(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        image_url = f"data:{file.content_type or 'image/jpeg'};base64,{base64_image}"

        prompt = """
        你是一个图像识别系统。请分析图片中的主要物体，判断其属于哪种生活垃圾。
        必须且只能从以下四个类别中选择：['可回收物', '有害垃圾', '湿垃圾', '干垃圾']。
        严格以JSON格式输出，不要包含任何Markdown标记和额外解释。
        输出示例：{"name": "易拉罐", "category": "可回收物", "reason": "主要材质为铝"}
        """

        response = client.chat.completions.create(
            model="Qwen/Qwen2-VL-72B-Instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
            temperature=0.1,
        )

        result_json = clean_json_text(response.choices[0].message.content)
        return {"status": "success", "data": result_json}

    except json.JSONDecodeError:
        return {"status": "error", "message": "AI 返回格式异常"}
    except Exception as e:
        return {"status": "error", "message": f"模型调用失败: {str(e)}"}


@app.post("/api/ai/reconstruction/analyze")
async def analyze_reconstruction(payload: dict):
    try:
        image_base64 = payload.get("image_base64")
        mime_type = payload.get("mime_type") or "image/jpeg"

        if not image_base64:
            return {"status": "error", "message": "缺少图片数据"}

        prompt = """
        你是一名旧物改造顾问。请分析图片中的旧物，并为用户生成可执行的重构建议。
        请严格输出 JSON，不要包含 Markdown、解释文本或多余字段。
        输出字段必须完全遵守以下结构：
        {
          "analysis_id": "rec_xxx",
          "material": "识别为：木质类材质",
          "integrity": "良好 (B+)",
          "carbon_reduction": "12.5 kg CO₂e",
          "suggestions": [
            {
              "title": "复古花架",
              "description": "一句话说明改造思路",
              "steps": ["步骤1", "步骤2", "步骤3"],
              "difficulty": "简单",
              "duration": "1-2 小时",
              "carbon_reduction": "4.1 kg CO₂e"
            }
          ]
        }
        要求：
        1. suggestions 返回 3 条方案。
        2. material、integrity、carbon_reduction 必须是适合前端直接展示的中文字符串。
        3. difficulty 仅可使用：简单、中等、较难。
        4. steps 每条方案给出 3 到 5 步。
        5. 如果图片不清晰，也要给出尽可能合理的旧物重构建议。
        """

        image_url = f"data:{mime_type};base64,{image_base64}"
        response = client.chat.completions.create(
            model="Qwen/Qwen2-VL-72B-Instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
            temperature=0.3,
        )

        result_json = clean_json_text(response.choices[0].message.content)
        result_json["analysis_id"] = result_json.get("analysis_id") or f"rec_{uuid4().hex[:12]}"
        return {"status": "success", "data": result_json}

    except json.JSONDecodeError:
        return {"status": "error", "message": "AI 返回格式异常"}
    except Exception as e:
        return {"status": "error", "message": f"模型调用失败: {str(e)}"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8003)
