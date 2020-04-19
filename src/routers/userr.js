//this file is to put all the user commands and method in the seprate file so to reduce the complexity of the index.js file 
let authentication=require('../middleware/authentication')
let sharp=require('sharp')

let express=require('express')
//to load the file in which the mongoose modeles are required
let User=require('../models/user')
 let multer=require('multer') 
let router=new express.Router()

 //post request to add new task
  router.post("/user",async (req,res)=>{
    //here is to create new user 
     let user=new User(req.body)
    
     //here is the code to save the user using await function
     try{
         await user.save()

         //here is also the authentication token required
         let token=await user.getAuthToken()
        
         await user.userProfile().then((user)=>{
             res.send({
                 user:user,
                 token:token
             })
         })
     }catch(error){
         //to send the error 
         res.status(400).send(error)
     }
 
 })

//here is the new routers to check for login 
router.post('/user/login',async (req,res)=>{
    try{
         let user= await User.findByCredentials(req.body.email,req.body.password)
       
         //here is the method to get the authenticated token and the function we will write in user.js file
         let token=await user.getAuthToken()
        
         
        await user.userProfile().then((data)=>{
            res.send({
                user:data,
                token:token
            })
        })     
    }catch(e){
res.status(400).send()
    }

})


//here is the route for the logout of a particular user
router.post('/user/logout',authentication,async (req,res)=>{
    try{
 //here we will leave all the tokens in the token in user model expect the current one for the logout purpose
 req.user.tokens= req.user.tokens.filter((token)=>{
    return token.token!==req.token
})

//here we have to save our user with changes
await req.user.save()
res.status(200).send('you have been logged out successfully')
    }catch(e){
        res.status(500).send()
    }
   
})

//here is the route to log out from all the devices means we have to wipe out all the tokens
router.post('/user/logoutAll',authentication, async (req,res)=>{
    try{
//here we will pop all the elements of the token array as null
req.user.tokens=[]

//to save the userr
await req.user.save()

res.status(200).send('you have been logged out from all devices successfully')
    }catch(e){
        res.status(500).send()
    }
})

 
 //route handler for fetching multiple user
 //here is the code for read all the users and send them
 router.get("/user/me",authentication,async (req,res)=>{
  //turn of this function only comes when the user has been authenticated and we have to return that user stored in req.user
  let  user=req.user.userProfile()
  user.then((user)=>{
      res.send(user)
  }).catch((e)=>{
      res.status(400).send()
  })
 
 }) 
 /*
 we no longer need a user to be fetched by its id because we will get only one user which is us means which we have  log in 
 //to fetch an individual user by id
 router.get("/user/:id",async (req,res)=>{
     //req.params is used to give the value of the parameters
     //here is the code to get the id
     let _id=req.params.id 
 
     //to perform action by using await metho
    
     try{
         let data= await User.findById(_id)
         if(data){
            return  res.send(data)
         }
         res.status(404).send()
     }catch(e){
      
         res.status(500).send(e)
     }
 
 })*/
 
 //here is the code to update the existing user
 router.patch('/user/me',authentication,async (req,res)=>{
 
 //to check if the property entered is present in the user data or not
 
 //array of the keys of the array of the updates to be made
 let updates=Object.keys(req.body)
 
 //to put the things in an array which can be updated
 let isallowed=['name','age','email','password']
 
 //to check if all the keys of the updates object are present in is allowed array or not
 let isvalid=updates.every((ele)=>isallowed.includes(ele))
 
 if(!isvalid){
     return res.status(404).send({
         error:"Invalid update!"
     })
 }
 try{
 
 
//here is teh small modificationlet data=await  User.findById(_id)
updates.forEach((update)=>req.user[update]=req.body[update])

req.user.save()
 //let data=await User.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
  

 req.user.userProfile().then((user)=>{
     res.send({
         user:user,
     })
 })
 
 }catch(e){
 //the error present here will be the validation error
 res.status(404).send(e)
 }
 })
 

 //here is to delete a user which is being logged in 
 //here is the code to delete an user by giving its id
 router.delete('/user/me',authentication,async (req,res)=>{
     try{let user=await User.findByIdAndDelete(req.user._id)
            //here is to remove the data of the user find by using the id given by authentication function
            await req.user.remove()
             
             req.user.userProfile().then((user)=>{
                 res.send(user)
             })
     }catch(e){
         res.status(500).send()
 
     }
 })


  //here is the router for the upload of the profile picture
 let upload=multer({
     
     //to limit the size of the file uploaded by the user
     limits:{
         fileSize:1000000
     },
     //to limit type of file accpected
     fileFilter(req,file,cb){
        
         if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
           return cb(new Error('please upload an image') )
         }
         cb(undefined,true)
     }
 })
 router.post('/user/me/avatar',authentication,upload.single('avatar'),async (req,res)=>{
     //req.user.avatar=req.file.buffer
     
     //now we will resize and convert image into our requirement and then we will put that into the buffer variable using sharp pakage
     let buffer=await sharp(req.file.buffer).resize({height:250, width:250}).png().toBuffer()
     
     req.user.avatar=buffer
     await req.user.save()
     res.send()
 },(error,req,res,next)=>{
     //here this function is  for the handeling of error.message means it will provide the error as json format in place of the html page
     res.status(400).send({
         error:error.message
     }) 
 })
 

 //here is the router to delete the profile image provided by the user
 router.delete('/user/me/avatar',authentication,async(req,res)=>{
     //here is to grab the avatar field from the database and remove that field
     req.user.avatar=undefined
   await   req.user.save()
     res.status(200).send()
 })
 
//to send back the profile pic using id of a particular user
router.get('/user/:id/avatar',async(req,res)=>{

try{
//to check weather the user of given id is present
let user=await User.findById(req.params.id)

if(!user||!user.avatar){

    throw new Error()
}

//it the user is present and have a profile picture
res.set('Content-type','image/jpg')
res.send(user.avatar)


}catch(e){
    //when something went wrong
    res.status(400).send()
}

})


//to export the above router
module.exports=router