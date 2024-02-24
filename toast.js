// Toast Notification function
function toast(m) {
    var e = document.getElementById('toast_notification');
    if (e !== null) {
        e.innerHTML = `<span>${m}</span>`
    } else {
        alert(m);
    }
};

const formElement = document.getElementById("telegram_form");
const submitButton = formElement.querySelector("button");

// Attach onSubmit Event listener and send data to telegram
const unsubscribe = handleTelegram({
    form: formElement,
    token: "6828557740:AAGGEuRCAMAz9mEb4p6xuMNFUjtO_g1_Jlw",
    chat: -1002053193817,

    // Formatting
    format(data, media, form) { },
    caption(file, field, data, form) { },

    // Validation
    validate(data, form) {
        if (!data.name.value) {
            data.name.element.focus();
            return toast("Enter your name!");
        }

        if (!data.email.value) {
            data.email.element.focus();
            return toast("Enter your email!")
        }

        return true;
    },

    // Callbacks
    onSubmit(event, data, form) {
        submitButton.disabled = true;
    },
    onComplete(success, response, data, form) {
        submitButton.disabled = false;
    },
    onSent(response, data, form) {
        toast(`Hey, ${data.name.value}! Form submitted!`);
        // Reset form after submission
        formElement.reset();
    },
    onNotSent(error, reason, data, form) {
        if (reason !== "validation") {
            toast(`Form failed to submit! (${(error || {}).message || "Unknown"})`);
        }
    },
    onError(error, form) {
        console.log(error)
    },
});

// Call the unsubscribe function to remove listener
// unsubscribe();