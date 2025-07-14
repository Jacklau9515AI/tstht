import type { Insight } from "../models/insight.ts";
import type { HasDBClient } from "../shared.ts";
import * as insightsTable from "../tables/insights.ts";

type Input = HasDBClient & {
  brandId: number;
  text: string;
};

type CreateResult = {
  success: boolean;
  insight?: Insight;
  error?: string;
};

export default (input: Input): CreateResult => {
  console.log(`Creating insight for brandId=${input.brandId}`);

  // Check if the same insight already exists for this brand
  const existingRows = input.db.sql<insightsTable.Row>`SELECT * FROM insights WHERE brand = ${input.brandId} AND text = ${input.text.trim()}`;
  
  if (existingRows.length > 0) {
    console.log(`Insight with same text already exists for brand ${input.brandId}: "${input.text}"`);
    return {
      success: false,
      error: "This brand already has an insight with the same content"
    };
  }

  const now = new Date();
  const insertData: insightsTable.Insert = {
    brand: input.brandId,
    createdAt: now.toISOString(),
    text: input.text.trim(),
  };

  input.db.exec(insightsTable.insertStatement(insertData));

  const [newRow] = input.db.sql<{ "last_insert_rowid()": number }>`SELECT last_insert_rowid()`;
  const newId = newRow["last_insert_rowid()"];

  const insight: Insight = {
    id: newId,
    brandId: input.brandId,
    date: now,
    text: input.text.trim(),
  };

  console.log("Created insight:", insight);
  return {
    success: true,
    insight
  };
}; 