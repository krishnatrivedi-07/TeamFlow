export const validId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));
export const requiredText = (value, label, max = 160) => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw Object.assign(
      new Error(`${label} is required and must be under ${max} characters.`),
      { status: 400 },
    );
  return value.trim();
};
