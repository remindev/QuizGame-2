import mongoose from "mongoose"; // importing mongoose

import dotenv from 'dotenv'; // importing dot env

dotenv.config(); // configuring dot env

var DBDelay = new Date;


// auth db | USER

const AuthDB = mongoose.createConnection(process.env.USERDB_URL); // connecting to db

AuthDB.on('error', (error) => console.log(error)); // checks for errors

AuthDB.once('open', () => logger(new Date,"")); // run once after the db is connected



// games db | PROJECTS

const dbLevel = mongoose.createConnection(process.env.LEVELDB_URL); // connecting to db

dbLevel.on('error', (error) => console.error(error)); // checks for errors

dbLevel.once('open', () => logger("",new Date) ); // run once after the db is connected


// printing connnection status of each db
var DBNumber = 2;

var DBConnected = 0;

var DBTimeRemorder = {
    
}

function logger(auth,game){

    DBTimeRemorder.authTime = auth!=""?auth:DBTimeRemorder.authTime;
    DBTimeRemorder.gameTime = game!=""?game:DBTimeRemorder.gameTime;

    if(++DBConnected == DBNumber){
        console.log(`> DB: Auth ${DBTimeRemorder.authTime-DBDelay}ms, Game ${DBTimeRemorder.gameTime-DBDelay}ms`);
    }
}



/**
 * user schema 
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    creationTime: {
        type: Date,
        default: new Date
    },
    level: Number,
    nameID: String,
    UID: String
});

export let user = AuthDB.model('users', userSchema);

const codeGame = new mongoose.Schema({
    level: Number,
    title: String,
    question: String,
    answer: String
});

export let levels = dbLevel.model('levels', codeGame);