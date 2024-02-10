const express = require('express')
const router = express.Router();
// const Model = require('../models/Model');
const User = require('../models/Users')
const Group = require('../models/Groups');
const validator = require('../helper/validation');
const Groups = require('../models/Groups');

router.post('/creategroup', async(req,res) => {
    try{
        var newGroup = new Group(req.body)
        if(validator.notNull(newGroup.groupName) &&
            validator.currencyValidation(newGroup.groupCurrency)) {
                var splitJson = {}

                for(var user of newGroup.groupMembers){
                    var memberCheck = await validator.userValidation(user)
                    if(!memberCheck){
                        var err = new Error("Invalid member ID");
                        err.status = 400
                        throw err
                    }
                    splitJson[user] = 0
                }
                newGroup.split = splitJson
                var ownerCheck = await validator.userValidation(newGroup.groupOwner)
                if(!ownerCheck){
                    var err = new Error("Invalid Owner ID");
                    err.status = 400
                    throw err
                }
                const createdUser = await newGroup.save();
                res.status(200).json({
                    status : "Success",
                    message: "Group Creation Success",
                    Id : createdUser._id
                })
            }
    } catch(error){
        res.status(error.status || 500).json({
            message: error.message
        })
    }
})

router.get('/viewGroup', async(req,res) => {
    try{
        const group = await Groups.findOne({
            _id : req.body.id
        })
        if(!group || req.body.id==null){
            var err = new Error("Invalid group Id")
            err.status = 400
            throw err
        }
        else{
            res.status(200).json({
                status: "Success",
                group : group
            })
        }
    } catch(error){
        res.status(500).json({
            message: error.message
        })
    }
})

router.get('/findUserGroup', async(req,res) => {
    try{
        const user = await User.findOne({
            emailId : req.body.emailId
        })
        if(!user){
            var err = new Error("User Not found")
            err.status = 400
            throw err
        } else {
            const groups = await Groups.findOne({
                groupMembers : req.body.emailId
            }).sort({
                $natural: -1
            })
            res.status(200).json({
                status: "Success",
                groups: groups
            })
        }
    } catch(error){
        res.status(500).json({
            message : error.message
        })
    }
})

router.delete('/deleteGroup', async(req,res) => {
    try{
        const group = await Group.findOne({
            _id : req.body.id
        })
        if(!group){
            var err = new Error("Group Not found")
            err.status = 400
            throw err
        } else {
            var deleteGroup = await Group.deleteOne({
                _id : req.body.id
            })
            res.status(200).json({
                status : "Success",
                message : "Group Deleted Successfully!!!",
                group: deleteGroup
            })
        }
    } catch (error){
        res.status(500).json({
            message: error.message
        })
    }
})


module.exports = router;