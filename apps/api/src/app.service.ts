import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  health() {
    return {
      status: "ok",
      service: "civic-service-system-api",
      timestamp: new Date().toISOString()
    };
  }
}

