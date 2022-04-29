import { useEffect, useState, useContext, createContext, FC } from "react";
import { User, onIdTokenChanged } from "firebase/auth";
import FullLoader from "../components/FullLoader/FullLoader";
import { auth } from "../firebase";
import { Rols } from "../types";
import { getDocById } from "../services/firebase";

interface UserFirestore {
  email: string;
  role: Rols;
  team: string;
}

const AuthContext = createContext<{ user: User | null, userFirestore: UserFirestore | null }>({
  user: null,
  userFirestore: null
});

const AuthProvider: FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userFirestore, setUserFirestore] = useState<UserFirestore | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);

  useEffect(() => {
    const uns = onIdTokenChanged(auth, async (user: User | null) => {
      if(user) {
        const userDoc = await getDocById("users", user.uid);

        setUserFirestore(userDoc.data() as UserFirestore);
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

  return <AuthContext.Provider value={{user, userFirestore}}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);