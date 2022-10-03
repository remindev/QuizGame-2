import mongoose from "mongoose"; // importing mongoose

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



// create user function
/**
 *
 * @param {Request} request
 */
export function createUser(request) {

    let email = request.body.email.trim();

    let password = request.body.password.trim();

    let good = true;

    return new Promise(async (resolve, reject) => {

        try {

            let allUserEmail = await DBS.user.find({}).select({ _id: 0, email: 1 });

            allUserEmail.forEach((e, i, a) => {
                allUserEmail[i] = e.email;
            });


            if (email.lenght != 0 && password.length != 0) {

                if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {

                    allUserEmail.forEach((e, index, array) => {

                        if (e != email) {

                            // good

                        } else {
                            good = false;
                            reject('email already exists');
                        }

                    });

                } else {
                    good = false;
                    reject("email is not valid");
                }

                if (password.length >= 6) {

                    // good

                } else {
                    good = false;
                    reject('password length must be 6');
                }

            } else {
                good = false;
                reject("email or password field cannot be empty");
            }

            if (good) {

                UID_CREATOR();

                async function UID_CREATOR() {

                    let UID = await DBS.user.find({}).select({ _id: 0, UID: 1 });

                    let userID = randomId(25);

                    let flag = 2;

                    UID.forEach((e, i, a) => {

                        if (e.UID == userID) {
                            flag = 1;
                        }

                    });

                    if (flag == 2) {
                        savesUser(userID);
                    } else {
                        return UID_CREATOR();
                    };


                }

                function savesUser(userID) {

                    let saltRounds = 10;

                    bcript.hash(password, saltRounds, async function (err, hash) {

                        if (err) {
                            console.error(err);
                        } else {

                            let user = await DBS.user({
                                email: email,
                                password: hash,
                                level: 1,
                                UID: userID
                            });

                            user.save();

                            resolve(user);

                        }

                    });

                }

            }

        } catch (e) {
            console.log(e);
        }

    });

}


export function loginUser(request) {

    let email = request.body.email.trim();

    let password = request.body.password.trim();

    let good = true;

    return new Promise(async (resolve, reject) => {

        let emailList = await DBS.user.find({}).select({ _id: 0, email: 1 });
        emailList.forEach((e, i, a) => {
            emailList[i] = e.email;
        });

        if (email.length > 3 && password.length >= 6) {

            if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {

                let emailNotExist = true;

                emailList.forEach(e => {

                    if (e == email) {
                        emailNotExist = false;
                    }

                });

                if (emailNotExist == true) {
                    reject("Acoount not exist on this Email");
                } else {

                    // valid mail
                    let user = await DBS.user.find({ email: email }).select({ _id: 0 });

                    bcript.compare(password, user[0].password, async (err, sucess) => {

                        if (err) {
                            console.error(err);
                        } else {

                            if (sucess) {

                                resolve(user[0]);

                            } else {
                                reject("Incorrect Password");
                            }

                        }

                    });

                }

            } else {
                good = false;
                reject('Enter is not valid');
            }

        } else {
            good = false;
            reject("Email or password dosn't meet the required length");
        }

    });

}


// auth check function to check if user is logged in or not

export async function authInitalCheck(req, res, next) {

    // if user object is on the session obj, that means user is logged in
    if (req.session.user) {

        req.isLoggedIn = true; // setting isLoggedIn variable inside req object as true to indicate the presence of logged in user

        if (req.session.user.isGuest == false) { // check if user is guest user or not

            let UID = req.session.user.UID; // getting user id from existing sesson

            let user = await DBS.user.find({ UID: UID });

            req.user = {
                level: user[0].level,
                email: user[0].email,
                UID: user[0].UID,
                isGuest: false
            };

        } else {

            req.session.user.email = "Guest";
            req.user = req.session.user;

        }

    } else {

        req.isLoggedIn = false; // setting isLoggedIn variable inside req object as false to indicate the absence of logged in user

    }

    next(); // move on to the next funciton | middle ware
}




/*
   This function is resposible to redirect user to the login page when the user is not logged in
   If logged in this function just passes and move to next funtion
*/
export function mustLogin(req, res, next) {

    if (req.isLoggedIn == false) {
        res.redirect('/login');
    } else {
        next();
    }

}

export function mustLoginApi(req, res, next) {
    if (req.isLoggedIn == false) {
        res.send({ status: 'error', message: 'access denied' }).status(403);
    } else {
        next();
    }
}

/*
   This function is resposible to redirect user to the home page when the user is logged in
   If not logged in, this function just passes and move to next funtion
*/
export function mustLogout(req, res, next) {

    if (req.isLoggedIn == true) {
        res.redirect('/');
    } else {
        next();
    }

}

export function mustLogoutApi(req, res, next) {
    if (req.isLoggedIn == true) {
        res.send({ status: 'error', message: 'access denied - Already logged in', code: 403771, type: req.user.isGuest, email: req.user.email }).status(403);
    } else {
        next();
    }
}


