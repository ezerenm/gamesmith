import json

import time

from google import genai

from google.genai import errors, types

from .config import fallbackModelName, geminiApiKey, primaryModelName, retriesPerModel

from .errors import ApiError

cachedGeminiClient = None

def getGeminiClient():
    global cachedGeminiClient

    if cachedGeminiClient is None:
        if not geminiApiKey:
            raise ApiError(503, "generation_failed", "The AI service is not configured.")
        cachedGeminiClient = genai.Client(api_key=geminiApiKey)

    return cachedGeminiClient

def askOneModel(modelNameToTry, promptForModel, schemaForModel):

    geminiConnection = getGeminiClient()

    jsonSettings = types.GenerateContentConfig(

        response_mime_type="application/json",

        response_json_schema=schemaForModel,

    )

    retryAttempt = 1

    while retryAttempt <= retriesPerModel:

        try:
            rawModelReply = geminiConnection.models.generate_content(

                model=modelNameToTry,
                contents=promptForModel,
                config=jsonSettings,

            )

            return rawModelReply.text

        except errors.ServerError:

            pauseSeconds = retryAttempt * 2

            print(modelNameToTry + " is busy. Waiting " + str(pauseSeconds) + " seconds...")

            time.sleep(pauseSeconds)

            retryAttempt = retryAttempt + 1

        except errors.ClientError as clientProblem:

            if clientProblem.code == 429:

                pauseSeconds = retryAttempt * 2

                print(modelNameToTry + " hit a rate limit. Waiting " + str(pauseSeconds) + " seconds...")

                time.sleep(pauseSeconds)

                retryAttempt = retryAttempt + 1

            else:
                print(modelNameToTry + " refused the request: " + str(clientProblem))

                return None
    
    return None

def generateJson(promptText, outputSchema, requiredFieldNames):

    modelsInOrder = [primaryModelName, fallbackModelName]

    gotBadOutput = False

    for currentModelName in modelsInOrder:

        replyText = askOneModel(currentModelName, promptText, outputSchema)

        if replyText is None:

            continue

        try:

            parsedReply = json.loads(replyText)
        
        except json.JSONDecodeError:

            print(currentModelName + " returned text that was not valid JSON.")

            gotBadOutput = True

            continue

        missingFieldNames = []

        for fieldName in requiredFieldNames:

            if fieldName not in parsedReply:
                missingFieldNames.append(fieldName)
            
            elif parsedReply[fieldName] in (None, ""):
                missingFieldNames.append(fieldName)

        if len(missingFieldNames) > 0:

            print(currentModelName + " left out: " + ", ".join(missingFieldNames))

            gotBadOutput = True

            continue
        
        return parsedReply

    if gotBadOutput:

        raise ApiError(422, "invalid_generation", "The AI gave an unusable answer. Please try again.")

    raise ApiError(503, "generation_failed", "The AI service is busy. Please try again in a moment.")