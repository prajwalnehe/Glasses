import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  HelpCircle,
  LogOut,
  ShoppingBag,
  Eye,
  EyeOff,
  Edit2,
  Plus,
  Trash2,
  ChevronRight,
  Package,
  Headphones,
  MessageSquare,
  Info
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import MyOrders from './MyOrders';

const UserInfo = () => {
  const { user, updateUser, logout } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(null);
  const [userData, setUserData] = useState({
    joinDate: new Date().toLocaleDateString(),
    lastLogin: new Date().toLocaleString(),
    addresses: [],
    orders: []
  });
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    newPassword: ''
  });

  const navigate = useNavigate();

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:4000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { name, email, phone, createdAt, lastLogin, addresses = [], orders = [] } = response.data;

        setFormData({
          name: name || '',
          email: email || '',
          phone: phone || '',
          newPassword: ''
        });

        setUserData({
          joinDate: createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A',
          lastLogin: lastLogin ? new Date(lastLogin).toLocaleString() : 'First login',
          addresses,
          orders
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user) fetchUserData();
  }, [user]);

  // -------------------------------
  // ADDRESS MANAGEMENT FUNCTIONS
  // -------------------------------

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddOrUpdateAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const addressData = {
        ...addressForm,
        isDefault: addressForm.isDefault || userData.addresses.length === 0
      };

      if (isEditingAddress) {
        await axios.put(
          `http://localhost:4000/api/users/addresses/${isEditingAddress}`,
          addressData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:4000/api/users/addresses',
          addressData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const response = await axios.get('http://localhost:4000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserData((prev) => ({
        ...prev,
        addresses: response.data.addresses || []
      }));

      setAddressForm({
        type: 'Home',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
      });
      setIsEditingAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm(address);
    setIsEditingAddress(address._id);
  };

  const handleDeleteAddress = async (addressId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await axios.delete(`http://localhost:4000/api/users/addresses/${addressId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const response = await axios.get('http://localhost:4000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData((prev) => ({
          ...prev,
          addresses: response.data.addresses || []
        }));
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:4000/api/users/addresses/${addressId}/default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const response = await axios.get('http://localhost:4000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserData((prev) => ({
        ...prev,
        addresses: response.data.addresses || []
      }));
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  // -------------------------------
  // PROFILE MANAGEMENT
  // -------------------------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:4000/api/users/update',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { id: 'profile', icon: <User />, label: 'Profile Information' },
    { id: 'orders', icon: <ShoppingBag />, label: 'My Orders', badge: userData.orders.length },
    { id: 'addresses', icon: <MapPin />, label: 'My Addresses' },
    { id: 'help', icon: <HelpCircle />, label: 'Help & Support' }
  ];

  // -------------------------------
  // RENDER SECTION
  // -------------------------------

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            formData={formData}
            isEditing={isEditing}
            showPassword={showPassword}
            onInputChange={handleInputChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onEditToggle={() => setIsEditing(!isEditing)}
            onSubmit={handleSubmit}
            joinDate={userData.joinDate}
          />
        );
      case 'orders':
        return <MyOrders />;
      case 'addresses':
        return (
          <AddressesTab
            addresses={userData.addresses}
            onEdit={handleEditAddress}
            onDelete={handleDeleteAddress}
            onAddNew={() => setIsEditingAddress('new')}
            handleSetDefaultAddress={handleSetDefaultAddress}
          />
        );
      case 'help':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Help & Support</h2>
            <p className="text-gray-600">Need assistance? Contact our support team or visit the FAQ section.</p>
          </div>
        );
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-blue-100 mt-2">Manage your profile, orders, and more</p>
      </div>

      {/* Main Layout */}
      <div className="container mx-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-xl shadow-md w-full lg:w-72 p-4">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              badge={item.badge}
            >
              {item.label}
            </NavItem>
          ))}

          <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-700"
                    >
                      Sign out
                    </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-6">{renderTab()}</div>
      </div>
    </div>
  );
};

// -------------------------------
// REUSABLE COMPONENTS
// -------------------------------

const NavItem = ({ icon, children, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium ${
      active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center space-x-3">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
    {badge > 0 && (
      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

// -------------------------------
// TAB COMPONENTS
// -------------------------------

const ProfileTab = ({ formData, isEditing, showPassword, onInputChange, onTogglePassword, onEditToggle, onSubmit, joinDate }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Profile Information</h2>
      {!isEditing && (
        <button
          onClick={onEditToggle}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit2 size={16} className="inline mr-2" />
          Edit
        </button>
      )}
    </div>

    {isEditing ? (
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Full Name"
          className="w-full border px-4 py-2 rounded-lg"
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onInputChange}
          placeholder="Phone Number"
          className="w-full border px-4 py-2 rounded-lg"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="newPassword"
            value={formData.newPassword}
            onChange={onInputChange}
            placeholder="New Password"
            className="w-full border px-4 py-2 rounded-lg pr-10"
          />
          <button type="button" onClick={onTogglePassword} className="absolute right-3 top-2.5 text-gray-500">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          Save Changes
        </button>
      </form>
    ) : (
      <div>
        <p><strong>Name:</strong> {formData.name}</p>
        <p><strong>Email:</strong> {formData.email}</p>
        <p><strong>Phone:</strong> {formData.phone || 'Not provided'}</p>
        <p><strong>Joined:</strong> {joinDate}</p>
      </div>
    )}
  </div>
);

const AddressesTab = ({ addresses, onEdit, onDelete, onAddNew, handleSetDefaultAddress }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">My Addresses</h2>
      <button onClick={onAddNew} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Plus size={16} className="inline mr-2" />
        Add Address
      </button>
    </div>

    {addresses.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No addresses saved yet.</p>
    ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div key={address._id} className="border p-4 rounded-lg shadow-sm">
            <p className="font-semibold">{address.type}</p>
            <p>{address.street}, {address.city}</p>
            <p>{address.state} {address.postalCode}, {address.country}</p>
            {address.isDefault && <p className="text-green-600 text-sm mt-1">Default</p>}
            <div className="flex space-x-2 mt-3">
              <button onClick={() => onEdit(address)} className="text-blue-600 hover:underline text-sm">Edit</button>
              <button onClick={() => onDelete(address._id)} className="text-red-600 hover:underline text-sm">Delete</button>
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefaultAddress(address._id)}
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default UserInfo;
