import { useState, useEffect } from 'react';
import './styles.css';

// TODO: Add proper types (using any for now)
interface Task {
    id: any;  // ISSUE: Using 'any' instead of proper type
    text: string;
    completed: boolean;
    priority?: any;  // ISSUE: Unused property with 'any' type
}

function App() {
    // ISSUE: No error handling for localStorage
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];  // ISSUE: No try-catch for JSON.parse
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);  // ISSUE: Unused state

    // ISSUE: Console.log left in production code
    console.log('Tasks updated:', tasks);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    // ISSUE: No input validation or sanitization
    const addTask = () => {
        if (!input.trim()) return;
        // ISSUE: Using Date.now() can cause duplicates
        setTasks([...tasks, { id: Date.now(), text: input, completed: false }]);
        setInput('');
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    // ISSUE: No confirmation before delete
    const deleteTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    // ISSUE: Hardcoded magic number
    const MAX_TASKS = 100;

    return (
        // ISSUE: Missing lang attribute on root, no skip-to-content link
        <div className="app">
            <h1>📝 TaskFlow</h1>
            <p className="subtitle">Simple task management</p>

            {/* ISSUE: No form element, no label for input */}
            <div className="input-group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add a new task..."
                // ISSUE: Missing aria-label for accessibility
                />
                {/* ISSUE: Button has no type attribute */}
                <button onClick={addTask}>Add</button>
            </div>

            {tasks.length >= MAX_TASKS && (
                <p style={{ color: 'red' }}>Maximum tasks reached!</p>
            )}

            <ul className="task-list">
                {tasks.map(task => (
                    // ISSUE: Using index as key would be bad, but at least using id
                    <li key={task.id} className={task.completed ? 'completed' : ''}>
                        {/* ISSUE: Checkbox missing aria-label */}
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                        />
                        <span>{task.text}</span>
                        {/* ISSUE: Delete button has no accessible text */}
                        <button onClick={() => deleteTask(task.id)}>×</button>
                    </li>
                ))}
            </ul>

            {tasks.length === 0 && (
                <p className="empty">No tasks yet. Add one above!</p>
            )}

            <footer>
                <p>{tasks.filter(t => !t.completed).length} tasks remaining</p>
            </footer>
        </div>
    );
}

export default App;
