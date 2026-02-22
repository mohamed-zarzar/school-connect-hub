import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { CustomField, EntityType } from "@/types";
import { EntityFormDialog } from "@/components/shared/EntityFormDialog";

const ENTITIES: EntityType[] = ["student", "teacher", "manager", "parent"];
const FIELD_TYPES = ["text", "number", "select", "multiselect", "file", "date", "checkbox"] as const;

export default function CustomFieldsSettings() {
  const { customFields, addEntity, updateEntity, deleteEntity } = useData();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityType>("student");

  const [fieldName, setFieldName] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<string>("text");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState("");

  const filtered = customFields.filter(f => f.entity === selectedEntity);

  const openCreate = () => {
    setFieldName(""); setFieldLabel(""); setFieldType("text"); setFieldRequired(false); setFieldOptions("");
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim() || !fieldLabel.trim()) return;
    const options = ["select", "multiselect"].includes(fieldType)
      ? fieldOptions.split(",").map(o => o.trim()).filter(Boolean)
      : undefined;
    addEntity<CustomField>("customFields", {
      entity: selectedEntity,
      name: fieldName.trim(),
      label: fieldLabel.trim(),
      type: fieldType as CustomField["type"],
      required: fieldRequired,
      options,
    } as any, "cf");
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Custom Fields</h1>
          <p className="text-muted-foreground mt-1">Define additional fields for each entity type</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Field</Button>
      </div>

      <div className="flex gap-2">
        {ENTITIES.map(e => (
          <Button key={e} variant={selectedEntity === e ? "default" : "outline"} size="sm" onClick={() => setSelectedEntity(e)} className="capitalize">
            {e}
          </Button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center">No custom fields defined for {selectedEntity}s yet.</p>}
        {filtered.map(f => (
          <Card key={f.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{f.label}</p>
                  <p className="text-sm text-muted-foreground">{f.name} · {f.type}{f.required ? " · required" : ""}</p>
                </div>
                {f.options && f.options.length > 0 && (
                  <div className="flex gap-1">{f.options.map(o => <Badge key={o} variant="secondary" className="text-xs">{o}</Badge>)}</div>
                )}
              </div>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteEntity("customFields", f.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <EntityFormDialog open={formOpen} onOpenChange={setFormOpen} title={`New Custom Field for ${selectedEntity}`} onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Field Name *</Label><Input value={fieldName} onChange={e => setFieldName(e.target.value)} placeholder="e.g. phone_number" required /></div>
          <div><Label>Display Label *</Label><Input value={fieldLabel} onChange={e => setFieldLabel(e.target.value)} placeholder="e.g. Phone Number" required /></div>
        </div>
        <div><Label>Type</Label>
          <Select value={fieldType} onValueChange={setFieldType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{FIELD_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {["select", "multiselect"].includes(fieldType) && (
          <div><Label>Options (comma-separated)</Label><Input value={fieldOptions} onChange={e => setFieldOptions(e.target.value)} placeholder="Option 1, Option 2, Option 3" /></div>
        )}
        <div className="flex items-center gap-2">
          <Switch checked={fieldRequired} onCheckedChange={setFieldRequired} />
          <Label>Required field</Label>
        </div>
      </EntityFormDialog>
    </div>
  );
}
