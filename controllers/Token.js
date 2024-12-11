import Users from "../models/user_model.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
    const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = process.env;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.sendStatus(401); // Unauthorized

    try {
        const user = await Users.findOne({
            where: { refresh_token: refreshToken },
        });

        if (!user) return res.sendStatus(403); // Forbidden

        // Verifikasi refresh token
        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(403); // Forbidden

            const { id, name, email } = user; 

            const accessToken = jwt.sign({ userid: user.id, name, email }, ACCESS_TOKEN_SECRET, {
                expiresIn: "1h", // Waktu access token
            });

            res.json({ accessToken });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};
