//Here is the code to create the user model

let mongoose=require('mongoose')
let validator=require('validator')
let bcrypt=require('bcrypt')
let jwt=require('jsonwebtoken')
let Task=require('./tasks')

//schema is the thing to which the input argument is converted first
//so to use middlewere we first let the schema and then we pass it to the model

let userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    //here is the instance for the email
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(email){
            if(!validator.isEmail(email)){
                throw new Error("Your email is invalid")
            }
        }
    },
    //password instanse
    password:{
        required:true,
        type:String,
        trim:true,
       
        validate(password){
            if(password.length<6){
               
                throw new Error("minimum length of password should be 6 characters")
            }
            else if(password.includes('password')||password.includes('PASSWORD')){
                throw new Error('enter another password')
            }
        }

    },
    //it will be used to keep the authentication token
    tokens:[{
        token:{
            type:String,
            required:true

        }
    }],
    //it will be store the buffer code of the image uploaded by the user
    avatar:{
        type:Buffer
    },
    age:{
        type:Number,
        default:0,
        //to customize the age according to our needs
        validate(value){
            if(value<0){
               throw new Error("age must be positive")
            }
        }
    }
},//here we have to add a new object as argument
{
    timestamps:true
})

//when we want to add some property as virtual 
userschema.virtual('task',{
    ref:'task',
    localField:'_id',
    foreignField:'owner'
})

//here is the method to return the authentication token for a single user
//methods method is used for the instances and the statics method is used for the model
userschema.methods.getAuthToken=async function(){
    
    let user=this
 //to get the auth token
 let token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)

 //here we will save the token to the database before it is returned back
  user.tokens=user.tokens.concat({
      token:token
  })
  await user.save()
 return token 
}

//here is the method to return the user profile without token and password
userschema.methods.userProfile= async function(){
 let user=this

 //to convert this user into an user object
 let userObject=user.toObject()
delete userObject.password
delete userObject.tokens
delete userObject.avatar

 //to return the userobject which does not have the password and tokens in it
 return userObject
}

userschema.statics.findByCredentials=async (email,password)=>{
//to find if email is present in our database or not
let user= await User.findOne({email:email})
if(!user){
throw new Error('register yourself first ')
}

//to compare the password with our database and entered by user
let isvalid=await bcrypt.compare(password,user.password)

if(!isvalid){
    throw new Error("wrong password")
}
return user
}

//hash the plain password before saving
userschema.pre('save',async function(next) {
//this is used for the schema which we are in
let user=this
//here is the code to check weather the password is entered or updated and to convert it into the hash password
if(user.isModified('password')){

    user.password= await bcrypt.hash(user.password,8)
}
//next function is called to tell that this function is over and next execution can be done
    next()
})

//here is the code to delete the task when user delete its account
userschema.pre('remove', async function(next){
    let user=this
//to delete many data at once we use delete many
await Task.deleteMany({
    owner:user._id
})

//to call next when work of the function is done
next()
})

 
let User=mongoose.model("User",userschema)


//here is the code to export something which is user
module.exports=User