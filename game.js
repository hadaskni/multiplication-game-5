// הגדרת הסאונדים
const correctSound = new Howl({
    src: ['correct.mp3']
  });
  
  const wrongSound = new Howl({
    src: ['wrong.mp3']
  });

const keyboardSound = new Howl({
  src: ['click.mp3']
});

const QUESTION_TIME = 6000; // 6 שניות לכל שאלה

keyboardSound.once('load', function(){
  console.log('Keyboard sound loaded successfully');
});

  correctSound.once('load', function(){
    console.log('Correct sound loaded successfully');
  });
  
  wrongSound.once('load', function(){
    console.log('Wrong sound loaded successfully');
  });

let multiplicationTable = [];
let wrongAnswers = [];
let currentQuestion = 0;
let currentWrongAnswer = 0;
let wrongAnswersQueue = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    
    if (virtualKeyboard) {
        console.log("Virtual keyboard element:", virtualKeyboard);
        console.log("Virtual keyboard display:", window.getComputedStyle(virtualKeyboard).display);

        // קוד להצגת המקלדת
        virtualKeyboard.style.display = 'grid'; // או 'flex', תלוי בעיצוב שלך
        console.log("Virtual keyboard display after setting:", virtualKeyboard.style.display);
      
        // פונקציה להצגת המקלדה הווירטואלית
        function showVirtualKeyboard() {
            if (window.innerWidth <= 600) {
                virtualKeyboard.style.display = 'grid'; // או 'flex'
            } else {
                virtualKeyboard.style.display = 'none';
            }
            console.log("Virtual keyboard display in showVirtualKeyboard:", virtualKeyboard.style.display);
        }

          // קריאה ראשונית לפונקציה
        showVirtualKeyboard();
    
        // הוספת מאזין אירועים לשינוי גודל החלון
        window.addEventListener('resize', showVirtualKeyboard);

        virtualKeyboard.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON') {
                 keyboardSound.play();
                const value = event.target.getAttribute('data-value');
                 
                switch(value) {
                    case 'clear':
                        clearAnswer();
                        break;
                    case 'submit':
                        submitAnswer();
                        break;
                    default:
                        addNumber(value);
                }
            }
        });       
    } else {
        console.error("Virtual keyboard element not found!");
    }
    
    startGame();

    // מונע את הופעת המקלדת של המכשיר כאשר לוחצים על ה-input
       const answerInput = document.getElementById('answer-input');
        if (answerInput) {
            answerInput.addEventListener('focus', function(e) {
                e.preventDefault();
                this.blur();
            });
        } else {
            console.error("Answer input element not found!");
        }

     document.addEventListener('touchstart', function() {
    keyboardSound.load();
  }, {once: true});
    
    });

let timer;

function showQuestion() {
    console.log("Showing question, current question:", currentQuestion);
    if (currentQuestion < multiplicationTable.length) {
        const question = multiplicationTable[currentQuestion].question;
        const [num1, operator, num2] = question.split(' ');
        const formattedQuestion = `<span class="number">${num1}</span> <span class="operator">${operator}</span> <span class="number">${num2}</span>`;
        displayMessage(formattedQuestion, true);
        document.getElementById('input-container').style.display = 'flex';
        setTimeout(() => document.getElementById('answer-input').focus(), 0);
        
        // הוספת טיימר
        clearTimeout(timer);
        timer = setTimeout(() => {
            submitAnswer();
        }, QUESTION_TIME);
    } else {
        startIntermediatePhase();
    }
    
    setTimeout(() => {
        const flashcardContent = document.querySelector('.flashcard-content');
        const flashcard = document.querySelector('.flashcard');
        if (flashcardContent && flashcard) {
          let fontSize = 36;
          flashcardContent.style.fontSize = `${fontSize}px`;
          while (flashcardContent.scrollWidth > flashcard.offsetWidth || flashcardContent.scrollHeight > flashcard.offsetHeight) {
            fontSize--;
            flashcardContent.style.fontSize = `${fontSize}px`;
            if (fontSize <= 12) break;
          }
        }
      }, 0);
}

