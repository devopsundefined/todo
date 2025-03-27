let token = null;

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('delete-cancel').addEventListener('click', hideDeleteModal);
    document.getElementById('delete-confirm').addEventListener('click', deleteTodo);
  });

let currentTodoIdToDelete = null;

function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alert-box");
    const alertMessage = document.getElementById("alert-message");

    alertMessage.textContent = message;

    // Set styles based on alert type
    if (type === "success") {
        alertBox.className = "fixed top-1/2 left-1/2 p-4 rounded-lg shadow-lg text-white bg-green-500 opacity-0 transform -translate-x-1/2 -translate-y-1/2 scale-90 transition-all duration-300";
    } else if (type === "error") {
        alertBox.className = "fixed top-1/2 left-1/2 p-4 rounded-lg shadow-lg text-white bg-red-500 opacity-0 transform -translate-x-1/2 -translate-y-1/2 scale-90 transition-all duration-300";
    }

    // Show with fade-in and scale-up animation
    setTimeout(() => {
        alertBox.classList.remove("hidden");
        alertBox.classList.add("opacity-100", "scale-100");
    }, 10);

    // Hide with fade-out and scale-down after 3 seconds
    setTimeout(() => {
        alertBox.classList.remove("opacity-100", "scale-100");
        alertBox.classList.add("opacity-0", "scale-90");

        // Hide completely after animation ends
        setTimeout(() => {
            alertBox.classList.add("hidden");
        }, 300);
    }, 3000);
}

async function toggleComplete(todoId) {
    try {
        const response = await fetch(`/todo/${todoId}/complete`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update todo');
        }
        
        fetchTodos();
    } catch (error) {
        console.error("Error updating todo:", error);
        showAlert(error.message, "error");
    }
}

function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    showLoading();
    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        let data;
        try {
            data = await response.json(); // Try to parse JSON
        } catch (error) {
            console.error("JSON Parsing Error:", error);
            data = { message: "Unexpected server response" };
        }

        // If response is successful
        if (response.ok) {
            showAlert(data.message || "Login successful!", "success");
        } else {
            showAlert(data.error || "Login failed.", "error");
            return;
        }

        if (data.token) {
            token = data.token;
            document.getElementById("todo-section").classList.remove("hidden");
            document.getElementById("auth-section").classList.add("hidden");
            document.getElementById("todo-section").classList.remove("hidden");
            document.getElementById("header").classList.remove("hidden");
            document.getElementById("username").textContent = username;
            fetchTodos();
        } else {
            showAlert("Failed getting auth token.", "error");
            console.error("Login failed. Auth token missing in response", error);
            return;
        }

    } catch (error) {
        showAlert("Failed logging in.", "error");
        console.error("Login failed", error);
    } finally {
        hideLoading();
    }
}

async function register() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const email = document.getElementById("register-email").value;
    showLoading();
    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email })
        });

        let responseData;
        
        try {
            responseData = await response.json(); // Try to parse JSON
        } catch (error) {
            console.error("JSON Parsing Error:", error);
            responseData = { message: "Unexpected server response" };
        }

        if (response.ok) {
            showAlert(responseData.message || "Registration successful!", "success");
        } else {
            console.error("response not ok", responseData.error);
            showAlert(responseData.error || "Registration failed!", "error");
            return;
        }

    } catch (error) {
        console.error("Registration failed", error);
        showAlert("Registration failed. Please try again later.", "error");
    } finally {
        hideLoading();
    }
}

async function addTodo() {
    const content = document.getElementById("todo-content").value;
    const due_date = document.getElementById("todo-date").value;
    const created_at = new Date().toISOString();

    if (!content) {
        showAlert("Todo content cannot be empty", "error");
        return;
    }
    showLoading();
    try {
        const response = await fetch("/todo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ content, due_date: due_date, created_at: created_at })
        });

        if (!response.ok) {
            const errorData = await response.json();
            showAlert(errorData.error || "Failed to add todo", "error");
            return;
        }

        document.getElementById("todo-content").value = "";
        document.getElementById("todo-date").value = "";
        fetchTodos();
        showAlert("Todo added successfully!", "success");
    } catch (error) {
        console.error("Failed to add todo", error);
        showAlert("Adding Todo failed. Please try again later.", "error");
    } finally {
        hideLoading();
    }
}

// Show modal function
function showDeleteModal(todoId) {
  currentTodoIdToDelete = todoId;
  document.getElementById('delete-modal').classList.remove('hidden');
}

// Hide modal function
function hideDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden');
}

// Updated deleteTodo function
async function deleteTodo() {
  const deleteBtn = document.querySelector(`button[data-todo-id="${currentTodoIdToDelete}"]`);
  showLoading();
  try {
    if (deleteBtn) {
      deleteBtn.disabled = true;
      deleteBtn.innerHTML = 'Deleting...';
    }

    const response = await fetch(`/todo/${currentTodoIdToDelete}`, {
      method: 'DELETE',
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Delete failed');
    
    showAlert('Todo deleted!', 'success');
    fetchTodos();
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    hideDeleteModal();
    if (deleteBtn && deleteBtn.isConnected) {
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = 'Delete';
    }
    hideLoading();
  } 
}

async function fetchTodos() {
    showLoading();
    try {
        const response = await fetch("/todos", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        let todos;

        try {
            todos = await response.json(); // Try to parse JSON
        } catch (error) {
            console.error("JSON Parsing Error:", error);
            todos = { message: "Unexpected server response while fetching todos" };
        }

        const todoList = document.getElementById("todo-list");
        todoList.innerHTML = "";
        
        if (Array.isArray(todos)) {
            todos.forEach(todo => {
                const li = document.createElement("li");
                li.classList.add("border-b", "p-2", "flex", "justify-between", "items-center");
                
                // Format the created date
                const createdDate = new Date(todo.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                });
                
                li.innerHTML = `
                <div class="flex-1">
                    <span class="${todo.completed ? 'line-through text-gray-400' : ''}">${todo.content}</span>
                    ${todo.due_date ? `<br><span class='text-red-500 text-sm'>Due: ${new Date(todo.due_date).toLocaleDateString()}</span>` : ''}
                </div>
                <div class="flex items-center gap-2">
                    <span class='text-gray-500 text-sm'>${createdDate}</span>
                    <button onclick="toggleComplete('${todo.id}')" class="ml-2 px-3 py-1 ${todo.completed ? 'bg-green-600' : 'bg-gray-600'} text-white rounded-lg text-sm">
                        ${todo.completed ? 'Completed' : 'Mark Complete'}
                    </button>
                    <button onclick="showDeleteModal('${todo.id}')" 
                            class="ml-2 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                        Delete
                    </button>
                </div>`;

                todoList.appendChild(li);
            });
        } else {
            const li = document.createElement("li");
            li.textContent = "No Todos yet!";
            li.classList.add("border-b", "p-2");
            todoList.appendChild(li);
        }
    } catch (error) {
        console.error("Failed to fetch todos", error);
        showAlert("Fetching Todos failed. Please try again later.", "error");
    } finally {
        hideLoading();
    }
}

function logout() {
    token = null; // Clear token
    document.getElementById("todo-section").classList.add("hidden");
    document.getElementById("header").classList.add("hidden");
    document.getElementById("auth-section").classList.remove("hidden");
    showAlert("Logged out successfully!", "success");
}

