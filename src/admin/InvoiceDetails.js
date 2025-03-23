import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../App";
import { toast } from "react-toastify";

const InvoiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await axios.get(`${URL}/api/admin/invoices/${id}`, {
                    headers: { "x-access-token": token },
                });
                setInvoice(response.data);
            } catch (error) {
                toast.error("Error fetching invoice details");
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [id, token]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
            try {
                await axios.delete(`${URL}/api/admin/invoices/${id}`, {
                    headers: { "x-access-token": token },
                });
                toast.success("Invoice deleted successfully");
                navigate(-1); // Go back to the previous page
            } catch (error) {
                toast.error("Error deleting invoice");
            }
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
            <p>Class: {invoice.classId}</p>
            <p>Year: {invoice.year}</p>
            <p>Term: {invoice.term}</p>

            <h3 className="font-semibold mt-4">Items:</h3>
            <ul>
                {invoice.items.map((item, index) => (
                    <li key={index}>{item.description} - ${item.amount}</li>
                ))}
            </ul>

            <div className="mt-4 flex space-x-4">
                <button onClick={() => navigate(`admin/invoice/edit/${id}`)} className="bg-blue-500 text-white p-2 rounded">Edit</button>
                <button onClick={handleDelete} className="bg-red-500 text-white p-2 rounded">Delete</button>
            </div>
        </div>
    );
};

export default InvoiceDetails;
