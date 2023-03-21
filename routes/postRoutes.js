const express=require('express');
const router=express.Router()
const mongoose=require('mongoose');
const Post=require('../models/postModel');
const auth=require('../Authentication/auth')


router.post('/createPost',auth,(req,res)=>
{
    const {title,body}=req.body;
    if(!title||!body)
    {
        return res.status(400).json({err:"Please fill all the fields"});
    }

    const post=new Post({
        title:title,
        body:body,
        postedBy:req.user,
    });
    post.save().then((data)=>
    {
        res.json({post:data});
    })
    .catch(err=>
        {
            console.log(err);
        })
    
    
});

router.get('/allPosts',(req,res)=>{
    Post.find()
        .populate("postedBy","_id email")
        .then(posts=>
            {
                res.json(posts);
            })
        .catch(err=>
            {
                console.log(err);
            })
});

router.get('/myPosts',auth,(req,res)=>
{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id email")
    .then(posts=>
        {
            res.json(posts);
        })
        .catch(err=>{
            console.log(err);
        })
})

router.get('/getPost/:id',(req,res)=>
{
    const id=req.params.id;
    
    Post.findById(id)
        .then(post=>
            {
                console.log(post.likes)
                res.json(post);
            })
        .catch(err=>
            {
                console.log(err);
            })
});

router.patch('/updatePost/:id',auth,(req,res)=>
{
    const id=req.params.id;
    const {title,body}=req.body;

    Post.findById(id)
        .then(post=>
            {
                if(JSON.stringify(post.postedBy)===JSON.stringify(req.user._id))
                {
                    console.log(title);
                    console.log(body);
                    
                    post.updateOne({
                        title:title,
                        body:body
                    },{new:true})
                    .then(()=>
                    {
                        res.json({message:"Updated"})
                    })
                }
                else
                {
                    res.json({error:"Unauthorized"});
                }
            })
            .catch(err=>
                {
                    res.json(err);
                })
})

router.delete('/deletePost/:id',auth,(req,res)=>
{
    const id=req.params.id;

    Post.findById(id)
        .then(post=>
            {

                if(JSON.stringify(post.postedBy)===JSON.stringify(req.user._id))
                {
                    Post.findByIdAndDelete(id)
                        .then(post=>
                            {
                                res.json({message:"Post deleted"});
                            })
                        .catch(err=>
                            {
                                res.json({error:err});
                            })

                }
                else
                {
                    return res.json({error:"Unauthorized"})
                }
            })
})

router.put('/like/:id',auth,async(req,res)=>
{
    const postId=req.params.id;
    const post=await Post.findById(postId);
    var found=false;
    post.likes.map(like=>
        {
            if(JSON.stringify(like._id)===JSON.stringify(req.user._id));
            {
                found=true;
                return;
                // return res.status(400).json({message:"You already liked"});
            }
        }
    )
    if(found)
    {
        return res.status(400).json({message:"You already liked"});
    }
    else
    {
        Post.findByIdAndUpdate(postId,{
            $push:{likes:req.user._id}
        },{
            new: true
        }).then((result,err)=>
        {
            if(err)
            {
                return res.status(400).json({error:err});
            }
            else
            {
                res.json(result);
            }
        })

    }
})

router.put('/unlike/:id',auth,(req,res)=>
{
    const postId=req.params.id;
    Post.findByIdAndUpdate(postId,{
        $pull:{likes:req.user._id}
    },{
        new: true
    }).then((result,err)=>
    {
        if(err)
        {
            return res.status(400).json({error:err});
        }
        else
        {
            res.json(result);
        }
    })
})

router.put('/comment/:id',auth,(req,res)=>
{
    const postId=req.params.id;
    const comment={
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate("comments.postedBy","_id email")
    .then((result,err)=>
    {
        if(err)
        {
            return res.status(400).json({error:err});
        }
        else
        {
            res.json(result);
        }
    })
});

router.delete('/deleteComment/:id/:comment_id',auth,(req,res)=>
{
    const commentId=req.params.comment_id;
    const postId=req.params.id;
    Post.findById(postId)
        .then(post=>
            {
                const comment=post.comments.find(comment=>JSON.stringify(comment._id)===JSON.stringify(commentId));
                // console.log(comment);
                if(!comment)
                {
                    return res.status(400).json({message:"Comment not found"})
                }
                else
                {
                   if(JSON.stringify(comment.postedBy)===JSON.stringify(req.user._id))
                   {
                       post.comments=post.comments.filter(({_id})=>
                        {
                            return JSON.stringify(_id)!==JSON.stringify(commentId)
                        })
                        post.save()
                            .then(()=>
                            {
                                return res.status(200).json({"msg":"Successfully deleted",post:post});
                            })

                   }
                   else
                   {
                     return res.status(400).json({message:"Unauthorized"});
                   }
                }
            })
})

module.exports=router;