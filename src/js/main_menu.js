import { animateChange } from "./animate_change.js";
import { displayScores } from "./display_scores.js";
import { gameStart } from "./game_init.js";
import { difficultyType } from "./difficulty.js";

/**
 * @param localeMan {LocaleManager}
 */
export function setupMainMenu (localeMan) {
    document.getElementById("new_game").onclick = () => {
        animateChange(
            document.getElementById("main_menu"),
            document.getElementById("difficulty_menu")
        ).then();

        document.getElementById("easy").onclick = () => gameStart(difficultyType.easy, localeMan);
        document.getElementById("medium").onclick = () => gameStart(difficultyType.medium, localeMan);
        document.getElementById("hard").onclick = () => gameStart(difficultyType.hard, localeMan);
        document.getElementById("extreme").onclick = () => gameStart(difficultyType.extreme, localeMan);
        document.getElementById("go_back").onclick = () => animateChange(
            document.getElementById("difficulty_menu"),
            document.getElementById("main_menu")
        ).then();
    };
    document.getElementById("show_scores").onclick = displayScores.bind(this, localeMan);
}