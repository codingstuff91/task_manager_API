const express = require('express')
require('./db/mongoose')
const jwt = require('jsonwebtoken')

const Task = require('./models/Task')
const User = require('./models/User')

const app = express()
const port = process.env.port || 3000

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const multer = require('multer')

const upload = multer({
    dest : 'images'
})

app.post('/upload',upload.single('upload'),(req,res)=>{
    res.send('upload complete')
})

// app.use((req,res,next)=>{
//     res.send('Site on maintenance mode')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log("server is up on the port " + port);
})