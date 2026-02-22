import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EntityFormDialog } from "@/components/shared/EntityFormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Teacher } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function TeacherList() {
  const { teachers, subjects, addEntity, updateEntity, deleteEntity } = useData();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const openCreate = () => { setEditing(null); setFirstName(""); setLastName(""); setSelectedSubjects([]); setFormOpen(true); };
  const openEdit = (t: Teacher) => { setEditing(t); setFirstName(t.firstName); setLastName(t.lastName); setSelectedSubjects(t.subjectIds); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    const data = { firstName: firstName.trim(), lastName: lastName.trim(), subjectIds: selectedSubjects, classAssignments: editing?.classAssignments || [] };
    if (editing) updateEntity("teachers", editing.id, data);
    else addEntity<Teacher>("teachers", data as any, "tch");
    setFormOpen(false);
  };

  const toggleSubject = (id: string) => setSelectedSubjects(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const getSubject = (id: string) => subjects.find(s => s.id === id);

  const columns: Column<Teacher>[] = [
    { key: "id", header: "ID" },
    { key: "firstName", header: "First Name" },
    { key: "lastName", header: "Last Name" },
    { key: "subjectIds", header: "Subjects", sortable: false, render: t => (
      <div className="flex flex-wrap gap-1">{t.subjectIds.map(sid => <Badge key={sid} variant="secondary" className="text-xs">{getSubject(sid)?.name}</Badge>)}</div>
    )},
    { key: "classAssignments", header: "Classes", sortable: false, render: t => <span className="text-muted-foreground">{t.classAssignments.length}</span> },
  ];

  return (
    <>
      <DataTable data={teachers} columns={columns} title="Teachers" onAdd={openCreate} addLabel="Add Teacher"
        onView={t => navigate(`/teachers/${t.id}`)} onEdit={openEdit} onDelete={t => setDeleteId(t.id)} />

      <EntityFormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "Edit Teacher" : "New Teacher"} onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>First Name *</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
          <div><Label>Last Name *</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
        </div>
        <div><Label>Subjects</Label>
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border rounded-lg p-3">
            {subjects.map(s => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={selectedSubjects.includes(s.id)} onCheckedChange={() => toggleSubject(s.id)} />
                <span className="text-sm">{s.name}</span>
              </label>
            ))}
          </div>
        </div>
      </EntityFormDialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Teacher?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteEntity("teachers", deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
