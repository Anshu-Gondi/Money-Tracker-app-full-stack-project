const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const Transaction = require("./models/Transaction");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());

// Connect to MongoDB once when the server starts
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ body: "test ok" });
});

// Transaction endpoint
app.post("/api/transaction", async (req, res) => {
  try {
    const { name, price, description, datetime } = req.body;
    console.log("Received data:", { name, price, description, datetime });

    // Save the transaction to MongoDB
    const transaction = new Transaction({ name, price, description, datetime });
    const savedTransaction = await transaction.save();

    res.json({ success: true, data: savedTransaction });
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Transactions Fetching
// Transactions Fetching Endpoint
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
});

// Update Transaction Endpoint
app.put("/api/transaction/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, datetime } = req.body;

    // Update the transaction in MongoDB
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { name, price, description, datetime },
      { new: true } // Return the updated document
    );

    if (!updatedTransaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, data: updatedTransaction });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete Transaction Endpoint
app.delete("/api/transaction/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the transaction from MongoDB
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
