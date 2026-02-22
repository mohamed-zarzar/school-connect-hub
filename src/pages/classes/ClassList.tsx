import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EntityFormDialog } from "@/components/shared/EntityFormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SchoolClass } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ClassList() {
  const { classes, levels, addEntity, updateEntity, deleteEntity } = useData();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [classNumber, setClassNumber] = useState("");
  const [levelId, setLevelId] = useState("");

  const openCreate = () => { setEditing(null); setClassNumber(""); setLevelId(""); setFormOpen(true); };
  const openEdit = (c: SchoolClass) => { setEditing(c); setClassNumber(String(c.classNumber)); setLevelId(c.levelId); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNumber || !levelId) return;
    const data = { classNumber: Number(classNumber), levelId };
    if (editing) updateEntity("classes", editing.id, data);
    else addEntity<SchoolClass>("classes", data as any, "cls");
    setFormOpen(false);
  };

  const getLevel = (lid: string) => levels.find(l => l.id === lid);

  const columns: Column<SchoolClass>[] = [
    { key: "id", header: "ID" },
    { key: "classNumber", header: "Class Number" },
    { key: "levelId", header: "Level", render: c => <Badge variant="secondary">{getLevel(c.levelId)?.name || "-"}</Badge> },
  ];

  return (
    <>
      <DataTable data={classes} columns={columns} title="Classes" onAdd={openCreate} addLabel="Add Class"
        onView={c => navigate(`/classes/${c.id}`)} onEdit={openEdit} onDelete={c => setDeleteId(c.id)} />

      <EntityFormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "Edit Class" : "New Class"} onSubmit={handleSubmit}>
        <div><Label>Class Number *</Label><Input type="number" value={classNumber} onChange={e => setClassNumber(e.target.value)} required min={1} /></div>
        <div><Label>Level *</Label>
          <Select value={levelId} onValueChange={setLevelId}>
            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>{levels.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </EntityFormDialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Class?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteEntity("classes", deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
