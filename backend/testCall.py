import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

apiKey = os.getenv("GEMINI_API_KEY")

geminiClient = genai.Client(api_key=apiKey)

usersGameIdea = "a poor boy with a dream of becoming the king of pirates."

modelResponse = geminiClient.models.generate_content(

    model="gemini-flash-lite-latest", contents="Write a one paragraph premise for the users game idea: " + usersGameIdea)

print(modelResponse.text)
