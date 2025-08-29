const mongoose =require('mongoose')
let Book = require("../models/book.model")
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
module.exports.CreateBook = async(req,res)=>{
    try {
        let{title,price,description,category,isbn,author,stock,publisher,publishedyear}=req.body;
        if(!title||!price||!description||!category||!isbn||!author||!stock||!publisher||!publishedyear){
            return res.status(400).json({message:"Please fill all the fields",success:false});
        }else{
            let newBook = await Book.create({
                title:title,
                price:price,
                description:description,
                category:category,
                isbn:isbn,
                author:author,
                publisher:publisher,
                publishedyear:publishedyear,
                stock:stock
            });
            return res.status(201).json({message:"New Book added successfully",success:true,product:newBook});
        }
    } catch (error) {
         return res.status(500).json({message:"Internal Server Error",success:false});
    }

}
module.exports.AllBook = async(req,res)=>{
    try {
        let books=await Book.find()
        return res.status(200).json({message:"All books",success:true,books:books});
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error",success:false});
    }

}
module.exports.deleteBook = async(req,res)=>{
    try {
        let id = req.params.id;
        let deletedBook = await Book.findByIdAndDelete(id);
        if (!deletedBook) {
            return res.status(404).json({ message: "Book not found", success: false });
        }
        return res.status(200).json({message:"Book deleted successfully",success:true});
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error", success:false, error:error.message});
    }

}

