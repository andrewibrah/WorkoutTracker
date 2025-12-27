import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { listWorkouts, type WorkoutSession } from "@/lib/workoutStorage";

function toMMDD(dateISO: string) {
  const parts = dateISO.split("-");
  if (parts.length !== 3) return dateISO;
  return `${parts[1]}/${parts[2]}`;
}

export default function HistoryScreen() {
  const [items, setItems] = useState<WorkoutSession[]>([]);
  const router = useRouter();

  const load = async () => {
    setItems(await listWorkouts());
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>History</Text>

      <FlatList
        data={items}
        keyExtractor={(w) => w.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/history/[id]",
                params: { id: item.id },
              })
            }
            style={styles.card}
          >
            <Text style={styles.cardTitle}>
              {toMMDD(item.dateISO)} - "{item.part}"
            </Text>
            <Text style={styles.cardMeta}>{item.rows.length} rows</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text>No saved workouts yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    fontWeight: "700",
  },
  cardMeta: {
    opacity: 0.7,
    marginTop: 4,
  },
});
