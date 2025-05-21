document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

document.getElementById('currentyear').textContent = new Date().getFullYear();
document.getElementById('lastModified').textContent = `Last Updated: ${document.lastModified}`;

const courses = [
    {
        subject: 'CSE',
        number: 110,
        title: 'Introduction to Programming',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce students to programming. It will introduce the building blocks of programming languages (variables, decisions, calculations, loops, array, and input/output) and use them to solve problems.',
        technology: ['Python'],
        completed: false,
    },
    {
        subject: 'WDD',
        number: 130,
        title: 'Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course introduces students to the World Wide Web and to careers in web site design and development.',
        technology: ['HTML', 'CSS'],
        completed: false,
    },
    {
        subject: 'CSE',
        number: 111,
        title: 'Programming with Functions',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'CSE 111 students become more organized, efficient, and powerful computer programmers by learning to research and call functions written by others.',
        technology: ['Python'],
        completed: false,
    },
    {
        subject: 'CSE',
        number: 210,
        title: 'Programming with Classes',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce the notion of classes and objects. It will present encapsulation at a conceptual level.',
        technology: ['C#'],
        completed: false,
    },
    {
        subject: 'WDD',
        number: 131,
        title: 'Dynamic Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience in Web Fundamentals and programming.',
        technology: ['HTML', 'CSS', 'JavaScript'],
        completed: false,
    },
    {
        subject: 'WDD',
        number: 231,
        title: 'Frontend Web Development I',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience with Dynamic Web Fundamentals and programming.',
        technology: ['HTML', 'CSS', 'JavaScript'],
        completed: false,
    },
];

function displayCourses(filter = 'all') {
  const container = document.getElementById('course-cards');
  container.innerHTML = '';

  const filteredCourses = courses.filter(course =>
    filter === 'all' ? true : course.subject === filter
  );

  filteredCourses.forEach(course => {
    const card = document.createElement('div');
    card.textContent = `${course.subject} ${course.number}: ${course.title}`;
    card.style.background = course.completed ? '#2a7d5f' : '#d9534f';
    card.style.color = 'white';
    card.style.margin = '1rem';
    card.style.padding = '1rem';
    container.appendChild(card);
  });
}

document.getElementById('all').addEventListener('click', () => displayCourses('all'));
document.getElementById('cse').addEventListener('click', () => displayCourses('CSE'));
document.getElementById('wdd').addEventListener('click', () => displayCourses('WDD'));

displayCourses()