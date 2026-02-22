export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  levelId: string;
  classId?: string;
  photo?: string;
  parentRelations: ParentRelation[];
  customFields?: Record<string, any>;
}

export interface ParentRelation {
  parentId: string;
  relation: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
  subjectIds: string[];
  classAssignments: ClassAssignment[];
  customFields?: Record<string, any>;
}

export interface ClassAssignment {
  classId: string;
  subjectId: string;
}

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
  classIds: string[];
  customFields?: Record<string, any>;
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  studentRelations: StudentRelation[];
  customFields?: Record<string, any>;
}

export interface StudentRelation {
  studentId: string;
  relation: string;
}

export interface SchoolClass {
  id: string;
  classNumber: number;
  levelId: string;
}

export interface Level {
  id: string;
  name: string;
  numberOfClasses: number;
  subjectIds: string[];
}

export interface Subject {
  id: string;
  name: string;
}

export interface CustomField {
  id: string;
  entity: EntityType;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'file' | 'date' | 'checkbox';
  required: boolean;
  options?: string[];
}

export type EntityType = 'student' | 'teacher' | 'manager' | 'parent';

export interface AppData {
  students: Student[];
  teachers: Teacher[];
  managers: Manager[];
  parents: Parent[];
  classes: SchoolClass[];
  levels: Level[];
  subjects: Subject[];
  customFields: CustomField[];
}

export type EntityKey = keyof Omit<AppData, 'customFields'>;
