const express = require('express')
const router = express.Router()
const validator = require('../helper/validation')
const Expense = require('../models/Expense')
const Group = require('../models/Groups')
const GroupExports = require('./GroupExports')

router.post('/addExpense', async(req, res) => {
    try{
        var expense = req.body
        const group = await Group.findOne({
            _id : expense.groupId
        })
        if(!group){
            var err = new Error("Group not found")
            err.status = 400
            throw err
        } else {
            if(validator.notNull(expense.expenseName) && validator.notNull(expense.expenseAmount) &&
                validator.notNull(expense.expenseOwner) && validator.notNull(expense.expenseMembers) && validator.notNull(expense.expenseDate)) {
                    var ownervalidation = await validator.groupUserValidation(expense.expenseOwner, expense.groupId);
                    if(!ownervalidation){
                        var err = new Error("Provide a valid group Owner")
                        err.status = 400
                        throw err
                    } else {
                        for(var user of expense.expenseMembers) {
                            var memberValidation = await validator.groupUserValidation(user, expense.groupId);
                            if(!memberValidation){
                                var err = new Error("Provide a valid group member")
                                err.status = 400
                                throw err
                            }
                        }
                        expense.expensePerMember = expense.expenseAmount / expense.expenseMembers.length
                        expense.currency = group.currency
                        var newExpense = new Expense(expense)
                        var createdExp = await newExpense.save()

                        var update_response = await GroupExports.addSplit(expense.groupId, expense.expenseAmount, expense.expenseOwner, expense.expenseMembers);
                        res.status(200).json({
                            status : "Success",
                            message: "New Expense Added",
                            Id : newExpense._id,
                            splitUpdateResponse : update_response
                        })
                    }
                }
        }
    } catch (error){
        res.status(500).json({
            message : error.message
        })
    }
})

router.get('/viewExpense', async(req,res) => {
    try{
        const expense = await Expense.findOne({
            _id : req.body.id
        })
        if(!expense){
            var err = new Error("No expense found")
            err.status = 400
            throw err
        } else {
            res.status(200).json({
                status : "Success",
                expense : expense
            })
        }
    } catch(error){
        res.status(500).json({
            message : error.message
        })
    }
})

router.post('/editExpense', async(req,res)=> {
    try{
        var expense = req.body
        var oldExpense = await Expense.findOne({
            _id : expense.id
        })
        if(!oldExpense || expense.groupId==null || oldExpense.groupId!=expense.groupId){
            var err = new Error("Invalid Expense")
            err.status = 400
            throw err
        } else {
            if(validator.notNull(expense.expenseName) && validator.notNull(expense.expenseAmount) && validator.notNull(expense.expenseDate)
            && validator.notNull(expense.expenseOwner) && validator.notNull(expense.expenseMembers)){
                var ownervalidation = await validator.groupUserValidation(expense.expenseOwner, expense.groupId);
                if(!ownervalidation){
                    var err = new Error("Provide Valid Owner")
                    err.status = 400
                    throw err
                } else{
                    for(var user of expense.expenseMembers){
                        var memberValidation = await validator.groupUserValidation(user, expense.groupId);
                        if(!memberValidation){
                            var err = new Error("Provide Valid Members");
                            err.status = 400
                            throw err
                        } 
                    } 
                            const updatedExpense = await Expense.updateOne({
                                _id : expense.id
                            }, {
                                $set : {
                                    groupId : expense.groupId,
                                    expenseName : expense.expenseName,
                                    expenseDescription : expense.expenseDescription,
                                    expenseAmount : expense.expenseAmount,
                                    expenseCategory : expense.expenseCategory,
                                    expenseCurrency : expense.expenseCurrency,
                                    expenseDate : expense.expenseDate,
                                    expenseOwner : expense.expenseOwner,
                                    expenseMembers : expense.expenseMembers,
                                    expensePerMember : expense.expenseAmount / expense.expenseMembers.length,
                                    expenseType : expense.expenseType
                                }
                            })
                            await GroupExports.clearSplit(oldExpense.groupId, oldExpense.expenseAmount, oldExpense.expenseOwner, oldExpense.expenseMembers);
                            await GroupExports.addSplit(expense.groupId, expense.expenseAmount, expense.expenseOwner, expense.expenseMembers);
                            res.status(200).json({
                                status : "Success",
                                updated : updatedExpense
                            })
                }
            }
        }
    } catch(error) {
        res.status(500).json({
            message: error.message
        })
    }
})

router.delete('/deleteExpense', async(req, res) => {
    try{
        var expense = await Expense.findOne({
            _id : req.body.id
        })
        if(!expense){
            var err = new Error("Invaid Expense ID")
            err.status = 400
            throw err
        } else {
            var deletedExp = await Expense.deleteOne({
                _id : req.body.id
            })
            await GroupExports.clearSplit(expense.groupId, expense.expenseAmount, expense.expenseOwner, expense.expenseMembers);
            res.status(200).json({
                status : "Success",
                deletedExpense : deletedExp
            })
        }
    } catch(error){
        res.status(500).json({
            message : error.message
        })
    }
})

