import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EntityFormDialog } from "@/components/shared/EntityFormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Level } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function LevelList() {
  const { levels, subjects, addEntity, updateEntity, deleteEntity } = useData();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Level | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [numberOfClasses, setNumberOfClasses] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const openCreate = () => { setEditing(null); setName(""); setNumberOfClasses(""); setSelectedSubjects([]); setFormOpen(true); };
  const openEdit = (l: Level) => { setEditing(l); setName(l.name); setNumberOfClasses(String(l.numberOfClasses)); setSelectedSubjects(l.subjectIds); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const data = { name: name.trim(), numberOfClasses: Number(numberOfClasses) || 0, subjectIds: selectedSubjects };
    if (editing) updateEntity("levels", editing.id, data);
    else addEntity<Level>("levels", data as any, "lvl");
    setFormOpen(false);
  };

  const toggleSubject = (id: string) => setSelectedSubjects(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const getSubject = (id: string) => subjects.find(s => s.id === id);

  const columns: Column<Level>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "numberOfClasses", header: "Classes" },
    { key: "subjectIds", header: "Subjects", sortable: false, render: l => (
      <div className="flex flex-wrap gap-1">{l.subjectIds.slice(0, 3).map(sid => <Badge key={sid} variant="secondary" className="text-xs">{getSubject(sid)?.name}</Badge>)}{l.subjectIds.length > 3 && <Badge variant="outline" className="text-xs">+{l.subjectIds.length - 3}</Badge>}</div>
    )},
  ];

  return (
    <>
      <DataTable data={levels} columns={columns} title="Levels" onAdd={openCreate} addLabel="Add Level"
        onView={l => navigate(`/levels/${l.id}`)} onEdit={openEdit} onDelete={l => setDeleteId(l.id)} />

      <EntityFormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "Edit Level" : "New Level"} onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
          <div><Label>Number of Classes</Label><Input type="number" value={numberOfClasses} onChange={e => setNumberOfClasses(e.target.value)} min={0} /></div>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Level?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteEntity("levels", deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
