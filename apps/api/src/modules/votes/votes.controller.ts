import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateVoteDto } from "./dto/create-vote.dto";
import { VotesService } from "./votes.service";

@Controller("votes")
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  upvote(@CurrentUser() user: { userId: string }, @Body() dto: CreateVoteDto) {
    return this.votesService.upvote(user.userId, dto.complaintId);
  }
}

