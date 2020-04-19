//here is the code for hte mongoose 
let mongoose=require('mongoose')


//connectionURL is to connect the mongodb server with our local host URL and we provide the database name in this URL
let connectionURL=process.env.MONGO_URL


//to connect the mongoose to the database and url
mongoose.connect(connectionURL,{useNewUrlParser:true,
useCreateIndex:true//it is used to access our data easily and fastly
})

