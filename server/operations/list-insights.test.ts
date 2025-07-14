import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import type { Insight } from "$models/insight.ts";
import { withDB } from "../testing.ts";
import listInsights from "./list-insights.ts";

describe("listing insights in the database", () => {
  describe("nothing in the DB", () => {
    withDB((fixture) => {
      let result: Insight[];

      beforeAll(() => {
        result = listInsights(fixture);
      });

      it("returns empty result", () => {
        expect(result).toEqual([]);
      });
    });
  });

  describe("populated DB", () => {
    withDB((fixture) => {
      const testDate = new Date();
      const insights: Insight[] = [
        { id: 1, brandId: 0, date: testDate, text: "1" },
        { id: 2, brandId: 0, date: testDate, text: "2" },
        { id: 3, brandId: 1, date: testDate, text: "3" },
        { id: 4, brandId: 4, date: testDate, text: "4" },
      ];

      let result: Insight[];

      beforeAll(() => {
        fixture.insights.insert(
          insights.map((it) => ({
            brand: it.brandId,
            createdAt: it.date.toISOString(),
            text: it.text,
          })),
        );
        result = listInsights(fixture);
      });

      it("returns non-empty result", () => {
        expect(result.length).toBeGreaterThan(0);
      });

      it("returns all insights in the DB", () => {
        expect(result).toEqual(insights);
      });
    });
  });
});
