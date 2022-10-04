import dotenv from 'dotenv'; // importing dot env

import bcript from 'bcryptjs'; // importing bcrypt to

import * as DBS from './schemas.js'; // improting skemas

dotenv.config(); // configuring dot env

/**
 * Generates a random id with length control
 *
 * @param {number} length - Length of returning id
 * @returns - random ID e.g.. randomID(10) => AdF6ui-_oD
 */
export function randomId(length) {
    // this function creates a reandom id
    // controll id length by providing length to function (< length limit >);
    // if length not provided function returns id of default length of 10

    // declaring required veriables
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split(''); // all charectes tobe included in id
    var str = ''; // output sting container

    if (!length) { // checks if any lenths are passed to function or not and runs if not

        // sets length as 10 || deafalt length
        length = 10;

    };

    for (var i = 0; i < length; i++) {
        // this loops runs according to the lenth provided
        // e.g.. function (100) runs this loop 100 times

        // adding each character to output string variable randomly
        str += chars[Math.floor(Math.random() * chars.length)];

    };

    return str;  // returns output string

};



/**
 * Create user function
 * This function validates the requests from clients and return user object 
 * Validates form and check the user is existing or not.
 * 
 * @param {Request} request
 */
export function createUser(request) {

    let email = request.body.email.trim(); // getting requested email 

    let password = request.body.password.trim(); // getting requested password

    let good = true; // flag to find errors

    // creating the promise as return type
    return new Promise(async (resolve, reject) => { 

        // here try is used to find error form getting user data from db 
        try {

            let allUserEmail = await DBS.user.find({}).select({ _id: 0, email: 1 }); // gets all users email

            // formatting the data from db to an array of email
            allUserEmail.forEach((e, i, a) => {
                allUserEmail[i] = e.email;
            });

            // checks if the email and password field is not empty
            if (email.lenght != 0 && password.length != 0) {

                // checks if email from request is correctely formatted
                if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {

                    // checks the email form request is on the email list on db
                    allUserEmail.forEach((e, index, array) => {

                        if (e != email) {

                            // good | new email

                        } else {

                            // email existas
                            good = false; // error 

                            // reject promise with message
                            reject('email already exists');

                        };

                    });

                } else {

                    // bad email fromat

                    good = false; // error

                    // rejects promis with message
                    reject("email is not valid");
                };

                // after checking email checks the length of passeword is vlaid or not
                if (password.length >= 6) {

                    // good

                } else {
                    // password lenght is lesser than theh requirement

                    good = false; // error

                    // rejects promise with message
                    reject('password length must be 6');
                };

            } else {

                // one of the fields or both of the fields is empty

                good = false; // error

                // rejects promise with message
                reject("email or password field cannot be empty");
                
            };

            // if there is no false is marked | no error is happen the user creation moves to next step
            if (good) {

                UID_CREATOR(); // calls 

                async function UID_CREATOR() { 

                    // creats a unique user id for every new user

                    // gets all uid from db
                    let UID = await DBS.user.find({}).select({ _id: 0, UID: 1 });

                    let userID = randomId(25); // creates a random string for id;

                    let flag = 2; // flag for find if new id created is a duplicate id or not | 2 == good

                    UID.forEach((e, i, a) => { 

                        // this loop finds and update duplicate is there or not

                        if (e.UID == userID) {
                            flag = 1; // if duplicate id
                        };

                    });

                    if (flag == 2) {
                        // if new unique id 

                        // saves user to db
                        savesUser(userID);

                    } else {
                        // if duplicate id of user id is found

                        // re-run this function 
                        return UID_CREATOR();

                    };


                };

                // saves user to db
                function savesUser(userID) {

                    let saltRounds = 10; // salt rounds 

                    // making hash of password from client
                    bcript.hash(password, saltRounds, async function (err, hash) {

                        if (err) { 
                            
                            // error handling
                            console.error(err);

                        } else {

                            // creates user object
                            let user = await DBS.user({
                                email: email,
                                password: hash,
                                level: 1,
                                UID: userID
                            });

                            user.save(); // saves to db

                            resolve(user); // resolves the promise with user object

                        };

                    });

                };

            };

        } catch (e) {

            // error from data reading | DB

            console.error(e); // logs error

        };

    });

};


