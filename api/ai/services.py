import os
import json


class AIService:
    @staticmethod
    def generate_with_gemini(prompt, model_name="gemini-2.0-flash"):
        try:
            from google import genai
        except ImportError:
            import google.genai as genai

        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise Exception("Gemini API Key not found.")

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(model=model_name, contents=prompt)
        return response.text.strip()

    @staticmethod
    def generate_with_openai(prompt, model_name="gpt-4o-mini"):
        from openai import OpenAI

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise Exception("OPENAI_API_KEY not found.")

        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content.strip()

        # OpenAI JSON mode returns an object, we often need the list inside
        try:
            data = json.loads(content)
            if isinstance(data, dict) and "testcases" in data:
                return json.dumps(data["testcases"])
            # If it wrapped it in another common key or returned the list directly
            for val in data.values():
                if isinstance(val, list):
                    return json.dumps(val)
            return content
        except:
            return content

    @classmethod
    def generate_with_fallback(cls, prompt, provider_preference=["gemini", "openai"]):
        errors = []
        for provider in provider_preference:
            try:
                if provider == "gemini":
                    return cls.generate_with_gemini(prompt), "Gemini"
                if provider == "openai":
                    return cls.generate_with_openai(prompt), "ChatGPT"
            except Exception as e:
                errors.append(f"{provider}: {str(e)}")
                continue

        raise Exception(f"All AI providers failed: {'; '.join(errors)}")

    @staticmethod
    def clean_json_string(content):
        if content.startswith("```"):
            if content.startswith("```json"):
                content = content[7:]
            else:
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
        return content.strip()
