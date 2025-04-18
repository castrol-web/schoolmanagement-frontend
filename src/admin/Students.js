import React, { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { URL } from '../App';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaEdit, FaTrashAlt, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { FadeLoader } from 'react-spinners';
import { css } from '@emotion/react';
import useStudentStore from '../zustand/useStudentStore';



function Students() {
  //getting token
  const token = localStorage.getItem('token');
  //form reference
  const formRef = useRef();
  const navigate = useNavigate();
  const { data, students, Loading, fetchStudents } = useStudentStore();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newStudent, SetNewStudent] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    currentClass: '',
    gender: '',
    age: '',
    role: 'student',
  });


  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    SetNewStudent((prevStudent) => ({
      ...prevStudent,
      [name]: value,
    }));
  };


  //fetch classes and students when the component mounts
  useEffect(() => {
    async function getClasses() {
      try {
        setLoading(true);
        const response = await axios.get(`${URL}/api/admin/get-classes`, {
          method: 'GET',
          headers: {
            'x-access-token': token,
          },
        });
        if (response.status === 201) {
          setClasses(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    //fetching students
    if (token) {
      fetchStudents(token);
      getClasses();
    }
  }, [token, fetchStudents]);

  // Filter students based on selected class
  const filteredStudents = selectedClass
    ? students.filter((student) => student.currentClass === selectedClass)
    : students;

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Pagination Handlers
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  //function to add a student
  const addStudent = async (e) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append('firstName', newStudent.firstName);
    formdata.append('lastName', newStudent.lastName);
    formdata.append('middleName', newStudent.middleName);
    formdata.append('currentClass', newStudent.currentClass);
    formdata.append('gender', newStudent.gender);
    formdata.append('age', newStudent.age);
    formdata.append('role', newStudent.role);
    try {
      if (!token) {
        navigate('/admin/login');
      }
      setLoading(true);
      const response = await axios.post(`${URL}/api/admin/register-student`, formdata, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
      });
      if (response.status === 201) {
        toast.success(response.data.message);
        SetNewStudent({
          firstName: '',
          lastName: '',
          middleName: '',
          currentClass: 'Class 1',
          gender: '',
          age: '',
        });
        setShowForm(false);
        fetchStudents(token);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized please login and try again');
        navigate('/admin/login');
      } else {
        toast.error('An error occurred, please try again!');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  //delete student function 
  async function DeleteStudent(studentId) {
    // Show a confirmation dialog before proceeding with deletion
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");

    // If the user cancels, exit the function early
    if (!confirmDelete) return;
    try {
      setLoading(true)
      const response = await axios.delete(`${URL}/api/admin/delete-student/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
      })
      if (response.status === 200) {
        toast.success(response.data.message)
        fetchStudents(token)
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error(`an error occured,${error}`)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    const exportData = filteredStudents.map((student, index) => {
      const studentClass = data.find(cls => cls._id === student.currentClass)?.className || 'N/A';
      return {
        No: index + 1,
        FirstName: student.firstName,
        LastName: student.lastName,
        MiddleName: student.middleName || '',
        Class: studentClass,
        Gender: student.gender || '',
        Age: student.age || '',
        RegNo: student.regNo || '',
        Balance: student.balance || 0,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
        Student Management
      </h2>
      {!showForm ? (
        <>
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
            >
              + Add Student
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
            >
              Export to Excel
            </button>

            {/* Class Filter Dropdown */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="py-3 text-left px-3">No.</th>
                  <th className="py-3 px-6 text-left">First Name</th>
                  <th className="py-3 px-6 text-left">Last Name</th>
                  <th className="py-3 px-6 text-left">Current Class</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              {loading ? (
                <tbody className="items-center justify-center text-center mt-6 mx-auto">
                  <tr>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className="text-center py-5">
                      <FadeLoader
                        color={'#36d7b7'}
                        css={override}
                        size={100}
                        className="mx-auto"
                      />
                      <p className="text-center">Loading...</p>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {currentStudents.length > 0 ? currentStudents.map((student, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 hover:bg-gray-100 transition duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                    >
                      <td className="py-3 px-6">{indexOfFirstStudent + index + 1}</td>
                      <td className="py-3 px-6">{student.firstName}</td>
                      <td className="py-3 px-6">{student.lastName}</td>
                      <td className="py-3 px-6">
                        {data.find((cls) => cls._id === student.currentClass)?.className || 'N/A'}
                      </td>
                      <td className="py-3 px-6 flex justify-center space-x-2">
                        <button className="text-blue-500 hover:text-blue-700">
                          <FaEye />
                        </button>
                        <button className="text-green-500 hover:text-green-700">
                          <FaEdit />
                        </button>
                        <button className="text-red-500 hover:text-red-700" type='button' onClick={() => DeleteStudent(student._id)}>
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  )) : <tr className='mx-auto items-center justify-center text-center'>
                    <td className='text-center'></td>
                    <td className='text-center'></td>
                    <td className='text-center lg:py-9 py-5'>no student added yet</td>
                  </tr>}
                </tbody>
              )}
            </table>

            {/* Pagination Controls */}
            <div className="flex items-center mt-4 justify-center gap-5">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`text-blue-500 hover:text-blue-700 px-3 py-1 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                <FaChevronLeft />
              </button>
              <span className="text-lg font-bold">{currentPage} / {totalPages}</span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`text-blue-500 hover:text-blue-700 px-3 py-1 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-4">
          <form
            onSubmit={addStudent}
            className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg space-y-4 sm:space-y-6"
            encType="multipart/form-data"
            action="/register-student"
            method="post"
            ref={formRef}
          >
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">New Student</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-gray-700 font-semibold">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={newStudent.firstName}
                  onChange={handleStudentChange}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={newStudent.lastName}
                  onChange={handleStudentChange}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={newStudent.middleName}
                  onChange={handleStudentChange}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold">Gender</label>
                <select
                  name="gender"
                  value={newStudent.gender}
                  onChange={handleStudentChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold">Age</label>
                <input
                  type="number"
                  name="age"
                  value={newStudent.age}
                  onChange={handleStudentChange}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-semibold">Class</label>
                <select
                  name="currentClass"
                  value={newStudent.currentClass}
                  onChange={handleStudentChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls, index) => (
                    <option key={index} value={cls._id}>
                      {cls.className}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loader overlay */}
      {(loading || Loading) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <FadeLoader color={'#36d7b7'} size={100} />
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

// CSS override for the loading spinner
const override = css`
  display: block;
  margin: 0 auto;
`;

export default Students;
