import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

type Category =
  | "trpg"
  | "stream"
  | "schedule"
  | "scenario"
  | "work"
  | "other";

type Task = {
  id: string;
  title: string;
  done: boolean;
  category: Category;
  archived: boolean;
  dueDate: string;
};

const CATEGORY_LABEL: Record<Category, string> = {
  trpg: "🎲作業（TRPG）",
  stream: "🖥作業（配信）",
  schedule: "📅日程調整",
  scenario: "📝シナリオ制作",
  work: "👜お仕事",
  other: "🥃その他",
};

const STORAGE_KEY = "cute-task-app-tasks";

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("trpg");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<Category | "all" | "archive">("all");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
  const [editCategory, setEditCategory] = useState<Category>("trpg");

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!title.trim()) return;

    const newTask: Task = {
      id:
        crypto.randomUUID?.() ??
        `${Date.now()}-${Math.random()}`,
      title,
      done: false,
      category,
      archived: false,
      dueDate: dueDate ? dueDate.toLocaleDateString("ja-JP") : "",
    };

    setTasks([newTask, ...tasks]);
    setTitle("");
    setDueDate(null);
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const archiveTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, archived: true } : task
      )
    );
  };

  const restoreTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, archived: false } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

const startEdit = (task: Task) => {
  setEditingId(task.id);
  setEditTitle(task.title);
  setEditDueDate(task.dueDate ? new Date(task.dueDate) : null);
  setEditCategory(task.category);
};

  const saveEdit = () => {
    if (!editTitle.trim()) return;

    setTasks(
      tasks.map((task) =>
        task.id === editingId
          ? {
             ...task,
             title: editTitle,
             category: editCategory,
             dueDate: editDueDate
               ? editDueDate.toLocaleDateString("ja-JP")
               : "",
            }
          : task
      )
    );
    setEditCategory("trpg");

    setEditingId(null);
    setEditTitle("");
    setEditDueDate(null);
  };

  const doneCount = tasks.filter((task) => task.done && !task.archived).length;
  const activeCount = tasks.filter((task) => !task.archived).length;

  const visibleCategories =
    activeTab === "all"
      ? Object.entries(CATEGORY_LABEL)
      : activeTab === "archive"
      ? Object.entries(CATEGORY_LABEL)
      : Object.entries(CATEGORY_LABEL).filter(([key]) => key === activeTab);

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">とぅーどぅー</p>
        <h1>るくのおしごと</h1>
        <p className="message">ちょっとずつやってこうや～。</p>

        <div className="inputArea">
          <div className="inputMainRow">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
              }}
              placeholder="やることを入れる"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <button onClick={addTask}>ほいさ</button>
          </div>

          <div className="inputSubRow">
            <button
              className="dateIconBtn"
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              ここまで 📅
            </button>
<button
  className="clearDateBtn"
  type="button"
  onClick={() => setDueDate(null)}
>
  やっぱやめ
</button>

            {dueDate && (
              <span className="selectedDue">
                {dueDate.toLocaleDateString("ja-JP")}
              </span>
            )}

            {showDatePicker && (
              <div className="calendarArea">
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => {
                    setDueDate(date);
                    setShowDatePicker(false);
                  }}
                  dateFormat="yyyy年MM月dd日"
                  inline
                />
              </div>
            )}
          </div>
        </div>

        <div className="progress">
          <span>しんちょく</span>
          <strong>
            {doneCount} / {activeCount}
          </strong>
        </div>

        <div className="tabs">
          <button
            className={activeTab === "all" ? "tab active" : "tab"}
            onClick={() => setActiveTab("all")}
          >
            ぜんぶ
          </button>

          <button
            className={
              activeTab === "archive"
                ? "tab active archiveTab"
                : "tab archiveTab"
            }
            onClick={() => setActiveTab("archive")}
          >
            眠
          </button>

          {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
            <button
              key={key}
              className={activeTab === key ? "tab active" : "tab"}
              onClick={() => setActiveTab(key as Category)}
            >
              {label}
            </button>
          ))}
        </div>

<div className="taskList">
  {visibleCategories.map(([key, label]) => {
    const filtered = tasks.filter((task) => {
      if (activeTab === "archive") {
        return task.category === key && task.archived;
      }

      return task.category === key && !task.archived;
    });

    if (filtered.length === 0) return null;

    return (
      <section className="taskGroup" key={key}>
        <h3>{label}</h3>

        {filtered.map((task) => (
          <div
            className={task.done ? "task done" : "task"}
            key={task.id}
          >
            <button
              className="deleteBtn"
              onClick={() => deleteTask(task.id)}
            >
              ぽいっ
            </button>

            <button
              className="check"
              onClick={() => toggleTask(task.id)}
            >
              {task.done ? "✓" : ""}
            </button>

            <div className="taskText">
              {editingId === task.id ? (
                <div className="editArea">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                    }}
                    autoFocus
                  />

                  <DatePicker
                    selected={editDueDate}
                    onChange={(date) => setEditDueDate(date)}
                    dateFormat="yyyy年MM月dd日"
                    placeholderText="ここまで"
                    className="dateInput"
                  />

                  <select
                    className="editSelect"
                    value={editCategory}
                    onChange={(e) =>
                      setEditCategory(e.target.value as Category)
                    }
                  >
                    {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <button
                    className="clearDateBtn"
                    onClick={() => setEditDueDate(null)}
                  >
                    やっぱやめ
                  </button>

                  <button className="archiveBtn" onClick={saveEdit}>
                    せーぶ
                  </button>
                </div>
              ) : (
                <span onDoubleClick={() => startEdit(task)}>
                  {task.title}
                </span>
              )}

              {task.dueDate && (
                <small className="dueDate">期限：{task.dueDate}</small>
              )}
            </div>

            <div className="taskActions">
              <button
                className="archiveBtn"
                onClick={() =>
                  activeTab === "archive"
                    ? restoreTask(task.id)
                    : archiveTask(task.id)
                }
              >
                {activeTab === "archive" ? "おはよう" : "おやすみ"}
              </button>

              <button
                className="archiveBtn"
                onClick={() => startEdit(task)}
              >
                🖊
              </button>
            </div>
          </div>
        ))}
      </section>
    );
  })}
</div>
      </section>
    </main>
  );
}

export default App;