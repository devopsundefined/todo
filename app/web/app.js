let token = null;

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

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

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
            showAlert(data.message || "Login failed.", "error");
            return;
        }

        if (data.token) {
            token = data.token;
            document.getElementById("todo-section").classList.remove("hidden");
            fetchTodos();
        } else {
            showAlert("Failed getting auth token.", "error");
            console.error("Login failed. Auth token missing in response", error);
            return;
        }

    } catch (error) {
        showAlert("Failed logging in.", "error");
        console.error("Login failed", error);
    }
}

async function register() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const email = document.getElementById("register-email").value;

    try {
        await fetch("/register", {
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
            showAlert(responseData.message || "Registration failed!", "error");
            return;
        }

    } catch (error) {
        console.error("Registration failed", error);
        showAlert("Registration failed. Please try again later.", "error");
    }
}

async function addTodo() {
    const content = document.getElementById("todo-content").value;

    try {
        await fetch("/todo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        fetchTodos();
    } catch (error) {
        console.error("Failed to add todo", error);
        showAlert("Adding Todo failed. Please try again later.", "error");
    }
}

async function fetchTodos() {
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
        todos.forEach(todo => {
            const li = document.createElement("li");
            li.textContent = todo.content;
            li.classList.add("border-b", "p-2");
            todoList.appendChild(li);
        });
    } catch (error) {
        console.error("Failed to fetch todos", error);
        showAlert("Fetching Todos failed. Please try again later.", "error");
    }
}

