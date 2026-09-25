// =========================
// GAME STATE
// =========================

const savedGameState =
    JSON.parse(
        localStorage.getItem("apartmentSimGameState")
    );

const gameState = savedGameState || {

    level: 1,

    xp: 0,

    needs: {
        cleanliness: 50,
        hunger: 50,
        energy: 50,
        fun: 50,
        social: 50,
        environment: 50
    },

    lastNeedsUpdate: Date.now()

};

Object.keys(gameState.needs).forEach(need => {

    if (!Number.isFinite(gameState.needs[need])) {
        gameState.needs[need] = 50;
    }

});

if (!gameState.lastNeedsUpdate) {
    gameState.lastNeedsUpdate = Date.now();
}


const NEED_DECAY_PER_HOUR = {

    cleanliness: 2,
    hunger: 3,
    energy: 2,
    fun: 1,
    social: 1,
    environment: 1

};


// =========================
// SCHEDULE START DATE
// =========================
//
// Today is Wednesday, September 23, 2026.
// All recurring tasks use this as their starting point.
//

const START_DATE = "2026-09-23";


// =========================
// TASK DEFINITIONS
// =========================

const taskDefinitions = [

    // -------------------------
    // BEDROOM
    // -------------------------

    {
        id: "bedroom-wash-sheets",
        name: "Wash sheets",
        category: "Bedroom",
        recurrence: {
            type: "weekly"
        },
        xp: 25,
        needs: {
            cleanliness: 6,
            environment: 5
        }
    },

    {
        id: "bedroom-make-bed",
        name: "Make bed",
        category: "Bedroom",
        recurrence: {
            type: "daily"
        },
        xp: 10,
        needs: {
            environment: 4
        }
    },

    {
        id: "bedroom-vacuum",
        name: "Vacuum floors",
        category: "Bedroom",
        recurrence: {
            type: "weekly"
        },
        xp: 25,
        needs: {
            cleanliness: 8
        }
    },

    {
        id: "bedroom-laundry",
        name: "Put laundry away",
        category: "Bedroom",
        recurrence: {
            type: "interval",
            days: 2
        },
        xp: 15,
        needs: {
            environment: 5
        }
    },

    {
        id: "bedroom-tidy",
        name: "Tidy",
        category: "Bedroom",
        recurrence: {
            type: "daily"
        },
        xp: 15,
        needs: {
            environment: 6
        }
    },

    {
        id: "bedroom-cat-area",
        name: "Clean the cat's area",
        category: "Bedroom",
        recurrence: {
            type: "interval",
            days: 2
        },
        xp: 20,
        needs: {
            cleanliness: 5,
            environment: 5
        }
    },

    {
        id: "bedroom-litter",
        name: "Scoop the litter",
        category: "Bedroom",
        recurrence: {
            type: "daily"
        },
        xp: 15,
        needs: {
            cleanliness: 7
        }
    },


    // -------------------------
    // LIVING ROOM
    // -------------------------

    {
        id: "living-couch",
        name: "Clean couch",
        category: "Living Room",
        recurrence: {
            type: "weekly"
        },
        xp: 20,
        needs: {
            cleanliness: 5,
            environment: 4
        }
    },

    {
        id: "living-tidy",
        name: "Tidy",
        category: "Living Room",
        recurrence: {
            type: "daily"
        },
        xp: 15,
        needs: {
            environment: 6
        }
    },

    {
        id: "living-vacuum",
        name: "Vacuum",
        category: "Living Room",
        recurrence: {
            type: "weekly"
        },
        xp: 25,
        needs: {
            cleanliness: 8
        }
    },


    // -------------------------
    // BATHROOM
    // -------------------------

    {
        id: "bathroom-rugs",
        name: "Wash rugs",
        category: "Bathroom",
        recurrence: {
            type: "interval",
            days: 14
        },
        xp: 25,
        needs: {
            cleanliness: 7,
            environment: 4
        }
    },

    {
        id: "bathroom-toilet",
        name: "Clean toilet",
        category: "Bathroom",
        recurrence: {
            type: "weekly"
        },
        xp: 20,
        needs: {
            cleanliness: 8
        }
    },

    {
        id: "bathroom-shower",
        name: "Clean shower",
        category: "Bathroom",
        recurrence: {
            type: "weekly"
        },
        xp: 25,
        needs: {
            cleanliness: 9
        }
    },

    {
        id: "bathroom-floors",
        name: "Clean floors",
        category: "Bathroom",
        recurrence: {
            type: "interval",
            days: 3
        },
        xp: 20,
        needs: {
            cleanliness: 7
        }
    },

    {
        id: "bathroom-tidy",
        name: "Tidy",
        category: "Bathroom",
        recurrence: {
            type: "daily"
        },
        xp: 15,
        needs: {
            environment: 5
        }
    },

    {
        id: "bathroom-counters",
        name: "Wash counters",
        category: "Bathroom",
        recurrence: {
            type: "daily"
        },
        xp: 15,
        needs: {
            cleanliness: 5,
            environment: 3
        }
    },


    // -------------------------
    // KITCHEN
    // -------------------------

    {
        id: "kitchen-fridge",
        name: "Clean out fridge",
        category: "Kitchen",
        recurrence: {
            type: "weekly"
        },
        xp: 30,
        needs: {
            cleanliness: 8,
            environment: 5
        }
    },

    {
        id: "kitchen-sweep",
        name: "Sweep",
        category: "Kitchen",
        recurrence: {
            type: "weekly"
        },
        xp: 20,
        needs: {
            cleanliness: 7
        }
    },

    {
        id: "kitchen-tidy",
        name: "Tidy",
        category: "Kitchen",
        recurrence: {
            type: "daily"
        },
        xp: 15,
        needs: {
            environment: 6
        }
    },

    {
        id: "kitchen-dishes",
        name: "Wash dishes",
        category: "Kitchen",
        recurrence: {
            type: "daily"
        },
        xp: 20,
        needs: {
            cleanliness: 7,
            environment: 3
        }
    },

    {
        id: "kitchen-counters",
        name: "Wash counters",
        category: "Kitchen",
        recurrence: {
            type: "interval",
            days: 2
        },
        xp: 15,
        needs: {
            cleanliness: 5,
            environment: 3
        }
    }

];


