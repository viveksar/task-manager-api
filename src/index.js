//it is the main express file of the task manager app
let express=require('express')
let app=express()

//to require dotenv in our file
require('dotenv').config({path:'./config/dev.env'})

//to load mongoose.js for the connection to the database server
require('./db/mongoose')

//here is the file which is exported from another routers
let UserRouter=require('./routers/userr')

//here is the Task router from taskk.js
let TaskRouter=require('./routers/taskk')

//to require user.js file to get the data for the user model
let User=require('./models/user')
//to require tasks .js file to get the task model
let Task=require('./models/tasks')
let port=process.env.PORT

/*
//here is the code for the multer and uploading files
let multer=require('multer')

let upload=multer({
    dest:'images',
    //to check the format of file
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){
           return cb( new Error("file provided must be pdf"))
        }
//if the file is pdf
cb(undefined,true)

    }
})
//to calll the multer
app.post('/upload',upload.single('upload'),(req,res)=>{
res.send()
})*/


//to parse the incomming json automatically
app.use(express.json())

//to load the tasks done by the user in here from userr file
app.use(UserRouter)


//to load the task done by the task model and its routers from taskk file
app.use(TaskRouter)

//to require the jsonwebtoken pakage
let jwt=require('jsonwebtoken')
let myfunction=async ()=>{
let token=jwt.sign({_id:'hello1234'},'thisissecretkey')
console.log(token)
}
myfunction()

//to start up the server
app.listen(port,()=>{
    console.log("The server has been started on port "+port)
})

