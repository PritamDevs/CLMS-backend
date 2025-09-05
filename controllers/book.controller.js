const mongoose =require('mongoose')
let Book = require("../models/book.model")
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
module.exports.CreateBook = async(req,res)=>{
    try {
        let{title,price,description,category,isbn,author,stock,publisher,publishedyear}=req.body;
        if(!title||!price||!description||!category||!isbn||!author||!stock||!publisher||!publishedyear){
            return res.status(400).json({message:"Please fill all the fields",success:false});
        }
        price = Number(price);
        stock = Number(stock);
        publishedyear = Number(publishedyear);

        let existingBook = await Book.findOne({ isbn });
        if (existingBook) {
            return res.status(400).json({ message: "Book already exists", success: false });
        }
        else{
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
module.exports.UpdateBook = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      price,
      description,
      category,
      isbn,
      author,
      stock,
      publisher,
      publishedyear,
    } = req.body;

    const updatedData = {};
    if (title) updatedData.title = title;
    if (price && !isNaN(Number(price))) updatedData.price = Number(price);
    if (description) updatedData.description = description;
    if (category) updatedData.category = category;
    if (isbn) updatedData.isbn = isbn;
    if (author) updatedData.author = author;
    if (stock && !isNaN(Number(stock))) updatedData.stock = Number(stock);
    if (publisher) updatedData.publisher = publisher;
    if (publishedyear && !isNaN(Number(publishedyear))) updatedData.publishedyear = Number(publishedyear);

    const updatedBook = await Book.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found", success: false });
    }

    return res.status(200).json({ message: "Book updated successfully", success: true, book: updatedBook });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", success: false, error: error.message });
  }
};
module.exports.AllBook = async(req,res)=>{
    try {
        let books=await Book.find()
        return res.status(200).json({message:"All books",success:true,books:books});
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error",success:false});
    }

}
exports.AllBook = async (req, res) => {
  try {
    const { category, author, title } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (title) filter.title = { $regex: title, $options: 'i' };

    const books = await Book.find(filter);

    return res.status(200).json({ message: "Books fetched", success: true, books });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", success: false, error: error.message });
  }
};
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

