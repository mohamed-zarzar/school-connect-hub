import { AppData } from "@/types";

export const initialData: AppData = {
  subjects: [
    { id: "sub-1", name: "Mathematics" },
    { id: "sub-2", name: "Physics" },
    { id: "sub-3", name: "Chemistry" },
    { id: "sub-4", name: "Biology" },
    { id: "sub-5", name: "English" },
    { id: "sub-6", name: "History" },
    { id: "sub-7", name: "Geography" },
  ],
  levels: [
    { id: "lvl-1", name: "Grade 9", numberOfClasses: 3, subjectIds: ["sub-1", "sub-2", "sub-3", "sub-5"] },
    { id: "lvl-2", name: "Grade 10", numberOfClasses: 3, subjectIds: ["sub-1", "sub-2", "sub-4", "sub-5", "sub-6"] },
    { id: "lvl-3", name: "Grade 11", numberOfClasses: 2, subjectIds: ["sub-1", "sub-3", "sub-5", "sub-7"] },
  ],
  classes: [
    { id: "cls-1", classNumber: 1, levelId: "lvl-1" },
    { id: "cls-2", classNumber: 2, levelId: "lvl-1" },
    { id: "cls-3", classNumber: 3, levelId: "lvl-1" },
    { id: "cls-4", classNumber: 1, levelId: "lvl-2" },
    { id: "cls-5", classNumber: 2, levelId: "lvl-2" },
    { id: "cls-6", classNumber: 3, levelId: "lvl-2" },
    { id: "cls-7", classNumber: 1, levelId: "lvl-3" },
    { id: "cls-8", classNumber: 2, levelId: "lvl-3" },
  ],
  parents: [
    { id: "par-1", firstName: "Ahmed", lastName: "Hassan", studentRelations: [{ studentId: "stu-1", relation: "Father" }] },
    { id: "par-2", firstName: "Fatima", lastName: "Hassan", studentRelations: [{ studentId: "stu-1", relation: "Mother" }] },
    { id: "par-3", firstName: "Omar", lastName: "Ali", studentRelations: [{ studentId: "stu-2", relation: "Father" }] },
    { id: "par-4", firstName: "Sara", lastName: "Karim", studentRelations: [{ studentId: "stu-3", relation: "Mother" }] },
  ],
  students: [
    { id: "stu-1", firstName: "Youssef", lastName: "Hassan", levelId: "lvl-1", classId: "cls-1", parentRelations: [{ parentId: "par-1", relation: "Father" }, { parentId: "par-2", relation: "Mother" }] },
    { id: "stu-2", firstName: "Amina", lastName: "Ali", levelId: "lvl-1", classId: "cls-1", parentRelations: [{ parentId: "par-3", relation: "Father" }] },
    { id: "stu-3", firstName: "Khalid", lastName: "Karim", levelId: "lvl-2", classId: "cls-4", parentRelations: [{ parentId: "par-4", relation: "Mother" }] },
    { id: "stu-4", firstName: "Layla", lastName: "Mansour", levelId: "lvl-2", classId: "cls-5", parentRelations: [] },
    { id: "stu-5", firstName: "Tariq", lastName: "Nabil", levelId: "lvl-3", classId: "cls-7", parentRelations: [] },
  ],
  teachers: [
    { id: "tch-1", firstName: "Dr. Hana", lastName: "Saleh", subjectIds: ["sub-1", "sub-2"], classAssignments: [{ classId: "cls-1", subjectId: "sub-1" }, { classId: "cls-4", subjectId: "sub-2" }] },
    { id: "tch-2", firstName: "Mr. Kamal", lastName: "Reda", subjectIds: ["sub-5", "sub-6"], classAssignments: [{ classId: "cls-1", subjectId: "sub-5" }, { classId: "cls-5", subjectId: "sub-6" }] },
    { id: "tch-3", firstName: "Ms. Nadia", lastName: "Faris", subjectIds: ["sub-3", "sub-4"], classAssignments: [{ classId: "cls-2", subjectId: "sub-3" }] },
  ],
  managers: [
    { id: "mgr-1", firstName: "Ibrahim", lastName: "Zaki", classIds: ["cls-1", "cls-2", "cls-3"] },
    { id: "mgr-2", firstName: "Rania", lastName: "Mostafa", classIds: ["cls-4", "cls-5", "cls-6"] },
  ],
  customFields: [],
};

let counter = 100;
export const generateId = (prefix: string = "id") => `${prefix}-${++counter}`;
