const userModel = require('../model/userModels');
const bcrypt = require('bcrypt');

class UserService{
    async login(email,password){
        const user = await userModel.findOne({email:email});
        if(!user){
            throw new Error("user not found");
        }
        const matchPasssword = await bcrypt.compare(password,user.password);
        if(!matchPasssword){
            throw new Error("password not match");
        }
        return user;
    }

    async register(username,email,phonenumber,password){
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password,salt);
        const saveUser = await userModel({
            username,
            email,
            phonenumber,
            password:hashedpassword,
        });
        const userdetail = saveUser.save();
        return userdetail;
    }
}

module.exports = new UserService();