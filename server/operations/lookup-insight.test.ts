import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import type { Insight } from "$models/insight.ts";
import { withDB } from "../testing.ts";
import lookupInsight from "./lookup-insight.ts";

describe("looking up insights in the database", () => {
  describe("insight does not exist", () => {
    withDB((fixture) => {
      let result: Insight | undefined;

      beforeAll(() => {
        result = lookupInsight({ ...fixture, id: 1 });
      });

      it("returns undefined", () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe("insight exists", () => {
    withDB((fixture) => {
      const testDate = new Date();
      const insights: Insight[] = [
        { id: 1, brandId: 0, date: testDate, text: "1" },
        { id: 2, brandId: 0, date: testDate, text: "2" },
        { id: 3, brandId: 1, date: testDate, text: "3" },
        { id: 4, brandId: 4, date: testDate, text: "4" },
      ];

      let result: Insight | undefined;

      beforeAll(() => {
        fixture.insights.insert(
          insights.map((it) => ({
            brand: it.brandId,
            createdAt: it.date.toISOString(),
            text: it.text,
          })),
        );
        result = lookupInsight({ ...fixture, id: 3 });
      });

      it("returns the insight", () => {
        expect(result).toEqual(insights[2]);
      });
    });
  });
});
