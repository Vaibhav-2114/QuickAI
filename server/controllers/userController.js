import sql from "../configs/db.js"

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth()

        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`

        res.json({ success: true, creations })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getPublishedCreations = async (req, res) => {
    try {
        const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`

        res.json({ success: true, creations })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const togglePublishCreation = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { id, publish } = req.body

        const [creation] = await sql`
            SELECT * FROM creations WHERE id = ${id} AND user_id = ${userId}
        `

        if (!creation) {
            return res.json({ success: false, message: "Creation not found" })
        }

        if (creation.type !== 'image') {
            return res.json({ success: false, message: "Only images can be published to the community" })
        }

        const isPublished = publish === true || publish === 'true'

        await sql`
            UPDATE creations SET publish = ${isPublished}, updated_at = NOW() WHERE id = ${id}
        `

        res.json({
            success: true,
            publish: isPublished,
            message: isPublished ? 'Image is now public' : 'Image is now private',
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const toggleLikeCreation = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { id } = req.body

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`

        if (!creation) {
            return res.json({ success: false, message: "Creation not found" })
        }

        const currentLikes = creation.likes ?? []
        const userIdStr = userId.toString()
        let updatedLikes
        let message

        if (currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter((user) => user !== userIdStr)
            message = 'Creation unliked'
        } else {
            updatedLikes = [...currentLikes, userIdStr]
            message = 'Creation liked'
        }

        await sql`UPDATE creations SET likes = ${updatedLikes}, updated_at = NOW() WHERE id = ${id}`

        res.json({ success: true, message, likes: updatedLikes })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
