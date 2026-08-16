export const DEPARTMENTS = [
  'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CHEM', 'BIOTECH', 'AIDS', 'MBA', 'OTHER',
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Semester = (typeof SEMESTERS)[number];

export const RESOURCE_TYPES = ['notes', 'pdf', 'assignment', 'slides', 'other'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  notes: 'Notes',
  pdf: 'PDF',
  assignment: 'Assignment',
  slides: 'Slides',
  other: 'Other',
};
