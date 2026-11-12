import { CurvePath, LineCurve3, QuadraticBezierCurve3, Vector3 } from 'three';
export const CITY_SIZE = 88;
export const CITY_BUILDINGS = [
  { topic: 'word', name: 'MICROSOFT WORD', position: [-20, 0, -20], color: '#368ddd' },
  { topic: 'excel', name: 'MICROSOFT EXCEL', position: [0, 0, -20], color: '#28a76d' },
  { topic: 'powerpoint', name: 'MICROSOFT POWERPOINT', position: [20, 0, -20], color: '#e5784d' },
];
export const CITY_BOOKS = [
  [-2, 4],
  [2, 2],
  [-5, 1],
  [4, -2],
  [0, -4],
];
export function cityToMap(x, z) {
  return {
    left: Math.max(0, Math.min(100, ((x + 44) / 88) * 100)),
    top: Math.max(0, Math.min(100, ((z + 44) / 88) * 100)),
  };
}

export function createTrafficRoute(extent) {
  const e = extent + 1.2,
    r = 2,
    v = (x, z) => new Vector3(x, 0, z),
    route = new CurvePath();
  route.add(new LineCurve3(v(e, -e + r), v(e, e - r)));
  route.add(new QuadraticBezierCurve3(v(e, e - r), v(e, e), v(e - r, e)));
  route.add(new LineCurve3(v(e - r, e), v(-e + r, e)));
  route.add(new QuadraticBezierCurve3(v(-e + r, e), v(-e, e), v(-e, e - r)));
  route.add(new LineCurve3(v(-e, e - r), v(-e, -e + r)));
  route.add(new QuadraticBezierCurve3(v(-e, -e + r), v(-e, -e), v(-e + r, -e)));
  route.add(new LineCurve3(v(-e + r, -e), v(e - r, -e)));
  route.add(new QuadraticBezierCurve3(v(e - r, -e), v(e, -e), v(e, -e + r)));
  return route;
}
