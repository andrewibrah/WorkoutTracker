
# Vision 
- Easiest way to track workouts 
- Easiest way to get personalized Workout advice based on your own data 
- Simple, Understandable and useable by the lowest tech expirenced Users

# Chat + Data Flow
- User says " Starting my {Body Part 'Example: Chest and tri'} Workout"
- Program Creates Table Title " {Current date} {Body Part} Workout" // example: " 12/24 Back + biceps Workout" 
- Then bot responses "[motivative_encouragement] Input your first Excerise or Set" 
- User may respond with first excerise (example: Starting with Flat barbell bench) or the first set they do (example: Squat, 135, 10)
- this input gives us the context we need to add or prepare to add first excerise or row to table. "Exericise, weight, reps"
- It is the applications job to analyze and track the set number. 
- since this is beginning of workout session, assume one or rely on a "warmup" note.
- At this point, we may assume row example: {excerise_name, set_num, lbs, reps_num}
- for next input, we may assume same Excerise unless mentioned. This encourages unstructured or contaxt lagging inputs.
- Example we have the first row for bench. User might enter "185, 10"
- Although this is vague, We can infer {excerise_name = same excerise done, set_num = last set_num + 1, lbs = 185, reps_num = 10}
- after app designed data cleaning and integerity, add row to table.
- this format will likely be repeated until a new excrise is introduced.
- Without transition, user may input (example: incline dumbbell press, 135, 10)
- Again, since we know they just were on a different Exercise , we assume set_num = 1 and understand {incline DB press, 1, 135 and 10} should be a newly added row. 
- this should be repeated until user says something like "Today's Workout done"
- When "DONE" save Full Workout table to Workout History 

# Mobile App UI 
- Upper 3/4th of Main Chat = Current workout View 
- Text Input Box : Exercise, Weight, Reps, notes or "DONE"
- No Chat/input history -> when inputed, Modifcation will occure on real-time UI table, rather than constant output of table
- TOP Right "button" to view each table/Workout session saved
- Coach -> ask ai to Analyze your workout History for advice or information
- 


# WorkOut Table Sturcture 
________________________________________________________________________________
|                       {Current Date} {Body parts} Workout                     |
┌───────────────────────┬──────────┬──────────────┬──────────────┬──────────────┐
│ Exercise              │ Set      │ Weight (lbs) │ Reps         │ Notes        │
├───────────────────────┼──────────┼──────────────┼──────────────┼──────────────┤
│ Flat Bench (Machine)  │ Warm-up  │ 100          │ 12           │              │
│                       │ 1        │ 190          │ 9            │              │
│                       │ 2        │ 240          │ 4            │              │
│                       │ 3        │ 190          │ 6            │              │
├───────────────────────┼──────────┼──────────────┼──────────────┼──────────────┤
│ Incline Machine       │ 1        │ 90           │ 9            │              │
│                       │ 2        │ 140          │ 5            │              │
│                       │ 3        │ 90           │ 6            │              │
├───────────────────────┼──────────┼──────────────┼──────────────┼──────────────┤
│                       │ 1        │ 40           │ 8            │              │
│Face Pulls/            │ 1        │ 55           │ 7            │              │
│Lat Pullover           │ 2        │ 40           │ 10           │      SS      │
│(Always in Order)      │ 2        │ 70           │ 8            │              │
├───────────────────────┼──────────┼──────────────┼──────────────┼──────────────┤
│ Elliptical Cardio     │ cardio   │ —            │ 15 min       │ Avg HR 180   │
└───────────────────────┴──────────┴──────────────┴──────────────┴──────────────┘


# DataBase Schecme 
workout_log
-----------
id
workout_date        -- or workout_id if you prefer grouping
exercise            -- canonical label chosen by AI
set_number          -- Float - 1,2,3, 1.1, 1.2, 2.1, 2.2  //decimals for DropSets  
weight_lbs          -- numeric only
reps                -- int 
notes               -- SS, DROP, HR, incline, etc.
created_at

# Logic Rules for Data Integrity
- IF User expresses DropSet: Use Floating point Nums for set_num and use DS in notes (example: 2.1, 25, 10, 2.2, 20, 10 -> {last_exercise, 2.1, 25, 10, DP} 
{last_exercise, 2.2, 20, 10, DP})
- IF User expresses SuperSet: in Super Sets, 2 or more exercises named stacked in order which is done first, (weight, reps, weight, reps), notes SS 
example with follw up example: input = bench and push ups superset, 135 10, 50, 10 
Bench/            | 1 | 135 | 10 | SS
Trisep push downs | 1 | 50  | 10 | SS
                  | 2 | 175 | 8  | SS
                  | 2 | 175 | 8  | SS
- IF User expresses Warmup: if user says {Curls , 20, 10 , warmup}, do as you normallt would but set_num = 0
- IF User expresses Cardio or Timed input: add "Amount_time" in rep_num with always in mins, numeric intensity in weight and "cardio" in notes  
- IF User expresses Multiple Set at once:  Analyze input and use context for "Same Exerise, multiple Sets joined to one input" add Expected num of rows. Stay Consisent with set_num + 1 for each of the rows. 
- IF User doesnt express Exercise_name:   Use Most recent Exercise_name 