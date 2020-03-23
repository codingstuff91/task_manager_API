const express = require('express')
const Task = require('../models/Task')
const router = express.Router()
const auth = require('../middlewares/auth')

router.get('/tasks',auth, async(req,res)=>{
    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const criterias = req.query.sortBy.split(':')
        console.log(criterias);       

        // Si le critère trouvé dans le param est 'desc' on renseigne -1 sinon on renseigne 1
        sort[criterias[0]] = criterias[1] === 'desc' ? -1 : 1      
    }

    try {
        await req.user.populate({
            path : 'tasks',
            match, 
            options : {
                limit : parseInt(req.query.limit), 
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        console.log(error);        
    }
})

router.get('/tasks/me', auth, async(req,res)=>{   
    const tasks = await Task.find({
        owner : req.user._id
    }).sort({createdAt : 'desc'})
    res.send(tasks)
})

// Create a new task
router.post('/tasks',auth, async(req,res)=>{
    try {
        const newTask = new Task()
        newTask.description = req.body.description
        newTask.owner = req.user._id
        await newTask.save()
        res.send('new task created !').status(201)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router