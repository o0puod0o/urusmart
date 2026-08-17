export const EXPERT_GROUP_OPTIONS = [
  { id: "600", label: "Software Engineering" },
  { id: "601", label: "Educational Technology" },
  { id: "602", label: "Community Information System" },
  { id: "603", label: "Smart Campus and IoT" },
  { id: "604", label: "Artificial Intelligence" },
  { id: "605", label: "Public Health Informatics" },
  { id: "606", label: "Tourism Data Platform" },
  { id: "607", label: "Smart Farming" },
  { id: "608", label: "Digital Business" },
  { id: "609", label: "Research Information System" },
  { id: "1", label: "วิทยาศาสตร์และเทคโนโลยี" },
  { id: "2", label: "มนุษยศาสตร์และสังคมศาสตร์" },
  { id: "3", label: "บริหารธุรกิจและการจัดการ" },
  { id: "4", label: "ครุศาสตร์และศึกษาศาสตร์" },
  { id: "5", label: "เกษตรและสิ่งแวดล้อม" },
  { id: "6", label: "วิศวกรรมศาสตร์" },
  { id: "7", label: "นิติศาสตร์และรัฐศาสตร์" },
  { id: "8", label: "ศิลปะและการออกแบบ" },
];

export const getExpertGroupLabel = (groupId) => {
  if (!groupId && groupId !== 0) return "-";
  return (
    EXPERT_GROUP_OPTIONS.find((g) => g.id === String(groupId))?.label ??
    String(groupId)
  );
};

export const getExpertGroupSelectOptions = (placeholder) => [
  { id: "", label: placeholder },
  ...EXPERT_GROUP_OPTIONS,
];

export const getExpertGroupSearchOptions = (placeholder) => [
  { id: "", label: placeholder },
  ...EXPERT_GROUP_OPTIONS,
];

export const normalizeExpertGroupRows = (rows = [], placeholder) => {
  const options = rows
    .map((row, index) => {
      const id =
        row.id ??
        row.group_id ??
        row.expertise_group_id ??
        row.expertise_group ??
        row.value ??
        index + 1;
      const label =
        row.name ??
        row.label ??
        row.title ??
        row.expertise_group_name ??
        row.group_name ??
        "";

      return { id: String(id), label: String(label || id) };
    })
    .filter((row) => row.id && row.label);

  return [{ id: "", label: placeholder }, ...options];
};
