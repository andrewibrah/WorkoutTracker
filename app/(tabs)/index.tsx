import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type BodyPart =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Push"
  | "Pull"
  | "Full Body"
  | "Cardio"
  | "Other";

type LogRow = {
  id: string;
  exercise: string;
  set: number;
  weightLbs: string; // keep as string for input friendliness; display as-is
  reps: string;
  notes: string;
};

function getTodayMMDD(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

export default function HomeScreen() {
  // Session header state
  const [sessionDate, setSessionDate] = useState<string>(getTodayMMDD());
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);

  // Table rows (in-memory only for now)
  const [rows, setRows] = useState<LogRow[]>([]);

  // “Chat input filler” fields
  const [exerciseInput, setExerciseInput] = useState<string>("");
  const [weightInput, setWeightInput] = useState<string>("");
  const [repsInput, setRepsInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");

  // Body part picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const BODY_PARTS: BodyPart[] = useMemo(
    () => [
      "Chest",
      "Back",
      "Legs",
      "Shoulders",
      "Arms",
      "Push",
      "Pull",
      "Full Body",
      "Cardio",
      "Other",
    ],
    []
  );

  const scrollRef = useRef<ScrollView>(null);

  const title = useMemo(() => {
    const bp = bodyParts.length ? `${bodyParts.join(" + ")} ` : "";
    return `${sessionDate} ${bp}Workout`;
  }, [sessionDate, bodyParts]);

  const resetForNewDay = (nextDate: string) => {
    // Automated daily rollover:
    // - Update date
    // - Clear body part back to blank
    // - Clear current table rows
    // - Clear inputs
    setSessionDate(nextDate);
    setBodyParts([]);
    setRows([]);
    setExerciseInput("");
    setWeightInput("");
    setRepsInput("");
    setNotesInput("");
  };

  const ensureFreshSession = () => {
    const today = getTodayMMDD();
    if (today !== sessionDate) resetForNewDay(today);
  };

  useEffect(() => {
    // 1) If the app sits open past midnight, we still want rollover.
    //    A short interval is a low-risk approach without requiring DB/auth.
    const interval = setInterval(() => {
      ensureFreshSession();
    }, 30_000);

    // 2) If the app is backgrounded and resumed next day.
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") ensureFreshSession();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDate]);

  const nextSetNumberForExercise = (exerciseName: string): number => {
    const normalized = exerciseName.trim().toLowerCase();
    if (!normalized) return 1;
    const count = rows.reduce((acc, r) => {
      return r.exercise.trim().toLowerCase() === normalized ? acc + 1 : acc;
    }, 0);
    return count + 1;
  };

  const addRow = () => {
    const ex = exerciseInput.trim();
    if (!ex) return;

    const newRow: LogRow = {
      id: `${Date.now()}-${Math.random()}`,
      exercise: ex,
      set: nextSetNumberForExercise(ex),
      weightLbs: weightInput.trim(),
      reps: repsInput.trim(),
      notes: notesInput.trim(),
    };

    setRows((prev) => [...prev, newRow]);

    // Keep exercise for fast repeated sets; clear the rest.
    setWeightInput("");
    setRepsInput("");
    setNotesInput("");

    // Scroll to bottom so the new row is visible.
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ThemedView style={styles.header}>
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.headerImage}
        />

        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.titleText}>
            {title}
          </ThemedText>

          <Pressable
            onPress={() => setPickerOpen(true)}
            style={styles.bodyPartPill}
            accessibilityRole="button"
            accessibilityLabel="Select body part"
          >
            <ThemedText style={styles.bodyPartPillText}>
              {bodyParts.length ? bodyParts.join(" + ") : "Tap to set body parts"}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      {/* Table */}
      <ThemedView style={styles.tableWrap}>
        <View style={[styles.row, styles.headerRow]}>
          <ThemedText style={[styles.cell, styles.exerciseCol, styles.headerCell]}>
            Exercise
          </ThemedText>
          <ThemedText style={[styles.cell, styles.setCol, styles.headerCell]}>
            Set
          </ThemedText>
          <ThemedText style={[styles.cell, styles.weightCol, styles.headerCell]}>
            Weight (lbs)
          </ThemedText>
          <ThemedText style={[styles.cell, styles.repsCol, styles.headerCell]}>
            Reps
          </ThemedText>
          <ThemedText style={[styles.cell, styles.notesCol, styles.headerCell]}>
            Notes
          </ThemedText>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.tableBody}
          contentContainerStyle={styles.tableBodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {rows.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>
                Add your first set below.
              </ThemedText>
            </View>
          ) : (
            rows.map((r, idx) => (
              <View
                key={r.id}
                style={[styles.row, idx % 2 === 0 ? styles.evenRow : styles.oddRow]}
              >
                <ThemedText style={[styles.cell, styles.exerciseCol]}>{r.exercise}</ThemedText>
                <ThemedText style={[styles.cell, styles.setCol]}>{String(r.set)}</ThemedText>
                <ThemedText style={[styles.cell, styles.weightCol]}>{r.weightLbs || "—"}</ThemedText>
                <ThemedText style={[styles.cell, styles.repsCol]}>{r.reps || "—"}</ThemedText>
                <ThemedText style={[styles.cell, styles.notesCol]}>{r.notes || ""}</ThemedText>
              </View>
            ))
          )}
        </ScrollView>
      </ThemedView>

      {/* Input row (chat-like filler) */}
      <View style={styles.inputWrap}>
        <View style={styles.inputGrid}>
          <TextInput
            value={exerciseInput}
            onChangeText={setExerciseInput}
            placeholder="Exercise"
            style={[styles.input, styles.exerciseInput]}
            returnKeyType="next"
          />
          <TextInput
            value={weightInput}
            onChangeText={setWeightInput}
            placeholder="Weight"
            style={[styles.input, styles.smallInput]}
            keyboardType={Platform.select({ ios: "numbers-and-punctuation", android: "numeric" })}
            returnKeyType="next"
          />
          <TextInput
            value={repsInput}
            onChangeText={setRepsInput}
            placeholder="Reps"
            style={[styles.input, styles.smallInput]}
            keyboardType={Platform.select({ ios: "numbers-and-punctuation", android: "numeric" })}
            returnKeyType="next"
          />
          <TextInput
            value={notesInput}
            onChangeText={setNotesInput}
            placeholder="Notes"
            style={[styles.input, styles.notesInput]}
            returnKeyType="done"
            onSubmitEditing={addRow}
          />
        </View>

        <View style={styles.actionsRow}>
          <Button title="Add" onPress={addRow} />
          <Button title="Clear" onPress={() => setRows([])} />
        </View>

        <ThemedText style={styles.hint}>
          {`Tip: keep Exercise filled, then just punch Weight/Reps for fast set logging.`}
        </ThemedText>
      </View>

      {/* Body part picker modal */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <ThemedText type="title" style={styles.modalTitle}>
              Select Body Part
            </ThemedText>

            <ScrollView contentContainerStyle={styles.modalList}>
              {BODY_PARTS.map((bp) => {
                const selected = bodyParts.includes(bp);
                return (
                  <Pressable
                    key={bp}
                    onPress={() => {
                      setBodyParts((prev) =>
                        prev.includes(bp) ? prev.filter((x) => x !== bp) : [...prev, bp]
                      );
                    }}
                    style={[styles.modalItem, selected && styles.modalItemSelected]}
                  >
                    <View style={styles.modalItemRow}>
                      <ThemedText style={styles.modalItemText}>{bp}</ThemedText>
                      <ThemedText style={styles.modalItemCheck}>{selected ? "✓" : ""}</ThemedText>
                    </View>
                  </Pressable>
                );
              })}

              <Pressable
                onPress={() => {
                  setBodyParts([]);
                }}
                style={[styles.modalItem, styles.modalClear]}
              >
                <ThemedText style={styles.modalItemText}>Clear selection</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setPickerOpen(false)}
                style={[styles.modalItem, styles.modalDone]}
              >
                <ThemedText style={styles.modalItemText}>Done</ThemedText>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 10,
  },
  headerImage: {
    height: 100,
    width: 200,
    alignSelf: "center",
    marginBottom: 8,
  },
  titleRow: {
    gap: 10,
  },
  titleText: {
    textAlign: "center",
  },
  bodyPartPill: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  bodyPartPillText: {
    fontSize: 14,
  },

  tableWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableBody: {
    flex: 1,
  },
  tableBodyContent: {
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  headerRow: {
    backgroundColor: "#F6F6F6",
    borderBottomColor: "#E6E6E6",
  },
  evenRow: {
    backgroundColor: "#FFFFFF",
  },
  oddRow: {
    backgroundColor: "#FAFAFA",
  },
  cell: {
    fontSize: 13,
    paddingRight: 8,
  },
  headerCell: {
    fontSize: 12,
    opacity: 0.9,
  },
  exerciseCol: {
    flex: 2.4,
  },
  setCol: {
    flex: 0.8,
    textAlign: "center",
  },
  weightCol: {
    flex: 1.2,
    textAlign: "center",
  },
  repsCol: {
    flex: 1.1,
    textAlign: "center",
  },
  notesCol: {
    flex: 1.5,
  },
  emptyState: {
    padding: 16,
  },
  emptyText: {
    opacity: 0.7,
  },

  inputWrap: {
    marginTop: 10,
    gap: 10,
  },
  inputGrid: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
  },
  exerciseInput: {
    flex: 2.2,
  },
  smallInput: {
    flex: 1,
    textAlign: "center",
  },
  notesInput: {
    flex: 1.6,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  hint: {
    opacity: 0.7,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    maxHeight: "70%",
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: "center",
  },
  modalList: {
    gap: 8,
    paddingBottom: 6,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
  },
  modalItemSelected: {
    borderColor: "#BDBDBD",
    backgroundColor: "#F7F7F7",
  },
  modalItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalItemCheck: {
    fontSize: 18,
    opacity: 0.9,
  },
  modalDone: {
    borderColor: "#CFCFCF",
    backgroundColor: "#F2F2F2",
  },
  modalClear: {
    borderColor: "#D8D8D8",
  },
  modalItemText: {
    fontSize: 16,
  },
});
