export const createTable = `
  CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY ASC NOT NULL,
    brand INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    text TEXT NOT NULL
  )
`;

export type Row = {
  id: number;
  brand: number;
  createdAt: string;
  text: string;
};

export type Insert = {
  brand: number;
  createdAt: string;
  text: string;
};

// updated query to use bounded parameters to avoid sql injection
export const insertInsightStatement = "INSERT INTO insights (brand, createdAt, text) VALUES (?, ?, ?)";
export const deleteInsightStatement = "DELETE FROM insights WHERE id = ?";
