import axios from "axios";
import sql from '../configs/db.js'
import { clerkClient } from '@clerk/express'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import { PDFParse } from 'pdf-parse'
import { createGeminiCompletion, getGeminiErrorMessage } from '../utils/gemini.js'

const incrementFreeUsage = async (userId, free_usage) => {
    await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
            free_usage: free_usage + 1
        }
    })
}

const deleteUploadedFile = (file) => {
    if (file?.path) {
        fs.unlink(file.path, () => {})
    }
}

// Client sends a word-count target (800 / 1200 / 1600), not output tokens.
const getArticleMaxTokens = (wordTarget) => {
    if (wordTarget <= 800) return 2000
    if (wordTarget <= 1200) return 3200
    return 5000
}

const buildArticlePrompt = (topic, wordTarget, lengthLabel) => {
    const range =
        wordTarget <= 800
            ? '500–800 words'
            : wordTarget <= 1200
              ? '800–1200 words'
              : 'at least 1200 words'

    return `Write a complete article about: ${topic}

Length: ${lengthLabel} (${range}).

Requirements:
- Include a clear introduction, well-developed body sections (use headings where helpful), and a conclusion.
- Write the full article in one pass. Do not stop mid-sentence, mid-paragraph, or mid-list.
- Every section and bullet list must be finished before you end.
- Aim for the target word count; prioritize a polished, complete ending over padding.`
}

const buildBlogTitlePrompt = (keyword, category) => `Generate exactly 10 unique, engaging blog post titles for the keyword "${keyword}" in the ${category} category.

Format:
- Use a numbered markdown list (1. through 10.).
- One title per line; keep titles concise and click-worthy.
- Do not include extra commentary before or after the list.

Requirements:
- Provide all 10 titles completely.
- Do not stop mid-list or mid-sentence.`

const buildResumeReviewPrompt = (resumeText) => `Review the following resume and provide constructive, actionable feedback.

Structure your response in markdown with these sections (use ## headings):
## Overall Impression
## Strengths
## Weaknesses
## Areas for Improvement
## Specific Recommendations
## Summary

Requirements:
- Complete every section with clear bullet points or short paragraphs.
- Do not stop mid-sentence, mid-paragraph, or mid-bullet list.
- End with a finished Summary section.

Resume content:

${resumeText}`

export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length, lengthLabel, topic } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue" })
        }

        const wordTarget = Number(length) || 800
        const articlePrompt = buildArticlePrompt(
            topic || prompt,
            wordTarget,
            lengthLabel || 'Short (500-800 words)'
        )

        const content = await createGeminiCompletion({
            messages: [{ role: "user", content: articlePrompt }],
            max_tokens: getArticleMaxTokens(wordTarget),
        })

        const storedPrompt = `Article: ${topic || prompt || 'Untitled'} (${lengthLabel || `${wordTarget} words`})`
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${storedPrompt}, ${content}, 'article')`

        if (plan !== 'premium') {
            await incrementFreeUsage(userId, free_usage)
        }

        res.json({ success: true, content })

    } catch (error) {
        console.log('GENERATE_ARTICLE_ERROR:', error)
        res.json({ success: false, message: getGeminiErrorMessage(error) })
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { prompt, keyword, category } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const topic = keyword || prompt
        const blogPrompt = buildBlogTitlePrompt(topic, category || 'General')
        const storedPrompt = `Blog titles: ${topic} (${category || 'General'})`

        const content = await createGeminiCompletion({
            messages: [{ role: "user", content: blogPrompt }],
            max_tokens: 1500,
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${storedPrompt}, ${content}, 'blog-title')`

        if (plan !== 'premium') {
            await incrementFreeUsage(userId, free_usage)
        }

        res.json({ success: true, content })
    } catch (error) {
        console.log('GENERATE_BLOG_TITLE_ERROR:', error)
        res.json({ success: false, message: getGeminiErrorMessage(error) })
    }
}

