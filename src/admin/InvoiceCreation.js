import React, { useEffect, useRef, useState } from 'react';
import { URL } from '../App';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useStudentStore from '../zustand/useStudentStore';
import useClassesStore from '../zustand/useClassesStore';
import CustomerBalanceTable from './CustomerBalanceTable.';

function InvoiceCreation() {
    const formRef = useRef();
    const token = localStorage.getItem('token');
    const currentYear = new Date().getFullYear();
    const currentDate = new Date().toISOString().split("T")[0]; // Default date as today
    const { students, fetchStudents } = useStudentStore();
    const { classes, fetchClasses } = useClassesStore();
    const [mode, setMode] = useState('individual');
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState({
        studentId: '',
        classId: '',
        term: '',
        issuedDate: currentDate, // New field for invoice date
        year: currentYear,
        items: [], // Items array to hold different fee categories
    });

    // Fetch students and classes on mount
    useEffect(() => {
        fetchStudents(token);
        fetchClasses(token);
    }, [token, fetchStudents, fetchClasses]);

    const terms = ['1', '2', '3'];

    // Handle adding fee item (e.g., school fees, transport, etc.)
    const addFeeItem = () => {
        setInvoice({
            ...invoice,
            items: [...invoice.items, { description: '', amount: '' }]
        });
    };

    // Handle removing a fee item
    const removeFeeItem = (index) => {
        const updatedItems = invoice.items.filter((_, i) => i !== index);
        setInvoice({
            ...invoice,
            items: updatedItems,
        });
    };

    // Handle fee item changes
    const handleFeeChange = (index, e) => {
        const updatedItems = invoice.items.map((item, i) => {
            if (i === index) {
                return { ...item, [e.target.name]: e.target.value };
            }
            return item;
        });
        setInvoice({ ...invoice, items: updatedItems });
    };

    // Submit invoice
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'individual') {
                // Submit for individual student
                const response = await axios.post(`${URL}/api/admin/generate-invoice`, invoice, {
                    headers: { 'x-access-token': token },
                });
                if (response.status === 201) {
                    toast.success(response.data.message);
                    resetForm();
                }
            } else if (mode === 'class') {
                // Submit for whole class (similar structure)
                const response = await axios.post(`${URL}/api/admin/generate-class-invoice`, invoice, {
                    headers: { 'x-access-token': token },
                });
                if (response.status === 201) {
                    toast.success(response.data.message);
                    resetForm();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred. Please try again!');
        } finally {
            setLoading(false);
        }
    }

    // Reset form
    const resetForm = () => {
        setInvoice({
            studentId: '',
            classId: '',
            term: '',
            issuedDate: currentDate, // New field for invoice date
            year: currentYear,
            items: [],
        });
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg space-y-4 sm:space-y-6" ref={formRef}>
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">New Invoice</h2>

                {/* Mode selection */}
                <div className="flex justify-center space-x-4 mb-4">
                    <button type="button" className={`py-2 px-4 rounded ${mode === 'individual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setMode('individual')}>Individual Student</button>
                    <button type="button" className={`py-2 px-4 rounded ${mode === 'class' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setMode('class')}>Whole Class</button>
                </div>

                {/* Student/Class Selection */}
                {mode === 'individual' ? (
                    <div>
                        <label className="block text-gray-700 font-semibold">Student Name</label>
                        <select
                            name="studentId"
                            value={invoice.studentId}
                            onChange={(e) => setInvoice({ ...invoice, studentId: e.target.value })}
                            className="border p-2 rounded w-full"
                        >
                            <option value="">Select Student</option>
                            {students.map((student) => (
                                <option value={student._id} key={student._id}>{student.firstName}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="block text-gray-700 font-semibold">Class</label>
                        <select
                            name="classId"
                            value={invoice.classId}
                            onChange={(e) => setInvoice({ ...invoice, classId: e.target.value })}
                            className="border p-2 rounded w-full"
                        >
                            <option value="">Select Class</option>
                            {classes.map((classItem) => (
                                <option value={classItem._id} key={classItem._id}>{classItem.className}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Term Selection */}
                <div>
                    <label className="block text-gray-700 font-semibold">Term</label>
                    <select
                        name="term"
                        value={invoice.term}
                        onChange={(e) => setInvoice({ ...invoice, term: e.target.value })}
                        className="border p-2 rounded w-full"
                    >
                        <option value="">Select Term</option>
                        {terms.map((term) => (
                            <option key={term} value={term}>{term}</option>
                        ))}
                    </select>
                </div>

                {/* Fee Items */}
                <div>
                    <label className="block text-gray-700 font-semibold">Fee Breakdown</label>
                    {invoice.items.map((item, index) => (
                        <div key={index} className="flex gap-4">
                            <input
                                type="text"
                                name="description"
                                value={item.description}
                                onChange={(e) => handleFeeChange(index, e)}
                                placeholder="Fee Description"
                                className="border p-2 rounded w-full"
                            />
                            <input
                                type="number"
                                name="amount"
                                value={item.amount}
                                onChange={(e) => handleFeeChange(index, e)}
                                placeholder="Amount"
                                className="border p-2 rounded w-full"
                            />
                            <button
                                type="button"
                                onClick={() => removeFeeItem(index)}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addFeeItem}
                        className="bg-green-500 text-white p-2 rounded"
                    >
                        Add Fee Item
                    </button>
                </div>

                {/* Invoice Date Selection */}
                <div>
                    <label className="block text-gray-700 font-semibold">Invoice Date</label>
                    <input type="date" value={invoice.issuedDate} onChange={(e) => setInvoice({ ...invoice, issuedDate: e.target.value })} className="border p-2 rounded w-full" />
                </div>

                <button
                    type="submit"
                    className={`py-2 px-4 rounded w-full ${loading ? 'bg-gray-500' : 'bg-blue-600'}`}
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Invoice'}
                </button>
            </form>
            <CustomerBalanceTable />
            <ToastContainer />
        </div>
    );
}

export default InvoiceCreation;

