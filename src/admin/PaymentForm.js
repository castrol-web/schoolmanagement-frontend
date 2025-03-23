import { useState, useEffect } from "react";
import axios from "axios";
import useStudentStore from "../zustand/useStudentStore";
import { URL } from '../App';
import { toast } from "react-toastify";
import { io } from "socket.io-client";
const url = "http://localhost:8050";
const socket = io(`${url}`);

const PaymentForm = () => {
    const token = localStorage.getItem('token');
    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");
    const currentDate = new Date().toISOString().split("T")[0]; // Default date as today
    const [studentId, setStudentId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentDate, setPaymentDate] = useState(currentDate);
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);

    //students fetched object from zustand
    const { fetchStudents, students } = useStudentStore();
    //fetching all users payments
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(`${URL}/api/payments`, {
                    headers: { 'x-access-token': token }
                });
                setPayments(response.data);
            } catch (error) {
                console.error("Error fetching payments:", error);
            }
        };

        if (token) {
            fetchStudents(token);
            fetchPayments();
        }
    }, [fetchStudents, token]);


    useEffect(() => {
        socket.on("paymentReceived", (data) => {
            setPayments((prev) => [data, ...prev]);
        });

        return () => {
            socket.off("paymentReceived");
        };
    }, []);

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!studentId) return toast.warning("Please select a student first");
        if (amount <= 0 || isNaN(amount)) return toast.warning("Please enter a valid amount");
        if (!paymentMethod) return toast.warning("Please select a payment method");

        try {
            setLoading(true);
            const response = await axios.post(`${URL}/api/admin/payments`, {
                studentId, amount, reference, paymentMethod,paymentDate
            }, {
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                toast.success("Payment recorded successfully");
                setAmount("");
                setReference("");
                setStudentId(null);
                setPaymentMethod("");
                setPaymentDate(currentDate)
            }
        } catch (error) {
            console.error("Error processing payment:", error.response?.data || error);
            toast.error("Failed to record payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Receive Payment</h2>
            <form onSubmit={handlePayment} className="space-y-4">
                <select name="studentId" onChange={(e) => setStudentId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg" required>
                    <option value="">Select Student</option>
                    {students.map(student => (
                        <option key={student._id} value={student._id}>{student.firstName} {student.lastName}</option>
                    ))}
                </select>
                <input type="number" placeholder="Enter Amount" className="input input-bordered w-full"
                    value={amount} onChange={(e) => setAmount(e.target.value)} required />
                <input type="text" placeholder="Receipt Reference (if applicable)" className="input input-bordered w-full"
                    value={reference} onChange={(e) => setReference(e.target.value)} />
                {/* Payment Date Selection */}
                <div>
                    <label className="block text-gray-700 font-semibold">Payment Date</label>
                    <input name="paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="border p-2 rounded w-full" />
                </div>
                <select name="paymentMethod" className="w-full p-2 border border-gray-300 rounded-lg"
                    value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
                    <option value="">Select Payment Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit">Credit</option>
                    <option value="Mobile Money">Mobile Money</option>
                </select>
                <button type="submit" className="btn btn-primary w-full">{loading ? 'Processing...' : "Process Payment"}</button>
            </form>

            <h2 className="text-lg font-semibold mt-6">Recent Payments</h2>
            <ul className="divide-y divide-gray-200">
                {payments.map((payment) => {
                    const student = students.find(s => s._id === payment.studentId);
                    return (
                        <li key={payment._id} className="py-2">
                            <strong>{student ? `${student.firstName} ${student.lastName}` : "Unknown Student"}</strong>
                            paid <strong>${payment.amount}</strong> via {payment.paymentMethod}
                            <span className="text-sm text-gray-500 ml-2">({new Date(payment.date).toLocaleString()})</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PaymentForm;
