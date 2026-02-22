import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EntityFormDialog } from "@/components/shared/EntityFormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Subject } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function SubjectList() {
  const { subjects, addEntity, updateEntity, deleteEntity } = useData();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const openCreate = () => { setEditing(null); setName(""); setFormOpen(true); };
  const openEdit = (s: Subject) => { setEditing(s); setName(s.name); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editing) updateEntity("subjects", editing.id, { name: name.trim() });
    else addEntity<Subject>("subjects", { name: name.trim() } as any, "sub");
    setFormOpen(false);
  };

  const columns: Column<Subject>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
  ];

  return (
    <>
      <DataTable data={subjects} columns={columns} title="Subjects" onAdd={openCreate} addLabel="Add Subject"
        onView={s => navigate(`/subjects/${s.id}`)} onEdit={openEdit} onDelete={s => setDeleteId(s.id)} />

      <EntityFormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "Edit Subject" : "New Subject"} onSubmit={handleSubmit}>
        <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
      </EntityFormDialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Subject?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteEntity("subjects", deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
