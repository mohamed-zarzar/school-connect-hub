import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { InfoCard } from "@/components/shared/InfoCard";

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const { classes, levels, students, teachers, managers, subjects } = useData();
  const cls = classes.find(c => c.id === id);
  if (!cls) return <p className="text-muted-foreground">Class not found</p>;

  const level = levels.find(l => l.id === cls.levelId);
  const classStudents = students.filter(s => s.classId === id);
  const classTeachers = teachers.filter(t => t.classAssignments.some(ca => ca.classId === id));
  const classManagers = managers.filter(m => m.classIds.includes(id));

  return (
    <div className="space-y-6">
      <DetailHeader title={`${level?.name || "?"} - Class ${cls.classNumber}`} subtitle={`ID: ${cls.id}`} backTo="/classes" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard title="Info" items={[
          { label: "Class Number", value: String(cls.classNumber) },
          { label: "Level", value: level?.name || "-", link: level ? `/levels/${level.id}` : undefined },
        ]} />
        <InfoCard title={`Students (${classStudents.length})`} badges={classStudents.map(s => ({ label: `${s.firstName} ${s.lastName}`, link: `/students/${s.id}` }))} />
        <InfoCard title="Teachers" items={classTeachers.map(t => {
          const assignment = t.classAssignments.find(ca => ca.classId === id);
          const sub = subjects.find(s => s.id === assignment?.subjectId);
          return { label: sub?.name || "-", value: `${t.firstName} ${t.lastName}`, link: `/teachers/${t.id}` };
        })} />
        {classManagers.length > 0 && <InfoCard title="Managers" badges={classManagers.map(m => ({ label: `${m.firstName} ${m.lastName}`, link: `/managers/${m.id}` }))} />}
      </div>
    </div>
  );
}
