var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require( 'mongoose' );
const layouts = require("express-ejs-layouts");
const cors = require('cors');

//var configAuth = require('./config/auth');

const mongodb_URI = 'mongodb+srv://tjhickey:WcaLKkT3JJNiN8dX@cluster0.kgugl.mongodb.net/atlasAuthDemo?retryWrites=true&w=majority' //process.env.MONGODB_URI
console.log(`mongodb_URI = ${mongodb_URI}`)

const dbURL = mongodb_URI
// const dbURL = configAuth.dbURL
mongoose.connect(dbURL,{ useUnifiedTopology: true })

//mongoose.connect( 'mongodb://localhost/authDemo');



const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});

const User = require('./models/User');
const ToDoItem = require('./models/ToDoItem')

const authRouter = require('./routes/authentication');
const isLoggedIn = authRouter.isLoggedIn

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();



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

app.get('/', (req,res)=>res.render('index'));
//app.use('/users', usersRouter);

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

/* ********************************************************/
const Pomodoro = require('./models/Pomodoro')

app.get('/pomodoros',isLoggedIn,
  async (req,res,next) => {
    res.locals.pomodoros = await Pomodoro.find({userId:req.user._id})
    res.render('pomodoros')
  }
)

app.post('/pomodoros',
  isLoggedIn,
  async (req,res,next) => {

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
  }
)

app.get('/pomodoros/clear',isLoggedIn,
  async (req,res,next) => {
    await Pomodoro.deleteMany({userId:req.user._id})
    res.redirect('/pomodoros')
  }
)

/* ********************************************************/


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
      res.locals.items = await ToDoItem.find({userId:req.user._id})
      res.render('toDoList');
});

/* add the value in the body to the list associated to the key */
app.post('/todo',
  isLoggedIn,
  async (req, res, next) => {
      const todo = new ToDoItem(
        {item:req.body.item,
         createdAt: new Date(),
         completed: false,
         userId: req.user._id
        })
      await todo.save();
      //res.render("todoVerification")
      res.redirect('/todo')
});

app.get('/todo/remove/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /todo/remove/:itemId")
      await ToDoItem.remove({_id:req.params.itemId});
      res.redirect('/todo')
});

app.get('/todo/makeComplete/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /todo/makeComplete/:itemId")
      const todo = await ToDoItem.findOne({_id:req.params.itemId});
      todo.completed = true;
      await todo.save()
      //res.locals.todo = todo
      //res.render('completionConfirm')
      res.redirect('/todo')
});

app.get('/todo/switchComplete/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /todo/switchComplete/:itemId")
      const todo = await ToDoItem.findOne({_id:req.params.itemId});
      todo.completed = !todo.completed;
      await todo.save()
      //res.locals.todo = todo
      //res.render('completionConfirm')
      res.redirect('/todo')
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
