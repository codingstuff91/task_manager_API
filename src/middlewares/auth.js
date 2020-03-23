const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req,res,next)=>{

    try {
        const token = req.header('Authorization')
        const userToken = token.replace('Bearer ', '')
    
        const decodedToken = jwt.verify(userToken,process.env.JWT_SECRET)
        console.log(decodedToken);
        
        const user = await User.findOne({ name : decodedToken.name})
        
        if(!user) {
            throw new Error({error : "Please authentificate !"})
        }
        
        // On associe une variable "user" a req
        req.user  = user

        next()
        
    } catch (error) {
        res.status(400).send('Please authentificate!')
    }
}

module.exports = auth
