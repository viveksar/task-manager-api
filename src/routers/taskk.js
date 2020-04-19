//to require the task model in here
let Task =require('../models/tasks')

let express=require('express')

let router=new express.Router()

let authentication=require('../middleware/authentication')


//this router here is responsible for the creation of new task so we have to add owner property in here
router.post('/task',authentication,async (req,res)=>{
    //to create the new task 
   // let task=new Task(req.body)
   let task=new Task({
       //this is the spread operator and it will get all the things from the req.body and we can add more information to this also
      ...req.body,
       owner:req.user._id
   })

    await task.save()
    try{
        console.log(task.owner)
        res.status(200).send(task)
    }catch(e){
        res.status(400).send(e)
    }


})

//here is the code to read all the tasks present in the database
//we have to get the tasks which are created by the user which is login
router.get("/task",authentication,async (req,res)=>{
    //to select all the tasks present 

        //let data=await Task.find({owner:req.user._id})
try{
    //here we will describe our match object by which we can manipulate the filtering term
    let match={}
    if(req.query.status){
        if(req.query.status==='true'){
            match.status='true'
        }else if(req.query.status==='false'){
            match.status='false'
        }
    }
//here is the object for the sort 
let sort={}
if(req.query.sortBy){
    let data=req.query.sortBy.split(':')
    //here is to set the value of sortBy property according to ascending and descending value
sort[data[0]]= data[1]==='desc'?-1:1   
}

    await req.user.populate({
        path:'task',
        match:match,
        options:{
            //here is the limit instance which will set the number of tasks on one page
            limit:parseInt(req.query.limit),
            //skip is for the skip of the tasks when it is called
            skip:parseInt(req.query.skip),
            //to sort the tasks according to createdAt,status, and their ascending and descending order
            sort:sort
        }
    }).execPopulate()
       
    //to send the tasks back 
    res.send(req.user.task)
}catch(e){
    res.status(500).send()
}

    
  
})

//here is the code to get the particular task by id
//we have to get the task only if the user is authenticated and it is created by the same user
router.get("/task/:id",authentication,async (req,res)=>{
    let _id=req.params.id

try{
   let data=await Task.findOne({
       _id:_id,
      owner:req.user._id
   })
   
  if(data){
      return res.status(201).send(data)
  }
    res.status(404).send('The task of this id is not present')
}catch(e){
    res.status(500).send(e)
}
})

//here is the code to updte a task by giving its id
//we can update the task only if the user is authenticated

router.patch('/task/:id',authentication,async (req,res)=>{
    
    try{
    //to check if the property entered is present in the user data or not
    
    //array of the keys of the array of the updates to be made
    let updates=Object.keys(req.body)
    
    //to put the things in an array which can be updated
    let isallowed=['description','status']
    
    //to check if all the keys of the updates object are present in is allowed array or not
    let isvalid=updates.every((ele)=>isallowed.includes(ele))
    
    if(!isvalid){
        return res.status(404).send({
            error:"Invalid update!"
        })
    }
  
    
    let _id=req.params.id
let data=await Task.findOne({
    _id:_id,
    owner:req.user._id
})

if(!data){
    return res.status(404).send()
}
//to change the updated keys of data into updated once
updates.forEach((update)=>data[update]=req.body[update])
//to save the updated data
data.save()
   
     
  
    res.send(data)
    
    }catch(e){
    //the error present here will be the validation error
    res.status(404).send(e)
    }
    })

//to delte a given task by giving its id
//we can delete task only if we have created that task
router.delete('/task/:id',authentication,async (req,res)=>{
    try{
        let data=await Task.findOneAndDelete({
            _id:req.params.id,
            owner:req.user._id
        })
        if(!data){
           return res.status(404).send('You do not have any task of this id')
        }
        res.send(data)
    }catch(e){
 
        res.status(500).send(e)
    }
})


//to export our data for the use of others files
module.exports=router