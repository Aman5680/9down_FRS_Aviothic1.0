const checkLogin = (req, res, next) => {
    const { _id, username } = req.session;
    // console.log(req.session);
    if (username) {
        next();
    } else {
        return res.redirect("/login");
    }
};

module.exports = checkLogin;