import { Controller, Get } from "@nestjs/common";
import { IssueCategoriesService } from "./issue-categories.service";

@Controller("issue-categories")
export class IssueCategoriesController {
  constructor(private readonly issueCategoriesService: IssueCategoriesService) {}

  @Get()
  list() {
    return this.issueCategoriesService.list();
  }
}

