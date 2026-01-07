import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import QRCode from 'react-qr-code';
import './Certificate.css';

export default function Certificate() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCert = async () => {
            try {
                const docRef = doc(db, 'tests', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such document!");
                }
            } catch (err) {
                console.error("Error fetching certificate:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCert();
    }, [id]);

    if (loading) return <div className="loading">Loading Certificate...</div>;
    if (!data) return <div className="error">Certificate not found.</div>;

    // Format dates
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        // Firestore timestamp to JS Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="certificate-container">
            <div className="certificate-paper" id="certificate-print">
                <div className="cert-header">
                    <h1>POLLUTION UNDER CONTROL CERTIFICATE</h1>
                    <h2>ANBU EMISSION TEST CENTRE</h2>
                    <p>Authorised by Government of Tamil Nadu</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>157/1 Chavadikattu Thottom, Sakthy Main Road, Erode - 638004</p>
                </div>

                <div className="cert-body">
                    <div className="cert-row">
                        <div className="cert-field">
                            <label>Certificate No:</label>
                            <span>{data.id}</span>
                        </div>
                        <div className="cert-field">
                            <label>Date of Issue:</label>
                            <span>{formatDate(data.testDate)}</span>
                        </div>
                        <div className="cert-field">
                            <label>Date of Expiry:</label>
                            <span className="expiry">{formatDate(data.expiryDate)}</span>
                        </div>
                    </div>

                    <div className="cert-details">
                        <h3>Vehicle Details</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Vehicle Number:</label>
                                <b>{data.vehicleNumber}</b>
                            </div>
                            <div className="detail-item">
                                <label>Vehicle Type:</label>
                                <span>{data.vehicleType.toUpperCase()}</span>
                            </div>
                            <div className="detail-item">
                                <label>Fuel Type:</label>
                                <span>{data.fuelType.toUpperCase()}</span>
                            </div>
                            <div className="detail-item">
                                <label>Owner Name:</label>
                                <span>{data.ownerName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="cert-readings">
                        <h3>Test Readings</h3>
                        <table className="readings-table">
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Measured Level</th>
                                    <th>Permissible Limit</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>CO (Carbon Monoxide)</td>
                                    <td>{data.coLevel} %</td>
                                    <td>3.5 %</td>
                                    <td>Pass</td>
                                </tr>
                                <tr>
                                    <td>HC (Hydrocarbons)</td>
                                    <td>{data.hcLevel} ppm</td>
                                    <td>4500 ppm</td>
                                    <td>Pass</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="cert-footer">
                        <div className="qr-section">
                            <QRCode value={`https://anbu-emission.web.app/verify/${data.vehicleNumber}`} size={100} />
                            <small>Scan to Verify</small>
                        </div>
                        <div className="signature-section">
                            <div className="stamp-box">
                                Authorised Signatory
                            </div>
                            <p>ANBU Emission Test</p>
                        </div>
                    </div>

                    <div className="cert-status">
                        RESULT: <span className={data.testResult === 'Pass' ? 'status-pass' : 'status-fail'}>{data.testResult.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <div className="no-print action-buttons">
                <button onClick={() => window.print()} className="btn btn-primary">Download / Print PDF</button>
            </div>
        </div>
    );
}
