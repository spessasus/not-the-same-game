import { closeNotification, showNotification } from "./notification/notification.js";
import { difficultyType } from "./difficulty.js";
import { animateChange } from "./animate_change.js";
import { loadScores, saveScores } from "./local_storage_scores.js";

/**
 * @param score {number}
 * @param difficulty {difficultyType}
 * @param locale
 */
export function saveScore (score, difficulty, locale) {
    const path = "locale.gameOver.";
    const difficultyNameInternal = Object.keys(difficultyType).find(key => difficultyType[key] === difficulty);
    const difficultyNameLocalized = locale.getLocaleString(`locale.difficultySelector.${difficultyNameInternal}`);
    const date = new Date().toDateString();
    showNotification(
        locale.getLocaleString(path + "save.title"),
        [
            {
                type: "input",
                attributes: { "name-input": "1", type: "text" },
                textContent: locale.getLocaleString(path + "save.name"),
            },
            {
                type: "text",
                textContent: locale.getLocaleString(path + "save.score", [score]),
            },
            {
                type: "text",
                textContent: locale.getLocaleString(path + "difficulty", [difficultyNameLocalized]),
            },
            {
                type: "text",
                textContent: locale.getLocaleString(path + "save.date", [date]),
            },
            {
                type: "button",
                textContent: locale.getLocaleString(path + "yes"),
                onClick: n => {
                    const scores = loadScores();
                    const name = n.div.querySelector("input[name-input]").value;
                    console.log(name)
                    scores.push({
                        name: name,
                        score: score,
                        difficulty: difficulty,
                        date: date,
                    });
                    console.log(scores);
                    saveScores(scores);

                    closeNotification(n.id);
                    animateChange(
                        document.getElementById("game"),
                        document.getElementById("main_menu")
                    ).then();
                }
            },
            {
                type: "button",
                textContent: locale.getLocaleString(path + "cancel"),
                onClick: n => {
                    closeNotification(n.id);
                    animateChange(
                        document.getElementById("game"),
                        document.getElementById("main_menu")
                    ).then();
                }
            }
        ],
        999999
    )
}