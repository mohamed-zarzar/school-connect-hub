import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import StudentList from "@/pages/students/StudentList";
import StudentDetail from "@/pages/students/StudentDetail";
import TeacherList from "@/pages/teachers/TeacherList";
import TeacherDetail from "@/pages/teachers/TeacherDetail";
import ManagerList from "@/pages/managers/ManagerList";
import ManagerDetail from "@/pages/managers/ManagerDetail";
import ParentList from "@/pages/parents/ParentList";
import ParentDetail from "@/pages/parents/ParentDetail";
import ClassList from "@/pages/classes/ClassList";
import ClassDetail from "@/pages/classes/ClassDetail";
import LevelList from "@/pages/levels/LevelList";
import LevelDetail from "@/pages/levels/LevelDetail";
import SubjectList from "@/pages/subjects/SubjectList";
import SubjectDetail from "@/pages/subjects/SubjectDetail";
import CustomFieldsSettings from "@/pages/settings/CustomFields";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<StudentList />} />
              <Route path="/students/:id" element={<StudentDetail />} />
              <Route path="/teachers" element={<TeacherList />} />
              <Route path="/teachers/:id" element={<TeacherDetail />} />
              <Route path="/managers" element={<ManagerList />} />
              <Route path="/managers/:id" element={<ManagerDetail />} />
              <Route path="/parents" element={<ParentList />} />
              <Route path="/parents/:id" element={<ParentDetail />} />
              <Route path="/classes" element={<ClassList />} />
              <Route path="/classes/:id" element={<ClassDetail />} />
              <Route path="/levels" element={<LevelList />} />
              <Route path="/levels/:id" element={<LevelDetail />} />
              <Route path="/subjects" element={<SubjectList />} />
              <Route path="/subjects/:id" element={<SubjectDetail />} />
              <Route path="/settings/custom-fields" element={<CustomFieldsSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
