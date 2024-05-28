const path=require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const mongoose=require('mongoose');
const Blog=require('./models/blog')
const { checkForAuthenticationCookie } = require('./middleware/authentication');

const app = express();
const port=4000;

app.set('view engine',"ejs");
app.set("views",path.resolve("./views"))

const userRoute=require('./Routes/user');
const blogRoute=require('./Routes/blog')

mongoose.connect('mongodb://localhost:27017/blogAppData', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(error => console.error("MongoDB connection error:", error.message)); 


app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(checkForAuthenticationCookie('token'))
app.use(express.static(path.resolve('./public')))




app.get('/',async (req,res)=>{
    const allblogs=await Blog.find({});
    res.render("home",{
        user:req.user,
        blogs:allblogs,
       
    });
})

app.use("/user",userRoute)
app.use("/blog",blogRoute)

app.listen(port,()=>{
    console.log("listening on port =>",port)
})