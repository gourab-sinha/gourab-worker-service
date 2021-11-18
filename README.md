# What is this?
This a worker service

# Installation

`npm i gourab-worker-service --save`

 Then...

 ```
 export class AbstractQueueClass {
    bull = Bull;
    redis = Redis;
    queues = {};
    constructor() {
        if (this.constructor === AbstractQueueClass || Object.getPrototypeOf(this.constructor) === AbstractClass) {
            throw new Error('Cannot instantiate Abstract Class!');
        }
    }
    /**
     * 
     * @param {String} queueName 
     * @param {String} jobType 
     * @param {*} options 
     * @param {Number} concurrency 
     * @param {Function} processor 
     */
    async createQueue(queueName, jobType = '', opts = {}, concurrency = 1, processor) {
        if (!this.isQueuePresent(queueName)) {
            const newQueue = this.bull(queueName, opts);
            this.queues[queueName] = newQueue;
        }
        if (jobType != '') {
            this.queues[queueName].process(jobType, concurrency, processor);
        } else {
            this.queues[queue].process(concurrency, processor);
        }
        this.queues[queueName].on('failed', this.handlerFailure);
        this.queues[queueName].on('completed', this.handlerComplete);
        this.queues[queueName].on('stalled', this.handlerStalled);
    }

    /**
     * 
     * @param {*} redisOptions 
     */
    async createRedisConnection(redisOptions);
    /**
     * 
     * @param {*} queueName 
     */
    isQueuePresent(queueName) {
        return this.queues.hasOwnProperty(queueName);
    }

    /**
     * 
     * @returns 
     */
    getAllQueue() {
        return this.queues;
    }
    /**
     * 
     * @param {*} job 
     */
    async handlerComplete(job) {
        console.info(
            `Job in ${job.queue.name} completed for: ${job.data.param}`
        )
        job.remove();
    }

    /**
     * 
     * @param {*} job 
     * @param {*} done 
     */

    async handlerFailure(job, done) {
        if (job.attemptsMade >= job.opts.attempts) {
            console.info(
                `Job failures above threshold in ${job.queue.name} for: ${job.id}`,
                err
            )
            return null;
        }
        console.info(
            `Job in ${job.queue.name} failed for: ${job.id} with ${err.message
            }. ${job.opts.attempts - job.attemptsMade} attempts left`
        );

    }
    /**
     * 
     * @param {*} job 
     */
    async handlerStalled(job) {
        console.info(
            `Job in ${job.queue.name} stalled for: ${job.id}`
        );
    }
};


import { AbstractQueueClass } from "../classes/AbstractQueue";

export class ProducerWorker extends AbstractQueueClass {
    constructor() {
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



import { AbstractQueueClass } from "../classes/AbstractQueue";

export class ConsumerWorker extends AbstractQueueClass {
    constructor() {
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

 ```

 ## Producer and Consumer

 Support Producer and Consumer