// =========================
// NEED ACTIONS
// =========================

const needsActions = {

    hunger: [

        {
            name: "Cook a meal",
            effects: {
                hunger: 30
            }
        },

        {
            name: "Eat leftovers",
            effects: {
                hunger: 30
            }
        },

        {
            name: "Order DoorDash",
            effects: {
                hunger: 30
            }
        },

        {
            name: "Go out to eat",
            effects: {
                hunger: 30
            }
        },

        {
            name: "Eat at work",
            effects: {
                hunger: 30
            }
        },

        {
            name: "Eat a snack",
            effects: {
                hunger: 15
            }
        },

        {
            name: "Drink water",
            effects: {
                hunger: 5
            }
        }

    ],


    energy: [

        {
            name: "Sleep",
            effects: {
                energy: 30
            }
        },

        {
            name: "Take a nap",
            effects: {
                energy: 30
            }
        },

        {
            name: "Rest in bed",
            effects: {
                energy: 15
            }
        },

        {
            name: "Take a shower",
            effects: {
                energy: 10
            }
        },

        {
            name: "Take a bath",
            effects: {
                energy: 20
            }
        },

        {
            name: "Full everything shower",
            effects: {
                energy: 20
            }
        },


        // Gentle reset

        {
            name: "Meditate",
            effects: {
                energy: 15
            }
        },

        {
            name: "Journal",
            effects: {
                energy: 10
            }
        },

        {
            name: "Sit quietly / do nothing",
            effects: {
                energy: 15
            }
        },

        {
            name: "Go outside",
            effects: {
                energy: 10
            }
        },

        {
            name: "Take a walk",
            effects: {
                energy: 15
            }
        },

        {
            name: "Spend time in nature",
            effects: {
                energy: 20
            }
        },


        // Getting yourself together

        {
            name: "Get ready for the day",
            effects: {
                energy: 10
            }
        },

        {
            name: "Do my hair",
            effects: {
                energy: 5
            }
        },

        {
            name: "Do my makeup",
            effects: {
                energy: 5
            }
        },

        {
            name: "Get dressed in a cute outfit",
            effects: {
                energy: 10
            }
        },


        // Spiritual

        {
            name: "Tarot",
            effects: {
                energy: 10
            }
        },

        {
            name: "Read something spiritual",
            effects: {
                energy: 10
            }
        },

        {
            name: "Practice manifestation",
            effects: {
                energy: 10
            }
        },

        {
            name: "Spiritual morning/night routine",
            effects: {
                energy: 20
            }
        },

        {
            name: "Light candles + have a quiet evening",
            effects: {
                energy: 20
            }
        },


        // Quiet pleasures

        {
            name: "Read for pleasure",
            effects: {
                energy: 10
            }
        },

        {
            name: "Listen to music",
            effects: {
                energy: 10
            }
        },

        {
            name: "Sit with my cat",
            effects: {
                energy: 10
            }
        },

        {
            name: "Cuddle with my cat",
            effects: {
                energy: 15
            }
        },

        {
            name: "Have a slow morning",
            effects: {
                energy: 20
            }
        },

        {
            name: "Take a break from screens",
            effects: {
                energy: 15
            }
        },

        {
            name: "Have a peaceful night in",
            effects: {
                energy: 20
            }
        }

    ],


    fun: [

        // Games

        {
            name: "Play a game",
            effects: {
                fun: 20
            }
        },

        {
            name: "Watch a movie",
            effects: {
                fun: 20
            }
        },

        {
            name: "Watch a TV show",
            effects: {
                fun: 15
            }
        },

        {
            name: "Watch YouTube",
            effects: {
                fun: 10
            }
        },

        {
            name: "Scroll TikTok / Lemon8 / Pinterest",
            effects: {
                fun: 5
            }
        },


        // Creative

        {
            name: "Draw",
            effects: {
                fun: 20
            }
        },

        {
            name: "Paint",
            effects: {
                fun: 25
            }
        },

        {
            name: "Write",
            effects: {
                fun: 15
            }
        },

        {
            name: "Work on music / lyrics",
            effects: {
                fun: 25
            }
        },

        {
            name: "Sing",
            effects: {
                fun: 20
            }
        },

        {
            name: "Practice DJing",
            effects: {
                fun: 25
            }
        },

        {
            name: "Crochet",
            effects: {
                fun: 20
            }
        },

        {
            name: "Do my nails",
            effects: {
                fun: 20
            }
        },

        {
            name: "Make a moodboard",
            effects: {
                fun: 15
            }
        },

        {
            name: "Work on fashion / design",
            effects: {
                fun: 25
            }
        },

        {
            name: "Thrift / shop for inspiration",
            effects: {
                fun: 20
            }
        },


        // Reading

        {
            name: "Read for pleasure",
            effects: {
                fun: 15
            }
        },

        {
            name: "Read at a café",
            effects: {
                fun: 20
            }
        },

        {
            name: "Browse Goodreads / choose a new book",
            effects: {
                fun: 10
            }
        },


        // Romanticizing

        {
            name: "Get dressed just because",
            effects: {
                fun: 15
            }
        },

        {
            name: "Do my makeup for fun",
            effects: {
                fun: 15
            }
        },

        {
            name: "Take cute photos",
            effects: {
                fun: 15
            }
        },

        {
            name: "Make a playlist",
            effects: {
                fun: 15
            }
        },

        {
            name: "Go get coffee",
            effects: {
                fun: 15
            }
        },

        {
            name: "Go somewhere I've never been",
            effects: {
                fun: 25
            }
        },

        {
            name: "Explore a new place",
            effects: {
                fun: 25
            }
        },

        {
            name: "Have a solo date",
            effects: {
                fun: 25
            }
        },


        // Little pleasures

        {
            name: "Listen to an album",
            effects: {
                fun: 15
            }
        },

        {
            name: "Dance around my apartment",
            effects: {
                fun: 20
            }
        },

        {
            name: "Light candles and have a cozy night",
            effects: {
                fun: 15
            }
        },

        {
            name: "Play with my cat",
            effects: {
                fun: 15
            }
        },

        {
            name: "Cuddle with my cat",
            effects: {
                fun: 15
            }
        },

        {
            name: "Spend time with my dog",
            effects: {
                fun: 15
            }
        },

        {
            name: "Sit outside",
            effects: {
                fun: 10
            }
        },

        {
            name: "Watch the sunset",
            effects: {
                fun: 15
            }
        }

    ],


    social: [

        // People

        {
            name: "Spend time with a friend",
            effects: {
                social: 25
            }
        },

        {
            name: "Hang out with family",
            effects: {
                social: 20
            }
        },

        {
            name: "Spend time with someone I'm dating",
            effects: {
                social: 25
            }
        },

        {
            name: "Have a meaningful conversation",
            effects: {
                social: 20
            }
        },

        {
            name: "Call someone",
            effects: {
                social: 15
            }
        },

        {
            name: "FaceTime someone",
            effects: {
                social: 15
            }
        },

        {
            name: "Text someone I care about",
            effects: {
                social: 10
            }
        },

        {
            name: "Check in on someone",
            effects: {
                social: 10
            }
        },


        // Going out

        {
            name: "Go out with friends",
            effects: {
                social: 30
            }
        },

        {
            name: "Go out to eat with someone",
            effects: {
                social: 25
            }
        },

        {
            name: "Get coffee with someone",
            effects: {
                social: 20
            }
        },

        {
            name: "Go shopping with someone",
            effects: {
                social: 20
            }
        },

        {
            name: "Go to a bar / social place",
            effects: {
                social: 20
            }
        },

        {
            name: "Go to an event",
            effects: {
                social: 25
            }
        },

        {
            name: "Go somewhere with someone I've never been before",
            effects: {
                social: 25
            }
        },

        {
            name: "Have a double date",
            effects: {
                social: 25
            }
        },

        {
            name: "Have a girls' night",
            effects: {
                social: 30
            }
        },


        // Low-key

        {
            name: "Sit and talk with someone",
            effects: {
                social: 20
            }
        },

        {
            name: "Watch something with someone",
            effects: {
                social: 15
            }
        },

        {
            name: "Cook with someone",
            effects: {
                social: 20
            }
        },

        {
            name: "Eat a meal with someone",
            effects: {
                social: 20
            }
        },

        {
            name: "Run errands with someone",
            effects: {
                social: 15
            }
        },

        {
            name: "Go for a walk with someone",
            effects: {
                social: 20
            }
        },

        {
            name: "Play a game with someone",
            effects: {
                social: 20
            }
        },

        {
            name: "Hang out at someone's home",
            effects: {
                social: 20
            }
        },

        {
            name: "Invite someone over",
            effects: {
                social: 20
            }
        },


        // Community

        {
            name: "Meet someone new",
            effects: {
                social: 20
            }
        },

        {
            name: "Talk to someone new",
            effects: {
                social: 10
            }
        },

        {
            name: "Go somewhere social by myself",
            effects: {
                social: 10
            }
        },

        {
            name: "Attend a class / group",
            effects: {
                social: 20
            }
        },

        {
            name: "Go to a local event",
            effects: {
                social: 20
            }
        },

        {
            name: "Spend time in a social environment",
            effects: {
                social: 15
            }
        },


        // Digital

        {
            name: "Text a friend",
            effects: {
                social: 10
            }
        },

        {
            name: "Send someone a funny video",
            effects: {
                social: 5
            }
        },

        {
            name: "Respond to messages",
            effects: {
                social: 5
            }
        },

        {
            name: "Voice message someone",
            effects: {
                social: 10
            }
        },

        {
            name: "Call someone I haven't talked to recently",
            effects: {
                social: 15
            }
        },

        {
            name: "Catch up with someone online",
            effects: {
                social: 15
            }
        }

    ]

};

