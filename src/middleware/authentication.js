//it is the file for the set up of the authentication middleware
let jwt=require('jsonwebtoken')
let User=require('../models/user')

let authentication=async(req,res,next)=>{
  //if the user is authenticated try block will execute otherwise catch block will execute
try{
    //to get hte Bearer token back we set in the authorization header and then replace of the bearer from this
    let token=req.header('Authorization').replace('Bearer ','')
    
    //to check weather the token is valid
    let decoded=jwt.verify(token,process.env.JWT_SECRET)

    //to get the user from the id provided by the decoder
    let user=await User.findOne({_id:decoded._id,'tokens.token':token})

    if(!user){
        //means there is no user found
        throw  new Error()
    }
//to returnn the token value as the property of the req
req.token=token

//if all the things went well we will set the property user to the request and give its value as user
req.user=user

    next()

}catch(e){
res.status(404).send({
    error:"please authenticate properly "
    
})
}

}

module.exports=authentication