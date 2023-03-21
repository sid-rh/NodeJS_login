const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types;


const postSchema=mongoose.Schema({
    title:
    {
        type:String,
        required:true,
    },
    body:
    {
        type:String,
        required:true,
    },
    photo:
    {
        type:String,
        default:"No Photo"
    },
    likes:[{type:ObjectId,ref:"User"}],
    comments:[{
        text:String,
        postedBy:{type:ObjectId,ref:"User"}
    }],
    postedBy:
    {
        type:ObjectId,
        ref:"User"
    }
});

module.exports=mongoose.model('Post',postSchema);