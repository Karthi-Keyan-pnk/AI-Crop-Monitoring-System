const userService = require('../Service/userService');

exports.login = async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({message:"please fill the details"});
    }
    try{
        const user = await userService.login(email,password);
        console.log("login sucessfully")
        return res.status(200).json({status:'ok',
            user,
            message:"login sucessfully"})
    } catch(err){
        console.log(err);
        res.status(500).json({message:"Internal server error"});
    }
};

exports.register = async (req,res)=>{
    const {username,email,phonenumber,password}=req.body;
    try{
        const userRegister = await userService.register(username,email,phonenumber,password);
        console.log("User registered sucessfully");
        return res.status(200).json({
            status:'ok',
            userRegister,
            message:'user registered sucessfully',
        });
    } catch(err){
        console.log(err);
        return res.status(500).json({
            status:'error',
            message:'Bad request',
        });
    }
};