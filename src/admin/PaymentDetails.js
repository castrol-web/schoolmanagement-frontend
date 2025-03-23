import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../App";
import { toast } from "react-toastify";

const PaymentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const response = await axios.get(`${URL}/api/admin/payments/${id}`, {
                    headers: { "x-access-token": token },
                });
                setPayment(response.data);
            } catch (error) {
                toast.error("Error fetching payment details");
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [id, token]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this payment?")) {
            try {
                await axios.delete(`${URL}/api/admin/payments/${id}`, {
                    headers: { "x-access-token": token },
                });
                toast.success("Payment deleted successfully");
                navigate(-1); // Go back to the previous page
            } catch (error) {
                toast.error("Error deleting payment");
            }
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <p>Student ID: {payment.studentId}</p>
            <p>Amount: ${payment.amount}</p>
            <p>Reference: {payment.reference}</p>
            <p>Method: {payment.paymentMethod}</p>
            <p>Date: {new Date(payment.date).toLocaleString()}</p>

            <div className="mt-4 flex space-x-4">
                <button onClick={() => navigate(`/admin/payment/edit/${id}`)} className="bg-blue-500 text-white p-2 rounded">Edit</button>
                <button onClick={handleDelete} className="bg-red-500 text-white p-2 rounded">Delete</button>
            </div>
        </div>
    );
};

export default PaymentDetails;
