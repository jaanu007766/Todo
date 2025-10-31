import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function TodoScreen() {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const stored = await AsyncStorage.getItem("todos");
    if (stored) setTodos(JSON.parse(stored));
  };

  const saveTodos = async (newTodos: any[]) => {
    setTodos(newTodos);
    await AsyncStorage.setItem("todos", JSON.stringify(newTodos));
  };

  const addTodo = () => {
    if (!task.trim()) return;
    const newTodos = [
      { id: Date.now().toString(), text: task, completed: false },
      ...todos,
    ];
    saveTodos(newTodos);
    setTask("");
  };

  const deleteTodo = (id: string) => {
    const filtered = todos.filter((t) => t.id !== id);
    saveTodos(filtered);
  };

  const toggleComplete = (id: string) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTodos(updated);
  };

  const startEditing = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      setTask(todo.text);
      setEditingId(id);
    }
  };

  const updateTodo = () => {
    const updated = todos.map((t) =>
      t.id === editingId ? { ...t, text: task } : t
    );
    saveTodos(updated);
    setTask("");
    setEditingId(null);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "Completed") return t.completed;
    if (filter === "Active") return !t.completed;
    return true;
  });

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.counter}>
        {remaining} task{remaining !== 1 ? "s" : ""} remaining
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          placeholderTextColor="#aaa"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={editingId ? updateTodo : addTodo}
        >
          <Text style={styles.addText}>{editingId ? "✓" : "+"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {["All", "Active", "Completed"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterButton,
              filter === f && styles.activeFilterButton,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.activeFilterText,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                item.completed && styles.checkedBox,
              ]}
              onPress={() => toggleComplete(item.id)}
            >
              {item.completed && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.todoTextContainer}
              onPress={() => startEditing(item.id)}
            >
              <Text
                style={[
                  styles.todoText,
                  item.completed && styles.completedText,
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Text style={styles.delete}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e1e2f", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 45,
  },
  title: { fontSize: 96, fontWeight: "700", color: "#fff" },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    paddingHorizontal: 44,
    paddingVertical: 26,
    borderRadius: 40,
  },
  logoutText: { fontSize:30,color: "#fff", fontWeight: "600" },
  counter: { color: "#bbb", marginBottom: 30 },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 35,
    backgroundColor: "#2a2a3e",
    borderRadius: 30,
    alignItems: "center",
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 56,
    paddingVertical: 10,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    width: 70,
    height: 70,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#fff", fontSize: 44, fontWeight: "bold" },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 70,
  },
  filterButton: {
    paddingVertical: 26,
    paddingHorizontal: 52,
    borderRadius: 20,
    backgroundColor: "#2a2a3e",
  },
  activeFilterButton: {
    backgroundColor: "#4CAF50",
  },
  filterText: { fontSize:30,color: "#aaa" },
  activeFilterText: {fontSize:40, color: "#fff", fontWeight: "600" },
  todoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a2a3e",
    padding: 5,
    borderRadius: 12,
    marginBottom: 8,
    
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 30,
  },
  checkedBox: { backgroundColor: "#4CAF50" },
  checkMark: { color: "#fff", fontWeight: "bold" },
  todoTextContainer: { flex: 1 },
  todoText: { color: "#fff", fontSize: 46 },
  completedText: {
    color: "#aaa",
    textDecorationLine: "line-through",
  },
  delete: { color: "#ff4d4d", fontSize: 30, fontWeight: "900" },
});
