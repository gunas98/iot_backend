const pool = require('./dbconnect');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// require('dotenv').config();

const handleLogin = async (req, res) => {
    const { devid, devpwd } = req.body;
    if (!devid || !devpwd) return res.status(400).json({ 'message': 'Device ID dan password harus diisi.' });
    //console.log(process.env.ACCESS_TOKEN_SECRET);
    //console.log(process.env.ACCESS_TOKEN_EXPIRY);
    //console.log(devid);
    //console.log(devpwd);
    
    pool.query(
        'SELECT devid, hashkey FROM device WHERE devid = $1', 
        [devid], 
        (error, results) => {
            if (error) { throw error; }

            if (results.rowCount > 0) {
                // found, now check password dengan hashkey
                const match = bcrypt.compare(devpwd, results.rows[0].hashkey);
                if (match) {
                    // buat access token 
                    const token = jwt.sign(
                        { "devid": devid },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
                    );
                    res.status(200).json({ token });
                    console.log('token: ' + token);
                }
            } else {
                res.sendStatus(401);                    // wrong password 
            }
      });

}

module.exports = { handleLogin };