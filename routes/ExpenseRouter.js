const express = require('express')
const router = express.Router()
const validator = require('../helper/ApiAuthentication')
const Expense = require('../models/Expense')
const Group = require('../models/Groups')

router.post('/addExpense', async(req, res) => {
    try{
        const expense = req.body
        const group = await Group.findOne({
            _id : expense.groupId
        })
        if(!group){
            var err = new Error("Group not found")
            err.status = 400
            throw err
        } else {
            if(validator.notNull(expense.expenseName) && validator.notNull(expense.expenseAmount) &&
                validator.notNull(expense.ExpenseOwner) && validator.notNull(expense.expenseMembers) && validator.notNull(expense.expenseDate)) {
                    const ownervalidation = await validator.groupUserValidation(expense.expenseOwner, expense.groupId);
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
                        const newExpense = new Expense(expense)
                        const createdExp = await newExpense.save()

                        const update_response = await Group.addSplit(expense.groupId, expense.expenseAmount, expense.ExpenseOwner, expense.expenseMembers);
                        
                    }
                }
        }
    }
})