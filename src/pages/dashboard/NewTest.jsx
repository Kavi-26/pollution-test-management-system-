import { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './NewTest.css';

export default function NewTest() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        vehicleNumber: '',
        vehicleType: 'car',
        fuelType: 'petrol',
        engineNumber: '',
        chassisNumber: '',
        ownerName: '',
        mobileNumber: '',
        coLevel: '',
        hcLevel: '',
        smokeDensity: '',
        testResult: 'Pass'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Calculate validity
            const validityMonths = formData.vehicleType === 'bike' ? 6 : 12; // Example logic: Bike 6m, others 1y

            const now = new Date();
            // Clone date for expiry
            const expiry = new Date(now);
            expiry.setMonth(now.getMonth() + validityMonths);

            const testData = {
                ...formData,
                testDate: serverTimestamp(),
                expiryDate: expiry, // Note: Firestore will convert Date objects to Timestamp
                issuedBy: currentUser ? currentUser.uid : 'unknown',
                centerName: 'ANBU Emission Test',
                status: 'valid' // valid, expired
            };

            const docRef = await addDoc(collection(db, 'tests'), testData);
            console.log("Document written with ID: ", docRef.id);

            // Navigate to the certificate view
            navigate(`/certificate/${docRef.id}`);

        } catch (error) {
            console.error("Error adding document: ", error);
            alert('Error recording test: ' + error.message);
        }

        setLoading(false);
    };

    return (
        <div className="container new-test-container">
            <h1>New Pollution Test</h1>
            <form onSubmit={handleSubmit} className="test-form">

                {/* Vehicle Details */}
                <section className="form-section">
                    <h3>Vehicle Details</h3>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Vehicle Number</label>
                            <input
                                name="vehicleNumber"
                                value={formData.vehicleNumber}
                                onChange={handleChange}
                                required
                                placeholder="TN-01-AB-1234"
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Vehicle Type</label>
                            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
                                <option value="bike">Bike (2 Wheeler)</option>
                                <option value="car">Car (4 Wheeler)</option>
                                <option value="auto">Auto (3 Wheeler)</option>
                                <option value="truck">Truck</option>
                                <option value="bus">Bus</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Fuel Type</label>
                            <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="cng">CNG</option>
                                <option value="electric">Electric</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Engine Number (Optional)</label>
                            <input name="engineNumber" value={formData.engineNumber} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Chassis Number (Optional)</label>
                            <input name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                {/* Owner Details */}
                <section className="form-section">
                    <h3>Owner Details</h3>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Owner Name</label>
                            <input name="ownerName" value={formData.ownerName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required type="tel" maxLength="10" />
                        </div>
                    </div>
                </section>

                {/* Test Readings */}
                <section className="form-section">
                    <h3>Test Readings</h3>
                    <div className="grid-3">
                        <div className="form-group">
                            <label>CO Level (%)</label>
                            <input name="coLevel" value={formData.coLevel} onChange={handleChange} required type="number" step="0.01" />
                        </div>
                        <div className="form-group">
                            <label>HC Level (ppm)</label>
                            <input name="hcLevel" value={formData.hcLevel} onChange={handleChange} required type="number" />
                        </div>
                        <div className="form-group">
                            <label>Smoke Density</label>
                            <input name="smokeDensity" value={formData.smokeDensity} onChange={handleChange} type="number" step="0.01" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Test Result</label>
                        <select name="testResult" value={formData.testResult} onChange={handleChange}>
                            <option value="Pass">Pass</option>
                            <option value="Fail">Fail</option>
                        </select>
                    </div>
                </section>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    {loading ? 'Submitting...' : 'Submit Test Record'}
                </button>
            </form>
        </div>
    );
}
