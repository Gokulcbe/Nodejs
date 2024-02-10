const express = require('express')
const Group = require('../models/Groups')

exports.addSplit = async(groupId, expenseAmount, expenseOwner, expenseMembers) => {
    var group = await Group.findOne({
        _id: groupId
    })
    group.groupTotal += expenseAmount
    group.split[0][expenseOwner] += expenseAmount
    expensePerPerson = expenseAmount / expenseMembers.length
    expensePerPerson = Math.round((expensePerPerson  + Number.EPSILON) * 100) / 100;
    //Updating the split values per user 
    for (var user of expenseMembers) {
        group.split[0][user] -= expensePerPerson
    }
    
    //Nullifying split - check if the group balance is zero else added the diff to owner 
    let bal=0
    for(val of Object.entries(group.split[0]))
    {
        bal += val[1]
    }
    group.split[0][expenseOwner] -= bal
    group.split[0][expenseOwner] = Math.round((group.split[0][expenseOwner]  + Number.EPSILON) * 100) / 100;
    //Updating back the split values to the gorup 
    return await Group.updateOne({
        _id: groupId
    }, group)
}

exports.clearSplit = async(groupId, expenseAmount, expenseOwner, expenseMembers) => {
    var group = await Group.findOne({
        _id: groupId
    })
    group.groupTotal -= expenseAmount
    group.split[0][expenseOwner] -= expenseAmount
    expensePerPerson = expenseAmount / expenseMembers.length
    expensePerPerson = Math.round((expensePerPerson  + Number.EPSILON) * 100) / 100;
    //Updating the split values per user 
    for (var user of expenseMembers) {
        group.split[0][user] += expensePerPerson
    }

    //Nullifying split - check if the group balance is zero else added the diff to owner 
    let bal=0
    for(val of Object.entries(group.split[0]))
    {
        bal += val[1]
    }
    group.split[0][expenseOwner] -= bal
    group.split[0][expenseOwner] = Math.round((group.split[0][expenseOwner]  + Number.EPSILON) * 100) / 100;
    //Updating back the split values to the gorup 
    return await Group.updateOne({
        _id: groupId
    }, group)
}