const prisma = require("../prisma/prisma-client")
const bcrypt = require('bcryptjs')
const Jdenticon = require('jdenticon')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')

const UserController = {
    register: async (req, res) => {
        const { email, password, name } = req.body

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'All fields are required' })
        }
        
        try {
            const existingUser = await prisma.user.findUnique({ where: { email } })

            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' })
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const png = Jdenticon.toPng(name, 200)
            const avatarName = `${name}-${Date.now()}.png`
            const avatarPath = path.join(__dirname, '/../uploads', avatarName)
            fs.writeFileSync(avatarPath, png)

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    avatarUrl: `/uploads/${avatarName}`
                }
            })
            
            res.status(201).json(user)
            
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Something went wrong' })
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }
        try {
            const user = await prisma.user.findUnique({ where: { email } })

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' })
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password)

            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'Invalid credentials' })
            }
            const token = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

            res.status(200).json({  user, token })

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Something went wrong' })
        }
    },
    getUserById: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;
    
        try {
          const user = await prisma.user.findUnique({
            where: { id },
            include: {
              followers: true,
              following: true
            }
          });
    
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
    
          const isFollowing = await prisma.follows.findFirst({
            where: {
              AND: [
                { followerId: userId },
                { followingId: id }
              ]
            }
          });
    
          res.json({ ...user, isFollowing: Boolean(isFollowing) });
        } catch (error) {
          res.status(500).json({ error: "Something went wrong" });
        }
      },
      updateUser: async (req, res) => {
        const { id } = req.params;
        const { email, name, dateOfBirth, bio, location } = req.body;
    
        let filePath;
    
        if (req.file && req.file.path) {
          filePath =  req.file.path;
        }
    
        if (id !== req.user.id) {
          return res.status(403).json({ error: "Unauthorized" });
        }
    
        try {
          if (email) {
            const existingUser = await prisma.user.findFirst({
              where: { email: email },
            });
        
            if (existingUser && existingUser.id !== parseInt(id)) {
              return res.status(400).json({ error: "Email already exists" });
            }
         }
    
          const user = await prisma.user.update({
            where: { id },
            data: {
              email: email || undefined,
              name: name || undefined,
              avatarUrl: filePath ? `/${filePath}` : undefined,
              dateOfBirth: dateOfBirth || undefined,
              bio: bio || undefined,
              location: location || undefined,
            },
          });
          res.json(user);
        } catch (error) {
          console.log('error', error)
          res.status(500).json({ error: "Something went wrong" });
        }
      },
    current: async (req, res) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id }, include: {
                    followers: {
                        include: {
                          follower: true
                        }
                    },
                    following: {
                        include: {
                          following: true
                        }
                    }
                }
            })
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }
            res.json(user)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Something went wrong' })
        }
    },
}

module.exports = UserController