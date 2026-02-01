import { generateUUID } from './uuid.util';

describe('uuid.util', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID v4 string', () => {
      const uuid = generateUUID();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuid).toMatch(uuidV4Regex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      const uuid3 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
      expect(uuid2).not.toBe(uuid3);
      expect(uuid1).not.toBe(uuid3);
    });

    it('should generate UUID with correct length', () => {
      const uuid = generateUUID();

      // UUID format: 8-4-4-4-12 = 32 hex chars + 4 hyphens = 36 chars
      expect(uuid.length).toBe(36);
    });

    it('should generate UUID with hyphens at correct positions', () => {
      const uuid = generateUUID();

      expect(uuid.charAt(8)).toBe('-');
      expect(uuid.charAt(13)).toBe('-');
      expect(uuid.charAt(18)).toBe('-');
      expect(uuid.charAt(23)).toBe('-');
    });

    it('should generate multiple unique UUIDs in bulk', () => {
      const uuids = new Set<string>();

      for (let i = 0; i < 100; i++) {
        uuids.add(generateUUID());
      }

      // All 100 should be unique
      expect(uuids.size).toBe(100);
    });
  });
});
