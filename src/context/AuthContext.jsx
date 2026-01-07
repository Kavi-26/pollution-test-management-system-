import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, getSecondaryAuth } from "../firebase";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin', 'staff', 'user'
    const [loading, setLoading] = useState(true);

    // Helper to check role across collections
    const fetchUserRole = async (uid, email) => {
        // 0. Hardcoded Super Admin (Failsafe)
        if (email === 'anbuemission@gmail.com') return 'admin';

        // 1. Check Admin
        const adminDoc = await getDoc(doc(db, "admins", uid));
        if (adminDoc.exists()) return "admin";

        // 2. Check Staff
        const staffDoc = await getDoc(doc(db, "staff", uid));
        if (staffDoc.exists()) return "staff";

        // 3. Check User
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) return "user";

        return null; // Unknown role
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            try {
                if (user) {
                    const role = await fetchUserRole(user.uid, user.email);
                    setUserRole(role);
                    setCurrentUser(user);
                } else {
                    setUserRole(null);
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                setUserRole(null);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email, password, name) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document
        await setDoc(doc(db, "users", result.user.uid), {
            name,
            email,
            role: "user",
            createdAt: new Date().toISOString()
        });
        return result;
    };

    // Admin creating a staff account
    const createStaff = async (email, password, name) => {
        const secondaryAuth = getSecondaryAuth();
        const result = await createUserWithEmailAndPassword(secondaryAuth, email, password);

        // Create staff document in main DB
        await setDoc(doc(db, "staff", result.user.uid), {
            name,
            email,
            role: "staff",
            createdAt: new Date().toISOString()
        });

        // Force sign out the secondary user so it doesn't interfere
        await signOut(secondaryAuth);
        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userRole,
        login,
        signup,
        createStaff,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
