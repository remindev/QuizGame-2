# code-game

**This is web app buit using node, express, mongodb**

**Features**
* All the user data and passwords are saved in MongoDB
* All levels and game data is stored in MongoDB
* Uses session and cookie to login and Presist the user logged in.
* Users passwords hash is stored in DB.
* Users can login and logout.
* Users cannot acess the higher level with out completeing the levels below.
* Client can also login as gusest.

**Preview**

Login page

![image](https://remindev.github.io/code-game/info/thump01.png)

Home page

![image](https://remindev.github.io/code-game/info/thump02.png)

Game play

![image](https://remindev.github.io/code-game/info/thump03.png)

**Implimentation**

*Download the project and set up mongoDB.* 
*This project is designed to work on mongoDB*

**Installing packages**

run the following node package command to install all dependencies to you project folder

```bash
npm install
```

**.env**

Now let's create <kbd>.env</kbd> file on the root directry of the project

```ini

USERDB_URL = your users db url

LEVELDB_URL = your projects db url

SESSON_KEY = secret encription string

```
Create these entries on the <kbd>.env</kbd> file

**Add data to display**

For this web app to work, You need to add game level data to games  db.

```js
// each level code should contain data structured like blow in DB.
{
    title:'the text you see next to the level number on title',
    answer:'answer of current level',
    question:'</ question source-code here >',
    level:"level of the question in number"
}
```

The sructure if db of level should be like above. The order if question arranged in DB will not effet the result output.

**Finally**

After setting up you <kbd>database</kbd> and <kbd>.env</kbd> file you are all set

Now you can start server by entering command

```bash
npm start
```

In which <kbd>start</kbd> is a script defined by us in <kbd>package.json</kbd> file. Which is refferd to <kbd>nodemon index.js</kbd>

or

```bash
node index.js
```

For more developement use <kbd> nodemon</kdb>

To install <kbd> nodemon</kdb> 

```bash
npm install nodemon
```
To run <kbd> nodemon</kbd> 

```bash
nodemon index.js
```
*Just change <kbd> node</kbd> to <kbd>nodemon</kbd> while running your main file*

So thats's it you are all set and ready to go 

Thank you and stay creative.
