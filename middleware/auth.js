const jwt = require('jsonwebtoken')

const authToken = (req, res, next) => {
    const authToken = req.header('authorization')
    const  token = authToken && authToken.split(' ')[1]
    
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()  
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid' })
    }
}

module.exports = authToken