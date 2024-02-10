const Model = require('../models/Model');
const User = require('../models/Users');
const Group = require('../models/Groups')

exports.notNull = (value) => {
    if(value){
        return true;
    }
    else{
        var err = new Error("Please input the required Field")
        err.status = 400
        throw err
    }
}

exports.emailValidation = (email) => {
    if(email && email.includes("@") && email.includes(".com"))
        return true
    else{
        var err = new Error("Email Validation failed!!", email)
        err.status = 400
        throw err
    }
}

exports.passwordValidation = (pass) => {
    if(pass && pass.length >= 8){
        return true
    }
    else{
        var err = new Error("Password Validation Failed!!")
        err.status = 400
        throw err
    }
}

exports.currencyValidation = (currency) => {
    if (currency &&
        currency == "INR" ||
        currency == "USD" ||
        currency == "EUR") {
        return true
    } else {
        var err = new Error("Currency validation fail!!")
        err.status = 400
        throw err

    }
}

exports.userValidation = async (email) => {
    var user = await User.findOne({
        emailId: email
    })
    if (!user)
        return false
    else
        return true
}

exports.groupUserValidation = async(email,groupId) => {
    var groupMembers = await Group.findOne({
        _id : groupId
    }, {
        groupMembers : 1,
        _id: 0
    })
    groupMembers = groupMembers['groupMembers']
    if(groupMembers.includes(email)){
        return true
    } else {
        return false;
    }
}