const mongoose =require('mongoose')
const Book = require("../models/book.model")
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
        let { title, author, publishedYear, price, publisher, category, stock, description, isbn } = req.body;
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID", success: false });
        }

        let updatedBook = await Book.findById(id)
        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found", success: false });
        }
        else {
            updatedBook.title = title || updatedBook.title;
            updatedBook.author = author || updatedBook.author;
            updatedBook.publishedYear = publishedYear || updatedBook.publishedYear;
            updatedBook.price = price || updatedBook.price;
            updatedBook.publisher = publisher || updatedBook.publisher;
            updatedBook.category = category || updatedBook.category;
            updatedBook.stock = stock || updatedBook.stock;
            updatedBook.description = description || updatedBook.description;
            updatedBook.isbn = isbn || updatedBook.isbn;
            await updatedBook.save();
            return res.status(200).json({ message: "Book updated successfully", success: true, data: updatedBook });
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

module.exports.getBookById = async (req, res) => {
    try {

        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID", success: false });
        }


        let book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found", success: false });
        }
        else {
            return res.status(200).json({ message: "Book fetched successfully", success: true, data: book });
        }

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });

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

