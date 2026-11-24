from .geminiService import generateJson

titleSchema = {
    "type": "object",
    "properties": {

        "title": {"type": "string"},

        "premise": {"type": "string"},

    },

    "required": ["title", "premise"],

}

conceptResult = generateJson(
    "Create a game title and one sentence premise for: a poor boy who wants to be king of pirates",

    titleSchema,
    ["title", "premise"]
)

print(conceptResult)

print(conceptResult["title"])