import Users from "../models/user_model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize"; // Untuk digunakan dalam validasi

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
};

const generateToken = (payload, secret, expiresIn) => {
    return jwt.sign(payload, secret, { expiresIn });
};

const validatePasswordMatch = (password, confPassword) => password === confPassword;

const validateEmailUsage = async (email, excludeId = null) => {
    const condition = { email };
    if (excludeId) {
        condition.id = { [Op.ne]: excludeId };
    }
    return await Users.findOne({ where: condition });
};

export const allUsers = async (req, res) => {
    try {
        const data = await Users.findAll({
            attributes: ["id", "name", "email"],
        });
        res.json({
            status: "success",
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            msg: "Gagal mengambil pengguna"
        });
    }
};

export const Register = async (req, res) => {
    const { username, email, password, confPassword, gender, birthdate } = req.body;

    // cek apakah password cocok
    if (!validatePasswordMatch(password, confPassword)) {
        return res.status(400).json({
            status: "error",
            msg: "Password tidak cocok"
        });
    }

    try {
        // Cek apakah email sudah digunakan
        const existingUser = await validateEmailUsage(email);
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                msg: "Email sudah terdaftar"
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        await Users.create({
            name: username,
            email,
            password: hashedPassword,
            gender,
            birth_date: birthdate,
        });

        res.json({
            status: "success",
            msg: "Register berhasil"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            msg: "Terjadi kesalahan saat registrasi"
        });
    }
};

export const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                status: "error",
                msg: "Email tidak ditemukan"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: "error",
                msg: "Password salah"
            });
        }

        const { id, name, email: userEmail } = user;
        const accessToken = generateToken({ userid: id, name, email: userEmail }, process.env.ACCESS_TOKEN_SECRET, "20s");
        const refreshToken = generateToken({ userid: id, name, email: userEmail }, process.env.REFRESH_TOKEN_SECRET, "1d");

        await Users.update({ refresh_token: refreshToken }, { where: { id } });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.json({
            status: "success",
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            msg: "Terjadi kesalahan saat login"
        });
    }
};

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.sendStatus(204);

    try {
        const user = await Users.findOne({ where: { refresh_token: refreshToken } });
        if (!user) return res.sendStatus(204);

        await Users.update({ refresh_token: null }, { where: { id: user.id } });

        res.clearCookie("refreshToken");
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            msg: "Terjadi kesalahan saat logout"
        });
    }
};

export const Profile = async (req, res) => {
    try {
        const user = await Users.findByPk(req.userId, {
            attributes: ["id", "name", "email", "gender", "birth_date"],
        });

        if (!user) {
            return res.status(404).json({
                status: "error",
                msg: "User tidak ditemukan"
            });
        }

        const formattedBirthDate = user.birth_date.toISOString().split('T')[0]; 

        res.json({
            status: "success",
            user: {
                ...user.toJSON(),  
                birth_date: formattedBirthDate, 
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            msg: "Terjadi kesalahan server"
        });
    }
};
