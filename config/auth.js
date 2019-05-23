import passport from 'passport';

module.exports = {
// ensuring authentification
ensureAuthenticated : function(req, res, next) {
    console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

    if(req.isAuthenticated()){
        return next();
    }
  //  req.flash('error_msg', 'Please log in to view this ressource');
  res.redirect('/users/login');
}
}
