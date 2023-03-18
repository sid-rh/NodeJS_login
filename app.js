const express=require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const userRouter = require('./routes/userRoutes');
const bodyParser=require('body-parser');

const app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

dotenv.config();

const PORT=process.env.PORT||9000;
const mongoUrl=process.env.MONGO_URL;

app.set('view engine','ejs');

app.use('/',userRouter);


mongoose.connect(mongoUrl)
    .then(()=>{
        console.log("Connected to DB");
    });





app.listen(PORT,()=>
{
    console.log("Listening to port: ",PORT);
})