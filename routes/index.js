const express = require('express');
const router = express.Router();
const multer = require('multer');
const { UserController, PostController, CommentController, LikeController, FollowController } = require('../controllers');
const authToken = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/current', authToken, UserController.current)
router.get('/users/:id', authToken, UserController.getUserById)
router.put('/users/:id', authToken, UserController.updateUser)

router.get('/posts', authToken, PostController.getPosts)
router.get('/posts/:id', authToken, PostController.getPostById)
router.post('/posts', authToken,  PostController.createPost)
router.put('/posts/:id', authToken,  PostController.updatePost)
router.delete('/posts/:id', authToken, PostController.deletePost)

router.post('/comments/', authToken, CommentController.createComment)
router.delete('/comments/:id', authToken, CommentController.deleteComment)
router.put('/comments/:id', authToken, CommentController.updateComment)

router.post('/likes', authToken, LikeController.likePost)
router.delete('/likes/:id', authToken, LikeController.unlikePost)

router.post('/follow', authToken, FollowController.followUser)
router.delete('/follow/:id', authToken, FollowController.unfollowUser)

module.exports = router;
