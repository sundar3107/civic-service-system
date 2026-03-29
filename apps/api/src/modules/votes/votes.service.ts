import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class VotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async upvote(userId: string, complaintId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      throw new BadRequestException("Complaint not found.");
    }

    await this.prisma.vote.create({
      data: {
        complaintId,
        userId
      }
    });

    const updated = await this.prisma.complaint.update({
      where: { id: complaintId },
      data: {
        voteCount: {
          increment: 1
        }
      }
    });

    await this.auditService.log({
      userId,
      action: "COMPLAINT_UPVOTED",
      entityType: "Complaint",
      entityId: complaintId
    });

    return updated;
  }
}

