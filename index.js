const express = require('express');
const csrf = require('csurf');
const flash = require('connect-flash');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const helmet = require('helmet');
const compression = require('compression');

const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const ordersRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const keys = require('./keys');

const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorMiddleware = require('./middleware/error');
const fileMiddleware = require('./middleware/file');

const app = express();

const hbs = exphbs.create({
   defaultLayout: 'main',
   extname: 'hbs',
   handlebars: allowInsecurePrototypeAccess(handlebars),
   helpers: require('./utils/hbs-helpers')
});

const store = new MongoStore({
   collection: 'sessions',
   uri: keys.MONGODB_URI
});

// engine registration
app.engine('hbs', hbs.engine);
// start using the engine
app.set('view engine', 'hbs');
// folder in which templates will be stored
app.set('views', 'views');

// add middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({
   extended: true
}));
app.use(session({
   secret: keys.SESSION_SECRET,
   resave: false,
   saveUninitialized: false,
   store
}));
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(
   helmet({
      contentSecurityPolicy: {
         directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "https:"],
            "script-src": ["'self'", "https:"]
         },
      },
   })
);
app.use(compression());

app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

async function start() {
   try {
      await mongoose.connect(keys.MONGODB_URI, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
         useFindAndModify: false
      });

      app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`);
      });
   } catch (e) {
      console.log(e);
   }
}
start();
