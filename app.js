var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require( 'mongoose' );
const layouts = require("express-ejs-layouts");
const cors = require('cors');
const axios = require('axios');


// here is where we connect to the database

const mongodb_URI = 'mongodb+srv://tjhickey:WcaLKkT3JJNiN8dX@cluster0.kgugl.mongodb.net/atlasAuthDemo?retryWrites=true&w=majority' //process.env.MONGODB_URI
const dbURL = mongodb_URI
mongoose.connect(dbURL,{ useUnifiedTopology: true })

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});

// here are a couple of database models we use below
const User = require('./models/User');
const ToDoItem = require('./models/ToDoItem')

const authRouter = require('./routes/authentication');
const isLoggedIn = authRouter.isLoggedIn


var app = express();  // this is the express server itself!


/* the next 10 lines set up the server
   so it can handle authentication and other features
*/
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
app.use(authRouter)
app.use(cors());

/* ******************* Route for the main pages *********************/


app.get('/', (req,res)=>res.render('index'));

app.get('/about', (req,res)=>res.render('about'));

app.get('/bio/rahma'), (req,res)=>res.render('bioRahma'))

app.get('/bio/rohan', (req,res)=>res.render('bioRohan'));

app.get('/bio/jon', (req,res)=>res.render('jonbio'));

app.get('/bio/alan', (req,res)=>res.render("bioAlan"));

app.get('/bio/sasha', (req,res)=>res.render("biosasha"));

/* ******************* HTML Form Example *********************/

app.get("/formdemo",(req,res) => {
  res.render("formdemo")
})

app.post("/showformdataJSON",(req,res) => {
  res.json(req.body)
})

app.post("/showformdata",(req,res) => {
  res.locals.body = req.body
  res.render('showformdata')
})

/* ******************* Yearbook Form Example *********************/

app.get("/yearbookForm",(req,res)=>{
    res.render("yearbookForm")
})

app.post("/yearbookView",(req,res)=>{
    // do some calculations
    const year=parseFloat(req.body.year)
    const age=(2021-year)
    const ageindays=age*365

    // pass data into the EJS page for rendering
    res.locals.name=req.body.name
    res.locals.img=req.body.img
    res.locals.year = year
    res.locals.age = age
    res.locals.ageindays= ageindays
    res.locals.url=req.body.url
    res.locals.quote=req.body.quote
    res.render("yearbookView")
})

/* ********************** RECIPE API interactions ************/

// this shows how to use an API to get recipes
// http://www.recipepuppy.com/about/api/
// the example here finds omelet recipes with onions and garlic
app.get("/recipe/json/:ingredient",
  async (req,res,next) => {
    try {
      const url = "https://www.themealdb.com/api/json/v1/1/filter.php?i="+req.params.ingredient
      //const url = "https://www.themealdb.com/api/json/v1/1/search.php?i="+meal //http://www.recipepuppy.com/api/?i=onions,garlic&q=omelet&p=3"
      const results = await axios.get(url)
      res.json(results.data)
    } catch(error){
      next(error)
    }
})

// this gets the data from the API and then rendeers it in an ejs page
app.get("/recipe/:ingredient",
  async (req,res,next) => {
    try {
      const url = "https://www.themealdb.com/api/json/v1/1/filter.php?i="+req.params.ingredient
      //const url = "https://www.themealdb.com/api/json/v1/1/search.php?i="+meal //http://www.recipepuppy.com/api/?i=onions,garlic&q=omelet&p=3"
      
      let results = await axios.get(url)
      res.locals.meals = results.data.meals || []
      res.locals.ingredient = req.params.ingredient
      res.render('recipes')
    } catch(error){
      next(error)
    }
})

