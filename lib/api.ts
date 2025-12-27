const API_BASE = "http://localhost:8000";

export type ApiWorkoutRow = {
  exercise: string;
  set: number;
  weightLbs: string;
  reps: string;
  notes: string;
};

export const api = {
  chat: async (message: string, rows: ApiWorkoutRow[]) => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, rows }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return (await res.json()) as { rows: ApiWorkoutRow[] };
  },
};
