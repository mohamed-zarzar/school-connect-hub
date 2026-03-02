import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examApi, attemptApi } from '@/services/exam-api';
import { studentApi, levelApi, subjectApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Plus, Trash2, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/types/exam';

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMaxScore, setEditMaxScore] = useState(100);
  const [editStatus, setEditStatus] = useState<'draft' | 'published'>('published');

  const [scoreOpen, setScoreOpen] = useState(false);
  const [scoreStudentId, setScoreStudentId] = useState('');
  const [scoreValue, setScoreValue] = useState(0);

  const { data: examRes } = useQuery({ queryKey: ['exam', id], queryFn: () => examApi.getById(id!) });
  const exam = examRes?.data;

  const { data: questionsRes } = useQuery({
    queryKey: ['exam-questions', id],
    queryFn: () => examApi.getQuestionsForExam(id!),
    enabled: !!exam,
  });
  const questions: Question[] = questionsRes?.data ?? [];

  const { data: attemptsRes } = useQuery({
    queryKey: ['exam-attempts', id],
    queryFn: () => attemptApi.getByExam(id!),
    enabled: !!exam,
  });
  const attempts = attemptsRes?.data ?? [];

  const { data: studentsRes } = useQuery({ queryKey: ['students-all'], queryFn: () => studentApi.getAll({ page: 1, limit: 100 }) });
  const students = studentsRes?.data ?? [];

  const { data: levelsRes } = useQuery({ queryKey: ['levels-all'], queryFn: () => levelApi.getAll({ page: 1, limit: 100 }) });
  const { data: subjectsRes } = useQuery({ queryKey: ['subjects-all'], queryFn: () => subjectApi.getAll({ page: 1, limit: 100 }) });

  const updateMut = useMutation({
    mutationFn: () => examApi.update(id!, { name: editName, maxScore: editMaxScore, status: editStatus }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exam', id] }); toast({ title: 'Exam updated' }); setEditOpen(false); },
  });

  const addScoreMut = useMutation({
    mutationFn: () => attemptApi.addManual(id!, scoreStudentId, scoreValue),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exam-attempts', id] }); toast({ title: 'Score added' }); setScoreOpen(false); },
  });

  const getStudentName = (sid: string) => {
    const s = students.find(st => st.id === sid);
    return s ? `${s.firstname} ${s.lastname}` : sid;
  };

  const openEdit = () => {
    if (!exam) return;
    setEditName(exam.name);
    setEditMaxScore(exam.maxScore);
    setEditStatus(exam.status);
    setEditOpen(true);
  };

  const openAddScore = () => {
    setScoreStudentId('');
    setScoreValue(0);
    setScoreOpen(true);
  };

  if (!exam) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  const levelName = levelsRes?.data?.find(l => l.id === exam.levelId)?.name ?? '';
  const subjectName = subjectsRes?.data?.find(s => s.id === exam.subjectId)?.name ?? '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/exams')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{exam.name}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline">{levelName}</Badge>
              <Badge variant="secondary">{subjectName}</Badge>
              <Badge variant={exam.status === 'published' ? 'default' : 'outline'}>{exam.status}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEdit}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          <Button variant="destructive" onClick={() => {
            if (confirm('Delete this exam?')) {
              examApi.delete(id!).then(() => { navigate('/exams'); });
            }
          }}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info"><BookOpen className="h-4 w-4 mr-1" /> Info & Questions</TabsTrigger>
          <TabsTrigger value="records"><Users className="h-4 w-4 mr-1" /> Student Records ({attempts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{questions.length}</p><p className="text-sm text-muted-foreground">Questions</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{exam.maxScore}</p><p className="text-sm text-muted-foreground">Max Score</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{attempts.length}</p><p className="text-sm text-muted-foreground">Attempts</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length * 10) / 10 : '—'}</p><p className="text-sm text-muted-foreground">Avg Score</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Questions</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Answer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No questions</TableCell></TableRow>
                  ) : questions.map((q, i) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell className="text-foreground">{q.text}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{q.type}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{q.difficulty}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{q.options.map(o => o.text).join(' | ')}</TableCell>
                      <TableCell className="font-medium text-primary">{q.options.find(o => o.id === q.correctAnswerId)?.text}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={openAddScore}><Plus className="h-4 w-4 mr-2" /> Add Score</Button>
          </div>
          <Card>
            <CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No records yet</TableCell></TableRow>
                  ) : attempts.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-foreground">{getStudentName(a.studentId)}</TableCell>
                      <TableCell>{a.score}</TableCell>
                      <TableCell>{a.totalQuestions}</TableCell>
                      <TableCell>
                        <Badge variant={a.score / a.totalQuestions >= 0.5 ? 'default' : 'destructive'}>
                          {Math.round((a.score / a.totalQuestions) * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(a.completedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Exam</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
            <div><Label>Max Score</Label><Input type="number" min={1} value={editMaxScore} onChange={e => setEditMaxScore(parseInt(e.target.value) || 100)} /></div>
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={v => setEditStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Score Dialog */}
      <Dialog open={scoreOpen} onOpenChange={setScoreOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Student Score</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student *</Label>
              <Select value={scoreStudentId} onValueChange={setScoreStudentId}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.firstname} {s.lastname}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Score</Label>
              <Input type="number" min={0} max={questions.length} value={scoreValue} onChange={e => setScoreValue(parseInt(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground mt-1">Out of {questions.length} questions</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScoreOpen(false)}>Cancel</Button>
            <Button onClick={() => addScoreMut.mutate()} disabled={addScoreMut.isPending || !scoreStudentId}>Add Score</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
