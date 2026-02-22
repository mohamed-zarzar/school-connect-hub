import React, { createContext, useContext, useState, useCallback } from "react";
import { AppData, Student, Teacher, Manager, Parent, SchoolClass, Level, Subject, CustomField } from "@/types";
import { initialData, generateId } from "@/data/mockData";

type AnyEntity = Student | Teacher | Manager | Parent | SchoolClass | Level | Subject | CustomField;

interface DataContextType extends AppData {
  addEntity: <T extends AnyEntity>(key: keyof AppData, entity: Omit<T, "id">, prefix?: string) => T;
  updateEntity: (key: keyof AppData, id: string, updates: Partial<AnyEntity>) => void;
  deleteEntity: (key: keyof AppData, id: string) => void;
  getEntity: (key: keyof AppData, id: string) => AnyEntity | undefined;
}

const DataContext = createContext<DataContextType>(null!);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(initialData);

  const addEntity = useCallback(<T extends AnyEntity>(key: keyof AppData, entity: Omit<T, "id">, prefix = "id") => {
    const id = generateId(prefix);
    const newEntity = { ...entity, id } as T;
    setData(prev => ({ ...prev, [key]: [...(prev[key] as any[]), newEntity] }));
    return newEntity;
  }, []);

  const updateEntity = useCallback((key: keyof AppData, id: string, updates: Partial<AnyEntity>) => {
    setData(prev => ({
      ...prev,
      [key]: (prev[key] as any[]).map((item: any) => item.id === id ? { ...item, ...updates } : item),
    }));
  }, []);

  const deleteEntity = useCallback((key: keyof AppData, id: string) => {
    setData(prev => ({
      ...prev,
      [key]: (prev[key] as any[]).filter((item: any) => item.id !== id),
    }));
  }, []);

  const getEntity = useCallback((key: keyof AppData, id: string) => {
    return (data[key] as any[]).find((item: any) => item.id === id);
  }, [data]);

  return (
    <DataContext.Provider value={{ ...data, addEntity, updateEntity, deleteEntity, getEntity }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