export function loginUser(request) {

    // this function logs in a user by the email existis on db

    let email = request.body.email.trim(); // getting requested email 

    let password = request.body.password.trim(); // getting requested password 

    let good = true; // flag to find errors

    // returning a promise as a result of this function
    return new Promise(async (resolve, reject) => {

        // getting user data from db 
        let emailList = await DBS.user.find({}).select({ _id: 0, email: 1 }); // email of all useres

        // formatting to an array the data from db
        emailList.forEach((e, i, a) => {
            emailList[i] = e.email;
        });

        // validating inputs
        if (email.length > 3 && password.length >= 6) {

            if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {

                let emailNotExist = true;

                emailList.forEach(e => {

                    if (e == email) {

                        // if the email client entered is on the db

                        // you are good to go
                        emailNotExist = false;

                    };

                });

                if (emailNotExist == true) {

                    // if the email is not on the server 

                    // reject promise with error message
                    reject("Acoount not exist on this Email");

                } else {

                    // valid mail

                    // getting user data on db by the email user entered
                    let user = await DBS.user.find({ email: email }).select({ _id: 0 });

                    // comparing the passwoed user entered by the hash stored in db
                    bcript.compare(password, user[0].password, async (err, sucess) => {

                        if (err) {

                            // comparing password error handling

                            console.error(err);

                        } else {

                            // if there is no error
                            if (sucess) {

                                // if client entered password matches the hash on server

                                // resolve promise with the user data as the parameter
                                resolve(user[0]);

                            } else {

                                // when password and hash dosent match

                                // reject promise with an error message
                                reject("Incorrect Password");

                            };

                        };

                    });

                }

            } else {
                // is the email is not valid

                good = false; // error

                // reject promise with error message
                reject('Enter is not valid');
            }

        } else {

            // one of the field or both dosent meet the required length 

            good = false; // error

            // rejecting promise with error message
            reject("Email or password dosn't meet the required length");
        };

    });

};


// auth check function to check if user is logged in or not

export async function authInitalCheck(req, res, next) {

    // if user object is on the session obj, that means user is logged in
    if (req.session.user) {

        req.isLoggedIn = true; // setting isLoggedIn variable inside req object as true to indicate the presence of logged in user

        if (req.session.user.isGuest == false) { // check if user is guest user or not

            let UID = req.session.user.UID; // getting user id from existing sesson

             //if client is an email user the clients data stored in db is collected form here and added to main req object

            let user = await DBS.user.find({ UID: UID }); // from db

            req.user = { // adding user data to main req object
                level: user[0].level,
                email: user[0].email,
                UID: user[0].UID,
                isGuest: false
            };

        } else {

            // if user is a guest

            // settig req.user as the data from the sesson 

            req.session.user.email = "Guest"; // inted of email we write guest
            req.user = req.session.user; // user data

        };

    } else {

        req.isLoggedIn = false; // setting isLoggedIn variable inside req object as false to indicate the absence of logged in user

    };

    next(); // move on to the next funciton | middle ware

};




/*
   This function is resposible to redirect user to the login page when the user is not logged in
   If logged in this function just passes and move to next funtion
*/
export function mustLogin(req, res, next) {

    if (req.isLoggedIn == false) {

        // is there is no user is logged in, client is redirected to login page

        res.redirect('/login');

    } else {

        next(); // moves on to next function 

    };

};

export function mustLoginApi(req, res, next) {

    // this funciton is same as the functoin mustlogin above the difference is theat this funciton is not redirecting user to login page
    // isted this give an error message as result

    if (req.isLoggedIn == false) {

        // if the user is not logged in 

        // send error message responce to user
        res.send({ status: 'error', message: 'access denied' }).status(403);

    } else {

        next();

    };

};

/*
   This function is resposible to redirect user to the home page when the user is logged in
   If not logged in, this function just passes and move to next funtion
*/
export function mustLogout(req, res, next) {

    if (req.isLoggedIn == true) {

        // user is loged in 

        // redirect user to home page
        res.redirect('/');

    } else {
        
        // user is not logged in 

        next(); // moves on to next function 

    };

};

export function mustLogoutApi(req, res, next) {

    // this funciton is same as the funciton above mustLogout the only difference is that insted to redirectng user to home page this send's a message to client
    if (req.isLoggedIn == true) {

        // user is logged in 

        // sends an error message to client
        res.send({ status: 'error', message: 'access denied - Already logged in', code: 403771, type: req.user.isGuest, email: req.user.email }).status(403);

    } else {

        // user is not logged in 

        next(); // moves to next function 

    };

};


