conceptFieldNames = ["title", "premise", "genre", "tone", "setting"]

conceptSchema = {
    "type": "object",

    "properties": {
        "title": {"type": "string"},
        "premise": {"type": "string"},
        "genre": {"type": "string"},
        "tone": {"type": "string"},
        "setting": {"type": "string"}

    },
    "required": ["title", "premise", "genre", "tone", "setting"],

}

def buildConceptPrompt(gameIdeaText):
    
    conceptInstructions = (
        "You are a genius game designer helping someone develop their game idea.\n"
        "Turn their idea below into a game concept.\n\n"
        "Rules:\n"
        "- title: a short, memorable game title (2 to 6 words)\n"
        "- premise: 2 to 3 sentences about the main character, their goal, and what stands in their way\n"
        "- genre: 1 to 3 words, like \"action adventure\" or \"cozy farming sim\"\n"
        "- tone: 2 to 3 words separated by commas, like \"hopeful, swashbuckling\"\n"
        "- setting: one sentence describing where and when the game takes place\n\n"
        "Game idea: " + gameIdeaText
    )

    return conceptInstructions