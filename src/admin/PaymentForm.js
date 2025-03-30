import { useState, useEffect } from "react";
import axios from "axios";
import useStudentStore from "../zustand/useStudentStore";
import { URL } from '../App';
import { toast } from "react-toastify";

const PaymentForm = () => {
    const token = localStorage.getItem('token');
    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");
    const currentDate = new Date().toISOString().split("T")[0];
    const [studentId, setStudentId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentDate, setPaymentDate] = useState(currentDate);
    const [loading, setLoading] = useState(false);

    const { fetchStudents, students } = useStudentStore();

    useEffect(() => {
        if (token) {
            fetchStudents(token);
        }
    }, [fetchStudents, token]);

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!studentId) return toast.warning("Please select a student first");
        if (amount <= 0 || isNaN(amount)) return toast.warning("Please enter a valid amount");
        if (!paymentMethod) return toast.warning("Please select a payment method");

        try {
            setLoading(true);
            const response = await axios.post(`${URL}/api/admin/payments`, {
                studentId, amount, reference, paymentMethod, paymentDate
            }, {
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                toast.success("Payment recorded successfully!");
                setAmount("");  
                setReference(""); 
                setStudentId(null);
                setPaymentMethod("");
                setPaymentDate(currentDate);
            } else {
                toast.error("Failed to process payment. Please try again.");
            }
        } catch (error) {
            console.error("Error processing payment:", error.response?.data || error);
            toast.error("Failed to record payment. Please try again.");
        } finally {
            setLoading(false);  
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Receive Payment</h2>
            <form onSubmit={handlePayment} className="space-y-4">
                <select 
                    name="studentId" 
                    value={studentId || ""} 
                    onChange={(e) => setStudentId(e.target.value)}
                    className="select select-bordered w-full" required>
                    <option value="">Select Student</option>
                    {students.map(student => (
                        <option key={student._id} value={student._id}>
                            {student.firstName} {student.lastName}
                        </option>
                    ))}
                </select>

                <input 
                    type="number" 
                    placeholder="Enter Amount" 
                    className="input input-bordered w-full"
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    required 
                />

                <input 
                    type="text" 
                    placeholder="Receipt Reference (if applicable)" 
                    className="input input-bordered w-full"
                    value={reference} 
                    onChange={(e) => setReference(e.target.value)} 
                />

                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Payment Date</label>
                    <input 
                        name="paymentDate" 
                        type="date" 
                        value={paymentDate} 
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="input input-bordered w-full" 
                    />
                </div>

                <select 
                    name="paymentMethod" 
                    className="select select-bordered w-full"
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    required>
                    <option value="">Select Payment Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit">Credit</option>
                    <option value="Mobile Money">Mobile Money</option>
                </select>

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                    {loading ? 'Processing...' : "Process Payment"}
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;
