import { clerkClient } from '@clerk/express'

export const auth = async (req, res, next) => {
    try {
        const { userId, has } = req.auth();

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }

        const hasPremiumPlan = await has({ plan: 'premium' })
        const user = await clerkClient.users.getUser(userId)

        req.plan = hasPremiumPlan ? 'premium' : 'free'
        req.free_usage = hasPremiumPlan ? 0 : (user.privateMetadata?.free_usage ?? 0)

        next()
    } catch (error) {
        const message =
            error?.message ??
            error?.response?.data ??
            (typeof error === 'string' ? error : 'Unknown authentication error')
        console.log('AUTH_ERROR:', error)
        res.status(401).json({ success: false, message })
    }
}
