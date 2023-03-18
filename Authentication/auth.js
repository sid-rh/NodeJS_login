const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
dotenv.config();

const verifyToken=async(req,res,next)=>
{
    const token=req.body.token || req.query.token || req.headers["authorization"];
    if(!token)
    {
        res.status(200).send({msg:"No token"});
    }
    try {
        const decodeToken=jwt.verify(token,process.env.SECRET_KEY);
        req.user=decodeToken;
    } catch (error) {
        res.status(400).send("Invalid token");
        
    }
    return next();
}

module.exports=verifyToken;