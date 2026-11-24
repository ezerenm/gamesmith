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

characterListFieldNames = ["characters"]
# generateJson checks this key exists in Gemini's answer

def buildCharactersSchema(howManyCharacters):
    # builds thee schema fresh anytime
    # the count can change

    oneCharacterShape = {
        "type": "object",
        "properties": {

            "name": {"type": "string"},
            "role": {"type": "string"},
            "traits": {"type": "array", "items": {"type": "string"}},
            # an array where every item is a string
            "backstory": {"type": "string"},
        },
        "required": ["name", "role", "traits", "backstory"],
    }
    # what one character should look like

    charactersWrapperSchema = {
        "type": "object",
        "properties": {
            "characters": {
                "type": "array",
                "items": oneCharacterShape,
                # every item in the list must match the shape above
                "minItems": howManyCharacters,
                "maxItems": howManyCharacters,
                # exactly this many, no more and no less
            },
        },
        "required": ["characters"],

    }
    
    return charactersWrapperSchema

def buildCharactersPrompt(storyProject, takenNames, characterCount):
    # storyProject = the project row
    # takenNames = names already used

    namesAlreadyUsed = "none yet"

    if len(takenNames) > 0:
        namesAlreadyUsed = ", ".join(takenNames)
    # turns ["Dude", "Bro"] into "Dude, Bro"

    characterInstructions = (
        "You are a genius game designer creating characters for a game.\n"
        "Create exactly " + str(characterCount) + " new characters that fit this game.\n\n"
        "Game title: " + storyProject.title + "\n"
        "Premise: " + storyProject.premise + "\n"
        "Genre: " + storyProject.genre + "\n"
        "Tone: " + storyProject.tone + "\n"
        "Setting: " + storyProject.setting + "\n"
        "Characters that already exist (do not repeat these names): " + namesAlreadyUsed + "\n\n"
        "Rules for each character:\n"
        "- name: a first name and last name that fits the setting\n"
        "- role: 1 to 3 words describing their part in the story, like \"first mate\" or \"rival captain\"\n"
        "- traits: exactly 3 personality traits, one or two words each\n"
        "- backstory: 1 to 2 sentences that connect them to the premise\n"
        "Give the characters different roles so the cast feels varied."

    )
    # the concept that goes into the prompt so characters fit their game

    return characterInstructions