// =========================
// DATE UTILITIES
// =========================

function getToday() {

    const now = new Date();

    const year = now.getFullYear();
    const month =
        String(now.getMonth() + 1).padStart(2, "0");
    const day =
        String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function parseDate(dateString) {

    const [year, month, day] =
        dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
}


function daysBetween(startDate, endDate) {

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const difference =
        end.getTime() - start.getTime();

    return Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );
}


// =========================
// TASK SCHEDULE
// =========================

function getTaskDueDate(task) {

    const recurrence = task.recurrence;
    const recurrenceState = getRecurrenceState();

    const lastCompleted =
        recurrenceState[task.id];

    // If completed before, the next occurrence
    // is based on the completion date.

    if (lastCompleted) {

        const lastDate =
            parseDate(lastCompleted);

        if (recurrence.type === "daily") {

            lastDate.setDate(
                lastDate.getDate() + 1
            );

            return formatDate(lastDate);
        }

        if (recurrence.type === "weekly") {

            lastDate.setDate(
                lastDate.getDate() + 7
            );

            return formatDate(lastDate);
        }

        if (recurrence.type === "interval") {

            lastDate.setDate(
                lastDate.getDate() +
                recurrence.days
            );

            return formatDate(lastDate);
        }
    }


    // First occurrence

    const startDate =
        parseDate(START_DATE);

    if (recurrence.type === "daily") {
        return START_DATE;
    }

    if (recurrence.type === "weekly") {

        while (startDate.getDay() !== 3) {

            startDate.setDate(
                startDate.getDate() + 1
            );
        }

        return formatDate(startDate);
    }

    if (recurrence.type === "interval") {
        return START_DATE;
    }

    return null;
}


