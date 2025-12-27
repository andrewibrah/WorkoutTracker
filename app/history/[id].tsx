import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { listWorkouts, type WorkoutSession } from "@/lib/workoutStorage";

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    (async () => {
      const all = await listWorkouts();
      setWorkout(all.find((w) => w.id === id) ?? null);
    })();
  }, [id]);

  if (!workout) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Workout not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        {workout.dateISO} / {workout.part}
      </Text>

      <FlatList
        style={{ marginTop: 12 }}
        data={workout.rows}
        keyExtractor={(_, i) => `${workout.id}_${i}`}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
            <Text style={{ fontWeight: "700" }}>{item.exercise}</Text>
            <Text>Weight: {item.weightLbs}</Text>
            <Text>Reps: {item.reps}</Text>
            {item.notes ? <Text>Notes: {item.notes}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}
