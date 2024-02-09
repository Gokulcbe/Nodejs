const express = require('express');
const Model = require('../models/Model');
const Post = require('../models/Post');
const router = express.Router();

router.get('/get/test', async(req,res) => {
    res.send("Gokul works");
})

router.post('/addExpense', async(req,res) => {
    try{
        var expense = req.body;
        var group = await Model.Group.findOne({
            _id : expense.groupId
        })
        if(!group){
            var err = new Error("Invalid Group Id")
            err.status = 400
            throw err
        }

    } catch(error){

    }
})

// router.post('/post/test', async(req,res) => {
//     const data = new Model({
//         name : req.body.name,
//         age : req.body.age
//     })
//     try{
//         const dataToSave = await data.save();
//         res.status(200).json(dataToSave)
//     } catch(error){
//         res.status(400).json({message: error.message})
//     }
// })

// router.post('/posting', async(req,res) => {
//     const pdata = new Post({
//         postId : req.body.postId,
//         content : req.body.content,
//         location : req.body.location,
//         author : req.body.author
//     })
//     try{
//         const dataToSave = await pdata.save();
//         res.status(200).json(dataToSave)
//     } catch(error){
//         res.status(400).json({message: error.message})
//     }
// })

// router.get('/post/get', async(req,res) => {
//     try{
//         const data = await Model.find();
//         res.json(data)
//     } catch(error){
//         res.status(500).json({message: error.message})
//     }
// })

// router.get('/postdata/get', async(req, res) => {
//     try{
//         const data = await Post.find();
//         res.json(data);
//     } catch(error){
//         res.status(500).json({message: error.message})
//     }
// })

// router.get('/post/get/:id', async(req,res) => {
//     try{
//         const data = await Model.findById(req.params.id);
//         res.json(data);
//     } catch(error){
//         res.status(500).json({message: error.message})
//     }
// })

// router.get('/postdata/get/:id', async(req, res) => {
//     try{
//         const data = await Post.findById(req.params.id);
//         res.json(data);
//     } catch(error){
//         res.status(500).json({message: error.message})
//     }
// })

module.exports = router;
