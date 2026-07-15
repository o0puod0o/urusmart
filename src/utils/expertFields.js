const toDisplayText = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") {
    return firstNonEmpty(
      value.name,
      value.title,
      value.reference,
      value.label,
    );
  }
  return String(value).trim();
};

const firstNonEmpty = (...values) => {
  for (const value of values) {
    const text = toDisplayText(value);
    if (text) return text;
  }
  return "";
};

export const getExpertTitle = (entry) =>
  firstNonEmpty(
    entry?.name,
    entry?.title,
    entry?.reference,
    entry?.citation,
    entry?.proceeding,
    entry?.proceeding_name,
    entry?.proceeding_title,
    entry?.article_title,
    entry?.paper_title,
    entry?.topic,
    entry?.description,
  );

export const getExpertLink = (entry) =>
  firstNonEmpty(
    entry?.link,
    entry?.url,
    entry?.file_url,
    entry?.fileUrl,
    entry?.evidence_url,
    entry?.evidenceUrl,
    entry?.document_url,
    entry?.documentUrl,
  );

export const getExpertYear = (entry) =>
  firstNonEmpty(entry?.year);
