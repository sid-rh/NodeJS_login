const User=require('../models/userModel');
const bcrypt=require('bcrypt');
const validator=require('validator');
const jwt=require('jsonwebtoken');
const nodemailer=require('nodemailer');
const randomstring=require('randomstring');
const dotenv=require('dotenv')
dotenv.config();

const sendResetMail=async(email,token)=>{
    try {
        const mailer=nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.EMAIL,
                pass:process.env.EMAIL_PWORD,
            }

        });
        const port=process.env.PORT||9000;

        const mailOptions={
            from: process.env.EMAIL,
            to:email,
            subject:'Reset Password',
            html:'<p>Hello '+email+', <a href="http://localhost:'+port+'/reset-password?token='+token+'">Reset your password</a></p>'
        }
        mailer.sendMail(mailOptions,function(err,info)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log("Mail has been sent to"+mailOptions.to+": ",info.response);
            }
        })
        
    } catch (error) {
        res.status(400).send({msg: error.message});
        
    }
}

const createToken=async(id)=>
{
    try {
        const token=await jwt.sign({_id:id},process.env.SECRET_KEY);
        return token
    } catch (error) {
        res.status(400).send(error.message);
    }
}


const hashedPassword=async(password)=>
{
    try {
        const salt=await bcrypt.genSalt(10);
        const hash=await bcrypt.hash(password,salt);
        return hash;
    } catch (error) {
        res.status(400).send(error.message);
        
    }
}

const signUp=async function(email,password)
{
    if(!email||!password)
    {
        throw Error('All fields must be filled');
    }
    if(!validator.isEmail(email))
    {
        throw Error('Email is not valid');
    }
    if(!validator.isStrongPassword(password))
    {
        throw Error('Password is not strong enough');
    }

    const exists=await User.findOne({ email });

    if(exists) throw Error("Email is already used");

    const passwordHashed=await hashedPassword(password);

    // const salt=await bcrypt.genSalt(10);
    // const hash=await bcrypt.hash(password,salt);

    const user=await User.create({email,password:passwordHashed});

    return user;
}



const loginUser=async(req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;

        const user= await User.findOne({email:email});
        if(user)
        {
            const passwordMatch=await bcrypt.compare(password,user.password);
            if(passwordMatch)
            {
                const token=await createToken(user._id);
                const userData={
                    _id:user.id,
                    email:user.email,
                    password:user.password,
                    token:token,
                }
                // const token=jwt.sign({email: user.email,id:user._id},'secret_key');

                // res.cookie('token',token).redirect('/');
                res.status(200).send({message:"User logged in",user:userData,token:token});
            }
            else
            {
                res.status(200).send({msg:"Incorrect login details"});
            }
        }
        else
        {
            res.status(200).send({msg:"Incorrect login details"});
            
        }
    } catch (error) {
        res.json(error);
    }
    
}

const regsiterUser=async(req,res)=>
{
    console.log('register');
    console.log(req.body.email);
    const{ email, password }=req.body;

    try {

        const user =await signUp(email,password);

        // res.render('login');

        res.status(200).send({message: "User successfully registered",user: user});
    
        
    } catch (err) {

        res.status(400).json({error: err.message});
        
    }
}


const updatePassword=async(req,res)=>
{
    try {
        const user_id=req.body.user_id;
        const password=req.body.password;
        
        const data=await User.findOne( {_id:user_id});
        
        if(data)
        {
            const newPassword=await hashedPassword(password);
            
            const user= await User.findByIdAndUpdate({_id:user_id},{ $set: {
                password:newPassword
            }});
            
            res.status(200).send({msg:"Password has been updated"});
        }
        else
        {
            res.status(200).send({ success:false, msg:"User id not found" });
        }
        
        
        
    } catch (error) {
        res.status(400).send(error.message);
        
    }
}

const forgotPassword=async(req,res)=>
{
    try {
        const email=req.body.email;
       const userData= await User.findOne({email:email});

       if(userData)
       {    
            const randomString=randomstring.generate();

            const data=await User.updateOne({email:email},{$set:{token:randomString}});

            sendResetMail(userData.email,randomString);


            res.status(200).send({msg:'Check your email inbox'});
        

       }
       else
       {
            res.status(400).send({msg: "Email does not exist"});
       }

    } catch (error) {
        res.status(400).send({msg: error.message});
        
    }
}

const resetPassword=async(req,res)=>{
    try {
        const token=req.query.token;
        const tokenData=await User.findOne({ token: token });
        if(tokenData)
        {
            const password=req.body.password;
            const hashPassword=await hashedPassword(password);
            const userData=await User.findByIdAndUpdate({_id:tokenData._id},{$set:{password:hashPassword,token:''}},{new:true});

            res.status(200).send({msg:"Password successfully reset",data: userData});
        }
        else
        {
            res.status(200).send({msg:"The link is expired"})
        }
        
    } catch (error) {
        res.status(400).send({msg:error.message});
        
    }
}



module.exports={ loginUser, regsiterUser, forgotPassword,updatePassword, resetPassword }