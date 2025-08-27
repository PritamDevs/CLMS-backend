const mongoose =require('mongoose')
const Student = require("../models/student.model")
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
module.exports.login=async(req,res)=> {
   try{
    let{email,password}=req.body
    if(!email||!password){
        return res.status(400).json({message:"Email and password are required",success:false})
    }else{
        let student = await Student.findOne({email:email})
        if(!student){
            return res.status(400).json({message:"Invalid email",success:false})
        }else{
            let isValidPassword =await bcrypt.compare(password,student.password)
            if(!isValidPassword){
                return res.status(400).json({message:"Invalid Password",success:false})
            }else{
                delete student._doc.password

                let payload = {
                    name:student.name,
                    email:student.email,
                    phone:student.phone,
                    id:student._id,
                    type:"student"
                }
                let token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'1h'})
                return res.status(200).json({message:"Login successful",success:true,token:token,buyer:payload})
            }
        }
    }

   }catch(err){
      return res.status(500).json({message:"Internal Server Error",success:false});
   }
}

module.exports.Register=async(req,res)=> {
    try{
        let{name,email,password,cpassword,phone}=req.body;
        if(!name|| !email || !password || !cpassword || !phone){
        return res.status(400).json({message:"Please fill all fields",status:false});
        }else if (password !== cpassword){
            return res.status(400).json({
                message:"Password and Confirm password are not same",success:false
            });
        }else {
            let student = await Student.find({$or: [{ email: email }, { phone: phone }]});
            if(student.length > 0){
                return res.status(400).json({message:"Email or phone already exist",success:false});
            }else{
                let hashedPassword = await bcrypt.hash(password,10)
                if(phone.length!==10){
                    return res.status(400).json({message:"Invalid Phone Number",success:false});
                }
                let newStudent = await Student.create({
                    name:name,
                    email:email,
                    password:hashedPassword,
                    phone:phone
                })
                delete newStudent._doc.password
                return res.status(201).json({message:"Student Registration Successfully",success:true,newStudent});
            }
        }
    }catch (err){
        console.error(err); 
        return res.status(500).json({message:"Internal Server Error",success:false});
    }
    }


    module.exports.Profile=async (req,res)=>{
        const bId=req.user.id
        try {
            let data=await Student.findById(bId)
            delete data._doc.password
            return res.send({message:"student profile",success:true,data})
        } catch (error) {
             return res.status(500).json({message:"Internal Server Error",success:false});
        }
    }