//this file is for the task model
let mongoose=require('mongoose')
let validator=require('validator')

//here we will create a schema for the task and at last we will use that to create out Task model
let taskschema=new mongoose.Schema({
    description:{
        required:true,
        type:String,
        trim:true
    },
    status:{
        type:Boolean,
        default:false,
      
    },
    //here we will describe another property which is for the owner of this task and it will contain the id of the user
    owner:{
        required:true,
        type:mongoose.Schema.Types.ObjectId,
        //this is to set connection between two different models
        ref:'User'
    }


},//here is another input to enable our time stamp
{
    timestamps:true
})

//to create the task manager model
let Task= mongoose.model("task",taskschema)

//to export task to other file which require this
module.exports=Task