function isTaskDue(task, dateString) {

    const recurrence = task.recurrence;
    const recurrenceState = getRecurrenceState();

    const lastCompleted =
        recurrenceState[task.id];


    // If this task has been completed before,
    // calculate its next occurrence from that date.

    if (lastCompleted) {

        const daysSinceCompletion =
            daysBetween(
                lastCompleted,
                dateString
            );


        // Daily

        if (recurrence.type === "daily") {

            return (
                daysSinceCompletion >= 1
            );
        }


        // Weekly

        if (recurrence.type === "weekly") {

            return (
                daysSinceCompletion >= 7
            );
        }


        // Interval

        if (recurrence.type === "interval") {

            return (
                daysSinceCompletion >=
                recurrence.days
            );
        }

        return false;
    }


    // If the task has NEVER been completed,
    // use its original schedule.

    const daysSinceStart =
        daysBetween(
            START_DATE,
            dateString
        );


    // Daily

    if (recurrence.type === "daily") {
        return true;
    }


    // Weekly — Wednesday

    if (recurrence.type === "weekly") {

        const date =
            parseDate(dateString);

        // 0 = Sunday
        // 1 = Monday
        // 2 = Tuesday
        // 3 = Wednesday

        return (
            daysSinceStart >= 0 &&
            date.getDay() === 3
        );
    }


    // Interval

    if (recurrence.type === "interval") {

        return (
            daysSinceStart >= 0 &&
            daysSinceStart %
                recurrence.days === 0
        );
    }

    return false;
}


// =========================
// GET TODAY'S TASKS
// =========================

function getTodaysTasks() {

    const today =
        getToday();

    const yesterday =
        getPreviousDate(today);

    return taskDefinitions.filter(task => {

        const dueToday =
            isTaskDue(
                task,
                today
            );

        const dueYesterday =
            isTaskDue(
                task,
                yesterday
            );

        const completedToday =
            isCompletedToday(
                task.id
            );

        const completedYesterday =
            isCompletedOnDate(
                task.id,
                yesterday
            );

        const unfinishedYesterday =
            dueYesterday &&
            !completedYesterday;

        return (
            (dueToday && !completedToday) ||
            unfinishedYesterday ||
            completedToday
        );
    });
}


// =========================
// COMPLETION STORAGE
// =========================

function getCompletedTasks() {

    const saved =
        localStorage.getItem(
            "apartmentSimCompletions"
        );

    if (!saved) {
        return {};
    }

    try {

        return JSON.parse(saved);

    } catch {

        return {};
    }
}


function saveCompletedTasks(completions) {

    localStorage.setItem(
        "apartmentSimCompletions",
        JSON.stringify(completions)
    );
}


function getRecurrenceState() {

    const saved =
        localStorage.getItem(
            "apartmentSimRecurrence"
        );

    if (!saved) {
        return {};
    }

    try {

        return JSON.parse(saved);

    } catch {

        return {};
    }
}


function saveRecurrenceState(state) {

    localStorage.setItem(
        "apartmentSimRecurrence",
        JSON.stringify(state)
    );
}


// =========================
// TODAY'S COMPLETIONS
// =========================

