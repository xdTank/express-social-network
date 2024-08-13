const prisma = require("../prisma/prisma-client")

const LikeController = {
    likePost: async (req, res) => {

        const { postId } = req.body

        if (!postId) {
            return res.status(400).json({ error: "Post not found" })
        }

        try {
            const existingLike = await prisma.like.findFirst({
                where: { postId, userId: req.user.id },
            });
            if(existingLike) {
                return res.status(400).json({ error: 'Post already liked' });
              }
            const like = await prisma.like.create({
                data: {
                    postId,
                    userId: req.user.id
                }
            })
            

            res.status(201).json(like)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    },

    unlikePost: async (req, res) => {

        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: "Post not found" })
        }

        try {
            const existingUnlike = await prisma.like.findFirst({
                where: { postId: id, userId: req.user.id },
            })

            if (!existingUnlike) {
                return res.status(400).json({ error: 'Post not liked' })
            }
            const like = await prisma.like.deleteMany({
                where: {
                    postId: id,
                    userId: req.user.id,
                }
            })

            res.status(200).json(like)
        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    }
}

module.exports = LikeController