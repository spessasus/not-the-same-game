/**
 * @typedef {object} TransitionType
 * @property {number} initial
 * @property {number} target
 * @property {number} current
 * @property {number} time
 * @property {number} start
 * @property {"sin"|"linear"} type
 * @property {function(number)} callback
 * @property {function(number)} finish
 */

/**
 * A simple transition class that uses Math.sin function.
 */
export class CanvasTransitions {
    constructor() {
        /**
         * @type {Object<string, TransitionType>}
         */
        this.transitions = {};
    }

    /**
     * creates a transition
     * @param transitionId {string} The unique id for the transition. It can be used to overwrite the transition.
     * @param initialValue {number} The initial transition value.
     * @param targetValue {number} The transition target value.
     * @param transitionTime {number} The transition time in milliseconds. Default is 1000.
     * @param applyTransitionValueCallback {function} Execute this function every frame, i.e., when performTransitions() is called.
     * @param onFinish {function} Executed when the transition has finished.
     * @param overWrite {boolean} If set to true, overwrites the transition with the same id. Default is false.
     * @param keepOverWrittenProgress {boolean} If set to true, it will carry over the current progress of the overwritten transition. If overWrite is set to off, it will be ignored. Defaults to false.
     * @param startAfter {number} The number of milliseconds to wait before the transition begins. Default is 0.
     * @param transitionType {string} The type of transition to apply. It Can be sinusoidal or linear.
     */
    createTransition = (transitionId,
                        initialValue,
                        targetValue,
                        transitionTime = 1000,
                        applyTransitionValueCallback = undefined,
                        onFinish = undefined,
                        overWrite = false,
                        keepOverWrittenProgress = true,
                        startAfter = 0,
                        transitionType = "sin") => {
        let currentValue = initialValue;
        if (this.transitions[transitionId]) {
            if (overWrite) {
                if (keepOverWrittenProgress) {
                    currentValue = this.transitions[transitionId].current;
                }
                delete this.transitions[transitionId];
            } else {
                return;
            }
        }
        /**
         * @type {TransitionType}
         */
        let transition = {
            initial: initialValue,
            target: targetValue,
            current: currentValue,
            time: transitionTime,
            start: performance.now() + startAfter,
            type: transitionType
        };
        if (applyTransitionValueCallback) {
            transition.callback = applyTransitionValueCallback;
        }
        if (onFinish) {
            transition.finish = onFinish;
        }
        this.transitions[transitionId] = transition;
    }

    performTransitions = () => {
        for (let transitionKeyValue of Object.entries(this.transitions)) {
            let transition = transitionKeyValue[1];
            if (!transition) {
                continue;
            }
            if (transition.start > performance.now()) {
                continue;
            }
            if ((performance.now() - transition.start) >= transition.time) {
                if (transition.callback) {
                    transition.callback(transition.current);
                }
                if (transition.finish) {
                    transition.finish(transition.current);
                }
                delete this.transitions[transitionKeyValue[0]];
                continue;
            }
            let difference = transition.target - transition.initial;
            let percentage = (performance.now() - transition.start) / transition.time;

            if (transition.type === "sin") {
                let sinOne = Math.PI / 2;
                let sinParameter = (sinOne * (percentage - 0.5) * 2);
                let sinusoid = Math.sin(sinParameter);
                transition.current = ((sinusoid + 1) / 2) * difference + transition.initial;
            } else {
                transition.current = percentage * difference + transition.initial;
            }


            if (transition.callback) {
                transition.callback(transition.current);
            }
        }
    }

    deleteTransition = id => {
        delete this.transitions[id];
    }
}