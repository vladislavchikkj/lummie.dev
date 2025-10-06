import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const CHAT_NAME_PROMPT = `
You are an assistant that generates short, descriptive names for chat conversations based on the first user message.
The name should be:
  - Relevant to the conversation topic
  - Max 3 words
  - Written in title case (e.g., "Weather App", "Data Analysis", "Recipe Ideas")
  - No punctuation, quotes, or prefixes
  - Generic enough to work for ongoing conversations

Only return the raw name.
`

export async function generateChatName(firstMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CHAT_NAME_PROMPT },
        { role: 'user', content: firstMessage },
      ],
      max_tokens: 20,
      temperature: 0.7,
    })

    const generatedName = response.choices[0]?.message?.content?.trim()

    if (!generatedName) {
      return 'New Chat'
    }

    // Fallback to a simple name if generation fails
    return generatedName || 'New Chat'
  } catch (error) {
    console.error('Error generating chat name:', error)
    return 'New Chat'
  }
}
