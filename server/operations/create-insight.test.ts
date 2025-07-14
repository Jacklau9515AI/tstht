import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import type { Insight } from "$models/insight.ts";
import { withDB } from "../testing.ts";
import createInsight from "./create-insight.ts";

describe("creating insights in the database", () => {
  withDB((fixture) => {
    let result: any;
    const testInput = {
      brandId: 3,
      text: "This is a test insight",
    };

    beforeAll(() => {
      result = createInsight({ ...fixture, ...testInput });
    });

    it("returns success and the created insight", () => {
      expect(result.success).toBe(true);
      expect(result.insight.id).toBeGreaterThan(0);
      expect(result.insight.brandId).toBe(testInput.brandId);
      expect(result.insight.text).toBe(testInput.text);
      expect(result.insight.date).toBeInstanceOf(Date);
    });

    it("stores the insight in the database", () => {
      const allInsights = fixture.insights.selectAll();
      expect(allInsights).toHaveLength(1);
      
      const stored = allInsights[0];
      expect(stored.id).toBe(result.id);
      expect(stored.brand).toBe(testInput.brandId);
      expect(stored.text).toBe(testInput.text);
      expect(stored.createdAt).toBe(result.date.toISOString());
    });
  });

  describe("with multiple insights", () => {
    withDB((fixture) => {
      let firstResult: Insight;
      let secondResult: Insight;

      beforeAll(() => {
        firstResult = createInsight({
          ...fixture,
          brandId: 1,
          text: "First insight",
        });
        secondResult = createInsight({
          ...fixture,
          brandId: 2,
          text: "Second insight",
        });
      });

      it("assigns different IDs", () => {
        expect(firstResult.id).not.toBe(secondResult.id);
      });

          it("stores both insights", () => {
      const allInsights = fixture.insights.selectAll();
      expect(allInsights).toHaveLength(2);
    });
  });

  describe("with duplicate content", () => {
    withDB((fixture) => {
      let firstResult: any;
      let sameTextDifferentBrandResult: any;
      let duplicateResult: any;

      beforeAll(() => {
        // Create first insight for brand 1
        firstResult = createInsight({
          ...fixture,
          brandId: 1,
          text: "Summer fashion trending",
        });
        
        // Try to create same content for different brand (should succeed)
        sameTextDifferentBrandResult = createInsight({
          ...fixture,
          brandId: 2, // Different brand but same text
          text: "Summer fashion trending",
        });

        // Try to create duplicate content for same brand (should fail)
        duplicateResult = createInsight({
          ...fixture,
          brandId: 1, // Same brand and same text
          text: "Summer fashion trending",
        });
      });

      it("allows first insight", () => {
        expect(firstResult.success).toBe(true);
        expect(firstResult.insight).toBeDefined();
      });

      it("allows same content for different brand", () => {
        expect(sameTextDifferentBrandResult.success).toBe(true);
        expect(sameTextDifferentBrandResult.insight.brandId).toBe(2);
      });

      it("rejects duplicate content for same brand", () => {
        expect(duplicateResult.success).toBe(false);
        expect(duplicateResult.error).toContain("already has an insight");
      });

      it("stores two insights (different brands)", () => {
        const allInsights = fixture.insights.selectAll();
        expect(allInsights).toHaveLength(2);
      });
    });
  });
});
}); 