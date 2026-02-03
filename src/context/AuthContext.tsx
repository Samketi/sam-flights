import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from "react";
import { auth } from "../api/firebase";

export interface AuthCred {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (loginCredentials:AuthCred) => Promise<void>;
  registerWithEmail: (registerCredentials:AuthCred) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps{
    children:ReactNode
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider:FC<AuthProviderProps> = ({children}) =>{
    const [user, setUser]= useState<User | null>(null);
    const [loading, setloading] = useState(true);

    useEffect(()=> {
        const unsubscribe = onAuthStateChanged(auth, (currentUser)=>{
            setUser(currentUser);
            setloading(false);
        });
        return () => unsubscribe();
    },[])


    //methods
    const loginWithEmail = async (loginCredentials: AuthCred)=>{
        await signInWithEmailAndPassword(auth, loginCredentials.email, loginCredentials.password)
    }

    const registerWithEmail = async (registerCredentials:AuthCred)=>{
        await createUserWithEmailAndPassword(auth, registerCredentials.email, registerCredentials.password)
    }

    const loginWithGoogle= async()=>{
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth,provider);
    }

    const logout = async()=>{
        await signOut(auth);
    }

    return (
        <AuthContext.Provider 
          value={{
           user,
           loading,
           loginWithEmail,
           registerWithEmail,
           loginWithGoogle,
           logout,
          }}>
         {children}
        </AuthContext.Provider>
    )
}

//hook on using the auth context
export const useAuth = () =>{
    const context = useContext(AuthContext);
    if(!context) throw new Error("Auth must be used inside AuthProvider")
    
    return context;
}