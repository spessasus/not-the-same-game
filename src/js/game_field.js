import { Field } from "./field.js";
import { calculateRGB } from "./calculate_rgb.js";

const MARGIN = 3;
const INNER_RADIUS_MULTIPLIER = 0.8;

export class GameField {
    /**
     * @type {Field[][]}
     */
    field = [];

    /**
     * @type {number}
     */
    rows;
    /**
     * @type {number}
     */
    columns;

    constructor (x, y) {
        this.rows = x;
        this.columns = y;
        for (let i = 0; i < x; i++) {
            this.field.push([]);
            for (let j = 0; j < y; j++) {
                this.field[i].push(new Field());
            }
        }
    }

    getXpos (xRelative, totalWidth) {
        return Math.floor(( xRelative / totalWidth ) * this.rows);
    }

    getYpos (yRelative, totalHeight) {
        return Math.floor(( yRelative / totalHeight ) * this.columns);
    }

    isEmpty (row, col) {
        return this.field[row][col].isEmpty;
    }

    getField (row, col) {
        return this.field[row][col];
    }

    /**
     * @param colorsArray {string[]}
     */
    initialize (colorsArray) {
        for (let i = 0; i < this.field.length; i++) {
            for (const fieldElement of this.field[i]) {
                const colorID = Math.floor(Math.random() * colorsArray.length)
                fieldElement.setColor(colorsArray[colorID], colorID);
            }
        }
    }

