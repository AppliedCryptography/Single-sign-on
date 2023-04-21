const express = require('express');
const router = express.Router();
const {FusionAuthClient} = require('@fusionauth/typescript-client');

const clientId = 'efe085b3-cc4f-408d-bacf-8c03061811aa'; // change
const clientSecret = '2Wn6JpPRIl_ltkoeR75vwpBdHklXZer6oaOrJMl9fBY'; // change
const hostName = 'piedpiper.local';

const fusionauthHostName = 'sandbox.fusionauth.io'
const port = 3000;
const title = 'Pied Piper';

const client = new FusionAuthClient('noapikeyneeded', 'https://'+fusionauthHostName);
const loginUrl = 'https://'+fusionauthHostName+'/oauth2/authorize?client_id='+clientId+'&response_type=code&redirect_uri=http%3A%2F%2F'+hostName+'%3A'+port+'%2Foauth-redirect&scope=offline_access%20openid';
const logoutUrl = 'https://'+fusionauthHostName+'/oauth2/logout?client_id='+clientId;

/* GET home page. */
router.get('/', function (req, res, next) {

  if (!req.session.user) {
    res.redirect('/login')
    //  res.redirect(302, loginUrl);
     return;
  }
  res.render('index', {user: req.session.user, title: title + ' App', clientId: clientId, logoutUrl: "/logout", loginUrl: loginUrl});
});

/* Login page if we aren't logged in */
router.get('/login', function (req, res, next) {
  res.render('login', {title: title + ' Login', clientId: clientId, loginUrl: loginUrl});
});

/* Logout page */
router.get('/logout', function (req, res, next) {
  req.session.user = null;
  res.redirect(302, logoutUrl);
});

/* End session for global SSO logout */
router.get('/endsession', function (req, res, next) {
  req.session.user = null;
  res.redirect(302, "/login");
});

/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function (req, res, next) {
  // This code stores the user in a server-side session
  client.exchangeOAuthCodeForAccessToken(req.query.code,
                                         clientId,
                                         clientSecret,
                                         'http://'+hostName+':'+port+'/oauth-redirect')
      .then((response) => {
        return client.retrieveUserUsingJWT(response.response.access_token);
      })
      .then((response) => {
        console.log(hostName);
        console.log(response.response);
        req.session.user = response.response.user;
        return response;
      })
      .then((response) => {
        res.redirect(302, '/');
      }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});
});

module.exports = router;
