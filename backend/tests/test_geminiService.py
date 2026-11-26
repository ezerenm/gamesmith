import httpx2

import pytest

from backend import geminiService

from backend.errors import ApiError

class SlowFakeModels:

    def __init__(self):

        self.modelNamesAsked = []

    def generate_content(self, model, contents, config):

        self.modelNamesAsked.append(model)

        raise httpx2.ReadTimeout("Gemini never answered")

class SlowFakeClient:

    def __init__(self):

        self.models = SlowFakeModels()

def testTimeoutGivesBusyErrorInsteadOfHanging(monkeypatch):

    slowClient = SlowFakeClient()

    def giveSlowClient():

        return slowClient

    monkeypatch.setattr(geminiService, "getGeminiClient", giveSlowClient)

    with pytest.raises(ApiError) as caughtProblem:

        geminiService.generateJson("any prompt", {"type": "object"}, ["title"])

    assert caughtProblem.value.statusCode == 503

    assert slowClient.models.modelNamesAsked == [geminiService.primaryModelName, geminiService.fallbackModelName]

def testClientIsBuiltWithTimeout(monkeypatch):

    savedClientSettings = {}

    def fakeClientMaker(api_key, http_options):

        savedClientSettings["timeout"] = http_options.timeout

        return "pretend client"
    
    monkeypatch.setattr(geminiService, "geminiApiKey", "fake key")

    monkeypatch.setattr(geminiService, "cachedGeminiClient", None)

    monkeypatch.setattr(geminiService.genai, "Client", fakeClientMaker)

    geminiService.getGeminiClient()

    assert savedClientSettings["timeout"] == geminiService.geminiTimeoutMilliseconds