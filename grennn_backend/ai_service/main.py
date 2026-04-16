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
        你是一名谨慎的旧物重构分析助手。你的第一任务是准确识别图片中的主要物品，
        第二任务才是判断它是否适合进行旧物重构。禁止为了满足格式而编造不合理的结果。

        请严格输出 JSON，不要包含 Markdown、解释文本或多余字段。
        输出字段必须完全遵守以下结构：
        {
          "analysis_id": "rec_xxx",
          "item_name": "物品名称",
          "material": "主要材质或包装材质",
          "integrity": "完整/破损/一次性用品/不适用",
          "carbon_reduction": "仅在适合重构时给出如 3.2 kg CO₂e，否则返回 不适用",
          "reconstructable": true,
          "confidence": "高/中/低",
          "reason": "为什么适合或不适合重构",
          "disposal_advice": "如果不适合重构，给出回收/分类处理建议；适合则返回可进入手工改造",
          "suggestions": [
            {
              "title": "方案名称",
              "description": "一句话说明改造思路",
              "steps": ["步骤1", "步骤2", "步骤3"],
              "difficulty": "简单",
              "duration": "1-2 小时",
              "carbon_reduction": "1.2 kg CO₂e"
            }
          ]
        }

        严格要求：
        1. 先识别物品，不确定时 item_name 可写“纸巾包装（待确认）”这类保守表述。
        2. 如果是纸巾、抽纸、食品包装、塑料袋、一次性用品、湿污纸类等通常不适合旧物重构的物品，
           必须返回 reconstructable=false。
        3. reconstructable=false 时：
           - suggestions 必须返回空数组
           - carbon_reduction 必须返回“不适用”
           - integrity 可返回“一次性用品”或“不适用”
           - disposal_advice 必须给出明确处理建议
        4. reconstructable=true 时，suggestions 返回 2 到 3 条真正合理、与识别物品匹配的方案。
        5. 不要把纸类包装、抽纸、塑料包装识别成木质、金属、玻璃等明显错误材质。
        6. 若图像不足以支持高置信识别，confidence 返回“低”，并采用保守结论，不要强行生成改造方案。
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
            temperature=0.1,
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
