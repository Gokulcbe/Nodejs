const express = require('express');
const router = express.Router();
const Model = require('../models/Model');
const User = require('../models/Users');
const validator = require('../helper/validation')
const bcrypt = require('bcryptjs')
const apiAuth = require('../helper/ApiAuthentication');
const Groups = require('../models/Groups');
router.post('/userreg', async(req,res) => {
    try{
        const newUser = new User(req.body)
        const user = await User.findOne({
            emailId : req.body.emailId
        })
        if(user){
            const err = new Error("Email ID already present");
            err.status = 400
            throw err
        } else{
            if(validator.emailValidation(req.body.emailId) &&
                validator.passwordValidation(newUser.password) &&
                validator.notNull(newUser.firstName)) {
                    const salt = await bcrypt.genSalt(10);
                    newUser.password = await bcrypt.hash(newUser.password, salt)
                    const createdUser = await newUser.save();
                    res.status(200).json({
                        status: "Success",
                        message: "User Registration Success",
                        userId: createdUser.id
                    })
                }
        }
    } catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/userLogin', async(req, res) => {
    try{
            const user = await User.findOne({
                emailId : req.body.emailId
            })
        if(!user){
            const err = new Error("User not Found")
            err.status = 400
            throw err
        }
        else{
            const validcred = await bcrypt.compare(req.body.password, user.password);
            if(!validcred){
                const err = new Error("Pasword Mismatch")
                err.status = 400
                throw err
            }
            else{
                const accessToken = apiAuth.generateAccessToken(req.body.emailId)
                res.status(200).json({
                    staus : "Success",
                    message : "User Login Success",
                    userId : user.id,
                    emailId : user.emailId,
                    firstName : user.firstName,
                    lastName : user.lastName,
                    accessToken
                })
            }
    } 
}catch(error){
    res.status(500).json({
        message : error.message
    })
}
})

router.get('/viewUser',apiAuth.validateToken, async(req,res) => {
    try{
        // const validuser = apiAuth.validateToken(req.body.emailId, req.headers)
        apiAuth.validateUser(req.user, req.body.emailId)
        const user = await User.findOne({
            emailId : req.body.emailId
        } , {
            password : 0
        })
        if(!user){
            const err = new Error("User don't exist")
            err.status = 400
            throw err
        }
        else{
            res.status(200).json({
                message : "Success!!!",
                user: user
            })
        }
    } catch(error){
        res.status(500).json({
            message: error.message
        })
    }
})


module.exports = router;