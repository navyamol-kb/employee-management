import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("cp_dark_mode") === "true";
  });
  
  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem("cp_user_avatar") || null;
  });

  useEffect(() => {
    localStorage.setItem("cp_dark_mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (userAvatar) {
      localStorage.setItem("cp_user_avatar", userAvatar);
    } else {
      localStorage.removeItem("cp_user_avatar");
    }
  }, [userAvatar]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, userAvatar, setUserAvatar }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