function getPreviousDate(dateString) {

    const date =
        parseDate(dateString);

    date.setDate(
        date.getDate() - 1
    );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function isCompletedOnDate(
    taskId,
    dateString
) {

    const completions =
        getCompletedTasks();

    if (!completions[dateString]) {
        return false;
    }

    return completions[
        dateString
    ].includes(taskId);
}


function isCompletedToday(taskId) {

    const today =
        getToday();

    const completions =
        getCompletedTasks();

    return Boolean(
        completions[today]?.includes(taskId)
    );
}


// =========================
// COMPLETE TASK
// =========================

function completeTask(taskId) {

    const today =
        getToday();

    const completions =
        getCompletedTasks();

    const recurrenceState =
        getRecurrenceState();


    if (!completions[today]) {

        completions[today] = [];
    }


    const task =
        taskDefinitions.find(
            task => task.id === taskId
        );


    if (!task) {
        return;
    }


    const alreadyCompleted =
        completions[today].includes(
            taskId
        );


    if (alreadyCompleted) {

        completions[today] =
            completions[today].filter(
                id => id !== taskId
            );

        removeXP(task.xp);

        changeNeeds(
            task.needs,
            -1
        );


        // Remove today's completion
        // as the recurrence anchor

        if (
            recurrenceState[taskId] ===
            today
        ) {

            delete recurrenceState[
                taskId
            ];
        }

    } else {

        completions[today].push(
            taskId
        );

        addXP(task.xp);

        changeNeeds(
            task.needs,
            1
        );

        showTaskFeedback(task);


        // Remember the actual date
        // this task was completed

        recurrenceState[taskId] =
            today;
    }


    saveCompletedTasks(
        completions
    );

    saveRecurrenceState(
        recurrenceState
    );

    renderTasks();
}


function showTaskFeedback(task) {

    const feedback =
        document.createElement("div");

    feedback.className =
        "task-feedback";


    let message =
        `+${task.xp} XP`;


    if (task.needs) {

        Object.entries(
            task.needs
        ).forEach(
            ([need, amount]) => {

                const formattedNeed =
                    need.charAt(0).toUpperCase() +
                    need.slice(1);

                message +=
                    ` • +${amount} ${formattedNeed}`;
            }
        );
    }


    feedback.textContent =
        message;

    document.body.appendChild(
        feedback
    );


    setTimeout(() => {

        feedback.remove();

    }, 2500);
}


function removeXP(amount) {

    gameState.xp -= amount;


    // If XP goes below zero,
    // move back down a level.

    while (
        gameState.xp < 0 &&
        gameState.level > 1
    ) {

        gameState.level--;

        gameState.xp += 100;
    }


    // Never allow negative XP
    // at level 1

    if (
        gameState.level === 1 &&
        gameState.xp < 0
    ) {

        gameState.xp = 0;
    }


    updateXPDisplay();

    saveGameState();
}


function changeNeeds(
    changes,
    multiplier
) {

    if (!changes) {
        return;
    }


    if (
        changes.cleanliness !==
        undefined
    ) {

        gameState.needs.cleanliness +=
            changes.cleanliness *
            multiplier;
    }


    if (
        changes.environment !==
        undefined
    ) {

        gameState.needs.environment +=
            changes.environment *
            multiplier;
    }


    gameState.needs.cleanliness =
        Math.max(
            0,
            Math.min(
                100,
                gameState.needs.cleanliness
            )
        );


    gameState.needs.environment =
        Math.max(
            0,
            Math.min(
                100,
                gameState.needs.environment
            )
        );


    saveGameState();

    updateNeeds();

    updateMood();
}


// =========================
// NEED ACTIONS
// =========================

function performNeedAction(action) {

    updateNeedsFromTime();


    Object.entries(
        action.effects
    ).forEach(
        ([need, amount]) => {

            if (
                gameState.needs[need] ===
                undefined
            ) {

                return;
            }


            gameState.needs[need] +=
                amount;


            gameState.needs[need] =
                Math.max(
                    0,
                    Math.min(
                        100,
                        gameState.needs[need]
                    )
                );
        }
    );


    saveGameState();

    updateNeeds();

    updateMood();

    showNeedActionFeedback(
        action
    );
}


function showNeedActionFeedback(
    action
) {

    const feedback =
        document.createElement("div");

    feedback.className =
        "task-feedback";


    const effects =
        Object.entries(
            action.effects
        )
        .map(
            ([need, amount]) => {

                const formattedNeed =
                    need.charAt(0).toUpperCase() +
                    need.slice(1);

                return (
                    `+${amount} ${formattedNeed}`
                );
            }
        )
        .join(" • ");


    feedback.textContent =
        effects;

    document.body.appendChild(
        feedback
    );


    setTimeout(() => {

        feedback.remove();

    }, 2500);
}


function renderNeedActions(need) {

    const container =
        document.getElementById(`${need}-actions`);

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const actions = needsActions[need];

    if (!actions) {
        return;
    }

const categoryMap = {

    energy: {

        "Rest & Recovery": [
            "Sleep",
            "Take a nap",
            "Rest in bed",
            "Take a shower",
            "Take a bath",
            "Full everything shower"
        ],

        "Gentle Reset": [
            "Meditate",
            "Journal",
            "Sit quietly / do nothing",
            "Go outside",
            "Take a walk",
            "Spend time in nature"
        ],

        "Getting Yourself Together": [
            "Get ready for the day",
            "Do my hair",
            "Do my makeup",
            "Get dressed in a cute outfit"
        ],

        "Spiritual": [
            "Tarot",
            "Read something spiritual",
            "Practice manifestation",
            "Spiritual morning/night routine",
            "Light candles + have a quiet evening"
        ],

        "Quiet Pleasures": [
            "Read for pleasure",
            "Listen to music",
            "Sit with my cat",
            "Cuddle with my cat",
            "Have a slow morning",
            "Take a break from screens",
            "Have a peaceful night in"
        ]

    },

    social: {

    "People": [
        "Spend time with a friend",
        "Hang out with family",
        "Spend time with someone I'm dating",
        "Have a meaningful conversation",
        "Call someone",
        "FaceTime someone",
        "Text someone I care about",
        "Check in on someone"
    ],

    "Going Out": [
        "Go out with friends",
        "Go out to eat with someone",
        "Get coffee with someone",
        "Go shopping with someone",
        "Go to a bar / social place",
        "Go to an event",
        "Go somewhere with someone I've never been before",
        "Have a double date",
        "Have a girls' night"
    ],

    "Low-Key": [
        "Sit and talk with someone",
        "Watch something with someone",
        "Cook with someone",
        "Eat a meal with someone",
        "Run errands with someone",
        "Go for a walk with someone",
        "Play a game with someone",
        "Hang out at someone's home",
        "Invite someone over"
    ],

    "Community": [
        "Meet someone new",
        "Talk to someone new",
        "Go somewhere social by myself",
        "Attend a class / group",
        "Go to a local event",
        "Spend time in a social environment"
    ],

    "Digital": [
        "Text a friend",
        "Send someone a funny video",
        "Respond to messages",
        "Voice message someone",
        "Call someone I haven't talked to recently",
        "Catch up with someone online"
    ]

},

    fun: {

        "Games & Media": [
            "Play a game",
            "Watch a movie",
            "Watch a TV show",
            "Watch YouTube",
            "Scroll TikTok / Lemon8 / Pinterest"
        ],

        "Creative": [
            "Draw",
            "Paint",
            "Write",
            "Work on music / lyrics",
            "Sing",
            "Practice DJing",
            "Crochet",
            "Do my nails",
            "Make a moodboard",
            "Work on fashion / design",
            "Thrift / shop for inspiration"
        ],

        "Reading": [
            "Read for pleasure",
            "Read at a café",
            "Browse Goodreads / choose a new book"
        ],

        "Romanticizing Life": [
            "Get dressed just because",
            "Do my makeup for fun",
            "Take cute photos",
            "Make a playlist",
            "Go get coffee",
            "Go somewhere I've never been",
            "Explore a new place",
            "Have a solo date"
        ],

        "Little Pleasures": [
            "Listen to an album",
            "Dance around my apartment",
            "Light candles and have a cozy night",
            "Play with my cat",
            "Cuddle with my cat",
            "Spend time with my dog",
            "Sit outside",
            "Watch the sunset"
        ]

    }

};

    const categories =
        categoryMap[need];

    // If this need has no categories,
    // use the normal action grid.
    if (!categories) {

        actions.forEach(action => {
            createNeedAction(
                container,
                action
            );
        });

        return;
    }

    Object.entries(categories).forEach(
        ([categoryName, actionNames]) => {

            const categoryActions =
                actions.filter(action =>
                    actionNames.includes(action.name)
                );

            if (categoryActions.length === 0) {
                return;
            }

            const category =
                document.createElement("section");

            category.className =
                "need-action-category";

            category.innerHTML = `
                <div class="need-action-category-heading">
                    <h3>${categoryName}</h3>
                </div>
            `;

            const grid =
                document.createElement("div");

            grid.className =
                "action-grid";

            categoryActions.forEach(action => {
                createNeedAction(
                    grid,
                    action
                );
            });

            category.appendChild(grid);
            container.appendChild(category);
        }
    );
}


function createNeedAction(container, action) {

    const button =
        document.createElement("button");

    button.type = "button";
    button.className = "need-action";

    const effectText =
        Object.entries(action.effects)
            .map(([effect, amount]) => {

                const formattedEffect =
                    effect.charAt(0).toUpperCase() +
                    effect.slice(1);

                return "+" +
                    amount +
                    " " +
                    formattedEffect;
            })
            .join(" • ");

    button.innerHTML = `
        <span class="need-action-name">
            ${action.name}
        </span>

        <span class="need-action-value">
            ${effectText}
        </span>
    `;

    button.addEventListener(
        "click",
        () => performNeedAction(action)
    );

    container.appendChild(button);
}


// =========================
// SAVE GAME STATE
// =========================

function saveGameState() {

    localStorage.setItem(
        "apartmentSimGameState",
        JSON.stringify(gameState)
    );
}


// =========================
// NEED DECAY
// =========================

function updateNeedsFromTime() {

    const now =
        Date.now();


    const elapsedHours =
        (
            now -
            gameState.lastNeedsUpdate
        ) /
        (1000 * 60 * 60);


    if (elapsedHours <= 0) {
        return;
    }


    Object.entries(
        NEED_DECAY_PER_HOUR
    )
    .forEach(
        ([need, decayRate]) => {

            if (
                gameState.needs[need] ===
                undefined
            ) {

                return;
            }


            gameState.needs[need] -=
                decayRate *
                elapsedHours;


            gameState.needs[need] =
                Math.max(
                    0,
                    Math.min(
                        100,
                        gameState.needs[need]
                    )
                );
        }
    );


    gameState.lastNeedsUpdate =
        now;


    saveGameState();
}


// =========================
// RENDER TASKS
// =========================

function renderTasks() {

    const taskList =
        document.getElementById("cleaning-task-list");

    if (!taskList) {
        return;
    }

    taskList.innerHTML = "";

    const todaysTasks =
        getTodaysTasks();

    const rooms = [
        "Bedroom",
        "Living Room",
        "Bathroom",
        "Kitchen"
    ];

    rooms.forEach(room => {

        const roomTasks =
            todaysTasks.filter(
                task => task.category === room
            );

        if (roomTasks.length === 0) {
            return;
        }

        // Room section
        const roomSection =
            document.createElement("section");

        roomSection.className =
            "cleaning-room";

        // Room heading
        const roomHeading =
            document.createElement("div");

        roomHeading.className =
            "cleaning-room-heading";

        roomHeading.innerHTML = `
            <h3>${room}</h3>
            <span>
                ${
                    roomTasks.filter(task =>
                        isCompletedToday(task.id)
                    ).length
                }
                /
                ${roomTasks.length}
            </span>
        `;

        roomSection.appendChild(roomHeading);

        // Tasks
        const roomTaskList =
            document.createElement("div");

        roomTaskList.className =
            "cleaning-room-tasks";

        // Incomplete tasks first
        roomTasks.sort((a, b) => {

            const aCompleted =
                isCompletedToday(a.id);

            const bCompleted =
                isCompletedToday(b.id);

            if (aCompleted === bCompleted) {
                return 0;
            }

            return aCompleted ? 1 : -1;
        });

        roomTasks.forEach(task => {

            const completed =
                isCompletedToday(task.id);

            const taskElement =
                document.createElement("div");

            taskElement.className =
                "task" +
                (completed ? " completed" : "");

            taskElement.innerHTML = `
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${completed ? "checked" : ""}
                >

                <div class="task-info">

                    <div class="task-name">
                        ${task.name}
                    </div>

                    <div class="task-category">
                        ${task.recurrence.type === "daily"
                            ? "Daily"
                            : task.recurrence.type === "weekly"
                            ? "Weekly"
                            : `Every ${task.recurrence.days} days`
                        }
                    </div>

                </div>

                <div class="task-xp">
                    +${task.xp} XP
                </div>
            `;

            const checkbox =
                taskElement.querySelector(
                    ".task-checkbox"
                );

            checkbox.addEventListener(
                "change",
                () => completeTask(task.id)
            );

            roomTaskList.appendChild(taskElement);

        });

        roomSection.appendChild(roomTaskList);

        taskList.appendChild(roomSection);

    });

    updateTaskProgress();
}

// =========================
// TASK PROGRESS
// =========================

function updateTaskProgress() {

    const todaysTasks =
        getTodaysTasks();


    const completed =
        todaysTasks.filter(
            task =>
                isCompletedToday(
                    task.id
                )
        ).length;


    document.getElementById(
        "task-progress"
    ).textContent =
        `${completed} / ${todaysTasks.length} complete`;
}


// =========================
// XP SYSTEM
// =========================

function addXP(amount) {

    gameState.xp += amount;


    while (
        gameState.xp >= 100
    ) {

        gameState.xp -= 100;

        gameState.level++;
    }


    updateXPDisplay();

    saveGameState();
}


function updateXPDisplay() {

    document.getElementById(
        "level"
    ).textContent =
        gameState.level;


    document.getElementById(
        "xp-text"
    ).textContent =
        `${gameState.xp} / 100 XP`;


    document.getElementById(
        "xp-fill"
    ).style.width =
        `${gameState.xp}%`;
}


// =========================
// NEEDS
// =========================

function updateNeeds() {

    Object.entries(gameState.needs)
        .forEach(([need, value]) => {

            const bar =
                document.getElementById(
                    `${need}-bar`
                );

            const valueDisplay =
                document.getElementById(
                    `${need}-value`
                );

            if (bar && valueDisplay) {

                bar.style.width =
                    `${value}%`;

                valueDisplay.textContent =
                    Math.round(value) + "%";
            }


            const popupBar =
                document.getElementById(
                    `popup-${need}-bar`
                );

            const popupValue =
                document.getElementById(
                    `popup-${need}-value`
                );

            if (popupBar) {

                popupBar.style.width =
                    `${value}%`;
            }

            if (popupValue) {

                popupValue.textContent =
                    Math.round(value) + "%";
            }

        });
}

const needsPopup =
    document.getElementById("needs-popup");

const needsPopupToggle =
    document.getElementById("needs-popup-toggle");

const needsPopupOpen =
    document.getElementById("needs-popup-open");


needsPopupToggle.addEventListener(
    "click",
    () => {

        needsPopup.style.display = "none";
        needsPopupOpen.style.display = "block";

    }
);


needsPopupOpen.addEventListener(
    "click",
    () => {

        needsPopup.style.display = "block";
        needsPopupOpen.style.display = "none";

    }
);



// =========================
// MOOD
// =========================

function updateMood() {

    const values =
        Object.values(
            gameState.needs
        );


    const average =
        values.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        values.length;


    let mood;


    if (average >= 80) {

        mood =
            "Feeling Great";

    } else if (average >= 65) {

        mood =
            "Feeling Good";

    } else if (average >= 45) {

        mood =
            "Feeling Neutral";

    } else if (average >= 25) {

        mood =
            "Feeling Uncomfortable";

    } else {

        mood =
            "Feeling Miserable";
    }


    const moodElement =
        document.getElementById(
            "mood"
        );


    if (moodElement) {

        moodElement.textContent =
            mood;
    }

    const popupMood =
    document.getElementById("popup-mood");

if (popupMood) {
    popupMood.textContent = mood;
}
}


// =========================
// DATE DISPLAY
// =========================

function displayDate() {

    const today =
        parseDate(
            getToday()
        );


    const formattedDate =
        today.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );


    const dateElement =
        document.getElementById(
            "current-date"
        );


    if (dateElement) {

        dateElement.textContent =
            formattedDate;
    }
}


