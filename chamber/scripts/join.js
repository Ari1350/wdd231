document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const timestampField = document.querySelector("#timestamp");

    function generateTimestamp() {
        const now = new Date();
        return now.toISOString();
    }

    form.addEventListener("submit", (event) => {
        timestampField.value = generateTimestamp();

        const firstName = document.querySelector("#first-name").value.trim();
        const lastName = document.querySelector("#last-name").value.trim();
        const email = document.querySelector("#email").value.trim();

        if (!firstName || !lastName || !email) {
            event.preventDefault(); 
            alert("Please fill in all required fields.");
        }
    });
});
