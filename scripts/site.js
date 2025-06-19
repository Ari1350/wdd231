document.addEventListener("DOMContentLoaded", () => {

    const faqSection = document.querySelector("#scenarios ul");
    const extraQuestions = [
        "What are the most common flowers in Bolivia?",
        "How can I identify native flowers in the wild?",
        "Are Bolivian flowers used for medicinal purposes?"
    ];

    extraQuestions.forEach(question => {
        const listItem = document.createElement("li");
        listItem.textContent = question;
        faqSection.appendChild(listItem);
    });

    const form = document.querySelector("form");
    form.addEventListener("submit", event => {
        event.preventDefault(); 
        const name = document.querySelector("#name").value;
        const message = document.querySelector("#message").value;

        if (name && message) {
            alert(`Thank you, ${name}! Your message has been received.`);
            form.reset();
        } else {
            alert("Please fill out all fields before submitting.");
        }
    });
});
