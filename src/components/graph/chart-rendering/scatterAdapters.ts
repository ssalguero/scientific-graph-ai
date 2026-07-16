export const getExperimentalPointReactKey = (
  seriesName: string,
  point: { x: number; y: number },
  index: number
) => `${seriesName}-${point.x}-${point.y}-${index}`;

export const mapExperimentalScatterData = (
  seriesName: string,
  points: { x: number; y: number }[]
) =>
  points.map((point, index) => ({
    ...point,
    pointKey: getExperimentalPointReactKey(seriesName, point, index),
  }));
