import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

interface Faculty {
  _id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role: string;
  status: string;
}

interface FacultyContextType {
  facultyList: Faculty[];
  setFacultyList: React.Dispatch<React.SetStateAction<Faculty[]>>;
}

const FacultyContext = createContext<FacultyContextType | undefined>(undefined);

export const FacultyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/faculty");
        setFacultyList(res.data);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      }
    };

    fetchFaculty();
  }, []);

  return (
    <FacultyContext.Provider value={{ facultyList, setFacultyList }}>
      {children}
    </FacultyContext.Provider>
  );
};

// ✅ THIS is the missing piece:
export const useFacultyContext = () => {
  const context = useContext(FacultyContext);
  if (!context) {
    throw new Error("useFacultyContext must be used within a FacultyProvider");
  }
  return context;
};
