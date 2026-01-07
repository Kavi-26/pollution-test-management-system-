import { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Fixed import path
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function Staff() {
    const { userRole } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'staff' });
    const [isAdding, setIsAdding] = useState(false);

    // Note: Creating auth users requires Firebase Admin SDK or Cloud Functions usually.
    // With Client SDK, you can only create user by 'createUserWithEmailAndPassword', which logs you in.
    // For a prototype, we often simulate this by just adding to 'users' Firestore collection,
    // but they won't be able to login unless they are in Auth.
    // Solution for Prototype: 
    // We will instruct Admin to manually create Auth user in Console, 
    // OR we just manage the "Metadata" here. 
    // REAL implementation needs Cloud Functions to trigger 'admin.auth().createUser()'.

    // For this demo, let's assume we are just managing the Firestore records which map roles.
    // The actual Auth creation happens separately or we can try a workaround (but it signs out admin).
    // We'll stick to managing the Firestore "Staff List" which acts as the role database.

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = [];
            querySnapshot.forEach((doc) => {
                usersList.push({ id: doc.id, ...doc.data() });
            });
            setUsers(usersList);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (userRole !== 'admin') return;

        // In a real app, this would trigger a Cloud Function to create Auth User.
        // Here we just add to Firestore.
        try {
            alert("Note: Use Firebase Console to generate the Auth Login credentials for this email. This form only sets the Role.");

            // Using email as ID or auto-ID? Ideally ID should match Auth UID. 
            // We'll let Firestore generate ID and this might be a disconnect in a purely client-side prototype without functions.
            // BUT, we can add a document where ID = email? No, Auth UID is best.

            await addDoc(collection(db, "users"), {
                ...formData,
                createdAt: new Date(),
                isActive: true
            });

            setFormData({ name: '', email: '', role: 'staff' });
            setIsAdding(false);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Error adding staff record");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await deleteDoc(doc(db, "users", id));
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    if (userRole !== 'admin') {
        return <div className="p-4">Access Denied: Admins only.</div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Staff Management</h2>
                <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : 'Add New Staff'}
                </button>
            </div>

            {isAdding && (
                <div style={{ background: 'white', padding: '1.5rem', marginBottom: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Register New Staff Role</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        Important: You must also create this user in Firebase Authentication tab with the same UID (if mapping by UID) or Email.
                    </p>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={{ padding: '0.5rem', flex: 1 }} />
                        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ padding: '0.5rem', flex: 1 }} />
                        <select name="role" value={formData.role} onChange={handleChange} style={{ padding: '0.5rem' }}>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="btn btn-primary">Save Record</button>
                    </form>
                </div>
            )}

            {loading ? <div>Loading...</div> : (
                <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name || 'N/A'}</td>
                                    <td>{user.email}</td>
                                    <td><span className={`badge ${user.role === 'admin' ? 'bg-purple' : 'bg-gray'}`}>{user.role}</span></td>
                                    <td>
                                        <button onClick={() => handleDelete(user.id)} style={{ color: 'red', background: 'none' }}>Remove</button>
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
