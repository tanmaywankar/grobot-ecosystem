import jwt  from "jsonwebtoken";

export function authGuard(req, res, next){
const authHeader = req.headers["authorization"];

if(!authHeader || !authHeader.startsWith("Bearer ")){
    return res.status(401).json({
        success: false,
        error: "Access denied, no token provided or invali format",
    });
}

const token = authHeader.split(" ")[1];

try{
   const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decode;

    next();
} 
catch (err){
    return res.status(401).json({
        success: false,
        error: "invalid or expired token",
    });
}

}