import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { InfoCard } from "@/components/shared/InfoCard";

export default function TeacherDetail() {
  const { id } = useParams<{ id: string }>();
  const { teachers, subjects, classes, levels } = useData();
  const teacher = teachers.find(t => t.id === id);
  if (!teacher) return <p className="text-muted-foreground">Teacher not found</p>;

  const teacherSubjects = teacher.subjectIds.map(sid => subjects.find(s => s.id === sid)).filter(Boolean);
  const getClass = (cid: string) => classes.find(c => c.id === cid);
  const getLevel = (lid: string) => levels.find(l => l.id === lid);
  const getSubject = (sid: string) => subjects.find(s => s.id === sid);

  return (
    <div className="space-y-6">
      <DetailHeader title={`${teacher.firstName} ${teacher.lastName}`} subtitle={`ID: ${teacher.id}`} backTo="/teachers" showQR qrValue={window.location.href} photo={teacher.photo} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard title="Basic Info" items={[
          { label: "First Name", value: teacher.firstName },
          { label: "Last Name", value: teacher.lastName },
          { label: "ID", value: teacher.id },
        ]} />
        <InfoCard title="Subjects" badges={teacherSubjects.map(s => ({ label: s!.name, link: `/subjects/${s!.id}` }))} />
        <InfoCard title="Class Assignments" items={teacher.classAssignments.map(ca => {
          const cls = getClass(ca.classId);
          const lvl = cls ? getLevel(cls.levelId) : null;
          const sub = getSubject(ca.subjectId);
          return { label: sub?.name || "-", value: `${lvl?.name || ""} - Class ${cls?.classNumber || "?"}`, link: `/classes/${ca.classId}` };
        })} />
      </div>
    </div>
  );
}
