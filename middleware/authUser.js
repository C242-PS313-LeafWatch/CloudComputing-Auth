import jwt from 'jsonwebtoken';  

export const authUser = (req, res, next) => {
    const authHeader = req.headers.authorization; 
    const token = authHeader?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ msg: "Token tidak ditemukan, akses ditolak" }); 
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {  // Verifikasi token
        if (err) {
            console.error("Error verifikasi token:", err.message); 
            return res.status(403).json({ msg: "Token tidak valid atau kedaluwarsa" });
        }

        console.log("Decoded Token:", decoded);  
        if (!decoded.userid) {
            return res.status(400).json({ msg: "Token tidak mengandung userid yang valid" });  // Token tidak mengandung userId
        }

        req.userId = decoded.userid;  
        next();  
    });
};
