import { animateChange } from "./animate_change.js";
import { loadScores, saveScores } from "./local_storage_scores.js";
import { closeNotification, showNotification } from "./notification/notification.js";
import { difficultyType } from "./difficulty.js";

/**
 * @param scores {ScoreType[]}
 * @param localeMan {LocaleManager}
 */
function renderScores (scores, localeMan) {
    const table = document.getElementById("score_table");
    // clear all
    while (table.children.length > 1) {
        table.removeChild(table.lastChild);
    }

    if (scores.length === 0) {
        const nothingTr = document.createElement("tr");
        const nothing = document.createElement("td");
        nothingTr.appendChild(nothing);
        nothing.classList.add("nothing_to_show");
        nothing.colSpan = 3;
        localeMan.bindObjectProperty(nothing, "textContent", "locale.showScores.nothing");
        table.appendChild(nothingTr);
    } else {
        scores.sort((a, b) => b.score - a.score);
        for (const score of scores) {
            const scoreRow = document.createElement("tr");
            const name = document.createElement("td");
            name.textContent = score.name;
            const scoreTd = document.createElement("td");
            scoreTd.textContent = score.score.toString();
            const date = document.createElement("td");
            date.textContent = score.date;
            scoreRow.appendChild(name);
            scoreRow.appendChild(scoreTd);
            scoreRow.appendChild(date);
            table.appendChild(scoreRow);
        }
    }
}

/**
 * @param localeMan {LocaleManager}
 */
export function displayScores (localeMan) {
    animateChange(
        document.getElementById("main_menu"),
        document.getElementById("scores_display")
    ).then();

    const scores = loadScores();
    renderScores(scores, localeMan);


    document.getElementById("easy_scores").onclick = () => renderScores(scores.filter(s => s.difficulty === difficultyType.easy), localeMan);
    document.getElementById("medium_scores").onclick = () => renderScores(scores.filter(s => s.difficulty === difficultyType.medium), localeMan);
    document.getElementById("hard_scores").onclick = () => renderScores(scores.filter(s => s.difficulty === difficultyType.hard), localeMan);
    document.getElementById("extreme_scores").onclick = () => renderScores(scores.filter(s => s.difficulty === difficultyType.extreme), localeMan);

    document.getElementById("clear_scores").onclick = () => {
        showNotification(
            localeMan.getLocaleString("locale.showScores.clear.prompt.title"),
            [
                {
                    type: "text",
                    textContent: localeMan.getLocaleString("locale.showScores.clear.prompt.question")
                },
                {
                    type: "button",
                    textContent: localeMan.getLocaleString("locale.yes"),
                    onClick: n => {
                        saveScores([]);
                        closeNotification(n.id);
                        animateChange(
                            document.getElementById("scores_display"),
                            document.getElementById("main_menu")
                        ).then();
                    }
                },
                {
                    type: "button",
                    textContent: localeMan.getLocaleString("locale.no"),
                    onClick: n => {
                        closeNotification(n.id);
                    }
                }
            ]
        );
    };

    document.getElementById("back_to_main").onclick = () => {
        animateChange(
            document.getElementById("scores_display"),
            document.getElementById("main_menu")
        ).then();
    };
}