function startGame() {
    multiplicationTable = [];
    wrongAnswers = [];
    currentQuestion = 0;
    const multiple = 5; // או כל מספר אחר שתרצה
    for (let i = 1; i <= 10; i++) {
        multiplicationTable.push({
            question: `${multiple} x ${i}`,
            answer: multiple * i
        });
    }
    shuffleArray(multiplicationTable);
    document.getElementById('game-area').innerHTML = '';
    document.getElementById('input-container').style.display = 'flex';
    const inputElement = document.getElementById('answer-input');
    inputElement.value = '';
    inputElement.addEventListener('keypress', handleEnterKey);
    showQuestion();
}

function submitAnswer() {
    console.log("Submitting answer");
    clearTimeout(timer);
    const answerInput = document.getElementById('answer-input');
    const answer = answerInput.value;
    if (currentQuestion < multiplicationTable.length) {
        checkAnswer(answer);
    } else {
        checkWrongAnswer(answer);
    }
    answerInput.value = '';
    answerInput.blur();
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        submitAnswer();
    }
}

function checkAnswer(userAnswer) {
    const correctAnswer = multiplicationTable[currentQuestion].answer;
    if (parseInt(userAnswer) === correctAnswer) {
        correctSound.play();
        displayMessage("נכון, כל הכבוד!", false);
        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < multiplicationTable.length) {
                showQuestion();
            } else {
                startIntermediatePhase();
            }
        }, 1000);
    } else {
        wrongSound.play();
        displayMessage(`התשובה הנכונה היא ${correctAnswer}. נסה שנית.`, false);
        wrongAnswers.push(multiplicationTable[currentQuestion]);
        setTimeout(() => {
            showQuestion();
            // הוסף את השורה הבאה
            document.getElementById('answer-input').focus();
        }, 2000);
    }
}

function displayMessage(message, isFlashcard = false) {
    console.log("Displaying message:", message);
    document.getElementById('input-container').style.display = 'none';
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    const messageElement = document.createElement('div');
    
    if (isFlashcard) {
        messageElement.classList.add('flashcard');
        const contentElement = document.createElement('div');
        contentElement.classList.add('flashcard-content');
        contentElement.innerHTML = `<span>${message}</span>`;
        messageElement.appendChild(contentElement);
        
        // התאמת גודל הפונט לקלף
        setTimeout(() => {
            const fontSize = Math.min(
                (messageElement.offsetWidth * 0.9) / (message.length * 0.6),
                messageElement.offsetHeight * 0.2
            );
            contentElement.style.fontSize = `${fontSize}px`;
        }, 0);
    } else {
        messageElement.classList.add('feedback-message');
        messageElement.textContent = message;
    }
    
    gameArea.appendChild(messageElement);

    if (!isFlashcard) {
        setTimeout(adjustFeedbackSize, 0);
    }
}

function showIntermediateQuestion(questions, index, repetition = 0) {
    if (index < questions.length) {
        const question = questions[index];
        if (repetition < 3) {
            displayMessage(`${question.question} = ${question.answer}`, true);
            setTimeout(() => {
                // מסתיר את השאלה לחצי שנייה
                displayMessage("", true);
                setTimeout(() => {
                    // קורא לפונקציה שוב אחרי חצי שנייה
                    showIntermediateQuestion(questions, index, repetition + 1);
                }, 700);
            }, 3000); // מציג כל חזרה למשך 3 שניות
        } else {
            // עובר לשאלה הבאה
            setTimeout(() => {
                showIntermediateQuestion(questions, index + 1, 0);
            }, 700);
        }
    } else {
        displayMessage("סיימנו את שלב הביניים. עוברים לשלב האחרון.");
        setTimeout(startSecondPhase, 2000);
    }
}

function startIntermediatePhase() {
    displayMessage("כעת קרא את התרגילים הבאים בקול רם.");
    let intermediatePractice = [];
    // השתמש ב-Set כדי להבטיח שכל תרגיל מופיע רק פעם אחת
    let uniqueWrongAnswers = new Set(wrongAnswers.map(JSON.stringify));
    intermediatePractice = Array.from(uniqueWrongAnswers).map(JSON.parse);
    
    setTimeout(() => {
        showIntermediateQuestion(intermediatePractice, 0);
    }, 2000);
}

