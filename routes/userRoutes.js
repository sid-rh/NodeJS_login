const express=require('express');
const { loginUser, regsiterUser, updatePassword, forgotPassword, resetPassword } = require('../controllers/userController');

const router=express.Router();
const auth=require('../Authentication/auth');

router.get('/login',(req,res)=>
{
    res.render('login');
})

router.get('/register',(req,res)=>
{
    res.render('register');
})

router.get('/',(req,res)=>
{
    res.render('Home',{isLoggedIn:false});
})

router.post('/login',loginUser);

router.post('/register',regsiterUser);

router.post('/forgot-password',);

router.get('/test',auth,(req,res)=>{
    res.status(200).send({success:true,msg:"Authenticated"});
});

router.post('/update-password',auth,updatePassword);

router.post('/forgot-password',forgotPassword);

router.get('/reset-password',resetPassword);

module.exports=router;
