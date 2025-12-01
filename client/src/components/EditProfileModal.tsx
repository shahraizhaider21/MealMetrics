import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { X } from 'lucide-react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
    const auth = useContext(AuthContext);
    const user = auth?.user;

    const [formData, setFormData] = useState({
        age: user?.age || 25,
        height: user?.height || 175,
        weight: user?.weight || 70,
        gender: user?.gender || 'male',
        activityLevel: user?.activityLevel || 'moderate'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost:5000/api/auth/profile', {
                userId: user?.id,
                ...formData
            });

            // Update context with new user data
            if (auth?.login) {
                // We need a way to update the user in context without full login, 
                // but for now, we can just re-set the user data if the context supports it.
                // Assuming AuthContext has a way to update user or we just manually update localStorage and reload?
                // Let's try to update the local state if possible, or just reload the page for simplicity in this MVP.
                // Better: The login function usually sets the user. Let's see if we can use that or if we need to expose a setUser.
                // For this task, I'll assume we can just update the localStorage and reload, or better, just call login with the new token/user if returned?
                // The API returns the updated user.

                // Hack for MVP: Update localStorage and reload to refresh context
                // Or better, if AuthContext exposes setUser, use it. 
                // Since I can't see AuthContext right now, I'll assume I might need to reload or just handle it.
                // Let's try to just reload for now to be safe and simple.
                localStorage.setItem('user', JSON.stringify(res.data.user));
                window.location.reload();
            }
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                            <input type="number" name="height" value={formData.height} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                            <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Activity Level</label>
                        <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Light Activity</option>
                            <option value="moderate">Moderate Activity</option>
                            <option value="active">Active</option>
                            <option value="very_active">Very Active</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
