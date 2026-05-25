import 'dotenv/config'
import OpenAI from 'openai'

const getAI = () => new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
})

// gemini-2.0-flash returns 429 on many free-tier keys; these models work reliably
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash']

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const getGeminiErrorMessage = (error) => {
    if (error?.status === 429) {
        return 'Gemini rate limit reached. Wait a minute and try again, or check your quota in Google AI Studio.'
    }
    if (error?.status === 404) {
        return 'AI model not available. Please try again in a moment.'
    }
    return error?.message || 'AI request failed'
}

export const createGeminiCompletion = async ({ messages, max_tokens, temperature = 0.7 }) => {
    let lastError

    for (const model of MODELS) {
        for (let attempt = 0; attempt < 4; attempt++) {
            try {
                const response = await getAI().chat.completions.create({
                    model,
                    messages,
                    temperature,
                    max_tokens,
                })

                const content = response.choices[0]?.message?.content
                if (!content) {
                    throw new Error('Empty response from AI. Try again.')
                }

                return content
            } catch (error) {
                lastError = error
                const retryable = error?.status === 429 || (error?.status >= 500)

                if (retryable && attempt < 3) {
                    await sleep(1000 * Math.pow(2, attempt))
                    continue
                }

                // Try next model on rate limit or model-not-found
                if (error?.status === 429 || error?.status === 404) {
                    break
                }

                throw error
            }
        }
    }

    throw lastError
}
