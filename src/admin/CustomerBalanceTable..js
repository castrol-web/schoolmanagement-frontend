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

    //handle transaction fetching for details
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
                headers: {
                    "x-access-token": token
                }
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
        <div className="flex p-4 gap-4 bg-gray-100">
            {/* Sidebar - Customer List */}
            <div className="bg-white p-4 rounded-lg shadow-lg overflow-auto">
                <h2 className="text-xl font-semibold mb-4">Customers</h2>
                <table className="table table-zebra w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-2">Student Name</th>
                            <th className="border p-2">Outstanding Balance</th>
                            <th className="border p-2">Credit Balance</th>
                            <th className="border p-2">Total Owed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {balances.map((customer, index) => (
                            <tr
                                key={index}
                                className={`cursor-pointer ${selectedCustomer === customer.studentId ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
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

                <button
                    onClick={exportToExcel}
                    className="btn btn-primary w-full mt-4 flex items-center gap-2 justify-center"
                >
                    <FaFileExport /> Export to Excel
                </button>
            </div>

            {/* Main Section - Transactions */}
            <div className="bg-white p-6 rounded-lg shadow-lg overflow-auto">
                <h2 className="text-xl font-semibold mb-4">Transactions</h2>

                {loading ? (
                    <p className="text-center text-gray-500">Loading transactions...</p>
                ) : transactions.length > 0 ? (
                    <div>
                        {/* Extract Student Info */}
                        {transactions[0].type === "StudentInfo" ?
                            <div className="mb-4 p-3 bg-gray-100 rounded-md shadow-sm">
                                <h2 className="text-lg font-semibold text-blue-600">
                                    {transactions[0].firstName} {transactions[0].lastName}
                                </h2>
                                <p className="text-gray-600">Registration No: <span className="font-medium">{transactions[0].regNo}</span></p>
                            </div>: null
                        }

                        {/* Transactions Table */}
                        <table className="table table-zebra w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 text-left">Transaction Type</th>
                                    <th className="p-2 text-left">Date</th>
                                    <th className="p-2 text-left">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((txn, index) => (
                                    <tr key={index} className="border-b" onClick={() => handleTransactionClick(txn)}>
                                        <td className="p-2">{txn.type}</td>
                                        <td className="p-2">{new Date(txn.date).toLocaleDateString()}</td>
                                        <td className="p-2">Tsh {Number(txn.amount || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Select a customer to view transactions.</p>
                )}
            </div>

        </div>
    );
};

export default CustomerBalanceTable;
