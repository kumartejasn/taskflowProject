import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// Make sure the line "import './Board.css';" is DELETED

const Board = () => {
  const { token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTaskContent, setNewTaskContent] = useState('');

  const columns = [
    { title: 'To-Do', status: 'todo' },
    { title: 'In Progress', status: 'inprogress' },
    { title: 'Done', status: 'done' },
  ];

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskContent) return;
    try {
      const response = await axios.post('http://localhost:5000/tasks',
        { content: newTaskContent },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setTasks([...tasks, response.data.task]);
      setNewTaskContent('');
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/tasks/${taskId}`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  return (
    <div className="board-container">
      <header className="board-header">
        <h2>Task Board</h2>
        <form onSubmit={handleCreateTask}>
          <input 
            type="text"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            placeholder="Enter a new task"
          />
          <button type="submit">Add Task</button>
        </form>
        <button onClick={logout}>Logout</button>
      </header>

      <div className="board-columns">
        {columns.map((column, colIndex) => (
          <div key={column.status} className="board-column">
            <h3>{column.title}</h3>
            <div className="task-cards">
              {tasks
                .filter(task => task.status === column.status)
                .map(task => (
                  <div key={task.id} className="task-card">
                    <p>{task.content}</p>
                    <div className="task-actions">
                      <button onClick={() => handleDeleteTask(task.id)} className="delete-btn">
                        &times;
                      </button>
                      {colIndex < columns.length - 1 && (
                        <button onClick={() => handleUpdateTaskStatus(task.id, columns[colIndex + 1].status)} className="move-btn">
                          &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;