app.get("/recipeById/:mealId", 
  async (req,res,next) => {
    try {
      const mealId = req.params.mealId
      const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + mealId
      //"https://www.themealdb.com/api/json/v1/1/search.php?i="+mealId
   

      let results = await axios.get(url)
      
      res.locals.data = results.data.meals[0] || []
      res.locals.ingredient = req.params.ingredient
      //res.json(res.locals.data)
      res.render('recipe')
    } catch(error){
      next(error)
    }
}
 )     

/* ******************* Pomodoros *************/
const Pomodoro = require('./models/Pomodoro')

app.get('/pomodoros',isLoggedIn,
  async (req,res,next) => {
   try{
    res.locals.pomodoros = await Pomodoro.find({userId:req.user._id})
    res.render('pomodoros')
   } catch(e) {
     next(e)
   }
  }
)

app.post('/pomodoros',
  isLoggedIn,
  async (req,res,next) => {
   try {

    const pomdata = {
      goal:req.body.goal,
      result:req.body.result,
      completedAt: req.body.completedAt,
      startedAt: req.body.startedAt,
      userId: req.user._id,
    }
    const newPomodoro = new Pomodoro(pomdata)
    await newPomodoro.save()

    res.redirect('/pomodoros')
   } catch(e){
     console.log("Error in pomodoros"+e)
     next(e)
   }
  }
)

app.get('/pomodoros/clear',isLoggedIn,
  async (req,res,next) => {
   try {
    await Pomodoro.deleteMany({userId:req.user._id})
    res.redirect('/pomodoros')
   } catch(e) {
     next(e)
   }
  }
)

/* *************** User Profiles ****************/


app.get('/profiles',
    isLoggedIn,
    async (req,res,next) => {
      try {
        res.locals.profiles = await User.find({})
        res.render('profiles')
      }
      catch(e){
        next(e)
      }
    }
  )

app.use('/publicprofile/:userId',
    async (req,res,next) => {
      try {
        let userId = req.params.userId
        res.locals.profile = await User.findOne({_id:userId})
        res.render('publicprofile')
      }
      catch(e){
        console.log("Error in /profile/userId:")
        next(e)
      }
    }
)


app.get('/profile',
    isLoggedIn,
    (req,res) => {
      res.render('profile')
    })

app.get('/editProfile',
    isLoggedIn,
    (req,res) => res.render('editProfile'))

app.post('/editProfile',
    isLoggedIn,
    async (req,res,next) => {
      try {
        let username = req.body.username
        let age = req.body.age
        req.user.username = username
        req.user.age = age
        req.user.imageURL = req.body.imageURL
        await req.user.save()
        res.redirect('/profile')
      } catch (error) {
        next(error)
      }

    })

/* ********************************************************/

// get the value associated to the key
app.get('/todo',
  isLoggedIn,
  async (req, res, next) => {
    try {
      res.locals.items = await ToDoItem.find({userId:req.user._id})
      res.render('toDoList');
    } catch(e) {
      next(e)
    }
});

/* add the value in the body to the list associated to the key */
app.post('/todo',
  isLoggedIn,
  async (req, res, next) => {
    try {
      const todo = new ToDoItem(
        {item:req.body.item,
         createdAt: new Date(),
         completed: false,
         userId: req.user._id
        })
      await todo.save();
      res.redirect('/todo')
    } catch(e) {
      next(e)
    }
});

app.get('/todo/remove/:itemId',
  isLoggedIn,
  async (req, res, next) => {
    try {
      console.log("inside /todo/remove/:itemId")
      await ToDoItem.remove({_id:req.params.itemId});
      res.redirect('/todo')
    } catch(e) {
      next(e)
    }
});


app.get('/todo/switchComplete/:itemId',
  isLoggedIn,
  async (req, res, next) => {
    try {
      console.log("inside /todo/switchComplete/:itemId")
      const todo = await ToDoItem.findOne({_id:req.params.itemId});
      todo.completed = !todo.completed;
      await todo.save()
      res.redirect('/todo')
    } catch(e) {
      next(e)
    }
});





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
