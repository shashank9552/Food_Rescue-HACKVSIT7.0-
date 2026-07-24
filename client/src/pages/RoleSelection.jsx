import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2, HeartHandshake, Truck, MapPin, Loader } from 'lucide-react';

export default function RoleSelection() {
  const { userProfile, updateUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null); // 'restaurant', 'ngo', 'volunteer'
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      name: userProfile?.name || '',
      phone: '',
      address: '',
      capacity: 20
    }
  });

  const detectLocation = () => {
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCoords(detected);
        toast.success(`Location detected: ${detected.lat.toFixed(4)}, ${detected.lng.toFixed(4)}`);
        setDetectingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not fetch location. Falling back to default.");
        // Fallback to Delhi coordinates
        setCoords({ lat: 28.6519, lng: 77.2315 });
        setDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const onSubmit = async (data) => {
    if (!selectedRole) {
      toast.error("Please select a user role.");
      return;
    }

    setSubmitting(true);
    try {
      const finalCoords = coords || { lat: 28.6519, lng: 77.2315 }; // Default Delhi
      const details = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        location: finalCoords,
        restaurantName: selectedRole === 'restaurant' ? data.name : undefined,
        ngoName: selectedRole === 'ngo' ? data.name : undefined,
        capacity: selectedRole === 'ngo' ? parseFloat(data.capacity) : undefined
      };

      await updateUserRole(selectedRole, details);
      toast.success("Profile setup completed successfully!");
      
      const roleRedirect = {
        restaurant: '/restaurant',
        ngo: '/ngo',
        volunteer: '/volunteer'
      };
      navigate(roleRedirect[selectedRole]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete profile setup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-600/20">
          <span className="font-bold text-white text-xl">F</span>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Complete Your Profile</h2>
        <p className="mt-2 text-sm text-slate-500">
          Select your role to configure your Food Rescue AI dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {/* Step 1: Choose Role */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-3">I want to join as a...</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <button
                type="button"
                onClick={() => setSelectedRole('restaurant')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${
                  selectedRole === 'restaurant'
                    ? 'border-green-600 bg-green-50/40 text-green-700'
                    : 'border-slate-150 hover:border-slate-300 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">Restaurant</span>
                <span className="text-[10px] text-center mt-1 opacity-80">Donate surplus food</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('ngo')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${
                  selectedRole === 'ngo'
                    ? 'border-green-600 bg-green-50/40 text-green-700'
                    : 'border-slate-150 hover:border-slate-300 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <HeartHandshake className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">NGO</span>
                <span className="text-[10px] text-center mt-1 opacity-80">Claim & distribute food</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('volunteer')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${
                  selectedRole === 'volunteer'
                    ? 'border-green-600 bg-green-50/40 text-green-700'
                    : 'border-slate-150 hover:border-slate-300 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">Volunteer</span>
                <span className="text-[10px] text-center mt-1 opacity-80">Deliver food packages</span>
              </button>

            </div>
          </div>

          {selectedRole && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fadeIn">
              <hr className="border-slate-100 my-6" />

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {selectedRole === 'restaurant' ? 'Restaurant Name' : selectedRole === 'ngo' ? 'NGO Name' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  {...register('name', { required: "Name is required" })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  {...register('phone', { required: "Phone number is required" })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              {selectedRole !== 'volunteer' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Physical Address *</label>
                  <textarea
                    rows={2}
                    {...register('address', { required: "Address is required" })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm resize-none"
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
                </div>
              )}

              {selectedRole === 'ngo' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Storage / Distribution Capacity (kg) *</label>
                  <input
                    type="number"
                    min="1"
                    {...register('capacity', { required: "Capacity is required", min: { value: 1, message: "Capacity must be greater than 0" } })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                  {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity.message}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location Coordinates *</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingLocation}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    {detectingLocation ? (
                      <Loader className="w-3.5 h-3.5 animate-spin text-slate-400" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-green-600" />
                    )}
                    <span>{coords ? "Update Location" : "Auto Detect Location"}</span>
                  </button>
                  {coords && (
                    <div className="flex items-center text-xs text-slate-500 font-medium">
                      Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
                    </div>
                  )}
                </div>
                {!coords && <p className="mt-1.5 text-xs text-amber-600">Please detect your location. Fallback defaults will be applied if skipped.</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 rounded-xl border border-transparent bg-green-600 text-sm font-bold text-white shadow-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Completing Profile..." : "Submit & Complete Profile"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
