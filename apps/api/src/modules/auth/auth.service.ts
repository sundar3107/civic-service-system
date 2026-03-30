import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { randomUUID } from "crypto";
import { Role } from "@civic/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService
  ) {}

  async requestCitizenEmail(email: string) {
    const user = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        role: Role.CITIZEN
      }
    });

    const token = randomUUID();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30)
      }
    });

    await this.auditService.log({
      userId: user.id,
      action: "AUTH_EMAIL_REQUESTED",
      entityType: "User",
      entityId: user.id,
      payload: { email }
    });

    return {
      message: "Verification token generated for development flow.",
      token,
      email
    };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException("Verification token is invalid or expired.");
    }

    const user = await this.prisma.user.update({
      where: { id: record.userId },
      data: {
        emailVerifiedAt: new Date()
      }
    });

    await this.prisma.emailVerificationToken.delete({
      where: { id: record.id }
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: "refresh"
      },
      {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: "7d"
      }
    );

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
      }
    });

    return {
      verified: true,
      email: user.email,
      accessToken,
      refreshToken
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        authority: {
          include: {
            assignments: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException("Account not found. Check the email or reseed the database.");
    }

    if (!user.passwordHash) {
      if (user.role === Role.AUTHORITY) {
        throw new UnauthorizedException("Authority account is not initialized. Rerun the seed command and try again.");
      }

      throw new UnauthorizedException("Complete onboarding before logging in.");
    }

    if (!(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (user.role === Role.AUTHORITY) {
      if (!dto.districtId || !dto.cityId) {
        throw new UnauthorizedException("District and city are required for authority login.");
      }

      const hasAssignment = user.authority?.assignments.some(
        (assignment) => assignment.districtId === dto.districtId && assignment.cityId === dto.cityId
      );

      if (!hasAssignment) {
        throw new UnauthorizedException("This authority account is not assigned to the selected district and city.");
      }
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: "refresh"
      },
      {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: "7d"
      }
    );

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
      }
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        profileCompleted: Boolean(user.profileCompletedAt)
      }
    };
  }
}
