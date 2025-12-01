import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        budgetLimit: 0,
        age: 25,
        height: 175,
        weight: 70,
        gender: 'male',
        activityLevel: 'moderate'
    });
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md mb-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-2">Username</label>
                    <input
                        type="text"
                        name="username"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        name="password"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2">Weekly Budget Limit ($)</label>
                    <input
                        type="number"
                        name="budgetLimit"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.budgetLimit}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Age</label>
                        <input
                            type="number"
                            name="age"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.age}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Gender</label>
                        <select
                            name="gender"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Height (cm)</label>
                        <input
                            type="number"
                            name="height"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.height}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Weight (kg)</label>
                        <input
                            type="number"
                            name="weight"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.weight}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Activity Level</label>
                    <select
                        name="activityLevel"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.activityLevel}
                        onChange={handleChange}
                    >
                        <option value="sedentary">Sedentary</option>
                        <option value="light">Light Activity</option>
                        <option value="moderate">Moderate Activity</option>
                        <option value="active">Active</option>
                        <option value="very_active">Very Active</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
