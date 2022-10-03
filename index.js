import Express from 'express'; // importing express form library

import ExpressLayouts from 'express-ejs-layouts'; // importing ejs layout library

import session from 'express-session'; // sessons importing

import ConnectMongoDBSession from 'connect-mongodb-session'; // sesson and storage

import dotenv from 'dotenv'; // importing dot env 

import * as Auth from './auth.js'; // importing self made auth module

import * as DBS from './schemas.js'; // improting skemas


var gdb = [];

const mongoDBSession = ConnectMongoDBSession(session); // initializing connect-mongodb-sesson

dotenv.config(); // configuring dot env

const app = Express(); // initailising express to app 

const appConfig = {
    name: "coding",
    port: process.env.PORT | 8080
}

const __dirname = process.cwd(); // initializing current working directory



app.set("view engine", 'ejs'); // setting view engine to ejs

app.use( // configuring sesson 

    session({
        secret: process.env.SESSON_KEY,
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

app.use(async (req,res,next)=>{

    let db = await DBS.levels.find({});

    for(let i=0; i<db.length-1; i++){

        for(let j=0; j<db.length-1; j++){
    
            if(Number(db[j].level) > Number(db[j+1].level)){
                
                let temp = db[j];
                db[j] = db[j+1];
                db[j+1] = temp;
    
            }
    
        }
    
    }

    gdb = db;

    next();

});

app.use(Express.json()); // to get data from req body

app.use(ExpressLayouts); // using ejs layouit as middleware

app.use(Express.static(`${__dirname}/public`)); // serving static files

app.use(Auth.authInitalCheck);

app.use((req, res, next) => {

    if (req.isLoggedIn == true) {
        let date = new Date;
        console.log(`Req : ${req.user.email} at ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}.${date.getSeconds()}s`);
    };

    next();

});

app.use(function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});


// home page | / endpoint
app.get('/', Auth.mustLogin, (req, res) => {

    // console.log("After : "+sorted[1].level+" : "+gdb[1].level);

    let data = {
        appName: appConfig.name,
        currentPage: "home",
        title: appConfig.name,
        user: req.user,
        game: gdb
    };

    res.render("home", data);

});

// play game route
app.get('/play', Auth.mustLogin, (req, res) => {

    let level = req.query.level;
    let levelNO = level.split('_')[1];
    let flag = false;
    let currentGame = {};

    for (let i = 0; i < gdb.length; i++) {

        if (levelNO == gdb[i].level) {
            flag = true;
            currentGame = gdb[i];
        }

    }

    if (flag == true) {

        if (req.user.level = levelNO) {

            let data = {
                appName: appConfig.name,
                currentPage: "play",
                title: appConfig.name,
                user: req.user,
                game: gdb,
                currentGame: currentGame,
                level: levelNO,
            };

            res.render(`play`, data);

        } else {
            res.redirect(`/play?level=lv_${req.user.level}`);
        }

    } else {

        if (levelNO == gdb.length+1 && levelNO <= req.user.level ) {
            res.render("completed");
        } else {
            res.redirect(`/play?level=lv_${req.user.level}`);
        };

    }

});

app.post('/answerCheck', async (req, res) => {

    let allAnswers = gdb;
    let currentQ = {};
    let answer = req.body.answer.toLowerCase().trim();

    allAnswers.forEach((element, index) => {
        if (element.level == req.body.question) {
            currentQ = element;
        }
    });

    if (currentQ) {

        if (answer == currentQ.answer) {

            if (req.session.user.isGuest == true) {
                req.session.user.level = currentQ.level + 1;
            } else {
                let user = await DBS.user.updateOne({ UID: req.user.UID }, { level: currentQ.level + 1 });
            }

            res.send({
                status: 'sucess',
                message: {

                },
            });

        } else {
            res.send({
                status: 'sucess',
                message: false,
            });
        }

    } else {
        res.send({
            status: 'error',
            message: 'Question not found'
        })
    }

});



// login page 
app.get("/login", Auth.mustLogout, (req, res) => {

    res.render("partials/login", { layout: `${__dirname}/views/auth` });

});

// signin page
app.get("/signup", Auth.mustLogout, (req, res) => {

    res.render("partials/signup", { layout: `${__dirname}/views/auth` });

});


// login with email and password
app.post("/login", Auth.mustLogoutApi, (req, res) => {

    Auth.loginUser(req).then((user) => {

        if (user) {
            console.log(`> USER IN : ${user.email}`);
            req.session.user = {
                email: user.email,
                UID: user.UID,
                isGuest: false
            };
        }

        res.send({
            status: "good",
            message: 'Login sucess'
        });

    }).catch(err => {

        res.send({
            status: 'error',
            message: err
        });

    });

});

// signin using email and password
app.post("/signup", Auth.mustLogoutApi, (req, res) => {

    Auth.createUser(req).then((user) => {

        if (user) {
            console.log(`> New user : ${user.email}`);
            req.session.user = {
                email: user.email,
                UID: user.UID,
                isGuest: false
            };
        }

        res.send({
            status: "good",
            message: 'Login sucess'
        });

    }).catch(err => {

        res.send({
            status: 'error',
            message: err
        });

    });

});

// login as guest
app.post("/guestLogin", Auth.mustLogoutApi, (req, res) => {

    req.session.user = {
        isGuest: true,
        level: 1,
    }

    console.log(`> New user : Guest`);

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
    res.status(404);
    res.render("404");
});


// listen on port | start's server
app.listen(appConfig.port, () => {
    console.log(`> Server is started at port : ${appConfig.port}`);
});

