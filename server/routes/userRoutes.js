import express from 'express'
import { auth } from '../middleware/auth.js'
import { getUserCreations, getPublishedCreations, toggleLikeCreation, togglePublishCreation } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/get-user-creations', auth, getUserCreations)
userRouter.get('/get-published-creations', auth, getPublishedCreations)
userRouter.post('/toggle-like-creation', auth, toggleLikeCreation)
userRouter.post('/toggle-publish-creation', auth, togglePublishCreation)


export default userRouter;