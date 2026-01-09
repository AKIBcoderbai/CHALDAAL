const express=require('express');
const morgan=require('morgan');
const helmet=require('helmet');
const cors=require('cors');
const dotenv=require('dotenv');
dotenv.config();
const pool=require('./database/db');

const app=express();
const PORT=process.env.PORT || 3000;
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({extended:true}));

pool.connect();

// const testDB=async ()=>{
//     try{
//         const res=await pool.query('SELECT NOW()');
//         console.log('Database connected:',res.rows[0]);
//     }catch(err){
//         console.error('Database connection error:',err);
//     }
// }
// testDB();

//ROUTES
app.get('/',(req,res)=>{
    res.send('Welcome to ChaalDaal Backend');
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});