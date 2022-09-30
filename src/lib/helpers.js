const bcrypt = require('bcryptjs');
const helpers = {};

helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const finalPass = await bcrypt.hash(password, salt);
    return finalPass;
};

helpers.matchPassword = async (password, savedPassword) => {
    try {
        const result = await bcrypt.compare(password, savedPassword);
        //console.log(result);
        return result;
    } catch (e) {
        console.log(e);
    }
};

module.exports = helpers;