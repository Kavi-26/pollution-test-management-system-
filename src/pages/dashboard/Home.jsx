import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import './Home.css';

export default function DashboardHome() {
    const { currentUser, userRole } = useAuth();
    const [stats, setStats] = useState({
        totalTests: 0,
        passCount: 0,
        failCount: 0,
        todayTests: 0
    });
    const [recentTests, setRecentTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const testsRef = collection(db, 'tests');
                const snapshot = await getDocs(testsRef);

                let total = 0;
                let pass = 0;
                let fail = 0;
                let today = 0;
                const now = new Date();
                const startOfDay = new Date(now.setHours(0, 0, 0, 0));

                const tests = [];

                snapshot.forEach(doc => {
                    const data = doc.data();
                    total++;
                    if (data.testResult === 'Pass') pass++;
                    if (data.testResult === 'Fail') fail++;

                    if (data.testDate && data.testDate.toDate() >= startOfDay) {
                        today++;
                    }

                    // Collect for recent list (doing client side sort for prototype speed)
                    tests.push({ id: doc.id, ...data });
                });

                // Sort by date desc
                tests.sort((a, b) => {
                    const dateA = a.testDate ? a.testDate.toDate() : new Date(0);
                    const dateB = b.testDate ? b.testDate.toDate() : new Date(0);
                    return dateB - dateA;
                });

                setStats({ totalTests: total, passCount: pass, failCount: fail, todayTests: today });
                setRecentTests(tests.slice(0, 5));

            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="dashboard-home">
            <header className="page-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, {currentUser.email} | Role: <span className="badge">{userRole || 'Staff'}</span></p>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Tests</h3>
                    <div className="stat-value">{stats.totalTests}</div>
                    <div className="stat-sub">Lifetime tests conducted</div>
                </div>
                <div className="stat-card success">
                    <h3>Passed</h3>
                    <div className="stat-value">{stats.passCount}</div>
                    <div className="stat-sub">Vehicles cleared</div>
                </div>
                <div className="stat-card danger">
                    <h3>Failed</h3>
                    <div className="stat-value">{stats.failCount}</div>
                    <div className="stat-sub">Needs attention</div>
                </div>
                <div className="stat-card info">
                    <h3>Today's Activity</h3>
                    <div className="stat-value">{stats.todayTests}</div>
                    <div className="stat-sub">Tests run today</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-section">
                <h2>Recent Tests</h2>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Vehicle No</th>
                                <th>Owner</th>
                                <th>Type</th>
                                <th>Result</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTests.length === 0 ? (
                                <tr><td colSpan="6" className="text-center">No tests recorded yet.</td></tr>
                            ) : (
                                recentTests.map(test => (
                                    <tr key={test.id}>
                                        <td>{test.testDate ? test.testDate.toDate().toLocaleDateString() : 'N/A'}</td>
                                        <td className="uppercase">{test.vehicleNumber}</td>
                                        <td>{test.ownerName}</td>
                                        <td className="capitalize">{test.vehicleType}</td>
                                        <td>
                                            <span className={`status-badge ${test.testResult?.toLowerCase()}`}>
                                                {test.testResult}
                                            </span>
                                        </td>
                                        <td>
                                            <a href={`/certificate/${test.id}`} className="btn-link">View</a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
