import { GameField } from "./game_field.js";
import { niceColors } from "./colors.js";
import { CanvasTransitions } from "./canvas_transitions.js";

const ANIMATION_DURATION = 300;

export class Round {
    /**
     *
     * @type {number}
     */
    currentScore = 0;
    /**
     * Not divided by move count
     * @type {number}
     */
    currentRawScore = 0;
    /**
     *
     * @type {number}
     */
    moveCount = 0;

    /**
     * @type {number}
     */
    currentClickScore = 0;

    /**
     * @type {GameField}
     */
    field;

    /**
     * @type {difficultyType}
     */
    difficulty;

    /**
     * @type {HTMLCanvasElement}
     */
    canv;
    /**
     * @type {CanvasRenderingContext2D}
     */
    ctx;

    /**
     * If true, the player can't interact with the game
     * @type {boolean}
     */
    suspended = false;

    /**
     * @type {function(number)}
     */
    onvictory;

    /**
     *
     * @param fieldWidth {number}
     * @param fieldHeight {number}
     * @param difficulty {difficultyType}
     * @param canv {HTMLCanvasElement}
     * @param ctx {CanvasRenderingContext2D}
     */
    constructor (fieldWidth, fieldHeight, difficulty, canv, ctx) {
        this.field = new GameField(fieldWidth, fieldHeight);
        this.difficulty = difficulty;
        this.ctx = ctx;
        this.canv = canv;
        this.isGame = true;

        this.transitions = new CanvasTransitions();

        // create colors
        const colors = new Set();
        while (colors.size < difficulty) {
            colors.add(niceColors[Math.floor(Math.random() * niceColors.length)]);
        }
        this.field.initialize(Array.from(colors));

        this.scoreDisplay = document.getElementById("game_score");
        this.clickScoreDisplay = document.getElementById("game_click_score");
        this.moveDisplay = document.getElementById("game_moves");
        this.lastHighlightRow = -1;
        this.lastHighlightCol = -1;
        this.updateScore();

        this.tick();
        // wait for the animation to finish
        setTimeout(() => {
            this.canv.onpointermove = this.handlePointerMove.bind(this);
            this.canv.onclick = this.handleClick.bind(this);
        }, 1000);

    }

    tick () {
        if (this.isGame) {
            this.transitions.performTransitions();
            this.field.renderGame(this.canv, this.ctx);
            requestAnimationFrame(this.tick.bind(this));
        }
    }

    /**
     * @param row {number}
     * @param col {number}
     * @returns {number} amount of fields highlighted
     */
    highlightClick (row, col) {
        const list = this.field.getGroupList(row, col);
        this.currentClickScore = list.size > 1 ? ( list.size - 2 ) * ( list.size - 2 ) : 0;
        this.updateScore()
        this.field.clearHighlights();
        list.forEach(item => {
            const data = item.split(" ");
            this.field.highlightField(
                parseInt(data[0]),
                parseInt(data[1]),
            );
        });
        return list.size;
    }

    /**
     * @param e {PointerEvent}
     */
    handlePointerMove (e) {
        if (this.suspended) {
            return;
        }
        const xPos = e.offsetX;
        const yPos = e.offsetY;
        const canvRect = this.canv.getBoundingClientRect();
        const canvWidth = canvRect.width;
        const canvHeight = canvRect.height;
        const row = this.field.getXpos(xPos, canvWidth);
        const col = this.field.getYpos(yPos, canvHeight);
        if (this.field.isEmpty(row, col)) {
            this.currentClickScore = 0;
            this.updateScore();
            this.field.clearHighlights();
            return;
        }
        if (this.lastHighlightRow === row && this.lastHighlightCol === col) {
            return;
        }
        this.highlightClick(row, col);
        this.lastHighlightRow = row;
        this.lastHighlightCol = col;
    }

    calculateScore () {
        const score = this.currentRawScore// / ( this.moveCount / ( this.difficulty - 2 ) );
        this.currentScore = Math.floor(score * 100) / 100;
    }

    /**
     * @param e {PointerEvent}
     */
    handleClick (e) {
        if (this.suspended) {
            return;
        }
        const xPos = e.offsetX;
        const yPos = e.offsetY;
        const canvRect = this.canv.getBoundingClientRect();
        const canvWidth = canvRect.width;
        const canvHeight = canvRect.height;
        const row = this.field.getXpos(xPos, canvWidth);
        const col = this.field.getYpos(yPos, canvHeight);
        this.highlightClick(row, col);
        if (!this.field.click(row, col)) {
            return;
        }
        // The fields have been deleted. Begin transition and lock the game
        this.suspended = true;

        // add score
        this.moveCount += 1;
        this.currentRawScore += this.currentClickScore;
        this.calculateScore();
        this.currentClickScore = 0;
        this.updateScore();

        // clear effects and compute movements
        this.field.clearHighlights();
        const fieldWidth = this.canv.width / this.field.rows;
        const fieldHeight = this.canv.height / this.field.columns;
        // compute changes and offsets
        this.field.clearOffsets();
        this.field.computeColumnsFall(fieldHeight);
        this.field.computeRowsMoving(fieldWidth);

        // animate offsets
        for (let x = 0; x < this.field.rows; x++) {
            for (let y = 0; y < this.field.columns; y++) {
                const field = this.field.getField(x, y);
                if (field.offsetY !== 0) {
                    this.transitions.createTransition(
                        `fall${x}_${y}`,
                        field.offsetY,
                        0,
                        ANIMATION_DURATION,
                        v => field.offsetY = v,
                        undefined,
                        true,
                        false,
                        0,
                        "sin"
                    )
                }
                if (field.offsetX !== 0) {
                    this.transitions.createTransition(
                        `move${x}_${y}`,
                        field.offsetX,
                        0,
                        ANIMATION_DURATION,
                        v => field.offsetX = v,
                        undefined,
                        true,
                        false,
                        0,//ANIMATION_DURATION,
                        "sin"
                    )
                }
            }
        }

        this.suspended = false;
        setTimeout(() => {
            this.suspended = false;
            if (this.field.isGameOver()) {
                console.log("GAME OVER")
                this.suspended = true;
                this.isGame = false;
                this.onvictory(this.currentScore);
            }
        }, ANIMATION_DURATION);
    }

    updateScore () {
        this.scoreDisplay.textContent = this.currentScore.toString();
        this.moveDisplay.textContent = this.moveCount.toString();
        this.clickScoreDisplay.textContent = this.currentClickScore.toString();
    }
}