export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { prompt, publish } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscribers." })
        }

        const formData = new FormData()
        formData.append('prompt', prompt)
        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
            responseType: "arraybuffer",
        })

        const base64Data = Buffer.from(data).toString('base64')
        const base64Image = `data:image/png;base64,${base64Data}`

        const { secure_url } = await cloudinary.uploader.upload(base64Image)

        const isPublished = publish === true || publish === 'true'

        const [creation] = await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish)
            VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${isPublished})
            RETURNING id, publish
        `

        res.json({
            success: true,
            content: secure_url,
            creationId: creation.id,
            publish: creation.publish,
        })
    } catch (error) {
        console.log('GENERATE_IMAGE_ERROR:', error)
        const message = error?.message ?? error?.response?.data ?? 'Unknown image generation error'
        res.status(500).json({ success: false, message: String(message) })
    }
}

export const removeImageBackground = async (req, res) => {
    const image = req.file
    try {
        const { userId } = req.auth()
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscribers." })
        }

        if (!image) {
            return res.json({ success: false, message: "No image uploaded." })
        }

        const imageBuffer = fs.readFileSync(image.path)
        const blob = new Blob([imageBuffer], { type: image.mimetype })
        const formData = new FormData()
        formData.append('image_file', blob, image.originalname)

        const { data } = await axios.post("https://clipdrop-api.co/remove-background/v1", formData, {
            headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
            responseType: "arraybuffer",
        })

        const base64Data = Buffer.from(data).toString('base64')
        const base64Image = `data:image/png;base64,${base64Data}`
        const { secure_url } = await cloudinary.uploader.upload(base64Image)

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`

        res.json({ success: true, content: secure_url })
    } catch (error) {
        console.log('REMOVE_BACKGROUND_ERROR:', error)
        const message = error?.message ?? error?.response?.data ?? 'Background removal failed'
        res.status(500).json({ success: false, message: String(message) })
    } finally {
        deleteUploadedFile(image)
    }
}

export const removeImageObject = async (req, res) => {
    const image = req.file
    try {
        const { userId } = req.auth()
        const { object } = req.body
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscribers." })
        }

        if (!image) {
            return res.json({ success: false, message: "No image uploaded." })
        }

        if (!object?.trim()) {
            return res.json({ success: false, message: "Please describe the object to remove." })
        }

        const { public_id } = await cloudinary.uploader.upload(image.path)

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:${object.trim()}` }],
            resource_type: 'image'
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object.trim()} from image`}, ${imageUrl}, 'image')`

        res.json({ success: true, content: imageUrl })
    } catch (error) {
        console.log('REMOVE_OBJECT_ERROR:', error)
        const message = error?.message ?? error?.response?.data ?? 'Object removal failed'
        res.status(500).json({ success: false, message: String(message) })
    } finally {
        deleteUploadedFile(image)
    }
}

export const resumeReview = async (req, res) => {
    const resume = req.file
    let parser
    try {
        const { userId } = req.auth()
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscribers." })
        }

        if (!resume) {
            return res.json({ success: false, message: "No resume uploaded." })
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)" })
        }

        const dataBuffer = fs.readFileSync(resume.path)
        parser = new PDFParse({ data: dataBuffer })
        const pdfData = await parser.getText()

        const reviewPrompt = buildResumeReviewPrompt(pdfData.text)

        const content = await createGeminiCompletion({
            messages: [{ role: "user", content: reviewPrompt }],
            max_tokens: 4096,
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`

        res.json({ success: true, content })
    } catch (error) {
        console.log('RESUME_REVIEW_ERROR:', error)
        res.json({ success: false, message: getGeminiErrorMessage(error) })
    } finally {
        if (parser) {
            try {
                await parser.destroy()
            } catch (destroyError) {
                console.log('PDF_PARSER_DESTROY_ERROR:', destroyError)
            }
        }
        deleteUploadedFile(resume)
    }
}
