1. Replace the 4 manual inputs with a single “workout message” input

  - Remove these states in app/(tabs)/index.tsx:
      - exerciseInput, weightInput, repsInput, notesInput
  - Add one state instead:
      - const [messageInput, setMessageInput] = useState("")
  - Update the UI input block to only show one TextInput (e.g., “Leg press 4 plates 10 reps”) and one “Send” button.

  2. Call the backend API to analyze the message

  - Add a function like sendMessage() that:
      - sets a loading flag
      - calls your API (/chat) with { message: messageInput }
      - reads the response from reply (note: backend uses reply, not message)
      - handles errors cleanly (try/catch)

  3. Convert AI output into rows (LogRow)

    update the backend to return JSON

  - Change the system prompt so the AI returns JSON like:

    [{"exercise":"Leg Press","weightLbs":"360","reps":"10","notes":""}]
  - Then in the app, JSON.parse(reply) and map into LogRow.
  - This is the most reliable and easiest to parse.
  4. Add rows using the existing helper

  - For each parsed item:
      - Use nextSetNumberForExercise() to assign the set number.
      - Push into rows.

  5. Add UI for loading/errors

  - Example:
      - show "Loading..." while waiting
      - show "Failed to reach API" on error
      - clear the message input on success