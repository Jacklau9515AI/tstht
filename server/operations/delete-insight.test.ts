import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { withDB } from "../testing.ts";
import deleteInsight from "./delete-insight.ts";

describe("deleting insights from the database", () => {
  describe("when insight exists", () => {
    withDB((fixture) => {
      let result: boolean;

      beforeAll(() => {
        fixture.insights.insert([
          { brand: 1, createdAt: new Date().toISOString(), text: "Test insight 1" },
          { brand: 2, createdAt: new Date().toISOString(), text: "Test insight 2" },
        ]);

        result = deleteInsight({ ...fixture, id: 1 });
      });

      it("returns true", () => {
        expect(result).toBe(true);
      });

      it("removes the insight from database", () => {
        const allInsights = fixture.insights.selectAll();
        expect(allInsights).toHaveLength(1);
        expect(allInsights[0].text).toBe("Test insight 2");
      });
    });
  });

  describe("when insight does not exist", () => {
    withDB((fixture) => {
      let result: boolean;

      beforeAll(() => {
        result = deleteInsight({ ...fixture, id: 999 });
      });

      it("returns false", () => {
        expect(result).toBe(false);
      });

      it("does not affect the database", () => {
        const allInsights = fixture.insights.selectAll();
        expect(allInsights).toHaveLength(0);
      });
    });
  });

  describe("with populated database", () => {
    withDB((fixture) => {
      beforeAll(() => {
        fixture.insights.insert([
          { brand: 1, createdAt: new Date().toISOString(), text: "Keep this" },
          { brand: 2, createdAt: new Date().toISOString(), text: "Delete this" },
          { brand: 3, createdAt: new Date().toISOString(), text: "Keep this too" },
        ]);
      });

      it("only deletes the specified insight", () => {
        const deleted = deleteInsight({ ...fixture, id: 2 });
        expect(deleted).toBe(true);

        const remaining = fixture.insights.selectAll();
        expect(remaining).toHaveLength(2);
        expect(remaining.map(r => r.text)).toEqual(["Keep this", "Keep this too"]);
      });
    });
  });
}); 