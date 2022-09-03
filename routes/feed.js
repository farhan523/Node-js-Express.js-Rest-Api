const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/isAuth');

const { body } = require('express-validator')

const feedController = require('../controllers/feed')

router.get('/posts', feedController.getPost);
router.get('/post/:postId',isAuth, feedController.getPostById)
router.post('/createPost',isAuth, [body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })], feedController.createPost)
router.put('/post/:postId',[body('title').trim().isLength({ min: 5 }), body('content').trim().isLength({ min: 5 })], feedController.updatePost)
router.delete('/post/:postId',isAuth,feedController.deletePost)



module.exports = router;