import { BadRequestException, Injectable } from "@nestjs/common";
import { ComplaintStatus } from "@civic/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: dto.complaintId },
      include: {
        reviews: true
      }
    });

    if (!complaint || complaint.status !== ComplaintStatus.COMPLETED) {
      throw new BadRequestException("Reviews are allowed only after complaint completion.");
    }

    const alreadyReviewed = complaint.reviews.some((review) => review.userId === userId);
    if (alreadyReviewed) {
      throw new BadRequestException("You have already reviewed this completed complaint.");
    }

    const review = await this.prisma.review.create({
      data: {
        complaintId: dto.complaintId,
        userId,
        rating: dto.rating,
        body: dto.body
      }
    });

    await this.auditService.log({
      userId,
      action: "COMPLAINT_REVIEWED",
      entityType: "Complaint",
      entityId: dto.complaintId,
      payload: { rating: dto.rating }
    });

    return review;
  }
}
