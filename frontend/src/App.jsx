import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [datetime, setDatetime] = useState("");
  const [description, setDescription] = useState("");
  const [transactions, setTransactions] = useState([]);

  // Function to add a new transaction
  function addNewTransaction(ev) {
    ev.preventDefault();
    const url = `${import.meta.env.VITE_API_URL}/transaction`;

    // Extract the price from the name input (e.g., "+200 new Samsung TV")
    const price = parseFloat(name.split(" ")[0].replace(/[^0-9.-]/g, ""));
    const transactionName = name.slice(name.indexOf(" ") + 1);

    if (isNaN(price)) {
      alert("Invalid price format. Please include a valid number.");
      return;
    }

    // Send the request to the backend
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: transactionName,
        price,
        description,
        datetime,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        console.log("Transaction result:", json);
        alert("Transaction added successfully!");

        // Reset the input fields after a successful insertion
        setName("");
        setDatetime("");
        setDescription("");

        // Fetch the updated list of transactions
        fetchTransactions();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to add transaction");
      });
  }

  // Function to fetch transactions from the backend
  function fetchTransactions() {
    const url = `${import.meta.env.VITE_API_URL}/transactions`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          setTransactions(json.data);
        } else {
          alert("Failed to fetch transactions");
        }
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
      });
  }

  function updateTransaction(id, updatedData) {
    const url = `${import.meta.env.VITE_API_URL}/transaction/${id}`;

    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          alert("Transaction updated successfully!");
          fetchTransactions(); // Refresh the transactions list
        } else {
          alert("Failed to update transaction");
        }
      })
      .catch((error) => {
        console.error("Error updating transaction:", error);
        alert("Server error");
      });
  }

  function deleteTransaction(id) {
    const url = `${import.meta.env.VITE_API_URL}/transaction/${id}`;

    fetch(url, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          alert("Transaction deleted successfully!");
          fetchTransactions(); // Refresh the transactions list
        } else {
          alert("Failed to delete transaction");
        }
      })
      .catch((error) => {
        console.error("Error deleting transaction:", error);
        alert("Server error");
      });
  }


  // Calculate the current balance based on the transactions
  const balance = transactions.reduce((acc, transaction) => acc + transaction.price, 0);

  // Fetch transactions when the component mounts
  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <main>
      <h1>Money Tracker App</h1>
      <h2>
        Balance: ${balance.toFixed(2)}
      </h2>
      <form onSubmit={addNewTransaction}>
        <div className="basic">
          <input
            type="text"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="+200 new Samsung TV"
          />
          <input
            type="datetime-local"
            value={datetime}
            onChange={(ev) => setDatetime(ev.target.value)}
          />
        </div>
        <div className="description">
          <input
            type="text"
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            placeholder="Description"
          />
        </div>
        <button type="submit">Add new transaction</button>
      </form>

      <div className="transactions">
        {transactions.map((transaction) => (
          <div className="transaction" key={transaction._id}>
            <div className="left">
              <div className="name">{transaction.name}</div>
              <div className="description">{transaction.description}</div>
            </div>
            <div className="right">
              <div className={`price ${transaction.price < 0 ? "red" : ""}`}>
                {transaction.price < 0 ? `-$${Math.abs(transaction.price)}` : `+$${transaction.price}`}
              </div>
              <div className="datetime">{new Date(transaction.datetime).toLocaleString()}</div>
              <button onClick={() => updateTransaction(transaction._id, {
                name: prompt("Enter new name:", transaction.name),
                price: parseFloat(prompt("Enter new price:", transaction.price)),
                description: prompt("Enter new description:", transaction.description),
                datetime: prompt("Enter new datetime (YYYY-MM-DDTHH:MM):", transaction.datetime),
              })}>
                Edit
              </button>
              <button onClick={() => deleteTransaction(transaction._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
