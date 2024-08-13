const prisma = require("../prisma/prisma-client")

const CommentController = {

    createComment: async (req, res) => {
        const { content, postId } = req.body

        if (!content || !postId) {
            return res.status(400).json({ error: "Content is required" })
        }   
        try {
            const comment = await prisma.comment.create({
                data: {
                    postId,
                    userId: req.user.id,
                    content,
                }
            })
            res.status(201).json(comment)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    },

    deleteComment: async (req, res) => {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: "Comment not found" })
        }
        try {
            const comment = await prisma.comment.findUnique({
                where: { id }
            })

            if (!comment) {
                return res.status(404).json({ error: "Comment not found" })
            }

            if (comment.userId !== req.user.id) {
                return res.status(403).json({ error: "Unauthorized" })
            }

            await prisma.comment.delete({
                where: { id }
            })
            res.status(200).json(comment)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    },

    updateComment: async (req, res) => {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: "Comment not found" })
        }
        try {
            const comment = await prisma.comment.update({
                where: { id }, 
                data: {
                    content: req.body.content
                }
            })
            res.status(200).json(comment)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    }

}

module.exports = CommentController