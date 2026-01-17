import { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp, Timestamp, increment } from 'firebase/firestore';
import { db } from './firebase';

export interface UserData {
  uid: string;
  firstName: string;
  email: string;
  createdAt: Timestamp;
  totalSubmissions: number;
  acceptedSubmissions: number;
  lastLogin: Timestamp;
}

export const createUserProfile = async (uid: string, firstName: string, email: string): Promise<void> => {
  await setDoc(doc(db, 'users', uid), {
    uid, firstName, email, createdAt: serverTimestamp(), totalSubmissions: 0, acceptedSubmissions: 0, lastLogin: serverTimestamp(),
  });
};

export const updateLastLogin = async (uid: string): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { lastLogin: serverTimestamp() });
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() as UserData : null;
};

export const subscribeToUserData = (uid: string, cb: (d: UserData | null) => void) => {
  return onSnapshot(doc(db, 'users', uid), (s) => cb(s.exists() ? s.data() as UserData : null));
};

export const incrementSubmission = async (uid: string, accepted: boolean): Promise<void> => {
  const data: any = { totalSubmissions: increment(1) };
  if (accepted) data.acceptedSubmissions = increment(1);
  await updateDoc(doc(db, 'users', uid), data);
};

export const getISTGreeting = (): string => {
  const now = new Date();
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + 5.5 * 60 * 60 * 1000);
  const mins = ist.getHours() * 60 + ist.getMinutes();
  if (mins >= 300 && mins < 720) return 'Good Morning';
  if (mins >= 720 && mins < 1050) return 'Good Afternoon';
  if (mins >= 1050 && mins < 1320) return 'Good Evening';
  return 'Good Night';
};

export const formatTimestampToIST = (ts: Timestamp | null): string => {
  if (!ts) return 'N/A';
  return ts.toDate().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDateToIST = (ts: Timestamp | null): string => {
  if (!ts) return 'N/A';
  return ts.toDate().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric' });
};
