const isAuthenticated = (req, res, next) => {
  console.log("Authenticating user");
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};

module.exports = { isAuthenticated };
