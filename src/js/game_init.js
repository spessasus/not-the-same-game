import { animateChange } from "./animate_change.js";
import { isMobile } from "./is_mobile.js";
import { Round } from "./round.js";
import { closeNotification, showNotification } from "./notification/notification.js";
import { difficultyType } from "./difficulty.js";
import { saveScore } from "./save_score.js";

/**
 *
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("game_canvas");
const context = canvas.getContext("2d");
if (isMobile) {
    canvas.classList.add("mobile");
}
const DIMENSIONS_X = 1920;
const DIMENSIONS_Y = 1280;
const GAME_FIELD_X = 15;
const GAME_FIELD_Y = 10;

/**
 * @param difficulty {difficultyType}
 * @param locale {LocaleManager}
 */
export function gameStart (difficulty, locale) {
    animateChange(
        document.getElementById("difficulty_menu"),
        document.getElementById("game")
    ).then();

    // check for mobile
    let width;
    let height;
    let fieldWidth;
    let fieldHeight;
    if (isMobile) {
        // noinspection JSSuspiciousNameCombination
        height = DIMENSIONS_X;
        // noinspection JSSuspiciousNameCombination
        width = DIMENSIONS_Y;
        // noinspection JSSuspiciousNameCombination
        fieldWidth = GAME_FIELD_Y;
        // noinspection JSSuspiciousNameCombination
        fieldHeight = GAME_FIELD_X;
    } else {
        height = DIMENSIONS_Y;
        width = DIMENSIONS_X;
        fieldWidth = GAME_FIELD_X;
        fieldHeight = GAME_FIELD_Y;
    }
    canvas.width = width;
    canvas.height = height;
    console.log(fieldWidth, fieldHeight);
    const r = new Round(fieldWidth, fieldHeight, difficulty, canvas, context);
    r.onvictory = score => {
        const path = "locale.gameOver.";
        const difficultyNameInternal = Object.keys(difficultyType).find(key => difficultyType[key] === difficulty);
        const difficultyNameLocalized = locale.getLocaleString(`locale.difficultySelector.${difficultyNameInternal}`);
        showNotification(
            locale.getLocaleString(path + "title"),
            [
                {
                    type: "text",
                    textContent: locale.getLocaleString(path + "message", [score]),
                },
                {
                    type: "text",
                    textContent: locale.getLocaleString(path + "difficulty", [difficultyNameLocalized]),
                },
                {
                    type: "text",
                    textContent: locale.getLocaleString(path + "question")
                },
                {
                    type: "button",
                    textContent: locale.getLocaleString(path + "yes"),
                    onClick: n => {
                        closeNotification(n.id);
                        saveScore(score, difficulty, locale);
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
            9999999,
            locale,
        )
    }
}