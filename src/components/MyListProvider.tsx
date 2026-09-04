"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";

interface MyListContextType {
  myList: string[];
  addToMyList: (id: string, type?: "video" | "podcast") => Promise<void>;
  removeFromMyList: (id: string) => Promise<void>;
}

const MyListContext = createContext<MyListContextType | null>(null);

export function MyListProvider({ children }: { children: ReactNode }) {
  const [myList, setMyList] = useState<string[]>([]);
  const { user, loading } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    async function fetchMyList() {
      if (user) {
        const { data, error } = await supabase
          .from('user_lists')
          .select('content_id')
          .eq('user_id', user.id);
        
        if (!error && data) {
          setMyList(data.map(item => item.content_id));
        }
      } else {
        setMyList([]);
      }
    }
    
    if (!loading) {
      fetchMyList();
    }
  }, [user, loading]);

  const addToMyList = async (id: string, type: "video" | "podcast" = "video") => {
    if (!user) return;
    
    setMyList(prev => [...prev, id]);
    
    const { error } = await supabase.from('user_lists').insert({
      user_id: user.id,
      content_id: id,
      content_type: type
    });

    if (error) {
      console.error("Failed to add to My List:", error);
      setMyList(prev => prev.filter(vid => vid !== id));
      alert("Failed to save to your list. Please try again.");
    }
  };

  const removeFromMyList = async (id: string) => {
    if (!user) return;
    
    setMyList(prev => prev.filter(vid => vid !== id));
    
    const { error } = await supabase
      .from('user_lists')
      .delete()
      .match({ user_id: user.id, content_id: id });

    if (error) {
      console.error("Failed to remove from My List:", error);
      setMyList(prev => [...prev, id]);
      alert("Failed to remove from your list. Please try again.");
    }
  };

  return (
    <MyListContext.Provider value={{ myList, addToMyList, removeFromMyList }}>
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  const context = useContext(MyListContext);
  if (!context) {
    throw new Error("useMyList must be used within a MyListProvider");
  }
  return context;
}
