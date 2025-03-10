document.addEventListener('DOMContentLoaded', () => {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    console.log(users);
    // Ensure there is always at least one admin user
    if (!users.some(user => user.role === 'admin')) {
        users.push({ agentName: 'Alihossen', password: 'Ams@Admin@1234', role: 'admin' });
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Admin user added to ensure access.');
    }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userTableBody = document.getElementById('userTableBody');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    // Show or hide the logout option based on login status
    const logoutLink = document.getElementById('logout');
    if (loggedInUser) {
        logoutLink.style.display = 'block';
    } else {
        logoutLink.style.display = 'none';
    }

    if (loggedInUser && loggedInUser.role === 'admin') {
        document.getElementById('register').style.display = 'block';
        document.getElementById('userList').style.display = 'block';
        renderUserTable();
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const agentName = document.getElementById('loginAgentName').value;
        const password = document.getElementById('loginPassword').value;

        const user = users.find(user => user.agentName === agentName && user.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            window.location.href = 'data.html';
        } else {
            alert('Invalid information');
        }
    });

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!loggedInUser || loggedInUser.role !== 'admin') {
            alert('Only admin can register new users.');
            return;
        }

        const agentName = document.getElementById('registerAgentName').value;
        const password = document.getElementById('registerPassword').value;

        // Prevent creating duplicate users
        const existingUser = users.find(user => user.agentName === agentName);
        if (existingUser) {
            alert('User already exists.');
            return;
        }

        const newUser = { agentName, password, role: 'user' };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert('User registered successfully.');
        registerForm.reset();
        renderUserTable();
    });

    logoutLink.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        alert('Logged out successfully.');
        window.location.href = 'user.html';
    });

    function renderUserTable() {
        userTableBody.innerHTML = '';
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            const agentNameCell = document.createElement('td');
            const roleCell = document.createElement('td');
            const actionsCell = document.createElement('td');

            agentNameCell.textContent = user.agentName;
            roleCell.textContent = user.role;

            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fa-solid fa-pen-to-square" style="color:white"></i>';
            editButton.classList.add('btn', 'btn-success', 'btn-sm', 'me-4','ms-4');
            editButton.addEventListener('click', () => editUser(index));

            const removeButton = document.createElement('button');
            removeButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
            removeButton.classList.add('btn', 'btn-danger', 'btn-sm');
            removeButton.addEventListener('click', () => removeUser(index));

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(removeButton);

            row.appendChild(agentNameCell);
            row.appendChild(roleCell);
            row.appendChild(actionsCell);

            userTableBody.appendChild(row);
        });
    }

    function editUser(index) {
        const user = users[index];

        const newAgentName = prompt('Enter new agent name:', user.agentName);
        const newPassword = prompt('Enter new password:', user.password);

        if (newAgentName && newPassword) {
            users[index].agentName = newAgentName;
            users[index].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            renderUserTable();
        }
    }
    function removeUser(index) {
        // Prevent removal of the logged-in admin user
        const userToRemove = users[index];
        if (loggedInUser && loggedInUser.agentName === userToRemove.agentName) {
            alert('You cannot remove your own user account.');
            return;
        }

        if (confirm('Are you sure you want to remove this user?')) {
            users.splice(index, 1);
            localStorage.setItem('users', JSON.stringify(users));
            renderUserTable();
        }
    }
});

// Toggle password visibility function
function togglePasswordVisibility(passwordId, toggleIconId) {
    const passwordField = document.getElementById(passwordId);
    const toggleIcon = document.getElementById(toggleIconId);
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;

    // Change the icon based on the visibility state
    toggleIcon.classList.toggle('fa-eye');
    toggleIcon.classList.toggle('fa-eye-slash');
}