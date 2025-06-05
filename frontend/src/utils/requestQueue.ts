type RequestFunction<T> = () => Promise<T>;

class RequestQueue {
  private queue: Array<() => void> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minRequestInterval: number;

  constructor(minRequestInterval = 300) { // 300ms default minimum interval between requests
    this.minRequestInterval = minRequestInterval;
  }

  async enqueue<T>(request: RequestFunction<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const processRequest = async () => {
        try {
          // Ensure minimum time between requests
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          
          if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => 
              setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
          }

          this.lastRequestTime = Date.now();
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.processNext();
        }
      };

      this.queue.push(processRequest);
      
      if (!this.isProcessing) {
        this.processNext();
      }
    });
  }

  private processNext() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const nextRequest = this.queue.shift();
    if (nextRequest) {
      nextRequest();
    } else {
      this.isProcessing = false;
      this.processNext();
    }
  }
}

// Create a single instance for the entire app
export const requestQueue = new RequestQueue(300); // 300ms between requests
