const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name : {
        type : String
    },
    email: {
        type : String,
        trim : true,
        required : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('The email is not correct !!')
            }
        }
    },
    age : {
        type : Number,
        default : 30
    },
    password : {
        type : String,
        trim : true,
        required : true,
        minlength : 6,
        validate(value){
            if(value.includes('password')){
                throw new Error('The password must not contain the word password')
            }
        }
    },
    token : {
        type : String
    },
    avatar : {
        type : Buffer
    }
},{
    timestamps:true
})

// Relation avec le model Task
userSchema.virtual('tasks',{
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})

// recuperation des informations publiques du profil
userSchema.methods.toJSON = function(){
    const user = this

    // Transformation des données du model user en objet via la méthode de Mongoose
    const userObject = user.toObject()

    // On enleve les données que l'on ne veut pas renvoyer dans la réponse
    delete userObject.password
    delete userObject.token

    return userObject
}

// Génération du TOKEN
userSchema.methods.generateToken = async function(){
    const user = this 
    const token = await jwt.sign({_id : user._id.toString()},'mySecretKey')
    return token
}

// Recherche d'un utilisateur par email et Mdp
userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})      

    if(!user){
        throw new Error('No user has been found with this email address')
    }

    const verifyPassword = await(bcrypt.compare(password,user.password))
    
    if (!verifyPassword) {
        throw new Error('Wrong password')
    }

    return user
}

// Middleware avant sauvegarde d'une instance de User
userSchema.pre('save', async function(next){
    const user = this    
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User
