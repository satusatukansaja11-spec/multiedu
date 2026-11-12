import { expect, it } from 'vitest';
import { CITY_BUILDINGS, CITY_SIZE, cityToMap, createTrafficRoute } from './city-layout.js';
it('keeps the traffic loops closed and on the road network', () => {
  for (const extent of [10, 30]) {
    const route = createTrafficRoute(extent);
    expect(route.getPointAt(0).distanceTo(route.getPointAt(1))).toBeLessThan(0.0001);
    for (let i = 0; i < 200; i++) {
      const p = route.getPointAt(i / 200);
      const roadDistance = Math.min(
        Math.abs(Math.abs(p.x) - extent),
        Math.abs(Math.abs(p.z) - extent),
      );
      expect(roadDistance).toBeLessThan(3);
      expect(Math.abs(p.x)).toBeLessThan(CITY_SIZE / 2);
      expect(Math.abs(p.z)).toBeLessThan(CITY_SIZE / 2);
    }
  }
});
it('places all Office entrances inside the map with accurate minimap coordinates', () => {
  expect(CITY_BUILDINGS.map((b) => b.topic)).toEqual(['word', 'excel', 'powerpoint']);
  expect(cityToMap(0, 0)).toEqual({ left: 50, top: 50 });
  for (const b of CITY_BUILDINGS) {
    const point = cityToMap(b.position[0], b.position[2]);
    expect(point.left).toBeGreaterThan(0);
    expect(point.left).toBeLessThan(100);
    expect(point.top).toBeGreaterThan(0);
    expect(point.top).toBeLessThan(100);
  }
});
