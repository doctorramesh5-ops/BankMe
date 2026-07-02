import React, { createContext, useContext, useState } from "react";
import { Colors, ThemeKey, Theme } from "./colors";
interface ThemeContextType { theme:Theme; themeKey:ThemeKey; setTheme:(k:ThemeKey)=>void; }
const ThemeContext = createContext<ThemeContextType>({ theme:Colors.dark, themeKey:"dark", setTheme:()=>{} });
export const ThemeProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
  const [themeKey, setThemeKey] = useState<ThemeKey>("dark");
  const setTheme = (key:ThemeKey) => setThemeKey(key);
  return <ThemeContext.Provider value={{theme:Colors[themeKey],themeKey,setTheme}}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);
