const { AbstractQueueClass } = require('../classes/AbstractQueue');

/**
 * @class
 * @extends {AbstractQueueClass}
 */
class ConsumerWorker extends AbstractQueueClass {
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
     * @param {*} queueName 
     * @returns 
     */
    async executeProcess(queueName) {
        const job = await this.queues[queueName].getNextJob();
        if (job) {
            let nextJob = await job.moveToFialed({
                message: 'Failed to process'
            }, true);

            if (!nextJob) {
                return { message: 'Failed while processing the job'};
            }
            nextJob = job.moveToCompleted('succeeded', true);
            if (nextJob) {
                return await job.toJSON();
            }
        }
        return null;
    }   
}

module.exports = ConsumerWorker;