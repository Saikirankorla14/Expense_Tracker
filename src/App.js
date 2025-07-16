import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { FaTrash, FaPlus } from "react-icons/fa";
import { format, parseISO } from "date-fns";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Food");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");

  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(savedExpenses);
  }, []);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (e) => {
    e.preventDefault();
    if (!title || !amount || !date) return;

    const newExpense = {
      id: Date.now(),
      title,
      amount: +amount,
      date,
      category,
    };

    setExpenses([...expenses, newExpense]);
    setTitle("");
    setAmount("");
    setDate("");
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory =
      filterCategory === "All" || expense.category === filterCategory;
    const expenseMonth = format(parseISO(expense.date), "yyyy-MM");
    const matchesMonth = filterMonth === "All" || expenseMonth === filterMonth;
    return matchesCategory && matchesMonth;
  });

  const categories = ["Food", "Transport", "Entertainment", "Bills", "Other"];

  const monthLabels = [
    ...new Set(expenses.map((exp) => format(parseISO(exp.date), "MMM yyyy"))),
  ];

  const categoryData = {
    labels: categories,
    datasets: [
      {
        label: "Expenses by Category",
        data: categories.map((cat) =>
          filteredExpenses.reduce(
            (sum, exp) => (exp.category === cat ? sum + exp.amount : sum),
            0
          )
        ),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  const monthlyData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Total Expenses ($)",
        data: monthLabels.map((month) =>
          expenses.reduce(
            (sum, exp) =>
              format(parseISO(exp.date), "MMM yyyy") === month
                ? sum + exp.amount
                : sum,
            0
          )
        ),
        backgroundColor: "#4BC0C0",
      },
    ],
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Expense Tracker</h1>

      {/* Add Expense Form */}
      <form onSubmit={addExpense} className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Amount ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded flex items-center gap-2"
        >
          <FaPlus /> Add Expense
        </button>
      </form>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All Months</option>
          {[
            ...new Set(
              expenses.map((exp) => format(parseISO(exp.date), "yyyy-MM"))
            ),
          ].map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          <Pie data={categoryData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Monthly Spending</h2>
          <Bar data={monthlyData} />
        </div>
      </div>

      {/* Expense List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Expenses</h2>
        {filteredExpenses.length === 0 ? (
          <p className="text-gray-500">No expenses found.</p>
        ) : (
          <ul className="space-y-2">
            {filteredExpenses.map((expense) => (
              <li
                key={expense.id}
                className="flex justify-between items-center p-3 bg-white rounded shadow"
              >
                <div>
                  <span className="font-semibold">{expense.title}</span>
                  <span className="text-gray-500 ml-2">
                    ({expense.category})
                  </span>
                  <div className="text-sm text-gray-500">
                    {format(parseISO(expense.date), "MMM dd, yyyy")}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">${expense.amount}</span>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
