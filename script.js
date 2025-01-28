document.addEventListener("DOMContentLoaded", function () {
    const questionContainer = document.getElementById("question-container");
    let questions = [];
    let answers = {}; // Store the user's answers
    let answeredQuestions = new Set(); // Track which questions have been answered

    // Load the questions from the JSON file
    fetch("questions.json")
        .then((response) => response.json())
        .then((data) => {
            questions = data.questions;
            showQuestion(questions[0], 0); // Start with the first question
        })
        .catch((err) => console.error("Error loading questions:", err));

    function showQuestion(question, parentIndex) {
        if (answeredQuestions.has(question.id)) {
            return; // Prevent duplicate questions
        }

        // Check if it's a final suggestion
        if (!question.question && Object.keys(question.answers).length === 0 && question.finalsuggestion) {
            const suggestionElement = document.createElement("div");
            suggestionElement.classList.add("final-suggestion");
            suggestionElement.innerText = question.finalsuggestion;

            // Add information box if available
            if (question.information) {
                const infoBox = document.createElement("div");
                infoBox.classList.add("info-box");
                infoBox.innerText = question.information;
                suggestionElement.appendChild(infoBox);
            }
            
            questionContainer.appendChild(suggestionElement);
            return;
        }

        const questionElement = document.createElement("div");
        questionElement.classList.add("question");
        questionElement.dataset.questionId = question.id;

        const questionText = document.createElement("p");
        questionText.innerText = question.question;
        questionElement.appendChild(questionText);

        // Add information box if available
        if (question.information) {
            const infoBox = document.createElement("div");
            infoBox.classList.add("info-box");
            infoBox.innerText = question.information;
            questionElement.appendChild(infoBox);
        }

        const answerButtons = document.createElement("div");
        Object.keys(question.answers).forEach((answer) => {
            const button = document.createElement("button");
            button.innerText = answer;
            button.classList.add("answer-button");
            button.addEventListener("click", function () {
                handleAnswer(answer, question, questionElement);
            });
            answerButtons.appendChild(button);
        });
        questionElement.appendChild(answerButtons);

        questionContainer.appendChild(questionElement);
    }

    function handleAnswer(answer, currentQuestion, questionElement) {
        // Reset following questions if answer changes
        resetFollowingQuestions(currentQuestion.id);
    
        // Save the answer
        answers[currentQuestion.id] = answer;
        answeredQuestions.add(currentQuestion.id);
    
        // Update button styles
        const buttons = questionElement.querySelectorAll("button");
        buttons.forEach((button) => {
            button.style.backgroundColor = button.innerText === answer ? "#2E6CB9" : "#616161";
            button.style.color = "#FFFFFF;";
        });
    
        // Get the next set of questions (can be an array)
        const nextQuestionIds = currentQuestion.answers[answer];
    
        // If there are multiple follow-up questions, display them one by one
        if (Array.isArray(nextQuestionIds)) {
            showMultipleQuestions(nextQuestionIds);
        } else {
            const nextQuestion = questions.find((q) => q.id === nextQuestionIds);
            if (nextQuestion) {
                showQuestion(nextQuestion, questionElement.dataset.questionId);
            }
        }
    }
    
    // Function to display multiple follow-up questions
    function showMultipleQuestions(questionIds) {
        questionIds.forEach((nextQuestionId, index) => {
            const nextQuestion = questions.find((q) => q.id === nextQuestionId);
            if (nextQuestion) {
                setTimeout(() => showQuestion(nextQuestion, null), index * 500); // Delay to show questions one by one
            }
        });
    }
    

    function resetFollowingQuestions(startId) {
        let remove = false;
        document.querySelectorAll(".question, .final-suggestion").forEach((element) => {
            const questionId = parseInt(element.dataset.questionId);
            if (remove) {
                element.remove();
                answeredQuestions.delete(questionId);
                delete answers[questionId];
            }
            if (questionId === startId) {
                remove = true;
            }
        });
    }
});