    clearHighlights () {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.field[i][j].bright = false;
            }
        }
    }

    /**
     * @param row {number}
     * @param coll {number}
     */
    highlightField (row, coll) {
        this.field[row][coll].bright = true;
    }

    /**
     * @param row {number}
     * @param col {number}
     * @param matchingFields {Set<string>}
     * @returns {Set<string>}
     */
    getGroupList (row, col, matchingFields = new Set()) {
        if (this.getField(row, col).isEmpty) {
            return matchingFields;
        }
        const color = this.getField(row, col).colorID;
        if (matchingFields.has(`${row} ${col}`)) {
            return matchingFields;
        }
        matchingFields.add(`${row} ${col}`);
        const check = (checkedRow, checkedCol) => {
            if (checkedCol < 0 || checkedCol >= this.columns || checkedRow < 0 || checkedRow >= this.rows) {
                return;
            }
            if (this.field[checkedRow][checkedCol].colorMatches(color)) {
                matchingFields = this.getGroupList(checkedRow, checkedCol, matchingFields);
            }
        }
        check(row - 1, col);
        check(row + 1, col);
        check(row, col - 1);
        check(row, col + 1);

        return matchingFields;
    }

    /**
     * @param row {number}
     * @param col {number}
     * @returns {boolean}
     */
    click (row, col) {
        if (this.isEmpty(row, col)) {
            return false;
        }
        const group = this.getGroupList(row, col);
        if (group.size < 2) {
            return false;
        }
        group.forEach(el => {
            const row = parseInt(el.split(" ")[0]);
            const col = parseInt(el.split(" ")[1]);
            this.field[row][col].empty();
        });
        return true;
    }

    clearOffsets () {
        this.field.forEach(row => row.forEach(f => {
            f.offsetY = 0;
            f.offsetX = 0;
        }))
    }

    computeColumnsFall (fieldHeight) {
        // compute fields falling
        for (let x = 0; x < this.rows; x++) {
            let offset = 0;
            for (let y = this.columns - 1; y >= 0; y--) {
                if (this.isEmpty(x, y)) {
                    offset += 1;
                } else {
                    if (offset < 1) {
                        continue;
                    }
                    const targetField = this.getField(x, y + offset);
                    targetField.transferFrom(this.getField(x, y));
                    targetField.offsetY -= fieldHeight * offset;
                    y += offset;
                    offset = 0;
                }
            }
        }
    }

    columnEmpty (x) {
        for (let i = 0; i < this.columns; i++) {
            if (!this.isEmpty(x, i)) {
                return false;
            }
        }
        return true;
    }

    moveColumnLeft (x, fieldWidth, amount) {
        for (let y = 0; y < this.columns; y++) {
            const field = this.getField(x, y);
            if (!field.isEmpty) {
                const targetField = this.getField(x - amount, y);
                targetField.transferFrom(this.getField(x, y));
                targetField.offsetX += fieldWidth * amount;
            }
        }
    }

    computeRowsMoving (fieldWidth) {
        let offset = 0;
        for (let x = 0; x < this.rows; x++) {
            if (this.columnEmpty(x)) {
                offset += 1;
            } else {
                if (offset < 1) {
                    continue;
                }
                this.moveColumnLeft(x, fieldWidth, offset);
                x -= offset;
                offset = 0;
            }
        }
    }

    /**
     * @returns {boolean}
     */
    isFieldEmpty () {
        for (const row of this.field) {
            for (const field of row) {
                if (!field.isEmpty) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    isGameOver () {
        // field empty?
        if (this.isFieldEmpty()) {
            return true;
        }
        // no possible moves?
        for (let x = 0; x < this.rows; x++) {
            for (let y = 0; y < this.columns; y++) {
                if (this.isEmpty(x, y)) {
                    continue;
                }
                const group = this.getGroupList(x, y);
                if (group.size > 1) {
                    // possible move
                    return false;
                }
            }
        }
        return true;
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     * @param ctx {CanvasRenderingContext2D}
     */
    drawRegularBall (x, y, width, height, ctx) {
        const field = this.getField(x, y);
        const ballPosX = width * x + field.offsetX;
        const ballPosY = height * y + field.offsetY;
        ctx.fillStyle = field.getColor();
        ctx.beginPath();
        ctx.ellipse(
            ballPosX + ( width / 2 ),
            ballPosY + ( height / 2 ),
            width / 2 - MARGIN * 2,
            height / 2 - MARGIN * 2,
            0,
            0,
            Math.PI * 2
        );
        ctx.closePath();
        ctx.fill();
    }


    /**
     *
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     * @param ctx {CanvasRenderingContext2D}
     */
    drawHighlightedBall (x, y, width, height, ctx) {
        const field = this.getField(x, y);
        const ballPosX = width * x + field.offsetX;
        const ballPosY = height * y + field.offsetY;
        const ballRadiusX = width / 2 - MARGIN * 2;
        const ballRadiusY = height / 2 - MARGIN * 2;
        const innerRadiusX = ballRadiusX * INNER_RADIUS_MULTIPLIER;
        const innerRadiusY = ballRadiusY * INNER_RADIUS_MULTIPLIER;
        ctx.fillStyle = calculateRGB(field.getColor(), x => x * 0.8)
        ctx.beginPath();
        ctx.ellipse(
            ballPosX + ( width / 2 ),
            ballPosY + ( height / 2 ),
            ballRadiusX,
            ballRadiusY,
            0,
            0,
            Math.PI * 2
        );
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = calculateRGB(field.getColor(), x => x * 1.3);
        ctx.beginPath();
        ctx.ellipse(
            ballPosX + ( width / 2 ),
            ballPosY + ( height / 2 ),
            innerRadiusX - MARGIN * 2,
            innerRadiusY - MARGIN * 2,
            0,
            0,
            Math.PI * 2
        );
        ctx.closePath();
        ctx.fill();
    }


    /**
     * Renders the field to a canvas
     * @param canvas {HTMLCanvasElement}
     * @param context {CanvasRenderingContext2D}
     */
    renderGame (canvas, context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const ballWidth = ( canvas.width / this.rows );
        const ballHeight = ( canvas.height / this.columns );
        for (let x = 0; x < this.rows; x++) {
            for (let y = 0; y < this.columns; y++) {
                if (this.field[x][y].isEmpty) {
                    continue;
                }
                if (this.field[x][y].bright) {
                    this.drawHighlightedBall(x, y, ballWidth, ballHeight, context);
                } else {
                    this.drawRegularBall(x, y, ballWidth, ballHeight, context);
                }
            }
        }
    }
}