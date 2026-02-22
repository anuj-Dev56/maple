import React, { createContext, useContext, useEffect, useState } from "react";
import user from "../../utils/user";

const DataContext = createContext(null);

const DataWrapper = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [progress, setProgress] = useState("new");
  const [chats, setChats] = useState([]);
  
  return (
    <DataContext.Provider value={{ player, setPlayer, progress, setProgress, chats, setChats }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

export default DataWrapper;
