import os
from dotenv import load_dotenv
from google import genai
from google.genai import errors
import time

load_dotenv()

apiKey = os.getenv("GEMINI_API_KEY")

geminiClient = genai.Client(api_key=apiKey)

usersGameIdea = "a poor boy with a dream of becoming the king of pirates."

prompt = "Write a one pararaph premise for the users game idea: " + usersGameIdea

maxAttempts = 6

attemptNumber = 1

modelResponse = None

while attemptNumber <= maxAttempts:
    try:
        modelResponse = geminiClient.models.generate_content(

            model="gemini-3.5-flash-lite", contents=prompt

        )

        break
    
    except errors.ServerError:
        secondsToStandby = attemptNumber * 5

        print("The server is currently busy. Waiting for " + str(secondsToStandby) + " seconds before retrying...")
        time.sleep(secondsToStandby)
        attemptNumber = attemptNumber + 1

if modelResponse is None:

    print("The model could not be reached after " + str(maxAttempts) + " attempts. Please try again later.")

else:

    print(modelResponse.text)