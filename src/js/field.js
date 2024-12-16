import { calculateRGB } from "./calculate_rgb.js";

export class Field {
    /**
     * if the field is empty
     * @type {boolean}
     */
    isEmpty = true;

    /**
     * @type {number}
     */
    offsetX = 0;
    /**
     * @type {number}
     */
    offsetY = 0;

    /**
     * empty if the field is empty
     * @type {string}
     */
    color = "";

    /**
     * The color's id for easy identification
     * @type number
     */
    colorID;

    /**
     * @type {boolean}
     */
    bright = false;

    /**
     * @param color {string}
     * @param id {number}
     */
    setColor (color, id) {
        this.isEmpty = false;
        this.color = color;
        this.colorID = id;
    }

    empty () {
        this.isEmpty = true;
        this.color = "";
        this.colorID = -1;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    /**
     * @param id {number}
     * @returns {boolean}
     */
    colorMatches (id) {
        return this.colorID === id && !this.isEmpty;
    }

    /**
     * @param field {Field}
     */
    transferFrom (field) {
        this.isEmpty = false;
        this.color = field.color;
        this.colorID = field.colorID;
        this.offsetX = field.offsetX;
        this.offsetY = field.offsetY;
        field.empty();
    }

    /**
     * @returns {string}
     */
    getColor () {
        if (!this.bright) {
            return calculateRGB(this.color, x => x * 0.8);
        }
        return this.color;
    }
}