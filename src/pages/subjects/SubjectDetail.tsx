import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { InfoCard } from "@/components/shared/InfoCard";

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { subjects, teachers, classes, levels } = useData();
  const subject = subjects.find(s => s.id === id);
  if (!subject) return <p className="text-muted-foreground">Subject not found</p>;

  const subjectTeachers = teachers.filter(t => t.subjectIds.includes(id));
  const subjectClasses = teachers.flatMap(t => t.classAssignments.filter(ca => ca.subjectId === id).map(ca => ca.classId));
  const uniqueClassIds = [...new Set(subjectClasses)];
  const getClass = (cid: string) => classes.find(c => c.id === cid);
  const getLevel = (lid: string) => levels.find(l => l.id === lid);

  return (
    <div className="space-y-6">
      <DetailHeader title={subject.name} subtitle={`ID: ${subject.id}`} backTo="/subjects" />
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Teachers" badges={subjectTeachers.map(t => ({ label: `${t.firstName} ${t.lastName}`, link: `/teachers/${t.id}` }))} />
        <InfoCard title="Classes" badges={uniqueClassIds.map(cid => {
          const cls = getClass(cid);
          const lvl = cls ? getLevel(cls.levelId) : null;
          return { label: `${lvl?.name || ""} - Class ${cls?.classNumber || "?"}`, link: `/classes/${cid}` };
        })} />
      </div>
    </div>
  );
}
