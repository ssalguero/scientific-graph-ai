export const getSampleMeanAndStdDev = (values: number[]) => {
  const count = values.length;
  if (count === 0) return null;

  const mean = values.reduce((sum, value) => sum + value, 0) / count;
  if (count === 1) {
    return { mean, stdDev: 0, count };
  }

  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (count - 1);

  return { mean, stdDev: Math.sqrt(variance), count };
};
