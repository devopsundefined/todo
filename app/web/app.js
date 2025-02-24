let token = null;

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch("https://7pfr7gnn4wp55t7phevqg6etdi0cjgqa.lambda-url.eu-north-1.on.aws/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
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
        alert("Registration successful! Please login.");
    } catch (error) {
        console.error("Registration failed", error);
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
