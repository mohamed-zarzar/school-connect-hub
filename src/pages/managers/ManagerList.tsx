import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EntityFormDialog } from "@/components/shared/EntityFormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Manager } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ManagerList() {
  const { managers, classes, levels, addEntity, updateEntity, deleteEntity } = useData();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Manager | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const openCreate = () => { setEditing(null); setFirstName(""); setLastName(""); setSelectedClasses([]); setFormOpen(true); };
  const openEdit = (m: Manager) => { setEditing(m); setFirstName(m.firstName); setLastName(m.lastName); setSelectedClasses(m.classIds); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    const data = { firstName: firstName.trim(), lastName: lastName.trim(), classIds: selectedClasses };
    if (editing) updateEntity("managers", editing.id, data);
    else addEntity<Manager>("managers", data as any, "mgr");
    setFormOpen(false);
  };

  const toggleClass = (id: string) => setSelectedClasses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const getLevel = (lid: string) => levels.find(l => l.id === lid);

  const columns: Column<Manager>[] = [
    { key: "id", header: "ID" },
    { key: "firstName", header: "First Name" },
    { key: "lastName", header: "Last Name" },
    { key: "classIds", header: "Classes", sortable: false, render: m => <span className="text-muted-foreground">{m.classIds.length} classes</span> },
  ];

  return (
    <>
      <DataTable data={managers} columns={columns} title="Managers" onAdd={openCreate} addLabel="Add Manager"
        onView={m => navigate(`/managers/${m.id}`)} onEdit={openEdit} onDelete={m => setDeleteId(m.id)} />

      <EntityFormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "Edit Manager" : "New Manager"} onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>First Name *</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
          <div><Label>Last Name *</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
        </div>
        <div><Label>Assigned Classes</Label>
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border rounded-lg p-3">
            {levels.map(lvl => (
              <div key={lvl.id}>
                <p className="text-xs font-semibold text-muted-foreground mb-1">{lvl.name}</p>
                {classes.filter(c => c.levelId === lvl.id).map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer ml-2">
                    <Checkbox checked={selectedClasses.includes(c.id)} onCheckedChange={() => toggleClass(c.id)} />
                    <span className="text-sm">Class {c.classNumber}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
      </EntityFormDialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Manager?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteEntity("managers", deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
