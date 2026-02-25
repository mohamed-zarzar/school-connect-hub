import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi } from '@/services/exam-api';
import { levelApi, subjectApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, BookOpen, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Lesson } from '@/types/exam';

export default function Lessons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [form, setForm] = useState({ name: '', description: '', subjectId: '', levelId: '', order: 1 });

  const { data: levelsRes } = useQuery({ queryKey: ['levels-all'], queryFn: () => levelApi.getAll({ page: 1, limit: 100 }) });
  const { data: subjectsRes } = useQuery({ queryKey: ['subjects-all'], queryFn: () => subjectApi.getAll({ page: 1, limit: 100 }) });
  const levels = levelsRes?.data ?? [];
  const subjects = subjectsRes?.data ?? [];

  const { data: lessonsRes, isLoading } = useQuery({
    queryKey: ['lessons', page, search, filterSubject, filterLevel],
    queryFn: () => lessonApi.getAll({
      page, limit: 10, search,
      subjectId: filterSubject !== 'all' ? filterSubject : undefined,
      levelId: filterLevel !== 'all' ? filterLevel : undefined,
    }),
  });

  const createMut = useMutation({
    mutationFn: (data: Omit<Lesson, 'id' | 'createdAt'>) => lessonApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lessons'] }); toast({ title: 'Lesson created' }); setDialogOpen(false); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lesson> }) => lessonApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lessons'] }); toast({ title: 'Lesson updated' }); setDialogOpen(false); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => lessonApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lessons'] }); toast({ title: 'Lesson deleted' }); },
  });

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', subjectId: '', levelId: '', order: 1 }); setDialogOpen(true); };
  const openEdit = (l: Lesson) => { setEditing(l); setForm({ name: l.name, description: l.description, subjectId: l.subjectId, levelId: l.levelId, order: l.order }); setDialogOpen(true); };
  const handleSubmit = () => {
    if (!form.name || !form.subjectId || !form.levelId) { toast({ title: 'Fill required fields', variant: 'destructive' }); return; }
    if (editing) updateMut.mutate({ id: editing.id, data: form });
    else createMut.mutate(form);
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name ?? id;
  const getLevelName = (id: string) => levels.find(l => l.id === id)?.name ?? id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lessons</h1>
          <p className="text-sm text-muted-foreground">Manage lessons by subject and level</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Lesson</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search lessons..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={filterLevel} onValueChange={v => { setFilterLevel(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Levels" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterSubject} onValueChange={v => { setFilterSubject(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Subjects" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : !lessonsRes?.data?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No lessons found</TableCell></TableRow>
              ) : lessonsRes.data.map(lesson => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{lesson.name}</p>
                      <p className="text-xs text-muted-foreground">{lesson.description}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{getSubjectName(lesson.subjectId)}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{getLevelName(lesson.levelId)}</Badge></TableCell>
                  <TableCell>{lesson.order}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/questions?lessonId=${lesson.id}`)}><BookOpen className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(lesson)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(lesson.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {lessonsRes && lessonsRes.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground self-center">Page {page} of {lessonsRes.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= lessonsRes.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Lesson name" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" /></div>
            <div>
              <Label>Level *</Label>
              <Select value={form.levelId} onValueChange={v => setForm(f => ({ ...f, levelId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>{levels.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject *</Label>
              <Select value={form.subjectId} onValueChange={v => setForm(f => ({ ...f, subjectId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Order</Label><Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 1 }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
