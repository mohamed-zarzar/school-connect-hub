import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, UserX, Clock, BarChart3 } from 'lucide-react';
import { classApi, levelApi, studentApi, managerApi } from '@/services/api';
import { studentAttendanceApi } from '@/services/attendance-api';
import { MarkStatisticsPanel } from '@/components/MarkStatisticsPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Student, Manager } from '@/types';

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: classRes, isLoading } = useQuery({ queryKey: ['class', id], queryFn: () => classApi.getById(id!), enabled: !!id });
  const { data: levelsRes } = useQuery({ queryKey: ['levels'], queryFn: () => levelApi.getAll({ page: 1, limit: 1000 }) });
  const { data: studentsRes } = useQuery({ queryKey: ['students'], queryFn: () => studentApi.getAll({ page: 1, limit: 1000 }) });
  const { data: managersRes } = useQuery({ queryKey: ['managers'], queryFn: () => managerApi.getAll({ page: 1, limit: 1000 }) });
  const { data: absencesRes } = useQuery({ queryKey: ['student-absences-all'], queryFn: () => studentAttendanceApi.getAbsences() });
  const { data: latesRes } = useQuery({ queryKey: ['student-lates-all'], queryFn: () => studentAttendanceApi.getLates() });

  const cls = classRes?.data;
  const levels = levelsRes?.data || [];
  const allStudents = studentsRes?.data || [];
  const allManagers = managersRes?.data || [];
  const allAbsences = absencesRes?.data || [];
  const allLates = latesRes?.data || [];

  const classStudents = allStudents.filter((s: Student) => s.classId === id);
  const classManagers = allManagers.filter((m: Manager) => m.classIds.includes(id!));
  const levelName = levels.find(l => l.id === cls?.levelId)?.name || cls?.levelId || '';

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!cls) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Class not found</p><Button variant="outline" className="mt-4" onClick={() => navigate('/classes')}>Back to Classes</Button></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/classes')}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{cls.name}</h1>
          <p className="text-muted-foreground">Section {cls.section} · {levelName}</p>
        </div>
      </div>

      <Tabs defaultValue="information">
        <TabsList>
          <TabsTrigger value="information">Information</TabsTrigger>
          <TabsTrigger value="absences" className="gap-2"><UserX className="h-4 w-4" />Absences</TabsTrigger>
          <TabsTrigger value="lates" className="gap-2"><Clock className="h-4 w-4" />Lates</TabsTrigger>
          <TabsTrigger value="marks" className="gap-2"><BarChart3 className="h-4 w-4" />Mark Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="information">
          <Card>
            <CardHeader><CardTitle>Class Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{cls.name}</p></div>
                <div><p className="text-sm text-muted-foreground">Section</p><p className="font-medium">{cls.section}</p></div>
                <div><p className="text-sm text-muted-foreground">Level</p><p className="font-medium">{levelName}</p></div>
                <div><p className="text-sm text-muted-foreground">Capacity</p><p className="font-medium">{cls.capacity}</p></div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Statistics</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{classStudents.length}</p><p className="text-xs text-muted-foreground">Students</p></CardContent></Card>
                  <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{cls.capacity}</p><p className="text-xs text-muted-foreground">Capacity</p></CardContent></Card>
                  <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{classManagers.length}</p><p className="text-xs text-muted-foreground">Managers</p></CardContent></Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">
                        <Badge variant={classStudents.length >= cls.capacity ? 'destructive' : 'secondary'}>
                          {classStudents.length}/{cls.capacity}
                        </Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">Enrollment</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Students List */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Students</p>
                {classStudents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No students in this class</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {classStudents.map(s => (
                        <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/students/${s.id}`)}>
                          <TableCell className="font-medium">{s.firstname} {s.lastname}</TableCell>
                          <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Managers */}
              {classManagers.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Managers</p>
                  <div className="flex flex-wrap gap-2">
                    {classManagers.map(m => (
                      <Badge key={m.id} variant="outline" className="cursor-pointer" onClick={() => navigate(`/managers/${m.id}`)}>
                        {m.firstname} {m.lastname}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="absences">
          <Card>
            <CardHeader><CardTitle>Student Absences</CardTitle></CardHeader>
            <CardContent>
              {classStudents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No students in this class</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Total Absences</TableHead>
                      <TableHead>Justified</TableHead>
                      <TableHead>Unjustified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map(s => {
                      const absences = allAbsences.filter(a => a.studentId === s.id);
                      return (
                        <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/students/${s.id}`)}>
                          <TableCell className="font-medium">{s.firstname} {s.lastname}</TableCell>
                          <TableCell><Badge variant={absences.length > 0 ? 'destructive' : 'secondary'}>{absences.length}</Badge></TableCell>
                          <TableCell>{absences.filter(a => a.isJustified).length}</TableCell>
                          <TableCell>{absences.filter(a => !a.isJustified).length}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lates">
          <Card>
            <CardHeader><CardTitle>Student Lates</CardTitle></CardHeader>
            <CardContent>
              {classStudents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No students in this class</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Total Lates</TableHead>
                      <TableHead>Justified</TableHead>
                      <TableHead>Unjustified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map(s => {
                      const lates = allLates.filter(l => l.studentId === s.id);
                      return (
                        <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/students/${s.id}`)}>
                          <TableCell className="font-medium">{s.firstname} {s.lastname}</TableCell>
                          <TableCell><Badge variant={lates.length > 0 ? 'destructive' : 'secondary'}>{lates.length}</Badge></TableCell>
                          <TableCell>{lates.filter(l => l.isJustified).length}</TableCell>
                          <TableCell>{lates.filter(l => !l.isJustified).length}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marks">
          <MarkStatisticsPanel
            fixedLevelId={cls.levelId}
            fixedClassId={cls.id}
            showFilters={true}
            title={`Mark Statistics — ${cls.name}`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
