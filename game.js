// הגדרת הסאונדים
const correctSound = new Howl({
    src: ['correct.mp3']
  });
  
  const wrongSound = new Howl({
    src: ['wrong.mp3']
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
    });
});

    virtualKeyboard.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
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
});

function showQuestion() {
    console.log("Showing question, current question:", currentQuestion);
    if (currentQuestion < multiplicationTable.length) {
        const question = multiplicationTable[currentQuestion].question;
        // פיצול התרגיל למרכיביו
        const [num1, operator, num2] = question.split(' ');
        // יצירת מחרוזת HTML עם הסדר הנכון
        const formattedQuestion = `<span class="number">${num1}</span> <span class="operator">${operator}</span> <span class="number">${num2}</span>`;
        displayMessage(formattedQuestion, true);
        document.getElementById('input-container').style.display = 'flex';
        setTimeout(() => document.getElementById('answer-input').focus(), 0);
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
            if (fontSize <= 12) break; // מניעת הקטנה מוגזמת של הפונט
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
      const answerInput = document.getElementById('answer-input');
      const answer = answerInput.value;
      if (currentQuestion < multiplicationTable.length) {
        checkAnswer(answer);
      } else {
        checkWrongAnswer(answer);
      }
      answerInput.value = '';
      // הסרנו את הפוקוס מה-input כדי למנוע את הופעת המקלדת של המכשיר
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
        messageElement.classList.add('message');
        messageElement.textContent = message;
    }
    
    gameArea.appendChild(messageElement);
}

function showIntermediateQuestion(questions, index, repetition = 0) {
    if (index < questions.length) {
        const question = questions[index];
        if (repetition < 3) {
            displayMessage(`${question.question} = ${question.answer}`, true);
            // ... שאר הקוד נשאר ללא שינוי
        } else {
            showIntermediateQuestion(questions, index + 1);
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
window.onload = function() {
    console.log("Page loaded, starting game");
    startGame();
};

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

function showVirtualKeyboard() {
  const virtualKeyboard = document.getElementById('virtual-keyboard');
  if (window.innerWidth <= 600) {
    virtualKeyboard.style.display = 'grid';
  } else {
    virtualKeyboard.style.display = 'none';
  }
}

// קריאה לפונקציה בטעינת הדף ובשינוי גודל החלון
window.addEventListener('load', function() {
    console.log("Window loaded");
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    console.log("Virtual keyboard element after load:", virtualKeyboard);
    console.log("Virtual keyboard display after load:", window.getComputedStyle(virtualKeyboard).display);
    console.log("Window inner width:", window.innerWidth);
    
    showVirtualKeyboard();
    
    console.log("addNumber function:", typeof addNumber);
    console.log("clearAnswer function:", typeof clearAnswer);
    console.log("submitAnswer function:", typeof submitAnswer);
});

window.addEventListener('resize', showVirtualKeyboard);

function showVirtualKeyboard() {
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    if (window.innerWidth <= 600) {
        virtualKeyboard.style.display = 'grid';
    } else {
        virtualKeyboard.style.display = 'none';
    }
    console.log("Virtual keyboard display after showVirtualKeyboard:", virtualKeyboard.style.display);
}