// =========================
// INITIALIZE
// =========================

updateNeedsFromTime();

displayDate();

renderTasks();

updateXPDisplay();

updateNeeds();

updateMood();


// Bars update while app is open

setInterval(() => {

    updateNeedsFromTime();

    updateNeeds();

}, 60000);


renderNeedActions("hunger");

renderNeedActions("energy");

renderNeedActions("fun");

renderNeedActions("social");

// =========================
// PAGE NAVIGATION
// =========================

function showPage(pageName) {

    const pages =
        document.querySelectorAll(".page");

    const navButtons =
        document.querySelectorAll(".nav-button");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    navButtons.forEach(button => {
        button.classList.remove("active");
    });

    const selectedPage =
        document.getElementById(`page-${pageName}`);

    const selectedButton =
        document.querySelector(
            `.nav-button[data-page="${pageName}"]`
        );

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    if (selectedButton) {
        selectedButton.classList.add("active");
    }
}


document
    .querySelectorAll(".nav-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const pageName =
                button.dataset.page;

            showPage(pageName);

        });

    });

    // =========================
// MOVABLE NEEDS PANEL
// =========================

const needsPanel =
    document.getElementById("needs-popup");

const needsPanelHeader =
    document.querySelector(".needs-popup-header");

let isDraggingNeeds = false;
let needsOffsetX = 0;
let needsOffsetY = 0;

