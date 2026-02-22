import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EntityFormDialog } from "@/components/shared/EntityFormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function StudentList() {
  const { students, levels, classes, parents, addEntity, updateEntity, deleteEntity } = useData();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [levelId, setLevelId] = useState("");
  const [classId, setClassId] = useState("");

  const openCreate = () => { setEditing(null); setFirstName(""); setLastName(""); setLevelId(""); setClassId(""); setFormOpen(true); };
  const openEdit = (s: Student) => { setEditing(s); setFirstName(s.firstName); setLastName(s.lastName); setLevelId(s.levelId); setClassId(s.classId || ""); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !levelId) return;
    const data = { firstName: firstName.trim(), lastName: lastName.trim(), levelId, classId: classId || undefined, parentRelations: editing?.parentRelations || [] };
    if (editing) updateEntity("students", editing.id, data);
    else addEntity<Student>("students", data as any, "stu");
    setFormOpen(false);
  };

  const filteredClasses = classes.filter(c => c.levelId === levelId);
  const getLevel = (id: string) => levels.find(l => l.id === id);
  const getClass = (id: string) => classes.find(c => c.id === id);

  const columns: Column<Student>[] = [
    { key: "id", header: "ID" },
    { key: "firstName", header: "First Name" },
    { key: "lastName", header: "Last Name" },
    { key: "levelId", header: "Level", render: s => <Badge variant="secondary">{getLevel(s.levelId)?.name || "-"}</Badge> },
    { key: "classId", header: "Class", render: s => s.classId ? `Class ${getClass(s.classId)?.classNumber}` : "-" },
    { key: "parentRelations", header: "Parents", sortable: false, render: s => <span className="text-muted-foreground">{s.parentRelations.length}</span> },
  ];

  return (
    <>
      <DataTable data={students} columns={columns} title="Students" onAdd={openCreate} addLabel="Add Student"
        onView={s => navigate(`/students/${s.id}`)} onEdit={openEdit} onDelete={s => setDeleteId(s.id)} />

      <EntityFormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "Edit Student" : "New Student"} onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>First Name *</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
          <div><Label>Last Name *</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
        </div>
        <div><Label>Level *</Label>
          <Select value={levelId} onValueChange={v => { setLevelId(v); setClassId(""); }}>
            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>{levels.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Class</Label>
          <Select value={classId} onValueChange={setClassId} disabled={!levelId}>
            <SelectTrigger><SelectValue placeholder={levelId ? "Select class" : "Select level first"} /></SelectTrigger>
            <SelectContent>{filteredClasses.map(c => <SelectItem key={c.id} value={c.id}>Class {c.classNumber}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </EntityFormDialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Student?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteEntity("students", deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
