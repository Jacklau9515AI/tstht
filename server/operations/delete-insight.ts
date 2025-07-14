import type { HasDBClient } from "../shared.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): boolean => {
  console.log(`Deleting insight with id=${input.id}`);

  const result = input.db.exec(`DELETE FROM insights WHERE id = ${input.id}`);
  console.log(`Delete result: ${result} rows affected`);
  
  const deleted = result > 0;
  
  if (deleted) {
    console.log(`Successfully deleted insight with id=${input.id}`);
  } else {
    console.log(`No insight found with id=${input.id}`);
  }
  
  return deleted;
}; 