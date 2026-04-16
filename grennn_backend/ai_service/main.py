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


def ask_vision_model(prompt: str, image_url: str, temperature: float = 0.1):
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
        temperature=temperature,
    )
    return clean_json_text(response.choices[0].message.content)


def normalize_reconstruction_result(result: dict, identity: dict):
    item_name = str(result.get("item_name") or identity.get("item_name") or "未识别物品").strip()
    material = str(result.get("material") or identity.get("material") or "未识别").strip()
    integrity = str(result.get("integrity") or identity.get("integrity") or "不适用").strip()
    confidence = str(result.get("confidence") or identity.get("confidence") or "低").strip()
    reason = str(result.get("reason") or "暂未获得可靠判断依据").strip()
    disposal_advice = str(result.get("disposal_advice") or "请结合材质与当地回收要求分类处理").strip()

    lower_item = item_name.lower()
    lower_material = material.lower()
    furniture_keywords = ["椅", "凳", "桌", "柜", "架", "chair", "stool", "table", "shelf", "cabinet"]
    reusable_material_keywords = ["木", "木质", "实木", "竹", "藤", "金属", "铁", "钢", "铝", "塑料", "wood", "metal"]
    disposable_keywords = ["纸巾", "抽纸", "包装", "塑料袋", "餐盒", "一次性", "tissue", "package", "packaging"]

    is_furniture = any(keyword in lower_item for keyword in furniture_keywords)
    has_reusable_material = any(keyword in lower_material for keyword in reusable_material_keywords)
    is_disposable = any(keyword in lower_item for keyword in disposable_keywords)

    reconstructable = bool(result.get("reconstructable"))
    if is_disposable:
        reconstructable = False
    elif is_furniture and has_reusable_material:
        reconstructable = True

    suggestions = result.get("suggestions")
    suggestions = suggestions if isinstance(suggestions, list) else []

    if reconstructable and not suggestions and ("椅" in item_name or "chair" in lower_item):
        suggestions = [
            {
                "title": "复古花架",
                "description": "保留椅背与座面结构，改造成可摆放盆栽的立体花架。",
                "steps": ["清洁椅面并检查松动部位", "打磨木面并补强连接处", "刷木蜡油或环保清漆", "在座面和横档摆放绿植"],
                "difficulty": "简单",
                "duration": "2-3 小时",
                "carbon_reduction": "3.6 kg CO₂e",
            },
            {
                "title": "玄关置物椅",
                "description": "加装软垫和侧边挂钩，作为玄关换鞋椅与随手收纳位。",
                "steps": ["清洁并加固椅脚", "安装或粘贴坐垫", "侧边固定挂钩或收纳篮", "摆放到玄关并测试承重"],
                "difficulty": "简单",
                "duration": "1-2 小时",
                "carbon_reduction": "2.9 kg CO₂e",
            },
            {
                "title": "床头小书架",
                "description": "拆除部分椅腿并利用椅背结构，改造成窄型床头置物架。",
                "steps": ["根据尺寸拆除多余部件", "保留椅背作为竖向支撑", "加装隔板并固定", "打磨上色后用于床头收纳"],
                "difficulty": "中等",
                "duration": "3-5 小时",
                "carbon_reduction": "4.4 kg CO₂e",
            },
        ]

    carbon_reduction = str(result.get("carbon_reduction") or "不适用").strip()
    if reconstructable and carbon_reduction == "不适用":
        carbon_reduction = "3.0-5.0 kg CO₂e"
    if not reconstructable:
        carbon_reduction = "不适用"
        suggestions = []
        if integrity not in ["一次性用品", "不适用"] and is_disposable:
            integrity = "一次性用品"

    return {
        "analysis_id": str(result.get("analysis_id") or f"rec_{uuid4().hex[:12]}"),
        "item_name": item_name,
        "material": material,
        "integrity": integrity,
        "carbon_reduction": carbon_reduction,
        "reconstructable": reconstructable,
        "confidence": confidence,
        "reason": reason,
        "disposal_advice": disposal_advice,
        "suggestions": suggestions,
    }


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

        result_json = ask_vision_model(prompt, image_url, temperature=0.1)
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

        image_url = f"data:{mime_type};base64,{image_base64}"

        identify_prompt = """
        你是一名视觉识别助手。请先只做物品识别，不要急着给改造方案。
        严格输出 JSON，不要包含 Markdown 或额外解释。
        输出结构：
        {
          "item_name": "图片中的主要物品名称",
          "material": "主要材质",
          "integrity": "完整/轻微损耗/明显破损/一次性用品/不适用",
          "confidence": "高/中/低",
          "visible_features": ["可见特征1", "可见特征2"]
        }
        识别要求：
        1. 以图片中占比最大、最明确的物体为主。
        2. 常见家具如木椅子、木凳、桌子、柜子要优先准确识别，不要漏判。
        3. 不要把木椅、木桌等家具识别为一次性用品或包装物。
        4. 无法完全确定时使用保守名称，例如“木椅（待确认）”。
        """
        identity = ask_vision_model(identify_prompt, image_url, temperature=0.1)

        reconstruct_prompt = f"""
        你是一名旧物重构顾问。下面是已经识别出的物品信息，请据此判断是否适合重构。
        已识别信息：{json.dumps(identity, ensure_ascii=False)}

        严格输出 JSON，不要包含 Markdown、解释文本或多余字段。
        输出字段必须完全遵守以下结构：
        {{
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
            {{
              "title": "方案名称",
              "description": "一句话说明改造思路",
              "steps": ["步骤1", "步骤2", "步骤3"],
              "difficulty": "简单",
              "duration": "1-2 小时",
              "carbon_reduction": "1.2 kg CO₂e"
            }}
          ]
        }}

        严格要求：
        1. 木椅、木凳、木桌、木架、金属椅、柜子等耐用家具通常适合旧物重构。
        2. 若识别到木椅子或类似家具，优先给出合理改造方案，如花架、玄关椅、置物架等。
        3. 纸巾、抽纸、食品包装、塑料袋、一次性用品、湿污纸类通常不适合旧物重构。
        4. reconstructable=false 时：
           - suggestions 必须返回空数组
           - carbon_reduction 必须返回“不适用”
           - disposal_advice 必须给出明确处理建议
        5. reconstructable=true 时，suggestions 返回 2 到 3 条真正合理、与物品匹配的方案。
        6. 不要把纸类包装识别成木质，也不要把木椅识别成包装物。
        """
        draft_result = ask_vision_model(reconstruct_prompt, image_url, temperature=0.1)
        result_json = normalize_reconstruction_result(draft_result, identity)
        return {"status": "success", "data": result_json}

    except json.JSONDecodeError:
        return {"status": "error", "message": "AI 返回格式异常"}
    except Exception as e:
        return {"status": "error", "message": f"模型调用失败: {str(e)}"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8003)
