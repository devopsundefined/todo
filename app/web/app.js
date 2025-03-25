let token = null;

function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alert-box");
    const alertMessage = document.getElementById("alert-message");

    alertMessage.textContent = message;

    // Set styles based on alert type
    if (type === "success") {
        alertBox.className = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white bg-green-500 opacity-0 transform translate-y-[-20px] transition-all duration-300";
    } else if (type === "error") {
        alertBox.className = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white bg-red-500 opacity-0 transform translate-y-[-20px] transition-all duration-300";
    }

    // Show with fade-in animation
    setTimeout(() => {
        alertBox.classList.remove("hidden");
        alertBox.classList.add("opacity-100", "translate-y-0");
    }, 10);

    // Hide with fade-out animation after 3 seconds
    setTimeout(() => {
        alertBox.classList.remove("opacity-100", "translate-y-0");
        alertBox.classList.add("opacity-0", "translate-y-[-20px]");
        
        // Hide completely after animation ends
        setTimeout(() => {
            alertBox.classList.add("hidden");
        }, 300); // Match the duration-300
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

        const data = await response.json();
        if (!response.ok) {
            showAlert(responseData.message || `Error: ${response.status}`, "error");
        }
        token = data.token;
        document.getElementById("todo-section").classList.remove("hidden");
        fetchTodos();
    } catch (error) {
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
        const responseData = await response.json(); // Parse JSON response

        if (response.ok) {
            showAlert(responseData.message || "Registration successful!", "success");
        } else {
            showAlert(responseData.message || `Error: ${response.status}`, "error");
        }
    } catch (error) {
        console.error("Registration failed", error);
        showAlert("An unexpected error occurred. Please try again later.", "error");
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
    }
}

async function fetchTodos() {
    try {
        const response = await fetch("/todos", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const todos = await response.json();
        if (!response.ok) {
            showAlert(responseData.message || `Error: ${response.status}`, "error");
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
    }
}

