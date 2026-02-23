import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { teacherApi, subjectApi, classApi, levelApi, templateApi } from '@/services/api';
import { buildDynamicSchema, getDynamicDefaults } from '@/lib/schema-builder';
import type { Teacher } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, type Column } from '@/components/DataTable';
import { DynamicFormFields } from '@/components/DynamicFormFields';
import { InlineSubjectCreate } from '@/components/InlineCreateDialog';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ExcelImportDialog } from '@/components/ExcelImportDialog';

export default function TeachersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data: res, isLoading } = useQuery({ queryKey: ['teachers'], queryFn: () => teacherApi.getAll({ page: 1, limit: 1000 }) });
  const { data: tplRes } = useQuery({ queryKey: ['templates'], queryFn: () => templateApi.get() });
  const { data: subjectsRes } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectApi.getAll({ page: 1, limit: 1000 }) });
  const { data: classesRes } = useQuery({ queryKey: ['classes'], queryFn: () => classApi.getAll({ page: 1, limit: 1000 }) });
  const { data: levelsRes } = useQuery({ queryKey: ['levels'], queryFn: () => levelApi.getAll({ page: 1, limit: 1000 }) });

  const fields = tplRes?.data?.teacher?.fields || [];

  const createMut = useMutation({ mutationFn: (d: Partial<Teacher>) => teacherApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setDialogOpen(false); toast.success('Teacher created'); } });
  const updateMut = useMutation({ mutationFn: ({ id, ...d }: any) => teacherApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setDialogOpen(false); toast.success('Teacher updated'); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => teacherApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast.success('Teacher deleted'); } });

  const columns: Column<Teacher>[] = useMemo(() => [
    { key: 'firstname', label: 'First Name' },
    { key: 'lastname', label: 'Last Name' },
    { key: 'subjectIds', label: 'Subjects', render: t => t.subjectIds.map(id => subjectsRes?.data?.find(s => s.id === id)?.name).filter(Boolean).join(', ') || '—' },
    ...fields.filter(f => f.visible).slice(0, 2).map(f => ({ key: f.name, label: f.label, render: (t: Teacher) => String(t.dynamicFields?.[f.name] ?? '—') })),
  ], [fields, subjectsRes]);

  const handleImport = (rows: Record<string, string>[]) => {
    let count = 0;
    rows.forEach(row => {
      const teacher: Partial<Teacher> = { firstname: row['First Name'] || row['firstname'] || '', lastname: row['Last Name'] || row['lastname'] || '', subjectIds: [], classIds: [], dynamicFields: {} };
      if (teacher.firstname && teacher.lastname) { createMut.mutate(teacher); count++; }
    });
    toast.success(`Imported ${count} teachers`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Teachers</h1><p className="text-muted-foreground">{res?.total ?? 0} teachers</p></div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Teacher</Button>
      </div>
      <DataTable data={res?.data || []} columns={columns} isLoading={isLoading} searchPlaceholder="Search teachers..." onView={t => navigate(`/teachers/${t.id}`)} onEdit={t => { setEditing(t); setDialogOpen(true); }} onDelete={t => setDeleteTarget(t)} exportFilename="teachers" onImportClick={() => setImportOpen(true)} />
      <TeacherDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} fields={fields} subjects={subjectsRes?.data || []} classes={classesRes?.data || []} levels={levelsRes?.data || []} isSubmitting={createMut.isPending || updateMut.isPending} onSubmit={(data: any) => editing ? updateMut.mutate({ id: editing.id, ...data }) : createMut.mutate(data)} />
      <ExcelImportDialog open={importOpen} onOpenChange={setImportOpen} onImport={handleImport} expectedColumns={['First Name', 'Last Name']} />
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete teacher?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {deleteTarget?.firstname} {deleteTarget?.lastname}.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteMut.mutate(deleteTarget!.id); setDeleteTarget(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TeacherDialog({ open, onOpenChange, editing, fields, subjects, classes, levels, isSubmitting, onSubmit }: any) {
  const schema = z.object({
    firstname: z.string().min(1, 'Required'),
    lastname: z.string().min(1, 'Required'),
    subjectIds: z.array(z.string()).optional(),
    classIds: z.array(z.string()).optional(),
    photo: z.string().optional(),
    ...buildDynamicSchema(fields)
  });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: '',
      lastname: '',
      subjectIds: [],
      classIds: [],
      photo: '',
      ...getDynamicDefaults(fields)
    }
  });

  // Reset form when dialog opens or when editing/fields change
  useEffect(() => {
    if (open) {
      form.reset({
        firstname: editing?.firstname || '',
        lastname: editing?.lastname || '',
        subjectIds: editing?.subjectIds || [],
        classIds: editing?.classIds || [],
        photo: editing?.dynamicFields?.photo || '',
        ...getDynamicDefaults(fields, editing?.dynamicFields)
      });
    }
  }, [open, editing, fields, form]);

  const handleSubmit = (data: any) => {
    const { firstname, lastname, subjectIds, classIds, photo, ...rest } = data;
    onSubmit({ firstname, lastname, subjectIds, classIds, dynamicFields: { ...rest, photo } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="photo" render={({ field }) => (
              <FormItem>
                <PhotoUpload value={field.value} onChange={field.onChange} initials={(form.watch('firstname')?.[0] || '') + (form.watch('lastname')?.[0] || '')} />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstname" render={({ field }) => (
                <FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lastname" render={({ field }) => (
                <FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="subjectIds" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Subjects</FormLabel>
                  <InlineSubjectCreate />
                </div>
                <div className="rounded-md border p-3 max-h-32 overflow-auto space-y-2">
                  {subjects.map((s: any) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={(field.value || []).includes(s.id)}
                        onCheckedChange={c => {
                          const v = field.value || [];
                          field.onChange(c ? [...v, s.id] : v.filter((x: string) => x !== s.id));
                        }}
                      />
                      {s.name} ({s.code})
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="classIds" render={({ field }) => (
              <FormItem>
                <FormLabel>Classes</FormLabel>
                <div className="rounded-md border p-3 max-h-40 overflow-auto space-y-3">
                  {levels.map((l: any) => (
                    <div key={l.id}>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">{l.name}</p>
                      {classes.filter((c: any) => c.levelId === l.id).map((c: any) => (
                        <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer ml-2">
                          <Checkbox
                            checked={(field.value || []).includes(c.id)}
                            onCheckedChange={ch => {
                              const v = field.value || [];
                              field.onChange(ch ? [...v, c.id] : v.filter((x: string) => x !== c.id));
                            }}
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <DynamicFormFields fields={fields} control={form.control} />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}