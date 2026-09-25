// =========================
// GAME STATE
// =========================

let savedGameState = null;

try {
    savedGameState = JSON.parse(
        localStorage.getItem("apartmentSimGameState")
    );
} catch (error) {
    console.warn("Could not load saved game state.", error);
}

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
// DOM ELEMENTS
// =========================

const needsPopup =
    document.getElementById("needs-popup");

const needsPopupOpen =
    document.getElementById("needs-popup-open");

const needsPopupToggle =
    document.getElementById("needs-popup-toggle");


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
// ACTION CATEGORIES
// =========================

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


// =========================
// DATE UTILITIES
// =========================

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function parseDate(dateString) {

    const [year, month, day] =
        dateString.split("-").map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}


function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function daysBetween(startDate, endDate) {

    const start =
        parseDate(startDate);

    const end =
        parseDate(endDate);

    const difference =
        end.getTime() -
        start.getTime();

    return Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
    );
}


function getPreviousDate(dateString) {

    const date =
        parseDate(dateString);

    date.setDate(
        date.getDate() - 1
    );

    return formatDate(date);
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
// TASK SCHEDULE
// =========================

function getTaskDueDate(task) {

    const recurrence =
        task.recurrence;

    const recurrenceState =
        getRecurrenceState();

    const lastCompleted =
        recurrenceState[task.id];

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

    if (recurrence.type === "daily") {
        return START_DATE;
    }

    if (recurrence.type === "weekly") {
        return START_DATE;
    }

    if (recurrence.type === "interval") {
        return START_DATE;
    }

    return null;
}


function isTaskDue(task, dateString) {

    const recurrence =
        task.recurrence;

    const recurrenceState =
        getRecurrenceState();

    const lastCompleted =
        recurrenceState[task.id];

    if (lastCompleted) {

        const daysSinceCompletion =
            daysBetween(
                lastCompleted,
                dateString
            );

        if (recurrence.type === "daily") {
            return daysSinceCompletion >= 1;
        }

        if (recurrence.type === "weekly") {
            return daysSinceCompletion >= 7;
        }

        if (recurrence.type === "interval") {
            return (
                daysSinceCompletion >=
                recurrence.days
            );
        }

        return false;
    }

    const daysSinceStart =
        daysBetween(
            START_DATE,
            dateString
        );

    if (daysSinceStart < 0) {
        return false;
    }

    if (recurrence.type === "daily") {
        return true;
    }

    if (recurrence.type === "weekly") {

        const date =
            parseDate(dateString);

        return date.getDay() === 3;
    }

    if (recurrence.type === "interval") {

        return (
            daysSinceStart %
            recurrence.days === 0
        );
    }

    return false;
}


// =========================
// COMPLETION CHECKS
// =========================

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

    return isCompletedOnDate(
        taskId,
        getToday()
    );
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
// SAVE GAME STATE
// =========================

function saveGameState() {

    localStorage.setItem(
        "apartmentSimGameState",
        JSON.stringify(gameState)
    );
}

// =========================
// ACHIEVEMENTS
// =========================

const achievementDefinitions = [

    {
        id: "first-steps",
        name: "First Steps",
        description: "Complete your first task.",
        requirement: () => getTotalCompletedTasks() >= 1
    },

    {
        id: "clean-girl-era",
        name: "Clean Girl Era",
        description: "Complete 25 cleaning tasks.",
        requirement: () => getTotalCompletedTasks() >= 25
    },

    {
        id: "domestic-goddess",
        name: "Domestic Goddess",
        description: "Complete 100 cleaning tasks.",
        requirement: () => getTotalCompletedTasks() >= 100
    },

    {
        id: "getting-her-life-together",
        name: "Getting Her Life Together",
        description: "Reach Level 5.",
        requirement: () => gameState.level >= 5
    },

    {
        id: "well-rounded",
        name: "Well Rounded",
        description: "Get all six needs above 75%.",
        requirement: () =>
            Object.values(gameState.needs)
                .every(value => value >= 75)
    },

    {
        id: "feeling-great",
        name: "Feeling Great",
        description: "Reach the Feeling Great mood.",
        requirement: () =>
            getCurrentMood().name === "Feeling Great"
    },

    {
        id: "homebody",
        name: "Homebody",
        description: "Complete every task due today.",
        requirement: () => {

            const tasks =
                getTodaysTasks();

            return (
                tasks.length > 0 &&
                tasks.every(task =>
                    isCompletedToday(task.id)
                )
            );
        }
    },

    {
        id: "good-habits",
        name: "Good Habits",
        description: "Complete 7 daily cleaning tasks.",
        requirement: () =>
            getTotalDailyTaskCompletions() >= 7
    },

    {
        id: "self-care",
        name: "Self Care",
        description: "Perform 10 need actions.",
        requirement: () =>
            getNeedActionCount() >= 10
    },

    {
        id: "little-bit-of-everything",
        name: "A Little Bit of Everything",
        description: "Use an action from every need category.",
        requirement: () =>
            hasUsedEveryNeedCategory()
    }

];


// =========================
// ACHIEVEMENT STORAGE
// =========================

function getAchievementState() {

    const saved =
        localStorage.getItem(
            "apartmentSimAchievements"
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


function saveAchievementState(state) {

    localStorage.setItem(
        "apartmentSimAchievements",
        JSON.stringify(state)
    );
}


// =========================
// ACHIEVEMENT TRACKING
// =========================

function getTotalCompletedTasks() {

    const completions =
        getCompletedTasks();

    return Object.values(completions)
        .reduce(
            (total, tasks) =>
                total + tasks.length,
            0
        );
}


function getTotalDailyTaskCompletions() {

    const completions =
        getCompletedTasks();

    let count = 0;

    Object.entries(completions)
        .forEach(
            ([date, taskIds]) => {

                taskIds.forEach(taskId => {

                    const task =
                        taskDefinitions.find(
                            task =>
                                task.id === taskId
                        );

                    if (
                        task &&
                        task.recurrence.type ===
                        "daily"
                    ) {
                        count++;
                    }
                });
            }
        );

    return count;
}


function getNeedActionCount() {

    return Number(
        localStorage.getItem(
            "apartmentSimNeedActionCount"
        )
    ) || 0;
}


function hasUsedEveryNeedCategory() {

    const usedCategories =
        JSON.parse(
            localStorage.getItem(
                "apartmentSimUsedNeedCategories"
            ) || "[]"
        );

    return [
        "hunger",
        "energy",
        "fun",
        "social"
    ].every(
        need =>
            usedCategories.includes(need)
    );
}


function checkAchievements() {

    const achievementState =
        getAchievementState();

    let unlockedSomething = false;

    achievementDefinitions.forEach(
        achievement => {

            if (
                achievementState[
                    achievement.id
                ]
            ) {
                return;
            }

            if (
                achievement.requirement()
            ) {

                achievementState[
                    achievement.id
                ] = {
                    unlockedAt:
                        new Date().toISOString()
                };

                unlockedSomething = true;

                showAchievementFeedback(
                    achievement
                );
            }
        }
    );

    if (unlockedSomething) {

        saveAchievementState(
            achievementState
        );
    }

    renderAchievements();
}


function showAchievementFeedback(
    achievement
) {

    const feedback =
        document.createElement("div");

    feedback.className =
        "task-feedback achievement-feedback";

    feedback.textContent =
        `✦ Achievement Unlocked: ${achievement.name}`;

    document.body.appendChild(
        feedback
    );

    setTimeout(() => {

        feedback.remove();

    }, 3500);
}

function getAchievementProgress(achievement) {
    const id = achievement.id;

    switch (id) {
        case "first-steps":
            return {
                current: Math.min(getTotalCompletedTasks(), 1),
                target: 1
            };

        case "clean-girl-era":
            return {
                current: Math.min(getTotalCompletedTasks(), 25),
                target: 25
            };

        case "domestic-goddess":
            return {
                current: Math.min(getTotalCompletedTasks(), 100),
                target: 100
            };

        case "getting-her-life-together":
            return {
                current: Math.min(gameState.level, 5),
                target: 5
            };

        case "well-rounded": {
            const count = Object.values(gameState.needs)
                .filter(value => value >= 75)
                .length;

            return {
                current: count,
                target: 6
            };
        }

        case "self-care":
            return {
                current: Math.min(getNeedActionCount(), 10),
                target: 10
            };

        default:
            return null;
    }

}


function renderAchievements() {

    const container =
        document.getElementById("achievements-list");

    const countDisplay =
        document.getElementById(
            "achievements-unlocked-count"
        );

    if (!container) {
        return;
    }

    const achievementState =
        getAchievementState();

    const unlockedCount =
        achievementDefinitions.filter(
            achievement =>
                achievementState[achievement.id]
        ).length;

    if (countDisplay) {
        countDisplay.textContent =
            `${unlockedCount} / ${achievementDefinitions.length} Unlocked`;
    }

    container.innerHTML = "";

    achievementDefinitions.forEach(
        achievement => {

            const isUnlocked =
                Boolean(
                    achievementState[
                        achievement.id
                    ]
                );

            const card =
                document.createElement("div");

            card.className =
                `achievement-card ${
                    isUnlocked
                        ? "achievement-unlocked"
                        : "achievement-locked"
                }`;

            const progress =
                getAchievementProgress(
                    achievement
                );

            let progressHTML = "";

            if (progress) {

                const percentage =
                    Math.min(
                        (
                            progress.current /
                            progress.target
                        ) * 100,
                        100
                    );

                progressHTML = `
                    <div class="achievement-progress">

                        <div class="achievement-progress-bar">
                            <div
                                class="achievement-progress-fill"
                                style="width: ${percentage}%"
                            ></div>
                        </div>

                        <span>
                            ${progress.current} / ${progress.target}
                        </span>

                    </div>
                `;
            }

            card.innerHTML = `

                <div class="achievement-icon">
                    ${
                        isUnlocked
                            ? "✧"
                            : "◇"
                    }
                </div>

                <div class="achievement-info">

                    <h3>
                        ${achievement.name}
                    </h3>

                    <p>
                        ${achievement.description}
                    </p>

                    ${progressHTML}

                    <span class="achievement-status">
                        ${
                            isUnlocked
                                ? "✓ Unlocked"
                                : "Locked"
                        }
                    </span>

                </div>

            `;

            container.appendChild(card);
        }
    );
}

// =========================
// XP SYSTEM
// =========================

function addXP(amount) {

    gameState.xp += amount;

    while (gameState.xp >= 100) {

        gameState.xp -= 100;
        gameState.level++;
    }

    updateXPDisplay();
    saveGameState();
    checkAchievements();
}


function removeXP(amount) {

    gameState.xp -= amount;

    while (
        gameState.xp < 0 &&
        gameState.level > 1
    ) {

        gameState.level--;
        gameState.xp += 100;
    }

    if (
        gameState.level === 1 &&
        gameState.xp < 0
    ) {
        gameState.xp = 0;
    }

    updateXPDisplay();
    saveGameState();
}


function updateXPDisplay() {

    const level =
        document.getElementById("level");

    const xpText =
        document.getElementById("xp-text");

    const xpFill =
        document.getElementById("xp-fill");

    if (level) {
        level.textContent =
            gameState.level;
    }

    if (xpText) {
        xpText.textContent =
            `${gameState.xp} / 100 XP`;
    }

    if (xpFill) {
        xpFill.style.width =
            `${gameState.xp}%`;
    }
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
    ).forEach(
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
// NEED STATES
// =========================

function getNeedState(need, value) {

    if (value >= 80) {

        const highStates = {
            cleanliness: "Spotless",
            hunger: "Well Fed",
            energy: "Rested",
            fun: "Entertained",
            social: "Connected",
            environment: "Peaceful"
        };

        return highStates[need];
    }

    if (value >= 60) {

        const goodStates = {
            cleanliness: "Clean",
            hunger: "Satisfied",
            energy: "Energized",
            fun: "Having Fun",
            social: "Socially Fulfilled",
            environment: "Comfortable"
        };

        return goodStates[need];
    }

    if (value >= 40) {

        const neutralStates = {
            cleanliness: "Okay",
            hunger: "Peckish",
            energy: "Okay",
            fun: "Amused",
            social: "Connected Enough",
            environment: "Fine"
        };

        return neutralStates[need];
    }

    if (value >= 20) {

        const lowStates = {
            cleanliness: "Grimy",
            hunger: "Hungry",
            energy: "Tired",
            fun: "Bored",
            social: "Lonely",
            environment: "Uncomfortable"
        };

        return lowStates[need];
    }

    const criticalStates = {
        cleanliness: "Filthy",
        hunger: "Starving",
        energy: "Exhausted",
        fun: "Miserable",
        social: "Desperate for Company",
        environment: "Distressed"
    };

    return criticalStates[need];
}


// =========================
// NEED DISPLAY
// =========================

function updateNeeds() {

    Object.entries(
        gameState.needs
    ).forEach(
        ([need, value]) => {

            const bar =
                document.getElementById(
                    `${need}-bar`
                );

            const valueDisplay =
                document.getElementById(
                    `${need}-value`
                );

            const stateDisplay =
                document.getElementById(
                    `${need}-state`
                );

            if (bar) {
                bar.style.width =
                    `${value}%`;
            }

            if (valueDisplay) {
                valueDisplay.textContent =
                    Math.round(value) + "%";
            }

            if (stateDisplay) {
                stateDisplay.textContent =
                    getNeedState(
                        need,
                        value
                    );
            }

            // Popup values

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
        }
    );
}


// =========================
// CHANGE NEEDS
// =========================

function changeNeeds(
    changes,
    multiplier
) {

    if (!changes) {
        return;
    }

    Object.entries(changes)
        .forEach(
            ([need, amount]) => {

                if (
                    gameState.needs[need] ===
                    undefined
                ) {
                    return;
                }

                gameState.needs[need] +=
                    amount *
                    multiplier;

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

    checkAchievements();
}


// =========================
// TASK FEEDBACK
// =========================

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


// =========================
// NEED ACTIONS
// =========================

function performNeedAction(action) {

    updateNeedsFromTime();

        const actionCount =
        getNeedActionCount() + 1;

    localStorage.setItem(
        "apartmentSimNeedActionCount",
        actionCount
    );

    const usedCategories =
        JSON.parse(
            localStorage.getItem(
                "apartmentSimUsedNeedCategories"
            ) || "[]"
        );

    const actionCategory =
        Object.keys(needsActions)
            .find(category =>
                needsActions[category]
                    .includes(action)
            );

    if (
        actionCategory &&
        !usedCategories.includes(actionCategory)
    ) {

        usedCategories.push(
            actionCategory
        );

        localStorage.setItem(
            "apartmentSimUsedNeedCategories",
            JSON.stringify(
                usedCategories
            )
        );
    }

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

    checkAchievements();
}


function showNeedActionFeedback(action) {

    const feedback =
        document.createElement("div");

    feedback.className =
        "task-feedback";

    const effects =
        Object.entries(action.effects)
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


// =========================
// RENDER NEED ACTIONS
// =========================

function renderNeedActions(need) {

    const container =
        document.getElementById(
            `${need}-actions`
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const actions =
        needsActions[need];

    if (!actions) {
        return;
    }

    const categories =
        categoryMap[need];

    if (!categories) {

        actions.forEach(action => {
            createNeedAction(
                container,
                action
            );
        });

        return;
    }

    Object.entries(categories)
        .forEach(
            ([categoryName, actionNames]) => {

                const categoryActions =
                    actions.filter(
                        action =>
                            actionNames.includes(
                                action.name
                            )
                    );

                if (
                    categoryActions.length === 0
                ) {
                    return;
                }

                const category =
                    document.createElement(
                        "section"
                    );

                category.className =
                    "need-action-category";

                category.innerHTML = `
                    <div class="need-action-category-heading">
                        <h3>${categoryName}</h3>
                    </div>
                `;

                const grid =
                    document.createElement(
                        "div"
                    );

                grid.className =
                    "action-grid";

                categoryActions.forEach(
                    action => {

                        createNeedAction(
                            grid,
                            action
                        );
                    }
                );

                category.appendChild(
                    grid
                );

                container.appendChild(
                    category
                );
            }
        );
}


function createNeedAction(
    container,
    action
) {

    const button =
        document.createElement(
            "button"
        );

    button.type = "button";

    button.className =
        "need-action";

    const effectText =
        Object.entries(action.effects)
            .map(
                ([effect, amount]) => {

                    const formattedEffect =
                        effect.charAt(0).toUpperCase() +
                        effect.slice(1);

                    return (
                        "+" +
                        amount +
                        " " +
                        formattedEffect
                    );
                }
            )
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

    container.appendChild(
        button
    );
}


// =========================
// RENDER TASKS
// =========================

function renderTasks() {

    const taskList =
        document.getElementById(
            "cleaning-task-list"
        );

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
                task =>
                    task.category === room
            );

        if (roomTasks.length === 0) {
            return;
        }

        const roomSection =
            document.createElement(
                "section"
            );

        roomSection.className =
            "cleaning-room";

        const roomHeading =
            document.createElement(
                "div"
            );

        roomHeading.className =
            "cleaning-room-heading";

        const completedCount =
            roomTasks.filter(
                task =>
                    isCompletedToday(
                        task.id
                    )
            ).length;

        roomHeading.innerHTML = `
            <h3>${room}</h3>
            <span>
                ${completedCount} / ${roomTasks.length}
            </span>
        `;

        roomSection.appendChild(
            roomHeading
        );

        const roomTaskList =
            document.createElement(
                "div"
            );

        roomTaskList.className =
            "cleaning-room-tasks";

        roomTasks.sort((a, b) => {

            const aCompleted =
                isCompletedToday(a.id);

            const bCompleted =
                isCompletedToday(b.id);

            if (
                aCompleted ===
                bCompleted
            ) {
                return 0;
            }

            return aCompleted ? 1 : -1;
        });

        roomTasks.forEach(task => {

            const completed =
                isCompletedToday(
                    task.id
                );

            const taskElement =
                document.createElement(
                    "div"
                );

            taskElement.className =
                "task" +
                (
                    completed
                        ? " completed"
                        : ""
                );

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
                        ${
                            task.recurrence.type === "daily"
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

            if (checkbox) {

                checkbox.addEventListener(
                    "change",
                    () => completeTask(
                        task.id
                    )
                );
            }

            roomTaskList.appendChild(
                taskElement
            );
        });

        roomSection.appendChild(
            roomTaskList
        );

        taskList.appendChild(
            roomSection
        );
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

    const progress =
        document.getElementById(
            "task-progress"
        );

    if (progress) {

        progress.textContent =
            `${completed} / ${todaysTasks.length} complete`;
    }
}


// =========================
// MOOD
// =========================

function getCurrentMood() {

    const needs =
        gameState.needs;

    if (needs.energy < 20) {

        return {
            name: "Exhausted",
            description:
                "You really need some rest."
        };
    }

    if (needs.hunger < 20) {

        return {
            name: "Starving",
            description:
                "Your body is asking to be fed."
        };
    }

    if (needs.cleanliness < 20) {

        return {
            name: "Grimy",
            description:
                "A shower or some cleaning would help."
        };
    }

    if (needs.social < 20) {

        return {
            name: "Lonely",
            description:
                "You could use some connection."
        };
    }

    if (needs.fun < 20) {

        return {
            name: "Bored",
            description:
                "You need something enjoyable to do."
        };
    }

    if (needs.environment < 20) {

        return {
            name: "Uncomfortable",
            description:
                "Your surroundings are bringing you down."
        };
    }

    if (
        needs.energy >= 75 &&
        needs.environment >= 75
    ) {

        return {
            name: "Cozy",
            description:
                "You feel rested and at home in your space."
        };
    }

    if (
        needs.fun >= 75 &&
        needs.social >= 75
    ) {

        return {
            name: "Social Butterfly",
            description:
                "You're feeling connected and entertained."
        };
    }

    if (
        needs.cleanliness >= 75 &&
        needs.environment >= 75
    ) {

        return {
            name: "Fresh & Put Together",
            description:
                "Everything feels clean, fresh, and in order."
        };
    }

    if (
        needs.energy >= 75 &&
        needs.fun >= 75
    ) {

        return {
            name: "Inspired",
            description:
                "You have the energy to actually enjoy yourself."
        };
    }

    const values =
        Object.values(needs);

    const average =
        values.reduce(
            (sum, value) =>
                sum + value,
            0
        ) / values.length;

    if (average >= 80) {

        return {
            name: "Feeling Great",
            description:
                "All your needs are being taken care of."
        };
    }

    if (average >= 65) {

        return {
            name: "Feeling Good",
            description:
                "Things are feeling pretty balanced."
        };
    }

    if (average >= 45) {

        return {
            name: "Feeling Neutral",
            description:
                "You're doing okay, but there's room for improvement."
        };
    }

    if (average >= 25) {

        return {
            name: "Feeling Uncomfortable",
            description:
                "A few needs are starting to pile up."
        };
    }

    return {
        name: "Miserable",
        description:
            "Several needs are seriously neglected."
    };
}


function updateMood() {

    const mood =
        getCurrentMood();

    const moodDisplay =
        document.getElementById(
            "mood"
        );

    if (moodDisplay) {
        moodDisplay.textContent =
            mood.name;
    }

    const popupMood =
        document.getElementById(
            "popup-mood"
        );

    if (popupMood) {
        popupMood.textContent =
            mood.name;
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
// PAGE NAVIGATION
// =========================

function showPage(pageName) {

    const pages =
        document.querySelectorAll(
            ".page"
        );

    const navButtons =
        document.querySelectorAll(
            ".nav-button"
        );

    pages.forEach(page => {

        page.classList.remove(
            "active"
        );
    });

    navButtons.forEach(button => {

        button.classList.remove(
            "active"
        );
    });

    const selectedPage =
        document.getElementById(
            `page-${pageName}`
        );

    const selectedButton =
        document.querySelector(
            `.nav-button[data-page="${pageName}"]`
        );

    if (selectedPage) {

        selectedPage.classList.add(
            "active"
        );
    }

    if (selectedButton) {

        selectedButton.classList.add(
            "active"
        );
    }
}


function setupNavigation() {

    document
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const pageName =
                        button.dataset.page;

                    showPage(pageName);
                }
            );
        });
}


// =========================
// NEEDS POPUP
// =========================

function setupNeedsPopup() {

    if (
        !needsPopup ||
        !needsPopupOpen ||
        !needsPopupToggle
    ) {
        console.warn(
            "Needs popup elements were not found."
        );

        return;
    }

    needsPopupOpen.addEventListener(
        "click",
        () => {

            needsPopup.classList.remove(
                "needs-popup-hidden"
            );
        }
    );

    needsPopupToggle.addEventListener(
        "click",
        () => {

            needsPopup.classList.add(
                "needs-popup-hidden"
            );
        }
    );
}


// =========================
// MOVABLE NEEDS PANEL
// =========================

function setupNeedsDragging() {

    if (!needsPopup) {
        return;
    }

    const needsPanelHeader =
        document.querySelector(
            ".needs-popup-header"
        );

    if (!needsPanelHeader) {
        return;
    }

    let isDraggingNeeds = false;

    let needsOffsetX = 0;
    let needsOffsetY = 0;

    needsPanelHeader.addEventListener(
        "pointerdown",
        event => {

            if (
                event.target.closest(
                    ".needs-popup-toggle"
                )
            ) {
                return;
            }

            const rect =
                needsPopup.getBoundingClientRect();

            isDraggingNeeds = true;

            needsOffsetX =
                event.clientX -
                rect.left;

            needsOffsetY =
                event.clientY -
                rect.top;

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
                event.clientX -
                needsOffsetX;

            let top =
                event.clientY -
                needsOffsetY;

            const maxLeft =
                window.innerWidth -
                needsPopup.offsetWidth;

            const maxTop =
                window.innerHeight -
                needsPopup.offsetHeight;

            left =
                Math.max(
                    0,
                    Math.min(
                        left,
                        maxLeft
                    )
                );

            top =
                Math.max(
                    0,
                    Math.min(
                        top,
                        maxTop
                    )
                );

            needsPopup.style.left =
                `${left}px`;

            needsPopup.style.top =
                `${top}px`;

            needsPopup.style.right =
                "auto";

            needsPopup.style.bottom =
                "auto";
        }
    );

    needsPanelHeader.addEventListener(
        "pointerup",
        event => {

            isDraggingNeeds = false;

            needsPanelHeader.style.cursor =
                "grab";

            if (
                needsPanelHeader.hasPointerCapture(
                    event.pointerId
                )
            ) {

                needsPanelHeader.releasePointerCapture(
                    event.pointerId
                );
            }
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
}


// =========================
// INITIALIZE APP
// =========================

function initializeApp() {

    updateNeedsFromTime();

    displayDate();

    renderTasks();

    updateXPDisplay();

    updateNeeds();

    updateMood();

    setupNavigation();

    setupNeedsPopup();

    setupNeedsDragging();

    renderNeedActions("hunger");
    renderNeedActions("energy");
    renderNeedActions("fun");
    renderNeedActions("social");

    renderAchievements();

    setInterval(
        () => {

            updateNeedsFromTime();

            updateNeeds();

            updateMood();

        },
        60000
    );
}


// =========================
// SERVICE WORKER
// =========================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(() => {

                    console.log(
                        "Apartment Sim service worker registered."
                    );
                })
                .catch(error => {

                    console.error(
                        "Service worker registration failed:",
                        error
                    );
                });
        }
    );
}


// =========================
// START
// =========================

initializeApp();