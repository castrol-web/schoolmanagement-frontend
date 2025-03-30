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
    const [deleting, setDeleting] = useState(false);

    // Fetch payment details and total paid amount
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

    // Handle payment deletion
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this payment?")) return;

        setDeleting(true);
        try {
            const response = await axios.delete(`${URL}/api/admin/payments/${id}`, {
                headers: { "x-access-token": token },
            });

            toast.success(response.data.message || "Payment deleted successfully");
            navigate(-1); // Go back to the previous page
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Error deleting payment";
            toast.error(errorMsg);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <p className="text-center">Loading payment details...</p>;

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <p><strong>Student ID:</strong> {payment.studentId}</p>
            <p><strong>Amount:</strong> Tsh {Number(payment.amount).toLocaleString()}</p>
            <p><strong>Reference:</strong> {payment.reference || "N/A"}</p>
            <p><strong>Method:</strong> {payment.paymentMethod}</p>
            <p><strong>Date:</strong> {new Date(payment.paymentDate).toLocaleString()}</p>

            <div className="mt-4 flex space-x-4">
                <button 
                    onClick={() => navigate(`/admin/payment/edit/${id}`)} 
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                >
                    Edit
                </button>
                <button 
                    onClick={handleDelete} 
                    className={`bg-red-500 text-white px-4 py-2 rounded shadow transition ${deleting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
                    disabled={deleting}
                >
                    {deleting ? "Deleting..." : "Delete"}
                </button>
            </div>
        </div>
    );
};

export default PaymentDetails;
