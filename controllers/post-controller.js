const prisma = require("../prisma/prisma-client")

const PostController = {
    createPost: async (req, res) => {
        const { content } = req.body

        const authorId = req.user.id

        if (!content) {
            return res.status(400).json({ error: "Content is required" })
        }

        try {
            const post = await prisma.post.create({
                data: {
                    content,
                    authorId
                }
            })
            res.status(201).json(post)
        } catch (error) {  
            console.log(error)
            res.status(500).json({ error: "Something went wrong" })
        }
        
    },

    getPosts: async (req, res) => {
        const userId = req.user.id
        try {
            const posts = await prisma.post.findMany({
              include: {
                    author: true,
                  likes: true,
                  comments: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            })
            posts.map(post => {
                post.isLiked = post.likes.some(like => like.userId === userId)
            })
            res.status(200).json(posts)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    },

    getPostById: async (req, res) => {
        const { id } = req.params
        const userId = req.user.id

       
        try {
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    author: true,
                    likes: true,
                    comments: {
                        include: {
                            user: true
                        }
                  }
                }
            })
            if (!post) {
                return res.status(404).json({ error: "Post not found" })
            }
            post.isLiked = post.likes.some(like => like.userId === userId)
            res.status(200).json(post)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    },

    deletePost: async (req, res) => {
        const { id } = req.params
        const post = await prisma.post.findUnique({ where: { id } })
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }
        if (post.authorId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" })
        }
        try {
            const post = await prisma.$transaction([
                prisma.comment.deleteMany({
                    where: { postId: id }
                }),
                prisma.like.deleteMany({
                    where: { postId: id }
                }),
                prisma.post.delete({
                    where: { id }
                })
            ])

            res.status(200).json(post)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    },

    updatePost: async (req, res) => {
        const { id } = req.params
        const { content } = req.body
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }
        if (post.authorId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" })
        }
        try {
            const post = await prisma.post.update({
                where: { id },
                data: {
                    content
                }
            })
            res.status(200).json(post)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    }
    
}

module.exports = PostController