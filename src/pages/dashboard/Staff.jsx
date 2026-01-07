import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function Staff() {
    const { userRole, createStaff } = useAuth();
    const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'users'
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const collectionName = activeTab === 'staff' ? 'staff' : 'users';
            const querySnapshot = await getDocs(collection(db, collectionName));
            const list = [];
            querySnapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setDataList(list);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Reset adding state when switching tabs
        setIsAdding(false);
        setError('');
    }, [activeTab]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        if (userRole !== 'admin') return;

        setError('');
        try {
            await createStaff(formData.email, formData.password, formData.name);

            // Reset form
            setFormData({ name: '', email: '', password: '' });
            setIsAdding(false);
            fetchData(); // Refresh list
            alert("Staff account created successfully!");
        } catch (err) {
            console.error(err);
            setError(err.message || "Error creating staff account");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete the record from the database. (Note: Auth account might remain unless deleted manually)")) return;
        try {
            const collectionName = activeTab === 'staff' ? 'staff' : 'users';
            await deleteDoc(doc(db, collectionName, id));
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to delete record");
        }
    };

    if (userRole !== 'admin') {
        return <div className="p-4">Access Denied: Admins only.</div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Management Portal</h2>

                <div className="btn-group" style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('staff')}
                        style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: '1px solid var(--primary-color)' }}
                    >
                        Staff
                    </button>
                    <button
                        className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('users')}
                        style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: '1px solid var(--primary-color)' }}
                    >
                        Users
                    </button>
                </div>
            </div>

            {activeTab === 'staff' && (
                <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? 'Cancel' : 'Add New Staff'}
                    </button>
                </div>
            )}

            {isAdding && activeTab === 'staff' && (
                <div style={{ background: 'white', padding: '1.5rem', marginBottom: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Create New Staff Account</h3>

                    {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                    <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                        <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Create Staff Account</button>
                    </form>
                </div>
            )}

            {loading ? <div>Loading...</div> : (
                <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Joined</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataList.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No records found</td></tr>
                            ) : dataList.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>{item.name || 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>{item.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            background: item.role === 'staff' ? '#e0e7ff' : '#dcfce7',
                                            color: item.role === 'staff' ? '#3730a3' : '#166534',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.85rem'
                                        }}>
                                            {item.role || 'user'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
