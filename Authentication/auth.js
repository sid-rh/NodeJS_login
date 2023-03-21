const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
const User=require('../models/userModel');
dotenv.config();

const verifyToken=async(req,res,next)=>
{
    const token=req.body.token || req.query.token || req.headers["authorization"];
    if(!token)
    {
       return res.status(401).send({error:"You must be logged in"});
    }
    try {
        const decodeToken=jwt.verify(token,process.env.SECRET_KEY);
        const {_id}=decodeToken;
        User.findById(_id).then(data=>
            {
                req.user=data;
                return next();
            })
    } catch (error) {
        return res.status(400).send("Invalid token");
        
    }
    
}

module.exports=verifyToken;