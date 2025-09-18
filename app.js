
let express = require('express')
let dotenv=require('dotenv')
dotenv.config()
let app=express()
const connectDB = require('./config/db.config')
const cors =require('cors')

//middleware
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cors({
    origin:process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials:true
}))

app.use((err, req, res, next) => {
  if (err instanceof cors.CorsError) {
    return res.status(403).json({ message: 'CORS error', success: false });
  }
  next(err);
});

let studentRoute = require('./routes/student.route')
app.use('/api/student',studentRoute)
let librarianRoute = require('./routes/librarian.route')
app.use('/api/librarian',librarianRoute)
let bookRoute = require('./routes/book.route')
app.use('/api/book',bookRoute)
let issueRequestRoute = require('./routes/issueRequest.route');
app.use('/api/request', issueRequestRoute)
app.use('/api/student', require('./routes/student.route'));


connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
