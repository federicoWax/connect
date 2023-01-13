import { useEffect, useState, useContext, createContext, FC, ReactNode } from "react";
import { User, onIdTokenChanged } from "firebase/auth";
import FullLoader from "../components/FullLoader";
import { auth } from "../firebase";
import { getDocById } from "../services/firebase";
import { Team, UserFirestoreAuth } from "../interfaces";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";

interface Props {
  children: ReactNode
}

const db = getFirestore();
const AuthContext = createContext<{ user: User | null, userFirestore: UserFirestoreAuth | null, loading: boolean }>({
  user: null,
  userFirestore: null,
  loading: true
});

const AuthProvider: FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userFirestore, setUserFirestore] = useState<UserFirestoreAuth | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);

  useEffect(() => {
    const uns = onIdTokenChanged(auth, async (user: User | null) => {
      if(user) {
        const userDoc = await getDocById("users", user.uid);
        const userData = {...userDoc.data(), id: userDoc.id} as UserFirestoreAuth;

        const teamDocs = await getDocs(query(collection(db, "teams"), where("name", "==", userData.team)));
        const teamData = teamDocs.docs[0].data() as Team;

        setUserFirestore({...userData, permissions: teamData?.permissions || []});
      } else {
        setUserFirestore(null);
      }

      setUser(user);
      setLoading(false);
    });

    return () => {
      uns();
    };
  }, []);

  if(loading) return <FullLoader />;

  return <AuthContext.Provider value={{user, userFirestore, loading}}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);