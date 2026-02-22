import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EntityFormDialog } from "@/components/shared/EntityFormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Parent } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ParentList() {
  const { parents, students, addEntity, updateEntity, deleteEntity } = useData();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Parent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const openCreate = () => { setEditing(null); setFirstName(""); setLastName(""); setFormOpen(true); };
  const openEdit = (p: Parent) => { setEditing(p); setFirstName(p.firstName); setLastName(p.lastName); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    const data = { firstName: firstName.trim(), lastName: lastName.trim(), studentRelations: editing?.studentRelations || [] };
    if (editing) updateEntity("parents", editing.id, data);
    else addEntity<Parent>("parents", data as any, "par");
    setFormOpen(false);
  };

  const columns: Column<Parent>[] = [
    { key: "id", header: "ID" },
    { key: "firstName", header: "First Name" },
    { key: "lastName", header: "Last Name" },
    { key: "studentRelations", header: "Children", sortable: false, render: p => {
      return <span className="text-muted-foreground">{p.studentRelations.length} student{p.studentRelations.length !== 1 ? "s" : ""}</span>;
    }},
  ];

  return (
    <>
      <DataTable data={parents} columns={columns} title="Parents" onAdd={openCreate} addLabel="Add Parent"
        onView={p => navigate(`/parents/${p.id}`)} onEdit={openEdit} onDelete={p => setDeleteId(p.id)} />

      <EntityFormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "Edit Parent" : "New Parent"} onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>First Name *</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
          <div><Label>Last Name *</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
        </div>
      </EntityFormDialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Parent?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteEntity("parents", deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
