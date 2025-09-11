const courses = [
    { name: "WDD131", type: "WDD", completed: true, credits: 3 },
    { name: "WDD132", type: "WDD", completed: false, credits: 3 },
    { name: "CSE110", type: "CSE", completed: true, credits: 4 },
    { name: "CSE120", type: "CSE", completed: false, credits: 3 }
];

function renderCourses(filter = "all") {
    const container = document.getElementById("course-cards");
    container.innerHTML = "";
    const filtered = courses.filter(course => filter === "all" || course.type === filter);

    filtered.forEach(course => {
        const card = document.createElement("div");
        card.classList.add("card");
        if(course.completed) card.classList.add("completed");

        card.innerHTML = `
            <h3>${course.name}</h3>
            <p>Tipo: ${course.type}</p>
            <p>Créditos: ${course.credits}</p>
           <p>${course.completed ? "Completed" : "Not completed"}</p>
        `;
        container.appendChild(card);
    });
}

document.getElementById('all').addEventListener('click', () => renderCourses('all'));
document.getElementById('wdd').addEventListener('click', () => renderCourses('WDD'));
document.getElementById('cse').addEventListener('click', () => renderCourses('CSE'));

