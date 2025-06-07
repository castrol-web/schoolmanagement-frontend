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
        navigate(-1);
      } catch (error) {
        toast.error("Error deleting invoice");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!invoice) return <p>No invoice data available.</p>;

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg text-gray-800">
      <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>

      <div className="space-y-2">
        <p><strong>Class:</strong> {invoice.classId || "N/A"}</p>
        <p><strong>Year:</strong> {invoice.year}</p>
        <p><strong>Term:</strong> {invoice.term}</p>
        <p><strong>Total Fees:</strong> Tsh{invoice.totalFees.toFixed(2)}</p>
        <p><strong>Outstanding Balance:</strong> Tsh{invoice.outstandingBalance.toFixed(2)}</p>
        <p><strong>Status:</strong> {invoice.status}</p>
        <p><strong>Issued Date:</strong> {new Date(invoice.issuedDate).toLocaleDateString()}</p>
      </div>

      <h3 className="font-semibold mt-6 mb-2">Invoice Items:</h3>
      {invoice.items?.length > 0 ? (
        <ul className="list-disc pl-5 space-y-1">
          {invoice.items.map((item, index) => (
            <li key={index}>
              {item.name} - <span className="text-blue-600 font-semibold">Tsh{item.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No items listed on this invoice.</p>
      )}

      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => navigate(`/admin/invoice/edit/${id}`)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetails;