needsPanelHeader.addEventListener(
    "pointerdown",
    event => {

        // Don't start dragging when clicking the close button
        if (
            event.target.closest(
                ".needs-popup-toggle"
            )
        ) {
            return;
        }

        const rect =
            needsPanel.getBoundingClientRect();

        isDraggingNeeds = true;

        needsOffsetX =
            event.clientX - rect.left;

        needsOffsetY =
            event.clientY - rect.top;

        needsPanelHeader.setPointerCapture(
            event.pointerId
        );

        needsPanelHeader.style.cursor =
            "grabbing";
    }
);


needsPanelHeader.addEventListener(
    "pointermove",
    event => {

        if (!isDraggingNeeds) {
            return;
        }

        let left =
            event.clientX - needsOffsetX;

        let top =
            event.clientY - needsOffsetY;

        const maxLeft =
            window.innerWidth -
            needsPanel.offsetWidth;

        const maxTop =
            window.innerHeight -
            needsPanel.offsetHeight;

        left =
            Math.max(
                0,
                Math.min(left, maxLeft)
            );

        top =
            Math.max(
                0,
                Math.min(top, maxTop)
            );

        needsPanel.style.left =
            `${left}px`;

        needsPanel.style.top =
            `${top}px`;

        needsPanel.style.right =
            "auto";

        needsPanel.style.bottom =
            "auto";
    }
);


needsPanelHeader.addEventListener(
    "pointerup",
    event => {

        isDraggingNeeds = false;

        needsPanelHeader.style.cursor =
            "grab";

        needsPanelHeader.releasePointerCapture(
            event.pointerId
        );
    }
);


needsPanelHeader.addEventListener(
    "pointercancel",
    () => {

        isDraggingNeeds = false;

        needsPanelHeader.style.cursor =
            "grab";
    }
);

updateNeedsFromTime();

displayDate();

renderTasks();

updateXPDisplay();

updateNeeds();

updateMood();

setInterval(() => {
    updateNeedsFromTime();
    updateNeeds();
}, 60000);

renderNeedActions("hunger");
renderNeedActions("energy");
renderNeedActions("fun");
renderNeedActions("social");

needsPopupOpen.addEventListener("click", () => {
    needsPopup.classList.remove("needs-popup-hidden");
});

needsPopupToggle.addEventListener("click", () => {
    needsPopup.classList.add("needs-popup-hidden");
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => {
                console.log("Apartment Sim service worker registered.");
            })
            .catch(error => {
                console.error("Service worker registration failed:", error);
            });
    });
}