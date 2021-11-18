import { AbstractQueueClass } from "../classes/AbstractQueue";

export class ProducerWorker extends AbstractQueueClass {
    constructor(bull) {
        if (Object.getPrototypeOf(this).isInstantiated) {
            throw new Error(`Cannot create more than one instance of ${this.constructor.name}!`);
        }
        /**
         * Set isIstantiated property on service prototype so that the service won't be instantiated again.
         */
        Object.defineProperty(Object.getPrototypeOf(this), 'isInstantiated', {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false
        });
        this.queues = {};
        this.bull = bull;
    }
    
    /**
     * 
     * @param {*} queue 
     * @param {*} data 
     * @param {*} jobType 
     * @param {*} jobOptions 
     */
    async addJobToQueue(queue, data, jobType = '', jobOptions) {
        if (jobType != '') {
            this.queues[queue].add(data, jobOptions);
        } else {
            this.queues[queue].add(jobType, data, jobOptions);
        }
    }
}