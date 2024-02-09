var jwt = require('jsonwebtoken')


exports.generateAccessToken = (user) => {
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET)
}

exports.validateUser = (user, emailId) => {
    if(user!=emailId){
        const err = new Error(emailId)
        err.status = 403
        throw err
    }
    else{
        return true
    }
}

exports.validateToken = (req,res,next) => {
    if (req.headers["authorization"] == null) {
        res.status(403).json({
            message: "Token not present",
            token : req.headers
        })
    } else{
        const authHeader = req.headers["authorization"]
            //the request header contains the token "Bearer <token>", split the string and use the second value in the split array.
            const token = authHeader.split(" ")[1]

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) => {
                if(err){
                    res.status(403).json({
                        message: "Invalid Token"
                    })
                    res.end();
                } else {
                    req.user = user
                    next()
                }
            })
    }
}