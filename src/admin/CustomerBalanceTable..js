import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { FaFileExport } from "react-icons/fa";
import { URL } from "../App";
import { useNavigate } from "react-router-dom";

const CustomerBalanceTable = () => {
    const [balances, setBalances] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Handle transaction fetching for details
    const handleTransactionClick = (txn) => {
        if (txn.type === "Payment") {
            navigate(`/admin/payments/${txn._id}`);
        } else if (txn.type === "Invoice") {
            navigate(`/admin/invoices/${txn._id}`);
        }
    };

    // Fetching token from local storage
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCustomerBalances();
    }, []);

    const fetchCustomerBalances = async () => {
        try {
            const response = await axios.get(`${URL}/api/admin/customer-balances`);
            setBalances(response.data);
        } catch (error) {
            console.error("Error fetching customer balances:", error);
        }
    };

    const fetchTransactions = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`${URL}/api/admin/transactions/${id}`, {
                headers: { "x-access-token": token }
            });
            setTransactions(response.data);
            setSelectedCustomer(id);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(balances);
        XLSX.utils.book_append_sheet(wb, ws, "Customer Balances");
        XLSX.writeFile(wb, "customer_balances.xlsx");
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div className="container mx-auto">
                {/* Mobile-friendly flex layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer List */}
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-center lg:text-left">Customers</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border p-2 text-left">Student Name</th>
                                        <th className="border p-2 text-left">Outstanding</th>
                                        <th className="border p-2 text-left">Credit</th>
                                        <th className="border p-2 text-left">Total Owed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {balances.map((customer, index) => (
                                        <tr
                                            key={index}
                                            className={`cursor-pointer text-sm md:text-base ${
                                                selectedCustomer === customer.studentId
                                                    ? "bg-blue-500 text-white"
                                                    : "hover:bg-gray-100"
                                            }`}
                                            onClick={() => fetchTransactions(customer.studentId)}
                                        >
                                            <td className="border p-2">{customer.studentName}</td>
                                            <td className="border p-2">Tsh {Number(customer.outstandingBalance || 0).toLocaleString()}</td>
                                            <td className="border p-2">Tsh {Number(customer.creditBalance || 0).toLocaleString()}</td>
                                            <td className="border p-2 font-bold">Tsh {Number(customer.totalOwed || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={exportToExcel}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                        >
                            <FaFileExport /> Export to Excel
                        </button>
                    </div>

                    {/* Transactions Section */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-center lg:text-left">Transactions</h2>

                        {loading ? (
                            <p className="text-center text-gray-500">Loading transactions...</p>
                        ) : transactions.length > 0 ? (
                            <div>
                                {/* Student Info */}
                                {transactions[0]?.type === "StudentInfo" && (
                                    <div className="mb-4 p-3 bg-gray-100 rounded-md shadow-sm">
                                        <h2 className="text-lg font-semibold text-blue-600">
                                            {transactions[0].firstName} {transactions[0].lastName}
                                        </h2>
                                        <p className="text-gray-600">Reg No: <span className="font-medium">{transactions[0].regNo}</span></p>
                                    </div>
                                )}

                                {/* Transactions Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="p-2 text-left">Type</th>
                                                <th className="p-2 text-left">Date</th>
                                                <th className="p-2 text-left">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((txn, index) => (
                                                <tr key={index} className="border-b cursor-pointer hover:bg-gray-100" onClick={() => handleTransactionClick(txn)}>
                                                    <td className="p-2">{txn.type}</td>
                                                    <td className="p-2">{new Date(txn.date).toLocaleDateString()}</td>
                                                    <td className="p-2">Tsh {Number(txn.amount || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Select a customer to view transactions.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerBalanceTable;