function startSecondPhase() {
    displayMessage("מתחילים את השלב השלישי - תרגול השגיאות");
    if (wrongAnswers.length > 0) {
        wrongAnswersQueue = [];
        for (let i = 0; i < wrongAnswers.length; i++) {
            for (let j = 0; j < 3; j++) {
                wrongAnswersQueue.push(wrongAnswers[i]);
            }
        }
        shuffleArray(wrongAnswersQueue);
        currentWrongAnswer = 0;
        setTimeout(() => {
            showWrongQuestion();
            document.getElementById('input-container').style.display = 'flex';
            document.getElementById('answer-input').focus();
        }, 2000);
    } else {
        displayMessage("כל הכבוד! לא היו שגיאות. המשחק הסתיים.");
    }
}

function showWrongQuestion() {
    if (currentWrongAnswer < wrongAnswersQueue.length) {
        const question = wrongAnswersQueue[currentWrongAnswer].question;
        displayMessage(question, true);
        document.getElementById('input-container').style.display = 'flex';
        document.getElementById('answer-input').focus();
        
        // הוספת טיימר
        clearTimeout(timer);
        timer = setTimeout(() => {
            submitAnswer();
        }, QUESTION_TIME);
    } else {
        displayMessage("סיימנו את כל סבבי התרגול. המשחק הסתיים.");
        document.getElementById('input-container').style.display = 'none';
    }
}

function checkWrongAnswer(userAnswer) {
    const correctAnswer = wrongAnswersQueue[currentWrongAnswer].answer;
    if (parseInt(userAnswer) === correctAnswer) {
        correctSound.play();
        displayMessage("כל הכבוד!", false);
        setTimeout(() => {
            currentWrongAnswer++;
            if (currentWrongAnswer < wrongAnswersQueue.length) {
                showWrongQuestion();
            } else {
                displayMessage("סיימנו את כל סבבי התרגול. המשחק הסתיים.");
                document.getElementById('input-container').style.display = 'none';
                document.getElementById('answer-input').removeEventListener('keypress', handleEnterKey);
            }
        }, 1000);
    } else {
        wrongSound.play();
        displayMessage(`התשובה הנכונה היא ${correctAnswer}. נסה שנית.`, false);
        setTimeout(() => {
            showWrongQuestion();
        }, 2000);
    }
}

// הוסף את זה בסוף הקובץ game.js
console.log("JavaScript file loaded");

// קריאה אוטומטית לפונקציית startGame בטעינת הדף
window.addEventListener('load', function() {
    console.log("Page loaded, starting game");
    startGame();
});

// פונקציה לערבוב מערך (אלגוריתם Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// התאמה למסכי מגע
document.addEventListener('touchstart', function() {
    // טעינת הסאונד בעקבות אינטראקציה של המשתמש
    if (typeof correctSound !== 'undefined' && typeof wrongSound !== 'undefined') {
        correctSound.load();
        wrongSound.load();
      }
    }, {once: true});

// פונקציות עזר
function addNumber(num) {
    console.log("Adding number:", num);
    const answerInput = document.getElementById('answer-input');
    answerInput.value += num;
    console.log("Current input value:", answerInput.value);
}

function clearAnswer() {
    console.log("Clearing answer");
    const answerInput = document.getElementById('answer-input');
    answerInput.value = '';
}

function adjustFeedbackSize() {
    const feedbackElement = document.querySelector('.feedback-message');
    if (feedbackElement) {
        let fontSize = 36;
        feedbackElement.style.fontSize = `${fontSize}px`;
        while (feedbackElement.scrollWidth > feedbackElement.offsetWidth || feedbackElement.scrollHeight > feedbackElement.offsetHeight) {
            fontSize--;
            feedbackElement.style.fontSize = `${fontSize}px`;
            if (fontSize <= 12) break;
        }
    }
}


