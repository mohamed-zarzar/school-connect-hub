import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { templateApi } from '@/services/api';
import { defaultTemplates } from '@/services/mock-data';
import type { EntityType, FieldDefinition, FieldType, EntityTemplateConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const BASE_FIELDS = ['firstname', 'lastname'];
const FIELD_TYPES: FieldType[] = ['text', 'date', 'select', 'multi-select', 'file', 'number', 'email', 'phone', 'textarea'];

function SortableFieldCard({ field, onEdit, onDelete }: { field: FieldDefinition; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.name });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <Card ref={setNodeRef} style={style} className="shadow-none">
      <CardContent className="flex items-center gap-3 p-3">
        <button {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{field.label}</span>
            <Badge variant="secondary" className="text-xs">{field.type}</Badge>
            {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            {!field.visible && <Badge variant="outline" className="text-xs">Hidden</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">{field.name}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const [activeEntity, setActiveEntity] = useState<EntityType>('student');
  const [localFields, setLocalFields] = useState<FieldDefinition[]>([]);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [deleteFieldName, setDeleteFieldName] = useState<string | null>(null);

  const { data: tplRes } = useQuery({ queryKey: ['templates'], queryFn: () => templateApi.get() });
  const saveMut = useMutation({
    mutationFn: (config: EntityTemplateConfig) => templateApi.update(activeEntity, config),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['templates'] }); toast.success('Template saved'); },
  });

  useEffect(() => {
    if (tplRes?.data) setLocalFields([...tplRes.data[activeEntity].fields]);
  }, [tplRes, activeEntity]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sortedFields.findIndex(f => f.name === active.id);
    const newIdx = sortedFields.findIndex(f => f.name === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const newFields = [...sortedFields];
    const [moved] = newFields.splice(oldIdx, 1);
    newFields.splice(newIdx, 0, moved);
    newFields.forEach((f, i) => f.order = i + 1);
    setLocalFields(newFields);
  };

  const handleSave = () => {
    const config = tplRes?.data?.[activeEntity];
    if (!config) return;
    saveMut.mutate({ ...config, fields: localFields });
  };

  const addField = (field: FieldDefinition) => {
    setLocalFields(prev => [...prev, { ...field, order: prev.length + 1 }]);
    setFieldDialogOpen(false);
  };

  const updateField = (name: string, updated: FieldDefinition) => {
    setLocalFields(prev => prev.map(f => f.name === name ? updated : f));
    setFieldDialogOpen(false);
  };

  const removeField = (name: string) => {
    setLocalFields(prev => prev.filter(f => f.name !== name));
    setDeleteFieldName(null);
  };

  const sortedFields = [...localFields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Template Settings</h1>
          <p className="text-muted-foreground">Configure dynamic fields for each entity type. Drag to reorder.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { if (tplRes?.data) { const def = JSON.parse(JSON.stringify((defaultTemplates as any)[activeEntity].fields)); setLocalFields(def); toast.info('Reset to defaults — click Save to apply'); } }}>Reset to Default</Button>
          <Button onClick={handleSave} disabled={saveMut.isPending}>{saveMut.isPending ? 'Saving...' : 'Save Template'}</Button>
        </div>
      </div>

      <Tabs value={activeEntity} onValueChange={v => setActiveEntity(v as EntityType)}>
        <TabsList>
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="teacher">Teacher</TabsTrigger>
          <TabsTrigger value="manager">Manager</TabsTrigger>
          <TabsTrigger value="parent">Parent</TabsTrigger>
        </TabsList>

        {(['student', 'teacher', 'manager', 'parent'] as EntityType[]).map(entity => (
          <TabsContent key={entity} value={entity} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-30" />
                <span className="font-medium text-sm">firstname</span>
                <Badge variant="secondary" className="text-xs">text</Badge>
                <Badge variant="default" className="text-xs">Base Field</Badge>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-30" />
                <span className="font-medium text-sm">lastname</span>
                <Badge variant="secondary" className="text-xs">text</Badge>
                <Badge variant="default" className="text-xs">Base Field</Badge>
              </div>
              <Separator />
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortedFields.map(f => f.name)} strategy={verticalListSortingStrategy}>
                  {sortedFields.map(field => (
                    <SortableFieldCard
                      key={field.name}
                      field={field}
                      onEdit={() => { setEditingField(field); setFieldDialogOpen(true); }}
                      onDelete={() => setDeleteFieldName(field.name)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <Button variant="outline" onClick={() => { setEditingField(null); setFieldDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Field</Button>
          </TabsContent>
        ))}
      </Tabs>

      <FieldEditorDialog
        open={fieldDialogOpen}
        onOpenChange={setFieldDialogOpen}
        field={editingField}
        existingNames={localFields.map(f => f.name)}
        onSave={(field) => editingField ? updateField(editingField.name, field) : addField(field)}
      />

      <AlertDialog open={!!deleteFieldName} onOpenChange={o => !o && setDeleteFieldName(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove field?</AlertDialogTitle><AlertDialogDescription>This will remove the "{deleteFieldName}" field from the template. Existing data for this field will be preserved but hidden.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeField(deleteFieldName!)}>Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FieldEditorDialog({ open, onOpenChange, field, existingNames, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; field: FieldDefinition | null; existingNames: string[]; onSave: (f: FieldDefinition) => void }) {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<FieldType>('text');
  const [required, setRequired] = useState(false);
  const [visible, setVisible] = useState(true);
  const [editable, setEditable] = useState(true);
  const [placeholder, setPlaceholder] = useState('');
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (field) {
        setName(field.name); setLabel(field.label); setType(field.type); setRequired(field.required);
        setVisible(field.visible); setEditable(field.editable); setPlaceholder(field.placeholder || '');
        setOptions(field.options || []);
      } else {
        setName(''); setLabel(''); setType('text'); setRequired(false); setVisible(true);
        setEditable(true); setPlaceholder(''); setOptions([]);
      }
      setError('');
    }
  }, [open, field]);

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!label.trim()) { setError('Label is required'); return; }
    if (/\s/.test(name)) { setError('Name cannot contain spaces'); return; }
    if (BASE_FIELDS.includes(name)) { setError('Cannot use base field name'); return; }
    if (!field && existingNames.includes(name)) { setError('Name already exists'); return; }
    if ((type === 'select' || type === 'multi-select') && options.length === 0) { setError('Add at least one option'); return; }

    onSave({
      name: name.trim(), label: label.trim(), type, required, visible, editable,
      placeholder: placeholder.trim(), order: field?.order || 999,
      options: (type === 'select' || type === 'multi-select') ? options : undefined,
    });
  };

  const addOption = () => setOptions(prev => [...prev, { value: '', label: '' }]);
  const updateOption = (idx: number, key: 'value' | 'label', val: string) => {
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, [key]: val } : o));
  };
  const removeOption = (idx: number) => setOptions(prev => prev.filter((_, i) => i !== idx));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{field ? 'Edit Field' : 'Add Field'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="field_name" disabled={!!field} />
            </div>
            <div className="space-y-2">
              <Label>Display Label *</Label>
              <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Field Label" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Field Type</Label>
            <Select value={type} onValueChange={v => setType(v as FieldType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FIELD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Placeholder</Label>
            <Input value={placeholder} onChange={e => setPlaceholder(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Required</Label><Switch checked={required} onCheckedChange={setRequired} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Visible</Label><Switch checked={visible} onCheckedChange={setVisible} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Editable</Label><Switch checked={editable} onCheckedChange={setEditable} />
          </div>
          {(type === 'select' || type === 'multi-select') && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Value" value={opt.value} onChange={e => updateOption(i, 'value', e.target.value)} className="flex-1" />
                    <Input placeholder="Label" value={opt.label} onChange={e => updateOption(i, 'label', e.target.value)} className="flex-1" />
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeOption(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOption}><Plus className="mr-1 h-3 w-3" />Add Option</Button>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>{field ? 'Update' : 'Add'} Field</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
