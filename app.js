
let express = require('express')
let dotenv=require('dotenv')
let app=express()
const connectDB = require('./config/db.config')
dotenv.config()
const cors =require('cors')

//middleware
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cors({
    origin:'*',
}))


let studentRoute = require('./routes/student.route')
app.use('/api/student',studentRoute)
let librarianRoute = require('./routes/librarian.route')
app.use('/api/librarian',librarianRoute)
let bookRoute = require('./routes/book.route')
app.use('/api/book',bookRoute)
let issueRequestRoute = require('./routes/issueRequest.route');
app.use('/api/request', issueRequestRoute)

connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})