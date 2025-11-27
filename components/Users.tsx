import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import * as api from '../data/api';
import EmptyState from './EmptyState';
import { DeleteIcon, UserIcon, PlusIcon, EditIcon } from './icons/Icons';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Modal State
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', role: 'staff' as const });
  
  // Edit Modal State
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editPassword, setEditPassword] = useState(''); // Separate state for password change
  
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Add User Handlers ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input Validation
    if (newUser.username.length < 3) {
        setError("Username must be at least 3 characters long.");
        return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(newUser.username)) {
        setError("Username can only contain letters, numbers, and underscores.");
        return;
    }
    if (newUser.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    if (newUser.fullName.trim() === '') {
        setError("Full Name is required.");
        return;
    }

    try {
      const created = await api.addUser(newUser);
      setUsers([...users, created]);
      setAddModalOpen(false);
      setNewUser({ username: '', password: '', fullName: '', role: 'staff' });
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  // --- Edit User Handlers ---
  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setEditPassword(''); // Reset password field
    setError('');
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    setError('');

    // Input Validation
    if (userToEdit.username.length < 3) {
        setError("Username must be at least 3 characters long.");
        return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(userToEdit.username)) {
        setError("Username can only contain letters, numbers, and underscores.");
        return;
    }
    if (userToEdit.fullName.trim() === '') {
        setError("Full Name is required.");
        return;
    }
    if (editPassword && editPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
    }

    try {
      // Construct updated user object. Include password only if user typed something.
      const updatedUserPayload = {
        ...userToEdit,
        password: editPassword || undefined // If empty string, send undefined so API knows to ignore
      };

      const updated = await api.updateUser(updatedUserPayload);
      
      setUsers(users.map(u => u.id === updated.id ? updated : u));
      setEditModalOpen(false);
      setUserToEdit(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">User Management</h2>
            <button 
                className="bg-psu-maroon text-white px-4 py-2 rounded-lg hover:bg-psu-maroon/90 font-semibold transition-colors flex items-center justify-center shadow-sm hover:shadow-md"
                onClick={() => setAddModalOpen(true)}
            >
            <PlusIcon className="mr-2" />
            Add User
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-100 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-4 rounded-l-lg">Full Name</th>
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {users.length > 0 ? users.map(user => (
                        <tr key={user.id} className="border-b border-slate-200 even:bg-slate-50 hover:bg-psu-gold/10">
                            <td className="py-3 px-4 font-medium flex items-center">
                                <div className="bg-slate-200 rounded-full p-1 mr-3">
                                    <UserIcon className="w-4 h-4 text-slate-500"/>
                                </div>
                                {user.fullName}
                            </td>
                            <td className="py-3 px-4 text-slate-600">{user.username}</td>
                            <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button 
                                      onClick={() => openEditModal(user)}
                                      className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                      title="Edit User"
                                  >
                                      <EditIcon />
                                  </button>
                                  {user.username !== 'admin' && (
                                      <button 
                                          onClick={() => handleDeleteUser(user.id)}
                                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                          title="Delete User"
                                      >
                                          <DeleteIcon />
                                      </button>
                                  )}
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4}>
                                <EmptyState title="No Users" message="No users found." />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-scale">
                <h3 className="text-xl font-bold mb-4 text-slate-800">Add New User</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input 
                            type="text" 
                            required 
                            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-psu-maroon/80 outline-none"
                            value={newUser.fullName}
                            onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Username</label>
                        <input 
                            type="text" 
                            required 
                            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-psu-maroon/80 outline-none"
                            value={newUser.username}
                            onChange={e => setNewUser({...newUser, username: e.target.value})}
                            placeholder="Alphanumeric, min 3 chars"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input 
                            type="password" 
                            required 
                            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-psu-maroon/80 outline-none"
                            value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                            placeholder="Min 6 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Role</label>
                        <select 
                            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-psu-maroon/80 outline-none"
                            value={newUser.role}
                            onChange={(e: any) => setNewUser({...newUser, role: e.target.value})}
                        >
                            <option value="staff">Staff (Stock & Sales Only)</option>
                            <option value="admin">Admin (Full Access)</option>
                        </select>
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 text-red-600 p-2 rounded text-sm border border-red-200">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button"
                            onClick={() => setAddModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-psu-maroon text-white rounded-lg hover:bg-psu-maroon/90"
                        >
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && userToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-scale">
                <h3 className="text-xl font-bold mb-4 text-slate-800">Edit User</h3>
                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input 
                            type="text" 
                            required 
                            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-psu-maroon/80 outline-none"
                            value={userToEdit.fullName}
                            onChange={e => setUserToEdit({...userToEdit, fullName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Username</label>
                        <input 
                            type="text" 
                            required 
                            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-psu-maroon/80 outline-none"
                            value={userToEdit.username}
                            onChange={e => setUserToEdit({...userToEdit, username: e.target.value})}
                            // Disable editing username for the main admin to prevent lockout
                            disabled={userToEdit.username === 'admin'} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Password 
                          <span className="text-xs font-normal text-slate-500 ml-1">(Leave blank to keep current)</span>
                        </label>
                        <input 
                            type="password" 
                            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-psu-maroon/80 outline-none"
                            value={editPassword}
                            onChange={e => setEditPassword(e.target.value)}
                            placeholder="New password (min 6 chars)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Role</label>
                        <select 
                            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-psu-maroon/80 outline-none"
                            value={userToEdit.role}
                            onChange={(e: any) => setUserToEdit({...userToEdit, role: e.target.value})}
                            // Prevent demoting the main admin
                            disabled={userToEdit.username === 'admin'} 
                        >
                            <option value="staff">Staff (Stock & Sales Only)</option>
                            <option value="admin">Admin (Full Access)</option>
                        </select>
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 text-red-600 p-2 rounded text-sm border border-red-200">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button"
                            onClick={() => { setEditModalOpen(false); setUserToEdit(null); }}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-psu-maroon text-white rounded-lg hover:bg-psu-maroon/90"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Users;