router.get('/viewGroupExpense', async(req, res) => {
    try{
        const groupExpense = await Expense.find({
            groupId : req.body.id
        }).sort({
            expenseDate : -1
        })
        if(groupExpense.length==0){
            var err = new Error("No Expense found for this group")
            err.status = 400
            throw err
        } else {
            var totalAmount = 0;
            for(var amount of groupExpense){
                totalAmount = totalAmount + amount.expenseAmount;
            }
            res.status(200).json({
                status : "Success",
                totalAmount : totalAmount,
                groupExpense : groupExpense
            })
        }
    } catch(error) {
        res.status(500).json({
            message : error.message
        })
    }
})

router.get('/viewUserExpense', async(req,res) => {
    try{
        const userExpense = await Expense.find({
            expenseMembers : req.body.user
        }).sort({
            expenseDate : -1
        })

        if(userExpense.length==0){
            var err = new Error("No user Expense Found")
            err.status = 400
            throw err
        } else {
            var totalExpense = 0;
            for(var user of userExpense){
                totalExpense = totalExpense + user.expensePerMember;
            }
            res.status(200).json({
                status : "Success",
                expenses : totalExpense,
                user : userExpense
            })
        }
    } catch(error) {
        res.status(500).json({
            message: error.message
        })
    }
})

router.get('/recentUserExpense', async(req,res) => {
    try {
        const userExpense = await Expense.find({
            expenseMembers : req.body.user
        }).sort({
            $natural : -1
        }).limit(5);

        if(userExpense.length==0){
            var err = new Error("No user Expense Found")
            err.status = 400
            throw err
        } else {
            res.status(200).json({
                status : "Success",
                expense : userExpense
            })
        }
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
})

router.get('/groupCategegoryExpense', async(req,res)=> {
    try{
        const group = await Expense.aggregate([{
            $match : {
                groupId : req.body.id
            }
        }, {
            $group : {
                _id : "$expenseCategory",
                amount : {
                    $sum : "$expenseAmount"
                }
            }
        }, {
            $sort : {
                "_id" : 1
            }
        }])

        res.status(200).json({
            status : "Success",
            expenseCatagory : group
        })
    } catch(error){
        res.status(500).json({
            message: error.message
        })
    }
})

router.get('/groupMonthlyExpense', async(req,res)=>{
    try{
        const group = await Expense.aggregate([{
            $match : {
                groupId : req.body.id
            }
        }, {
            $group : {
                _id : {
                    month : {
                        $month : "$expenseDate"
                    }, 
                    year : {
                        $year : "$expenseDate"
                    }
                },
                amount : {
                    $sum : "$expenseAmount"
                }
            }
        } , {
            $sort : {
                "_id.month" : 1
            }
        }])
        res.status(200).json({
            status : "Success",
            monthlyExpense : group
        })
    } catch(error){
        res.status(500).json({
            message : error.message
        })
    }
})

router.get('/viewDailyExpense', async(req,res)=> {
    try{
        const group = await Expense.aggregate([{
            $match : {
                groupId : req.body.id
            }
        } , {
            $group : {
                _id : {
                    day : {
                        $dayOfMonth : "$expenseDate"
                    },
                    month : {
                        $month : "$expenseDate"
                    },
                    year : {
                        $year : "$expenseDate"
                    }
                },
                amount : {
                    $sum : "$expenseAmount"
                }
            }
        }, {
            $sort : {
                "_id.day" : 1,
                "_id.month" : 1
            }
        }])
        res.status(200).json({
            status : "Success",
            dailyExpense : group
        })
    } catch(error){
        res.status(500).json({
            message : error.message
        })
    }
})

router.get('/userCategoryExpense', async(req, res) => {
    try{
        const user = await Expense.aggregate([{
            $match : {
                expenseMembers : req.body.id
            }
        }, {
            $group : {
                _id : "$expenseCategory",
                amount : {
                    $sum : "$expensePerMember"
                },
            }
        }, {
            $sort : {
                "_id" : 1
            }
        }])
        res.status(200).json({
            status : "Success",
            categoryExpense : user
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

router.get('/userMonthlyExpense', async(req, res) => {
    try{
        const user = await Expense.aggregate([{
            $match : {
                expenseMembers : req.body.id
            }
        }, {
            $group : {
                _id : {
                    month : {
                        $month : "$expenseDate"
                    }
                }, 
                amount : {
                    $sum : "$expensePerMember"
                }
            }
        }, {
            $sort : {
                "_id.month" : 1
            }
        }])
        res.status(200).json({
            status : "Success",
            userMonthlyExpense : user
        })
    } catch(error) {
        res.status(500).json({
            message : error.message
        })
    }
})

router.get('/userDailyExpense', async(req,res) => {
    try{
        const user = await Expense.aggregate([{
            $match : {
                expenseMembers : req.body.id
            }
        }, {
            $group : {
                _id : {
                    day : {
                        $dayOfMonth : "$expenseDate"
                    },
                    month : {
                        $month : "$expenseDate"
                    }, 
                    year : {
                        $year : "$expenseDate"
                    }
                },
                amount : {
                    $sum : "$expensePerMember"
                }
            }
        }, {
            $sort : {
                "_id.day" : -1,
                "_id.month" : -1,
                "id.year" : -1
            }
        }])
        res.status(200).json({
            status : "success",
            userDailyExpense : user
        })
    } catch(error){
        res.status(500).json({
            message : error.message
        })
    }
})

module.exports = router;