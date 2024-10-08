import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class LoggingService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async logInfo(index: string, message: any) {
    await this.elasticsearchService.index({
      index,
      body: {
        level: 'info',
        timestamp: new Date(),
        message,
      },
    });
  }

  async logError(index: string, error: any) {
    await this.elasticsearchService.index({
      index,
      body: {
        level: 'error',
        timestamp: new Date(),
        error,
      },
    });
  }

  async logWarn(index: string, warning: any) {
    await this.elasticsearchService.index({
      index,
      body: {
        level: 'warn',
        timestamp: new Date(),
        warning,
      },
    });
  }
}
