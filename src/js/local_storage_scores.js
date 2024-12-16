/**
 * @typedef ScoreType {Object}
 * @property {number} score
 * @property {string} name
 * @property {difficultyType} difficulty
 * @property {string} date
 */

/**
 * @returns {ScoreType[]}
 */
export function loadScores()
{
    /**
     * @type {string}
     */
    const scoresJson = localStorage.getItem("scores_json");
    if (!scoresJson)
    {
        return [];
    }
    return JSON.parse(scoresJson);
}

/**
 * @param scores {ScoreType[]}
 */
export function saveScores(scores)
{
    const scoresJson = JSON.stringify(scores);
    localStorage.setItem("scores_json", scoresJson);
}