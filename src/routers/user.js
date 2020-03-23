const express = require('express')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const auth = require('../middlewares/auth')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeMail} = require('../emails/account')

const upload = multer({
    limits : {
        fileSize : 18000000 // 2Mo
    },
    fileFilter(req,file,cb) {
        
        // si le nom complet du fichier ne contient pas .jpg ou .png
        // on renvoie une erreur et on arrete l'execution du script        
        if(!file.originalname.match(/\.(png|jpg)/)) {
            return cb(new Error('Please upload a word file !'))
        }
        
        cb(undefined,true)
    }
})

const router = express.Router()

router.post('/users/login', async (req,res)=>{
    
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateToken()

        res.send({user,token})        
    } catch (e) {
        throw new Error('Something went wrong')
    }
})

router.get('/users', auth, async (req,res)=>{
    try {
        const users = await User.find({})        
        res.send(users)
    } catch (error) {
        res.send(error)
    }
})

router.post('/users',async (req,res)=>{

    try {

        const hashPassword = await(bcrypt.hash("fnp90std",8))

        console.log(req.body);
        
        const user = new User()
        
        user.name = req.body.name
        user.age = req.body.age
        user.email = req.body.email
        user.password = await(bcrypt.hash(req.body.password,8))
        const token = await(jwt.sign({name : req.body.name},process.env.JWT_SECRET))
        user.token = token
        
        sendWelcomeMail(user.email,user.name)

        await user.save()

        res.status(201).send('New User created !')
        
    } catch (error) {
        console.log(error)        
        res.status(400).send(error.message)
    }
})

router.get('/users/me',auth,(req,res)=>{    
    res.send(req.user)
})

router.get('/users/:id',(req,res)=>{
    User.find({_id : req.params.id}).then((User)=>{
        console.log(req.params.id)        
        res.send(User)
    })
})

router.patch('/users/:id',(req,res)=>{
    User.findByIdAndUpdate({_id:req.params.id}, req.body).then(()=>{
        console.log('The user has been updated !');
        res.send('The user has been updated !')
    })
})

// Suppression d'un user
router.delete('/users/:id',async (req,res)=>{

    try {
        const userDeleted = await(User.findByIdAndDelete(req.params.id))
        
    } catch (error) {
        res.send(error).status(500);        
    }
        
    res.status(200).send('The user has been deleted !')
})

// Upload d'un avatar 
router.post('/users/me/avatar', auth, upload.single('avatar'), async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height :250}).png().toBuffer()
    req.user.avatar = buffer

    await req.user.save()
    res.send('avatar uploaded correctly')
}, (error, req,res,next)=>{
    res.status(400).send({error : error.message})
})

// Afficher l'avatar d'un User
router.get('/user/:id/avatar',async(req,res)=>{

    try {
        const user = await User.findById(req.params.id)
        if(!user|| !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
        
    } catch (error) {
        res.status(404).send(error)
    }
})

// Suppression d'un avatar
router.delete('/users/me/avatar', auth, async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send('Avatar deleted !')
})

module.exports = router