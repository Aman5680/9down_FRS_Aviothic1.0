const checkLogin = (req, res, next) => {
    const { _id, username } = req.session;

    if (_id) {
        next();
    } else {
        return res.redirect("/login");
    }
};

module.exports = checkLogin;