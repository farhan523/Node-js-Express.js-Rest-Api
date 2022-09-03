const { validationResult } = require('express-validator')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let error = new Error("validation failed");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    bcrypt.hash(password, 12).then((pswrd) => {
        const newUser = new User({
            email: email,
            password: pswrd,
            name: name

        })

        return newUser.save()
    }).then((result) => {
        res.status(201).json({ message: "Successully signup", userId: result._id })
    }).catch((error) => {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error);
    })



}

exports.login = (req,res,next) =>{
    const email = req.body.email;
    const password = req.body.password;
    let   loadUser;
    User.findOne({email:email}).then((user)=>{
        if(!user){
            const error = new Error("No user exist with this email address");
            error.statusCode = 401;
            throw error;
        }
        loadUser = user
        return bcrypt.compare(password, user.password)
    }).then((isEqual)=>{
        if(!isEqual){
            const error = new Error("Wrong password");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({
            email:loadUser.email,
            userId:loadUser._id.toString(),
        },'secret',{expiresIn:'1h'})

        res.status(200).json({token:token,userId:loadUser._id.toString()})
    }).catch((err)=>{
        if(!err.statusCode){
            err.statusCode = 500;

        }
        next(err)
    })
}