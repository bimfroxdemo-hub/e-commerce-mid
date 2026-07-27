import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { authAPI, profileAPI } from '../services/api';

import PersonalDetails from '../components/seller/PersonalDetails';
import BusinessDetails from '../components/seller/BusinessDetails';
import TaxDetails from '../components/seller/TaxDetails';
import BankDetails from '../components/seller/BankDetails';
import LaunchDetails from '../components/seller/LaunchDetails';

const SellerRegister = ({ onNavigate }) => {
    // Retrieved updateCurrentUser to update context memory dynamically on final launch
    const { loginUser, setIsSellerOnboarded, isAuthenticated, updateCurrentUser } = useApp();
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        email: '',
        password: '',
        licenseType: 'GSTIN',
        businessName: '',
        agreedToTerms: false,
        storeName: '',
        primaryCategory: '',
        pincode: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: 'India',
        shippingMethod: 'self_ship',
        gstNumber: '',
        panNumber: '',
        exemptCategory: false,
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        shippingFeeType: 'free',
        localFee: '40',
        regionalFee: '50',
        nationalFee: '60',
        productTaxCode: 'A_GEN_STANDARD'
    });

    const [checkingStore, setCheckingStore] = useState(false);
    const [storeAvailable, setStoreAvailable] = useState(null);

    useEffect(() => {
        if (isAuthenticated && step === 1) {
            setStep(2);
        }
    }, [isAuthenticated]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const checkStoreAvailability = () => {
        if (!formData.storeName) return;
        setCheckingStore(true);
        setTimeout(() => {
            setCheckingStore(false);
            setStoreAvailable(true);
        }, 800);
    };

    const handleNext = () => setStep((prev) => prev + 1);
    const handlePrev = () => setStep((prev) => prev - 1);

    const handlePersonalDetailsSubmit = async () => {
        if (!formData.fullName || !formData.email || !formData.password) {
            toast.error("Please fill in all account credentials.");
            return;
        }
        try {
            const response = await authAPI.register({
                name: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            });
            if (response?.success) {
                const payload = response.data || response;
                loginUser(payload.user, payload.token);
                toast.success("Account created successfully! Proceeding to business setup.");
                handleNext();
            } else {
                toast.error(response?.message || "Registration failed");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred during account creation");
        }
    };

    const handleLaunchBusiness = async () => {
        try {
            console.log("Saving complete onboarding data to backend database...", formData);
            const response = await profileAPI.updateSellerProfile(formData);

            if (response?.success) {
                // Safely extract the updated user object from the API response
                const updatedUser = response.data?.user || response.user || response.data;
                if (updatedUser) {
                    updateCurrentUser(updatedUser); // Update context state & sync with memory
                }

                localStorage.setItem('seller_onboarding_data', JSON.stringify(formData));
                localStorage.setItem('isSellerOnboarded', 'true');
                setIsSellerOnboarded(true); 

                toast.success("B2B Merchant Central Launched Successfully!");
                onNavigate('seller-dashboard');
            } else {
                toast.error(response?.message || "Failed to launch B2B merchant profile");
            }
        } catch (error) {
            toast.error(error?.message || "An error occurred during onboarding submission");
        }
    };

    const getProgressStage = () => {
        if (step <= 2) return 'Phone Verification';
        if (step === 3 || step === 4) return 'Seller Information';
        if (step === 5 || step === 6) return 'Tax Details';
        return 'Dashboard / Launch';
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <PersonalDetails
                        formData={formData}
                        handleChange={handleChange}
                        handleNext={handlePersonalDetailsSubmit}
                        onNavigate={onNavigate}
                    />
                );
            case 2:
            case 3:
            case 4:
                return (
                    <BusinessDetails
                        step={step}
                        formData={formData}
                        handleChange={handleChange}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        checkingStore={checkingStore}
                        storeAvailable={storeAvailable}
                        checkStoreAvailability={checkStoreAvailability}
                    />
                );
            case 5:
            case 6:
                return (
                    <TaxDetails
                        step={step}
                        formData={formData}
                        handleChange={handleChange}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        setFormData={setFormData}
                    />
                );
            case 7:
                return (
                    <BankDetails
                        formData={formData}
                        handleChange={handleChange}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                    />
                );
            case 8:
                return (
                    <LaunchDetails
                        formData={formData}
                        handleChange={handleChange}
                        handlePrev={handlePrev}
                        handleLaunchBusiness={handleLaunchBusiness}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-[#111111] font-sans">
            <header className="border-b border-gray-200 bg-white py-4 px-8 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-gray-800">kabira</span>
                    <span className="text-orange-500 font-semibold">seller central</span>
                    <span className="text-xs text-gray-500 self-end pb-1">India</span>
                </div>
                <div className="text-sm text-gray-600">English</div>
            </header>

            <div className="bg-gray-100 py-3 border-b border-gray-200">
                <div className="max-w-4xl mx-auto flex justify-between px-4 text-xs font-medium text-gray-500">
                    <div className={`flex items-center space-x-1 ${getProgressStage() === 'Phone Verification' ? 'text-orange-600 font-bold' : ''}`}>
                        <span>{step > 2 ? '✅' : '⚪'} Phone Verification</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${getProgressStage() === 'Seller Information' ? 'text-orange-600 font-bold' : ''}`}>
                        <span>{step > 4 ? '✅' : '⚪'} Seller Information</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${getProgressStage() === 'Tax Details' ? 'text-orange-600 font-bold' : ''}`}>
                        <span>{step > 6 ? '✅' : '⚪'} Tax Details</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${getProgressStage() === 'Dashboard / Launch' ? 'text-orange-600 font-bold' : ''}`}>
                        <span>⚪ Dashboard Setup</span>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto py-10 px-4">
                <div className="bg-white p-8 border border-gray-200 rounded-md shadow-sm">
                    {renderStepContent()}
                </div>
            </main>
        </div>
    );
};

export default SellerRegister;