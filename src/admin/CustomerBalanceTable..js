import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { FaFileExport } from "react-icons/fa";
import { URL } from "../App";
import { useNavigate } from "react-router-dom";
import schoologo from "../images/schoologo.png";
import { motion, AnimatePresence } from "framer-motion";

const CustomerBalanceTable = () => {
    const [balances, setBalances] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCustomerInfo, setSelectedCustomerInfo] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

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

    const fetchTransactions = async (customer) => {
        setLoading(true);
        try {
            const response = await axios.get(`${URL}/api/admin/transactions/${customer.studentId}`, {
                headers: { "x-access-token": token }
            });
            setTransactions(response.data);
            setSelectedCustomer(customer.studentId);
            setSelectedCustomerInfo(customer);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransactionClick = (txn) => {
        if (txn.type === "Payment") {
            navigate(`/admin/payments/${txn._id}`);
        } else if (txn.type === "Invoice") {
            navigate(`/admin/invoices/${txn._id}`);
        }
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(balances);
        XLSX.utils.book_append_sheet(wb, ws, "Customer Balances");
        XLSX.writeFile(wb, "customer_balances.xlsx");
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="container mx-auto text-center mb-6">
                <img src={schoologo} alt="school logo" className="mx-auto mb-4 w-32 h-32" />
                <h1 className="text-2xl font-bold text-blue-800">
                    MIKONO SALAMA DAYCARE AND JUNIOR SCHOOL CUSTOMER BALANCES
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">Customers</h2>
                    <div className="overflow-x-auto items-center justify-center mx-auto">
                        <table className="w-full border-collapse text-gray-800">
                            <thead>
                                <tr className="bg-blue-600 text-white text-left">
                                    <th className="border p-3">Student Name</th>
                                    <th className="border p-3">Outstanding</th>
                                    <th className="border p-3">Credit</th>
                                    <th className="border p-3">Total Owed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {balances.map((customer, index) => (
                                    <tr
                                        key={index}
                                        className={`cursor-pointer text-sm md:text-base transition-all duration-200 ${
                                            selectedCustomer === customer.studentId
                                                ? "bg-blue-500 text-white"
                                                : "hover:bg-gray-100"
                                        }`}
                                        onClick={() => fetchTransactions(customer)}
                                    >
                                        <td className="border p-3">{customer.firstName} {customer.lastName}</td>
                                        <td className="border p-3">
                                            Tsh {Number(customer.outstandingBalance || 0).toLocaleString()}
                                        </td>
                                        <td className="border p-3">
                                            Tsh {Number(customer.creditBalance || 0).toLocaleString()}
                                        </td>
                                        <td className="border p-3 font-bold">
                                            Tsh {Number(customer.totalOwed || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={exportToExcel}
                        className="mx-auto mt-4 flex items-center justify-center gap-2 py-2 px-16 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        <FaFileExport /> Export to Excel
                    </button>
                </div>
            </div>

            {/* Animated Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg relative overflow-y-auto max-h-[90vh]"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-2 right-3 text-2xl text-red-500 hover:text-red-700 font-bold"
                            >
                                &times;
                            </button>

                            {selectedCustomerInfo && (
                                <div className="mb-4 p-4 bg-gray-100 rounded">
                                    <h2 className="text-xl font-bold text-blue-600">
                                        {selectedCustomerInfo.firstName} {selectedCustomerInfo.lastName}
                                    </h2>
                                    <p className="text-gray-700">
                                        Reg No: <span className="font-medium">{selectedCustomerInfo.regNo}</span>
                                    </p>
                                </div>
                            )}

                            {loading ? (
                                <p className="text-center text-gray-500">Loading transactions...</p>
                            ) : transactions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-gray-800">
                                        <thead>
                                            <tr className="bg-blue-600 text-white">
                                                <th className="p-3 text-left">Type</th>
                                                <th className="p-3 text-left">Date</th>
                                                <th className="p-3 text-left">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((txn, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-b cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleTransactionClick(txn)}
                                                >
                                                    <td className="p-3">{txn.type}</td>
                                                    <td className="p-3">
                                                        {new Date(txn.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3">
                                                        Tsh {Number(txn.amount || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No transactions found.</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerBalanceTable;
