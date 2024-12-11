import express from "express";
import { allUsers, Register, Login, Logout, Profile } from "../controllers/Users.js"; 
import { authUser } from "../middleware/authUser.js";
import { refreshToken } from "../controllers/Token.js";

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome to the Auth API!');
});

router.get('/users', authUser, allUsers); 
router.post('/users', Register); 
router.post('/login', Login); 
router.get('/token', refreshToken); 
router.delete('/logout', Logout); 
router.get('/profile', authUser, Profile); 

export default router;
