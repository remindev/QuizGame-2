import Express from 'express'; // importing express form library

import ExpressLayouts from 'express-ejs-layouts'; // importing ejs layout library

import session from 'express-session'; // sessons importing

import ConnectMongoDBSession from 'connect-mongodb-session'; // sesson and storage

import dotenv from 'dotenv'; // importing dot env 

import * as Auth from './auth.js'; // importing self made auth module

import * as DBS from './schemas.js'; // improting skemas


var gdb = []; // to store the array of game level list | gdb for game data base

const mongoDBSession = ConnectMongoDBSession(session); // initializing connect-mongodb-sesson

dotenv.config(); // configuring dot env

const app = Express(); // initailising express to app 

const appConfig = {
    name: "coding", // app name
    port: process.env.PORT | 8080 // port provided by the enveronment or 8080 
}

const __dirname = process.cwd(); // initializing current working directory



app.set("view engine", 'ejs'); // setting view engine to ejs

app.use( // configuring sesson 

    session({
        secret: process.env.SESSON_KEY, // secret key to encription
        resave: false,
        saveUninitialized: false,
        store: new mongoDBSession({
            uri: process.env.USERDB_URL,
            collection: 'session'
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 10 // 10 days
        }

    })

);

app.use(async (req, res, next) => {

    /**
     * This is a middleware function
     * 
     * 1 : getting the values for the game levels
     * 2 : sorting the value got form the game db in level order 
     * 3 : assigning the array sorted in level order to previously declared verable gdb;
     */

    let db = await DBS.levels.find({}); // 1

    for (let i = 0; i < db.length - 1; i++) { // 2

        for (let j = 0; j < db.length - 1; j++) {

            if (Number(db[j].level) > Number(db[j + 1].level)) {

                let temp = db[j];
                db[j] = db[j + 1];
                db[j + 1] = temp;

            };

        };

    };

    gdb = db; // 3 

    next(); // moves to next funciton

});

app.use(Express.json()); // to get data from req body

app.use(ExpressLayouts); // using ejs layouit as middleware

app.use(Express.static(`${__dirname}/public`)); // serving static files

/*
    Middleware function
    checking if the request contains any user is logged in data if so adds some object to -
    request object so we could understand if the request is form logged in user or not.
*/
app.use(Auth.authInitalCheck);

app.use((req, res, next) => {

    // this middleware function is just for logging the current user info on console 
    // removing this middleware won't effect any other functionality of the server;

    if (req.isLoggedIn == true) {
        let date = new Date;
        console.log(`Req : ${req.user.email} at ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}.${date.getSeconds()}s`);
    };

    next();

});

app.use(function (req, res, next) {

    // this is an important middleware in which we declare cache and max age property to the response hedder
    // use case of this for example is to avoid showing login page on click of back butten even after you are logged in 
    // controling the catch and max age is always a good approch
    // 

    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});


// home page | / normal endpoint
app.get('/', Auth.mustLogin, (req, res) => {

    // adding data to data object nessesory for rendering the home page | EJS
    let data = {
        appName: appConfig.name,
        currentPage: "home",
        title: appConfig.name,
        user: req.user,
        game: gdb // game || list of all questions, tites etc...
    };

    res.render("home", data); // rendering home page

});

// play game route | / normal endpoint
app.get('/play', Auth.mustLogin, (req, res) => {

    let level = req.query.level; // getting level query form request url || ex.. /play?level=lv_1
    let levelNO = level.split('_')[1]; // to get the value after '_' from the url
    let flag = false; // flag to find level user passed in url is valid or not
    let currentGame = {};

    /*
       looping through all levels and finds if the level user passed is avialable or not
       if so the flag will turned to true 
    */
    for (let i = 0; i < gdb.length; i++) {

        if (levelNO == gdb[i].level) {
            flag = true;
            currentGame = gdb[i];
        };

    };

    /*
        runs if the question user requested is an avilable question
    */
    if (flag == true) {

        /** 
         * This condition checks that the level user requested is below the number of levels user unlocked
         * This is for prevending the acess for not unlocked levels
         */
        if (req.user.level >= levelNO) {

            // if the level is unlocked level

            // adding nessesory data to render play page 
            let data = {
                appName: appConfig.name,
                currentPage: "play",
                title: appConfig.name,
                user: req.user,
                game: gdb,
                currentGame: currentGame,
                level: levelNO,
            };

            res.render(`play`, data); // rendering page 

        } else {

            // if the user passed the level higher than the level unlocked

            // redirecting the user to the higher lever the user unlocked
            res.redirect(`/play?level=lv_${req.user.level}`);
        }

    } else {

        // if the requested level id invalid or not in database

        // checks if the level is the all complete
        if (levelNO == gdb.length + 1 && levelNO <= req.user.level) {

            // user is about see the final misson complete message if the level is 1 higher than all levels

            // rendering 
            res.render("completed");

        } else {

            // if the request is completely invalid 

            // user is redirected to the higher level unlocked by the user
            res.redirect(`/play?level=lv_${req.user.level}`);

        };

    }

});

// check answer | / api
app.post('/answerCheck', async (req, res) => {

    let allAnswers = gdb; // all games data

    let currentQ = {}; // for stoirng current questions object form db

    let answer = req.body.answer.toLowerCase().trim(); // getting and correcting the spaces and format of answer for request


    // this loops throug all questons and assings current question object to currentQ veriable
    allAnswers.forEach((element, index) => {

        if (element.level == req.body.question) {

            currentQ = element;

        };

    });

    // cheks if and value is on current question var if so continue
    if (currentQ) {

        // if the the answer from the check request and the answer form the db or the same queston maches
        if (answer == currentQ.answer) {

            // unlocking next level
            if (req.session.user.isGuest == true) {
                // if user is a guest

                req.session.user.level = currentQ.level + 1;

            } else {

                // if user is a email user

                // unlocking the level of user by adding the level value+1 on the level key of user object
                let user = await DBS.user.updateOne({ UID: req.user.UID }, { level: currentQ.level + 1 });

            };

            // sending response back to user
            res.send({
                status: 'sucess',
                message: 'Yay, correct answer you unlocked one more level',
            });

        } else {

            // if the answer is wrong

            // sending response back to user
            res.send({
                status: 'sucess',
                message: false, // false will send for wrong answer
            });

        };

    } else {

        // if questoin is not found on the db

        // sending response back to user
        res.send({
            status: 'error',
            message: 'Question not found'
        });

    };

});



// login page | / normal endpoint
app.get("/login", Auth.mustLogout, (req, res) => {

    // check if theh user is logged out using the custom made 'mustLogout' middleware.

    // rendering the login page
    res.render("partials/login", { layout: `${__dirname}/views/auth` });

});

// signin page | / normal endpoint
app.get("/signup", Auth.mustLogout, (req, res) => {

    // check if theh user is logged out using the custom made 'mustLogout' middleware.

    // rendering the signup page
    res.render("partials/signup", { layout: `${__dirname}/views/auth` });

});


// login with email and password | / api
app.post("/login", Auth.mustLogoutApi, (req, res) => {

    // this endpoint is used to validate the inputs from user and login a existing user

    // passing arguments to login module we created
    Auth.loginUser(req).then((user) => {

        // after a sucessful validation 

        // using the user object from login to create the sesson 
        if (user) {
            console.log(`> USER IN : ${user.email}`); // new user message log
            req.session.user = {
                email: user.email,
                UID: user.UID,
                isGuest: false
            };
        };

        // by here login is sucessful 

        // sending sucess response message to client and logs user in
        res.send({
            status: "good",
            message: 'Login sucess'
        });

    }).catch(err => {

        // if there is an error on validaton 

        // send error response to client
        res.send({
            status: 'error',
            message: err
        });

    });

});

// signin using email and password | / api
app.post("/signup", Auth.mustLogoutApi, (req, res) => {

    // this endpoint is for validating and create new user and logs user for first time
    // this endpoint is only acessable if user is logged out

    // validates and returns a promise using the module we created
    Auth.createUser(req).then((user) => {

        // validation is sucessful

        // user
        if (user) {

            // creates a sesson
            req.session.user = {
                email: user.email,
                UID: user.UID,
                isGuest: false
            };

            console.log(`> New user : ${user.email}`); // logs new user message

        }

        // signup done

        // sending the sucess response to client
        res.send({
            status: "good",
            message: 'Login sucess'
        });

    }).catch(err => {

        // if ther is an error at validation

        // sends error resposne to client
        res.send({
            status: 'error',
            message: err
        });

    });

});

// login as guest | / api
app.post("/guestLogin", Auth.mustLogoutApi, (req, res) => {

    // this endpoint is only acessable if usr is not logged in 

    // create a sesson for guest user
    req.session.user = {
        isGuest: true,
        level: 1,
    }

    console.log(`> New user : Guest`); // new usr log

    res.send({
        status: "good",
        message: "Guest login sucess"
    });

});

// logout
app.post('/logout', Auth.mustLoginApi, (req, res) => {
    req.session.destroy();
    res.send({ status: "sucess", message: 'Logout sucess' });
});



// 404 error page | runs if above router function is not called or return nothing as response
app.use((req, res) => {

    /* Dont write request or endpoint code below this 404 because the routs below wont able to get the request.
    because the response is already set above. no matter what you write below.
    It won't effect code unless you code is not a routing code like app.get(), app.post()... */

    res.status(404); // setting staus code for not found || 404;
    res.render("404"); // rendering the error page 

});


// listen on port | start's server
app.listen(appConfig.port, () => {
    console.log(`[-] Server is started at port : ${appConfig.port}`);
});

