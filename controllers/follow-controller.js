const prisma = require("../prisma/prisma-client")

const FollowController = {
    followUser: async (req, res) => {
        const { followingId } = req.body
        const userId = req.user.id

        if (!followingId) {
            return res.status(400).json({ error: "User not found" })
        }
        if (followingId === userId) {
            return res.status(400).json({ error: "You can't follow yourself" })
        }

        try { 
            const existingFollow = await prisma.follows.findFirst({
                where: {
                    AND: [
                        { followerId: userId },
                        { followingId }
                    ]
                }
            })

            if (existingFollow) {
                return res.status(400).json({ error: "You are already following this user" })
            }
            const follow = await prisma.follows.create({
                data: {
                    follower: {
                        connect: {
                            id: userId 
                        }   
                    },
                    following: {
                        connect: {
                            id: followingId
                        }
                    }
                }
            })
            res.status(201).json(follow)

        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
    },
    unfollowUser: async (req, res) => {
        const { followingId } = req.body
        const userId = req.user.id

        if (!followingId) {
            return res.status(400).json({ error: "User not found" })
        }

        
        try {
            const follwos = await prisma.follows.findFirst({
                where: {
                    AND: [
                        { followerId: userId },
                        { followingId }
                    ]
                }
            })
            if (!follwos) {
                return res.status(400).json({ error: "You are not following this user" })
            }

            const follow = await prisma.follows.deleteMany({
                where: {
                    AND: [
                        { followerId: userId },
                        { followingId }
                    ]
                }
            })
            res.status(200).json(follow)

        } catch (error) {
            res.status(500).json({ error: "Something went wrong" })
        }
        
    }

}

module.exports = FollowController
