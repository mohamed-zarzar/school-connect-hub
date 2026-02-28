import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi, unitApi } from '@/services/exam-api';
import { levelApi, subjectApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, BookOpen, GripVertical, ArrowLeft, FolderPlus, ChevronRight, Layers, BookMarked } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Lesson, Unit } from '@/types/exam';
import type { Level, Subject } from '@/types';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Sortable Lesson Item ──
function SortableLessonItem({ lesson, onEdit, onDelete, onViewQuestions }: {
  lesson: Lesson;
  onEdit: (l: Lesson) => void;
  onDelete: (id: string) => void;
  onViewQuestions: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200 group">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 text-primary text-xs font-bold shrink-0">
        {lesson.order}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{lesson.name}</p>
        {lesson.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{lesson.description}</p>}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => onViewQuestions(lesson.id)}><BookOpen className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(lesson)}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(lesson.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}

// ── Sortable Unit Group ──
function SortableUnitGroup({ unit, lessons, onEditLesson, onDeleteLesson, onViewQuestions, onReorderLessons, onEditUnit, onDeleteUnit }: {
  unit: Unit;
  lessons: Lesson[];
  onEditLesson: (l: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onViewQuestions: (id: string) => void;
  onReorderLessons: (unitId: string, lessonIds: string[]) => void;
  onEditUnit: (u: Unit) => void;
  onDeleteUnit: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: unit.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = lessons.map(l => l.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    const newIds = [...ids];
    newIds.splice(oldIdx, 1);
    newIds.splice(newIdx, 0, active.id as string);
    onReorderLessons(unit.id, newIds);
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border/60">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/15 text-primary">
          <Layers className="h-3.5 w-3.5" />
        </div>
        <h3 className="font-semibold text-sm text-foreground flex-1">{unit.name}</h3>
        <Badge variant="secondary" className="text-xs font-normal">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</Badge>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEditUnit(unit)}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDeleteUnit(unit.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
      <div className="p-3 space-y-2">
        {lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <BookMarked className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No lessons in this unit yet</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
            <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {lessons.map(lesson => (
                <SortableLessonItem key={lesson.id} lesson={lesson} onEdit={onEditLesson} onDelete={onDeleteLesson} onViewQuestions={onViewQuestions} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

// ── Level Selection Step ──
function LevelSelector({ levels, onSelect }: { levels: Level[]; onSelect: (l: Level) => void }) {
  const styles = [
    { bg: 'bg-primary/5', border: 'border-primary/20', hover: 'hover:border-primary/40 hover:bg-primary/10', icon: '🎓', accent: 'text-primary' },
    { bg: 'bg-accent/30', border: 'border-accent/40', hover: 'hover:border-accent/60 hover:bg-accent/50', icon: '📚', accent: 'text-accent-foreground' },
    { bg: 'bg-destructive/5', border: 'border-destructive/20', hover: 'hover:border-destructive/40 hover:bg-destructive/10', icon: '🏆', accent: 'text-destructive' },
    { bg: 'bg-secondary', border: 'border-border', hover: 'hover:border-primary/30 hover:bg-secondary/80', icon: '⭐', accent: 'text-foreground' },
    { bg: 'bg-muted/50', border: 'border-border', hover: 'hover:border-primary/30 hover:bg-muted', icon: '🌟', accent: 'text-foreground' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-2">
          <Layers className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Select a Level</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Choose the education level to manage its curriculum and lessons</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {levels.map((level, i) => {
          const s = styles[i % styles.length];
          return (
            <button key={level.id} onClick={() => onSelect(level)}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left ${s.bg} ${s.border} ${s.hover}`}>
              <span className="text-4xl block">{s.icon}</span>
              <h3 className={`text-lg font-bold mt-4 ${s.accent}`}>{level.name}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{level.description || 'Click to explore lessons'}</p>
              <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                <span>Explore</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Subject Selection Step ──
function SubjectSelector({ subjects, levelName, onSelect, onBack }: { subjects: Subject[]; levelName: string; onSelect: (s: Subject) => void; onBack: () => void }) {
  const styles = [
    { icon: '📘', bg: 'bg-primary/5', border: 'border-primary/20', hover: 'hover:border-primary/40 hover:bg-primary/10' },
    { icon: '🧪', bg: 'bg-accent/30', border: 'border-accent/40', hover: 'hover:border-accent/60 hover:bg-accent/50' },
    { icon: '🌍', bg: 'bg-secondary', border: 'border-border', hover: 'hover:border-primary/30 hover:bg-secondary/80' },
    { icon: '📐', bg: 'bg-destructive/5', border: 'border-destructive/20', hover: 'hover:border-destructive/40 hover:bg-destructive/10' },
    { icon: '🎨', bg: 'bg-muted/50', border: 'border-border', hover: 'hover:border-primary/30 hover:bg-muted' },
    { icon: '🎵', bg: 'bg-primary/5', border: 'border-primary/20', hover: 'hover:border-primary/40 hover:bg-primary/10' },
    { icon: '💻', bg: 'bg-accent/30', border: 'border-accent/40', hover: 'hover:border-accent/60 hover:bg-accent/50' },
    { icon: '📖', bg: 'bg-secondary', border: 'border-border', hover: 'hover:border-primary/30 hover:bg-secondary/80' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shrink-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Select a Subject</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">Level:</span>
            <Badge variant="secondary" className="font-medium">{levelName}</Badge>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((subject, i) => {
          const s = styles[i % styles.length];
          return (
            <button key={subject.id} onClick={() => onSelect(subject)}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left ${s.bg} ${s.border} ${s.hover}`}>
              <span className="text-4xl block">{s.icon}</span>
              <h3 className="text-lg font-bold mt-4 text-foreground">{subject.name}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{subject.code}</p>
              <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                <span>View lessons</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Lessons Page ──
export default function Lessons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [form, setForm] = useState({ name: '', description: '', unitId: '', order: 1 });
  const [unitForm, setUnitForm] = useState({ name: '' });

  const { data: levelsRes } = useQuery({ queryKey: ['levels-all'], queryFn: () => levelApi.getAll({ page: 1, limit: 100 }) });
  const { data: subjectsRes } = useQuery({ queryKey: ['subjects-all'], queryFn: () => subjectApi.getAll({ page: 1, limit: 100 }) });
  const levels = levelsRes?.data ?? [];
  const subjects = subjectsRes?.data ?? [];

  const { data: lessonsRes } = useQuery({
    queryKey: ['lessons', selectedLevel?.id, selectedSubject?.id],
    queryFn: () => lessonApi.getBySubjectAndLevel(selectedSubject!.id, selectedLevel!.id),
    enabled: !!selectedLevel && !!selectedSubject,
  });

  const { data: unitsRes } = useQuery({
    queryKey: ['units', selectedLevel?.id, selectedSubject?.id],
    queryFn: () => unitApi.getAll({ subjectId: selectedSubject!.id, levelId: selectedLevel!.id }),
    enabled: !!selectedLevel && !!selectedSubject,
  });

  const allLessons = lessonsRes?.data ?? [];
  const allUnits = (unitsRes?.data ?? []).sort((a, b) => a.order - b.order);

  const groupedLessons = useMemo(() => {
    const groups: Record<string, Lesson[]> = {};
    allUnits.forEach(u => { groups[u.id] = []; });
    groups['__ungrouped__'] = [];
    allLessons.forEach(l => {
      const key = l.unitId && groups[l.unitId] !== undefined ? l.unitId : '__ungrouped__';
      groups[key].push(l);
    });
    Object.values(groups).forEach(arr => arr.sort((a, b) => a.order - b.order));
    return groups;
  }, [allLessons, allUnits]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ── Mutations ──
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['lessons'] });
    queryClient.invalidateQueries({ queryKey: ['units'] });
  };

  const createLessonMut = useMutation({
    mutationFn: (data: Omit<Lesson, 'id' | 'createdAt'>) => lessonApi.create(data),
    onSuccess: () => { invalidate(); toast({ title: 'Lesson created' }); setDialogOpen(false); },
  });
  const updateLessonMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lesson> }) => lessonApi.update(id, data),
    onSuccess: () => { invalidate(); toast({ title: 'Lesson updated' }); setDialogOpen(false); },
  });
  const deleteLessonMut = useMutation({
    mutationFn: (id: string) => lessonApi.delete(id),
    onSuccess: () => { invalidate(); toast({ title: 'Lesson deleted' }); },
  });
  const reorderLessonsMut = useMutation({
    mutationFn: (ids: string[]) => lessonApi.reorder(ids),
    onSuccess: () => invalidate(),
  });
  const createUnitMut = useMutation({
    mutationFn: (data: Omit<Unit, 'id' | 'createdAt'>) => unitApi.create(data),
    onSuccess: () => { invalidate(); toast({ title: 'Unit created' }); setUnitDialogOpen(false); },
  });
  const updateUnitMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Unit> }) => unitApi.update(id, data),
    onSuccess: () => { invalidate(); toast({ title: 'Unit updated' }); setUnitDialogOpen(false); },
  });
  const deleteUnitMut = useMutation({
    mutationFn: (id: string) => unitApi.delete(id),
    onSuccess: () => { invalidate(); toast({ title: 'Unit deleted' }); },
  });
  const reorderUnitsMut = useMutation({
    mutationFn: (ids: string[]) => unitApi.reorder(ids),
    onSuccess: () => invalidate(),
  });

  // ── Handlers ──
  const openCreateLesson = () => {
    const maxOrder = Math.max(0, ...allLessons.map(l => l.order));
    setEditing(null);
    setForm({ name: '', description: '', unitId: allUnits[0]?.id ?? '', order: maxOrder + 1 });
    setDialogOpen(true);
  };
  const openEditLesson = (l: Lesson) => {
    setEditing(l);
    setForm({ name: l.name, description: l.description, unitId: l.unitId, order: l.order });
    setDialogOpen(true);
  };
  const handleSubmitLesson = () => {
    if (!form.name) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    const data = { name: form.name, description: form.description, subjectId: selectedSubject!.id, levelId: selectedLevel!.id, unitId: form.unitId, order: form.order };
    if (editing) updateLessonMut.mutate({ id: editing.id, data });
    else createLessonMut.mutate(data);
  };

  const openCreateUnit = () => { setEditingUnit(null); setUnitForm({ name: '' }); setUnitDialogOpen(true); };
  const openEditUnit = (u: Unit) => { setEditingUnit(u); setUnitForm({ name: u.name }); setUnitDialogOpen(true); };
  const handleSubmitUnit = () => {
    if (!unitForm.name) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    if (editingUnit) updateUnitMut.mutate({ id: editingUnit.id, data: { name: unitForm.name } });
    else createUnitMut.mutate({ name: unitForm.name, subjectId: selectedSubject!.id, levelId: selectedLevel!.id, order: allUnits.length + 1 });
  };

  const handleReorderLessons = (unitId: string, lessonIds: string[]) => {
    reorderLessonsMut.mutate(lessonIds);
  };

  const handleUnitDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = allUnits.map(u => u.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    const newIds = [...ids];
    newIds.splice(oldIdx, 1);
    newIds.splice(newIdx, 0, active.id as string);
    reorderUnitsMut.mutate(newIds);
  };

  // ── Step rendering ──
  if (!selectedLevel) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lessons</h1>
          <p className="text-sm text-muted-foreground">Manage lessons by level and subject</p>
        </div>
        <LevelSelector levels={levels} onSelect={setSelectedLevel} />
      </div>
    );
  }

  if (!selectedSubject) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lessons</h1>
          <p className="text-sm text-muted-foreground">Manage lessons by level and subject</p>
        </div>
        <SubjectSelector subjects={subjects} levelName={selectedLevel.name} onSelect={setSelectedSubject} onBack={() => setSelectedLevel(null)} />
      </div>
    );
  }

  // ── Full lessons view ──
  const ungroupedLessons = groupedLessons['__ungrouped__'] ?? [];
  const totalLessons = allLessons.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shrink-0" onClick={() => setSelectedSubject(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lessons</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <button onClick={() => { setSelectedLevel(null); setSelectedSubject(null); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {selectedLevel.name}
              </button>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              <button onClick={() => setSelectedSubject(null)} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                {selectedSubject.name}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="hidden sm:flex gap-1.5 py-1.5 px-3">
            <BookMarked className="h-3.5 w-3.5" />
            {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
          </Badge>
          <Button variant="outline" className="rounded-xl" onClick={openCreateUnit}>
            <FolderPlus className="h-4 w-4 mr-2" /> Add Unit
          </Button>
          <Button className="rounded-xl" onClick={openCreateLesson}>
            <Plus className="h-4 w-4 mr-2" /> Add Lesson
          </Button>
        </div>
      </div>

      {/* Units with drag-and-drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleUnitDragEnd}>
        <SortableContext items={allUnits.map(u => u.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {allUnits.map(unit => (
              <SortableUnitGroup
                key={unit.id}
                unit={unit}
                lessons={groupedLessons[unit.id] ?? []}
                onEditLesson={openEditLesson}
                onDeleteLesson={id => deleteLessonMut.mutate(id)}
                onViewQuestions={id => navigate(`/questions?lessonId=${id}`)}
                onReorderLessons={handleReorderLessons}
                onEditUnit={openEditUnit}
                onDeleteUnit={id => deleteUnitMut.mutate(id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Ungrouped lessons */}
      {ungroupedLessons.length > 0 && (
        <Card className="border-dashed border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Ungrouped Lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ungroupedLessons.map(lesson => (
              <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200 group">
                <div className="flex items-center justify-center h-7 w-7 rounded-md bg-muted text-muted-foreground text-xs font-bold shrink-0">
                  {lesson.order}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{lesson.name}</p>
                  {lesson.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{lesson.description}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => navigate(`/questions?lessonId=${lesson.id}`)}><BookOpen className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEditLesson(lesson)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteLessonMut.mutate(lesson.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {allUnits.length === 0 && ungroupedLessons.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-muted mb-4">
              <BookMarked className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No lessons yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Start by creating a unit to organize your lessons, then add lessons to it.</p>
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" className="rounded-xl" onClick={openCreateUnit}>
                <FolderPlus className="h-4 w-4 mr-2" /> Create Unit
              </Button>
              <Button className="rounded-xl" onClick={openCreateLesson}>
                <Plus className="h-4 w-4 mr-2" /> Add Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Lesson name" /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" /></div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <div className="flex gap-2">
                <Select value={form.unitId} onValueChange={v => setForm(f => ({ ...f, unitId: v }))}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {allUnits.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => { setDialogOpen(false); openCreateUnit(); }}><FolderPlus className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Order</Label><Input type="number" min={1} value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 1 }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitLesson} disabled={createLessonMut.isPending || updateLessonMut.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unit Dialog */}
      <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Unit Name *</Label><Input value={unitForm.name} onChange={e => setUnitForm({ name: e.target.value })} placeholder="e.g. Unit 1: Basics" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitUnit} disabled={createUnitMut.isPending || updateUnitMut.isPending}>
              {editingUnit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
